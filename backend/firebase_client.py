import firebase_admin
from firebase_admin import credentials, firestore
from config import settings
import os
import json

# Initialize Firebase Admin
if not firebase_admin._apps:
    # Try to load from environment variable first (JSON string)
    firebase_admin_sdk = os.getenv('FIREBASE_ADMIN_SDK')
    
    if firebase_admin_sdk:
        # Load from environment variable (Emergent Secrets Manager)
        try:
            cred_dict = json.loads(firebase_admin_sdk)
            cred = credentials.Certificate(cred_dict)
            # Initialize with storage bucket
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'dmea-group-4.firebasestorage.app'
            })
            print("✓ Firebase initialized from FIREBASE_ADMIN_SDK environment variable")
        except json.JSONDecodeError as e:
            print(f"✗ Error parsing FIREBASE_ADMIN_SDK: {e}")
            raise
    else:
        # Fallback to file path (for local development)
        cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
        if os.path.exists(cred_path):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = cred_path
            cred = credentials.Certificate(cred_path)
            # Initialize with storage bucket
            firebase_admin.initialize_app(cred, {
                'storageBucket': 'dmea-group-4.firebasestorage.app'
            })
            print(f"✓ Firebase initialized from file: {cred_path}")
        else:
            raise FileNotFoundError(
                f"Firebase credentials not found. Set FIREBASE_ADMIN_SDK env var or provide file at {cred_path}"
            )

# Get Firestore client
db = firestore.client()
