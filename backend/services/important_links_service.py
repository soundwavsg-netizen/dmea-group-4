"""
Service for managing important links
"""
from firebase_client import db
from datetime import datetime, timezone
from typing import List, Dict, Any
import uuid


class ImportantLinksService:
    """Service for important links CRUD operations"""
    
    @staticmethod
    def create_link(title: str, url: str, description: str = "", icon: str = "link", created_by: str = "superadmin") -> Dict[str, Any]:
        """Create a new important link (Superadmin only)"""
        link_id = str(uuid.uuid4())
        
        # Get current max order
        existing_links = list(db.collection('important_links').stream())
        max_order = 0
        for link in existing_links:
            link_order = link.to_dict().get('order', 0)
            if link_order > max_order:
                max_order = link_order
        
        link_data = {
            "id": link_id,
            "title": title,
            "url": url,
            "description": description,
            "icon": icon,
            "createdBy": created_by,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "order": max_order + 1
        }
        
        db.collection('important_links').document(link_id).set(link_data)
        return link_data
    
    @staticmethod
    def get_all_links() -> List[Dict[str, Any]]:
        """Get all links ordered by order field"""
        links = []
        link_docs = list(db.collection('important_links').stream())
        
        for doc in link_docs:
            link_data = doc.to_dict()
            link_data['id'] = doc.id
            
            # Ensure order field exists
            if 'order' not in link_data:
                link_data['order'] = 0
            
            links.append(link_data)
        
        # Sort by order field
        links.sort(key=lambda x: x.get('order', 0))
        
        return links
    
    @staticmethod
    def get_link_by_id(link_id: str) -> Dict[str, Any]:
        """Get a single link by ID"""
        doc = db.collection('important_links').document(link_id).get()
        if not doc.exists:
            raise ValueError(f"Link with ID {link_id} not found")
        
        link_data = doc.to_dict()
        link_data['id'] = doc.id
        return link_data
    
    @staticmethod
    def update_link(link_id: str, title: str = None, url: str = None, description: str = None, icon: str = None) -> Dict[str, Any]:
        """Update a link (Superadmin only)"""
        link_ref = db.collection('important_links').document(link_id)
        link_doc = link_ref.get()
        
        if not link_doc.exists:
            raise ValueError(f"Link with ID {link_id} not found")
        
        update_data = {}
        if title:
            update_data["title"] = title
        if url:
            update_data["url"] = url
        if description is not None:
            update_data["description"] = description
        if icon:
            update_data["icon"] = icon
        
        link_ref.update(update_data)
        
        # Return updated link
        updated_doc = link_ref.get()
        link_data = updated_doc.to_dict()
        link_data['id'] = link_id
        return link_data
    
    @staticmethod
    def delete_link(link_id: str) -> bool:
        """Delete a link (Superadmin only)"""
        db.collection('important_links').document(link_id).delete()
        return True
    
    @staticmethod
    def reorder_link(link_id: str, direction: str) -> bool:
        """Move link up or down in order (Superadmin only)"""
        links = ImportantLinksService.get_all_links()
        
        # Find current link
        current_index = None
        for i, link in enumerate(links):
            if link['id'] == link_id:
                current_index = i
                break
        
        if current_index is None:
            return False
        
        # Determine swap index
        if direction == 'up' and current_index > 0:
            swap_index = current_index - 1
        elif direction == 'down' and current_index < len(links) - 1:
            swap_index = current_index + 1
        else:
            return False  # Can't move
        
        # Swap order values
        current_order = links[current_index].get('order', current_index)
        swap_order = links[swap_index].get('order', swap_index)
        
        db.collection('important_links').document(link_id).update({'order': swap_order})
        db.collection('important_links').document(links[swap_index]['id']).update({'order': current_order})
        
        return True
