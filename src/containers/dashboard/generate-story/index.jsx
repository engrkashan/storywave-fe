"use client"

import { useState } from "react"

const GenerateStory = () => {
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState(null)
  const [storyLength, setStoryLength] = useState(3)
  const [formData, setFormData] = useState({
    url: "",
    concept: "",
    tone: "",
  })

  const handleGenerate = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setStory({
        script:
          "Once upon a time in a digital realm where creativity knew no bounds, an AI storyteller began weaving tales that captivated hearts and minds across the world...",
        audio: "audio_url",
        graphics: "/magical-digital-storytelling-scene.png",
      })
      setLoading(false)
    }, 3000)
  }

  const lengthLabels = ["Brief", "Short", "Medium", "Long", "Epic"]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Left Panel - Forms */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto  thin-scrollbar ">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">  
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Story</h1>
              <p className="text-gray-600 text-xl">Fill in the details to generate your AI-powered story</p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Reference URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/inspiration"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="text-indigo-600 font-medium">Upload a file</span>
                      <span className="text-gray-500"> or drag and drop</span>
                      <input type="file" className="sr-only" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>

              {/* Story Concept */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Concept</label>
                <textarea
                  placeholder="Describe your story idea, characters, setting, or theme..."
                  value={formData.concept}
                  onChange={(e) => handleInputChange("concept", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors resize-none"
                  rows="4"
                />
                <div className="text-xs text-gray-500 mt-1">{formData.concept.length}/500 characters</div>
              </div>

              {/* Voice Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange("tone", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                >
                  <option value="">Select tone...</option>
                  <option value="excited">Excited & Energetic</option>
                  <option value="calm">Calm & Soothing</option>
                  <option value="mysterious">Mysterious & Intriguing</option>
                  <option value="professional">Professional & Informative</option>
                  <option value="playful">Playful & Fun</option>
                </select>
              </div>

              {/* Story Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Length</label>
                <div className="px-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={storyLength}
                    onChange={(e) => setStoryLength(e.target.value)}
                    className="w-full h-2 bg-gradient rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {lengthLabels.map((label, index) => (
                      <span key={index} className={storyLength == index + 1 ? "text-indigo-600 font-medium" : ""}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 bg-secondary-dark text-white rounded-lg  transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  "Generate Story"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto thin-scrollbar">
          <div className="p-8">
            {/* Preview Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Preview</h2>
              <p className="text-gray-600 text-xl">See your story details as you type</p>
            </div>

            {/* Generated Story Results */}
            {story && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Graphics</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={story.graphics || "/placeholder.svg"}
                      alt="Generated Graphics"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Generated Script</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{story.script}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0v5a3 3 0 11-6 0V7a3 3 0 016 0v5z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Audio</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <audio controls className="w-full">
                        <source src={story.audio} type="audio/mpeg" />
                      </audio>
                    </div>
                  </div>


                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 py-2 px-4 bg-white border border-[var(--secondary-dark)] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Download
                  </button>
                  <button className="flex-1 py-2 px-4 bg-secondary-dark text-white rounded-lg transition-colors text-sm font-medium">
                    Share
                  </button>
                </div>
              </div>
            )}

            {!story && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Your Story</h3>
                <p className="text-gray-500 text-sm">
                  Fill out the form and generate your story to see the results here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateStory
