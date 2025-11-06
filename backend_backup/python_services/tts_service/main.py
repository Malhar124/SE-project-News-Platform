import sys
import os
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import torch
import io
import base64
from dotenv import load_dotenv

# --- Path Setup ---
# This ensures we can import from the 'shared' directory
current_dir = os.path.dirname(__file__)
parent_dir = os.path.abspath(os.path.join(current_dir, '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# --- Load Environment Variables ---
# This loads the .env file from the project root
project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
dotenv_path = os.path.join(project_root, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)

# --- Import Auth Verifier ---
try:
    from shared.auth.token_verifier import verify_firebase_token
except ImportError:
    print("FATAL: Could not import 'verify_firebase_token'. Make sure 'shared/auth/token_verifier.py' exists.")
    verify_firebase_token = None
except Exception as e:
    print(f"FATAL: Error initializing Firebase for auth: {e}")
    verify_firebase_token = None

# --- Model Loading ---
try:
    print("Loading Kokoro TTS model...")
    pipeline = KPipeline(lang_code="a")
    print("Kokoro TTS model ready!")
except Exception as e:
    print(f"FATAL: Could not load Kokoro model. Error: {e}")
    pipeline = None

# --- FastAPI App & Auth Setup ---
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_authenticated_user(token: str = Depends(oauth2_scheme)):
    """A FastAPI dependency to verify the Firebase ID token."""
    if not verify_firebase_token:
        raise HTTPException(status_code=503, detail="Authentication service not available.")
    
    decoded_token = verify_firebase_token(token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired authentication token.",
        )
    return decoded_token.get("uid")

# --- Health Check Endpoint ---
@app.get("/health")
def health_check():
    """Basic health check endpoint."""
    if pipeline:
        return {"status": "ok", "message": "TTS model loaded"}
    else:
        return {"status": "error", "message": "TTS model failed to load"}, 503

# --- TTS Generation Endpoint ---
@app.post("/tts")
async def generate_tts(request: Request, user_id: str = Depends(get_authenticated_user)):
    """
    Generates speech from text. Authenticated.
    Returns JSON with Base64-encoded audio.
    """
    if not pipeline:
        print("Error: /tts called but TTS model is not available.")
        return JSONResponse({"error": "TTS service is not available"}, status_code=503)

    try:
        data = await request.json()
        text = data.get("text", "").strip()

        if not text:
            return JSONResponse({"error": "No text provided"}, status_code=400)

        print(f"🗣️ User {user_id} generating speech for: {text[:60]}...")
        generator = pipeline(text, voice="af_heart", speed=1)

        all_audio = []
        for i, (_, _, audio) in enumerate(generator):
            all_audio.append(audio)

        if not all_audio:
            print("No audio generated.")
            return JSONResponse({"error": "No audio could be generated"}, status_code=500)

        full_audio = np.concatenate(all_audio)
        sample_rate = 24000  # Default sample rate for kokoro

        print("Full audio generated. Encoding to Base64...")

        # --- MODIFICATION: Convert to Base64 instead of FileResponse ---
        buffer = io.BytesIO()
        sf.write(buffer, full_audio, sample_rate, format='WAV', subtype='PCM_16')
        buffer.seek(0)
        audio_binary = buffer.read()
        audio_base64 = base64.b64encode(audio_binary).decode('utf-8')

        print("Audio encoded successfully.")
        
        # 5. Return JSON with the Base64 string
        return JSONResponse({
            "audio_base64": audio_base64,
            "mime_type": "audio/wav"
        })
        # --- END OF MODIFICATION ---

    except Exception as e:
        print(f"Error in TTS generation: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == '__main__':
    # For local testing only
    port = int(os.environ.get('PORT', 8080))
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=port)