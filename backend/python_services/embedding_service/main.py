import sys
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# --- Path Setup ---
current_dir = os.path.dirname(__file__)
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# --- Load Environment Variables ---
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
dotenv_path = os.path.join(project_root, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)

# --- Import Auth Decorator ---
# This import MUST happen after path setup
from shared.auth.token_verifier import require_auth

# --- Import Hugging Face Embedding Function ---
try:
    from shared.llm.embedding_client import create_hf_embedding, TASK_TYPE_QUERY
except ImportError as e:
    print(f"FATAL: Could not import or initialize embedding client. Service cannot run. Error: {e}")
    create_hf_embedding = None
except Exception as e:
    print(f"FATAL: Unexpected error during embedding client setup. Error: {e}")
    create_hf_embedding = None

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Health Check Endpoint (Public) ---
@app.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint."""
    if create_hf_embedding:
        return jsonify({"status": "ok", "message": "Embedding model loaded"}), 200
    else:
        return jsonify({"status": "error", "message": "Embedding model failed to load"}), 503

# --- API Endpoint Definition (Protected) ---
@app.route('/embed', methods=['POST'])
@require_auth  # <-- THIS IS THE NEW AUTHENTICATION CHECK
def get_hf_embedding():
    """
    Receives text via POST request and returns its Nomic embedding vector
    generated using the locally loaded Hugging Face model (task type: query).
    This endpoint is protected and requires a valid Firebase ID token.
    """
    if not create_hf_embedding:
        print("ERROR: /embed called but embedding model is not available.")
        return jsonify({"error": "Embedding service is unavailable"}), 503

    # 1. Get and Validate Input
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Missing 'text' field in JSON body"}), 400
    
    text_to_embed = data['text']
    if not isinstance(text_to_embed, str) or not text_to_embed.strip():
        return jsonify({"error": "'text' field must be a non-empty string"}), 400

    print(f"Embedding Service: Received authenticated request to embed query: '{text_to_embed[:60]}...'")

    # 2. Generate Embedding
    embedding_vector = create_hf_embedding(
        text_to_embed=text_to_embed,
        task_type=TASK_TYPE_QUERY
    )

    # 3. Return Result or Error
    if embedding_vector:
        print("  -> Embedding generated successfully.")
        return jsonify({"embedding": embedding_vector}), 200
    else:
        print("  -> Embedding generation failed.")
        return jsonify({"error": "Failed to generate embedding for the provided text"}), 500

# --- Run Flask App ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=True, host='0.0.0.0', port=port)