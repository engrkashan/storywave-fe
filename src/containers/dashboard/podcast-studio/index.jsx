import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { generatePodcast } from "../../../redux/slices/podcast.slice";

const GeneratePodcast = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [podcastLength, setPodcastLength] = useState(3);
  const [formData, setFormData] = useState({
    topic: "",
    tone: "",
    audience: "",
  });
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Mixing the perfect podcast vibes 🎶...",
    "Tuning the mic for your epic show 🎙️...",
    "Crafting a story that captivates 📖...",
    "Adding some AI magic to your podcast ✨...",
    "Getting the soundwaves ready 🌊...",
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000); // Change message every 2 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error("Please provide a podcast topic");
      return;
    }
    if (!formData.tone || !formData.audience) {
      toast.error("Tone and Audience are required");
      return;
    }

    const payload = {
      topic: formData.topic,
      tone: formData.tone,
      length: podcastLength,
      audience: formData.audience,
      adminId: Cookies.get("userId"), // optional, backend ignores this for now
    };

    try {
      setLoading(true);
      await dispatch(generatePodcast(payload)).unwrap();
      toast.success("Podcast generated successfully 🎙️");
    } catch (err) {
      toast.error(err?.message || "Failed to generate podcast ❌");
    } finally {
      setLoading(false);
    }
  };

  const lengthLabels = ["Brief", "Short", "Medium", "Long", "Extended"];

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
                Podcast Studio
              </h1>
              <p className="text-gray-600 text-xl">
                Fill in the details to generate your AI-powered podcast
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Podcast Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Topic
                </label>
                <textarea
                  placeholder="Describe your podcast topic..."
                  value={formData.topic}
                  onChange={(e) => handleInputChange("topic", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors resize-none"
                  rows="4"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.topic.length}/500 characters
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
                  <option value="conversational">
                    Conversational & Engaging
                  </option>
                  <option value="informative">Informative & Clear</option>
                  <option value="humorous">Humorous & Lighthearted</option>
                  <option value="serious">Serious & Thoughtful</option>
                  <option value="inspirational">
                    Inspirational & Motivating
                  </option>
                </select>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) =>
                    handleInputChange("audience", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                >
                  <option value="">Select audience...</option>
                  <option value="students">Students</option>
                  <option value="professionals">Professionals</option>
                  <option value="general">General Public</option>
                  <option value="entrepreneurs">Entrepreneurs</option>
                </select>
              </div>

              {/* Podcast Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Length <span className="text-red-500">*</span>
                </label>
                <div className="px-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={podcastLength}
                    onChange={(e) => setPodcastLength(e.target.value)}
                    className="w-full h-2 bg-gradient rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {lengthLabels.map((label, index) => (
                      <span
                        key={index}
                        className={
                          podcastLength == index + 1
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
                disabled={
                  loading ||
                  !formData.tone ||
                  !formData.audience ||
                  !podcastLength
                }
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 
                  ${
                    loading ||
                    !formData.tone ||
                    !formData.audience ||
                    !podcastLength
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
                  "Generate Podcast"
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
                See your podcast details as you type
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              {loading ? (
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Creating Your Podcast
                  </h3>
                  <p className="text-gray-500 text-sm transition-all duration-500">
                    {loadingMessages[currentMessageIndex]}
                  </p>
                </div>
              ) : (
                <>
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
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Preview Your Podcast
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Fill out the form and generate your podcast to see the
                    results here
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePodcast;
