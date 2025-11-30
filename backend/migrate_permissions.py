"""
Migration script to update all user permissions to the complete structure
This ensures all users have the same permission toggles in the Admin Panel
"""
from firebase_client import db
from models_permissions import DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS, SUPERADMIN_PERMISSIONS
import json

def migrate_user_permissions():
    """
    Migrate all users to have complete permission structure
    """
    # List of all users
    users = [
        {"username": "superadmin", "role": "superadmin"},
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
    
    for user_info in users:
        username = user_info["username"]
        role = user_info["role"]
        
        print(f"\nProcessing {username} ({role})...")
        
        # Skip superadmin - they don't need custom permissions in Firestore
        if role == "superadmin":
            print(f"  ⏭️  Skipping superadmin (uses hardcoded full permissions)")
            continue
        
        # Get the correct template based on role
        if role == "admin":
            template = ADMIN_PERMISSIONS
        else:
            template = DEFAULT_PERMISSIONS
        
        # Check if user has existing permissions
        doc = permissions_ref.document(username).get()
        
        if doc.exists:
            # User has custom permissions - merge with template structure
            existing = doc.to_dict()
            existing_modules = existing.get('modules', {})
            
            # Start with template (complete structure)
            updated_modules = {}
            for module_name, module_perm in template.items():
                module_dict = module_perm.dict()
                
                # If user has existing settings for this module, preserve their enabled/disabled choices
                if module_name in existing_modules:
                    existing_module = existing_modules[module_name]
                    
                    # Preserve the enabled status
                    module_dict['enabled'] = existing_module.get('enabled', module_dict['enabled'])
                    
                    # Preserve existing tab settings (but add any missing tabs from template)
                    for tab_name in module_dict['tabs'].keys():
                        if tab_name in existing_module.get('tabs', {}):
                            module_dict['tabs'][tab_name] = existing_module['tabs'][tab_name]
                    
                    # Preserve existing action settings (but add any missing actions from template)
                    for action_name in module_dict['actions'].keys():
                        if action_name in existing_module.get('actions', {}):
                            module_dict['actions'][action_name] = existing_module['actions'][action_name]
                
                updated_modules[module_name] = module_dict
            
            # Update Firestore
            permissions_ref.document(username).set({
                'username': username,
                'role': role,
                'modules': updated_modules
            })
            print(f"  ✅ Updated existing permissions with complete structure")
            
        else:
            # User has no custom permissions - create from template
            modules_dict = {}
            for module_name, module_perm in template.items():
                modules_dict[module_name] = module_perm.dict()
            
            permissions_ref.document(username).set({
                'username': username,
                'role': role,
                'modules': modules_dict
            })
            print(f"  ✅ Created new permissions from template")

if __name__ == "__main__":
    print("=" * 60)
    print("PERMISSION MIGRATION SCRIPT")
    print("=" * 60)
    print("\nThis script will:")
    print("1. Ensure all users have the complete permission structure")
    print("2. Preserve existing enabled/disabled choices")
    print("3. Add any missing tabs/actions from the template")
    print("\nBased on 'chris' account template structure")
    print("=" * 60)
    
    migrate_user_permissions()
    
    print("\n" + "=" * 60)
    print("✅ MIGRATION COMPLETE")
    print("=" * 60)
