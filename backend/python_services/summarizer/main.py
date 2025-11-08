import sys
import os
import time

# This allows this script to find and import modules from the 'shared' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.database.firestore_client import db
from summary_engine.langgraph_agent import get_summary

def process_articles():
    """
    Finds articles in Firestore that have not been summarized, generates a summary
    for each, and updates the document.
    """
    # 1. Query Firestore for articles with 'pending' status. We process in small batches.
    articles_ref = db.collection('articles').where('processing_status', '==', 'pending').limit(10)
    
    try:
        articles_to_process = list(articles_ref.stream())
    except Exception as e:
        print(f"Error fetching articles from Firestore: {e}")
        return

    if not articles_to_process:
        print("No pending articles to summarize. All work is done.")
        return
        
    print(f"Found {len(articles_to_process)} articles to summarize.")

    # 2. Loop through each article document and process it
    for article_doc in articles_to_process:
        article_data = article_doc.to_dict()
        doc_id = article_doc.id
        
        print(f"\nProcessing article: {article_data.get('title')}")
        
        content = article_data.get('full_clean_content')
        
        if not content:
            print("  -> SKIPPED: Article has no full content.")
            db.collection('articles').document(doc_id).update({'processing_status': 'failed_no_content'})
            continue

        # 3. Generate the summary using our LangGraph agent
        summary = get_summary(content)
        
        # 4. Update the document in Firestore with the summary and new status
        try:
            db.collection('articles').document(doc_id).update({
                'summary': summary,
                'processing_status': 'completed'
            })
            print(f"  -> Successfully updated Firestore document: {doc_id}")
        except Exception as e:
            print(f"  -> FAILED to update Firestore document {doc_id}. Error: {e}")

        # Add a delay to respect API rate limits (Gemini Pro has a limit of 60 requests/minute)
        time.sleep(2)

def main():
    """
    Main entry point for the summarization service.
    """
    print("=============================================")
    print("  STARTING NEWS SUMMARIZATION SERVICE")
    print("=============================================")
    
    process_articles()
    
    print("\nSummarization process finished.")
    print("=============================================")

if __name__ == "__main__":
    main()

