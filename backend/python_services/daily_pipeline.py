"""
Daily Automated News Pipeline
------------------------------
Fetches fresh news → cleans → summarizes → stores in Firestore.
Works with your existing service modules.
"""

import os
import sys
import time
from datetime import datetime
from dotenv import load_dotenv

# --- Import local modules ---
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from data_fetcher.main import fetch_latest_news
from clean_content.clean_content import deep_clean_html
from summarizer.main import get_summary
from shared.database.firestore_client import db


# ---------------- SETUP ----------------
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

CATEGORIES = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']


# ---------------- MAIN PIPELINE ----------------
def run_daily_pipeline():
    print("=" * 60)
    print("🚀 STARTING DAILY NEWS PIPELINE")
    print("=" * 60)
    total_articles = 0
    total_cleaned = 0
    total_summarized = 0

    for category in CATEGORIES:
        print(f"\n📰 Fetching articles for category: {category.upper()}")

        try:
            articles = fetch_latest_news(category=category, country="us")
        except Exception as e:
            print(f"❌ Failed to fetch news for {category}: {e}")
            continue

        if not articles:
            print(f"⚠️ No articles fetched for {category}.")
            continue

        for article in articles:
            url = article.get("url")
            if not url:
                continue

            doc_id = url.replace("/", "_").replace(".", "_")
            doc_ref = db.collection("articles").document(doc_id)

            # Skip existing articles
            if doc_ref.get().exists:
                continue

            # --- Step 1: Clean Content ---
            raw_content = article.get("full_clean_content", "")
            cleaned = deep_clean_html(raw_content)

            if len(cleaned) < 300:
                continue

            # --- Step 2: Generate Summary (Gemini, rate limited) ---
            try:
                summary = get_summary(cleaned)
                total_summarized += 1
            except Exception as e:
                print(f"⚠️ Failed to summarize article: {e}")
                summary = ""

            # --- Step 3: Save to Firestore ---
            doc_ref.set({
                "title": article.get("title", ""),
                "url": url,
                "category": category,
                "content": cleaned,
                "summary": summary,
                "publishedAt": article.get("publishedAt", datetime.utcnow()),
                "processing_status": "completed",
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
            }, merge=True)

            total_articles += 1
            total_cleaned += 1
            print(f"✅ Processed: {article.get('title', '')[:80]}")

            # --- Respect Gemini API rate limit (≈ 15 requests/min) ---
            time.sleep(4)

    print("\n🎯 DAILY PIPELINE COMPLETE!")
    print(f"→ Articles processed: {total_articles}")
    print(f"→ Cleaned: {total_cleaned}")
    print(f"→ Summarized: {total_summarized}")
    print("=" * 60)


if __name__ == "__main__":
    run_daily_pipeline()