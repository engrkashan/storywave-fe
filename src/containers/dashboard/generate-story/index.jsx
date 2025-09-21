import { useState } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { generateStory } from "../../../redux/slices/story.slice";
import toast from "react-hot-toast";

const GenerateStory = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [storyLength, setStoryLength] = useState(3);
  const [formData, setFormData] = useState({
    url: "",
    concept: "",
    tone: "",
    storyType: "",
  });

  const handleGenerate = async () => {
    if (!formData.concept && !formData.url) {
      toast.error("Please provide a story concept or URL");
      return;
    }

    const payload = {
      textIdea: formData.concept,
      url: formData.url,
      storyType: formData.storyType,
      voiceTone: formData.tone,
      storyLength,
      adminId: Cookies.get("userId")
    };

    try {
      setLoading(true);
      await dispatch(generateStory(payload)).unwrap();
      toast.success("Story generated successfully 🎉");
    } catch (err) {
      toast.error(err?.error || "Failed to generate story ❌");
    } finally {
      setLoading(false);
    }
  };

  const lengthLabels = ["Brief", "Short", "Medium", "Long", "Epic"];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Left Panel - Forms */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto thin-scrollbar">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Story Builder
              </h1>
              <p className="text-gray-600 text-xl">
                Fill in the details to generate your AI-powered story
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Reference URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/inspiration"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                />
              </div>

              {/* Story Concept */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Concept (optional)
                </label>
                <textarea
                  placeholder="Describe your story idea..."
                  value={formData.concept}
                  onChange={(e) => handleInputChange("concept", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors resize-none"
                  rows="4"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.concept.length}/500 characters
                </div>
              </div>

              {/* Voice Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Tone <span className="text-red-500">*</span>
                </label>
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

              {/* Story Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.storyType}
                  onChange={(e) => handleInputChange("storyType", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                >
                  <option value="">Select story type...</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="sci-fi">Sci-Fi</option>
                  <option value="mystery">Mystery</option>
                  <option value="adventure">Adventure</option>
                  <option value="romance">Romance</option>
                  <option value="horror">Horror</option>
                  <option value="comedy">Comedy</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              {/* Story Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Length <span className="text-red-500">*</span>
                </label>
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
                      <span
                        key={index}
                        className={
                          storyLength == index + 1
                            ? "text-indigo-600 font-medium"
                            : ""
                        }
                      >
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
                disabled={loading || !formData.tone || !formData.storyType || !storyLength}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 
                  ${loading || !formData.tone || !formData.storyType || !storyLength
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-amber-400 to-pink-500 text-white hover:scale-[1.02] shadow-md"
                  }`}
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
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Live Preview
              </h2>
              <p className="text-gray-600 text-xl">
                See your story details as you type
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Preview Your Story
              </h3>
              <p className="text-gray-500 text-sm">
                Fill out the form and generate your story to see the results
                here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateStory;
