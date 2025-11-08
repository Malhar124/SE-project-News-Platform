import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

def initialize_firebase():
    """
    Finds the .env file, loads environment variables, and initializes the
    Firebase Admin SDK using a service account key.
    
    This function is designed to be called once when the application starts.
    """
    # Check if the Firebase app is already initialized to avoid errors.
    if firebase_admin._apps:
        return firestore.client()

    # --- Find the .env file in the project root ---
    # This robust path logic allows scripts to be run from any directory
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    dotenv_path = os.path.join(project_root, '.env')

    if not os.path.exists(dotenv_path):
        raise FileNotFoundError(f"FATAL: .env file not found at {dotenv_path}. Please create it.")
    
    load_dotenv(dotenv_path)
    print("Successfully loaded environment variables from .env file.")

    # --- Get the service account key path from the environment ---
    service_account_key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
    if not service_account_key_path:
        raise ValueError("FATAL: FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not set in your .env file.")
    
    if not os.path.exists(service_account_key_path):
        raise FileNotFoundError(f"FATAL: The Firebase service account key file was not found at the path: {service_account_key_path}")

    # --- Initialize the Firebase App ---
    try:
        cred = credentials.Certificate(service_account_key_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"FATAL: Error initializing Firebase Admin SDK: {e}")
        raise
        
    return firestore.client()

# Initialize the connection and create a global 'db' client
# that other scripts can import and use directly.
db = initialize_firebase()

