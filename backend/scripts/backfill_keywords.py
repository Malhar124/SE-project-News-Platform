import sys
import os
import re
import string
from dotenv import load_dotenv

# --- Path Setup ---
current_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(current_dir, '..'))
python_services_dir = os.path.join(project_root, 'python_services')
sys.path.append(python_services_dir)

# --- Load Environment Variables ---
env_path = os.path.join(project_root, '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
    print("Environment variables loaded successfully for backfill.")
else:
    print("WARNING: .env file not found at project root.")

# --- Import Firestore Client ---
try:
    from shared.database.firestore_client import db
except ImportError as e:
    print(f"FATAL: Could not import shared modules. Error: {e}")
    sys.exit(1)

# A simple list of common "stop words" to ignore in keywords
STOP_WORDS = set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'
])

def _generate_keywords(title: str, description: str) -> list[str]:
    """
    Generates a list of unique, lowercase keywords from a title and description
    for Firestore 'array-contains-any' search.
    """
    if not title: title = ""
    if not description: description = ""
    full_text = title + " " + description
    full_text = full_text.lower().translate(str.maketrans('', '', string.punctuation))
    words = re.split(r'\s+', full_text)
    keywords = list(set(word for word in words if word and word not in STOP_WORDS and len(word) > 2))
    return keywords

def backfill_keywords():
    """
    Reads existing articles from Firestore, generates a 'keywords' array
    for those that don't have one, and updates them.
    """
    print("\n" + "=" * 45)
    print("  STARTING KEYWORD BACKFILL PROCESS")
    print("=" * 45)

    processed_count = 0
    skipped_count = 0

    try:
        # Use a write batch for efficient updates
        batch = db.batch()
        
        print("Fetching articles missing the 'keywords' field from Firestore...")
        # Query for articles where the 'keywords' field does NOT exist
        articles_snapshot = db.collection('articles').where('keywords', '==', None).stream()

        for doc in articles_snapshot:
            article_data = doc.to_dict()
            doc_id = doc.id

            print(f"\nProcessing article ID: {doc_id} (Title: {article_data.get('title', 'N/A')[:50]}...)")

            title = article_data.get('title')
            desc = article_data.get('description') or article_data.get('content')
            
            if title or desc:
                # 1. Generate Keywords
                keywords = _generate_keywords(title, desc)
                
                # 2. Add to batch for update
                doc_ref = db.collection('articles').document(doc_id)
                batch.update(doc_ref, {'keywords': keywords})
                processed_count += 1
                
                print(f"  -> Generated {len(keywords)} keywords. Added to batch.")
                
                # Commit the batch every 100 articles to avoid memory issues
                if processed_count % 100 == 0:
                    print(f"--- Committing batch of {processed_count} articles ---")
                    batch.commit()
                    batch = db.batch() # Start a new batch
            
            else:
                print("  -> Skipping: No 'title' or 'description' to generate keywords from.")
                skipped_count += 1

        # Commit any remaining articles in the last batch
        if processed_count % 100 != 0:
            print(f"--- Committing final batch of articles ---")
            batch.commit()

    except Exception as e:
        print(f"\n--- AN ERROR OCCURRED DURING FIRESTORE STREAM ---")
        print(f"Error: {e}")
        print("Please check Firestore connection and permissions.")

    print("\n" + "=" * 45)
    print("  KEYWORD BACKFILL PROCESS FINISHED")
    print(f"  Successfully processed: {processed_count}")
    print(f"  Skipped (no content): {skipped_count}")
    print("=" * 45)

if __name__ == "__main__":
    backfill_keywords()