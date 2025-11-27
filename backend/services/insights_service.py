import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_client import db
from firebase_admin import firestore
from models import InsightCreate, InsightResponse
from utils import serialize_firestore_doc
from typing import List

class InsightsService:
    
    @staticmethod
    def create_insight(insight: InsightCreate) -> InsightResponse:
        """Create a new insight in Firestore"""
        # Convert to dict
        data = insight.model_dump()
        data['created_at'] = firestore.SERVER_TIMESTAMP
        
        # Save to Firestore
        doc_ref = db.collection('insights').document()
        doc_ref.set(data)
        
        # Get the saved document to return
        saved_doc = doc_ref.get()
        serialized = serialize_firestore_doc(saved_doc)
        
        return InsightResponse(**serialized)
    
    @staticmethod
    def get_all_insights(limit: int = 100) -> List[InsightResponse]:
        """Get all insights from Firestore"""
        insights_ref = db.collection('insights').order_by(
            'created_at', direction=firestore.Query.DESCENDING
        ).limit(limit)
        
        docs = insights_ref.stream()
        
        return [
            InsightResponse(**serialize_firestore_doc(doc))
            for doc in docs
        ]
    
    @staticmethod
    def get_insight_by_id(insight_id: str) -> InsightResponse:
        """Get a single insight by ID"""
        doc = db.collection('insights').document(insight_id).get()
        
        if not doc.exists:
            raise ValueError(f"Insight with ID {insight_id} not found")
        
        return InsightResponse(**serialize_firestore_doc(doc))
    
    @staticmethod
    def delete_insight(insight_id: str) -> None:
        """Delete an insight by ID"""
        doc_ref = db.collection('insights').document(insight_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise ValueError(f"Insight with ID {insight_id} not found")
        
        doc_ref.delete()
        return None
