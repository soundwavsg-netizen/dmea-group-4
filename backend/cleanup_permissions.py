"""
Cleanup script to:
1. Remove duplicate old modules (social_media, analytics, seo_content, final_capstone)
2. Add missing actions to important_links
3. Keep only the correct module names
"""
from firebase_client import db
from models_permissions import DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS

def cleanup_user_permissions():
    """
    Clean up all user permissions
    """
    users = [
        {"username": "admin", "role": "admin"},
        {"username": "admin2", "role": "admin"},
        {"username": "user1", "role": "user"},
        {"username": "user2", "role": "user"},
        {"username": "anthony", "role": "user"},
        {"username": "chris", "role": "user"},
        {"username": "jessica", "role": "user"},
        {"username": "tasha", "role": "user"},
        {"username": "drgu", "role": "user"},
        {"username": "juliana", "role": "user"},
        {"username": "shannon", "role": "user"},
        {"username": "munifah", "role": "user"},
    ]
    
    permissions_ref = db.collection('user_permissions')
    
    # Modules to remove (old names)
    modules_to_remove = ['social_media', 'analytics', 'seo_content', 'final_capstone']
    
    for user_info in users:
        username = user_info["username"]
        role = user_info["role"]
        
        print(f"\nProcessing {username} ({role})...")
        
        doc = permissions_ref.document(username).get()
        if not doc.exists:
            print(f"  ⏭️  Skipping (no custom permissions)")
            continue
        
        existing = doc.to_dict()
        modules = existing.get('modules', {})
        
        # Remove old duplicate modules
        removed = []
        for module_to_remove in modules_to_remove:
            if module_to_remove in modules:
                del modules[module_to_remove]
                removed.append(module_to_remove)
        
        if removed:
            print(f"  🗑️  Removed old modules: {', '.join(removed)}")
        
        # Add missing important_links actions if needed
        if 'important_links' in modules:
            if not modules['important_links'].get('actions'):
                modules['important_links']['actions'] = {
                    "add": False,
                    "edit": False,
                    "delete": False
                }
                print(f"  ✅ Added actions to important_links")
            else:
                # Ensure all actions exist
                actions = modules['important_links']['actions']
                updated = False
                for action in ['add', 'edit', 'delete']:
                    if action not in actions:
                        actions[action] = False
                        updated = True
                if updated:
                    print(f"  ✅ Updated important_links actions")
        
        # Save back to Firestore
        permissions_ref.document(username).set({
            'username': username,
            'role': role,
            'modules': modules
        })
        print(f"  ✅ Cleaned up permissions")

if __name__ == "__main__":
    print("=" * 60)
    print("PERMISSION CLEANUP SCRIPT")
    print("=" * 60)
    print("\nThis script will:")
    print("1. Remove old duplicate modules (social_media, analytics, etc.)")
    print("2. Add missing important_links actions")
    print("3. Keep only the correct diagnostic module names")
    print("=" * 60)
    
    cleanup_user_permissions()
    
    print("\n" + "=" * 60)
    print("✅ CLEANUP COMPLETE")
    print("=" * 60)
