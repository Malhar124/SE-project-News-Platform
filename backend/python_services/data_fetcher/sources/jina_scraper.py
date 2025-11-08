import os
import requests

def scrape_article_content(url: str) -> str:
    """
    Uses the JinaAI Reader API to scrape the full, clean content of a given URL.
    
    Args:
        url (str): The URL of the news article to scrape.
        
    Returns:
        str: The clean, full content of the article in Markdown format, 
             or an empty string if scraping fails.
    """
    api_key = os.getenv("JINA_API_KEY")
    if not api_key:
        print("Warning: JINA_API_KEY is not set. Cannot scrape full content.")
        return ""

    # The JinaAI Reader API is accessed by prepending its URL
    reader_url = f"https://r.jina.ai/{url}"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }

    try:
        response = requests.get(reader_url, headers=headers, timeout=60)
        
        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            print(f"  -> Successfully scraped: {url}")
            return data.get('data', {}).get('content', '')
        else:
            print(f"  -> Failed to scrape {url}. Status: {response.status_code}, Response: {response.text}")
            return ""
            
    except requests.RequestException as e:
        print(f"  -> An error occurred while scraping {url}: {e}")
        return ""
