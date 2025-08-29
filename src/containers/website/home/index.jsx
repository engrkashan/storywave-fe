import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../../components/navbar'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
<Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-100/30 to-pink-100/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">AI-Powered Story Generation</span>
                </div>
                <h1 className="text-6xl lg:text-7xl font-bold text-primary leading-tight">
                  Create Epic Stories
                  <br />
                  <span className="bg-gradient bg-clip-text text-transparent">In Seconds</span>
                </h1>
                <p className="text-xl text-secondary leading-relaxed max-w-xl">
                  Transform your ideas into captivating narratives with our advanced AI. From plot development to character creation, experience the future of storytelling with lightning-fast generation and unlimited creativity.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gradient-to-l transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                  Start Creating Now
                </button>
                <button className="border-2 border-primary text-primary px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300 backdrop-blur-sm">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-secondary">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse delay-100"></div>
                  <span className="font-medium">Unlimited free stories</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center"
                  alt="AI writing interface with futuristic design"
                  className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>

              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-10 text-white rounded-3xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-accent-green rounded-full animate-pulse"></div>
                      <span className="text-sm opacity-90 font-medium">AI Story Generator Active</span>
                    </div>
                    <div className="text-xs opacity-70 bg-white/10 px-3 py-1 rounded-full">v2.0</div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/15 rounded-xl p-6 backdrop-blur-sm">
                      <p className="text-sm opacity-80 mb-3 font-medium">Your prompt:</p>
                      <p className="font-semibold text-lg">
                        "A time traveler discovers their actions changed history..."
                      </p>
                    </div>

                    <div className="bg-white/15 rounded-xl p-6 backdrop-blur-sm">
                      <p className="text-sm opacity-80 mb-3 font-medium">Generated story:</p>
                      <p className="font-medium leading-relaxed text-base">
                        Dr. Elena Vasquez stepped out of the temporal pod into what should have been 2024 New York, but the skyline was wrong. Floating gardens cascaded between crystalline towers, and the air hummed with an energy she'd never felt...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-80 font-medium">Generated in 2.1 seconds</span>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-accent-yellow rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-accent-yellow rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-accent-yellow rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-4xl font-bold bg-gradient bg-clip-text text-transparent">1M+</div>
              <p className="text-secondary font-medium">Stories Generated</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold bg-gradient bg-clip-text text-transparent">50K+</div>
              <p className="text-secondary font-medium">Active Writers</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold bg-gradient bg-clip-text text-transparent">2.1s</div>
              <p className="text-secondary font-medium">Average Generation Time</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold bg-gradient bg-clip-text text-transparent">99.9%</div>
              <p className="text-secondary font-medium">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-primary mb-6">How It Works</h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Our advanced AI transforms your creative spark into compelling narratives through a simple three-step
              process
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop&crop=center"
                  alt="Person writing creative ideas"
                  className="w-full h-48 object-cover rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                <div className="w-24 h-24 bg-gradient rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-yellow rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Input Your Idea</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Share your story concept, character, or plot idea. Our AI understands context, genre, and creative
                intent to build upon your vision.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop&crop=center"
                  alt="AI neural network processing data"
                  className="w-full h-48 object-cover rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                <div className="w-24 h-24 bg-gradient rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-green rounded-full animate-ping delay-100"></div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">AI Processing</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Our neural networks analyze millions of story patterns, character archetypes, and narrative structures
                to craft your unique tale.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center"
                  alt="Completed story manuscript"
                  className="w-full h-48 object-cover rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
                <div className="w-24 h-24 bg-gradient rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-ping delay-200"></div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Get Your Story</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Receive a complete, engaging narrative with rich characters, compelling plot, and authentic dialogue
                ready to captivate your audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-primary mb-6">Powerful AI Features</h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Advanced capabilities designed for writers, creators, and storytellers who demand excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=150&fit=crop&crop=center"
                alt="Neural network visualization"
                className="w-full h-32 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Neural Plot Generation</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Advanced AI creates multi-layered plots with perfect pacing, compelling conflicts, and satisfying
                resolutions that keep readers engaged.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=150&fit=crop&crop=center"
                alt="Diverse group of people representing characters"
                className="w-full h-32 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Dynamic Characters</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Generate complex characters with unique personalities, realistic motivations, and authentic dialogue
                that brings your stories to life.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=150&fit=crop&crop=center"
                alt="Fantasy landscape with mountains and castles"
                className="w-full h-32 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">World Building</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Create immersive settings and rich environments that serve as the perfect backdrop for your narrative
                adventures.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=150&fit=crop&crop=center"
                alt="Lightning bolt representing speed"
                className="w-full h-32 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Lightning Speed</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Generate complete stories in under 3 seconds. Perfect for overcoming writer's block or meeting tight
                deadlines.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=150&fit=crop&crop=center"
                alt="Stack of books representing different genres"
                className="w-full h-32 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Genre Mastery</h3>
              <p className="text-secondary leading-relaxed text-lg">
                From sci-fi epics to romantic comedies, our AI understands genre conventions and creates authentic
                stories in any style.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=150&fit=crop&crop=center"
                alt="Artist's palette representing style customization"
                className="w-full h-32 object-cover rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Style Adaptation</h3>
              <p className="text-secondary leading-relaxed text-lg">
                Customize tone, complexity, and writing style to match your vision. From children's tales to literary
                masterpieces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-24 bg-gradient-to-br from-purple-50/30 to-pink-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-primary mb-6">Story Examples</h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              See the quality and creativity of AI-generated stories across different genres and styles
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=200&fit=crop&crop=center"
                alt="Futuristic space station"
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
              <div className="flex items-center justify-between mb-6">
                <span className="bg-gradient text-white px-4 py-2 rounded-full text-sm font-medium">
                  Sci-Fi Thriller
                </span>
                <span className="text-sm text-secondary">Generated in 2.3s</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">The Last Signal</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                "Commander Sarah Chen's hands trembled as she decoded the final transmission from Earth. The message was
                impossible—it had been sent from a future that no longer existed. As the space station's AI began to
                malfunction, displaying memories that weren't its own, Sarah realized the signal wasn't just a warning
                about humanity's fate. It was a key to changing it, hidden in the quantum echoes of a timeline that had
                been erased..."
              </p>
              <div className="flex items-center space-x-4 text-sm text-secondary">
                <span>• 1,247 words</span>
                <span>• 3 characters</span>
                <span>• Plot twists: 2</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=200&fit=crop&crop=center"
                alt="Ancient fantasy map with magical elements"
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
              <div className="flex items-center justify-between mb-6">
                <span className="bg-gradient text-white px-4 py-2 rounded-full text-sm font-medium">
                  Fantasy Adventure
                </span>
                <span className="text-sm text-secondary">Generated in 1.9s</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">The Mapmaker's Daughter</h3>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                "Elara had always known her father's maps were special, but she never imagined they were doorways. When
                the parchment began to glow under the full moon, revealing paths that led beyond the edges of the known
                world, she understood why the Shadow Guild had been hunting her family for generations. Each map wasn't
                just a guide to distant lands—it was a prison, holding back ancient evils that her bloodline had sworn
                to contain..."
              </p>
              <div className="flex items-center space-x-4 text-sm text-secondary">
                <span>• 2,156 words</span>
                <span>• 5 characters</span>
                <span>• Magic system: Cartomancy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-primary mb-6">What Writers Say</h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied writers who've transformed their creative process with StoryWave
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-8 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
                alt="Maria Rodriguez - Bestselling Author"
                className="w-16 h-16 rounded-full object-cover mb-6 border-4 border-white shadow-lg"
              />
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent-yellow text-xl">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                "StoryWave has revolutionized my writing process. I can generate compelling story outlines in seconds
                and focus on what I love most—developing characters and refining prose."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">MR</span>
                </div>
                <div>
                  <p className="font-bold text-primary">Maria Rodriguez</p>
                  <p className="text-sm text-secondary">Bestselling Author</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-pink-50/30 rounded-2xl p-8 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
                alt="James Chen - Content Creator"
                className="w-16 h-16 rounded-full object-cover mb-6 border-4 border-white shadow-lg"
              />
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent-yellow text-xl">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                "As a content creator, I need fresh stories constantly. This AI doesn't just generate text—it creates
                engaging narratives that my audience loves. Game-changer!"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">JC</span>
                </div>
                <div>
                  <p className="font-bold text-primary">James Chen</p>
                  <p className="text-sm text-secondary">Content Creator</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl p-8 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
                alt="Sarah Parker - Indie Publisher"
                className="w-16 h-16 rounded-full object-cover mb-6 border-4 border-white shadow-lg"
              />
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent-yellow text-xl">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-secondary leading-relaxed text-lg mb-6">
                "I was skeptical about AI writing, but StoryGen creates stories with genuine emotion and compelling
                characters. It's like having a creative partner who never runs out of ideas."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">SP</span>
                </div>
                <div>
                  <p className="font-bold text-primary">Sarah Parker</p>
                  <p className="text-sm text-secondary">Indie Publisher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-primary mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
              Choose the perfect plan for your creative needs. All plans include unlimited revisions and export options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">Starter</h3>
                <div className="text-4xl font-bold text-primary mb-2">Free</div>
                <p className="text-secondary">Perfect for trying out AI storytelling</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">5 stories per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">Basic genres</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">Standard export formats</span>
                </li>
              </ul>
              <button className="w-full border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300">
                Get Started
              </button>
            </div>

            <div className="bg-gradient rounded-2xl p-8 text-white shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent-yellow text-primary px-6 py-2 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Creator</h3>
                <div className="text-4xl font-bold mb-2">
                  $19<span className="text-lg opacity-80">/month</span>
                </div>
                <p className="opacity-90">For serious writers and creators</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Unlimited stories</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>All genres & styles</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Advanced customization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-white text-primary py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300">
                Start Free Trial
              </button>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-primary mb-2">
                  $99<span className="text-lg opacity-60">/month</span>
                </div>
                <p className="text-secondary">For teams and organizations</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">Everything in Creator</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">Team collaboration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">API access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-secondary">Custom integrations</span>
                </li>
              </ul>
              <button className="w-full border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-purple-50/30">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="relative mb-12">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=300&fit=crop&crop=center"
              alt="Writers collaborating with AI technology"
              className="w-full h-64 object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-5xl font-bold mb-4">Ready to Transform Your Storytelling?</h2>
                <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
                  Join over 50,000 writers who are already using StoryWave to bring their creative visions to life.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button className="btn-primary px-12 py-4 rounded-xl font-semibold text-xl hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Start Creating Stories
            </button>
            <button className="border-2 border-primary text-primary px-12 py-4 rounded-xl font-semibold text-xl hover:bg-primary hover:text-white transition-all duration-300">
              Schedule Demo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-secondary">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse"></div>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse delay-100"></div>
              <span className="font-medium">7-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse delay-200"></div>
              <span className="font-medium">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-light py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold text-primary">StoryWave</span>
              </div>
              <p className="text-secondary leading-relaxed text-lg max-w-md">
                The most advanced AI story generator for writers, creators, and storytellers. Transform your ideas into
                compelling narratives in seconds.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer">
                  <span className="text-white">📧</span>
                </div>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer">
                  <span className="text-white">🐦</span>
                </div>
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors cursor-pointer">
                  <span className="text-white">📱</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-primary mb-6 text-lg">Product</h4>
              <div className="space-y-3">
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Features
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Pricing
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Examples
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  API Documentation
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Integrations
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-primary mb-6 text-lg">Company</h4>
              <div className="space-y-3">
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  About Us
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Blog
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Careers
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Press Kit
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-primary mb-6 text-lg">Support</h4>
              <div className="space-y-3">
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Help Center
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Community
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Privacy Policy
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Terms of Service
                </Link>
                <Link to="#" className="block text-secondary hover:text-primary transition-colors font-medium">
                  Status Page
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-secondary font-medium">© 2024 StoryWave. All rights reserved.</p>
              <div className="flex items-center space-x-6 text-sm text-secondary">
                <span>Made with ❤️ for storytellers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
