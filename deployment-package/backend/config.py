import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Firebase
    GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
        'GOOGLE_APPLICATION_CREDENTIALS',
        '/app/backend/secrets/firebase-admin.json'
    )
    
    # LLM
    EMERGENT_LLM_KEY = os.getenv('EMERGENT_LLM_KEY')
    LLM_BASE_URL = 'https://llm-router.emergentagent.com/v1'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

settings = Settings()
