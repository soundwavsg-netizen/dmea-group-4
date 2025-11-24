from firebase_admin import firestore
from firebase_client import db
from datetime import datetime
from typing import List, Optional, Dict, Any

class DailyReflectionsService:
    """Service for managing daily reflections in Firestore"""
    
    COLLECTION_NAME = 'daily_reflections'
    
    @staticmethod
    def create_reflection(data: Dict[str, Any], created_by: str) -> Dict[str, Any]:
        """
        Create a new daily reflection
        
        Args:
            data: Reflection data (topic, key_takeaways, growth_challenge, immediate_action, personal_application)
            created_by: User ID or email who created the reflection
        
        Returns:
            Created reflection with ID and timestamps
        """
        try:
            # Create document reference
            doc_ref = db.collection(DailyReflectionsService.COLLECTION_NAME).document()
            
            # Prepare document data
            reflection_data = {
                'topic': data.get('topic', ''),
                'key_takeaways': data.get('key_takeaways', ''),
                'growth_challenge': data.get('growth_challenge', ''),
                'immediate_action': data.get('immediate_action', ''),
                'personal_application': data.get('personal_application', ''),
                'created_by': created_by,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            
            # Write to Firestore
            doc_ref.set(reflection_data)
            
            # Fetch the document to get server timestamps
            created_doc = doc_ref.get()
            result = created_doc.to_dict()
            result['id'] = created_doc.id
            
            # Convert timestamps to ISO strings
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return result
            
        except Exception as e:
            print(f"Error creating reflection: {e}")
            raise Exception(f"Failed to create reflection: {str(e)}")
    
    @staticmethod
    def get_all_reflections(user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get all daily reflections for a specific user, sorted by created_at DESC
        
        Args:
            user_id: User identifier (username or email)
            limit: Maximum number of reflections to return
        
        Returns:
            List of reflections for the user
        """
        try:
            reflections = []
            
            # Query Firestore filtered by user, with ordering and limit
            docs = db.collection(DailyReflectionsService.COLLECTION_NAME) \
                .where('created_by', '==', user_id) \
                .order_by('created_at', direction=firestore.Query.DESCENDING) \
                .limit(limit) \
                .stream()
            
            for doc in docs:
                reflection = doc.to_dict()
                reflection['id'] = doc.id
                
                # Convert timestamps to ISO strings
                if reflection.get('created_at'):
                    reflection['created_at'] = reflection['created_at'].isoformat()
                if reflection.get('updated_at'):
                    reflection['updated_at'] = reflection['updated_at'].isoformat()
                
                reflections.append(reflection)
            
            return reflections
            
        except Exception as e:
            print(f"Error fetching reflections: {e}")
            raise Exception(f"Failed to fetch reflections: {str(e)}")
    
    @staticmethod
    def get_reflection_by_id(reflection_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get a single reflection by ID (user can only access their own reflections)
        
        Args:
            reflection_id: Reflection document ID
            user_id: User identifier (username or email)
        
        Returns:
            Reflection data
        """
        try:
            doc_ref = db.collection(DailyReflectionsService.COLLECTION_NAME).document(reflection_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                raise ValueError(f"Reflection with ID {reflection_id} not found")
            
            reflection = doc.to_dict()
            
            # Security check: Verify the reflection belongs to the user
            if reflection.get('created_by') != user_id:
                raise PermissionError("Access denied. This reflection belongs to another user.")
            
            reflection['id'] = doc.id
            
            # Convert timestamps
            if reflection.get('created_at'):
                reflection['created_at'] = reflection['created_at'].isoformat()
            if reflection.get('updated_at'):
                reflection['updated_at'] = reflection['updated_at'].isoformat()
            
            return reflection
            
        except (ValueError, PermissionError):
            raise
        except Exception as e:
            print(f"Error fetching reflection: {e}")
            raise Exception(f"Failed to fetch reflection: {str(e)}")
    
    @staticmethod
    def update_reflection(reflection_id: str, data: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Update an existing reflection (user can only update their own reflections)
        
        Args:
            reflection_id: Reflection document ID
            data: Updated reflection data
            user_id: User identifier (username or email)
        
        Returns:
            Updated reflection
        """
        try:
            doc_ref = db.collection(DailyReflectionsService.COLLECTION_NAME).document(reflection_id)
            
            # Check if document exists
            doc = doc_ref.get()
            if not doc.exists:
                raise ValueError(f"Reflection with ID {reflection_id} not found")
            
            # Security check: Verify the reflection belongs to the user
            reflection_data = doc.to_dict()
            if reflection_data.get('created_by') != user_id:
                raise PermissionError(f"Access denied. You can only update your own reflections.")
            
            # Prepare update data
            update_data = {
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            
            # Only update provided fields
            if 'topic' in data:
                update_data['topic'] = data['topic']
            if 'key_takeaways' in data:
                update_data['key_takeaways'] = data['key_takeaways']
            if 'growth_challenge' in data:
                update_data['growth_challenge'] = data['growth_challenge']
            if 'immediate_action' in data:
                update_data['immediate_action'] = data['immediate_action']
            if 'personal_application' in data:
                update_data['personal_application'] = data['personal_application']
            
            # Update document
            doc_ref.update(update_data)
            
            # Fetch updated document
            updated_doc = doc_ref.get()
            result = updated_doc.to_dict()
            result['id'] = updated_doc.id
            
            # Convert timestamps
            if result.get('created_at'):
                result['created_at'] = result['created_at'].isoformat()
            if result.get('updated_at'):
                result['updated_at'] = result['updated_at'].isoformat()
            
            return result
            
        except ValueError:
            raise
        except Exception as e:
            print(f"Error updating reflection: {e}")
            raise Exception(f"Failed to update reflection: {str(e)}")
    
    @staticmethod
    def delete_reflection(reflection_id: str) -> bool:
        """
        Delete a reflection
        
        Args:
            reflection_id: Reflection document ID
        
        Returns:
            True if deleted successfully
        """
        try:
            doc_ref = db.collection(DailyReflectionsService.COLLECTION_NAME).document(reflection_id)
            
            # Check if document exists
            if not doc_ref.get().exists:
                raise ValueError(f"Reflection with ID {reflection_id} not found")
            
            # Delete document
            doc_ref.delete()
            
            return True
            
        except ValueError:
            raise
        except Exception as e:
            print(f"Error deleting reflection: {e}")
            raise Exception(f"Failed to delete reflection: {str(e)}")
