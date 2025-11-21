import firebase_admin
from firebase_admin import credentials, firestore
from config import settings
import os

# Initialize Firebase Admin
if not firebase_admin._apps:
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = settings.GOOGLE_APPLICATION_CREDENTIALS
    cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
    firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()
