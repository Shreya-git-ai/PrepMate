import json
import re
import os

from dotenv import load_dotenv
from groq import Groq

from RAG.retriever import search, format_with_citations


load_dotenv()

client = Groq(
    api_key=os.environ["GROQ_API_KEY"]
)

MODEL = "llama-3.3-70b-versatile"


QUIZ_SYSTEM_PROMPT = """
You are PrepMate's quiz generator.

You create multiple-choice questions STRICTLY from the provided
study material context.

Never introduce facts, numbers, or claims that aren't in the
given context.

If the context is not enough, generate fewer questions rather
than inventing information.
"""


def generate_quiz(topic, num_questions=5, n_context_chunks=6):

    # Topic ko semantic search query ki tarah use kar rahe hain
    results = search(
        topic,
        n_results=n_context_chunks
    )

    # Check karo ki kuch study material mila bhi hai ya nahi
    if not results["documents"][0]:

        raise ValueError(
            f"No study material found for topic '{topic}'. "
            f"Check the topic name against your taxonomy."
        )

    # Retrieved chunks ko readable context mein convert karo
    context = format_with_citations(results)

    prompt = f"""
Study material context (topic: "{topic}"):

{context}

Generate {num_questions} multiple-choice questions testing
understanding of "{topic}" based ONLY on the context above.

Rules:

- Each question has exactly 4 options
- Only one option should be correct
- Wrong options should be plausible
- "correct_answer" must be copied EXACTLY from the options list
- "explanation" should briefly explain why the answer is correct
- "source" should contain the citation from the context
- Return ONLY a JSON array
- No markdown fences
- No extra text

Schema for each question:

{{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correct_answer": "...",
    "explanation": "...",
    "source": "..."
}}
"""

    # Groq call
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": QUIZ_SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.4
    )

    # LLM response se JSON questions nikaalo
    questions = _parse_json_array(
        response.choices[0].message.content
    )

    # Invalid questions ko remove karo
    return _validate_questions(questions)


def _validate_questions(questions):

    valid = []

    for q in questions:

        # Required fields present hain?
        if not all(
            key in q
            for key in (
                "question",
                "options",
                "correct_answer"
            )
        ):
            continue

        # Exactly 4 options honi chahiye
        if not isinstance(q["options"], list):
            continue

        if len(q["options"]) != 4:
            continue

        # Correct answer options mein actually present hai?
        if q["correct_answer"] not in q["options"]:
            continue

        valid.append(q)

    return valid


def _parse_json_array(raw):

    # Markdown fences remove karo
    cleaned = re.sub(
        r"^```json|```$",
        "",
        raw.strip(),
        flags=re.MULTILINE
    ).strip()

    # Pehle direct JSON parse try karo
    try:
        return json.loads(cleaned)

    except json.JSONDecodeError:
        pass

    # Agar extra text hai toh individual [...] blocks find karo
    matches = re.findall(
        r"\[[^\[\]]*\]",
        cleaned,
        re.DOTALL
    )

    # Last block ko pehle try karo
    for match in reversed(matches):

        try:
            parsed = json.loads(match)

            if isinstance(parsed, list):
                return parsed

        except json.JSONDecodeError:
            continue

    raise ValueError(
        f"Could not parse quiz JSON from LLM output: {raw[:200]}"
    )


if __name__ == "__main__":

    topic = input(
        "Generate quiz for topic: "
    )

    quiz = generate_quiz(
        topic,
        num_questions=3
    )

    for i, q in enumerate(quiz, 1):

        print(
            f"\nQ{i}. {q['question']}"
        )

        for option in q["options"]:

            marker = "✓" if (
                option == q["correct_answer"]
            ) else " "

            print(
                f"  [{marker}] {option}"
            )

        print(
            f"  Explanation: {q['explanation']}"
        )

        print(
            f"  Source: {q.get('source', 'N/A')}"
        )