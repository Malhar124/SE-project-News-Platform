import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_summary(article_content: str) -> str:
    """
    Uses the Google Gemini model to generate a summary for the given article content,
    formatted as a list of bullet points.
    
    Args:
        article_content (str): The full text of the news article.
        
    Returns:
        str: A concise, bulleted summary of the article, or an error message.
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("FATAL: GEMINI_API_KEY is not set in your .env file.")

    # 1. Define the Large Language Model (LLM)
    llm = ChatGoogleGenerativeAI(
        model='gemini-2.0-flash',
        google_api_key=gemini_api_key,
        api_version="v1",  # 👈 Force stable version
        temperature=0.3,
    )

    # 2. Create a clear and specific prompt template with formatting instructions.
    # THIS IS THE PART WE ARE CHANGING.
    prompt = ChatPromptTemplate.from_template(
        """
        You are an expert news analyst. Your task is to provide a clear, unbiased, and concise summary of the following news article.

        **Format the summary as a list of 3 to 6 key bullet points.** Each point should be a complete sentence.
        Focus on the key facts, events, and outcomes. Do not add any personal opinions or speculation.

        Here is the article content:
        ---
        {article}
        """
    )

    # 3. Define the output parser
    output_parser = StrOutputParser()

    # 4. Chain the components together
    summarization_chain = prompt | llm | output_parser

    print("  -> Generating bulleted summary with Gemini...")
    try:
        # Invoke the chain with the article content
        summary = summarization_chain.invoke({"article": article_content})
        print("  -> Summary generated successfully.")
        return summary
    except Exception as e:
        print(f"  -> FAILED to generate summary. Error: {e}")
        return "Summary could not be generated at this time."

