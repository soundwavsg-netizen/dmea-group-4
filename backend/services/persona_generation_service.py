"""
Persona Generation Service
Orchestrates the complete persona generation workflow
"""
from typing import List, Dict, Any
from datetime import datetime, timezone
from firebase_client import db
import services.clustering_service as clustering
import random

# Beauty-themed persona images (VERIFIED female portraits only - NO male, NO products)
# All images manually verified to be female human faces with beauty/makeup focus
PERSONA_IMAGES = {
    'female_young': [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80",  # Young woman portrait
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80",  # Natural beauty portrait
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&q=80",  # Fresh face portrait
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop&q=80",  # Glam portrait
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&q=80",  # Trendy portrait
    ],
    'female_adult': [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80",  # Professional woman
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80",  # Sophisticated portrait
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80",  # Elegant woman
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&q=80",  # Classic beauty
        "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=400&h=400&fit=crop&q=80",  # Mature elegance
        "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=400&h=400&fit=crop&q=80",  # Professional glam
    ],
    'neutral': [
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&q=80",  # Soft portrait
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&q=80",  # Clean portrait
        "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=400&fit=crop&q=80",  # Simple beauty
    ]
}


def generate_persona_name(persona_profile: Dict[str, Any], motivation_wts: Dict[str, Any]) -> str:
    """
    Generate a descriptive role-based persona name (NOT a human name)
    
    Examples: "The Trend-Seeking Student", "The Pro Makeup Artist", "The Budget Beauty Explorer"
    
    Args:
        persona_profile: Contains demographics, behaviours, channels
        motivation_wts: Contains dominant motivations
    
    Returns:
        A 2-5 word descriptive title
    """
    # Get key traits
    age_group = persona_profile.get('demographic_profile', {}).get('age_group', '').lower()
    behaviours = persona_profile.get('top_behaviours', [])
    channels = persona_profile.get('top_channels', [])
    
    # Get dominant motivation
    dominant_motivations = [name for name, data in motivation_wts.items() if data['category'] == 'dominant']
    strong_motivations = [name for name, data in motivation_wts.items() if data['category'] == 'strong']
    
    top_motivation = (dominant_motivations[0] if dominant_motivations else 
                     strong_motivations[0] if strong_motivations else 'Beauty')
    
    # Adjective mapping based on traits
    adjectives = []
    
    # Age-based
    if '18-25' in age_group or 'under 25' in age_group:
        adjectives.extend(['Trend-Seeking', 'Student', 'Young', 'Emerging'])
    elif '26-35' in age_group:
        adjectives.extend(['Professional', 'Career-Focused', 'Established'])
    elif '36-45' in age_group or '45+' in age_group:
        adjectives.extend(['Experienced', 'Mature', 'Sophisticated'])
    
    # Behaviour-based
    if behaviours:
        behaviour_lower = ' '.join(behaviours).lower()
        if 'research' in behaviour_lower or 'read' in behaviour_lower:
            adjectives.append('Research-Driven')
        if 'compare' in behaviour_lower or 'price' in behaviour_lower:
            adjectives.append('Budget-Conscious')
        if 'try' in behaviour_lower or 'experiment' in behaviour_lower:
            adjectives.append('Experimental')
        if 'share' in behaviour_lower or 'review' in behaviour_lower:
            adjectives.append('Influential')
    
    # Channel-based
    if channels:
        channel_lower = ' '.join(channels).lower()
        if 'tiktok' in channel_lower or 'instagram' in channel_lower:
            adjectives.append('Social Media')
        if 'youtube' in channel_lower:
            adjectives.append('Content Creator')
        if 'shopee' in channel_lower or 'lazada' in channel_lower:
            adjectives.append('Online Shopper')
    
    # Motivation-based noun
    noun_mapping = {
        'quality': 'Quality Seeker',
        'effectiveness': 'Results Hunter',
        'affordability': 'Budget Explorer',
        'convenience': 'Convenience Lover',
        'innovation': 'Innovation Chaser',
        'brand': 'Brand Loyalist',
        'natural': 'Natural Beauty Advocate',
        'trendy': 'Trendsetter',
        'professional': 'Pro User',
        'recommendation': 'Community Follower'
    }
    
    noun = 'Beauty Enthusiast'
    for key, value in noun_mapping.items():
        if key.lower() in top_motivation.lower():
            noun = value
            break
    
    # Build name
    if adjectives:
        adjective = random.choice(adjectives[:3])  # Pick from top 3 traits
        return f"The {adjective} {noun}"
    else:
        return f"The {noun}"


def generate_persona_image(demographic_profile: Dict[str, str], index: int) -> str:
    """
    Get persona image URL based on age group (female-focused for MUFE beauty)
    
    Args:
        demographic_profile: Contains age_group and gender
        index: Fallback index for variety
    
    Returns:
        Avatar URL matching demographics (female beauty images)
    """
    age_group = demographic_profile.get('age_group', '').lower()
    
    # Determine age category
    is_young = ('18-25' in age_group or 'under 25' in age_group or 
                '18' in age_group or '20' in age_group or '21' in age_group or '22' in age_group)
    
    # Select appropriate female beauty image set (95% of users are female)
    if is_young:
        image_set = PERSONA_IMAGES['female_young']
    elif age_group and age_group != 'unknown':
        image_set = PERSONA_IMAGES['female_adult']
    else:
        # Default to neutral if no age info
        image_set = PERSONA_IMAGES['neutral']
    
    # Return image from appropriate set
    return image_set[index % len(image_set)]


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
            
            # Step 6: Compute WTS classification and TCSS
            wts_data = clustering.compute_wts_classification(cluster_summary, cluster_insights)
            tcss = wts_data['tcss']
            
            # Check TCSS threshold - skip persona creation if below threshold
            threshold = clustering.get_persona_threshold()
            if tcss < threshold:
                print(f"Cluster {cluster_id} TCSS ({tcss:.2f}) below threshold ({threshold:.2f}), skipping persona creation")
                continue
            
            # Step 7: Paint persona profile (frequency-based)
            persona_profile = clustering.paint_persona_profile(cluster_insights)
            
            # Step 8: Generate persona fields
            persona_name = generate_persona_name(persona_profile, wts_data['motivation_wts'])
            existing_names.append(persona_name)
            
            # Generate image based on demographics
            persona_image = generate_persona_image(
                persona_profile.get('demographic_profile', {}),
                cluster_idx
            )
            
            # Get dominant motivations and pains for persona
            dominant_motivations = [
                name for name, data in wts_data['motivation_wts'].items()
                if data['category'] in ['dominant', 'strong']
            ]
            dominant_pains = [
                name for name, data in wts_data['pain_wts'].items()
                if data['category'] in ['dominant', 'strong']
            ]
            
            # SAFETY CHECK: Ensure at least 1 motivation and 1 pain
            if not dominant_motivations and wts_data['motivation_wts']:
                # Fallback: Get motivation with highest frequency
                all_motivations = sorted(
                    wts_data['motivation_wts'].items(),
                    key=lambda x: x[1]['frequency'],
                    reverse=True
                )
                if all_motivations:
                    dominant_motivations = [all_motivations[0][0]]
            
            if not dominant_pains and wts_data['pain_wts']:
                # Fallback: Get pain with highest frequency
                all_pains = sorted(
                    wts_data['pain_wts'].items(),
                    key=lambda x: x[1]['frequency'],
                    reverse=True
                )
                if all_pains:
                    dominant_pains = [all_pains[0][0]]
            
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
                
                # TCSS and ranking data
                'tcss': float(tcss),
                'is_star_persona': False,  # Will be set later
                
                # Metadata
                'created_at': datetime.now(timezone.utc).isoformat(),
                'insight_count': len(cluster_insights),
                'avg_purchase_intent': float(wts_data['avg_purchase_intent']),
                'avg_influencer_effect': float(wts_data['avg_influencer_effect']),
                
                # Editable flag
                'is_editable': True
            }
            
            # Add to list for star persona selection
            personas_data.append({
                'cluster_id': cluster_id,
                'data': persona_data,
                'tcss': tcss,
                'wts_intent': wts_data['avg_purchase_intent'],
                'wts_motivation_avg': sum(data['wts'] for data in wts_data['motivation_wts'].values()) / len(wts_data['motivation_wts']) if wts_data['motivation_wts'] else 0,
                'wts_pain_avg': sum(data['wts'] for data in wts_data['pain_wts'].values()) / len(wts_data['pain_wts']) if wts_data['pain_wts'] else 0
            })
        
        # Determine Star Persona (highest TCSS with tie-breakers)
        if personas_data:
            # Sort by TCSS (desc), then by tie-breakers
            personas_data.sort(key=lambda x: (
                -x['tcss'],  # Higher TCSS first
                -x['wts_intent'],  # Higher intent second  
                -x['wts_motivation_avg'],  # Higher motivation third
                -x['wts_pain_avg']  # Higher pain fourth
            ))
            
            # Mark the first one as star persona
            personas_data[0]['data']['is_star_persona'] = True
            print(f"Star Persona: {personas_data[0]['data']['name']} (TCSS: {personas_data[0]['tcss']:.2f})")
        
        # Save all personas to Firestore
        for persona_info in personas_data:
            persona_ref = db.collection('personas').document(persona_info['cluster_id'])
            persona_ref.set(persona_info['data'])
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
