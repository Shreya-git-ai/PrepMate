import chromadb
from chromadb.utils import embedding_functions
from ingestion.chunker import chunk_folder, chunk_pdf
from ingestion.topic_tagger import tag_chunks_batch, topics_to_metadata_string   # NEW

Data_folder = "data/raw"

def vector_store():
    chunks = chunk_folder(Data_folder)
    print("total chunks are", len(chunks))
    if not chunks:
        print("pdf not found")

    # --- NEW: tag chunks with topics before building metadata ---
    texts = [c["text"] for c in chunks]
    tagged = tag_chunks_batch(texts)
    for c, t in zip(chunks, tagged):
        c["topic"] = topics_to_metadata_string(t["topics"])
    # --------------------------------------------------------------

    client = chromadb.PersistentClient(path="./vectorstore")
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-V2")
    collections = client.get_or_create_collection(name="prepmate", embedding_function=embed_fn)
    ids = []
    documents = []
    metadatas = []
    for c in chunks:
        ids.append(f"{c['source']}_p{c['page']}")
        documents.append(c["text"])
        metadatas.append({"source": c["source"], "page": c["page"], "topic": c["topic"]})
    collections.add(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Stored {len(ids)} chunks in collection 'PrepMate'.")

def process_single_file(file_path):
    """
    vector_store() poore data/raw folder ko process karta hai — batch script hai.
    Yeh function ek single uploaded file ke liye same logic karta hai,
    api/routers/ingestion.py isko call karega har upload pe.
    """
    chunks = chunk_pdf(file_path)
    if not chunks:
        raise ValueError(f"No extractable text found in {file_path}")

    texts = [c["text"] for c in chunks]
    tagged = tag_chunks_batch(texts)
    for c, t in zip(chunks, tagged):
        c["topic"] = topics_to_metadata_string(t["topics"])

    client = chromadb.PersistentClient(path="./vectorstore")
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-V2")
    collection = client.get_or_create_collection(name="prepmate", embedding_function=embed_fn)

    ids, documents, metadatas = [], [], []
    for c in chunks:
        ids.append(f"{c['source']}_p{c['page']}")
        documents.append(c["text"])
        metadatas.append({"source": c["source"], "page": c["page"], "topic": c["topic"]})

    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    return len(ids)


if __name__ == "__main__":
    vector_store()