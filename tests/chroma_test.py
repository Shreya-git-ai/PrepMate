import chromadb

chroma_client = chromadb.Client()

collection = chroma_client.create_collection(name="PrepMate")

collection.add(
    ids=["doc1", "doc2"],
    documents=[
        "Python is a programming language",
        "ChromaDB is a vector database"
    ]
)

results = collection.query(
    query_texts=["What is used to build software APIs?"],
    n_results=2
)

print(results)