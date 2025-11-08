import sys
import os
import time
import re
import string
from dotenv import load_dotenv

# This block ensures Python can find the 'shared' directory
current_dir = os.path.dirname(__file__)
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

#  IMPORT ALL OUR CLIENTS 
from shared.database.firestore_client import db
# (No ChromaDB or embedding clients needed anymore)

# Import local source clients
from sources.newsapi_client import fetch_latest_news
from sources.jina_scraper import scrape_article_content

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
    
    # Combine title and description for a richer keyword set
    full_text = title + " " + description
    
    # Remove punctuation and convert to lowercase
    full_text = full_text.lower().translate(str.maketrans('', '', string.punctuation))
    
    # Split into individual words
    words = re.split(r'\s+', full_text)
    
    # Filter out stop words and create a unique set, then convert to list
    keywords = list(set(word for word in words if word and word not in STOP_WORDS and len(word) > 2))
    return keywords


def main():
    
    print("=" * 45)
    print("  STARTING DATA PIPELINE (Keyword Generation)")
    print("=" * 45)

    categories_to_fetch = [
        'business', 'entertainment', 'general', 'health',
        'science', 'sports', 'technology'
    ]
    
    total_new_articles_processed = 0

    for category in categories_to_fetch:
        print(f"\n--- Processing category: {category.upper()} ---")
        
        articles_to_process = fetch_latest_news(category=category, country='us')
        if not articles_to_process:
            print(f"No new articles found for '{category}'. Skipping.")
            continue

        for article in articles_to_process:
            doc_id = article.get('url', '').replace('/', '_').replace('.', '_')
            if not doc_id:
                print("  -> Skipping article with no URL.")
                continue
            
            doc_ref = db.collection('articles').document(doc_id)

            if doc_ref.get().exists:
                print(f"  -> Article '{article.get('title', 'Untitled')[:50]}...' already in Firestore. Skipping.")
                continue

            # 1. SCRAPE with JinaAI
            print(f"\nScraping: {article.get('title', 'Untitled')[:50]}...")
            full_content = scrape_article_content(article.get('url'))
            
            # 2. GENERATE KEYWORDS
            keywords = _generate_keywords(
                article.get('title'), 
                article.get('description') or article.get('content')
            )

            # 3. ASSEMBLE & SAVE to Firestore
            article['category'] = category
            article['full_clean_content'] = full_content if full_content else ""
            article['processing_status'] = 'pending'
            article['keywords'] = keywords  # <-- ADD THE NEW KEYWORDS FIELD
            
            try:
                doc_ref.set(article)
                print(f"  -> Saved article with keywords to Firestore.")
                total_new_articles_processed += 1
            except Exception as e:
                print(f"  -> FAILED to save article. Error: {e}")

            time.sleep(1) 
        
    print("\n" + "=" * 45)
    print(f"  Data pipeline finished. Processed {total_new_articles_processed} new articles.")
    print("=" * 45)

if __name__ == '__main__':
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
    load_dotenv(dotenv_path=env_path)
    main()