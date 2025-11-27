import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_client import db
from collections import defaultdict
from typing import Dict, List, Any
from utils import PLATFORM_WEIGHTS

class ScoringService:
    
    @staticmethod
    def compute_raw_scores() -> Dict[str, Any]:
        """Compute RAW scores for Report Page (no platform weights, no WTS)"""
        # Fetch all insights
        insights = list(db.collection('insights').stream())
        
        if not insights:
            return {}
        
        # Initialize trackers
        motivation_raw_scores = defaultdict(float)  # Sum of normalized strengths
        pain_raw_scores = defaultdict(float)  # Sum of normalized strengths
        purchase_intents = []
        influencer_effects = []
        behaviour_counts = defaultdict(int)
        channel_counts = defaultdict(int)
        product_counts = defaultdict(int)
        platform_counts = defaultdict(int)  # NEW: Count insights per platform
        
        # Demographics
        age_groups = defaultdict(int)
        genders = defaultdict(int)
        skin_types = defaultdict(int)
        skin_tones = defaultdict(int)
        lifestyles = defaultdict(int)
        
        # Process each insight
        for doc in insights:
            data = doc.to_dict()
            
            # Count platform (where insight was collected)
            platform = data.get('platform', 'Other')
            platform_counts[platform] += 1
            
            # Motivations - RAW SCORE = sum of (strength / 20)
            for mot in data.get('motivations', []):
                name = mot['name']
                normalized_strength = mot['strength'] / 20.0  # 0-100 → 0-5
                motivation_raw_scores[name] += normalized_strength
            
            # Pains - RAW SCORE = sum of (strength / 20)
            for pain in data.get('pains', []):
                name = pain['name']
                normalized_strength = pain['strength'] / 20.0  # 0-100 → 0-5
                pain_raw_scores[name] += normalized_strength
            
            # Behaviours
            for behaviour in data.get('behaviours', []):
                behaviour_counts[behaviour] += 1
            
            # Channels (where user researches, not where we collected)
            for channel in data.get('channels', []):
                channel_counts[channel] += 1
            
            # Products
            for product in data.get('products', []):
                product_counts[product] += 1
            
            # Demographics
            age_groups[data.get('age_group', 'Unknown')] += 1
            genders[data.get('gender', 'Unknown')] += 1
            skin_types[data.get('skin_type', 'Unknown')] += 1
            skin_tones[data.get('skin_tone', 'Unknown')] += 1
            lifestyles[data.get('lifestyle', 'Unknown')] += 1
            
            # Intent and effect (keep as 0-100 for averages)
            purchase_intents.append(data.get('purchase_intent', 0))
            influencer_effects.append(data.get('influencer_effect', 0))
        
        # Sort motivations by raw score
        top_motivations = sorted(
            motivation_raw_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        # Sort pains by raw score
        top_pains = sorted(
            pain_raw_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        # Format results
        top_motivations_formatted = [
            (name, {"score": round(score, 2)}) for name, score in top_motivations
        ]
        
        top_pains_formatted = [
            (name, {"score": round(score, 2)}) for name, score in top_pains
        ]
        
        # Calculate averages
        avg_purchase_intent = sum(purchase_intents) / len(purchase_intents) if purchase_intents else 0
        avg_influencer_effect = sum(influencer_effects) / len(influencer_effects) if influencer_effects else 0
        
        # Intent/Influence distributions (group into ranges)
        intent_distribution = {}
        for intent in purchase_intents:
            bucket = f"{(intent // 20) * 20}-{((intent // 20) + 1) * 20}"
            intent_distribution[bucket] = intent_distribution.get(bucket, 0) + 1
        
        influence_distribution = {}
        for effect in influencer_effects:
            bucket = f"{(effect // 20) * 20}-{((effect // 20) + 1) * 20}"
            influence_distribution[bucket] = influence_distribution.get(bucket, 0) + 1
        
        return {
            'total_insights': len(insights),
            'top_motivations': top_motivations_formatted,
            'top_pains': top_pains_formatted,
            'demographics': {
                'age_groups': dict(age_groups),
                'genders': dict(genders),
                'skin_types': dict(skin_types),
                'skin_tones': dict(skin_tones),
                'lifestyles': dict(lifestyles)
            },
            'behaviour_counts': dict(behaviour_counts),
            'channel_counts': dict(channel_counts),
            'product_counts': dict(product_counts),
            'platform_counts': dict(platform_counts),  # NEW: Platform counts
            'avg_purchase_intent': round(avg_purchase_intent, 1),
            'avg_influencer_effect': round(avg_influencer_effect, 1),
            'intent_distribution': intent_distribution,
            'influence_distribution': influence_distribution
        }
    
    @staticmethod
    def compute_scores() -> Dict[str, Any]:
        """Compute weighted scores for Persona Generation (with platform weights)"""
        # Fetch all insights
        insights = list(db.collection('insights').stream())
        
        if not insights:
            return {}
        
        # Initialize trackers
        motivation_scores = defaultdict(lambda: {
            "frequency": 0,
            "total_strength": 0,
            "total_weight": 0
        })
        pain_scores = defaultdict(lambda: {
            "frequency": 0,
            "total_strength": 0,
            "total_weight": 0
        })
        purchase_intents = []
        influencer_effects = []
        behaviour_counts = defaultdict(int)
        channel_counts = defaultdict(int)
        product_counts = defaultdict(int)
        
        # Demographics
        age_groups = defaultdict(int)
        genders = defaultdict(int)
        skin_types = defaultdict(int)
        skin_tones = defaultdict(int)
        lifestyles = defaultdict(int)
        
        # Process each insight
        for doc in insights:
            data = doc.to_dict()
            platform = data.get('platform', 'Other')
            weight = PLATFORM_WEIGHTS.get(platform, 0.8)
            
            # Motivations (normalize by dividing by 20)
            for mot in data.get('motivations', []):
                name = mot['name']
                strength = mot['strength'] / 20.0  # Normalize 0-100 to 0-5
                motivation_scores[name]['frequency'] += 1
                motivation_scores[name]['total_strength'] += strength
                motivation_scores[name]['total_weight'] += weight
            
            # Pains (normalize by dividing by 20)
            for pain in data.get('pains', []):
                name = pain['name']
                strength = pain['strength'] / 20.0  # Normalize 0-100 to 0-5
                pain_scores[name]['frequency'] += 1
                pain_scores[name]['total_strength'] += strength
                pain_scores[name]['total_weight'] += weight
            
            # Behaviours
            for behaviour in data.get('behaviours', []):
                behaviour_counts[behaviour] += 1
            
            # Channels
            for channel in data.get('channels', []):
                channel_counts[channel] += 1
            
            # Products
            for product in data.get('products', []):
                product_counts[product] += 1
            
            # Demographics
            age_groups[data.get('age_group', 'Unknown')] += 1
            genders[data.get('gender', 'Unknown')] += 1
            skin_types[data.get('skin_type', 'Unknown')] += 1
            skin_tones[data.get('skin_tone', 'Unknown')] += 1
            lifestyles[data.get('lifestyle', 'Unknown')] += 1
            
            # Intent and effect (normalize by dividing by 20)
            purchase_intents.append(data.get('purchase_intent', 0) / 20.0)
            influencer_effects.append(data.get('influencer_effect', 0) / 20.0)
        
        # Calculate weighted scores
        motivation_results = {}
        for name, data in motivation_scores.items():
            avg_strength = data['total_strength'] / data['frequency']
            avg_weight = data['total_weight'] / data['frequency']
            score = data['frequency'] * avg_strength * avg_weight
            motivation_results[name] = {
                "frequency": data['frequency'],
                "avg_strength": avg_strength,
                "avg_weight": avg_weight,
                "score": score
            }
        
        pain_results = {}
        for name, data in pain_scores.items():
            avg_strength = data['total_strength'] / data['frequency']
            avg_weight = data['total_weight'] / data['frequency']
            score = data['frequency'] * avg_strength * avg_weight
            pain_results[name] = {
                "frequency": data['frequency'],
                "avg_strength": avg_strength,
                "avg_weight": avg_weight,
                "score": score
            }
        
        # Sort by score
        top_motivations = sorted(
            motivation_results.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )[:10]
        
        top_pains = sorted(
            pain_results.items(),
            key=lambda x: x[1]['score'],
            reverse=True
        )[:10]
        
        # Intent/effect distributions
        intent_distribution = {
            "0-20": sum(1 for i in purchase_intents if 0 <= i <= 20),
            "21-40": sum(1 for i in purchase_intents if 21 <= i <= 40),
            "41-60": sum(1 for i in purchase_intents if 41 <= i <= 60),
            "61-80": sum(1 for i in purchase_intents if 61 <= i <= 80),
            "81-100": sum(1 for i in purchase_intents if 81 <= i <= 100)
        }
        
        influence_distribution = {
            "0-20": sum(1 for i in influencer_effects if 0 <= i <= 20),
            "21-40": sum(1 for i in influencer_effects if 21 <= i <= 40),
            "41-60": sum(1 for i in influencer_effects if 41 <= i <= 60),
            "61-80": sum(1 for i in influencer_effects if 61 <= i <= 80),
            "81-100": sum(1 for i in influencer_effects if 81 <= i <= 100)
        }
        
        return {
            "total_insights": len(insights),
            "motivation_scores": motivation_results,
            "pain_scores": pain_results,
            "top_motivations": top_motivations,
            "top_pains": top_pains,
            "behaviour_counts": dict(behaviour_counts),
            "channel_counts": dict(channel_counts),
            "product_counts": dict(product_counts),
            "demographics": {
                "age_groups": dict(age_groups),
                "genders": dict(genders),
                "skin_types": dict(skin_types),
                "skin_tones": dict(skin_tones),
                "lifestyles": dict(lifestyles)
            },
            "avg_purchase_intent": sum(purchase_intents) / len(purchase_intents) if purchase_intents else 0,
            "avg_influencer_effect": sum(influencer_effects) / len(influencer_effects) if influencer_effects else 0,
            "intent_distribution": intent_distribution,
            "influence_distribution": influence_distribution
        }
