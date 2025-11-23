# MUFE Group 4 — User Research + Persona Generator (Plan)

## 1) Objectives
- Build a full-stack research tool to:
  - Capture qualitative insights via a rich Add Insight form
  - Persist data in Firebase Firestore (Project: dmea-group-4)
  - Compute weighted scores for motivations and pains (per platform weights)
  - Cluster insights into 2–3 personas using co‑occurrence + thresholds
  - Enrich personas (name, background, summaries, quotes) via LLM
  - Show live Report (aggregations) that updates with new insights
  - Render personas as cards
- Tech: FastAPI (backend), React (frontend), Firestore (Admin SDK), LLM via Emergent LLM Key
- Routes (exact):
  - / (Home)
  - /add-insight (Add Insight Form)
  - /report (Report)
  - /persona-generator (Persona Generation Page)
  - /personas (Persona Cards)

## 2) Architecture & Data
- Backend
  - FastAPI on 0.0.0.0:8001; all endpoints prefixed with /api
  - Firebase Admin SDK using service account credentials
  - CORS enabled for frontend
  - Helpers for Firestore Timestamp/ObjectId → JSON-safe serialization
  - LLM via Emergent LLM key (text gen only)
- Frontend
  - React routes mapped 1:1 to provided HTML (Stitch extracts)
  - Use REACT_APP_BACKEND_URL + "/api" for API calls
  - Data-testid on interactive elements; handle loading/error states
- Firestore Schema
  - Collection: insights
    - created_at (timestamp)
    - age_group, gender, skin_type, skin_tone, lifestyle (string)
    - platform, research_method (string)
    - products (array<string>)
    - motivations (array<{ name: string, strength: number }>)
    - pains (array<{ name: string, strength: number }>)
    - behaviours (array<string>)
    - channels (array<string>)
    - purchase_intent (number 0–100)
    - influencer_effect (number 0–100)
    - quote (string), notes (string)
  - Collection: personas
    - name, background (string)
    - motivations, pains, behaviours, channels (array<string>)
    - demographics { age, skin_type, lifestyle } (string)
    - quotes (array<string>)
    - intent_summary, influence_summary (string)
    - created_at (timestamp)
- Platform Weights (scoring)
  - User Interview 1.2; Contextual Inquiry 1.2; Lazada/Sephora Review 1.0
  - Xiaohongshu/Reddit Long 1.0; YouTube 0.9; TikTok/IG 0.8; Secondary Blog 0.7; Other 0.8
- Score formulas
  - MotivationScore = frequency × avg_strength × avg_platform_weight
  - PainScore = same
  - PurchaseIntent = sum(intent_values); InfluencerEffect = sum(influencer_effect)

## 3) Phase 1 — Core POC (REQUIRED)
Reason: External integrations (Firestore + LLM) and custom clustering → Level ≥3

Scope (script-driven, no UI):
- Validate Firestore connectivity and CRUD
- Seed realistic sample insights (25–40) across required fields
- Implement scoring aggregation over all insights
- Implement clustering engine and persona creation
- LLM enrichment for persona narratives
- Save personas to Firestore and verify

Implementation Steps
1. Integration Playbooks: fetch Firestore + LLM playbooks; verify constraints
2. Backend utils (POC-only):
   - firestore_init() using service account
   - constants for options + platform_weights
   - serialize_doc() for JSON-safe payloads
3. Seed generator: create realistic insights covering:
   - Multiple platforms/methods (TikTok, Xiaohongshu, Lazada, Interviews, etc.)
   - Products, behaviours, channels; motivations/pains with strengths
   - Varied age_group, gender, skin_type, skin_tone, lifestyle
4. Scoring engine:
   - Build frequency/strength maps per motivation/pain with platform-weighted averages
   - Compute purchase_intent and influencer_effect distributions
5. Clustering engine:
   - Co-occurrence grouping by key profile combo (age_group + skin_type + lifestyle)
   - A cluster qualifies if: ≥20% of all entries share the same combination AND has ≥2 motivations/pains with score ≥50
   - Pick top 2–3 qualifying clusters
6. Persona builder:
   - Extract dominant motivations/pains/behaviours/channels for cluster
   - Demographics from cluster combo
   - Call LLM (Emergent key) to generate: name, background, quotes, intent_summary, influence_summary, tone
7. Save/overwrite personas collection; verify readback
8. POC test_core.py single script covers ALL above and prints PASS/FAIL per stage
9. Websearch (if needed): confirm best practices for Firestore aggregations and Admin SDK patterns

POC Deliverables
- /app/backend/test_core.py (single script)
- Sample data successfully written/read from Firestore
- Generated personas stored under /personas

Phase 1 User Stories
1. As a tester, I can seed realistic insights data with one command.
2. As a tester, I can run a script to compute weighted motivation and pain scores.
3. As a tester, I can run clustering to form 2–3 personas from seeded data.
4. As a tester, I can enrich personas with AI-generated names/stories.
5. As a tester, I can verify personas were saved to Firestore and are retrievable.

Exit Criteria (must pass before Phase 2)
- Firestore write/read verified
- Scoring & clustering outputs valid (≥2 personas if data allows)
- LLM persona details generated and saved

## 4) Phase 2 — App Development
Backend (FastAPI, /api prefix)
- Models: Pydantic schemas for InsightIn, InsightOut, PersonaOut, ReportOut
- Endpoints:
  - POST /api/insights → create an insight
  - GET /api/insights → list (optional pagination)
  - GET /api/report → return aggregated report data:
    - motivations, pains, demographics, behaviours, channels, products,
      intent distribution, influence distribution
  - POST /api/personas/generate → run scoring+clustering+LLM; overwrite personas
  - GET /api/personas → list personas
- Services:
  - firestore_client singleton init (Admin SDK)
  - scoring_service.py, clustering_service.py, persona_llm_service.py
  - serialization helpers for timestamps
- Config:
  - GOOGLE_APPLICATION_CREDENTIALS path via backend/.env
  - EMERGENT_LLM_KEY loaded from environment
- CORS: allow frontend origin

Frontend (React)
- Routes and pages (exact paths):
  - / → use HOME_HTML (CTA buttons to /add-insight and /report)
  - /add-insight → use ADD_INSIGHT_HTML and implement full form
  - /report → use REPORT_HTML; data bound to GET /api/report; auto-updates
  - /persona-generator → use PERSONA_GENERATOR_HTML; button calls POST /api/personas/generate, then redirect to /personas
  - /personas → use PERSONAS_HTML; bind to GET /api/personas
- Add Insight form fields (populated programmatically):
  - User Profile: age_group, gender, skin_type, skin_tone, lifestyle
  - Source Details: platform, research_method
  - Products: multi-select
  - Motivations & Pains: multi-select chips + slider per selection
  - Behaviours: multi-select; Channels: multi-select
  - Sliders: purchase_intent, influencer_effect; Text: quote, notes
- UX: show loading/success/error; add data-testid on actionable elements
- Build validation (esbuild) and error checks; no transparent backgrounds

Report Data (from API)
- Motivations, Pains (top N + scores)
- Demographics (age_group, gender, skin_type, skin_tone, lifestyle)
- Behaviours, Channels, Product mentions
- Distributions: purchase_intent, influencer_effect

Testing & QA (End-to-End)
- Use testing_agent_v3 to:
  - Submit an insight via UI; verify /api/insights persisted
  - Visit /report; verify metrics update
  - Trigger persona generation; verify /personas populated
  - Validate UI has no red errors; all interactive elements reachable

Phase 2 User Stories
1. As a researcher, I can submit a new insight with multiple motivations and strengths.
2. As a researcher, I can tag the source (platform + method) and products mentioned.
3. As a researcher, I can set purchase intent and influencer effect via sliders.
4. As a researcher, I can see the Report update with my new insight immediately after submission.
5. As a researcher, I can generate personas and view them as readable cards.
6. As a researcher, I can review demographics, behaviours, and channels summaries on the Report page.

Exit Criteria
- All 5 routes implemented and functional
- Report reflects new insights without page reload issues
- Personas generation completes and overwrites prior personas
- Frontend builds with no import/runtime errors; backend logs clean

## 5) Phase 3 — Enhancements (post‑MVP)
- Edit/Delete insights; pagination & filters
- Persist scoring weights in config and expose admin UI to tune
- Caching for /report
- Optional auth (later): simple email+password or Google OAuth
- Improved visualizations (charts) and accessibility
- CI checks and additional unit tests for services

## 6) Development Status

### ✅ COMPLETED - Phase 1: Core POC
- Firebase Admin JSON configured at /app/backend/secrets/firebase-admin.json
- test_core.py implemented and ALL 8 tests passed:
  - Firestore connection ✓
  - Sample data generation (30 insights) ✓
  - Scoring engine with platform weights ✓
  - Clustering algorithm ✓
  - LLM persona enrichment ✓
  - Personas saved to Firestore ✓
  - Data readback verification ✓
- Core functionality proven and stable

### ✅ COMPLETED - Phase 2: Full Application
- Backend: All 7 API endpoints implemented and tested (100% pass rate)
  - POST /api/insights
  - GET /api/insights
  - GET /api/insights/{id}
  - GET /api/report
  - POST /api/personas/generate
  - GET /api/personas
  - GET /api/health
- Frontend: All 5 routes implemented and fully functional
  - / (Home with navigation)
  - /add-insight (Complex form with all fields)
  - /report (Analytics dashboard with charts)
  - /persona-generator (Generation trigger)
  - /personas (Persona display cards)
- E2E Testing: 100% success rate via testing_agent_v3
  - All backend APIs working ✓
  - All frontend features working ✓
  - Full user journey working ✓
  - No critical bugs found ✓

### ✅ COMPLETED - Phase 3: Authentication & Role System
- Implemented 3-role authentication system (superadmin, admin, user)
- Hardcoded credentials with session management via localStorage
- Role-based route protection using ProtectedRoute component
- Dynamic sidebar navigation based on user role
- Feature flag system for module visibility control
- Login redirect logic: superadmin/admin → /, user → /add-insight

### ✅ COMPLETED - Phase 4: Mobile Optimization & Two-Level Navigation
- Design Guidelines: Applied brand colors (#A62639 primary, #E0AFA0 accent) from design_guidelines.md
- Global CSS: Added overflow prevention (max-width: 100%, overflow-x: hidden)
- Z-Index Stacking: Fixed layering (Burger: z-1100, Top Tabs: z-1000, Sidebar: z-60, Overlay: z-59)
- Horizontal Scrolling: Implemented scrollable top tabs for mobile devices
- Responsive Design: Tested and verified on multiple screen sizes:
  - iPhone SE (375px) ✓
  - Standard mobile (390px) ✓
  - Tablet (768px) ✓
  - Desktop (1920px) ✓
- Sidebar Functionality:
  - Burger menu opens/closes sidebar on mobile ✓
  - Overlay click closes sidebar ✓
  - Sidebar always visible on desktop (lg breakpoint) ✓
- Comprehensive E2E Testing: 97.5% pass rate (39/40 tests)
  - Mobile navigation: 92% (11/12 tests)
  - Desktop navigation: 100% (6/6 tests)
  - Role-based access: 100% (18/18 tests)
  - Sidebar visibility: 100% (3/3 tests)

## 7) Success Criteria
- Phase 1: Single test script successfully performs Firestore CRUD, scoring, clustering, LLM enrichment, and writes personas
- Phase 2: Five routes delivered; Add Insight form complete; Report auto-updates; Persona generation flow works end-to-end
- No hardcoded URLs; all API calls via REACT_APP_BACKEND_URL + /api; robust serialization for Firestore timestamps
- All features validated by testing agent; no critical UI/console/backend errors

---

## Phase 5: Presentations Module - Presentation Mode & Enhancements (Status: In Progress)

### Objective
Complete the presentation mode feature for both presentation pages and add optional UI enhancements (smooth animations, sticky headers).

### 5.1 Complete Presentation Mode Feature (Status: In Progress)

#### Context
- FriendlyBrief.jsx already has COMPLETE presentation mode implementation
- ClusteringTechnical.jsx needs presentation mode added
- Features required:
  - Full-screen mode with landscape view
  - Keyboard navigation (Arrow keys, Space, Escape)
  - Exit button
  - Slide counter display
  - Navigation buttons in presentation mode

#### Tasks
- [x] Analyze FriendlyBrief.jsx implementation (lines 6, 21-82, 84-156)
  - State: isPresentationMode
  - Functions: enterPresentationMode, exitPresentationMode
  - Keyboard event handlers with cleanup
  - Fullscreen API with vendor prefixes
  - Conditional rendering for presentation vs normal mode
- [ ] Implement presentation mode in ClusteringTechnical.jsx
  - Add isPresentationMode state
  - Add enterPresentationMode() function with fullscreen API
  - Add exitPresentationMode() function
  - Add keyboard navigation useEffect (Arrow keys, Space, Escape)
  - Add fullscreen change event handlers
  - Create presentation mode UI with:
    - Fixed full-screen container with bg-[#FAF7F5]
    - Exit button (top-right)
    - Slide counter (top-left)
    - Main slide content area
    - Navigation buttons (Previous/Next)
  - Add "Present Full Screen" button in normal view
  - Render slide content in both modes
- [ ] Test presentation mode functionality
  - Full-screen activation works
  - Keyboard shortcuts functional
  - Exit button works
  - Browser fullscreen exit detected
  - Slide navigation in presentation mode

### 5.2 Optional UI Enhancements (Status: Not Started)

#### Enhancement 1: Smooth Fade Animation ✅
**Status:** Already implemented in both pages
- CSS keyframes defined (fade-in animation)
- Class `animate-fade-in` applied to slide content
- Duration: 0.3s ease-out

#### Enhancement 2: Slide Indicator Dots ✅
**Status:** Already implemented in both pages
- FriendlyBrief: Lines 183-194 (interactive dots)
- ClusteringTechnical: Lines 32-43 (interactive dots)
- Features: Click to navigate, visual current slide indicator

#### Enhancement 3: Sticky Header with Page Title
**Status:** To be implemented
- [ ] Add sticky header to FriendlyBrief.jsx normal view
  - Position: sticky top-0 z-50
  - Contains: Page title
  - Backdrop blur effect
  - Subtle border-bottom
- [ ] Add sticky header to ClusteringTechnical.jsx normal view
  - Same styling as FriendlyBrief
  - Consistent design language

### 5.3 Testing & Polish (Status: Not Started)

#### Functional Testing
- [ ] Test ClusteringTechnical presentation mode
  - Enter/exit full-screen
  - Keyboard shortcuts (←, →, Space, Esc)
  - Button interactions
  - Slide counter accuracy
- [ ] Test sticky headers
  - Scroll behavior
  - Z-index layering
  - Visual appearance
- [ ] Cross-browser testing
  - Chrome/Edge (webkit prefix)
  - Firefox (standard API)
  - Safari (webkit prefix)

#### Visual QA
- [ ] Verify design consistency
  - Colors match design guidelines (#A62639, #E0AFA0, #FAF7F5)
  - Typography (Playfair Display for headings)
  - Spacing and alignment
- [ ] Test responsive behavior
  - Mobile view
  - Tablet view
  - Desktop view
- [ ] Animation polish
  - Smooth transitions
  - No jank or flicker

### 5.4 Design Reference (from design_guidelines.md)

**Color Palette:**
- Primary: #A62639 (burgundy)
- Accent: #E0AFA0 (rose/peach)
- Background: #FAF7F5 (warm off-white)
- Text Primary: #333333
- Text Muted: #6C5F5F

**Typography:**
- Display Headings: Playfair Display (serif)
- Body: Manrope (sans-serif)

**Animation Standards:**
- Duration: 0.3s for slide transitions
- Easing: ease-out
- Properties: opacity, transform (translateY)

**Button Styling:**
- Primary: bg-[#A62639] hover:bg-[#8a1f2d]
- Disabled: bg-gray-300 text-gray-500
- Shape: rounded-full for presentation controls
- Shadow: shadow-md or shadow-lg

### 5.5 Technical Implementation Notes

**Fullscreen API Pattern:**
```javascript
// Enter fullscreen with vendor prefixes
const enterPresentationMode = () => {
  setIsPresentationMode(true);
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
};
```

**Keyboard Navigation Pattern:**
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if (isPresentationMode) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        exitPresentationMode();
      }
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [isPresentationMode, currentSlide]);
```

**Conditional Rendering Pattern:**
```javascript
if (isPresentationMode) {
  return (
    <div className="fixed inset-0 bg-[#FAF7F5] z-50...">
      {/* Presentation mode UI */}
    </div>
  );
}
// Normal view
return (
  <div className="min-h-screen bg-[#FAF7F5]...">
    {/* Normal view UI */}
  </div>
);
```

### 5.6 Completed in Previous Session
- ✅ Created Presentations module structure
- ✅ Added role-restricted sidebar link (admin/superadmin only)
- ✅ Created PresentationsNav component
- ✅ Implemented FriendlyBrief.jsx with full slide content
- ✅ Implemented ClusteringTechnical.jsx with full slide content
- ✅ Added presentation mode to FriendlyBrief.jsx (COMPLETE)
- ✅ Integrated all slide images from presentations_bundle.zip
- ✅ Configured routes in App.js

### 5.7 Exit Criteria for Phase 5
- [ ] Presentation mode works on both pages
- [ ] All keyboard shortcuts functional
- [ ] Sticky headers implemented and tested
- [ ] No console errors or warnings
- [ ] Visual design matches guidelines
- [ ] Testing agent validates all features
- [ ] User can seamlessly present slides in full-screen landscape mode
