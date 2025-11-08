import chromadb
import os

# --- INITIALIZATION ---
# This creates a persistent client that saves its database to a folder 
# named 'chroma_db' in your project's root directory.
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'chroma_db'))
client = chromadb.PersistentClient(path=db_path)

# --- GET OR CREATE THE COLLECTION ---
try:
    # This is like a "table" in a SQL database. It holds our article vectors.
    article_collection = client.get_or_create_collection(name="news_articles")
    print(f"ChromaDB client initialized. Collection 'news_articles' is ready at {db_path}")
except Exception as e:
    print(f"FATAL: Could not initialize ChromaDB client. Error: {e}")
    article_collection = None

# --- CORE FUNCTIONALITY ---
def save_embedding_to_chroma(document_id: str, embedding_vector: list[float], metadata: dict):
    """
    Saves a single document embedding and its metadata to the ChromaDB collection.

    Args:
        document_id (str): The unique ID for the article (the same as the Firestore ID).
        embedding_vector (list[float]): The vector embedding of the article's content.
        metadata (dict): A dictionary of filterable data (e.g., category).
    """
    if not article_collection:
        print("  -> ERROR: ChromaDB collection is not available. Skipping save.")
        return

    try:
        # Add the embedding, metadata, and ID to the collection.
        article_collection.add(
            embeddings=[embedding_vector],
            metadatas=[metadata],
            ids=[document_id]
        )
        print(f"  -> Saved embedding for doc '{document_id}' to ChromaDB.")
    except chromadb.errors.IDAlreadyExistsError:
        print(f"  -> Embedding for doc '{document_id}' already exists in ChromaDB. Skipping.")
    except Exception as e:
        print(f"  -> FAILED to save embedding to ChromaDB. Error: {e}")