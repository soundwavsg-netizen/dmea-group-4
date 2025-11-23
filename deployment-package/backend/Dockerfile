# Bulletproof Dockerfile for Cloud Run
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy all application files
COPY . .

# Install Python dependencies - ALL of them
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
    anyio==4.11.0 \
    idna==3.11 \
    sniffio==1.3.1

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 8080

# Simple, direct command - no shell script
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT} --workers 1"]
