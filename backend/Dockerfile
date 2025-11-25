# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy application code first
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.110.1 \
    uvicorn[standard]==0.25.0 \
    firebase-admin==7.1.0 \
    pydantic==2.12.4 \
    pydantic-core==2.41.5 \
    python-dotenv==1.2.1 \
    starlette==0.37.2 \
    typing-extensions==4.15.0 \
    annotated-types==0.7.0 \
    openai==1.99.9 \
    scikit-learn==1.7.2 \
    numpy==2.3.5 \
    emergentintegrations==0.1.0 \
    google-cloud-firestore==2.21.0 \
    google-cloud-storage==3.6.0 \
    requests==2.32.5 \
    python-jose==3.5.0 \
    python-multipart==0.0.20 \
    bcrypt==4.1.3 \
    scipy==1.16.3 \
    joblib==1.5.2 \
    threadpoolctl==3.6.0

# Expose port (Cloud Run will override this)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/api/health', timeout=5)"

# Run the application
CMD exec uvicorn server:app --host 0.0.0.0 --port $PORT --log-level info