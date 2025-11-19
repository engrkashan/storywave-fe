import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  generateStory,
  getScheduledStories,
} from "../../../redux/slices/story.slice";

const GenerateStory = () => {
  const dispatch = useDispatch();
  const scheduled = useSelector((state) => state.stories.scheduled);
  const [voice, setVoice] = useState("");
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lengthLevel, setLengthLevel] = useState(3);

  const [mode, setMode] = useState("now");
  const [scheduleTime, setScheduleTime] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    concept: "",
    tone: "",
    imagePrompt: "",
    storyType: "",
    voice: "",
  });

  const loadingMessages = [
    "Weaving an epic tale just for you 📜...",
    "Crafting characters that come to life ✍️...",
    "Building a world full of wonder 🌌...",
    "Spinning a story with a touch of magic ✨...",
    "Setting the stage for your adventure 🎭...",
  ];

  useEffect(() => {
    dispatch(getScheduledStories());
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const lengthMinutes = [10, 20, 30];
  const lengthLabels = ["Brief", "Medium", "Long"];
  const storyLengthStr = `${lengthMinutes[lengthLevel - 1]} minutes`;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.concept && !formData.url) {
      toast.error("Please provide a story concept or URL");
      return;
    }

    if (!formData.title || !formData.tone || !formData.storyType) {
      toast.error("Please fill all required fields");
      return;
    }

    if (mode === "schedule" && !scheduleTime) {
      toast.error("Please select a schedule time");
      return;
    }

    const payload = {
      title: formData.title,
      textIdea: formData.concept,
      url: formData.url,
      storyType: formData.storyType,
      voiceTone: formData.tone,
      imagePrompt: formData.imagePrompt,
      storyLength: storyLengthStr,
      voice: voice,
      scheduledAt: mode === "schedule" ? scheduleTime : null,
    };

    try {
      setLoading(true);

      const response = await dispatch(generateStory(payload)).unwrap();

      if (mode === "now") {
        setStoryData(response);
        toast.success("Story generated successfully 🎉");
      } else {
        setStoryData(null);
        toast.success("Story scheduled successfully ⏰");
      }
    } catch (err) {
      toast.error(err?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Left Panel */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto thin-scrollbar">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Story Builder
            </h1>
            <p className="text-gray-600 text-xl mb-8">
              Generate or schedule your AI-powered story
            </p>

            <form className="space-y-6">
              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generation Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="now">Generate Now</option>
                  <option value="schedule">Schedule for Later</option>
                </select>
              </div>

              {mode === "schedule" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter story title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <p className="font-semibold text-center">OR</p>

              {/* Concept */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Script
                </label>
                <textarea
                  placeholder="Describe your story idea..."
                  value={formData.concept}
                  onChange={(e) => handleInputChange("concept", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                  rows="5"
                />
              </div>


              {/* Image Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Prompt
                </label>
                <input
                  type="text"
                  placeholder="Enter image prompt..."
                  value={formData.imagePrompt}
                  onChange={(e) => handleInputChange("imagePrompt", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Voices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice <span className="text-red-500">*</span>
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select voice...</option>
                  <option value="alloy">Alloy</option>
                  <option value="ash">Ash</option>
                  <option value="ballad">Ballad</option>
                  <option value="coral">Coral</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="nova">Nova</option>
                  <option value="onyx">Onyx</option>
                  <option value="sage">Sage</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              </div>

              {/* Voice Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Tone <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange("tone", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select story type...</option>
                  <option value="true_crime_fiction_cinematic">
                    True Crime - Fiction Cinematic (Netflix-Style)
                  </option>
                  <option value="true_crime_nonfiction_forensic">
                    True Crime - Nonfiction Forensic (Forensic Files)
                  </option>
                  <option value="manipulation_sexual_manipulation">
                    Manipulation - Sexual Manipulation (Mature)
                  </option>
                  <option value="cultural_history_documentary">
                    Cultural History - Documentary (National Geographic)
                  </option>
                  <option value="homesteading_howto_field_guide">
                    Homesteading - How-To Field Guide
                  </option>
                  <option value="work_and_trades_shop_manual">
                    Work & Trades - Shop Manual (How-To)
                  </option>
                  <option value="work_and_trades_shopfloordoc">
                    Work & Trades - Shopfloor Doc (Profile)
                  </option>
                  <option value="investigative_discovery_journalistic">
                    Investigative Discovery - Journalistic
                  </option>
                  <option value="storytelling_cinematic">
                    Storytelling - Cinematic (Movie-Style)
                  </option>
                  <option value="conversation_narrated_documentary">
                    Conversation - Narrated Documentary (Blended)
                  </option>
                  <option value="education_howto_trades">
                    Education - How-To (Trades)
                  </option>
                </select>
              </div>

              {/* Story Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Length <span className="text-red-500">*</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
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
                      : "bg-linear-to-r from-amber-400 to-pink-500 text-white hover:scale-[1.02] shadow-md"
                  }`}
              >
                {loading
                  ? mode === "now"
                    ? "Generating..."
                    : "Scheduling..."
                  : mode === "now"
                  ? "Generate Now"
                  : "Schedule Story"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto thin-scrollbar">
          <div className="p-8">
            {/* Preview Block */}
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
                  <div className="w-16 h-16 bg-linear-to-r from-amber-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                    {mode === "now"
                      ? "Creating Your Story"
                      : "Scheduling Story"}
                  </h3>
                  <p className="text-gray-500 text-sm transition-all duration-500">
                    {loadingMessages[currentMessageIndex]}
                  </p>
                </div>
              ) : storyData ? (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-2xl font-semibold text-gray-900 capitalize">
                    {storyData.story?.title}
                  </h3>

                  {/* Video */}
                  {storyData.video ? (
                    <div className="space-y-3">
                      <video
                        src={storyData.video}
                        controls
                        className="w-full rounded-2xl shadow-lg border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = storyData.video;
                          link.download = storyData.story?.title
                            ? `${storyData.story.title}.mp4`
                            : "story-video.mp4";
                          link.click();
                        }}
                        className="px-4 py-2 rounded-lg bg-linear-to-r from-pink-500 to-amber-400 text-white font-medium hover:scale-[1.02] shadow-md"
                      >
                        Download Video
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No video available.</p>
                  )}

                  {/* Script */}
                  <div className="text-left text-gray-700 space-y-4">
                    <p className="font-semibold text-lg">Story Script:</p>
                    <pre className="whitespace-pre-wrap text-gray-600 text-sm bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto thin-scrollbar">
                      {storyData.story?.script}
                    </pre>
                  </div>

                  {storyData.voiceover && (
                    <audio
                      controls
                      src={storyData.voiceover}
                      className="w-full rounded-md"
                    />
                  )}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                    Fill the form and generate or schedule your story to preview
                    it here.
                  </p>
                </>
              )}
            </div>

            {/* ---------------------------- */}
            {/* Scheduled Stories Section    */}
            {/* ---------------------------- */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Scheduled Stories
              </h2>

              {!scheduled || scheduled.length === 0 ? (
                <div className="bg-white p-8 border rounded-xl shadow-sm text-center">
                  <p className="text-gray-500 text-sm">No scheduled stories.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduled.map((item) => (
                    <div
                      key={item.workflowId}
                      className="group bg-white p-5 border rounded-xl shadow-sm flex items-center justify-between 
                     hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                    >
                      {/* Left */}
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-900 group-hover:text-gray-800">
                          {item.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-600">
                            Scheduled for:
                          </span>{" "}
                          {new Date(item.scheduledAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          Pending
                        </span>

                        {/* subtle chevron */}
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateStory;
