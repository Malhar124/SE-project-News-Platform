"""
Universal Firestore Article Cleaner
-----------------------------------
Cleans every article in Firestore by removing menus, headers, ads, and junk.
Overwrites the `content` field with clean, readable text.
"""

import re
import time
import firebase_admin
from firebase_admin import credentials, firestore
from readability import Document
from bs4 import BeautifulSoup
from datetime import datetime


# ---------------- FIREBASE SETUP ----------------
cred = credentials.Certificate(
    "/Users/malharudmale/Desktop/news platform/backend/news-platform-backend-eb75e-firebase-adminsdk-fbsvc-5b37da6380.json"
)
firebase_admin.initialize_app(cred)
db = firestore.client()


# ---------------- UNIVERSAL CLEANER ----------------
def deep_clean_html(raw_text: str) -> str:
    """
    Cleans deeply mixed HTML/Markdown/news text into clean article prose.
    Works even when the source is flattened or malformed.
    """
    if not raw_text or not isinstance(raw_text, str):
        return ""

    text = raw_text

    # --- Use readability to isolate article (works on valid HTML) ---
    try:
        doc = Document(raw_text)
        readable_html = doc.summary(html_partial=True)
    except Exception:
        readable_html = raw_text

    soup = BeautifulSoup(readable_html, "lxml")
    for tag in soup(["script", "style", "nav", "footer", "form", "aside", "header", "svg", "noscript"]):
        tag.decompose()
    text = soup.get_text(separator="\n")

    # --- Strip tags if any remain ---
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"={2,}|-{2,}", " ", text)

    # --- Remove Markdown & URLs ---
    text = re.sub(r"!\[.*?\]\(.*?\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\((?:https?:\/\/|mailto:)[^)]+\)", r"\1", text)
    text = re.sub(r"https?:\/\/\S+", " ", text)

    # --- Remove site UI & repeated boilerplate phrases ---
    ui_phrases = [
        "privacy policy", "terms of service", "advertisement", "advertising policy",
        "subscribe", "sign up", "sign in", "accept cookies", "related stories",
        "read next", "newsletter", "share this", "follow us", "menu", "footer",
        "header", "disclaimer", "cookies", "back to top", "most popular",
        "trending", "click here", "variety", "robb report", "futurism",
        "9to5mac", "pmc", "about us", "contact us", "donate", "help", "jobs",
        "site protected", "©", "202", "facebook", "instagram", "twitter",
        "linkedin", "reddit", "bluesky", "youtube", "x ", "get the magazine",
        "continue", "resend code", "forgot password", "email address",
        "submit an event", "search for", "open dropdown", "read more",
        "close advert", "newsletter signup", "advertise with us",
    ]
    for phrase in ui_phrases:
        text = re.sub(rf"\b{re.escape(phrase)}\b", " ", text, flags=re.IGNORECASE)

    # --- Remove bullets, checkboxes, misc symbols ---
    text = re.sub(r"\[x\]", " ", text, flags=re.IGNORECASE)
    text = re.sub(r"[-–—•▪◦·\*]\s+", " ", text)

    # --- Normalize spacing ---
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)

    # --- Filter only meaningful lines (>=6 words and contains punctuation) ---
    lines = []
    for line in text.split("\n"):
        line = line.strip()
        if len(line.split()) >= 6 and re.search(r"[.!?]", line):
            lines.append(line)

    cleaned = "\n\n".join(lines)

    # --- Remove duplicate first paragraph (common double-title) ---
    if cleaned:
        paras = cleaned.split("\n\n")
        if len(paras) >= 2 and paras[0].lower() == paras[1].lower():
            paras = paras[1:]
        cleaned = "\n\n".join(paras)

    # --- Final normalization ---
    cleaned = re.sub(r"\s([?.!,])", r"\1", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    cleaned = cleaned.strip()

    return cleaned


# ---------------- FIRESTORE UPDATE ----------------
def clean_all_articles(batch_size=100):
    """
    Cleans every article in Firestore, overwriting its 'content' field.
    """
    snapshot = db.collection("articles").get()
    total = len(snapshot)
    print(f"📰 Found {total} articles in Firestore.")

    updated, skipped = 0, 0

    for i, doc in enumerate(snapshot):
        data = doc.to_dict()
        raw_content = data.get("full_clean_content") or data.get("content")

        if not raw_content:
            skipped += 1
            continue

        cleaned = deep_clean_html(raw_content)

        if len(cleaned) < 250:
            print(f"⚠️ Skipping short/empty cleaned content for: {doc.id}")
            skipped += 1
            continue

        doc.reference.update({
            "content": cleaned,
            "updatedAt": datetime.utcnow(),
        })
        updated += 1
        print(f"✅ [{i+1}/{total}] Updated {doc.id} ({len(cleaned)} chars)")
        time.sleep(0.2)

    print(f"\n🎯 Completed! Cleaned {updated} docs, skipped {skipped}.")


# ---------------- MAIN ----------------
if __name__ == "__main__":
    clean_all_articles()