import sys
import os
from dotenv import load_dotenv
from fastapi import Header, HTTPException, status

# --- Path Setup ---
current_dir = os.path.dirname(__file__)  # shared/auth
parent_dir = os.path.abspath(os.path.join(current_dir, '..', '..'))  # python_services/
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# --- Firebase Admin Initialization ---
try:
    from shared.database.firestore_client import db as _db_check
    from firebase_admin import auth

    if not _db_check:
        raise ImportError("firestore_client.db was not initialized.")
    print("Firebase Admin SDK initialized successfully for auth verification.")
except ImportError as e:
    print(f"CRITICAL: Could not import or initialize Firebase Admin SDK: {e}")
    auth = None
except Exception as e:
    print(f"CRITICAL: Unexpected error during Firebase setup for auth: {e}")
    auth = None


# --- Firebase Token Verification ---
def verify_firebase_token(id_token: str):
    """
    Verifies a Firebase ID token using the Firebase Admin SDK.

    Args:
        id_token (str): Firebase ID token (JWT).

    Returns:
        dict | None: Decoded token payload if verification succeeds, None otherwise.
    """
    if not auth:
        print("Error: Firebase Admin Auth module is not available.")
        return None

    if not id_token:
        print("Error: No ID token provided for verification.")
        return None

    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        return decoded_token
    except auth.RevokedIdTokenError:
        print("Error: ID token has been revoked.")
        return None
    except auth.InvalidIdTokenError as e:
        print(f"Error: Invalid ID token: {e}")
        return None
    except Exception as e:
        print(f"Error: Unexpected error during token verification: {e}")
        return None


# --- FastAPI Dependency ---
async def firebase_auth_dependency(authorization: str = Header(None)):
    """
    FastAPI dependency for verifying the Authorization header.
    Expects 'Authorization: Bearer <token>'.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header.",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format.",
        )

    id_token = authorization.split("Bearer ")[1]
    decoded_token = verify_firebase_token(id_token)

    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired authentication token.",
        )

    return decoded_token