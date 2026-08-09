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

if __name__ == "__main__":
    query=input("Ask question from your notes:")
    res=search(query)

    for doc,meta,dist in zip(res["documents"][0],res["metadatas"][0],res["distances"][0]):
        print(f"\n--- source: {meta['source']} | page: {meta['page']} | distance: {dist:.3f} ---")
        print(doc[:300])