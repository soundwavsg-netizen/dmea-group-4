"""
Service for managing Social Media and Search Marketing data input
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_client import db
from typing import List, Dict, Any


class MarketingDataService:
    """Service for marketing data management"""
    
    @staticmethod
    def save_social_media_data(username: str, data: List[Dict[str, Any]]) -> bool:
        """Save social media performance data for a user"""
        try:
            doc_ref = db.collection('social_media_data').document(username)
            doc_ref.set({'data': data, 'username': username})
            return True
        except Exception as e:
            print(f"Error saving social media data: {e}")
            return False
    
    @staticmethod
    def get_social_media_data(username: str) -> List[Dict[str, Any]]:
        """Get social media performance data for a user"""
        try:
            doc = db.collection('social_media_data').document(username).get()
            if doc.exists:
                return doc.to_dict().get('data', [])
            return []
        except Exception as e:
            print(f"Error retrieving social media data: {e}")
            return []
    
    @staticmethod
    def save_search_marketing_data(username: str, data: List[Dict[str, Any]]) -> bool:
        """Save search marketing data for a user"""
        try:
            doc_ref = db.collection('search_marketing_data').document(username)
            doc_ref.set({'data': data, 'username': username})
            return True
        except Exception as e:
            print(f"Error saving search marketing data: {e}")
            return False
    
    @staticmethod
    def get_search_marketing_data(username: str) -> List[Dict[str, Any]]:
        """Get search marketing data for a user"""
        try:
            doc = db.collection('search_marketing_data').document(username).get()
            if doc.exists:
                return doc.to_dict().get('data', [])
            return []
        except Exception as e:
            print(f"Error retrieving search marketing data: {e}")
            return []
