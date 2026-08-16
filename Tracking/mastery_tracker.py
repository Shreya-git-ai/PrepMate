import sqlite3
from pathlib import Path
from datetime import datetime, timezone


DB_PATH = Path(__file__).resolve().parent / "mastery.db"


def get_connection():
    # database se connection kholo
    conn = sqlite3.connect(DB_PATH)

    # result ko column names se access karne do
    conn.row_factory = sqlite3.Row

    return conn


def init_db():

    """
    Database se connect karo.

    Agar quiz_attempts table exist nahi karti:
        table create karo

    Changes save karo.
    Connection close karo.
    """

    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT NOT NULL,
            question TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def record_quiz_result(
    topic: str,
    question: str,
    is_correct: bool
):
    """
    Database se connect karo.

    Ek new row INSERT karo:
        topic
        question
        correct/incorrect
        current timestamp

    Changes save karo.
    Connection close karo.
    """

    conn = get_connection()

    conn.execute("""
        INSERT INTO quiz_attempts
        (topic, question, is_correct, timestamp)
        VALUES (?, ?, ?, ?)
    """, (
        topic,
        question,
        int(is_correct),
        datetime.now(timezone.utc).isoformat()
    ))

    conn.commit()
    conn.close()


def record_quiz_session(
    topic: str,
    results: list[dict]
):
    """
    Har result ke liye:
    record_quiz_result() call karo.
    """

    for result in results:
        record_quiz_result(
            topic,
            result["question"],
            result["is_correct"]
        )


def get_topic_mastery(topic: str):

    conn = get_connection()

    row = conn.execute("""
        SELECT
            COUNT(*) AS total,
            SUM(is_correct) AS correct
        FROM quiz_attempts
        WHERE topic = ?
    """, (topic,)).fetchone()

    conn.close()

    total = row["total"] or 0
    correct = row["correct"] or 0

    score = correct / total if total > 0 else 0.0

    return {
        "topic": topic,
        "total_attempts": total,
        "correct": correct,
        "mastery_score": round(score, 3)
    }


def get_all_mastery():

    conn = get_connection()

    rows = conn.execute(
        "SELECT DISTINCT topic FROM quiz_attempts"
    ).fetchall()

    conn.close()

    mastery_list = []

    for row in rows:
        mastery_list.append(
            get_topic_mastery(row["topic"])
        )

    mastery_list.sort(
        key=lambda item: item["mastery_score"]
    )

    return mastery_list


def get_weak_topics(
    threshold: float = 0.6,
    min_attempts: int = 2
) -> list[str]:

    """
    Return topics whose mastery is below the threshold
    and which have enough attempts to be meaningful.
    """

    mastery_list = get_all_mastery()

    weak_topics = []

    for mastery in mastery_list:

        if (
            mastery["mastery_score"] < threshold
            and mastery["total_attempts"] >= min_attempts
        ):
            weak_topics.append(
                mastery["topic"]
            )

    return weak_topics


init_db()


if __name__ == "__main__":

    # Quick manual test

    record_quiz_session("Binary Search Tree", [
        {
            "question": "What is a BST?",
            "is_correct": True
        },
        {
            "question": "What is in-order traversal?",
            "is_correct": False
        }
    ])

    record_quiz_session("Dynamic Programming", [
        {
            "question": "What is memoization?",
            "is_correct": False
        },
        {
            "question": "What are overlapping subproblems?",
            "is_correct": False
        }
    ])

    print("\n--- All mastery scores ---")

    for m in get_all_mastery():
        print(m)

    print("\n--- Weak topics (below 60%, min 2 attempts) ---")

    print(get_weak_topics())