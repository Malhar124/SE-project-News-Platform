# Use an official lightweight Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED True
ENV PYTHONDONTWRITEBYTECODE 1

# Set working directory
ENV APP_HOME /app
WORKDIR $APP_HOME

# --- Install System Dependencies ---
# libsndfile1 is required by the 'soundfile' library to write audio files
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
# Installing PyTorch (a dependency of transformers) can take a VERY long time
# We give it 10 minutes (600 seconds) to be safe
RUN pip install --no-cache-dir --default-timeout=600 -r requirements.txt

# Copy the shared directory (for auth)
COPY ../shared ./shared

# Copy application code
COPY main.py .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application using Gunicorn with Uvicorn workers (for FastAPI)
CMD exec gunicorn --bind :${PORT:-8080} --workers 1 --threads 8 --timeout 0 -k uvicorn.workers.UvicornWorker main:app