import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Code, Network, BarChart3, Lightbulb, Presentation, X } from 'lucide-react';

const ClusteringTechnical = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const totalSlides = 5;

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
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const exitPresentationMode = () => {
    setIsPresentationMode(false);
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
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

  // Handle fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        setIsPresentationMode(false);
      }
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

  // Helper function to render current slide content
  const renderCurrentSlideContent = () => {
    if (currentSlide === 1) {
      return (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Insight-to-Persona Pipeline
            </h2>
            <p className="text-[#333333]/70 text-lg max-w-2xl mx-auto">
              A step-by-step overview of how we transform raw data into detailed, actionable user personas.
            </p>
          </div>

          <div className="relative space-y-6">
            {/* Vertical Timeline Line */}
            <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-[#E0AFA0]/50 hidden md:block"></div>

            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 md:w-20 h-12 md:h-20 bg-white border border-[#E0AFA0]/50 text-[#A62639] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold z-10">
                01
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                  <Filter className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Insight Collection
                  </h3>
                  <p className="text-[#333333]/70 text-sm leading-relaxed">
                    This initial stage involves gathering raw user data from various sources, such as interviews, surveys, and feedback forms, to build a foundational dataset.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 md:w-20 h-12 md:h-20 bg-white border border-[#E0AFA0]/50 text-[#A62639] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold z-10">
                02
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                  <Code className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Insight Vectorisation
                  </h3>
                  <p className="text-[#333333]/70 text-sm leading-relaxed">
                    Qualitative data is converted into a quantifiable, numerical format. This process allows our algorithms to understand and process the nuances of user feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 md:w-20 h-12 md:h-20 bg-white border border-[#E0AFA0]/50 text-[#A62639] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold z-10">
                03
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                  <Network className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Similarity & Clustering
                  </h3>
                  <p className="text-[#333333]/70 text-sm leading-relaxed">
                    Using advanced algorithms, we group similar insights together. This helps to identify patterns and common themes within the vast pool of user data.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 md:w-20 h-12 md:h-20 bg-white border border-[#E0AFA0]/50 text-[#A62639] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold z-10">
                04
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Cluster Profiling
                  </h3>
                  <p className="text-[#333333]/70 text-sm leading-relaxed">
                    We analyze each cluster to identify its dominant themes, pain points, and motivations, forming the core identity of a potential user group.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 md:w-20 h-12 md:h-20 bg-white border border-[#E0AFA0]/50 text-[#A62639] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold z-10">
                05
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Persona Generation
                  </h3>
                  <p className="text-[#333333]/70 text-sm leading-relaxed">
                    A foundational persona is synthesized from each cluster profile, encapsulating the key characteristics and goals of the identified user segment.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 md:w-20 h-12 md:h-20 bg-white border border-[#E0AFA0]/50 text-[#A62639] rounded-full flex items-center justify-center text-xl md:text-2xl font-bold z-10">
                06
              </div>
              <div className="flex-1 bg-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🎨</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Demographic & Behavioural Painting
                  </h3>
                  <p className="text-[#333333]/70 text-sm leading-relaxed">
                    We enrich the core persona with realistic demographic data, behavioral patterns, and personal details to bring them to life as a relatable character.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 2) {
      return (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Insight Vectorisation
            </h2>
            <p className="text-lg text-[#6C5F5F] max-w-3xl mx-auto">
              An overview of how user insights are processed and clustered to generate meaningful personas.
            </p>
          </div>

          {/* Introduction */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h3 className="text-2xl font-bold text-[#333333] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Introduction to Vectorisation
            </h3>
            <p className="text-[#6C5F5F] leading-relaxed">
              Insight vectorisation is the process of converting qualitative user feedback into a quantitative format. This allows our system to identify patterns and group similar insights together based on their underlying meaning, forming the foundation of our data-driven personas.
            </p>
          </section>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Categories Used for Clustering */}
            <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h3 className="text-2xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Categories Used for Clustering
              </h3>
              <p className="text-[#6C5F5F] text-sm mb-6">
                The following psychographic categories are actively used to group user insights.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E0AFA0]/20 text-[#E0AFA0] flex items-center justify-center">
                    <span className="text-xl">❤️</span>
                  </div>
                  <span className="text-[#333333] font-medium">Motivations</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E0AFA0]/20 text-[#E0AFA0] flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <span className="text-[#333333] font-medium">Pain Points</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E0AFA0]/20 text-[#E0AFA0] flex items-center justify-center">
                    <span className="text-xl">🛒</span>
                  </div>
                  <span className="text-[#333333] font-medium">Purchase Intent</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E0AFA0]/20 text-[#E0AFA0] flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                  <span className="text-[#333333] font-medium">Influence Effect</span>
                </li>
              </ul>
            </section>

            {/* Categories Excluded from Clustering */}
            <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h3 className="text-2xl font-bold text-[#333333] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Categories Excluded from Clustering
              </h3>
              <p className="text-[#6C5F5F] text-sm mb-6">
                These data points are retained as metadata but not used for clustering.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <span className="text-xl">🏃</span>
                  </div>
                  <span className="text-[#333333]">Behaviours</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <span className="text-xl">🌐</span>
                  </div>
                  <span className="text-[#333333]">Channels</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <span className="text-[#333333]">Demographics</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <span className="text-xl">📱</span>
                  </div>
                  <span className="text-[#333333]">Platform</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <span className="text-xl">🔬</span>
                  </div>
                  <span className="text-[#333333]">Method</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <span className="text-[#333333]">Quotes & Notes</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Rationale for Selection */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h3 className="text-2xl font-bold text-[#333333] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Rationale for Selection
            </h3>
            <p className="text-[#6C5F5F] leading-relaxed">
              Our clustering model prioritizes psychographic data—the 'why' behind user actions—over demographic or behavioral data. By focusing on motivations and pain points, we create personas that represent core user mindsets rather than superficial groupings. Demographics and behaviors are then used to enrich these core personas, providing a complete and actionable profile.
            </p>
          </section>

          {/* Implications & Next Steps */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h3 className="text-2xl font-bold text-[#333333] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Implications & Next Steps
            </h3>
            <p className="text-[#6C5F5F] leading-relaxed">
              This focused vectorisation ensures that the generated personas are deeply rooted in user psychology, leading to more empathetic and effective product decisions. The output of this stage directly feeds into the persona generation algorithm, which synthesizes these clustered insights into distinct, narrative-driven user archetypes.
            </p>
          </section>
        </div>
      );
    }

    if (currentSlide === 3) {
      return (
        <div className="space-y-8 animate-fade-in">
          {/* Progress bar */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-medium text-[#A62639]">3 / 5</span>
            <div className="h-2 w-full flex-1 rounded-full bg-[#E0AFA0]/30">
              <div className="h-2 w-3/5 rounded-full bg-[#A62639]"></div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Clustering Technique
            </h2>
            <div className="mt-2 h-px w-20 bg-[#E0AFA0]"></div>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-[#333333]/80">
              Our hybrid technique ensures nuanced and accurate persona grouping. We combine several powerful methods to identify meaningful patterns within your user data, moving beyond simple demographics to uncover behavioral archetypes.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left column - Text content */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <BarChart3 className="w-6 h-6 text-[#A62639] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-[#333333] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Multi-dimensional Vectors
                  </h3>
                  <p className="text-sm text-[#333333]/70">
                    User attributes and behaviors are converted into numeric vectors, creating a rich, multi-dimensional data space.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Network className="w-6 h-6 text-[#A62639] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-[#333333] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Cosine Similarity
                  </h3>
                  <p className="text-sm text-[#333333]/70">
                    We measure the angular distance between vectors to determine similarity, grouping users with related interests and actions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl text-[#A62639] mt-1 flex-shrink-0">🎯</span>
                <div>
                  <h3 className="text-lg font-bold text-[#333333] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    K-Means Centroid Grouping
                  </h3>
                  <p className="text-sm text-[#333333]/70">
                    An iterative algorithm groups vectors around central points (centroids), forming distinct user clusters.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Lightbulb className="w-6 h-6 text-[#A62639] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-[#333333] mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Least-Square Refinement
                  </h3>
                  <p className="text-sm text-[#333333]/70">
                    Cluster centroids are fine-tuned by minimizing the squared distance of vectors, ensuring optimal group cohesion.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column - Visual diagram */}
            <div className="flex items-center justify-center rounded-lg bg-[#FAF7F5] p-6 md:p-8">
              <div className="flex w-full flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center text-[#A62639] mb-2">
                    <span className="text-4xl">[</span>
                    <span className="text-4xl">]</span>
                  </div>
                  <span className="text-sm font-medium text-[#333333]/80">Vectors</span>
                </div>
                <span className="text-3xl text-[#E0AFA0] transform rotate-0 sm:rotate-0">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#A62639] flex items-center justify-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-[#A62639]"></div>
                  </div>
                  <span className="text-sm font-medium text-[#333333]/80">Centroid</span>
                </div>
                <span className="text-3xl text-[#E0AFA0] transform rotate-0 sm:rotate-0">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center mb-2">
                    <div className="relative w-full h-full">
                      <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#A62639]"></div>
                      <div className="absolute top-1/2 left-1/4 w-5 h-5 rounded-full bg-[#A62639]"></div>
                      <div className="absolute bottom-0 right-1/4 w-3 h-3 rounded-full bg-[#A62639]"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#333333]/80">Clusters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentSlide === 4) {
      return (
        <div className="space-y-8 animate-fade-in">
          {/* Slide indicator dots */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-1.5 w-8 rounded-full bg-[#E0AFA0]"></div>
              <div className="h-1.5 w-8 rounded-full bg-[#E0AFA0]"></div>
              <div className="h-1.5 w-8 rounded-full bg-[#E0AFA0]"></div>
              <div className="h-1.5 w-8 rounded-full bg-[#A62639]"></div>
              <div className="h-1.5 w-8 rounded-full bg-[#E0AFA0]"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#A62639]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Cluster Profiling
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#333333]/80">
              From individual scores to collective identity, we aggregate insight metrics to define and profile distinct user clusters.
            </p>
          </div>

          {/* Score cards */}
          <div className="space-y-6">
            {/* Motivations Score */}
            <section className="rounded-lg border border-[#E0AFA0]/30 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-[#A62639]">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Motivations Score
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#333333]/70">
                    We analyze the core drivers behind user choices. By aggregating motivation scores, we identify the primary desires and aspirations that define each cluster, revealing what truly excites them about a product or service.
                  </p>
                </div>
              </div>
            </section>

            {/* Pain Points Score */}
            <section className="rounded-lg border border-[#E0AFA0]/30 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-[#A62639]">
                  <span className="text-3xl">😔</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Pain Points Score
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#333333]/70">
                    Understanding frustrations is key. This score highlights the most significant challenges and obstacles users face. Within a cluster, common pain points emerge, pointing to critical areas for improvement and innovation.
                  </p>
                </div>
              </div>
            </section>

            {/* Purchase Intent Score */}
            <section className="rounded-lg border border-[#E0AFA0]/30 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-[#A62639]">
                  <span className="text-3xl">🛒</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Purchase Intent Score
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#333333]/70">
                    This metric quantifies a user's likelihood to convert. By rolling up these scores, we can profile clusters based on their buying readiness, from casual browsers to highly-motivated shoppers, enabling targeted sales strategies.
                  </p>
                </div>
              </div>
            </section>

            {/* Influence Effect Score */}
            <section className="rounded-lg border border-[#E0AFA0]/30 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-[#A62639]">
                  <span className="text-3xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Influence Effect Score
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#333333]/70">
                    We measure how susceptible users are to external factors like reviews, social trends, or recommendations. This score helps identify which clusters are tastemakers versus followers, shaping influencer and community marketing.
                  </p>
                </div>
              </div>
            </section>

            {/* Determining Cluster Identity */}
            <section className="rounded-lg border border-[#E0AFA0]/30 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 text-[#A62639]">
                  <span className="text-3xl">🏆</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#333333]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Determining Cluster Identity
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#333333]/70">
                    The culmination of our analysis. By synthesizing the aggregated scores for motivations, pain points, intent, and influence, we assign a distinct, descriptive identity to each cluster, transforming raw data into a strategic asset.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      );
    }

    if (currentSlide === 5) {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Persona Generation
            </h2>
            <p className="text-[#333333]/70 text-lg max-w-2xl mx-auto">
              This is the final stage where clustered insights are synthesized into rich, narrative-driven user personas.
            </p>
          </div>

          <div className="bg-[#FAF7F5] rounded-xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-[#333333] mb-3">The Generation Process</h3>
            <p className="text-[#333333]/70">
              Our algorithm synthesizes the vectorized data into distinct user archetypes. Each step in the process builds upon the last, transforming raw data into a relatable and actionable persona that represents a key segment of your audience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-[#E0AFA0]/20 text-[#A62639] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#333333] mb-2">Select Strong Patterns</h4>
              <p className="text-[#333333]/70 text-sm">
                Identify the most cohesive and significant insight clusters to form the core of each persona.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-[#E0AFA0]/20 text-[#A62639] rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#333333] mb-2">Incorporate Frequencies</h4>
              <p className="text-[#333333]/70 text-sm">
                Assign weight to patterns based on their prevalence in the data, ensuring personas reflect reality.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-[#E0AFA0]/20 text-[#A62639] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h4 className="font-bold text-[#333333] mb-2">Identify Demographics</h4>
              <p className="text-[#333333]/70 text-sm">
                Layer demographic metadata onto the psychographic core to create a recognizable character.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-[#E0AFA0]/20 text-[#A62639] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="font-bold text-[#333333] mb-2">Add Verbatim Quotes</h4>
              <p className="text-[#333333]/70 text-sm">
                Select powerful, representative quotes from the raw data to give each persona a unique voice.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-[#E0AFA0]/20 text-[#A62639] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h4 className="font-bold text-[#333333] mb-2">Write Lifestyle Summary</h4>
              <p className="text-[#333333]/70 text-sm">
                Craft a narrative summary that brings the data to life, describing the persona's daily life and goals.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#A62639] to-[#8a1f2d] text-white rounded-xl p-6 mt-8">
            <h4 className="font-bold text-xl mb-2">The Result</h4>
            <p className="text-white/90 text-sm">
              A complete, data-backed user persona that combines quantitative rigor with qualitative depth. Teams can now make informed decisions grounded in real user behavior and needs.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  // If in presentation mode, render full-screen version
  if (isPresentationMode) {
    return (
      <div className="fixed inset-0 bg-[#FAF7F5] flex items-center justify-center p-8 md:p-16" style={{ zIndex: 9999 }}>
        {/* Exit button */}
        <button
          onClick={exitPresentationMode}
          className="fixed top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
          style={{ zIndex: 10000 }}
          data-testid="exit-presentation-btn"
        >
          <X className="w-6 h-6 text-[#A62639]" />
        </button>

        {/* Slide counter */}
        <div className="fixed top-4 left-4 px-4 py-2 bg-white/90 rounded-full shadow-lg" style={{ zIndex: 10000 }}>
          <span className="text-sm font-semibold text-[#6C5F5F]">{currentSlide} / {totalSlides}</span>
        </div>

        {/* Main slide content */}
        <div className="w-full h-full max-w-6xl max-h-full flex flex-col">
          <div className="flex-1 bg-white rounded-2xl shadow-2xl p-8 md:p-12 overflow-y-auto presentation-slide-content">
            {renderCurrentSlideContent()}
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
              data-testid="prev-slide-presentation-btn"
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
              data-testid="next-slide-presentation-btn"
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
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cluster & Persona Technical Slides
          </h1>
          <p className="text-[#6C5F5F]">Deep Dive into Our Insight-to-Persona Pipeline</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">

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
          {[1, 2, 3, 4, 5].map((slide) => (
            <button
              key={slide}
              onClick={() => setCurrentSlide(slide)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === slide ? 'w-8 bg-[#A62639]' : 'w-2 bg-[#E0AFA0]'
              }`}
              aria-label={`Go to slide ${slide}`}
              data-testid={`slide-indicator-${slide}`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8 min-h-[600px]">
          {renderCurrentSlideContent()}
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

export default ClusteringTechnical;
