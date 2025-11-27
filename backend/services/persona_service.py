import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from firebase_client import db
from firebase_admin import firestore
from config import settings
from collections import defaultdict
from typing import List, Dict, Any
import json
from utils import serialize_firestore_doc
from models import PersonaResponse

class PersonaService:
    
    def __init__(self):
        self.llm_client = None
    
    def get_llm_client(self):
        """Lazy init LLM client"""
        if self.llm_client is None:
            try:
                from openai import OpenAI
                self.llm_client = OpenAI(
                    api_key=settings.EMERGENT_LLM_KEY,
                    base_url=settings.LLM_BASE_URL
                )
            except ImportError:
                print("Warning: OpenAI not available, LLM features disabled")
                self.llm_client = None
        return self.llm_client
    
    def generate_persona_from_cluster(self, cluster: Dict[str, Any], cluster_num: int) -> Dict[str, Any]:
        """Generate persona with LLM enrichment"""
        insights = cluster['insights']
        
        # Aggregate data
        motivation_counts = defaultdict(int)
        pain_counts = defaultdict(int)
        behaviour_counts = defaultdict(int)
        channel_counts = defaultdict(int)
        
        for insight in insights:
            for mot in insight.get('motivations', []):
                motivation_counts[mot['name']] += 1
            for pain in insight.get('pains', []):
                pain_counts[pain['name']] += 1
            for behaviour in insight.get('behaviours', []):
                behaviour_counts[behaviour] += 1
            for channel in insight.get('channels', []):
                channel_counts[channel] += 1
        
        top_motivations = sorted(motivation_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_pains = sorted(pain_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_behaviours = sorted(behaviour_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_channels = sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Average intent/influence
        avg_intent = sum(i.get('purchase_intent', 0) for i in insights) / len(insights)
        avg_influence = sum(i.get('influencer_effect', 0) for i in insights) / len(insights)
        
        # Sample quotes
        quotes = [i.get('quote', '') for i in insights if i.get('quote')][:3]
        
        # Generate with LLM
        prompt = f"""You are a UX researcher creating a user persona for makeup and beauty products research.

Based on the following research data, generate a persona:

Demographics:
- Age Group: {cluster['age_group']}
- Skin Type: {cluster['skin_type']}
- Lifestyle: {cluster['lifestyle']}

Top Motivations: {', '.join([m[0] for m in top_motivations])}
Top Pain Points: {', '.join([p[0] for p in top_pains])}
Top Behaviours: {', '.join([b[0] for b in top_behaviours])}
Top Channels: {', '.join([c[0] for c in top_channels])}

Average Purchase Intent: {avg_intent:.0f}/100
Average Influencer Effect: {avg_influence:.0f}/100

Sample Quotes from Users:
{chr(10).join([f'- "{q}"' for q in quotes if q])}

Please provide a JSON response with the following structure:
{{
    "name": "A realistic first name that fits the persona",
    "background": "2-3 sentences describing who this persona is, their lifestyle, and their relationship with makeup/beauty",
    "intent_summary": "1 sentence about their purchase intent and decision-making",
    "influence_summary": "1 sentence about how influencers/social media affects their choices"
}}

Keep it professional, realistic, and grounded in the data. No fictional embellishments."""
        
        try:
            client = self.get_llm_client()
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a UX researcher assistant. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            llm_data = json.loads(content)
            
            # Build persona
            persona = {
                "name": llm_data.get('name', f'Persona {cluster_num}'),
                "background": llm_data.get('background', ''),
                "motivations": [m[0] for m in top_motivations],
                "pains": [p[0] for p in top_pains],
                "behaviours": [b[0] for b in top_behaviours],
                "channels": [c[0] for c in top_channels],
                "demographics": {
                    "age": cluster['age_group'],
                    "skin_type": cluster['skin_type'],
                    "lifestyle": cluster['lifestyle']
                },
                "quotes": quotes[:3],
                "intent_summary": llm_data.get('intent_summary', ''),
                "influence_summary": llm_data.get('influence_summary', ''),
                "created_at": firestore.SERVER_TIMESTAMP
            }
            
            return persona
            
        except Exception as e:
            print(f"LLM generation error: {e}, using fallback")
            # Fallback
            return {
                "name": f"Persona {cluster_num}",
                "background": f"A {cluster['age_group']} {cluster['lifestyle'].lower()} with {cluster['skin_type'].lower()} skin.",
                "motivations": [m[0] for m in top_motivations],
                "pains": [p[0] for p in top_pains],
                "behaviours": [b[0] for b in top_behaviours],
                "channels": [c[0] for c in top_channels],
                "demographics": {
                    "age": cluster['age_group'],
                    "skin_type": cluster['skin_type'],
                    "lifestyle": cluster['lifestyle']
                },
                "quotes": quotes[:3],
                "intent_summary": f"Shows {avg_intent:.0f}% purchase intent on average.",
                "influence_summary": f"Influenced by social media at {avg_influence:.0f}% level.",
                "created_at": firestore.SERVER_TIMESTAMP
            }
    
    @staticmethod
    def save_personas(personas: List[Dict[str, Any]]):
        """Save personas to Firestore (overwrite existing)"""
        personas_ref = db.collection('personas')
        
        # Clear existing
        existing = personas_ref.limit(100).stream()
        batch = db.batch()
        for doc in existing:
            batch.delete(doc.reference)
        batch.commit()
        
        # Save new personas
        batch = db.batch()
        for persona in personas:
            doc_ref = personas_ref.document()
            batch.set(doc_ref, persona)
        batch.commit()
    
    @staticmethod
    def get_all_personas() -> List[PersonaResponse]:
        """Get all personas from Firestore"""
        personas_ref = db.collection('personas').order_by(
            'created_at', direction=firestore.Query.DESCENDING
        )
        
        docs = personas_ref.stream()
        
        return [
            PersonaResponse(**serialize_firestore_doc(doc))
            for doc in docs
        ]
