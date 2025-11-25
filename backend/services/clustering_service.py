"""
Clustering Service for Persona Generation
Implements vector creation with platform multipliers and K-Means clustering
"""
import numpy as np
from sklearn.cluster import KMeans
from typing import List, Dict, Any, Tuple
from collections import Counter, defaultdict

# Platform Multipliers (System A)
PLATFORM_MULTIPLIERS = {
    "Face to Face": 1.2,
    "Lazada": 1.0,
    "Shopee": 1.0,
    "Sephora": 1.0,
    "Xiaohongshu": 1.0,
    "Reddit": 1.0,
    "FB Group": 0.9,
    "YouTube": 0.9,
    "TikTok": 0.8,
    "Instagram": 0.8,
    "Blog": 0.8,
    "Other": 0.8
}


def get_platform_multiplier(platform: str) -> float:
    """Get platform multiplier for given platform"""
    return PLATFORM_MULTIPLIERS.get(platform, 1.0)


def normalize_strength(raw_strength: int, platform_multiplier: float) -> float:
    """
    Normalize strength score using the formula:
    normalized_value = (raw_strength / 20) * platform_multiplier
    
    Args:
        raw_strength: 0-100 slider value
        platform_multiplier: Platform weight
    
    Returns:
        Normalized value (typically 0-6 range)
    """
    return (raw_strength / 20.0) * platform_multiplier


def create_vector(insight: Dict[str, Any]) -> List[float]:
    """
    Create multi-dimensional vector from insight data.
    
    Vector structure:
    [M1_norm, M2_norm, ..., Mn_norm, P1_norm, P2_norm, ..., Pn_norm, Intent_norm, Influence_norm]
    
    Args:
        insight: Insight document with motivations, pains, purchase_intent, influencer_effect, platform
    
    Returns:
        Multi-dimensional vector
    """
    platform = insight.get('platform', 'Other')
    multiplier = get_platform_multiplier(platform)
    
    vector = []
    
    # Add normalized motivations
    motivations = insight.get('motivations', [])
    for motivation in motivations:
        strength = motivation.get('strength', 0)
        normalized = normalize_strength(strength, multiplier)
        vector.append(normalized)
    
    # Add normalized pains
    pains = insight.get('pains', [])
    for pain in pains:
        strength = pain.get('strength', 0)
        normalized = normalize_strength(strength, multiplier)
        vector.append(normalized)
    
    # Add normalized purchase intent
    intent = insight.get('purchase_intent', 0)
    vector.append(normalize_strength(intent, multiplier))
    
    # Add normalized influencer effect
    influence = insight.get('influencer_effect', 0)
    vector.append(normalize_strength(influence, multiplier))
    
    return vector


def pad_vectors(vectors: List[List[float]]) -> Tuple[np.ndarray, int]:
    """
    Pad vectors to same length (required for clustering)
    
    Args:
        vectors: List of vectors with potentially different lengths
    
    Returns:
        Tuple of (padded numpy array, max_length)
    """
    if not vectors:
        return np.array([]), 0
    
    max_length = max(len(v) for v in vectors)
    
    padded = []
    for vector in vectors:
        if len(vector) < max_length:
            # Pad with zeros
            padded_vector = vector + [0.0] * (max_length - len(vector))
        else:
            padded_vector = vector
        padded.append(padded_vector)
    
    return np.array(padded), max_length


def perform_clustering(insights: List[Dict[str, Any]], n_clusters: int = 3) -> Dict[str, Any]:
    """
    Perform K-Means clustering with cosine similarity
    
    Args:
        insights: List of insight documents
        n_clusters: Number of clusters (default 3)
    
    Returns:
        Dictionary containing cluster assignments and centers
    """
    if len(insights) < n_clusters:
        raise ValueError(f"Need at least {n_clusters} insights to create {n_clusters} clusters")
    
    # Create vectors for all insights
    vectors = []
    valid_insights = []
    
    for insight in insights:
        try:
            vector = create_vector(insight)
            if vector:  # Only include if vector was created successfully
                vectors.append(vector)
                valid_insights.append(insight)
        except Exception as e:
            print(f"Error creating vector for insight {insight.get('id')}: {e}")
            continue
    
    if len(vectors) < n_clusters:
        raise ValueError(f"Only {len(vectors)} valid vectors created, need at least {n_clusters}")
    
    # Pad vectors to same length
    vectors_array, max_length = pad_vectors(vectors)
    
    # Perform K-Means clustering with multiple restarts
    best_kmeans = None
    best_inertia = float('inf')
    
    for _ in range(5):  # 5 restarts
        kmeans = KMeans(n_clusters=n_clusters, random_state=None, n_init=1)
        kmeans.fit(vectors_array)
        
        if kmeans.inertia_ < best_inertia:
            best_inertia = kmeans.inertia_
            best_kmeans = kmeans
    
    # Assign cluster IDs to insights
    cluster_assignments = {}
    for i, insight in enumerate(valid_insights):
        cluster_id = int(best_kmeans.labels_[i])
        cluster_assignments[insight['id']] = {
            'cluster_id': f"cluster_{cluster_id}",
            'vector': vectors[i]
        }
    
    # Compute cluster centers
    cluster_centers = {}
    for i in range(n_clusters):
        cluster_centers[f"cluster_{i}"] = best_kmeans.cluster_centers_[i].tolist()
    
    return {
        'assignments': cluster_assignments,
        'centers': cluster_centers,
        'n_clusters': n_clusters,
        'inertia': best_inertia
    }


def compute_cluster_summary(insights: List[Dict[str, Any]], cluster_id: str) -> Dict[str, Any]:
    """
    Compute summary statistics for a cluster
    
    Args:
        insights: List of insights belonging to this cluster
        cluster_id: Cluster identifier
    
    Returns:
        Cluster summary with averaged scores
    """
    if not insights:
        return {}
    
    # Collect all motivation names and their normalized scores
    motivation_scores = defaultdict(list)
    pain_scores = defaultdict(list)
    intent_scores = []
    influence_scores = []
    
    for insight in insights:
        platform = insight.get('platform', 'Other')
        multiplier = get_platform_multiplier(platform)
        
        # Motivations
        for motivation in insight.get('motivations', []):
            name = motivation.get('name')
            strength = motivation.get('strength', 0)
            normalized = normalize_strength(strength, multiplier)
            motivation_scores[name].append(normalized)
        
        # Pains
        for pain in insight.get('pains', []):
            name = pain.get('name')
            strength = pain.get('strength', 0)
            normalized = normalize_strength(strength, multiplier)
            pain_scores[name].append(normalized)
        
        # Intent & Influence
        intent = insight.get('purchase_intent', 0)
        intent_scores.append(normalize_strength(intent, multiplier))
        
        influence = insight.get('influencer_effect', 0)
        influence_scores.append(normalize_strength(influence, multiplier))
    
    # Calculate averages
    avg_motivations = {name: np.mean(scores) for name, scores in motivation_scores.items()}
    avg_pains = {name: np.mean(scores) for name, scores in pain_scores.items()}
    avg_intent = np.mean(intent_scores) if intent_scores else 0
    avg_influence = np.mean(influence_scores) if influence_scores else 0
    
    return {
        'cluster_id': cluster_id,
        'avg_motivations': avg_motivations,
        'avg_pains': avg_pains,
        'avg_purchase_intent': float(avg_intent),
        'avg_influencer_effect': float(avg_influence),
        'insight_count': len(insights)
    }


def compute_tcss(wts_data: Dict[str, Any]) -> float:
    """
    Compute TCSS (Total Cluster Signal Strength) using corrected formula with averages.
    
    TCSS = (WTS_Motivation_Avg * 0.35) + (WTS_Pain_Avg * 0.35) + (WTS_Intent * 0.15) + (WTS_Influence * 0.15)
    
    Args:
        wts_data: Contains motivation_wts, pain_wts, avg_purchase_intent, avg_influencer_effect
    
    Returns:
        TCSS score (0-6 range)
    """
    # 1.1 Calculate WTS_Motivation_Avg
    motivation_wts_sum = sum(data['wts'] for data in wts_data['motivation_wts'].values())
    motivation_count = len(wts_data['motivation_wts']) if wts_data['motivation_wts'] else 0
    wts_motivation_avg = motivation_wts_sum / motivation_count if motivation_count > 0 else 0.0
    
    # 1.2 Calculate WTS_Pain_Avg  
    pain_wts_sum = sum(data['wts'] for data in wts_data['pain_wts'].values())
    pain_count = len(wts_data['pain_wts']) if wts_data['pain_wts'] else 0
    wts_pain_avg = pain_wts_sum / pain_count if pain_count > 0 else 0.0
    
    # 1.3 WTS_Intent (already averaged)
    wts_intent = wts_data.get('avg_purchase_intent', 0.0)
    
    # 1.4 WTS_Influence (already averaged)
    wts_influence = wts_data.get('avg_influencer_effect', 0.0)
    
    # 1.5 Final TCSS Formula
    tcss = (wts_motivation_avg * 0.35) + (wts_pain_avg * 0.35) + (wts_intent * 0.15) + (wts_influence * 0.15)
    
    return float(tcss)


def get_persona_threshold() -> float:
    """
    Get minimum TCSS threshold for persona creation from Firestore settings.
    Default: 2.0
    
    Returns:
        Minimum TCSS threshold
    """
    try:
        doc = db.collection('settings').document('persona_threshold').get()
        if doc.exists:
            return float(doc.to_dict().get('minimum_tcss', 2.0))
        else:
            # Create default setting
            db.collection('settings').document('persona_threshold').set({
                'minimum_tcss': 2.0,
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            })
            return 2.0
    except Exception as e:
        print(f"Error getting persona threshold: {e}")
        return 2.0


def set_persona_threshold(threshold: float) -> bool:
    """
    Set minimum TCSS threshold for persona creation.
    
    Args:
        threshold: New minimum TCSS (0.0-6.0)
    
    Returns:
        Success status
    """
    try:
        # Validate range
        threshold = max(0.0, min(6.0, float(threshold)))
        
        db.collection('settings').document('persona_threshold').set({
            'minimum_tcss': threshold,
            'updated_at': datetime.now(timezone.utc)
        }, merge=True)
        return True
    except Exception as e:
        print(f"Error setting persona threshold: {e}")
        return False


def compute_wts_classification(cluster_summary: Dict[str, Any], insights: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute WTS (Weighted Trait Score) classification for persona interpretation
    
    Formula for motivations/pains: WTS = (frequency% × avg_strength × platform_multiplier)
    Formula for intent/influence: Score = (avg_strength × platform_multiplier) [already applied]
    
    Args:
        cluster_summary: Averaged cluster scores
        insights: List of insights in cluster for frequency calculation
    
    Returns:
        WTS classifications and categories
    """
    total_insights = len(insights)
    
    # Calculate frequencies
    motivation_freq = defaultdict(int)
    pain_freq = defaultdict(int)
    
    for insight in insights:
        for motivation in insight.get('motivations', []):
            motivation_freq[motivation.get('name')] += 1
        for pain in insight.get('pains', []):
            pain_freq[pain.get('name')] += 1
    
    # Calculate WTS for motivations
    motivation_wts = {}
    for name, avg_score in cluster_summary.get('avg_motivations', {}).items():
        frequency_pct = motivation_freq[name] / total_insights
        wts = frequency_pct * avg_score
        
        # Classify
        if wts <= 1:
            category = "weak"
        elif wts <= 3:
            category = "strong"
        else:
            category = "dominant"
        
        motivation_wts[name] = {
            'wts': float(wts),
            'category': category,
            'frequency': motivation_freq[name],
            'avg_score': float(avg_score)
        }
    
    # Calculate WTS for pains
    pain_wts = {}
    for name, avg_score in cluster_summary.get('avg_pains', {}).items():
        frequency_pct = pain_freq[name] / total_insights
        wts = frequency_pct * avg_score
        
        # Classify
        if wts <= 1:
            category = "weak"
        elif wts <= 3:
            category = "strong"
        else:
            category = "dominant"
        
        pain_wts[name] = {
            'wts': float(wts),
            'category': category,
            'frequency': pain_freq[name],
            'avg_score': float(avg_score)
        }
    
    # Classify intent & influence (already normalized with multiplier)
    avg_intent = cluster_summary.get('avg_purchase_intent', 0)
    if avg_intent <= 2:
        intent_category = "weak"
    elif avg_intent <= 4:
        intent_category = "strong"
    else:
        intent_category = "dominant"
    
    avg_influence = cluster_summary.get('avg_influencer_effect', 0)
    if avg_influence <= 2:
        influence_category = "weak"
    elif avg_influence <= 4:
        influence_category = "strong"
    else:
        influence_category = "dominant"
    
    wts_result = {
        'motivation_wts': motivation_wts,
        'pain_wts': pain_wts,
        'intent_category': intent_category,
        'influence_category': influence_category,
        'avg_purchase_intent': float(avg_intent),
        'avg_influencer_effect': float(avg_influence)
    }
    
    # Calculate TCSS
    tcss = compute_tcss(wts_result)
    wts_result['tcss'] = tcss
    
    return wts_result


def paint_persona_profile(insights: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract frequency-based behavioral patterns from cluster insights (System B - Persona Painting)
    
    Args:
        insights: List of insights in the cluster
    
    Returns:
        Persona profile with top behaviours, channels, products, demographics, quotes
    """
    if not insights:
        return {}
    
    # Collect frequencies
    behaviour_freq = Counter()
    channel_freq = Counter()
    product_freq = Counter()
    quote_freq = Counter()
    
    # Demographics
    age_groups = []
    genders = []
    skin_types = []
    tones = []
    
    for insight in insights:
        # Behaviours
        for behaviour in insight.get('behaviours', []):
            behaviour_freq[behaviour] += 1
        
        # Channels
        for channel in insight.get('channels', []):
            channel_freq[channel] += 1
        
        # Products
        for product in insight.get('products', []):
            product_freq[product] += 1
        
        # Quote
        quote = insight.get('quote', '').strip()
        if quote:
            quote_freq[quote] += 1
        
        # Demographics
        age_groups.append(insight.get('age_group', ''))
        genders.append(insight.get('gender', ''))
        skin_types.append(insight.get('skin_type', ''))
        tones.append(insight.get('skin_tone', ''))
    
    # Get top items
    top_behaviours = [item for item, _ in behaviour_freq.most_common(2)]
    top_channels = [item for item, _ in channel_freq.most_common(2)]
    top_products = [item for item, _ in product_freq.most_common(3)]
    top_quotes = [item for item, _ in quote_freq.most_common(2)]
    
    # Mode for demographics
    demographic_profile = {
        'age_group': Counter(age_groups).most_common(1)[0][0] if age_groups else 'Unknown',
        'gender': Counter(genders).most_common(1)[0][0] if genders else 'Unknown',
        'skin_type': Counter(skin_types).most_common(1)[0][0] if skin_types else 'Unknown',
        'tone': Counter(tones).most_common(1)[0][0] if tones else 'Unknown'
    }
    
    return {
        'top_behaviours': top_behaviours,
        'top_channels': top_channels,
        'top_products': top_products,
        'representative_quotes': top_quotes,
        'demographic_profile': demographic_profile
    }
