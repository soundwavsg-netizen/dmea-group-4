"""
Service for storing and retrieving analytics results and insights
"""
from firebase_client import db
from datetime import datetime, timezone

class AnalyticsStorageService:
    
    @staticmethod
    def save_analytics(module: str, analytics_data: dict, generated_by: str):
        """
        Save analytics results to Firestore (globally shared)
        Args:
            module: 'social_media' or 'search_marketing'
            analytics_data: The analytics results
            generated_by: Username who generated the analytics
        """
        try:
            doc_ref = db.document(f'analytics_results/{module}')
            doc_ref.set({
                'module': module,
                'data': analytics_data,
                'generated_by': generated_by,
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            })
            return True
        except Exception as e:
            print(f"Error saving analytics for {module}: {e}")
            return False
    
    @staticmethod
    def get_analytics(module: str):
        """
        Get latest analytics results from Firestore
        Args:
            module: 'social_media' or 'search_marketing'
        Returns:
            Analytics data dict or None
        """
        try:
            doc_ref = db.document(f'analytics_results/{module}')
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return data.get('data')
            return None
        except Exception as e:
            print(f"Error loading analytics for {module}: {e}")
            return None
    
    @staticmethod
    def save_insights(module: str, insights_data: dict, generated_by: str):
        """
        Save insights to Firestore (globally shared)
        Args:
            module: 'social_media' or 'search_marketing'
            insights_data: The insights results
            generated_by: Username who generated the insights
        """
        try:
            doc_ref = db.document(f'insights_results/{module}')
            doc_ref.set({
                'module': module,
                'data': insights_data,
                'generated_by': generated_by,
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            })
            return True
        except Exception as e:
            print(f"Error saving insights for {module}: {e}")
            return False
    
    @staticmethod
    def get_insights(module: str):
        """
        Get latest insights from Firestore
        Args:
            module: 'social_media' or 'search_marketing'
        Returns:
            Insights data dict or None
        """
        try:
            doc_ref = db.document(f'insights_results/{module}')
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                return data.get('data')
            return None
        except Exception as e:
            print(f"Error loading insights for {module}: {e}")
            return None
