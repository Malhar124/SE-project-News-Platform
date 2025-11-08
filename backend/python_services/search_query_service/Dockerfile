# Use an official lightweight Python image.
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED True
ENV APP_HOME /app
WORKDIR $APP_HOME

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
# Ensure shared modules are accessible (adjust path if needed)
COPY ../shared ./shared
COPY . .

# Expose the port the app runs on (Cloud Run default is 8080)
EXPOSE 8080

# Command to run the application using Gunicorn (recommended for production)
# Install gunicorn first: pip install gunicorn
RUN pip install gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]
