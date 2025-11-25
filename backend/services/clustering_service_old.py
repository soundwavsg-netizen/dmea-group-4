from firebase_client import db
from collections import defaultdict
from typing import List, Dict, Any

class ClusteringService:
    
    @staticmethod
    def create_clusters() -> List[Dict[str, Any]]:
        """Group insights into clusters by demographic patterns"""
        # Fetch all insights
        insights = list(db.collection('insights').stream())
        
        if not insights:
            return []
        
        # Group by demographic combination
        clusters = defaultdict(list)
        
        for doc in insights:
            data = doc.to_dict()
            key = f"{data.get('age_group', 'Unknown')}|{data.get('skin_type', 'Unknown')}|{data.get('lifestyle', 'Unknown')}"
            clusters[key].append(data)
        
        # Calculate cluster metrics
        total_insights = len(insights)
        qualified_clusters = []
        
        # Use lenient thresholds for smaller datasets
        is_small_dataset = total_insights < 100
        threshold = 10.0 if is_small_dataset else 20.0
        
        for key, cluster_insights in clusters.items():
            percentage = (len(cluster_insights) / total_insights) * 100
            
            # Count high-scoring items (weighted_score ≥ 40)
            high_scoring_items = set()
            from utils import PLATFORM_WEIGHTS
            
            for insight in cluster_insights:
                method = insight.get('research_method', 'Other')
                weight = PLATFORM_WEIGHTS.get(method, 0.8)
                
                for mot in insight.get('motivations', []):
                    # Convert strength (0-100) to normalized (0-5) and calculate weighted score
                    normalized_strength = mot['strength'] / 20.0
                    weighted_score = normalized_strength * weight * 10  # Scale to comparable range
                    if weighted_score >= 40:
                        high_scoring_items.add(f"motivation:{mot['name']}")
                for pain in insight.get('pains', []):
                    # Convert strength (0-100) to normalized (0-5) and calculate weighted score
                    normalized_strength = pain['strength'] / 20.0
                    weighted_score = normalized_strength * weight * 10  # Scale to comparable range
                    if weighted_score >= 40:
                        high_scoring_items.add(f"pain:{pain['name']}")
            
            # Qualify if meets threshold and has high-scoring items
            if percentage >= threshold and len(high_scoring_items) >= 2:
                parts = key.split('|')
                qualified_clusters.append({
                    "key": key,
                    "age_group": parts[0],
                    "skin_type": parts[1],
                    "lifestyle": parts[2],
                    "insights": cluster_insights,
                    "percentage": percentage,
                    "size": len(cluster_insights),
                    "high_scoring_items": len(high_scoring_items)
                })
        
        # Fallback for small datasets
        if not qualified_clusters and is_small_dataset:
            from utils import PLATFORM_WEIGHTS
            for key, cluster_insights in sorted(
                clusters.items(),
                key=lambda x: len(x[1]),
                reverse=True
            )[:3]:
                high_scoring_items = set()
                for insight in cluster_insights:
                    method = insight.get('research_method', 'Other')
                    weight = PLATFORM_WEIGHTS.get(method, 0.8)
                    
                    for mot in insight.get('motivations', []):
                        # Convert strength (0-100) to normalized (0-5) and calculate weighted score
                        normalized_strength = mot['strength'] / 20.0
                        weighted_score = normalized_strength * weight * 10
                        if weighted_score >= 40:
                            high_scoring_items.add(f"motivation:{mot['name']}")
                    for pain in insight.get('pains', []):
                        # Convert strength (0-100) to normalized (0-5) and calculate weighted score
                        normalized_strength = pain['strength'] / 20.0
                        weighted_score = normalized_strength * weight * 10
                        if weighted_score >= 40:
                            high_scoring_items.add(f"pain:{pain['name']}")
                
                if len(high_scoring_items) >= 2:
                    parts = key.split('|')
                    percentage = (len(cluster_insights) / total_insights) * 100
                    qualified_clusters.append({
                        "key": key,
                        "age_group": parts[0],
                        "skin_type": parts[1],
                        "lifestyle": parts[2],
                        "insights": cluster_insights,
                        "percentage": percentage,
                        "size": len(cluster_insights),
                        "high_scoring_items": len(high_scoring_items)
                    })
        
        # Sort and return top 3
        qualified_clusters.sort(key=lambda x: x['size'], reverse=True)
        return qualified_clusters[:3]
