# Testing Checklist - Persona System Updates

## Pre-Testing Verification

### Backend Status
```bash
# Check services running
supervisorctl status

# Check backend logs
tail -n 50 /var/log/supervisor/backend.err.log

# Check frontend logs  
tail -n 50 /var/log/supervisor/frontend.err.log
```

### Environment Verification
- [ ] Backend running on port 8001
- [ ] Frontend running on port 3000
- [ ] No error messages in logs
- [ ] MONGO_URL configured correctly
- [ ] CORS_ORIGINS allows frontend URL

---

## Test 1: Persona Image Gender Match ✅

**Objective:** Verify persona images match demographic gender

**Steps:**
1. Navigate to "Persona Generator" page
2. Click "Generate Personas"
3. Wait for completion message
4. Navigate to "Personas" page
5. For each persona:
   - Check demographic profile gender
   - Verify avatar image visually matches gender
   - Verify age appropriateness (youth vs adult)

**Expected Results:**
- Female personas → Female avatars
- Male personas → Male avatars  
- Young (18-25) → Youth-styled avatars
- Adult (26+) → Adult-styled avatars
- Neutral if gender unknown

**Failure Criteria:**
- Male persona with female avatar
- Female persona with male avatar
- Age mismatch (adult with teen avatar)

---

## Test 2: Descriptive Persona Names ✅

**Objective:** Verify persona names are role-based, not human names

**Steps:**
1. Generate personas (if not already done)
2. View all personas on "Personas" page
3. Check each persona name

**Expected Results:**
- Names follow pattern: "The [Adjective] [Noun]"
- Examples:
  - "The Trend-Seeking Student"
  - "The Pro Makeup Artist"
  - "The Budget Beauty Explorer"
  - "The Content Creator"
- NO human names like "Sarah", "Emma", "John"

**Failure Criteria:**
- Any persona named with human first/last name
- Generic names without descriptors
- Names not reflecting persona traits

---

## Test 3: Non-Empty Motivations & Pains ✅

**Objective:** Ensure all personas have at least 1 motivation and 1 pain

**Steps:**
1. View all personas on "Personas" page
2. For each persona:
   - Check "Dominant Motivations" section
   - Check "Pain Points" section
   - Verify both show at least 1 item

**Expected Results:**
- Every persona displays ≥1 motivation
- Every persona displays ≥1 pain point
- No blank sections
- Fallback shows highest-frequency item if WTS filtering removes all

**Failure Criteria:**
- Any persona with empty motivations section
- Any persona with empty pains section
- "None" displayed in either section

---

## Test 4: Motivations & Pains in Manage Insights ✅

**Objective:** Verify new columns display correctly in insights table

**Steps:**
1. Navigate to "Manage Insights" page
2. Check table headers:
   - "Motivations" column exists
   - "Pains" column exists
3. For each insight row:
   - Verify top 1-2 motivations displayed with scores
   - Verify top 1-2 pains displayed with scores
4. Click "View" button on any insight
5. In detail modal:
   - Verify full list of motivations with scores
   - Verify full list of pains with scores

**Expected Results:**
- Table shows truncated top 2 items: "Quality (85), Price (72)"
- Detail modal shows all items with scores
- Scores displayed in parentheses
- Sorted by strength (highest first)

**Failure Criteria:**
- Missing motivations/pains columns
- No scores shown
- Full list shown in table (should be truncated)
- Detail modal missing full data

---

## Test 5: Data Integrity Check 🔒

**Objective:** Verify NO existing insight data was modified

**Steps:**
1. Navigate to "Manage Insights" page
2. Select 3-5 random insights
3. Click "View" to open detail modal
4. Verify all original fields intact:
   - Quote text unchanged
   - Researcher notes unchanged
   - Products list unchanged
   - Behaviours unchanged
   - Channels unchanged
   - Demographics unchanged
   - Purchase intent score unchanged
   - Influencer effect score unchanged
   - Motivation scores unchanged
   - Pain scores unchanged

**Expected Results:**
- All data matches original input
- No fields overwritten or lost
- Motivations/pains show original strength values
- New fields added: vector (hidden), cluster_id (hidden)

**Failure Criteria:**
- Any original field value changed
- Missing data that was previously entered
- Scores/values different from original

---

## Test 6: Tooltip Positioning (Desktop) ✅

**Objective:** Verify "!" icon tooltips don't go off-screen

**Steps:**
1. Open application on desktop browser (≥1024px width)
2. Navigate to "Generate Persona" page
3. Hover/click on "!" icons
4. Navigate to "Reports" page (if exists)
5. Hover/click on "!" icons

**Expected Results:**
- Tooltips appear near the icon
- Never extend beyond viewport edges
- Auto-adjust position if near edge
- Text readable and within max-width
- Can scroll if content too long

**Failure Criteria:**
- Tooltip cut off by screen edge
- Content unreadable
- Tooltip appears far from icon

---

## Test 7: Persona Editing (Super Admin) ✅

**Objective:** Verify persona edit functionality works

**Steps:**
1. Login as superadmin
2. Navigate to "Personas" page
3. Click "Edit" on any persona
4. Modify fields:
   - Change name
   - Edit motivations (comma-separated)
   - Edit pains (comma-separated)
   - Edit summary description
   - Edit buying trigger
5. Click "Save"
6. Verify changes saved
7. Refresh page
8. Verify changes persist

**Expected Results:**
- Edit button visible (superadmin only)
- All fields become editable
- Save updates Firestore
- Changes visible after refresh
- "Saving..." state shows during save

**Failure Criteria:**
- Edit button not showing for superadmin
- Fields not editable
- Save fails
- Changes don't persist after refresh

---

## Test 8: Read-Only for Team Members ✅

**Objective:** Verify non-superadmin users can't edit personas

**Steps:**
1. Login as admin or user1 (not superadmin)
2. Navigate to "Personas" page
3. Check for "Edit" button

**Expected Results:**
- No "Edit" button visible
- Personas display in read-only mode
- Can view all persona data

**Failure Criteria:**
- Edit button appears for non-superadmin
- User able to modify persona data

---

## Test 9: Complete Generation Workflow ✅

**Objective:** Test end-to-end persona generation

**Steps:**
1. Ensure at least 3 insights exist in database
2. Navigate to "Persona Generator" page
3. Click "Generate Personas" button
4. Wait for completion (may take 10-30 seconds)
5. Check success message
6. Navigate to "Personas" page
7. Verify 3 personas generated
8. Check each persona for completeness

**Expected Results:**
- Success message: "Successfully generated N personas"
- 3 persona cards displayed
- Each persona has:
  - Descriptive name
  - Gender-matched avatar
  - Demographics
  - ≥1 motivation
  - ≥1 pain point
  - Behaviours
  - Channels
  - Buying trigger
  - Summary description
  - Intent category (weak/strong/dominant)
  - Influence category
  - Insight count

**Failure Criteria:**
- Generation fails
- Wrong number of personas
- Missing data in any persona
- Error messages

---

## Test 10: Google Cloud Deployment Check ☁️

**Objective:** Verify deployment compatibility

**Pre-Deployment Checks:**
- [ ] All tests 1-9 pass locally
- [ ] Backend starts without errors
- [ ] Frontend compiles without errors
- [ ] No hardcoded URLs in code
- [ ] requirements.txt up to date
- [ ] Dockerfile includes scikit-learn
- [ ] .env file not modified (MONGO_URL, CORS)

**Post-Deployment Verification:**
1. Check Cloud Run logs for errors
2. Test persona generation on deployed app
3. Verify insights display correctly
4. Test persona editing
5. Check tooltip positioning

**Expected Results:**
- Deployment succeeds
- No runtime errors in Cloud Run logs
- All features work on deployed version

**Failure Criteria:**
- Deployment fails
- Backend crashes on Cloud Run
- Missing packages error
- CORS errors
- Firestore connection issues

---

## Bug Reporting Template

If any test fails, report using this format:

```
**Test Failed:** Test #X - [Test Name]
**Step:** [Which step failed]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Error Messages:** [Copy any error messages]
**Screenshots:** [Attach if UI issue]
**Environment:** [Local/Cloud Run, Browser, etc.]
```

---

## Success Criteria Summary

All tests must pass before considering deployment:
- ✅ Persona images match gender/age
- ✅ Persona names are descriptive (no human names)
- ✅ All personas have motivations & pains
- ✅ Manage Insights shows motivations/pains columns
- ✅ No existing insight data modified
- ✅ Tooltips position correctly
- ✅ Persona editing works (superadmin)
- ✅ Read-only for non-superadmin
- ✅ Complete generation workflow functions
- ✅ Cloud deployment stable
