# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies (only the essentials for Cloud Run)
RUN pip install --no-cache-dir \
    fastapi==0.110.1 \
    uvicorn==0.25.0 \
    firebase-admin==7.1.0 \
    pydantic==2.12.4 \
    python-dotenv==1.2.1 \
    starlette==0.37.2

# Copy application code
COPY . .

# Expose port (Cloud Run will override this)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Run the application
CMD uvicorn server:app --host 0.0.0.0 --port $PORT