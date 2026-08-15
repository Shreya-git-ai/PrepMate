import json
import re
import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()

client = Groq(api_key=os.environ["GROQ_API_KEY"])

MODEL = "llama-3.3-70b-versatile"


def build_topic_taxonomy(chunks, max_topics=15):

    # Sirf first 20 chunks ko taxonomy banane ke liye use karenge
    sample = chunks[:20]

    sample_text = "\n\n---\n\n".join(sample)

    # Chhote documents mein unnecessary bahut saare topics na ban jayein
    effective_max = min(
        max_topics,
        max(3, len(sample) * 2)
    )

    prompt = f"""
You are analyzing a study document to build a topic taxonomy.

Identify at most {effective_max} distinct topics/subtopics covered below —
use FEWER if the content doesn't naturally support that many.

Rules:
- Topic names must be short (2-5 words), specific, and non-overlapping
- Do NOT split one concept into multiple topics. Example of what NOT to do:
  "Binary Search Tree", "Node Data Structure", "Tree Nodes" are all the
  same concept — pick ONE name and use it once.
- Only create a separate topic if it's genuinely a distinct concept a
  student would want a separate mastery score for
- Order topics roughly in the order they appear in the document
- Return ONLY a JSON array of strings, nothing else, no markdown fences

Document excerpts:

{sample_text}
"""

    # LLM call
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    # LLM response se topics nikalna
    topics = _parse_json_array(
        response.choices[0].message.content
    )

    if not topics:
        raise ValueError(
            "Taxonomy build returned no topics."
        )

    return topics


def tag_chunk(chunk_text, taxonomy):

    # Fixed taxonomy ko prompt-friendly format mein convert karna
    topic_list_str = "\n".join(
        f"- {t}" for t in taxonomy
    )

    prompt = f"""
Fixed topic list (choose ONLY from these, do not invent new ones):

{topic_list_str}

Which topic(s) does the text chunk below belong to? Pick 1-2 MAX.

If genuinely nothing fits, return ["Uncategorized"].

Return ONLY a JSON array of strings, nothing else, no markdown fences.

Text chunk:

\"\"\"
{chunk_text}
\"\"\"
"""

    # Classification ke liye temperature 0
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    # LLM response se topics nikalna
    tags = _parse_json_array(
        response.choices[0].message.content
    )

    # Sirf taxonomy ke andar wale topics accept karo
    valid_tags = [
        tag for tag in tags
        if tag in taxonomy
    ]

    return valid_tags or ["Uncategorized"]


def tag_chunks_batch(chunks):

    # PASS 1:
    # Poore document ke liye fixed taxonomy banao
    taxonomy = build_topic_taxonomy(chunks)

    print(
        f"[topic_tagger] taxonomy "
        f"({len(taxonomy)} topics): {taxonomy}"
    )

    tagged = []
    failed_count = 0

    # PASS 2:
    # Har chunk ko fixed taxonomy ke against classify karo
    for i, chunk in enumerate(chunks):

        try:
            topics = tag_chunk(chunk, taxonomy)

        except Exception as e:

            # Ek chunk fail hone par poora ingestion stop nahi hoga
            failed_count += 1
            topics = ["Uncategorized"]

            print(
                f"[topic_tagger] chunk "
                f"{i + 1}/{len(chunks)} FAILED ({e}) "
                f"-> defaulting to Uncategorized"
            )

        else:

            print(
                f"[topic_tagger] chunk "
                f"{i + 1}/{len(chunks)} -> {topics}"
            )

        tagged.append({
            "text": chunk,
            "topics": topics
        })

    if failed_count:
        print(
            f"[topic_tagger] done with "
            f"{failed_count}/{len(chunks)} chunks "
            f"falling back to Uncategorized"
        )

    return tagged


def topics_to_metadata_string(topics):

    return ",".join(topics)


def _parse_json_array(raw):

    # Markdown code fences remove karo
    cleaned = re.sub(
        r"^```json|```$",
        "",
        raw.strip(),
        flags=re.MULTILINE
    ).strip()

    # Pehle directly JSON parse karne ki koshish
    try:
        return json.loads(cleaned)

    except json.JSONDecodeError:
        pass

    # Agar LLM ne extra text add kiya hai,
    # toh individual [...] blocks find karo
    matches = re.findall(
        r"\[[^\[\]]*\]",
        cleaned,
        re.DOTALL
    )

    # Last bracket block ko pehle try karo
    for match in reversed(matches):

        try:
            parsed = json.loads(match)

            if isinstance(parsed, list):
                return parsed

        except json.JSONDecodeError:
            continue

    raise ValueError(
        f"Could not parse topic list from LLM output: {raw[:200]}"
    )


if __name__ == "__main__":

    # Standalone testing ke liye sample chunks
    sample_chunks = [
        "A binary search tree is a node-based data structure where each node has at most two children...",

        "In-order traversal of a BST visits nodes in ascending sorted order, achieved by recursing left, visiting node, then recursing right...",

        "Dynamic programming solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation..."
    ]

    result = tag_chunks_batch(sample_chunks)

    for r in result:
        print(
            r["topics"],
            "->",
            r["text"][:60]
        )