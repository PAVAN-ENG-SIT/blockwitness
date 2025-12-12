# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Pillow and other packages
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy crypto keys if they exist
COPY backend/keys/ ./backend/keys/

# Create necessary directories
RUN mkdir -p backend/uploads backend/certificates backend/static

# Expose port (Render will set PORT env variable)
EXPOSE 5000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=backend.app

# Run gunicorn
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 backend.app:app