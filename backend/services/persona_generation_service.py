"""
Persona Generation Service
Orchestrates the complete persona generation workflow
"""
from typing import List, Dict, Any
from datetime import datetime, timezone
from firebase_client import db
import services.clustering_service as clustering
import random

# Persona name pools for generation
PERSONA_NAMES = [
    "Sarah", "Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia", "Charlotte",
    "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Avery",
    "Ella", "Scarlett", "Grace", "Chloe", "Victoria", "Riley", "Aria", "Lily",
    "Aubrey", "Zoey", "Penelope", "Lillian", "Addison", "Layla", "Natalie", "Camila"
]

# Animated image URLs (placeholder - can be replaced with actual GIFs/SVGs)
PERSONA_IMAGES = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&backgroundColor=d1d4f9",
]


def generate_persona_name(existing_names: List[str]) -> str:
    """Generate a unique persona name"""
    available = [name for name in PERSONA_NAMES if name not in existing_names]
    if not available:
        return f"Persona {len(existing_names) + 1}"
    return random.choice(available)


def generate_persona_image(index: int) -> str:
    """Get persona image URL"""
    return PERSONA_IMAGES[index % len(PERSONA_IMAGES)]


def generate_buying_trigger(motivation_wts: Dict[str, Any], intent_category: str) -> str:
    """Generate buying trigger description based on motivations and intent"""
    dominant_motivations = [name for name, data in motivation_wts.items() if data['category'] == 'dominant']
    strong_motivations = [name for name, data in motivation_wts.items() if data['category'] == 'strong']
    
    if intent_category == "dominant":
        if dominant_motivations:
            return f"Highly motivated by {', '.join(dominant_motivations[:2])}. Makes purchase decisions quickly when these needs are addressed."
        else:
            return "Strong purchase intent. Actively seeking solutions and ready to buy when the right product is presented."
    elif intent_category == "strong":
        if strong_motivations:
            return f"Influenced by {', '.join(strong_motivations[:2])}. Considers purchases carefully but converts when convinced of value."
        else:
            return "Moderate purchase intent. Needs some convincing and validation before making a purchase decision."
    else:
        return "Low purchase intent. Requires significant nurturing, education, and trust-building before converting."


def generate_summary_description(persona_profile: Dict[str, Any], wts_data: Dict[str, Any]) -> str:
    """Generate comprehensive persona summary"""
    demo = persona_profile.get('demographic_profile', {})
    age = demo.get('age_group', 'Unknown age')
    skin_type = demo.get('skin_type', 'unknown skin type')
    
    # Get dominant traits
    dominant_motivations = [name for name, data in wts_data['motivation_wts'].items() if data['category'] == 'dominant']
    dominant_pains = [name for name, data in wts_data['pain_wts'].items() if data['category'] == 'dominant']
    
    # Build description
    parts = [f"A {age} individual with {skin_type}"]
    
    if dominant_motivations:
        parts.append(f"primarily motivated by {', '.join(dominant_motivations[:2])}")
    
    if dominant_pains:
        parts.append(f"struggling with {', '.join(dominant_pains[:2])}")
    
    # Add channel preference
    channels = persona_profile.get('top_channels', [])
    if channels:
        parts.append(f"Active on {' and '.join(channels[:2])}")
    
    # Add intent context
    intent_cat = wts_data.get('intent_category', 'weak')
    if intent_cat == 'dominant':
        parts.append("with strong purchase intent and readiness to buy")
    elif intent_cat == 'strong':
        parts.append("showing moderate interest in purchasing solutions")
    
    return ". ".join(parts) + "."


def generate_personas_from_insights(n_clusters: int = 3) -> Dict[str, Any]:
    """
    Complete persona generation workflow
    
    Steps:
    1. Build vectors with platform multipliers
    2. Run K-Means clustering
    3. Assign cluster_ids to insights
    4. Compute cluster summaries
    5. Apply WTS classification
    6. Paint persona profiles (frequency analysis)
    7. Generate persona names & images
    8. Save personas to Firestore
    
    Args:
        n_clusters: Number of clusters/personas to create
    
    Returns:
        Generation result with statistics
    """
    try:
        # Step 1: Fetch all insights
        insights_ref = db.collection('insights')
        insights_docs = list(insights_ref.stream())
        
        if len(insights_docs) < n_clusters:
            return {
                'success': False,
                'message': f'Need at least {n_clusters} insights to generate {n_clusters} personas. Currently have {len(insights_docs)} insights.',
                'personas_created': 0
            }
        
        # Convert to dict format
        insights = []
        for doc in insights_docs:
            data = doc.to_dict()
            data['id'] = doc.id
            insights.append(data)
        
        print(f"Processing {len(insights)} insights...")
        
        # Step 2 & 3: Perform clustering
        clustering_result = clustering.perform_clustering(insights, n_clusters)
        
        # Step 4: Update insights with cluster_id and vector
        batch = db.batch()
        for insight_id, assignment in clustering_result['assignments'].items():
            insight_ref = insights_ref.document(insight_id)
            batch.update(insight_ref, {
                'cluster_id': assignment['cluster_id'],
                'vector': assignment['vector']
            })
        batch.commit()
        print(f"Updated {len(clustering_result['assignments'])} insights with cluster assignments")
        
        # Step 5-8: Generate personas for each cluster
        personas_created = []
        existing_names = []
        
        # Clear old personas
        old_personas = db.collection('personas').stream()
        for doc in old_personas:
            doc.reference.delete()
        
        # Clear old clusters
        old_clusters = db.collection('clusters').stream()
        for doc in old_clusters:
            doc.reference.delete()
        
        for cluster_idx in range(n_clusters):
            cluster_id = f"cluster_{cluster_idx}"
            
            # Get insights for this cluster
            cluster_insights = [
                insight for insight in insights
                if clustering_result['assignments'].get(insight['id'], {}).get('cluster_id') == cluster_id
            ]
            
            if not cluster_insights:
                print(f"No insights for {cluster_id}, skipping...")
                continue
            
            print(f"Processing {cluster_id} with {len(cluster_insights)} insights...")
            
            # Step 5: Compute cluster summary
            cluster_summary = clustering.compute_cluster_summary(cluster_insights, cluster_id)
            
            # Step 6: Compute WTS classification
            wts_data = clustering.compute_wts_classification(cluster_summary, cluster_insights)
            
            # Step 7: Paint persona profile (frequency-based)
            persona_profile = clustering.paint_persona_profile(cluster_insights)
            
            # Step 8: Generate persona fields
            persona_name = generate_persona_name(existing_names)
            existing_names.append(persona_name)
            
            persona_image = generate_persona_image(cluster_idx)
            
            # Get dominant motivations and pains for persona
            dominant_motivations = [
                name for name, data in wts_data['motivation_wts'].items()
                if data['category'] in ['dominant', 'strong']
            ]
            dominant_pains = [
                name for name, data in wts_data['pain_wts'].items()
                if data['category'] in ['dominant', 'strong']
            ]
            
            buying_trigger = generate_buying_trigger(
                wts_data['motivation_wts'],
                wts_data['intent_category']
            )
            
            summary_description = generate_summary_description(persona_profile, wts_data)
            
            # Create persona document
            persona_data = {
                'name': persona_name,
                'persona_animated_image_url': persona_image,
                'cluster_id': cluster_id,
                
                # WTS-based traits
                'dominant_motivations': sorted(dominant_motivations, 
                    key=lambda x: wts_data['motivation_wts'][x]['wts'], 
                    reverse=True)[:5],
                'dominant_pain_points': sorted(dominant_pains,
                    key=lambda x: wts_data['pain_wts'][x]['wts'],
                    reverse=True)[:5],
                'intent_category': wts_data['intent_category'],
                'influence_category': wts_data['influence_category'],
                
                # Frequency-based traits
                'behaviour_patterns': persona_profile.get('top_behaviours', []),
                'channel_preference': persona_profile.get('top_channels', []),
                'top_products': persona_profile.get('top_products', []),
                'demographic_profile': persona_profile.get('demographic_profile', {}),
                'representative_quotes': persona_profile.get('representative_quotes', []),
                
                # Generated descriptions
                'buying_trigger': buying_trigger,
                'summary_description': summary_description,
                
                # Metadata
                'created_at': datetime.now(timezone.utc).isoformat(),
                'insight_count': len(cluster_insights),
                
                # Editable flag
                'is_editable': True
            }
            
            # Save persona to Firestore
            persona_ref = db.collection('personas').document(cluster_id)
            persona_ref.set(persona_data)
            personas_created.append(persona_name)
            
            # Save cluster summary
            cluster_data = {
                'cluster_id': cluster_id,
                'center': clustering_result['centers'][cluster_id],
                'summary': cluster_summary,
                'wts_classification': wts_data,
                'persona_profile': persona_profile,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            db.collection('clusters').document(cluster_id).set(cluster_data)
        
        return {
            'success': True,
            'message': f'Successfully generated {len(personas_created)} personas',
            'personas_created': len(personas_created),
            'persona_names': personas_created,
            'insights_processed': len(insights),
            'clusters_created': n_clusters
        }
        
    except Exception as e:
        print(f"Error in persona generation: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'message': f'Error generating personas: {str(e)}',
            'personas_created': 0
        }
