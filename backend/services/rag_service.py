import chromadb

# Initialize ChromaDB locally
chroma_client = chromadb.Client()
collection_name = "environmental_statutes"

try:
    collection = chroma_client.get_or_create_collection(name=collection_name)
except Exception:
    collection = chroma_client.create_collection(name=collection_name)

def seed_legal_database():
    """Seeds ChromaDB with baseline environmental regulations if empty."""
    if collection.count() == 0:
        documents = [
            "Clean Air Act Section 112: Prohibits the unauthorized venting of Sulfur Dioxide (SO2) exceeding 75 ppb over a 1-hour period. Facilities must use scrubbers.",
            "National Forest Management Act: Clear-cutting of protected canopy in designated conservation zones is strictly prohibited without federal variance.",
            "EPA Particulate Matter Standard: PM2.5 (Aerosol Optical Depth equivalents) must not exceed 35 micrograms per cubic meter in a 24-hour period.",
            "Corporate Accountability Directive: Corporations found guilty of synchronized multi-sensor environmental anomalies (e.g., simultaneous heat and gas spikes) face immediate injunctions."
        ]
        ids = [f"law_{i}" for i in range(len(documents))]
        collection.add(documents=documents, ids=ids)

def get_relevant_statutes(query_text: str, n_results: int = 2) -> str:
    """Retrieves relevant laws from ChromaDB."""
    seed_legal_database()
    
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    
    if results and results['documents']:
        # Flatten the retrieved documents into a single context string
        docs = results['documents'][0]
        return " | ".join(docs)
    return "No specific statutes retrieved."