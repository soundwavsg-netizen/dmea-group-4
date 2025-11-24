#!/usr/bin/env python3
"""
Seed script for Daily Reflections module
Inserts 10 pre-generated reflections from training materials
"""

from firebase_client import db
from firebase_admin import firestore
from datetime import datetime, timedelta
import sys

# Collection name
COLLECTION_NAME = 'daily_reflections'

# Seed data - 10 reflections from training materials
SEED_REFLECTIONS = [
    {
        'topic': 'Structured Problem Solving',
        'key_takeaways': """1. SCQ (Situation–Complication–Question) improves clarity.
2. Hypothesis-driven thinking accelerates solutioning.
3. MECE and reframing help uncover true root causes.""",
        'growth_challenge': """Challenge: structuring problem statements consistently.
Solution: practice SCQ daily on real CCC/AISY issues.""",
        'immediate_action': 'Apply SCQ + hypothesis tree on one CCC Digital project brief.',
        'personal_application': 'Boosts analytical sharpness and communication with clients and partners.'
    },
    {
        'topic': 'Business Communication',
        'key_takeaways': """1. Use Pyramid Principle for executive communication.
2. Start with the key message → then logic.
3. Clear storylines improve influence.""",
        'growth_challenge': """Challenge: over-explaining.
Solution: frame top-down and craft storyline before writing.""",
        'immediate_action': 'Rewrite one CCC/AISY deck using the Pyramid Principle.',
        'personal_application': 'Improves persuasion and clarity when pitching AI or education solutions.'
    },
    {
        'topic': 'Disruptive Technologies Reshaping Our World',
        'key_takeaways': """1. Six major disruptive tech areas reshape industries.
2. Data explosion + pervasive digitalization drive change.
3. All sectors are becoming tech-first.""",
        'growth_challenge': """Challenge: keeping up with rapidly evolving technologies.
Solution: monthly tech review and mapping impact to CCC's business lines.""",
        'immediate_action': "Identify which disruptive tech can be added to CCC client offerings.",
        'personal_application': 'Positions CCC as a modern, tech-forward consultancy.'
    },
    {
        'topic': 'AI & Data Analytics',
        'key_takeaways': """1. AI = data → algorithms → predictions → action.
2. ML enables automation and decision optimization.
3. Value created across sales, ops, risk & innovation.""",
        'growth_challenge': """Challenge: translating concepts into implementation.
Solution: start with one AI pilot use case.""",
        'immediate_action': 'Implement one AI automation for CCC Digital (dashboard, bot, etc.).',
        'personal_application': 'Strengthens capability to build AISAME, VocaFlow, Project 62 features.'
    },
    {
        'topic': 'Intro to GenAI & Effective Prompt Writing',
        'key_takeaways': """1. Prompt structure improves output quality.
2. Personas + iterative prompting = consistency.
3. GenAI boosts content and operational efficiency.""",
        'growth_challenge': """Challenge: inconsistent prompts.
Solution: use a standard prompt template.""",
        'immediate_action': 'Build a prompt library for CCC Digital, AISY, and Project 62.',
        'personal_application': 'Allows faster content creation and more reliable AI outputs.'
    },
    {
        'topic': 'Digital Marketing Overview',
        'key_takeaways': """1. Digital funnel: awareness → consideration → conversion → loyalty.
2. Paid, owned, earned media have distinct roles.
3. Search, social, content, and website form the ecosystem.""",
        'growth_challenge': """Challenge: choosing correct channels.
Solution: map channels to funnel stages.""",
        'immediate_action': 'Create a funnel blueprint for Project 62 or AISY.',
        'personal_application': "Improves CCC's ability to advise clients on digital strategy."
    },
    {
        'topic': 'Digital Marketing AI Trends + Capstone Introduction',
        'key_takeaways': """1. AI-driven marketing maturity accelerates performance.
2. Omnichannel behavior requires coordinated activation.
3. Capstone uses full-funnel strategies with AI tools.""",
        'growth_challenge': """Challenge: integrating multiple AI tools.
Solution: start with one funnel stage first.""",
        'immediate_action': 'Map AISY/Project 62 journeys to identify AI integration points.',
        'personal_application': "Enhances CCC's ability to design AI-powered marketing systems."
    },
    {
        'topic': 'Intro to Human-Centered Design (HCD)',
        'key_takeaways': """1. HCD focuses on user needs, motivations, and behavior.
2. Core principles: understand users, collaborate, iterate.
3. Design is how it works — not how it looks.""",
        'growth_challenge': """Challenge: assuming user needs too quickly.
Solution: apply user research before solutioning.""",
        'immediate_action': 'Conduct one user-observation or interview for a CCC project.',
        'personal_application': 'Improves product design for AISAME, VocaFlow, and CCC client systems.'
    },
    {
        'topic': 'Conducting User Research + Buyer Persona',
        'key_takeaways': """1. Three main research methods: fly-on-the-wall, contextual inquiry, interviews.
2. Personas synthesize data into actionable segments.
3. Research uncovers motivations, pain points, and behavior.""",
        'growth_challenge': """Challenge: skipping research and jumping to assumptions.
Solution: follow proper user research sequence.""",
        'immediate_action': 'Build a real buyer persona for Project 62 or AISY.',
        'personal_application': 'Strengthens marketing precision and product-market fit.'
    },
    {
        'topic': 'Building & Scaling Content Marketing',
        'key_takeaways': """1. Content marketing = heart of digital marketing success.
2. 4 pillars: planning, creation, distribution, analysis.
3. AI enhances ideation, drafting, and scaling.""",
        'growth_challenge': """Challenge: inconsistent content rhythm.
Solution: create a content calendar and system.""",
        'immediate_action': 'Build a mini content strategy for AISY or Project 62.',
        'personal_application': "Helps scale CCC Digital's marketing and strengthen brand presence."
    }
]

def seed_daily_reflections():
    """
    Seed 10 daily reflections into Firestore for superadmin and admin2
    """
    print("Starting Daily Reflections seed...")
    print(f"Target collection: {COLLECTION_NAME}")
    
    try:
        # First, clear any existing reflections to avoid duplicates
        print("Clearing existing reflections...")
        existing_docs = db.collection(COLLECTION_NAME).stream()
        deleted_count = 0
        for doc in existing_docs:
            doc.reference.delete()
            deleted_count += 1
        if deleted_count > 0:
            print(f"✓ Cleared {deleted_count} existing reflections")
        
        # Insert reflections for superadmin
        print("\n--- Seeding for superadmin ---")
        inserted_count = 0
        base_date = datetime.now()
        
        for idx, reflection_data in enumerate(SEED_REFLECTIONS):
            # Create document with server timestamps
            # Offset created_at for each reflection to simulate different creation times
            created_date = base_date - timedelta(days=(9 - idx))  # Most recent first
            
            doc_ref = db.collection(COLLECTION_NAME).document()
            
            doc_data = {
                **reflection_data,
                'created_by': 'superadmin',
                'created_at': created_date,
                'updated_at': created_date
            }
            
            doc_ref.set(doc_data)
            inserted_count += 1
            print(f"✓ Inserted for superadmin: {reflection_data['topic']}")
        
        # Insert reflections for admin2
        print("\n--- Seeding for admin2 ---")
        for idx, reflection_data in enumerate(SEED_REFLECTIONS):
            # Create document with server timestamps
            created_date = base_date - timedelta(days=(9 - idx))  # Most recent first
            
            doc_ref = db.collection(COLLECTION_NAME).document()
            
            doc_data = {
                **reflection_data,
                'created_by': 'admin2',
                'created_at': created_date,
                'updated_at': created_date
            }
            
            doc_ref.set(doc_data)
            inserted_count += 1
            print(f"✓ Inserted for admin2: {reflection_data['topic']}")
        
        print(f"\n✅ Successfully seeded {inserted_count} daily reflections!")
        print(f"   - 10 reflections for superadmin")
        print(f"   - 10 reflections for admin2")
        print(f"Collection: {COLLECTION_NAME}")
        
    except Exception as e:
        print(f"\n❌ Error during seed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_daily_reflections()
