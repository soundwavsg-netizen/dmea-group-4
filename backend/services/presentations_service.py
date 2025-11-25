"""
Presentations Service
Handles CRUD operations for custom user-uploaded presentations
"""
from firebase_client import db
from firebase_admin import storage
from datetime import datetime, timezone
import uuid
import base64
import mimetypes


def get_all_presentations(user_id=None):
    """Get all presentations, optionally filtered by user"""
    try:
        query = db.collection('custom_presentations').order_by('created_at', direction='DESCENDING')
        
        if user_id:
            query = query.where('created_by', '==', user_id)
        
        docs = query.stream()
        
        presentations = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            # Convert timestamps to ISO format
            if 'created_at' in data and data['created_at']:
                data['created_at'] = data['created_at'].isoformat() if hasattr(data['created_at'], 'isoformat') else str(data['created_at'])
            if 'updated_at' in data and data['updated_at']:
                data['updated_at'] = data['updated_at'].isoformat() if hasattr(data['updated_at'], 'isoformat') else str(data['updated_at'])
            presentations.append(data)
        
        return presentations
    except Exception as e:
        print(f"Error getting presentations: {e}")
        raise


def create_presentation(name, description, file_url, file_type, file_data, filename, created_by):
    """Create a new presentation with optional file upload"""
    try:
        presentation_id = str(uuid.uuid4())
        
        # If file_data is provided, upload to Firebase Storage
        if file_data and filename:
            try:
                # Get storage bucket with explicit name
                bucket = storage.bucket('dmea-group-4.firebasestorage.app')
                
                # Create unique filename
                file_extension = filename.split('.')[-1] if '.' in filename else ''
                storage_filename = f"presentations/{presentation_id}/{filename}"
                
                # Decode base64 file data
                file_bytes = base64.b64decode(file_data.split(',')[1] if ',' in file_data else file_data)
                
                # Upload to Firebase Storage
                blob = bucket.blob(storage_filename)
                
                # Determine content type
                content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
                blob.upload_from_string(file_bytes, content_type=content_type)
                
                # Make the file publicly accessible
                blob.make_public()
                
                # Get public URL
                file_url = blob.public_url
                
                print(f"File uploaded successfully: {file_url}")
            except Exception as upload_error:
                print(f"Error uploading file: {upload_error}")
                # If storage bucket doesn't exist or upload fails, provide helpful error
                raise Exception(f"File upload is currently unavailable. Please use the 'Provide URL' option instead. Error: {str(upload_error)}")
        
        doc_ref = db.collection('custom_presentations').document(presentation_id)
        
        presentation_data = {
            'name': name,
            'description': description,
            'file_url': file_url,
            'file_type': file_type,  # 'slides' or 'video'
            'created_by': created_by,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        doc_ref.set(presentation_data)
        
        # Return with id
        presentation_data['id'] = presentation_id
        presentation_data['created_at'] = presentation_data['created_at'].isoformat()
        presentation_data['updated_at'] = presentation_data['updated_at'].isoformat()
        
        return presentation_data
    except Exception as e:
        print(f"Error creating presentation: {e}")
        raise


def delete_presentation(presentation_id):
    """Delete a presentation"""
    try:
        doc_ref = db.collection('custom_presentations').document(presentation_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        doc_ref.delete()
        return True
    except Exception as e:
        print(f"Error deleting presentation: {e}")
        raise


def get_presentation_by_id(presentation_id):
    """Get a single presentation by ID"""
    try:
        doc_ref = db.collection('custom_presentations').document(presentation_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data['id'] = doc.id
        
        # Convert timestamps
        if 'created_at' in data and data['created_at']:
            data['created_at'] = data['created_at'].isoformat() if hasattr(data['created_at'], 'isoformat') else str(data['created_at'])
        if 'updated_at' in data and data['updated_at']:
            data['updated_at'] = data['updated_at'].isoformat() if hasattr(data['updated_at'], 'isoformat') else str(data['updated_at'])
        
        return data
    except Exception as e:
        print(f"Error getting presentation: {e}")
        raise
