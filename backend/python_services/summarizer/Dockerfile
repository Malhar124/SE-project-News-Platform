# Use an official lightweight Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED True
ENV PYTHONDONTWRITEBYTECODE 1

# Set working directory
ENV APP_HOME /app
WORKDIR $APP_HOME

# Install system dependencies if needed (unlikely for summarizer)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy shared directory
COPY ../shared ./shared

# Copy application code
COPY . .

# Assuming this is run as a periodic job like the data fetcher
# ENTRYPOINT ["python"]
# CMD ["main.py"]