# Manual Testing Guide - Analytics Engine Phase 1

## 📁 Sample Datasets Location

Both sample datasets are ready at:
- **Social Media**: `/app/sample_social_media_data.csv` (2.3 KB, 12 rows)
- **Search Marketing**: `/app/sample_search_marketing_data.csv` (1.4 KB, 15 rows)

## 🧪 Testing Workflow

### Social Media Diagnostics

1. **Navigate to Social Media Diagnostics** from sidebar
2. **Data Input Tab**:
   - Click "Upload CSV/Excel" button
   - Select `/app/sample_social_media_data.csv`
   - ✅ VERIFY: All 15 preset columns remain visible (Platform, Post URL, Post Type, etc.)
   - ✅ VERIFY: 12 data rows uploaded successfully
   - Click "Save" button

3. **Column Mapping Tab**:
   - Map the following (should auto-match by name):
     - Platform → Platform
     - Post Type → Post Type
     - Likes → Likes
     - Comments → Comments
     - Shares → Shares
     - Saves → Saves
     - Views → Views
     - Posting Date → Posting Date
     - Sentiment → Sentiment
     - Key Themes → Key Themes (optional)
   - Click "Save Mappings & Generate Analytics"

4. **Dashboard Tab**:
   - ✅ VERIFY: "Analyze Data" button is visible and enabled
   - Click "Analyze Data" button
   - ✅ VERIFY: Toast notification shows "Running analytics engine..."
   - ✅ VERIFY: Button text changes to "Analyzing..."
   - Wait for completion (should be ~2-5 seconds)
   - ✅ VERIFY: Toast shows "Analytics complete!"
   - ✅ VERIFY: Dashboard displays:
     - 4 metric cards (Total Posts=12, Total Likes, Total Views, Avg Engagement)
     - Content Pillar Performance bar chart
     - Platform Comparison bar chart
     - Push/Fix/Drop recommendations (3 columns with colored cards)
     - Top Performing Posts table

5. **Insight Summary Tab**:
   - ✅ VERIFY: Displays structured insights:
     - Top 5 Insights (numbered badges 1-5)
     - Strategic Recommendations (with priority badges)
     - Persona Alignment (blue card)
     - Priority Actions (numbered circles 1-5)

### Search Marketing Diagnostics

1. **Navigate to Search Marketing Diagnostics** from sidebar
2. **Data Input Tab**:
   - Click "Upload CSV/Excel" button
   - Select `/app/sample_search_marketing_data.csv`
   - ✅ VERIFY: All 8 preset columns remain (Keyword, Search Volume, etc.)
   - ✅ VERIFY: 15 keyword rows uploaded
   - Click "Save"

3. **Column Mapping Tab**:
   - Map columns:
     - Keyword → Keyword
     - Search Volume → Search Volume
     - Keyword Difficulty → Keyword Difficulty
     - Competition Level → Competition Level
     - Intent → Intent
     - Brand Ranking → Brand Ranking (optional)
     - Competitor Ranking → Competitor Ranking (optional)
   - Click "Save Mappings & Generate Analytics"

4. **Dashboard Tab**:
   - Click "Analyze Data" button
   - ✅ VERIFY: Dashboard displays:
     - 3 metric cards (Total Keywords=15, Total Volume, Avg Difficulty)
     - Intent Funnel bar chart
     - Top 10 Keywords table with content suggestions
     - Content Gap Analysis table
     - Difficulty Distribution pie chart

5. **Insight Summary Tab**:
   - ✅ VERIFY: Displays:
     - Key Insights (numbered 1-5)
     - Keyword Opportunities (top 5 with opportunity scores)
     - Strategic Recommendations
     - Priority Actions

## 🔍 Formula Accuracy Verification

### Social Media
Check one post manually (e.g., TikTok Tutorial post 1):
- Likes: 2500, Comments: 180, Shares: 95, Saves: 420, Views: 45000
- **Expected Engagement Rate**: (2500+180+95+420)/45000 = 3195/45000 = 0.071 = **7.1%**
- ✅ VERIFY this matches the displayed "Engagement Rate (%)" in the data

### Search Marketing
Check keyword "best foundation for oily skin":
- Volume: 18000, Difficulty: 45, Intent: Consideration (weight = 1.5)
- **Expected Opportunity Score**: (18000/45) × 1.5 = 400 × 1.5 = **600**
- ✅ VERIFY this matches the calculated score in Top 10 Keywords

## 🚫 Edge Case Testing

1. **Missing Data Test**: Some keywords have blank Brand Ranking
   - ✅ VERIFY: Analytics still run without errors
   - ✅ VERIFY: Content Gap Analysis shows these keywords

2. **Preset Column Preservation**:
   - Upload CSV again (with different data)
   - ✅ VERIFY: Original 15 (Social) or 8 (Search) preset columns still exist
   - ✅ VERIFY: New data appends correctly

3. **No Auto-Run Test**:
   - Refresh page after mapping
   - Navigate to Dashboard tab
   - ✅ VERIFY: Dashboard is blank (not showing old data)
   - ✅ VERIFY: Must click "Analyze Data" to see results

## ✅ Expected Outcomes

### Social Media Analytics
- **Push Recommendations**: Should include "Tutorial" (high engagement + positive sentiment)
- **Content Pillars**: Tutorial should rank #1 by engagement rate
- **Platform Comparison**: TikTok should have highest posting frequency (5 posts)

### Search Marketing Analytics  
- **Top Opportunity**: Likely "how to apply eyeshadow" (42K volume, 15 difficulty, awareness)
- **Content Gaps**: Should show ~5 keywords where competitor ranks but brand doesn't
- **Intent Distribution**: Awareness should dominate (7 keywords)

## 🔴 Red Flags to Watch For

1. ❌ Preset columns disappear after CSV upload
2. ❌ "Analyze Data" runs automatically without button click
3. ❌ Charts fail to render or show empty
4. ❌ Engagement rate calculation is wrong
5. ❌ Opportunity score doesn't use intent weights
6. ❌ Push/Fix/Drop logic incorrect (e.g., low engagement in Push)
7. ❌ Console errors in browser
8. ❌ Backend errors in logs
9. ❌ Persona Engine stops working
10. ❌ Old "Analytics" tab still visible

## 📊 Success Criteria

✅ All preset columns preserved through upload  
✅ CSV data imports correctly with new columns appended  
✅ Column mapping saves successfully  
✅ "Analyze Data" button triggers analytics (not auto-run)  
✅ Dashboard charts render with correct data  
✅ Formulas calculate accurately (spot-check manually)  
✅ Insight Summary shows structured insights  
✅ No console errors  
✅ No backend errors  
✅ Persona Engine unaffected  

## 📝 How to Report Issues

For each issue found, note:
1. Module (Social Media or Search Marketing)
2. Tab (Data Input, Column Mapping, Dashboard, or Insight Summary)
3. Exact steps to reproduce
4. Expected behavior
5. Actual behavior
6. Screenshot if UI issue
7. Console error if applicable
8. Backend log error if applicable
