import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  generateStory,
  getScheduledStories,
  deleteScheduledStory,
} from "../../../redux/slices/story.slice";
import VoiceSelector from "../../../components/VoiceSelecter";
import { checkImagePromptSafety } from "../../../utils/promptModerations";
import { fetchWorkflowById } from "../../../redux/slices/overview.slice";

const GenerateStory = () => {
  const dispatch = useDispatch();
  const scheduled = useSelector((state) => state.stories.scheduled);

  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lengthLevel, setLengthLevel] = useState(3);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [mode, setMode] = useState("now");
  const [scheduleInput, setScheduleInput] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // 🔥 warning modal state
  const [showPromptWarning, setShowPromptWarning] = useState(false);
  const [blockedWords, setBlockedWords] = useState([]);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);

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
    const editWorkflowId = localStorage.getItem("editWorkflowId");
    if (!editWorkflowId) return;

    dispatch(fetchWorkflowById(editWorkflowId))
      .unwrap()
      .then((data) => {
        const m = data.metadata || {};
        setFormData({
          title: data.title || "",
          url: m.url || "",
          concept: m.textIdea || "",
          tone: m.voiceTone || "",
          imagePrompt: m.imagePrompt || "",
          storyType: m.storyType || "",
          voice: m.voice || "",
        });
        setShowImagePrompt(m.shouldGenerateImage || !!m.imagePrompt);
      })
      .catch(() => toast.error("Failed to load workflow"))
      .finally(() => localStorage.removeItem("editWorkflowId"));
  }, [dispatch]);

  useEffect(() => {
    if (!loading) return;
    const i = setInterval(
      () => setCurrentMessageIndex((p) => (p + 1) % loadingMessages.length),
      2000,
    );
    return () => clearInterval(i);
  }, [loading]);

  const lengthMinutes = [10, 20, 30];
  const lengthLabels = ["Brief", "Medium", "Long"];
  const storyLengthStr = `${lengthMinutes[lengthLevel - 1]} minutes`;

  const handleInputChange = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const executeGenerate = async (payload) => {
    try {
      setLoading(true);
      const res = await dispatch(generateStory(payload)).unwrap();
      if (mode === "now") {
        setStoryData(res);
        toast.success("Story generated successfully 🎉");
      } else {
        toast.success("Story scheduled successfully ⏰");
      }
    } catch (e) {
      toast.error(e?.error || "Something went wrong");
    } finally {
      setLoading(false);
      setShowPromptWarning(false);
      setPendingPayload(null);
    }
  };

  const handleGenerate = () => {
    if (!formData.concept && !formData.url)
      return toast.error("Please provide a story concept or URL");

    if (!formData.title || !formData.tone || !formData.storyType)
      return toast.error("Please fill all required fields");

    if (mode === "schedule" && !scheduleTime)
      return toast.error("Please select a schedule time");

    const payload = {
      title: formData.title,
      textIdea: formData.concept,
      url: formData.url,
      storyType: formData.storyType,
      voice: formData.voice,
      voiceTone: formData.tone,
      shouldGenerateImage: showImagePrompt,
      imagePrompt: formData.imagePrompt,
      storyLength: storyLengthStr,
      scheduledAt: mode === "schedule" ? scheduleTime : null,
    };

    const safety = checkImagePromptSafety(formData.imagePrompt);

    if (!safety.safe) {
      setBlockedWords(safety.blockedWords || []);
      setPendingPayload(payload);
      setShowPromptWarning(true);
      return;
    }

    executeGenerate(payload);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-8">
      {/* ⛔ WARNING MODAL */}
      {showPromptWarning && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Content Warning</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Your image prompt contains potentially sensitive or abusive words that may violate content guidelines.
            </p>

            {blockedWords.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
                <p className="text-sm font-medium text-red-800 mb-2">Detected words:</p>
                <div className="flex flex-wrap gap-2">
                  {blockedWords.map((word, index) => (
                    <span key={index} className="px-3 py-1 bg-white border border-red-300 rounded-lg text-red-700 text-sm font-medium">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-8">
              You can go back and edit the prompt, or continue at your own discretion.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPromptWarning(false)}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200"
              >
                Edit Prompt
              </button>
              <button
                onClick={() => executeGenerate(pendingPayload)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg transition-all duration-200"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Story Builder</h1>
            <p className="text-gray-600 text-lg">
              Create and schedule AI-powered stories with rich multimedia
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-md">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 font-medium">
                {loadingMessages[currentMessageIndex]}
              </p>
            </div>
          )}
        </div>

        {/* Stats/Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stories Generated</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-pink-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{scheduled?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Stories</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form - Left Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Story</h2>
            </div>

            <form className="space-y-8">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Generation Mode
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMode("now")}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 text-center font-medium transition-all duration-200 ${mode === "now"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate Now</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("schedule")}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 text-center font-medium transition-all duration-200 ${mode === "schedule"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Schedule</span>
                    </div>
                  </button>
                </div>
              </div>

              {mode === "schedule" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Schedule Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={scheduleInput}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setScheduleInput(value);
                        const iso = new Date(value).toISOString();
                        setScheduleTime(iso);
                      }}
                      className="w-full px-4 py-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Story Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a compelling title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Story Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Story Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.storyType}
                    onChange={(e) => handleInputChange("storyType", e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select a story type...</option>
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
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Reference URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    className="w-full px-4 py-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>

              {/* Story Script */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Story Script
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTextEditorOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Open Editor
                  </button>
                </div>
                <textarea
                  placeholder="Describe your story idea or paste your script here..."
                  value={formData.concept}
                  onChange={(e) => handleInputChange("concept", e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none h-48"
                />
              </div>

              {/* Image Generation */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Generate Images</h3>
                      <p className="text-sm text-gray-500">Add AI-generated images to your story</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImagePrompt((prev) => !prev)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${showImagePrompt
                      ? "bg-gradient-to-r from-amber-500 to-pink-500"
                      : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${showImagePrompt ? "translate-x-7" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {showImagePrompt && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-900">
                        Image Prompt
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsPromptEditorOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Open Editor
                      </button>
                    </div>

                    <textarea
                      placeholder="Describe the images you want to generate..."
                      value={formData.imagePrompt}
                      onChange={(e) => handleInputChange("imagePrompt", e.target.value)}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none h-32"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formData.imagePrompt.length}/5000 characters
                      </span>
                      {formData.imagePrompt.length > 0 && (
                        <span className={`text-sm font-medium ${formData.imagePrompt.length > 4500 ? "text-red-600" : "text-green-600"
                          }`}>
                          {formData.imagePrompt.length > 4500 ? "Approaching limit" : "Good length"}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voice */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Voice <span className="text-red-500">*</span>
                  </label>
                  <VoiceSelector
                    value={formData.voice}
                    onChange={(val) => handleInputChange("voice", val)}
                  />
                </div>

                {/* Voice Tone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Voice Tone <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select tone...</option>
                    <option value="neutral">Neutral</option>
                    <option value="excited">Excited & Energetic</option>
                    <option value="calm">Calm & Soothing</option>
                    <option value="mysterious">Mysterious & Intriguing</option>
                    <option value="professional">Professional & Informative</option>
                    <option value="playful">Playful & Fun</option>
                  </select>
                </div>
              </div>

              {/* Story Length */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                      Story Length
                    </label>
                    <p className="text-sm text-gray-500">Adjust the duration of your story</p>
                  </div>
                  <span className="text-lg font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                    {storyLengthStr}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="3"
                  value={lengthLevel}
                  onChange={(e) => setLengthLevel(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-amber-200 to-pink-500 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow-lg"
                />

                <div className="flex justify-between mt-4">
                  {lengthLabels.map((label, index) => (
                    <div key={index} className="text-center">
                      {/* <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${lengthLevel === index + 1
                        ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white"
                        : "bg-gray-100 text-gray-500"
                        }`}>
                        {lengthMinutes[index]}
                      </div> */}
                      <span className={`text-sm font-medium ${lengthLevel === index + 1 ? "text-amber-600" : "text-gray-500"
                        }`}>
                        {label}
                      </span>
                    </div>
                  ))}
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
                  !formData.storyType ||
                  (mode === "schedule" && !scheduleTime)
                }
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${loading ||
                  !formData.title ||
                  !formData.tone ||
                  !formData.storyType ||
                  (mode === "schedule" && !scheduleTime)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-pink-600 text-white hover:shadow-xl hover:scale-[1.02]"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === "now" ? "Generating Story..." : "Scheduling Story..."}
                  </div>
                ) : mode === "now" ? (
                  "Generate Story Now"
                ) : (
                  "Schedule Story"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Scheduled Stories & Results */}
        <div className="lg:col-span-5 space-y-8">
          {/* Generated Story Results */}
          {storyData && mode === "now" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Story Generated!</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{storyData.story?.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {storyLengthStr}
                    </span>
                    <span>•</span>
                    <span>{formData.tone}</span>
                  </div>
                </div>

                {/* Video Preview */}
                {storyData.video && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-gray-900">
                      <video
                        src={storyData.video}
                        controls
                        className="w-full aspect-video"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = storyData.video;
                        link.download = storyData.story?.title
                          ? `${storyData.story.title}.mp4`
                          : "story-video.mp4";
                        link.click();
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Video
                    </button>
                  </div>
                )}

                {/* Voiceover */}
                {storyData.voiceover && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 mb-3">Voiceover Preview</p>
                    <audio
                      controls
                      src={storyData.voiceover}
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Script Preview */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-900">Story Script</p>
                    <span className="text-xs text-gray-500">
                      {storyData.story?.script?.length || 0} characters
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto thin-scrollbar">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {storyData.story?.script || "No script available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Stories */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Scheduled Stories</h2>
                  <p className="text-sm text-gray-500">Upcoming story generations</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg">
                {scheduled?.length || 0}
              </span>
            </div>

            {!scheduled || scheduled.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Stories</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Stories scheduled for later will appear here. Select "Schedule" mode to plan future stories.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto thin-scrollbar pr-2">
                {scheduled.map((item) => (
                  <div
                    key={item.workflowId}
                    className="group p-5 border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-amber-700">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(item.scheduledAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Scheduled
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {item.storyType?.replace(/_/g, ' ') || 'Custom'}
                      </span>
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to cancel this scheduled story?",
                            )
                          ) {
                            dispatch(deleteScheduledStory(item.workflowId))
                              .unwrap()
                              .then(() =>
                                toast.success("Scheduled story cancelled"),
                              )
                              .catch((err) =>
                                toast.error(
                                  err?.error || "Failed to cancel story",
                                ),
                              );
                          }
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Editor Modal */}
      {isTextEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[80vh] animate-modalSlide">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Story Script Editor</h2>
              </div>
              <button
                onClick={() => setIsTextEditorOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                Save & Close
              </button>
            </div>

            {/* Modal Body */}
            <textarea
              value={formData.concept}
              onChange={(e) => handleInputChange("concept", e.target.value)}
              className="flex-1 w-full p-8 text-gray-700 resize-none outline-none border-none text-lg leading-relaxed"
              placeholder="Write your story here..."
            />
          </div>
        </div>
      )}

      {/* Image Prompt Editor Modal */}
      {isPromptEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col h-[80vh] animate-modalSlide">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Image Prompt Editor</h2>
              </div>
              <button
                onClick={() => setIsPromptEditorOpen(false)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium transition-colors duration-200"
              >
                Save & Close
              </button>
            </div>

            {/* Modal Body */}
            <textarea
              value={formData.imagePrompt}
              onChange={(e) => handleInputChange("imagePrompt", e.target.value)}
              className="flex-1 w-full p-8 text-gray-700 resize-none outline-none border-none text-lg leading-relaxed"
              placeholder="Describe the images you want to generate. Be as detailed as possible..."
            />

            {/* Footer Stats */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {formData.imagePrompt.length}/5000 characters
                </span>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${formData.imagePrompt.length > 4500
                    ? "text-red-600"
                    : formData.imagePrompt.length > 1000
                      ? "text-green-600"
                      : "text-yellow-600"
                    }`}>
                    {formData.imagePrompt.length > 4500
                      ? "⚠️ Approaching limit"
                      : formData.imagePrompt.length > 1000
                        ? "✅ Good length"
                        : "📝 Add more details"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GenerateStory;