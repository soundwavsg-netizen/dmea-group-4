# 🔧 Cloud Run Deployment Fix

## Issue: Container Failed to Start

The error "container failed to start and listen on the port" means Python dependencies are missing or the app crashed during startup.

---

## ✅ Solution: Use the Updated Dockerfile

I've created two fixed versions:

### Option 1: Updated Dockerfile (Recommended)

Location: `/app/backend/Dockerfile`

**What's fixed:**
- ✅ Includes all required dependencies
- ✅ Sets PYTHONPATH correctly
- ✅ Uses `exec` for proper signal handling
- ✅ Better logging

### Option 2: Simple Dockerfile

Location: `/app/backend/Dockerfile.simple`

**Features:**
- Uses a startup script for better debugging
- Minimal dependencies
- Easier to troubleshoot

---

## 🚀 How to Redeploy

### Step 1: Upload the Updated Files

1. Download the updated `Dockerfile` from `/app/backend/Dockerfile`
2. Also download `start.sh` from `/app/backend/start.sh`
3. Upload both to your Cloud Shell in the `backend/` folder

### Step 2: Redeploy

In Cloud Shell, run:

```bash
cd backend

# Make start script executable
chmod +x start.sh

# Deploy with updated Dockerfile
gcloud run deploy mufe-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --timeout 300 \
  --memory 512Mi
```

### Step 3: Check Logs

If it still fails, check the logs:

```bash
# Get recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=mufe-backend" --limit 50 --format json
```

Or view in console: [Cloud Run Logs](https://console.cloud.google.com/logs/query?project=dmea-group-4)

---

## 🐛 Alternative: Use Dockerfile.simple

If the main Dockerfile still has issues, try the simpler version:

```bash
cd backend

# Rename the simple Dockerfile
mv Dockerfile Dockerfile.backup
mv Dockerfile.simple Dockerfile

# Deploy
gcloud run deploy mufe-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Missing Dependencies

**Symptom:** ImportError in logs

**Solution:** The updated Dockerfile includes all required packages:
- fastapi
- uvicorn[standard]
- firebase-admin
- pydantic
- python-dotenv

### Issue 2: Firebase Credentials Not Set

**Symptom:** Firebase authentication errors in logs

**Solution:** Set environment variables:

1. Go to: Cloud Run → mufe-backend → Edit & Deploy New Revision
2. Add environment variable:
   - Name: `FIREBASE_ADMIN_SDK`
   - Value: Your Firebase JSON (get from Firebase Console)

### Issue 3: Port Binding Issues

**Symptom:** "Address already in use" or similar

**Solution:** Already fixed in server.py - it now reads PORT from environment

### Issue 4: Timeout During Startup

**Symptom:** "Container failed within allocated timeout"

**Solution:** Increase timeout:
```bash
gcloud run deploy mufe-backend \
  --source . \
  --timeout 300 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📋 Checklist Before Redeploying

- [ ] Downloaded updated `Dockerfile` from `/app/backend/Dockerfile`
- [ ] Downloaded `start.sh` from `/app/backend/start.sh`
- [ ] Made start.sh executable: `chmod +x start.sh`
- [ ] Uploaded both files to Cloud Shell backend/ folder
- [ ] Set FIREBASE_ADMIN_SDK environment variable in Cloud Run
- [ ] Increased memory to 512Mi and timeout to 300s

---

## ✅ Verification

After successful deployment:

1. **Check the service URL works:**
   ```bash
   curl https://YOUR-CLOUD-RUN-URL/api/health
   ```
   Should return: `{"status":"healthy"}`

2. **Check logs show successful startup:**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" --limit 10
   ```
   Look for: "Application startup complete"

3. **Test from browser:**
   Open: `https://YOUR-CLOUD-RUN-URL/api/health`

---

## 🆘 Still Having Issues?

### Get Detailed Logs:

```bash
# Stream logs in real-time
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=mufe-backend"
```

### Check Build Logs:

```bash
# View build logs
gcloud builds list --limit 5
gcloud builds log BUILD_ID
```

### Common Error Messages:

**"ModuleNotFoundError: No module named 'X'"**
→ Missing dependency. Add it to Dockerfile pip install line.

**"firebase_admin.exceptions.InvalidArgumentError"**
→ FIREBASE_ADMIN_SDK environment variable not set or invalid JSON.

**"[Errno 98] Address already in use"**
→ Port conflict (shouldn't happen in Cloud Run, but check PORT env var).

---

## 💡 Pro Tips

1. **Use Cloud Build for faster rebuilds:**
   ```bash
   gcloud builds submit --tag gcr.io/dmea-group-4/mufe-backend
   gcloud run deploy mufe-backend --image gcr.io/dmea-group-4/mufe-backend
   ```

2. **Test locally before deploying:**
   ```bash
   docker build -t mufe-backend .
   docker run -p 8080:8080 -e PORT=8080 mufe-backend
   curl http://localhost:8080/api/health
   ```

3. **Set environment variables via command line:**
   ```bash
   gcloud run deploy mufe-backend \
     --set-env-vars CORS_ORIGINS="https://mufegroup4.web.app,*"
   ```

---

## 📞 Next Steps

1. Download the updated `Dockerfile` and `start.sh`
2. Upload to Cloud Shell
3. Redeploy using the command above
4. Check logs for any errors
5. Set environment variables if not already done
6. Test the health endpoint
7. Share your Cloud Run URL so we can update the frontend

**The updated Dockerfile should fix the startup issue! 🎉**