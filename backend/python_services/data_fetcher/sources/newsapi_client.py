import os
from newsapi import NewsApiClient

def fetch_latest_news(category='business', country='in'):
    """
    Fetches the latest news articles for a given category and country.
    
    Args:
        category (str): The category of news to fetch (e.g., 'business', 'technology').
        country (str): The country code (e.g., 'in' for India, 'us' for USA).
        
    Returns:
        list: A list of article dictionaries, or an empty list if an error occurs.
    """
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        raise ValueError("FATAL: NEWS_API_KEY is not set in your .env file.")

    print(f"Fetching latest '{category}' news from '{country}'...")
    
    try:
        # Initialize the client with the API key
        newsapi = NewsApiClient(api_key=api_key)
        
        # Make the API request for top headlines
        top_headlines = newsapi.get_top_headlines(
            category=category,
            language='en',
            country=country,
            page_size=50  # Get up to 50 articles per request
        )

        # Check if the request was successful
        if top_headlines.get('status') == 'ok':
            articles = top_headlines.get('articles', [])
            print(f"Successfully fetched {len(articles)} articles from NewsAPI.")
            return articles
        else:
            print(f"Error from NewsAPI: {top_headlines.get('message')}")
            return []
            
    except Exception as e:
        print(f"An unexpected error occurred while fetching news: {e}")
        return []