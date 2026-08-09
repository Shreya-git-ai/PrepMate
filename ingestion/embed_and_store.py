import chromadb
from chromadb.utils import embedding_functions
from ingestion.chunker import chunk_folder

Data_folder="data/raw"

def vector_store():
    #importing chunks to embed and vector sore
    chunks=chunk_folder(Data_folder)
    print("total chunks are",len(chunks))
    if not chunks:
        print("pdf not found")
    #chroma setup
    client=chromadb.PersistentClient(path="./vectorstore")
    embed_fn=embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-V2")
    collections=client.get_or_create_collection(name="prepmate",embedding_function="embed_fn")
    ids=[]
    documents=[]
    metadatas=[]
    for c in chunks:
        ids.append(f"{c["source"]}_p{c["page"]}")
        documents.append(c["text"])
        metadatas.append( {"source": c["source"], "page": c["page"]})
    collections.add( ids=ids,documents=documents,metadatas=metadatas)
    # results=collections.query(query_texts=[],n_results=2)  ---not for now
    print(f"Stored {len(ids)} chunks in collection 'PrepMate'.")
if __name__ == "__main__":
    build_vectorstore()