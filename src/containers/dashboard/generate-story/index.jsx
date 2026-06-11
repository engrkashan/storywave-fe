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
import {
  fetchOverview, fetchWorkflowById,
} from "../../../redux/slices/overview.slice";
import axiosInstance from "../../../middleware/axiosInstance";

const GenerateStory = () => {
  const dispatch = useDispatch();
  const scheduled = useSelector((state) => state.stories.scheduled);
  const { totalStories, stories } = useSelector((state) => state.overview);

  // Calculate active stories (PENDING, PROCESSING, SCHEDULED)
  const activeStories = stories?.filter(
    (s) => s.status === "PENDING" || s.status === "PROCESSING" || s.status === "SCHEDULED"
  ).length || 0;

  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lengthLevel, setLengthLevel] = useState(2);
  const [showImagePrompt, setShowImagePrompt] = useState(true);
  const [mode, setMode] = useState("now");
  const [scheduleInput, setScheduleInput] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Warning modal state
  const [showPromptWarning, setShowPromptWarning] = useState(false);
  const [blockedWords, setBlockedWords] = useState([]);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isUploadingCharRef, setIsUploadingCharRef] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    concept: "",
    tone: "",
    imagePrompt: "",
    storyType: "",
    voice: "",
    mediaType: "single_image",
    imageCount: 5,
    backgroundMusic: true,
    aspectRatio: "16:9",
    dualPlatform: false,
    series: "",
    coverArtPrompt: "",
    seoMetadata: "",
    visualSuggestions: "",
    uploadedMediaUrl: "",
    characterReferenceBase64: "", // User-supplied character reference image (base64)
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
    dispatch(fetchOverview());
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
          mediaType: m.mediaType || "single_image",
          imageCount: m.imageCount || 5,
          backgroundMusic: m.backgroundMusic ?? true,
          aspectRatio: m.aspectRatio || "16:9",
          series: m.series || "",
          coverArtPrompt: m.coverArtPrompt || "",
          seoMetadata: m.seoContent
            ? JSON.stringify(m.seoContent, null, 2)
            : JSON.stringify({ Title: "", Description: "" }, null, 2),
          visualSuggestions: m.visualSuggestions || "",
          uploadedMediaUrl: m.uploadedMediaUrl || "",
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

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingMedia(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    try {
      const res = await axiosInstance.post("/media", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data && res.data.media && res.data.media.fileUrl) {
        handleInputChange("uploadedMediaUrl", res.data.media.fileUrl);
        toast.success("Media uploaded successfully");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to upload media");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleCharRefUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large! Please select an image under 5MB.");
      return;
    }
    
    setIsUploadingCharRef(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to max 800px to prevent huge base64 strings freezing Redux/Network
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG
        const base64Str = canvas.toDataURL("image/jpeg", 0.8);
        handleInputChange("characterReferenceBase64", base64Str);
        setIsUploadingCharRef(false);
        toast.success("Character reference loaded ✅");
      };
      img.onerror = () => {
        toast.error("Failed to read image data");
        setIsUploadingCharRef(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      toast.error("Failed to read character reference file");
      setIsUploadingCharRef(false);
    };
    reader.readAsDataURL(file);
  };

  const executeGenerate = async (payload) => {
    try {
      setLoading(true);
      const res = await dispatch(generateStory(payload)).unwrap();
      if (mode === "now") {
        toast.success("Generating Your Story 🎉");
      } else {
        toast.success("Your Story is Scheduled ⏰");
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
      mediaType: formData.mediaType,
      imageCount: formData.imageCount,
      backgroundMusic: formData.backgroundMusic,
      aspectRatio: formData.aspectRatio,
      dualPlatform: formData.dualPlatform,
      series: formData.series,
      coverArtPrompt: formData.coverArtPrompt,
      seoContent: (() => {
        try {
          return JSON.parse(formData.seoMetadata);
        } catch (e) {
          return {};
        }
      })(),
      visualSuggestions: formData.visualSuggestions,
      uploadedMediaUrl: formData.uploadedMediaUrl,
      characterReferenceBase64: formData.characterReferenceBase64 || null,
    };

    if (showImagePrompt && formData.mediaType === "single_image" && formData.imagePrompt) {
      const safety = checkImagePromptSafety(formData.imagePrompt);
      if (!safety.safe) {
        setBlockedWords(safety.blockedWords || []);
        setPendingPayload(payload);
        setShowPromptWarning(true);
        return;
      }
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
              <h2 className="text-2xl font-semibold text-gray-900">Content Warning</h2>
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
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowPromptWarning(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium transition-colors duration-200">Edit Prompt</button>
              <button onClick={() => executeGenerate(pendingPayload)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg transition-all duration-200">Continue Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Story Builder</h1>
            <p className="text-gray-600 text-lg">Create and schedule AI-powered stories with rich multimedia</p>
          </div>
          {loading && (
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl shadow-md">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 font-medium">{loadingMessages[currentMessageIndex]}</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Stories Generated</p><p className="text-2xl font-semibold text-gray-900">{totalStories || 0}</p></div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-pink-100 rounded-xl flex items-center justify-center text-amber-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Scheduled</p><p className="text-2xl font-semibold text-gray-900">{scheduled?.length || 0}</p></div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Active Stories</p><p className="text-2xl font-semibold text-gray-900">{activeStories || 0}</p></div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-amber-100 rounded-xl flex items-center justify-center text-pink-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-pink-600 rounded-xl flex items-center justify-center text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Story</h2>
            </div>

            <form className="space-y-8">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Generation Mode</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setMode("now")} className={`flex-1 py-4 px-6 rounded-xl border-2 text-center font-medium transition-all ${mode === "now" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-300 text-gray-700"}`}><div className="flex flex-col items-center"><svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span>Generate Now</span></div></button>
                  <button type="button" onClick={() => setMode("schedule")} className={`flex-1 py-4 px-6 rounded-xl border-2 text-center font-medium transition-all ${mode === "schedule" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-300 text-gray-700"}`}><div className="flex flex-col items-center"><svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>Schedule</span></div></button>
                </div>
              </div>

              {mode === "schedule" && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Schedule Date & Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type="datetime-local" value={scheduleInput} min={new Date().toISOString().slice(0, 16)} onChange={(e) => { setScheduleInput(e.target.value); setScheduleTime(new Date(e.target.value).toISOString()); }} className="w-full px-4 py-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-amber-500" />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Story Title <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter title..." value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Story Type <span className="text-red-500">*</span></label>
                  <select value={formData.storyType} onChange={(e) => handleInputChange("storyType", e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-amber-500">
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

              {/* Series & Visual Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Series (Optional)</label>
                  <input type="text" placeholder="e.g. The Midnight Chronicles" value={formData.series} onChange={(e) => handleInputChange("series", e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Visual Suggestions (Optional)</label>
                  <input type="text" placeholder="e.g. Use neon noir lighting..." value={formData.visualSuggestions} onChange={(e) => handleInputChange("visualSuggestions", e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-amber-500" />
                </div>
              </div>

              {/* URL & Script */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Reference URL (Optional)</label>
                  <div className="relative"><input type="url" placeholder="https://..." value={formData.url} onChange={(e) => handleInputChange("url", e.target.value)} className="w-full px-4 py-3.5 pl-12 border border-gray-300 rounded-xl focus:ring-amber-500" /><svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3"><label className="text-sm font-semibold text-gray-900">Story Script</label><button type="button" onClick={() => setIsTextEditorOpen(true)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">Open Editor</button></div>
                  <textarea placeholder="Describe or paste your script..." value={formData.concept} onChange={(e) => handleInputChange("concept", e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-amber-500 h-48 resize-none" />
                </div>
              </div>

              {/* Cover Art Prompt */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <label className="text-sm font-semibold text-gray-900">Cover Art Prompt (Optional)</label>
                <textarea placeholder="Specific prompt for the main cover art (16:9)..." value={formData.coverArtPrompt} onChange={(e) => handleInputChange("coverArtPrompt", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 h-24 resize-none" />
              </div>

              {/* Visual Generation Card */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                <div className="flex flex-col gap-6">
                  {/* Visual Gen Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                      <div><h3 className="font-semibold text-gray-900 text-lg">Visual Generation</h3><p className="text-xs text-gray-500">Enable AI artwork to accompany your story</p></div>
                    </div>
                    <button type="button" onClick={() => setShowImagePrompt(!showImagePrompt)} className={`relative flex h-7 w-14 items-center rounded-full transition-colors ${showImagePrompt ? "bg-amber-500" : "bg-gray-300"}`}><span className={`h-6 w-6 rounded-full bg-white transition-transform ${showImagePrompt ? "translate-x-7" : "translate-x-1"}`} /></button>
                  </div>

                  {/* Music Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg></div>
                      <div><h3 className="font-semibold text-gray-900 text-lg">Background Music</h3><p className="text-xs text-gray-500">Add an atmospheric ambient score</p></div>
                    </div>
                    <button type="button" onClick={() => handleInputChange("backgroundMusic", !formData.backgroundMusic)} className={`relative flex h-7 w-14 items-center rounded-full transition-colors ${formData.backgroundMusic ? "bg-indigo-500" : "bg-gray-300"}`}><span className={`h-6 w-6 rounded-full bg-white transition-transform ${formData.backgroundMusic ? "translate-x-7" : "translate-x-1"}`} /></button>
                  </div>
                </div>

                {showImagePrompt && (
                  <div className="pt-6 border-t border-gray-200 space-y-6 animate-fadeIn">
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-gray-900">Media Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["single_image", "multi_image", "video"].map((type) => (
                          <button key={type} type="button" onClick={() => handleInputChange("mediaType", type)} className={`py-4 px-2 rounded-xl border-2 text-xs font-semibold transition-all capitalize ${formData.mediaType === type ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600"}`}>{type.replace("_", " ")}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <label className="text-sm font-semibold text-gray-900">Direct Media Upload (Optional)</label>
                      <p className="text-xs text-gray-500">Upload an image or video to use directly, bypassing AI generation.</p>
                      <input 
                        type="file" 
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        disabled={isUploadingMedia}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 disabled:opacity-50"
                      />
                      {isUploadingMedia && <p className="text-xs text-amber-600">Uploading media...</p>}
                      {formData.uploadedMediaUrl && <p className="text-xs text-green-600 truncate">Uploaded: {formData.uploadedMediaUrl}</p>}
                    </div>

                    {/* Character Reference Upload */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Character Reference Image <span className="text-gray-400 font-normal">(Optional)</span></p>
                          <p className="text-xs text-gray-500">Upload a photo of a character — AI will use it as a visual anchor for scenes featuring that character.</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCharRefUpload}
                        disabled={isUploadingCharRef}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                      />
                      {isUploadingCharRef && <p className="text-xs text-purple-600 animate-pulse">Processing character reference...</p>}
                      {formData.characterReferenceBase64 && (
                        <div className="flex items-center gap-2">
                          <img src={formData.characterReferenceBase64} alt="Character reference" className="w-12 h-12 rounded-lg object-cover border-2 border-purple-200" />
                          <div>
                            <p className="text-xs text-purple-700 font-semibold">Character reference ready ✓</p>
                            <button type="button" onClick={() => handleInputChange("characterReferenceBase64", "")} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {formData.mediaType === "multi_image" && !formData.uploadedMediaUrl && (
                      <div className="space-y-4 p-5 bg-white rounded-2xl border border-gray-200">
                        <div className="flex justify-between items-center"><span className="font-semibold text-gray-700 uppercase text-xs tracking-wider">Number of Scenes</span><span className="text-amber-600  text-lg">{formData.imageCount}</span></div>
                        <input type="range" min="2" max="100" value={formData.imageCount} onChange={(e) => handleInputChange("imageCount", parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-amber-500" />
                      </div>
                    )}

                    {formData.mediaType === "single_image" && !formData.uploadedMediaUrl && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center"><label className="text-sm font-semibold text-gray-900">Image Prompt</label><button type="button" onClick={() => setIsPromptEditorOpen(true)} className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg  uppercase">Open Editor</button></div>
                        <textarea placeholder="Describe your image..." value={formData.imagePrompt} onChange={(e) => handleInputChange("imagePrompt", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-amber-500 h-32 resize-none" />
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Aspect Ratio Selection (Commented out for now) */}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-900">Final Format (Aspect Ratio)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Generate Both (16:9 & 9:16)</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange("dualPlatform", !formData.dualPlatform)}
                      className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${formData.dualPlatform ? "bg-amber-500" : "bg-gray-300"}`}
                    >
                      <span className={`h-5 w-5 rounded-full bg-white transition-transform ${formData.dualPlatform ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
                <div className={`flex gap-4 transition-opacity ${formData.dualPlatform ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                  <button
                    type="button"
                    onClick={() => handleInputChange("aspectRatio", "9:16")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all ${formData.aspectRatio === "9:16" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-300 text-gray-700"}`}
                  >
                    TikTok / Instagram (9:16)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("aspectRatio", "16:9")}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-center font-medium transition-all ${formData.aspectRatio === "16:9" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-300 text-gray-700"}`}
                  >
                    YouTube (16:9)
                  </button>
                </div>
              </div>


              {/* Voice & Length */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-semibold text-gray-900 mb-2">Voice Selection</label><VoiceSelector value={formData.voice} onChange={(v) => handleInputChange("voice", v)} /></div>
                <div><label className="block text-sm font-semibold text-gray-900 mb-2">Voice Tone</label><select value={formData.tone} onChange={(e) => handleInputChange("tone", e.target.value)} className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-amber-500">
                  <option value="">Select tone...</option>
                  <option value="neutral">Neutral</option>
                  <option value="excited">Excited & Energetic</option>
                  <option value="calm">Calm & Soothing</option>
                  <option value="mysterious">Mysterious & Intriguing</option>
                  <option value="professional">Professional & Informative</option>
                  <option value="playful">Playful & Fun</option>
                </select></div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center"><label className="text-sm font-semibold text-gray-900">Story Length</label><span className="text-amber-600 font-semibold bg-amber-50 px-3 py-1 rounded-lg">{storyLengthStr}</span></div>
                <input type="range" min="1" max="3" value={lengthLevel} onChange={(e) => setLengthLevel(Number(e.target.value))} className="w-full h-1.5 bg-gradient-to-r from-amber-300 to-pink-500 rounded-lg appearance-none accent-amber-500" />
              </div>

              {/* SEO Metadata */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">SEO Content (JSON)</h3>
                </div>
                <div className="space-y-2">
                  <textarea
                    placeholder=''
                    value={formData.seoMetadata}
                    onChange={(e) => handleInputChange("seoMetadata", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-blue-500 bg-white h-40 font-mono text-sm resize-none"
                  />
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Must be valid JSON</p>
                    {(() => {
                      try {
                        JSON.parse(formData.seoMetadata);
                        return <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Valid JSON</span>;
                      } catch (e) {
                        return <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Invalid JSON</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleGenerate} disabled={loading || !formData.title} className="w-full py-5 rounded-2xl  text-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-600 text-white shadow-xl shadow-amber-200 hover:scale-[1.02] active:scale-95 transition-all disabled:grayscale disabled:opacity-50">
                {loading ? "BRINGING TO LIFE..." : "GENERATE STORY"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Scheduled Generations</h2><span className="px-4 py-1 bg-amber-500 text-white  rounded-full text-xs">{scheduled?.length || 0}</span></div>
            {!scheduled?.length ? <div className="text-center py-12 text-gray-400 font-medium">No active generations today</div> : (
              <div className="space-y-4">
                {scheduled.map(s => (
                  <div key={s.workflowId} className="group p-5 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-amber-200 cursor-pointer">
                    <div className="flex flex-col gap-1"><span className="font-semibold text-sm text-gray-900 truncate max-w-[150px]">{s.title}</span><span className="text-[10px] text-gray-400 font-semibold uppercase">{new Date(s.scheduledAt).toLocaleDateString()}</span></div>
                    <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Cancel mission?")) dispatch(deleteScheduledStory(s.workflowId)); }} className="p-2 text-gray-300 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isTextEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-modal">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50"><h2 className=" text-2xl text-gray-900 ">SCRIPT COMMAND CENTER</h2><button onClick={() => setIsTextEditorOpen(false)} className="px-6 py-2 bg-black text-white rounded-full font-semibold uppercase text-xs">Close Array</button></div>
            <textarea value={formData.concept} onChange={e => handleInputChange("concept", e.target.value)} className="flex-1 p-12 text-xl font-medium leading-relaxed resize-none outline-none text-gray-800" placeholder="DEUCODE YOUR STORY HERE..." />
          </div>
        </div>
      )}

      {isPromptEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl animate-modal">
            <div className="p-8 border-b flex justify-between items-center bg-amber-50"><h2 className=" text-2xl text-amber-900 ">VISUAL PROMPT ENGINE</h2><button onClick={() => setIsPromptEditorOpen(false)} className="px-6 py-2 bg-amber-600 text-white rounded-full font-semibold uppercase text-xs">Lock Prompt</button></div>
            <textarea value={formData.imagePrompt} onChange={e => handleInputChange("imagePrompt", e.target.value)} className="flex-1 p-12 text-xl font-medium leading-relaxed resize-none outline-none text-amber-900 bg-amber-50/20" placeholder="INITIALIZE VISUAL PARAMETERS..." />
          </div>
        </div>
      )}
    </main>
  );
};

export default GenerateStory;