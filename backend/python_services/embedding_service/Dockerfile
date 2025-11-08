# Use an official lightweight Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED True
ENV PYTHONDONTWRITEBYTECODE 1

# Set working directory
ENV APP_HOME /app
WORKDIR $APP_HOME

# Install potential system dependencies for PyTorch/SentenceTransformers if needed
# (Often not required for CPU, but good to be aware of)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies, including gunicorn
COPY requirements.txt .
# Installing PyTorch can take time, increase timeout
RUN pip install --no-cache-dir --default-timeout=300 -r requirements.txt
RUN pip install gunicorn # Ensure gunicorn is installed

# Copy shared directory
COPY ../shared ./shared

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application using Gunicorn
# Allocating more threads might be beneficial if embedding generation uses multiple cores
CMD exec gunicorn --bind :${PORT:-8080} --workers 1 --threads 8 --timeout 0 main:app
