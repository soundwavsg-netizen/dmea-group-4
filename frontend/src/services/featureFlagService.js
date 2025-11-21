// Feature Flags System
// Controls which modules are visible to admin users
// Superadmin always sees everything
// User only sees Dashboard + Add Insight (ignores flags)

const FEATURE_FLAGS_KEY = 'mufe_feature_flags';

const DEFAULT_FEATURES = {
  buyer_research: true,    // Buyer Persona Module (enabled)
  seo_content: false,      // SEO & Content Module
  social_media: false,     // Social Media Module
  analytics: false,        // Analytics Module
  presentation: false,     // Presentation Module
  final_capstone: false    // Final Capstone Module
};

class FeatureFlagService {
  constructor() {
    // Initialize flags from localStorage or use defaults
    this.loadFlags();
  }
  
  // Load flags from localStorage
  loadFlags() {
    const stored = localStorage.getItem(FEATURE_FLAGS_KEY);
    if (stored) {
      try {
        this.flags = { ...DEFAULT_FEATURES, ...JSON.parse(stored) };
      } catch (e) {
        this.flags = { ...DEFAULT_FEATURES };
      }
    } else {
      this.flags = { ...DEFAULT_FEATURES };
    }
  }
  
  // Save flags to localStorage
  saveFlags() {
    localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(this.flags));
  }
  
  // Get all flags
  getFlags() {
    return { ...this.flags };
  }
  
  // Check if a feature is enabled
  isEnabled(featureName) {
    return this.flags[featureName] === true;
  }
  
  // Toggle a feature flag (superadmin only)
  toggleFeature(featureName) {
    if (this.flags.hasOwnProperty(featureName)) {
      this.flags[featureName] = !this.flags[featureName];
      this.saveFlags();
      return true;
    }
    return false;
  }
  
  // Set a feature flag value
  setFeature(featureName, value) {
    if (this.flags.hasOwnProperty(featureName)) {
      this.flags[featureName] = value;
      this.saveFlags();
      return true;
    }
    return false;
  }
  
  // Reset all flags to defaults
  resetToDefaults() {
    this.flags = { ...DEFAULT_FEATURES };
    this.saveFlags();
  }
}

export default new FeatureFlagService();
