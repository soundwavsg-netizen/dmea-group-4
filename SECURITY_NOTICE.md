# 🔒 Security Notice - Protecting Your Credentials

## ⚠️ IMPORTANT: Never Commit Secrets to Git

This project uses Firebase Admin SDK credentials that must be kept secure.

### What's Protected:

✅ **Already in .gitignore:**
- `backend/.env` - Contains Firebase credentials
- `frontend/.env` - Contains API URLs
- `backend/secrets/*.json` - Firebase service account files

### How to Set Up Credentials:

#### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (dmea-group-4)
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

#### Step 2: Configure Backend

**Option A: Using Environment Variable (Recommended for Cloud Run)**

1. Copy `backend/.env.example` to `backend/.env`
2. Open the downloaded Firebase JSON file
3. Copy the ENTIRE JSON content
4. Paste it into `backend/.env` as `FIREBASE_ADMIN_SDK` value:
   ```
   FIREBASE_ADMIN_SDK='{"type": "service_account", "project_id": "dmea-group-4", ...}'
   ```

**Option B: Using File (Local Development)**

1. Create folder: `backend/secrets/`
2. Save the downloaded JSON as: `backend/secrets/firebase-admin.json`
3. Update `backend/.env`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="/app/backend/secrets/firebase-admin.json"
   ```

#### Step 3: Configure Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Update `REACT_APP_BACKEND_URL`:
   - Local: `http://localhost:8001`
   - Production: Your Cloud Run URL

### For Cloud Run Deployment:

**Set as Environment Variables (NOT in code):**

1. Go to Cloud Run Console
2. Select your service → Edit & Deploy New Revision
3. Add environment variables:
   - `FIREBASE_ADMIN_SDK`: (paste the entire JSON)
   - `CORS_ORIGINS`: `https://mufegroup4.web.app,*`

### Verify Security:

Before committing to Git, run:
```bash
# Check for exposed secrets
grep -r "BEGIN PRIVATE KEY" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "private_key_id" . --exclude-dir=node_modules --exclude-dir=.git
```

If any results appear in files OTHER than `.env` or `secrets/`, DO NOT COMMIT.

### Emergency: If You Accidentally Committed Secrets:

1. **Immediately revoke the exposed key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Delete the compromised service account
   - Generate a new one

2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push** (WARNING: Coordinate with team):
   ```bash
   git push origin --force --all
   ```

### Best Practices:

✅ Use `.env.example` files as templates  
✅ Never commit `.env` files  
✅ Store production secrets in Cloud Run environment variables  
✅ Rotate credentials regularly  
✅ Use different credentials for dev/staging/prod  

❌ Never hardcode credentials in source code  
❌ Never commit files with "private_key" in them  
❌ Never share credentials in chat/email  
❌ Never include credentials in documentation  

---

**Remember: .env files are in .gitignore for a reason. Keep them local and secure!**