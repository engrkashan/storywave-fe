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
    <div className="min-h-screen">
      {/* ⛔ WARNING MODAL */}
      {showPromptWarning && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Content Warning
            </h2>
            <p className="text-gray-700 mb-3">
              Your image prompt contains potentially sensitive or abusive words.
            </p>

            {blockedWords.length > 0 && (
              <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
                <strong>Detected words:</strong> {blockedWords.join(", ")}
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
              You can go back and edit the prompt, or continue anyway at your
              own discretion.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPromptWarning(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => executeGenerate(pendingPayload)}
                className="px-4 py-2 rounded bg-linear-to-r from-amber-400 to-pink-500 text-white shadow"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
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
                    value={scheduleInput}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setScheduleInput(value);
                      const iso = new Date(value).toISOString();
                      setScheduleTime(iso);
                    }}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Story Script
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTextEditorOpen(true)}
                    className="bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg px-3 py-1 rounded hover:bg-indigo-700 transition"
                  >
                    Edit Script
                  </button>
                </div>
                <textarea
                  placeholder="Describe your story idea..."
                  value={formData.concept}
                  onChange={(e) => handleInputChange("concept", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none h-40"
                />
              </div>

              {/* Image Prompt */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2 justify-between w-full">
                  <span className="text-sm font-medium text-gray-700">
                    Generate Image
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowImagePrompt((prev) => !prev)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
        ${
          showImagePrompt
            ? "bg-gradient-to-r from-[#f8be4c] to-[#f0498f]"
            : "bg-gray-300"
        }
      `}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300
          ${showImagePrompt ? "translate-x-5" : "translate-x-1"}
        `}
                    />
                  </button>
                </div>

                {showImagePrompt && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsPromptEditorOpen(true)}
                        className="w-fit bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg px-3 py-1 rounded hover:opacity-90 transition"
                      >
                        Edit Prompt
                      </button>
                    </div>

                    {/* Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Prompt (Max 2000 characters)
                      </label>

                      <input
                        type="text"
                        placeholder="Enter image prompt..."
                        value={formData.imagePrompt}
                        maxLength={2000}
                        onChange={(e) =>
                          handleInputChange("imagePrompt", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />

                      <p className="text-xs text-gray-500 mt-1">
                        {formData.imagePrompt.length}/2000
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Voices */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice <span className="text-red-500">*</span>
                </label>
                <VoiceSelector
                  value={formData.voice}
                  onChange={(val) => handleInputChange("voice", val)}
                />
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
                <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm text-center">
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

                        {/* Delete Button */}
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
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Cancel Schedule"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isTextEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-12 px-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Edit Story Script</h2>
              <button
                onClick={() => setIsTextEditorOpen(false)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <textarea
              value={formData.concept}
              onChange={(e) => handleInputChange("concept", e.target.value)}
              className="flex-1 w-full p-6 text-gray-700 resize-none outline-none border-none"
              placeholder="Write your story here..."
            />
          </div>
        </div>
      )}

      {isPromptEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-12 px-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex flex-col h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Edit Image Prompt</h2>
              <button
                onClick={() => setIsPromptEditorOpen(false)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <textarea
              value={formData.imagePrompt}
              onChange={(e) => handleInputChange("imagePrompt", e.target.value)}
              className="flex-1 w-full p-6 text-gray-700 resize-none outline-none border-none"
              placeholder="Write your prompt here..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateStory;
