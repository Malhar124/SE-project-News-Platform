import sys
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# --- Path Setup ---
current_dir = os.path.dirname(__file__)
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.append(parent_dir)

# --- Load Environment Variables ---
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
dotenv_path = os.path.join(project_root, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)

# --- Import Auth Decorator ---
from shared.auth.token_verifier import require_auth

# --- Import ChromaDB Client ---
try:
    from shared.database.chromadb_client import article_collection
except ImportError as e:
    print(f"FATAL: Could not import ChromaDB client. Error: {e}")
    article_collection = None
except Exception as e:
    print(f"FATAL: Error initializing ChromaDB client. Error: {e}")
    article_collection = None

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Health Check Endpoint (Public) ---
@app.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint."""
    if article_collection:
        return jsonify({"status": "ok", "message": "ChromaDB connection ok"}), 200
    else:
        return jsonify({"status": "error", "message": "ChromaDB connection failed"}), 503

# --- API Endpoint Definition (Protected) ---
@app.route('/query', methods=['POST'])
@require_auth  # <-- THIS IS THE NEW AUTHENTICATION CHECK
def query_chromadb_route(): # Renamed function to avoid conflict
    """
    Receives a query embedding and optional category filter,
    queries ChromaDB, and returns the matching document IDs.
    This endpoint is protected and requires a valid Firebase ID token.
    """
    if not article_collection:
        return jsonify({"error": "ChromaDB connection not available"}), 503

    # 1. Get data from the request
    data = request.get_json()
    if not data or 'query_embedding' not in data:
        return jsonify({"error": "Missing 'query_embedding' in request body"}), 400

    query_embedding = data['query_embedding']
    category_filter = data.get('category')
    num_results = data.get('n_results', 10)

    # 2. Prepare ChromaDB query arguments
    query_args = {
        "query_embeddings": [query_embedding],
        "n_results": num_results
    }
    if category_filter:
        query_args["where"] = {"category": category_filter}
        print(f"Authenticated query with category filter: '{category_filter}'")
    else:
        print("Authenticated query without category filter.")

    # 3. Query ChromaDB
    try:
        results = article_collection.query(**query_args)
        result_ids = []
        if results and results.get('ids') and results['ids'][0]:
             result_ids = results['ids'][0]
        print(f"ChromaDB returned {len(result_ids)} results.")
        return jsonify({"ids": result_ids}), 200
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return jsonify({"error": "Failed to query ChromaDB"}), 500

# --- Run Flask App ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(debug=True, host='0.0.0.0', port=port)