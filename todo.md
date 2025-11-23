# TODO: Presentations Module - Presentation Mode & Enhancements

## Current Phase: Complete Presentation Mode + Optional Enhancements

### Priority 0: Complete Presentation Mode in ClusteringTechnical.jsx
- [ ] Add presentation mode state and functions
  - Add `isPresentationMode` state
  - Implement `enterPresentationMode()` with fullscreen API
  - Implement `exitPresentationMode()` function
- [ ] Add keyboard navigation
  - Create useEffect for keyboard events (Arrow keys, Space, Escape)
  - Prevent default behavior for presentation shortcuts
  - Add cleanup function
- [ ] Add fullscreen change handlers
  - Detect browser fullscreen exit
  - Sync isPresentationMode state with fullscreen status
  - Handle vendor prefixes (webkit, ms)
- [ ] Create presentation mode UI
  - Add conditional rendering (if isPresentationMode)
  - Create fixed full-screen container
  - Add exit button (top-right with X icon)
  - Add slide counter (top-left)
  - Create main slide content area with scrolling
  - Add Previous/Next navigation buttons
  - Apply design guidelines colors
- [ ] Add "Present Full Screen" button in normal view
  - Place button after header, before slide indicators
  - Use Presentation icon from lucide-react
  - Add data-testid attribute
- [ ] Import necessary icons
  - Add Presentation, X icons from lucide-react imports

### Priority 1: Add Sticky Headers
- [ ] Implement sticky header in FriendlyBrief.jsx
  - Position: sticky top-0 z-50
  - Add backdrop-blur-sm
  - Include page title
  - Add subtle border-bottom
  - Match design guidelines styling
- [ ] Implement sticky header in ClusteringTechnical.jsx
  - Same styling as FriendlyBrief
  - Ensure consistent design

### Priority 2: Testing & Verification
- [ ] Test ClusteringTechnical presentation mode
  - Verify full-screen activation
  - Test keyboard shortcuts (←, →, Space, Esc)
  - Test exit button functionality
  - Verify slide counter accuracy
  - Test slide navigation in presentation mode
- [ ] Test sticky headers
  - Verify scroll behavior
  - Check z-index layering
  - Validate visual appearance
- [ ] Visual QA
  - Check color consistency (#A62639, #E0AFA0, #FAF7F5)
  - Verify typography (Playfair Display)
  - Test responsive behavior
- [ ] Frontend build check
  - Run esbuild validation
  - Check for console errors
  - Verify no import issues

### Priority 3: Final Polish
- [ ] Take screenshots of presentation mode
  - Both pages in presentation mode
  - Normal view with sticky headers
- [ ] Call testing agent
  - Comprehensive frontend testing
  - All presentation features
- [ ] Code review
  - Remove any console.logs
  - Ensure data-testid on all interactive elements
  - Verify accessibility

## Design Guidelines Reference
- Primary: #A62639 (burgundy)
- Accent: #E0AFA0 (rose)
- Background: #FAF7F5
- Font: Playfair Display (headings)
- Animation: 0.3s ease-out

## Notes
- FriendlyBrief.jsx already has complete presentation mode (reference implementation)
- Both pages already have fade animations and slide indicators
- Focus on code consistency between both files
- Test with admin/superadmin credentials
