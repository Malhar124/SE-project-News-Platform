import os
from sentence_transformers import SentenceTransformer
import torch # Import torch to check for CUDA availability

# --- Model Configuration ---
# Use the specific Hugging Face identifier for Nomic Embed Text v1.5
# See: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"
TASK_TYPE_DOCUMENT = "search_document"
TASK_TYPE_QUERY = "search_query"

# --- Model Loading ---
# Determine device (use GPU if available, otherwise CPU)
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Loading SentenceTransformer model '{MODEL_NAME}' onto device: {device}")

# Load the model. This might take a moment the first time it downloads.
# Set trust_remote_code=True as required by this specific model.
try:
    # It's generally better to load the model once when the service starts
    model = SentenceTransformer(MODEL_NAME, trust_remote_code=True, device=device)
    print(f"Model '{MODEL_NAME}' loaded successfully.")
    # Nomic expects inputs to be prefixed based on task type for best results
    # See model card: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
    prefix_map = {
        TASK_TYPE_DOCUMENT: "search_document: ",
        TASK_TYPE_QUERY: "search_query: "
    }

except Exception as e:
    print(f"CRITICAL: Failed to load SentenceTransformer model '{MODEL_NAME}'. Error: {e}")
    model = None # Mark model as unavailable


def create_hf_embedding(text_to_embed: str, task_type: str = TASK_TYPE_DOCUMENT) -> list[float] | None:
    """
    Creates a vector embedding for the given text using a locally loaded
    SentenceTransformer model (Nomic Embed Text).

    Args:
        text_to_embed (str): The text content to be embedded.
        task_type (str): Either 'search_document' for articles or 'search_query' for user queries.

    Returns:
        list[float] | None: A list of floats representing the vector embedding, or None on error.
    """
    if not model:
        print("  -> ERROR: Embedding model is not loaded. Cannot create embedding.")
        return None
    if not text_to_embed:
        print("  -> Skipping embedding: Input text is empty.")
        return None

    # Apply the task-specific prefix recommended by Nomic
    prefix = prefix_map.get(task_type, "") # Default to no prefix if task type is unknown
    text_with_prefix = prefix + text_to_embed

    try:
        # Generate the embedding. This runs inference locally.
        # The model handles batching if you pass multiple texts, but we do one at a time here.
        embeddings = model.encode([text_with_prefix], convert_to_numpy=False, convert_to_tensor=False)

        if embeddings and len(embeddings) > 0 and isinstance(embeddings[0], list):
             print(f"  -> HF embedding created successfully (Task: {task_type}). Dim: {len(embeddings[0])}")
             return embeddings[0] # Return the embedding vector (list of floats)
        else:
             print(f"  -> FAILED HF embedding: Unexpected output format from model.encode: {type(embeddings)}")
             return None

    except Exception as e:
        print(f"  -> FAILED HF embedding inference. Error: {e}")
        return None