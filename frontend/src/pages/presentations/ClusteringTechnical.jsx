import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Code, Network, BarChart3, Lightbulb } from 'lucide-react';

const ClusteringTechnical = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
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

  return (
    <div className="min-h-screen bg-[#FAF7F5] py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#A62639] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cluster & Persona Technical Slides
          </h1>
          <p className="text-[#6C5F5F]">Deep Dive into Our Insight-to-Persona Pipeline</p>
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
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8 min-h-[600px]">
          {/* Slide 1: Overview Pipeline */}
          {currentSlide === 1 && (
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
                  <div className="flex-shrink-0 w-20 h-20 bg-[#A62639] text-white rounded-full flex items-center justify-center text-2xl font-bold z-10">
                    01
                  </div>
                  <div className="flex-1 bg-[#FAF7F5] rounded-xl p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                      <Filter className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-2">Insight Collection</h3>
                      <p className="text-[#333333]/70 text-sm">
                        This initial stage involves gathering raw user data from various sources, such as interviews, surveys, and feedback forms, to build a foundational dataset.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-[#A62639] text-white rounded-full flex items-center justify-center text-2xl font-bold z-10">
                    02
                  </div>
                  <div className="flex-1 bg-[#FAF7F5] rounded-xl p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                      <Code className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-2">Insight Vectorisation</h3>
                      <p className="text-[#333333]/70 text-sm">
                        Qualitative data is converted into a quantifiable, numerical format. This process allows our algorithms to understand and process the nuances of user feedback.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-[#A62639] text-white rounded-full flex items-center justify-center text-2xl font-bold z-10">
                    03
                  </div>
                  <div className="flex-1 bg-[#FAF7F5] rounded-xl p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                      <Network className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-2">Similarity & Clustering</h3>
                      <p className="text-[#333333]/70 text-sm">
                        Using advanced algorithms, we group similar insights together. This helps to identify patterns and common themes within the vast pool of user data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-[#A62639] text-white rounded-full flex items-center justify-center text-2xl font-bold z-10">
                    04
                  </div>
                  <div className="flex-1 bg-[#FAF7F5] rounded-xl p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#E0AFA0]/20 text-[#A62639] rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] mb-2">Persona Generation</h3>
                      <p className="text-[#333333]/70 text-sm">
                        Finally, each cluster is analyzed and transformed into a detailed user persona with demographic information, behavioral patterns, and motivational drivers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: Insight Vectorisation Part 1 */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Insight Vectorisation
                </h2>
                <p className="text-[#333333]/70 text-lg">
                  Converting qualitative research into quantifiable numerical representations
                </p>
              </div>

              <div className="bg-[#FAF7F5] rounded-xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-[#333333] mb-4">The Transformation Process</h3>
                <p className="text-[#333333]/70 leading-relaxed mb-6">
                  Vectorization is the bridge between human language and machine understanding. By converting text into numerical vectors, we enable algorithms to mathematically compare and analyze qualitative insights at scale.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <h4 className="font-bold text-[#333333] mb-2">Input</h4>
                    <p className="text-sm text-[#333333]/70">Raw text from user research</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">🔢</div>
                    <h4 className="font-bold text-[#333333] mb-2">Processing</h4>
                    <p className="text-sm text-[#333333]/70">Natural language processing & embedding</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">📊</div>
                    <h4 className="font-bold text-[#333333] mb-2">Output</h4>
                    <p className="text-sm text-[#333333]/70">Multi-dimensional numerical vectors</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-l-4 border-[#A62639] pl-6">
                  <h4 className="font-bold text-[#333333] mb-2">Semantic Encoding</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Each word and phrase is mapped to a point in high-dimensional space, where proximity indicates semantic similarity. This allows "excited" and "enthusiastic" to be mathematically close.
                  </p>
                </div>

                <div className="border-l-4 border-[#E0AFA0] pl-6">
                  <h4 className="font-bold text-[#333333] mb-2">Context Preservation</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Advanced models capture not just individual words, but their relationships and context, ensuring the true meaning of insights is preserved in numerical form.
                  </p>
                </div>

                <div className="border-l-4 border-[#A62639] pl-6">
                  <h4 className="font-bold text-[#333333] mb-2">Dimensionality</h4>
                  <p className="text-[#333333]/70 text-sm">
                    Typical vectors contain 384-1536 dimensions, each capturing a different aspect of meaning. This high dimensionality enables nuanced comparison and clustering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 3: Insight Vectorisation Part 2 - Technical Details */}
          {currentSlide === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Vectorisation: Technical Deep Dive
                </h2>
                <p className="text-[#333333]/70 text-lg">
                  Understanding the mathematics behind semantic representation
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#A62639]/5 to-[#E0AFA0]/5 rounded-xl p-6">
                  <div className="w-12 h-12 bg-[#A62639] text-white rounded-lg flex items-center justify-center mb-4">
                    <Code className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#333333] mb-3">Embedding Models</h3>
                  <p className="text-[#333333]/70 text-sm mb-4">
                    We use state-of-the-art transformer-based models trained on vast corpora to generate semantically meaningful embeddings.
                  </p>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <span className="text-[#A62639] mt-1">•</span>
                      <span>BERT for contextual understanding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A62639] mt-1">•</span>
                      <span>Sentence transformers for paragraph-level encoding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A62639] mt-1">•</span>
                      <span>Custom fine-tuning on domain data</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-[#A62639]/5 to-[#E0AFA0]/5 rounded-xl p-6">
                  <div className="w-12 h-12 bg-[#A62639] text-white rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#333333] mb-3">Vector Mathematics</h3>
                  <p className="text-[#333333]/70 text-sm mb-4">
                    Vectors enable precise mathematical operations that reveal semantic relationships.
                  </p>
                  <ul className="space-y-2 text-sm text-[#333333]/70">
                    <li className="flex items-start gap-2">
                      <span className="text-[#A62639] mt-1">•</span>
                      <span>Cosine similarity measures semantic closeness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A62639] mt-1">•</span>
                      <span>Euclidean distance quantifies differences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#A62639] mt-1">•</span>
                      <span>Vector arithmetic reveals analogies</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#FAF7F5] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#333333] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-[#A62639]" />
                  Example: Semantic Similarity
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-semibold text-[#333333]">Insight A:</span>
                    <span className="text-[#333333]/70"> "Users find the checkout process confusing"</span>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <span className="font-semibold text-[#333333]">Insight B:</span>
                    <span className="text-[#333333]/70"> "Customers struggle with payment steps"</span>
                  </div>
                  <div className="bg-[#A62639]/10 rounded-lg p-4 border-2 border-[#A62639]">
                    <span className="font-semibold text-[#A62639]">Cosine Similarity:</span>
                    <span className="text-[#333333]"> 0.89 (High similarity - will be clustered together)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 4: Similarity & Clustering */}
          {currentSlide === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-[#A62639] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Similarity & Clustering
                </h2>
                <p className="text-[#333333]/70 text-lg">
                  Discovering natural user segments through algorithmic pattern detection
                </p>
              </div>

              <div className="bg-[#FAF7F5] rounded-xl p-8 mb-6">
                <h3 className="text-2xl font-bold text-[#333333] mb-4">Clustering Algorithms</h3>
                <p className="text-[#333333]/70 leading-relaxed mb-6">
                  Once insights are vectorized, machine learning algorithms automatically group similar data points without any predefined categories. This unsupervised approach reveals organic user segments.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-[#A62639]/10 text-[#A62639] rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                      K
                    </div>
                    <h4 className="font-bold text-[#333333] mb-2">K-Means Clustering</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Partitions data into K distinct clusters by minimizing within-cluster variance. Fast and effective for well-separated groups.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-[#A62639]/10 text-[#A62639] rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                      H
                    </div>
                    <h4 className="font-bold text-[#333333] mb-2">Hierarchical Clustering</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Builds a tree of clusters, allowing analysis at different granularity levels. Useful for understanding nested user segments.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-[#A62639]/10 text-[#A62639] rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                      D
                    </div>
                    <h4 className="font-bold text-[#333333] mb-2">DBSCAN</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Density-based clustering that can find arbitrarily shaped clusters and identify outliers. Great for noisy real-world data.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="w-12 h-12 bg-[#A62639]/10 text-[#A62639] rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                      G
                    </div>
                    <h4 className="font-bold text-[#333333] mb-2">Gaussian Mixture Models</h4>
                    <p className="text-[#333333]/70 text-sm">
                      Probabilistic approach that assigns soft cluster memberships. Users can belong to multiple personas with different probabilities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#A62639]/10 to-[#E0AFA0]/10 rounded-xl p-6 border-l-4 border-[#A62639]">
                <h4 className="font-bold text-[#333333] mb-2">Optimal Cluster Count</h4>
                <p className="text-[#333333]/70 text-sm">
                  We use the Elbow Method and Silhouette Analysis to determine the ideal number of personas. Too few loses nuance; too many creates overlap. Typically, 3-7 personas provide the right balance.
                </p>
              </div>
            </div>
          )}

          {/* Slide 5: Persona Generation */}
          {currentSlide === 5 && (
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

export default ClusteringTechnical;
