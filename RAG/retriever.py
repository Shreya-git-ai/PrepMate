import chromadb
from chromadb.utils import embedding_functions

DB_path="./vectorstore"

def get_collections():
    client=chromadb.PersistentClient(path=DB_path)
    embed_fn=embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    return client.get_or_create_collection(name="prepmate",embedding_function=embed_fn)

def search(query,n_results=3,source_filter=None):
    collection=get_collections()
    where={"source": source_filter} if source_filter else None
    result=collection.query( query_texts=[query],n_results=n_results,where=where)
    return result
def format_with_citations(results):
    """Format retrieved chunks with source citations for prompt context."""
    formatted = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        citation = f"[Source: {meta['source']}, page {meta['page']}]"
        formatted.append(f"{doc}\n{citation}")
    return "\n\n---\n\n".join(formatted)

if __name__ == "__main__":
    query=input("Ask question from your notes:")
    res=search(query)

    context = format_with_citations(res)

    print("\n===== CONTEXT =====")
    print(context)

