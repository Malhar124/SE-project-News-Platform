import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load the .env file from the parent folder
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Read the API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("❌ GEMINI_API_KEY not found. Please check your .env file.")

print("✅ GEMINI_API_KEY loaded:", api_key[:6] + "..." + api_key[-4:])

# Configure Gemini
genai.configure(api_key=api_key)

# Test listing models
print("✅ Listing models available for this API key:")
for m in genai.list_models():
    print("-", m.name)