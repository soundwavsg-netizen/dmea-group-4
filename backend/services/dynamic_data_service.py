"""
Service for managing dynamic marketing data with flexible schemas
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_client import db
from typing import List, Dict, Any, Optional
import uuid


class DynamicDataService:
    """Service for flexible data management with column mapping"""
    
    @staticmethod
    def save_table_data(username: str, module: str, data: Dict[str, Any]) -> bool:
        """
        Save complete table data (columns + rows)
        module: 'social_media' or 'search_marketing'
        """
        try:
            doc_ref = db.collection(f'{module}_dynamic_data').document(username)
            doc_ref.set({
                'username': username,
                'columns': data.get('columns', []),
                'rows': data.get('rows', []),
                'updated_at': data.get('updated_at', None)
            })
            return True
        except Exception as e:
            print(f"Error saving {module} data: {e}")
            return False
    
    @staticmethod
    def get_table_data(username: str, module: str) -> Dict[str, Any]:
        """Get complete table data"""
        try:
            doc = db.collection(f'{module}_dynamic_data').document(username).get()
            if doc.exists:
                return doc.to_dict()
            return {'columns': [], 'rows': [], 'username': username}
        except Exception as e:
            print(f"Error retrieving {module} data: {e}")
            return {'columns': [], 'rows': [], 'username': username}
    
    @staticmethod
    def save_column_mapping(username: str, module: str, mappings: Dict[str, str]) -> bool:
        """
        Save column mappings (which uploaded column maps to which system field)
        Example: {'platform': 'Column A', 'likes': 'Column B'}
        """
        try:
            doc_ref = db.collection(f'{module}_column_mappings').document(username)
            doc_ref.set({
                'username': username,
                'mappings': mappings
            })
            return True
        except Exception as e:
            print(f"Error saving {module} mappings: {e}")
            return False
    
    @staticmethod
    def get_column_mapping(username: str, module: str) -> Dict[str, str]:
        """Get column mappings"""
        try:
            doc = db.collection(f'{module}_column_mappings').document(username).get()
            if doc.exists:
                return doc.to_dict().get('mappings', {})
            return {}
        except Exception as e:
            print(f"Error retrieving {module} mappings: {e}")
            return {}
    
    @staticmethod
    def get_mapped_data(username: str, module: str) -> List[Dict[str, Any]]:
        """
        Get data with mapped column names applied
        Returns rows with system field names instead of user column names
        """
        try:
            # Get raw data
            table_data = DynamicDataService.get_table_data(username, module)
            rows = table_data.get('rows', [])
            
            # Get mappings
            mappings = DynamicDataService.get_column_mapping(username, module)
            
            if not mappings or not rows:
                return []
            
            # Apply mapping: transform row column names to system names
            mapped_rows = []
            for row in rows:
                mapped_row = {}
                for system_field, user_column in mappings.items():
                    if user_column in row:
                        mapped_row[system_field] = row[user_column]
                    else:
                        mapped_row[system_field] = None
                # Keep row ID if exists
                if 'id' in row:
                    mapped_row['id'] = row['id']
                mapped_rows.append(mapped_row)
            
            return mapped_rows
        except Exception as e:
            print(f"Error getting mapped {module} data: {e}")
            return []
