# Persona Generation System Rebuild Plan

## Overview
Complete rebuild of the persona generation system with proper vector-based clustering, platform multipliers, and WTS classification.

## Current State Analysis
- ✅ Basic insights collection exists
- ✅ Basic persona generation exists
- ✅ Fields: motivations, pains, behaviours, channels, demographics, quote, notes
- ✅ Platform field exists
- ❌ Need to add: vector field, cluster_id field
- ❌ Need proper clustering algorithm
- ❌ Need platform multipliers
- ❌ Need WTS classification layer

## Implementation Phases

### Phase 1: Data Structure & UI Updates (Non-Breaking)
**Goal:** Add new fields and display them without breaking existing data

1. **Backend Models Update**
   - Add `vector: List[float]` to Insight model (optional, defaults to empty)
   - Add `cluster_id: Optional[str]` to Insight model
   - Add `researcher_notes` field (mapped from existing `notes`)
   - Ensure all existing fields remain compatible

2. **ManageInsights UI Enhancement**
   - Add columns for: quote (truncated), researcher_notes, behaviours, channels, demographics, products_mentioned
   - Add detail modal with full text display
   - Add "Show more/less" toggle for long text
   - Add tooltips for quotes
   - Preserve existing sorting/filtering

### Phase 2: Vector Creation & Platform Multipliers
**Goal:** Implement proper normalization and platform weighting

1. **Platform Multipliers**
   ```python
   PLATFORM_MULTIPLIERS = {
       "Face to Face": 1.2,
       "Lazada": 1.0, "Shopee": 1.0, "Sephora": 1.0,
       "Xiaohongshu": 1.0, "Reddit": 1.0,
       "FB Group": 0.9, "YouTube": 0.9,
       "TikTok": 0.8, "Instagram": 0.8, "Blog": 0.8, "Other": 0.8
   }
   ```

2. **Vector Normalization**
   - Formula: `normalized_value = (raw_strength / 20) * platform_multiplier`
   - Apply to: motivations, pains, purchase_intent, influence_effect
   - Exclude: behaviours, channels, demographics, products, quotes, notes

3. **Multi-Dimensional Vector Construction**
   - One dimension per motivation item
   - One dimension per pain item
   - One dimension for purchase_intent
   - One dimension for influence_effect
   - Store as `vector` field in Firestore

### Phase 3: Clustering Engine
**Goal:** Implement K-Means with cosine similarity

1. **Algorithm Implementation**
   - Use sklearn.cluster.KMeans
   - Distance metric: cosine similarity
   - k = 3 (configurable)
   - 5 restarts, select lowest inertia

2. **Cluster Storage**
   ```
   /clusters/{cluster_id}
   {
     center: array<number>,
     summary: {
       avg_motivations: dict,
       avg_pains: dict,
       avg_intent: float,
       avg_influence: float
     }
   }
   ```

3. **Cluster Assignment**
   - Assign `cluster_id` to each insight
   - Compute cluster profiles

### Phase 4: WTS Classification Layer
**Goal:** Interpret cluster meaning for persona description

1. **Motivation & Pain Classification**
   ```
   WTS = (frequency% × avg_strength × platform_multiplier)
   - Weak: 0–1
   - Strong: >1–3
   - Dominant: >3
   ```

2. **Intent & Influence Classification**
   ```
   Score = (avg_strength × platform_multiplier)
   - Weak: 0–2
   - Strong: >2–4
   - Dominant: >4
   ```

### Phase 5: Persona Painting (Frequency-Based)
**Goal:** Extract behavioral patterns from cluster insights

1. **Frequency Analysis**
   - top_behaviours: top 2 most frequent
   - top_channels: top 2 most frequent
   - top_products: top 3 most mentioned
   - demographic_profile: statistical mode
   - representative_quote: most common 1-2

### Phase 6: Persona Generation & UI
**Goal:** Auto-generate editable personas

1. **Auto-Generation**
   - persona_name: AI-generated
   - persona_animated_image_url: auto-selected
   - All fields from WTS classification + frequency analysis

2. **Editable UI**
   - Left panel: image, name, demographics
   - Right panel: editable text fields
   - Super Admin: full edit
   - Team members: read-only

3. **Complete Workflow**
   ```
   1. Build vectors with platform multipliers
   2. Run K-Means clustering
   3. Assign cluster_ids
   4. Compute cluster summaries
   5. Apply WTS classification
   6. Paint persona (frequency analysis)
   7. Generate persona name & image
   8. Save to /personas/
   9. Display in UI
   ```

## Critical Requirements
- ✅ MUST NOT modify existing insights data content
- ✅ MUST NOT change database structure (only add fields)
- ✅ All new fields must be optional/default values
- ✅ Backward compatible with existing data

## Success Criteria
- [ ] ManageInsights displays all new fields
- [ ] Vector creation working with platform multipliers
- [ ] Clustering produces 3 clusters with proper centers
- [ ] WTS classification produces correct categories
- [ ] Personas auto-generate with all fields
- [ ] Personas are editable in UI
- [ ] All existing data preserved and functional
