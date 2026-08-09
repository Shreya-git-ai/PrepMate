import os
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from RAG.retriever import search, format_with_citations

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

print("KEY FOUND:", os.getenv("GROQ_API_KEY") is not None)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are PrepMate, a study assistant. Answer the user's question 
using ONLY the provided context from their study material. 
If the context doesn't contain the answer, say so clearly instead of guessing.
Always cite the source (filename + page) for any claim you make."""


def generate_answer(question, n_results=3):
    results = search(question, n_results=n_results)
    context = format_with_citations(results)

    user_message = f"""Context from study material:

{context}

Question: {question}

Answer using only the context above, and cite sources."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=500,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    question = input("Ask PrepMate: ")
    answer = generate_answer(question)
    print("\n--- Answer ---\n")
    print(answer)