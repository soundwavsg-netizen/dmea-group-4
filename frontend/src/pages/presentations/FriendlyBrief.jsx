import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Presentation, X, Maximize, Minimize } from 'lucide-react';

const FriendlyBrief = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const totalSlides = 4;

  // Detect if device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const enterPresentationMode = () => {
    setIsPresentationMode(true);
    // Lock orientation to landscape on mobile
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(err => {
        console.log('Orientation lock not supported:', err);
      });
    }
  };

  const exitPresentationMode = () => {
    setIsPresentationMode(false);
    setIsFullScreen(false);
    // Exit fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    // Unlock orientation
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  };

  const toggleFullScreen = () => {
    const isMobile = isMobileDevice();
    
    if (!isFullScreen) {
      // Enter fullscreen
      if (isMobile) {
        // For mobile: use CSS-based full-screen
        setIsFullScreen(true);
        // Try to minimize browser UI
        window.scrollTo(0, 1);
        // Request orientation lock
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        // For desktop: use Fullscreen API
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
        setIsFullScreen(true);
      }
    } else {
      // Exit fullscreen
      if (isMobile) {
        // For mobile: just toggle state
        setIsFullScreen(false);
      } else {
        // For desktop: exit Fullscreen API
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        setIsFullScreen(false);
      }
    }
  };

  // Keyboard navigation
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

  // Handle fullscreen exit (browser back button or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      setIsFullScreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // If in presentation mode, render full-screen version
  if (isPresentationMode) {
    return (
      <div className="fixed inset-0 bg-[#FAF7F5] flex items-center justify-center p-4 md:p-8 lg:p-16" style={{ zIndex: 9999 }}>
        {/* Top controls bar */}
        <div className="fixed top-4 left-4 right-4 flex items-center justify-between" style={{ zIndex: 10000 }}>
          {/* Slide counter */}
          <div className="px-4 py-2 bg-white/90 rounded-full shadow-lg">
            <span className="text-sm font-semibold text-[#6C5F5F]">{currentSlide} / {totalSlides}</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Full-screen toggle */}
            <button
              onClick={toggleFullScreen}
              className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
              data-testid="toggle-fullscreen-btn"
            >
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-[#A62639]" />
              ) : (
                <Maximize className="w-5 h-5 text-[#A62639]" />
              )}
            </button>

            {/* Exit presentation mode */}
            <button
              onClick={exitPresentationMode}
              className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
              title="Exit Presentation Mode"
              data-testid="exit-presentation-btn"
            >
              <X className="w-6 h-6 text-[#A62639]" />
            </button>
          </div>
        </div>

        {/* Main slide content */}
        <div className="w-full h-full max-w-6xl max-h-full flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-2xl p-8 md:p-12 overflow-y-auto presentation-slide-content">
            {/* Slide 1: What We Do */}
            {currentSlide === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-4xl font-bold text-[#A62639] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    What We Do
                  </h2>
                  <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                  <p className="text-[#333333]/80 text-lg leading-relaxed">
                    We collect and synthesize deep user research insights to build actionable personas. Our process focuses on understanding the core drivers of consumer behavior, including their motivations, pain points, daily habits, preferred channels, purchase intent, and the key factors that influence their decisions.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 text-2xl font-semibold text-[#A62639] py-6">
                  <span className="text-4xl">👤</span>
                  <span className="text-[#E0AFA0]">→</span>
                  <span className="text-4xl">📊</span>
                  <span className="text-[#E0AFA0]">→</span>
                  <span className="text-4xl">🎯</span>
                </div>

                <div className="border-t border-[#E0AFA0]/30 my-8"></div>

                <div>
                  <h3 className="text-3xl font-bold text-[#333333] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Generate Accurate Personas
                  </h3>
                  <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                  <p className="text-[#333333]/80 text-lg leading-relaxed">
                    Transform raw data into vivid, data-backed user personas. Understand your target audience with detailed profiles that highlight their goals, frustrations, and demographic information, allowing your team to design with empathy and precision.
                  </p>
                </div>
              </div>
            )}

            {/* Slide 2: Turning Insights Into Numbers */}
            {currentSlide === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-4xl font-bold text-[#A62639] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Turning Insights Into Numbers
                  </h2>
                  <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                  <p className="text-[#333333]/80 text-base leading-relaxed mb-6">
                    Raw research insights—such as interview transcripts, survey responses, and user feedback—are qualitative by nature. To enable algorithmic analysis and pattern recognition, we transform this data into a numerical format through a process called vectorization.
                  </p>
                </div>

                <div className="bg-[#FAF7F5] rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#A62639] text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-[#333333] mb-2">Text Analysis</h4>
                      <p className="text-[#333333]/70 text-sm">
                        Each insight is broken down into key concepts, themes, and sentiment indicators.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#A62639] text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-[#333333] mb-2">Numerical Encoding</h4>
                      <p className="text-[#333333]/70 text-sm">
                        Concepts are mapped to multi-dimensional vectors that capture semantic meaning.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#A62639] text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-[#333333] mb-2">Pattern Recognition</h4>
                      <p className="text-[#333333]/70 text-sm">
                        Machine learning algorithms identify similarities and group related insights together.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[#333333]/70 text-sm italic border-l-4 border-[#E0AFA0] pl-4">
                  This transformation allows us to mathematically compare thousands of data points and discover meaningful patterns that would be impossible to detect manually.
                </p>
              </div>
            )}

            {/* Slide 3: How Clusters Form */}
            {currentSlide === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-4xl font-bold text-[#A62639] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    How Clusters Form
                  </h2>
                  <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                  <p className="text-[#333333]/80 text-base leading-relaxed mb-6">
                    Once insights are vectorized, we use clustering algorithms to group similar data points. This process reveals natural segments within your user base, each representing a distinct type of user with shared characteristics.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                    <div className="text-3xl mb-3">🔍</div>
                    <h4 className="font-bold text-[#333333] mb-2">Similarity Detection</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Algorithms calculate "distance" between data points in multi-dimensional space, grouping those that are closest together.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                    <div className="text-3xl mb-3">🎯</div>
                    <h4 className="font-bold text-[#333333] mb-2">Cluster Formation</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Data points naturally organize into groups, each representing users with similar behaviors and needs.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                    <div className="text-3xl mb-3">📊</div>
                    <h4 className="font-bold text-[#333333] mb-2">Pattern Analysis</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Each cluster's characteristics are analyzed to understand what makes that user segment unique.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                    <div className="text-3xl mb-3">✨</div>
                    <h4 className="font-bold text-[#333333] mb-2">Persona Generation</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Clusters are transformed into detailed, actionable personas with names, stories, and goals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 4: How Personas Are Created */}
            {currentSlide === 4 && (
              <div className="space-y-6 animate-fade-in">
                {/* Main Title */}
                <div className="text-center mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    How Personas Are Created
                  </h2>
                  <div className="h-1 w-20 bg-[#E0AFA0] mx-auto mt-4"></div>
                </div>

                {/* Section 1: What is User Research */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    What is User Research?
                  </h2>
                  <p className="text-[#6C5F5F] text-base mb-4">
                    Understand the foundational principles of our research methodology and how it drives meaningful insights.
                  </p>
                  <hr className="border-[#EAE5E3] my-4" />
                  <p className="text-[#333333] text-base leading-relaxed">
                    User research is the systematic study of target users to add realistic contexts and insights to design processes. It helps us understand how people live their lives so that we can design products and services that are more effective, efficient, and enjoyable for them. We focus on qualitative data to uncover deep-seated motivations and pain points.
                  </p>
                </div>

                {/* Section 2: Why Personas Matter */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Why Personas Matter?
                  </h2>
                  <p className="text-[#6C5F5F] text-base mb-4">
                    Discover how synthesizing research into personas creates a powerful tool for empathy and decision-making.
                  </p>
                  <hr className="border-[#EAE5E3] my-4" />
                  <p className="text-[#333333] text-base leading-relaxed">
                    Personas are fictional characters, which you create based upon your research in order to represent the different user types that might use your service or product. Creating personas helps the design team build a shared understanding of the user, keeping the entire process human-centered and focused on solving real-world problems for real people.
                  </p>
                </div>

                {/* Section 3: Our Data Clustering Method */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Our Data Clustering Method
                  </h2>
                  <p className="text-[#6C5F5F] text-base mb-4">
                    Learn how we process raw data into actionable patterns and groups.
                  </p>
                  <hr className="border-[#EAE5E3] my-4" />
                  <p className="text-[#333333] text-base leading-relaxed">
                    Our proprietary algorithm analyzes qualitative feedback from interviews, surveys, and usability tests. It identifies recurring themes and behaviors, grouping similar data points into meaningful clusters. This process moves beyond surface-level comments to reveal the core motivations and frustrations that define a user group, forming the empirical foundation for each persona.
                  </p>
                </div>

                {/* Section 4: How Personas Are Created */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    How Personas Are Created
                  </h2>
                  <p className="text-[#6C5F5F] text-base mb-4">
                    From data clusters to human stories, this is how we bring your users to life.
                  </p>
                  <hr className="border-[#EAE5E3] my-4" />
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left column - text content */}
                    <div className="space-y-4">
                      <p className="text-[#333333] text-base leading-relaxed">
                        We combine the strongest patterns from our data clusters to create a human-friendly persona. This process involves weaving together the most important aspects of:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-[#333333]">
                          <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                          <span><strong className="font-bold">Motivations:</strong> What drives their choices?</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#333333]">
                          <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                          <span><strong className="font-bold">Pains:</strong> What are their biggest challenges?</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#333333]">
                          <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                          <span><strong className="font-bold">Behaviors:</strong> How do they act and shop?</span>
                        </li>
                        <li className="flex items-start gap-3 text-[#333333]">
                          <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                          <span><strong className="font-bold">Influences:</strong> Where do they look for inspiration?</span>
                        </li>
                      </ul>
                    </div>

                    {/* Right column - persona example */}
                    <div className="rounded-xl border border-[#EAE5E3] bg-[#FAF7F5] p-6">
                      <div className="space-y-6">
                        {/* Avatar and name */}
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E0AFA0] to-[#A62639] flex-shrink-0"></div>
                          <div>
                            <h3 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
                              Isabella Rossi
                            </h3>
                            <p className="text-sm text-[#6C5F5F]">The Expressive Artist</p>
                          </div>
                        </div>

                        {/* Quote */}
                        <div className="text-sm italic text-[#6C5F5F] leading-relaxed border-l-2 border-[#E0AFA0] pl-4">
                          "Makeup is my creative outlet. I love bold colors and unique textures that let me express myself."
                        </div>

                        {/* Tags */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0AFA0] mb-2">
                              Makeup Preferences
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                                Vibrant Eyeshadows
                              </span>
                              <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                                Long-wear Lipstick
                              </span>
                              <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                                Dewy Foundation
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0AFA0] mb-2">
                              Social Channels
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                                TikTok Tutorials
                              </span>
                              <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                                Instagram Reels
                              </span>
                              <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                                Pinterest Boards
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 1}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${
                currentSlide === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#A62639] text-white hover:bg-[#8a1f2d] shadow-lg'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
              Previous
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${
                currentSlide === totalSlides
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#A62639] text-white hover:bg-[#8a1f2d] shadow-lg'
              }`}
            >
              Next
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Normal view mode
  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#FAF7F5]/80 backdrop-blur-sm border-b border-[#E0AFA0]/20 py-6">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Friendly Persona Brief
          </h1>
          <p className="text-[#6C5F5F]">Understanding User Research & Persona Generation</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">

        {/* Presentation Mode Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={enterPresentationMode}
            className="flex items-center gap-2 px-6 py-3 bg-[#A62639] text-white rounded-full font-semibold hover:bg-[#8a1f2d] shadow-md transition-all"
            data-testid="enter-presentation-btn"
          >
            <Presentation className="w-5 h-5" />
            Present Full Screen
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((slide) => (
            <button
              key={slide}
              onClick={() => setCurrentSlide(slide)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === slide ? 'w-8 bg-[#A62639]' : 'w-2 bg-[#E0AFA0]'
              }`}
              aria-label={`Go to slide ${slide}`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8 min-h-[500px]">
          {/* Slide 1: What We Do */}
          {currentSlide === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-4xl font-bold text-[#A62639] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  What We Do
                </h2>
                <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                <p className="text-[#333333]/80 text-lg leading-relaxed">
                  We collect and synthesize deep user research insights to build actionable personas. Our process focuses on understanding the core drivers of consumer behavior, including their motivations, pain points, daily habits, preferred channels, purchase intent, and the key factors that influence their decisions.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-2xl font-semibold text-[#A62639] py-6">
                <span className="text-4xl">👤</span>
                <span className="text-[#E0AFA0]">→</span>
                <span className="text-4xl">📊</span>
                <span className="text-[#E0AFA0]">→</span>
                <span className="text-4xl">🎯</span>
              </div>

              <div className="border-t border-[#E0AFA0]/30 my-8"></div>

              <div>
                <h3 className="text-3xl font-bold text-[#333333] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Generate Accurate Personas
                </h3>
                <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                <p className="text-[#333333]/80 text-lg leading-relaxed">
                  Transform raw data into vivid, data-backed user personas. Understand your target audience with detailed profiles that highlight their goals, frustrations, and demographic information, allowing your team to design with empathy and precision.
                </p>
              </div>
            </div>
          )}

          {/* Slide 2: Turning Insights Into Numbers */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-4xl font-bold text-[#A62639] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Turning Insights Into Numbers
                </h2>
                <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                <p className="text-[#333333]/80 text-base leading-relaxed mb-6">
                  Raw research insights—such as interview transcripts, survey responses, and user feedback—are qualitative by nature. To enable algorithmic analysis and pattern recognition, we transform this data into a numerical format through a process called vectorization.
                </p>
              </div>

              <div className="bg-[#FAF7F5] rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#A62639] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-[#333333] mb-2">Text Analysis</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Each insight is broken down into key concepts, themes, and sentiment indicators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#A62639] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-[#333333] mb-2">Numerical Encoding</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Concepts are mapped to multi-dimensional vectors that capture semantic meaning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#A62639] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-[#333333] mb-2">Pattern Recognition</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Machine learning algorithms identify similarities and group related insights together.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[#333333]/70 text-sm italic border-l-4 border-[#E0AFA0] pl-4">
                This transformation allows us to mathematically compare thousands of data points and discover meaningful patterns that would be impossible to detect manually.
              </p>
            </div>
          )}

          {/* Slide 3: How Clusters Form */}
          {currentSlide === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-4xl font-bold text-[#A62639] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  How Clusters Form
                </h2>
                <div className="h-1 w-20 bg-[#E0AFA0] mb-6"></div>
                <p className="text-[#333333]/80 text-base leading-relaxed mb-6">
                  Once insights are vectorized, we use clustering algorithms to group similar data points. This process reveals natural segments within your user base, each representing a distinct type of user with shared characteristics.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🔍</div>
                  <h4 className="font-bold text-[#333333] mb-2">Similarity Detection</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Algorithms calculate "distance" between data points in multi-dimensional space, grouping those that are closest together.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-bold text-[#333333] mb-2">Cluster Formation</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Data points naturally organize into groups, each representing users with similar behaviors and needs.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-bold text-[#333333] mb-2">Pattern Analysis</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Each cluster's characteristics are analyzed to understand what makes that user segment unique.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#FAF7F5] to-[#E0AFA0]/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">✨</div>
                  <h4 className="font-bold text-[#333333] mb-2">Persona Generation</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Clusters are transformed into detailed, actionable personas with names, stories, and goals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 4: How Personas Are Created */}
          {currentSlide === 4 && (
            <div className="space-y-6 animate-fade-in">
              {/* Main Title */}
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  How Personas Are Created
                </h2>
                <div className="h-1 w-20 bg-[#E0AFA0] mx-auto mt-4"></div>
              </div>

              {/* Section 1: What is User Research */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  What is User Research?
                </h2>
                <p className="text-[#6C5F5F] text-base mb-4">
                  Understand the foundational principles of our research methodology and how it drives meaningful insights.
                </p>
                <hr className="border-[#EAE5E3] my-4" />
                <p className="text-[#333333] text-base leading-relaxed">
                  User research is the systematic study of target users to add realistic contexts and insights to design processes. It helps us understand how people live their lives so that we can design products and services that are more effective, efficient, and enjoyable for them. We focus on qualitative data to uncover deep-seated motivations and pain points.
                </p>
              </div>

              {/* Section 2: Why Personas Matter */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Why Personas Matter?
                </h2>
                <p className="text-[#6C5F5F] text-base mb-4">
                  Discover how synthesizing research into personas creates a powerful tool for empathy and decision-making.
                </p>
                <hr className="border-[#EAE5E3] my-4" />
                <p className="text-[#333333] text-base leading-relaxed">
                  Personas are fictional characters, which you create based upon your research in order to represent the different user types that might use your service or product. Creating personas helps the design team build a shared understanding of the user, keeping the entire process human-centered and focused on solving real-world problems for real people.
                </p>
              </div>

              {/* Section 3: Our Data Clustering Method */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Our Data Clustering Method
                </h2>
                <p className="text-[#6C5F5F] text-base mb-4">
                  Learn how we process raw data into actionable patterns and groups.
                </p>
                <hr className="border-[#EAE5E3] my-4" />
                <p className="text-[#333333] text-base leading-relaxed">
                  Our proprietary algorithm analyzes qualitative feedback from interviews, surveys, and usability tests. It identifies recurring themes and behaviors, grouping similar data points into meaningful clusters. This process moves beyond surface-level comments to reveal the core motivations and frustrations that define a user group, forming the empirical foundation for each persona.
                </p>
              </div>

              {/* Section 4: How Personas Are Created */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-3xl md:text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  How Personas Are Created
                </h2>
                <p className="text-[#6C5F5F] text-base mb-4">
                  From data clusters to human stories, this is how we bring your users to life.
                </p>
                <hr className="border-[#EAE5E3] my-4" />
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left column - text content */}
                  <div className="space-y-4">
                    <p className="text-[#333333] text-base leading-relaxed">
                      We combine the strongest patterns from our data clusters to create a human-friendly persona. This process involves weaving together the most important aspects of:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-[#333333]">
                        <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                        <span><strong className="font-bold">Motivations:</strong> What drives their choices?</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#333333]">
                        <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                        <span><strong className="font-bold">Pains:</strong> What are their biggest challenges?</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#333333]">
                        <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                        <span><strong className="font-bold">Behaviors:</strong> How do they act and shop?</span>
                      </li>
                      <li className="flex items-start gap-3 text-[#333333]">
                        <span className="text-[#E0AFA0] text-xl mt-1">✓</span>
                        <span><strong className="font-bold">Influences:</strong> Where do they look for inspiration?</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right column - persona example */}
                  <div className="rounded-xl border border-[#EAE5E3] bg-[#FAF7F5] p-6">
                    <div className="space-y-6">
                      {/* Avatar and name */}
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E0AFA0] to-[#A62639] flex-shrink-0"></div>
                        <div>
                          <h3 className="text-2xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Isabella Rossi
                          </h3>
                          <p className="text-sm text-[#6C5F5F]">The Expressive Artist</p>
                        </div>
                      </div>

                      {/* Quote */}
                      <div className="text-sm italic text-[#6C5F5F] leading-relaxed border-l-2 border-[#E0AFA0] pl-4">
                        "Makeup is my creative outlet. I love bold colors and unique textures that let me express myself."
                      </div>

                      {/* Tags */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0AFA0] mb-2">
                            Makeup Preferences
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                              Vibrant Eyeshadows
                            </span>
                            <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                              Long-wear Lipstick
                            </span>
                            <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                              Dewy Foundation
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E0AFA0] mb-2">
                            Social Channels
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                              TikTok Tutorials
                            </span>
                            <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                              Instagram Reels
                            </span>
                            <span className="rounded-full bg-[#E0AFA0]/20 px-3 py-1 text-xs font-medium text-[#333333]">
                              Pinterest Boards
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              currentSlide === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#A62639] text-white hover:bg-[#8a1f2d] shadow-md'
            }`}
            data-testid="prev-slide-btn"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="text-[#6C5F5F] font-medium">
            Slide {currentSlide} of {totalSlides}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              currentSlide === totalSlides
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#A62639] text-white hover:bg-[#8a1f2d] shadow-md'
            }`}
            data-testid="next-slide-btn"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FriendlyBrief;
