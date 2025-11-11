
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { generateStory } from "../../../redux/slices/story.slice";

const GenerateStory = () => {
  const dispatch = useDispatch();
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lengthLevel, setLengthLevel] = useState(3);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    concept: "",
    tone: "",
    storyType: "",
  });
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Weaving an epic tale just for you 📜...",
    "Crafting characters that come to life ✍️...",
    "Building a world full of wonder 🌌...",
    "Spinning a story with a touch of magic ✨...",
    "Setting the stage for your adventure 🎭...",
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

  const lengthMinutes = [10, 15, 30, 45, 60];
  const lengthLabels = ["Brief", "Short", "Medium", "Long", "Epic"];
  const storyLengthStr = `${lengthMinutes[lengthLevel - 1]} minutes`;

  const handleGenerate = async () => {
    if (!formData.concept && !formData.url) {
      toast.error("Please provide a story concept or URL");
      return;
    }

    const payload = {
      title: formData.title,
      textIdea: formData.concept,
      url: formData.url,
      storyType: formData.storyType,
      voiceTone: formData.tone,
      storyLength: storyLengthStr,
      adminId: Cookies.get("userId"),
    };

    try {
      setLoading(true);
      const response = await dispatch(generateStory(payload)).unwrap();
      setStoryData(response);
      toast.success("Story generated successfully 🎉");
    } catch (err) {
      toast.error(err?.error || "Failed to generate story ❌");
    } finally {
      setLoading(false);
    }
  };

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
              {/* Story Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter story title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                />
              </div>

              {/* Reference URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference URL
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
                  rows="5"
                />
                {/* <div className="text-xs text-gray-500 mt-1">
                  {formData.concept.length}/500 characters
                </div> */}
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
                  <option value="neutral">Neutral</option>
                  <option value="excited">Excited & Energetic</option>
                  <option value="calm">Calm & Soothing</option>
                  <option value="mysterious">Mysterious & Intriguing</option>
                  <option value="professional">
                    Professional & Informative
                  </option>
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
                  onChange={(e) =>
                    handleInputChange("storyType", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                >
                  <option value="">Select story type...</option>
                  <option value="true_crime_fiction_cinematic">True Crime - Fiction Cinematic (Netflix-Style)</option>
                  <option value="true_crime_nonfiction_forensic">True Crime - Nonfiction Forensic (Forensic Files)</option>
                  <option value="manipulation_sexual_manipulation">Manipulation - Sexual Manipulation (Mature)</option>
                  <option value="cultural_history_documentary">Cultural History - Documentary (National Geographic)</option>
                  <option value="homesteading_howto_field_guide">Homesteading - How-To Field Guide</option>
                  <option value="work_and_trades_shop_manual">Work & Trades - Shop Manual (How-To)</option>
                  <option value="work_and_trades_shopfloordoc">Work & Trades - Shopfloor Doc (Profile)</option>
                  <option value="investigative_discovery_journalistic">Investigative Discovery - Journalistic</option>
                  <option value="storytelling_cinematic">Storytelling - Cinematic (Movie-Style)</option>
                  <option value="conversation_narrated_documentary">Conversation - Narrated Documentary (Blended)</option>
                  <option value="education_howto_trades">Education - How-To (Trades)</option>
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
                    value={lengthLevel}
                    onChange={(e) => setLengthLevel(e.target.value)}
                    className="w-full h-2 bg-gradient rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {lengthLabels.map((label, index) => (
                      <span
                        key={index}
                        className={
                          lengthLevel == index + 1
                            ? "text-indigo-600 font-medium"
                            : ""
                        }
                      >
                        {label} ({lengthMinutes[index]} min)
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
                  !formData.title ||
                  !formData.tone ||
                  !formData.storyType
                }
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 
                  ${
                    loading ||
                    !formData.title ||
                    !formData.tone ||
                    !formData.storyType
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
                    Creating Your Story
                  </h3>
                  <p className="text-gray-500 text-sm transition-all duration-500">
                    {loadingMessages[currentMessageIndex]}
                  </p>
                </div>
              ) : storyData ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-gray-900 capitalize">
                    {storyData.story?.title || "Your Story"}
                  </h3>

                  {/* Video Section */}
                  {storyData.video ? (
                    <div className="space-y-3">
                      <video
                        src={storyData.video}
                        controls
                        className="w-full rounded-2xl shadow-lg border border-gray-200 transition-all hover:shadow-xl"
                      />
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = storyData.video;
                          link.download = storyData.story?.title
                            ? `${storyData.story.title}.mp4`
                            : "story-video.mp4";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-amber-400 text-white font-medium hover:scale-[1.02] shadow-md transition-transform"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                          />
                        </svg>
                        Download Video
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No video available.</p>
                  )}

                  {/* Story Script */}
                  <div className="text-left text-gray-700 space-y-4">
                    <p className="font-semibold text-lg">Story Script:</p>
                    <pre className="whitespace-pre-wrap text-gray-600 text-sm bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto thin-scrollbar">
                      {storyData.story?.script}
                    </pre>
                  </div>

                  {/* Audio Player */}
                  {storyData.voiceover && (
                    <div className="mt-4">
                      <audio
                        controls
                        src={storyData.voiceover}
                        className="w-full rounded-md"
                      />
                    </div>
                  )}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateStory;