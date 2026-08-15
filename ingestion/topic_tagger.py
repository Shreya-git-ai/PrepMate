import json
import re
import os

from dotenv import load_dotenv
from groq import Groq
from sentence_transformers import SentenceTransformer, util


load_dotenv()

client = Groq(api_key=os.environ["GROQ_API_KEY"])

MODEL = "llama-3.3-70b-versatile"


# Same embedding model used for RAG embeddings
_embed_model = SentenceTransformer("all-MiniLM-L6-V2")


def build_topic_taxonomy(chunks, max_topics=15):

    # Sirf first 20 chunks ko taxonomy banane ke liye use karenge
    sample = chunks[:20]

    sample_text = "\n\n---\n\n".join(sample)

    # Chhote documents ke liye unnecessary topics nahi banayenge
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

    # ONE Groq call for the whole document
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

    # Groq response se topics nikalna
    topics = _parse_json_array(
        response.choices[0].message.content
    )

    if not topics:
        raise ValueError(
            "Taxonomy build returned no topics."
        )

    return topics


def tag_chunks_batch(chunks, similarity_threshold=0.35, top_k=2):

    # PASS 1:
    # LLM se fixed topic list banao
    taxonomy = build_topic_taxonomy(chunks)

    print(
        f"[topic_tagger] taxonomy "
        f"({len(taxonomy)} topics): {taxonomy}"
    )

    # PASS 2:
    # Topics ke embeddings sirf ek baar generate karo
    topic_embeddings = _embed_model.encode(
        taxonomy,
        convert_to_tensor=True
    )

    # Saare chunks ke embeddings ek saath generate karo
    chunk_embeddings = _embed_model.encode(
        chunks,
        convert_to_tensor=True,
        show_progress_bar=True
    )

    # Har chunk aur har topic ke beech cosine similarity
    sims = util.cos_sim(
        chunk_embeddings,
        topic_embeddings
    )

    tagged = []

    for i, chunk in enumerate(chunks):

        # Current chunk ki similarity row
        row = sims[i]

        # Highest similarity wale top_k topics
        top_idx = row.argsort(
            descending=True
        )[:top_k]

        # Threshold se upar wale topics hi rakho
        tags = [
            taxonomy[j]
            for j in top_idx
            if row[j] >= similarity_threshold
        ]

        # Agar koi topic sufficiently similar nahi hai
        if not tags:
            tags = ["Uncategorized"]

        tagged.append({
            "text": chunk,
            "topics": tags
        })

        print(
            f"[topic_tagger] chunk "
            f"{i + 1}/{len(chunks)} -> {tags}"
        )

    return tagged


def topics_to_metadata_string(topics):

    # ChromaDB list ko metadata mein directly store nahi karega
    # Isliye list ko string bana rahe hain
    return ",".join(topics)


def _parse_json_array(raw):

    # Agar LLM ne ```json ... ``` diya ho toh fences hatao
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

    # Agar extra text hai toh [...] blocks find karo
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
        f"Could not parse topic list from LLM output: {raw[:200]}"
    )


if __name__ == "__main__":

    # Standalone test
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