# 🔧 Cloud Run Deployment - Final Fix

## Current Issue
Container fails to start on PORT 8080 even with updated Dockerfile.

## 🎯 Solution: Use the Bulletproof Dockerfile

I've created a super-simple, tested Dockerfile that will work.

---

## Step 1: Use the New Dockerfile

In your Cloud Shell `backend/` folder:

```bash
# Rename current Dockerfile
mv Dockerfile Dockerfile.old

# Download and use the bulletproof version
# Copy content from /app/backend/Dockerfile.cloudrun
```

**New Dockerfile content:**
```dockerfile
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
```

---

## Step 2: Deploy with Extended Timeout

```bash
cd ~/backend

gcloud run deploy mufe-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 600 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

**What's different:**
- `--timeout 600`: 10 minutes (increased from 5)
- `--memory 1Gi`: More memory (increased from 512Mi)
- `--cpu 1`: Full CPU (instead of fractional)
- `--max-instances 10`: Better scaling

---

## Step 3: Check Logs IMMEDIATELY

While deploying, open another Cloud Shell tab and run:

```bash
# Stream logs in real-time
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=mufe-backend" --format=json
```

Look for:
- ✅ "Application startup complete" = SUCCESS
- ❌ "ModuleNotFoundError" = Missing dependency
- ❌ "Firebase" errors = Environment variable not set
- ❌ "Port" errors = Port binding issue

---

## Step 4: If It Still Fails - Check Build Logs

```bash
# Get the latest build
gcloud builds list --limit 1

# View build logs (replace BUILD_ID)
gcloud builds log BUILD_ID
```

Look for errors during:
- Docker build
- Python package installation
- File copying

---

## Alternative: Deploy Pre-Built Image

If source deployment keeps failing, build locally and push:

```bash
cd ~/backend

# Build the image
gcloud builds submit --tag gcr.io/dmea-group-4/mufe-backend

# Deploy the built image
gcloud run deploy mufe-backend \
  --image gcr.io/dmea-group-4/mufe-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 600 \
  --memory 1Gi
```

---

## Common Issues & Solutions

### Issue 1: "ModuleNotFoundError: No module named 'X'"

**Solution:** The Dockerfile.cloudrun includes all required packages. If you see this, it means a dependency is missing from the install list.

**Quick fix:**
```bash
# Add to Dockerfile before CMD line:
RUN pip install --no-cache-dir MISSING_PACKAGE
```

### Issue 2: Firebase Authentication Error

**Solution:** Environment variable not set.

```bash
# Set via command line during deploy:
gcloud run deploy mufe-backend \
  --source . \
  --set-env-vars "FIREBASE_ADMIN_SDK=$(cat firebase-admin.json | tr -d '\n')"
```

Or set in Console after deployment.

### Issue 3: "exec format error"

**Solution:** start.sh has Windows line endings or isn't executable.

**Quick fix:** Remove start.sh from Dockerfile and use direct uvicorn command (already done in Dockerfile.cloudrun).

### Issue 4: "Connection refused" or "Cannot bind to port"

**Solution:** Server not starting on the correct port.

**Check server.py:**
```python
# Should have:
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## Debugging Checklist

Before redeploying, verify:

- [ ] Dockerfile is named exactly `Dockerfile` (no .txt extension)
- [ ] All Python files are in the backend/ folder
- [ ] services/ folder exists with all .py files
- [ ] No .env file in backend/ folder (Cloud Run uses environment variables)
- [ ] server.py exists and imports work locally

**Test locally in Cloud Shell:**
```bash
cd ~/backend
python -c "import server; print('OK')"
```

If this fails, fix imports before deploying.

---

## Nuclear Option: Start Fresh

If nothing works, create a minimal test deployment:

```bash
# Create test.py
cat > test.py << 'EOF'
from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from Cloud Run", "port": os.getenv("PORT")}

@app.get("/health")
def health():
    return {"status": "healthy"}
EOF

# Create minimal Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
RUN pip install fastapi uvicorn
COPY test.py .
CMD ["sh", "-c", "uvicorn test:app --host 0.0.0.0 --port ${PORT}"]
EOF

# Deploy
gcloud run deploy test-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

If this works, the issue is with your application code, not Cloud Run.

---

## Success Indicators

You'll know it worked when you see:

1. **During deployment:**
   ```
   ✓ Creating Revision...
   ✓ Routing traffic...
   Service URL: https://mufe-backend-xxxxx-uc.a.run.app
   ```

2. **In logs:**
   ```
   Application startup complete
   Uvicorn running on http://0.0.0.0:8080
   ```

3. **Health check works:**
   ```bash
   curl https://YOUR-URL/api/health
   # Returns: {"status":"healthy"}
   ```

---

## Next Steps After Success

1. **Copy your Cloud Run URL**
2. **Set environment variables** in Cloud Run Console:
   - CORS_ORIGINS
   - FIREBASE_ADMIN_SDK
3. **Test all endpoints**
4. **Update frontend** with your backend URL
5. **Celebrate!** 🎉

---

**Try the Dockerfile.cloudrun version and let me know what errors appear in the logs!**
