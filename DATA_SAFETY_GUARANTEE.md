# Data Safety Guarantee

## Critical Rule: NO MODIFICATION OF EXISTING INSIGHT DATA

### Protected Fields (NEVER Modified)
The following fields in the `insights` collection are **PROTECTED** and never modified by the persona generation system:

```
✅ PROTECTED FIELDS (Read-Only):
- motivation_scores
- pain_scores  
- purchase_intent
- influence_effect
- behaviours
- channels
- demographics (age_group, gender, skin_type, skin_tone)
- products_mentioned (products)
- quote
- researcher_notes (notes)
- platform
- research_method
- created_at
- created_by
```

### Fields Added by Persona System (Non-Destructive)
Only these NEW fields are added during persona generation:

```
✅ NEW FIELDS ADDED (Non-Destructive):
- vector: List[float]           # Computed from existing data, not modifying source
- cluster_id: string           # Assignment result, not modifying source
```

### Safety Mechanisms

1. **Read-Only Operations**
   - Persona generation reads insight data but never updates protected fields
   - Vector calculation uses existing motivation_scores, pain_scores, etc. without modification
   - Clustering assignment only adds `cluster_id` field

2. **Additive-Only Updates**
   ```python
   # SAFE: Adding new fields
   insight_ref.update({
       'cluster_id': assignment['cluster_id'],
       'vector': assignment['vector']
   })
   
   # FORBIDDEN: Overwriting existing fields
   # insight_ref.update({
   #     'motivations': new_motivations  # NEVER DO THIS
   # })
   ```

3. **Fallback Logic (Persona-Level Only)**
   - Empty motivations/pains fallback applies ONLY to persona documents
   - Original insight data remains unchanged
   - Fallback uses frequency analysis from cluster, not modifying source insights

4. **Backend Validation**
   - Update endpoints only allow modification of persona documents
   - Insight collection updates are restricted to adding vector/cluster_id only
   - No API endpoint allows modification of protected insight fields

### Google Cloud Deployment Safety

1. **Environment Variables**
   - NO changes to existing environment variables
   - MONGO_URL, CORS_ORIGINS remain unchanged
   - Firebase configuration unchanged

2. **Firestore Structure**
   - Only adding optional fields to insights (vector, cluster_id)
   - New collections: personas, clusters
   - NO changes to existing collection schemas

3. **Dependencies**
   - New: scikit-learn, numpy, scipy, joblib
   - Already added to requirements.txt and Dockerfile
   - No breaking changes to existing packages

4. **Batch Operations**
   - Batch writes for cluster assignment (adds fields only)
   - No mass updates of existing fields
   - Respects Firestore quotas

### Verification Checklist

Before any deployment:
- [ ] Verify no insight fields are modified in code
- [ ] Check all `insight_ref.update()` calls only add vector/cluster_id
- [ ] Ensure persona generation reads but doesn't write to protected fields
- [ ] Test locally before GCloud deploy
- [ ] Verify Firestore rules allow new fields
- [ ] Check that existing insights display correctly after generation

### Recovery Procedures

If data is accidentally modified:
1. Firestore has point-in-time recovery (up to 7 days)
2. Contact admin to restore from backup
3. Re-run insight collection from original sources

### Code Review Guidelines

Any PR that touches `insights` collection must:
1. Explicitly document which fields are being accessed
2. Prove that no protected fields are modified
3. Show test results verifying data integrity
4. Get approval from lead developer before merge
