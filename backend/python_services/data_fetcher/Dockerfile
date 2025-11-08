# Use an official lightweight Python base image
FROM python:3.11-slim

# Set environment variables for Python
ENV PYTHONUNBUFFERED True
ENV PYTHONDONTWRITEBYTECODE 1

# Set the working directory inside the container
ENV APP_HOME /app
WORKDIR $APP_HOME

# Install system dependencies if any are needed by your Python packages
# (e.g., build-essential, libpq-dev if using PostgreSQL client, etc.)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# --no-cache-dir reduces image size
# --default-timeout=100 increases timeout for potentially slow downloads
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy the shared directory from the parent folder into the container
# This makes 'from shared...' imports work
COPY ../shared ./shared

# Copy the rest of the data_fetcher application code
COPY . .

# No CMD needed if this container is run as a one-off job (e.g., triggered by Cloud Scheduler)
# If it needs to run continuously or expose a port, you'd add EXPOSE and CMD.
# For a job, the entrypoint might be simply 'python' and the command 'main.py'
# when the job is triggered. Cloud Run Jobs handles this.
# For now, we leave it without a CMD assuming it's a triggered job.
# ENTRYPOINT ["python"]
# CMD ["main.py"] # Command to run when the container starts for a job

# If running as a service that needs to stay alive (less common for a fetcher)
# you might need a simple web server or a loop. But a Job is more typical.