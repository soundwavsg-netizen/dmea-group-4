from datetime import datetime
from google.cloud.firestore_v1 import DocumentSnapshot
from typing import Any, Dict

def serialize_firestore_doc(doc: DocumentSnapshot) -> Dict[str, Any]:
    """
    Convert Firestore document to JSON-safe dict.
    Handles Timestamps and converts to ISO format strings.
    """
    data = doc.to_dict()
    result = {"id": doc.id}
    
    for key, value in data.items():
        if hasattr(value, 'isoformat'):  # datetime/Timestamp
            result[key] = value.isoformat()
        else:
            result[key] = value
    
    return result

# Platform weights for scoring
PLATFORM_WEIGHTS = {
    "Face to Face": 1.2,
    "Lazada Review": 1.0,
    "Shopee Review": 1.0,
    "Sephora Review": 1.0,
    "Xiaohongshu 小红书": 1.0,
    "Reddit": 1.0,
    "FB Group": 0.9,
    "YouTube": 0.9,
    "Blog/Article": 0.8,
    "TikTok": 0.8,
    "Instagram": 0.8,
    "Other": 0.8
}
