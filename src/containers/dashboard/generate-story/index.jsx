import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  generateStory,
  getScheduledStories,
  deleteScheduledStory,
} from "../../../redux/slices/story.slice";
import VoiceSelector from "../../../components/VoiceSelecter";
import { checkImagePromptSafety } from "../../../utils/promptModerations";
import {
  fetchOverviewStats,
  fetchWorkflowById,
} from "../../../redux/slices/overview.slice";
import axiosInstance from "../../../middleware/axiosInstance";

/* ─────────────────────────────────────────────────────────────────
   Reusable Toggle Switch
───────────────────────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, colorOn = "bg-amber-500" }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative flex h-7 w-14 items-center rounded-full transition-all duration-300 shadow-inner ${checked ? colorOn : "bg-gray-200"
      }`}
  >
    <span
      className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? "translate-x-7" : "translate-x-1"
        }`}
    />
  </button>
);

/* ─────────────────────────────────────────────────────────────────
   Section Header
───────────────────────────────────────────────────────────────── */
const SectionHeader = ({ step, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
      <span className="text-white text-sm font-bold">{step}</span>
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   AI Feature Card
───────────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, subtitle, checked, onChange, colorOn, accentBg, accentText }) => (
  <div
    onClick={onChange}
    className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 select-none ${checked
      ? `border-transparent ${accentBg} shadow-lg`
      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
  >
    {/* Active glow */}
    {checked && (
      <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl" style={{ background: "radial-gradient(circle, currentColor, transparent)" }} />
    )}

    <div className="relative flex flex-col gap-3">
      {/* Top row: icon + toggle */}
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${checked ? "bg-white/40" : "bg-gray-100"}`}>
          {icon}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch checked={checked} onChange={onChange} colorOn={colorOn} />
        </div>
      </div>
      {/* Labels */}
      <div>
        <p className={`font-semibold text-sm ${checked ? accentText : "text-gray-700"}`}>{title}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${checked ? `${accentText} opacity-70` : "text-gray-400"}`}>{subtitle}</p>
      </div>
      {/* Status pill */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${checked ? "bg-white/30 text-white" : "bg-gray-100 text-gray-400"
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${checked ? "bg-white animate-pulse" : "bg-gray-300"}`} />
        {checked ? "Active" : "Off"}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────── */
const GenerateStory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [lengthLevel, setLengthLevel] = useState(2);
  const [showImagePrompt, setShowImagePrompt] = useState(true);
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isStoryGuidelinesEditorOpen, setIsStoryGuidelinesEditorOpen] = useState(false);
  const [isVisualGuidelinesEditorOpen, setIsVisualGuidelinesEditorOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [isCoverArtEditorOpen, setIsCoverArtEditorOpen] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  // Multi-character reference slots: which indices are currently processing
  const [uploadingSlots, setUploadingSlots] = useState(new Set());
  // For single_image: which sub-mode is active — prompt | upload | reference
  const [visualMode, setVisualMode] = useState("prompt");

  // Warning modal
  const [showPromptWarning, setShowPromptWarning] = useState(false);
  const [blockedWords, setBlockedWords] = useState([]);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    concept: "",
    storyGuidelines: "",
    tone: "",
    imagePrompt: "",
    storyType: "",
    voice: "",
    mediaType: "single_image",
    imageCount: 5,
    backgroundMusic: true,
    backgroundMusicStyle: "",
    soundEffects: false,
    characterTalk: false,
    aspectRatio: "16:9",
    dualPlatform: false,
    series: "",
    coverArtPrompt: "",
    seoMetadata: JSON.stringify({ Title: "", Description: "" }, null, 2),
    visualSuggestions: "",
    uploadedMediaUrl: "",
    // Multi-character references: [{ name, base64 }]
    characterReferences: [],
    useOmniAudio: false,
    autoPublish: true,
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
    dispatch(fetchOverviewStats());
  }, [dispatch]);

  useEffect(() => {
    const editWorkflowId = localStorage.getItem("editWorkflowId");
    if (!editWorkflowId) return;

    dispatch(fetchWorkflowById(editWorkflowId))
      .unwrap()
      .then((data) => {
        const m = data.metadata || {};
        const rawCharRefs =
          m.characterReferences ||
          m.uploadedCharacterReferences ||
          m.storyMetadata?.characterReferences ||
          [];
        const restoredCharRefs = Array.isArray(rawCharRefs)
          ? rawCharRefs
              .filter((c) => c && (c.url || c.base64))
              .map((c) => ({
                name: c.name || "",
                base64: c.url || c.base64 || "",
                url: c.url || (c.base64?.startsWith("http") ? c.base64 : ""),
              }))
          : [];

        setFormData({
          title: data.title || "",
          url: m.url || "",
          concept: m.textIdea || "",
          storyGuidelines: m.storyGuidelines || "",
          tone: m.voiceTone || "",
          imagePrompt: m.imagePrompt || "",
          storyType: m.storyType || "",
          voice: m.voice || "",
          mediaType: m.mediaType || "single_image",
          imageCount: m.imageCount || 5,
          backgroundMusic: m.backgroundMusic ?? true,
          backgroundMusicStyle: m.backgroundMusicStyle || m.storyMetadata?.backgroundMusicStyle || "",
          soundEffects: m.soundEffects ?? false,
          characterTalk: m.characterTalk ?? false,
          aspectRatio: m.aspectRatio || "16:9",
          series: m.series || "",
          coverArtPrompt: m.coverArtPrompt || "",
          seoMetadata: m.seoContent
            ? JSON.stringify(m.seoContent, null, 2)
            : JSON.stringify({ Title: "", Description: "" }, null, 2),
          visualSuggestions: m.visualSuggestions || "",
          uploadedMediaUrl: m.uploadedMediaUrl || "",
          characterReferences: restoredCharRefs,
        });
        if (restoredCharRefs.length > 0) {
          setVisualMode("reference");
        }
        setShowImagePrompt(m.shouldGenerateImage || !!m.imagePrompt);
      })
      .catch(() => toast.error("Failed to load workflow"))
      .finally(() => localStorage.removeItem("editWorkflowId"));
  }, [dispatch]);

  useEffect(() => {
    if (!loading) return;
    const i = setInterval(
      () => setCurrentMessageIndex((p) => (p + 1) % loadingMessages.length),
      2000
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.media?.fileUrl) {
        handleInputChange("uploadedMediaUrl", res.data.media.fileUrl);
        toast.success("Media uploaded successfully");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to upload media");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  /* ── Multi-character reference slot management ── */

  const MAX_CHAR_SLOTS = 10;

  const handleAddCharacter = () => {
    if (formData.characterReferences.length >= MAX_CHAR_SLOTS) return;
    setFormData(prev => ({
      ...prev,
      characterReferences: [...prev.characterReferences, { name: "", base64: "" }],
    }));
  };

  const handleRemoveCharacter = (index) => {
    setFormData(prev => ({
      ...prev,
      characterReferences: prev.characterReferences.filter((_, i) => i !== index),
    }));
  };

  const handleCharNameChange = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.characterReferences];
      updated[index] = { ...updated[index], name: value };
      return { ...prev, characterReferences: updated };
    });
  };

  const handleCharRefUploadForSlot = (index, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large! Please select an image under 5MB.");
      return;
    }
    setUploadingSlots(prev => new Set(prev).add(index));
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 800;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
          else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const base64Str = canvas.toDataURL("image/jpeg", 0.8);
        setFormData(prev => {
          const updated = [...prev.characterReferences];
          updated[index] = { ...updated[index], base64: base64Str };
          return { ...prev, characterReferences: updated };
        });
        setUploadingSlots(prev => { const s = new Set(prev); s.delete(index); return s; });
        toast.success("Character reference loaded ✅");
      };
      img.onerror = () => {
        toast.error("Failed to read image data");
        setUploadingSlots(prev => { const s = new Set(prev); s.delete(index); return s; });
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      toast.error("Failed to read character reference file");
      setUploadingSlots(prev => { const s = new Set(prev); s.delete(index); return s; });
    };
    reader.readAsDataURL(file);
  };

  const executeGenerate = async (payload) => {
    try {
      setLoading(true);
      const res = await dispatch(generateStory(payload)).unwrap();
      toast.success(
        scheduleForLater
          ? "Your Story is Scheduled ⏰"
          : "Story generation started! Opening Storywave Editor..."
      );
      if (!scheduleForLater) {
        if (res?.workflowId) {
          navigate(`/dashboard/editor/${res.workflowId}`);
        } else {
          navigate("/dashboard/editor");
        }
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
    if (!formData.title)
      return toast.error("Please fill all required fields");
    if (scheduleForLater && !scheduleTime)
      return toast.error("Please select a schedule time");

    const payload = {
      title: formData.title,
      textIdea: formData.concept,
      storyGuidelines: formData.storyGuidelines,
      url: formData.url,
      storyType: formData.storyType,
      voice: formData.voice,
      voiceTone: formData.tone,
      shouldGenerateImage: showImagePrompt,
      imagePrompt: formData.imagePrompt,
      storyLength: storyLengthStr,
      scheduledAt: scheduleForLater ? scheduleTime : null,
      mediaType: formData.mediaType,
      imageCount: formData.imageCount,
      backgroundMusic: formData.backgroundMusic,
      backgroundMusicStyle: formData.backgroundMusicStyle,
      soundEffects: formData.soundEffects,
      characterTalk: formData.characterTalk,
      aspectRatio: formData.aspectRatio,
      dualPlatform: formData.dualPlatform,
      series: formData.series,
      coverArtPrompt: formData.coverArtPrompt,
      seoContent: (() => {
        try { return JSON.parse(formData.seoMetadata); }
        catch { return {}; }
      })(),
      visualSuggestions: formData.visualSuggestions,
      uploadedMediaUrl: formData.uploadedMediaUrl,
      // Multi-character references — send slots that have name and either base64 or url
      characterReferences: formData.characterReferences
        .filter(c => c.name.trim() && (c.base64 || c.url))
        .map(c => ({
          name: c.name.trim(),
          base64: c.base64 || c.url,
          url: c.url || (typeof c.base64 === "string" && c.base64.startsWith("http") ? c.base64 : undefined),
        })),
      characterReferenceBase64: null,
      autoPublish: formData.autoPublish,
      autoPublishDelayMinutes: parseInt(localStorage.getItem("sw_auto_publish_delay_total_minutes") || "60", 10),
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

  /* ── input class helper ── */
  const inputCls =
    "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200 shadow-sm";
  const selectCls =
    "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all duration-200 shadow-sm appearance-none cursor-pointer";

  /* ── section card class ── */
  const sectionCard =
    "bg-white rounded-3xl border border-gray-100 shadow-sm p-7 hover:shadow-md transition-shadow duration-300";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-pink-50/20 p-6 md:p-8">

      {/* ── WARNING MODAL ── */}
      {showPromptWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Content Warning</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Your image prompt contains potentially sensitive words that may violate content guidelines.
            </p>
            {blockedWords.length > 0 && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6">
                <p className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wider">Detected words:</p>
                <div className="flex flex-wrap gap-2">
                  {blockedWords.map((word, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-red-200 rounded-lg text-red-600 text-sm font-medium">{word}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPromptWarning(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">Edit Prompt</button>
              <button onClick={() => executeGenerate(pendingPayload)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm hover:shadow-lg transition-all">Continue Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TEXT EDITOR MODAL ── */}
      {isTextEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Script Editor</h2>
              </div>
              <button onClick={() => setIsTextEditorOpen(false)} className="px-5 py-2 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">Done</button>
            </div>
            <textarea
              value={formData.concept}
              onChange={(e) => handleInputChange("concept", e.target.value)}
              className="flex-1 p-10 text-lg font-medium leading-relaxed resize-none outline-none text-gray-800 placeholder-gray-300"
              placeholder="Write or paste your story script here..."
            />
          </div>
        </div>
      )}

      {/* ── IMAGE PROMPT EDITOR MODAL ── */}
      {isPromptEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-amber-900">Visual Prompt Editor</h2>
              </div>
              <button onClick={() => setIsPromptEditorOpen(false)} className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all">Lock Prompt</button>
            </div>
            <textarea
              value={formData.imagePrompt}
              onChange={(e) => handleInputChange("imagePrompt", e.target.value)}
              className="flex-1 p-10 text-lg font-medium leading-relaxed resize-none outline-none text-amber-900 bg-amber-50/10 placeholder-amber-200"
              placeholder="Describe your visual scene in detail..."
            />
          </div>
        </div>
      )}

      {/* ── COVER ART EDITOR MODAL ── */}
      {isCoverArtEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-pink-100 flex justify-between items-center bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                </div>
                <h2 className="text-lg font-bold text-rose-900">Cover Art Editor</h2>
              </div>
              <button onClick={() => setIsCoverArtEditorOpen(false)} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all">Save Cover Art</button>
            </div>
            <textarea
              value={formData.coverArtPrompt}
              onChange={(e) => handleInputChange("coverArtPrompt", e.target.value)}
              className="flex-1 p-10 text-lg font-medium leading-relaxed resize-none outline-none text-rose-900 bg-rose-50/10 placeholder-rose-200"
              placeholder="Describe the main cover art for your story (16:9 thumbnail)..."
            />
          </div>
        </div>
      )}

      {/* ── STORY GUIDELINES EDITOR MODAL ── */}
      {isStoryGuidelinesEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Story Guidelines Editor</h2>
              </div>
              <button onClick={() => setIsStoryGuidelinesEditorOpen(false)} className="px-5 py-2 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition-colors">Done</button>
            </div>
            <textarea
              value={formData.storyGuidelines}
              onChange={(e) => handleInputChange("storyGuidelines", e.target.value)}
              className="flex-1 p-10 text-lg font-medium leading-relaxed resize-none outline-none text-gray-800 placeholder-gray-300"
              placeholder="Write or paste your detailed story guidelines, character notes, tone rules, or narrative structure here..."
            />
          </div>
        </div>
      )}

      {/* ── VISUAL GUIDELINES EDITOR MODAL ── */}
      {isVisualGuidelinesEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-lg font-bold text-amber-900">Visual Guidelines Editor</h2>
              </div>
              <button onClick={() => setIsVisualGuidelinesEditorOpen(false)} className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all">Done</button>
            </div>
            <textarea
              value={formData.visualSuggestions}
              onChange={(e) => handleInputChange("visualSuggestions", e.target.value)}
              className="flex-1 p-10 text-lg font-medium leading-relaxed resize-none outline-none text-amber-900 bg-amber-50/10 placeholder-amber-200"
              placeholder="Write or paste your visual guidelines, lighting notes, color palettes, camera angles, or aesthetic style references here..."
            />
          </div>
        </div>
      )}

      {/* ══════════════════ PAGE HEADER ══════════════════ */}
      <div className="mb-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200/60">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Story Builder</h1>
                <p className="text-gray-400 text-sm">Craft AI-powered stories with voice, visuals & music</p>
              </div>

            </div>
          </div>

          {/* Loading ticker */}
          {loading && (
            <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-md border border-amber-100">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700 text-sm font-medium">{loadingMessages[currentMessageIndex]}</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════ FORM ══════════════════ */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 mx-auto gap-6">

        <div className=" space-y-6">
          {/* ── SECTION 1: Story Identity ── */}
          <div className={sectionCard}>
            <SectionHeader step="1" title="Story Identity" subtitle="Give your story a name, type, and optional series" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Story Title <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Midnight Heist"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Story Type */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Story Type <span className="text-pink-500">*</span>
                </label>
                <select
                  value={formData.storyType}
                  onChange={(e) => handleInputChange("storyType", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select a story type...</option>
                  <option value="true_crime_fiction_cinematic">True Crime — Fiction Cinematic (Netflix-Style)</option>
                  <option value="true_crime_nonfiction_forensic">True Crime — Nonfiction Forensic (Forensic Files)</option>
                  <option value="manipulation_sexual_manipulation">Manipulation — Sexual Manipulation (Mature)</option>
                  <option value="cultural_history_documentary">Cultural History — Documentary (National Geographic)</option>
                  <option value="homesteading_howto_field_guide">Homesteading — How-To Field Guide</option>
                  <option value="work_and_trades_shop_manual">Work & Trades — Shop Manual (How-To)</option>
                  <option value="work_and_trades_shopfloordoc">Work & Trades — Shopfloor Doc (Profile)</option>
                  <option value="investigative_discovery_journalistic">Investigative Discovery — Journalistic</option>
                  <option value="storytelling_cinematic">Storytelling — Cinematic (Movie-Style)</option>
                  <option value="conversation_narrated_documentary">Conversation — Narrated Documentary (Blended)</option>
                  <option value="education_howto_trades">Education — How-To (Trades)</option>
                  <option value="advertisement">Advertisement — Commercial Product & Brand Promo</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-[38px] text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Series */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Series <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. The Midnight Chronicles"
                  value={formData.series}
                  onChange={(e) => handleInputChange("series", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Content Source ── */}
          <div className={sectionCard}>
            <SectionHeader step="2" title="Content Source" subtitle="Provide a URL, script, or both as source material" />

            <div className="space-y-5">
              {/* Reference URL */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reference URL <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <input
                    type="url"
                    placeholder="https://example.com/article"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              {/* Story Script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Story Script</label>
                  <button
                    type="button"
                    onClick={() => setIsTextEditorOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    Full Editor
                  </button>
                </div>
                <textarea
                  placeholder="Describe your story concept, paste a script, or let the URL guide the AI..."
                  value={formData.concept}
                  onChange={(e) => handleInputChange("concept", e.target.value)}
                  className={`${inputCls} h-40 resize-none leading-relaxed`}
                />
              </div>

              {/* Story Guidelines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Story Guidelines <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                  <button
                    type="button"
                    onClick={() => setIsStoryGuidelinesEditorOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    Full Editor
                  </button>
                </div>
                <textarea
                  placeholder="Specific details about characters, scenes, tone, or how you want the story to be analyzed..."
                  value={formData.storyGuidelines}
                  onChange={(e) => handleInputChange("storyGuidelines", e.target.value)}
                  className={`${inputCls} h-24 resize-none leading-relaxed`}
                />
              </div>

              {/* Visual Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visual Suggestions <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
                  <button
                    type="button"
                    onClick={() => setIsVisualGuidelinesEditorOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    Full Editor
                  </button>
                </div>
                <textarea
                  placeholder="e.g. Use neon noir lighting, rainy streets, dark palette..."
                  value={formData.visualSuggestions}
                  onChange={(e) => handleInputChange("visualSuggestions", e.target.value)}
                  className={`${inputCls} h-24 resize-none leading-relaxed`}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Voice & Style ── */}
          <div className={sectionCard}>
            <SectionHeader step="3" title="Voice & Style" subtitle="Choose the narrator voice, tone, and story length" />

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Voice Selection */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Narrator Voice</label>
                  <VoiceSelector value={formData.voice} onChange={(v) => handleInputChange("voice", v)} />
                </div>

                {/* Voice Tone */}
                {/* <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Voice Tone <span className="text-pink-500">*</span>
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => handleInputChange("tone", e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select tone...</option>
                    <option value="neutral">Neutral</option>
                    <option value="excited">Excited & Energetic</option>
                    <option value="calm">Calm & Soothing</option>
                    <option value="mysterious">Mysterious & Intriguing</option>
                    <option value="professional">Professional & Informative</option>
                    <option value="playful">Playful & Fun</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-[38px] text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div> */}
              </div>

              {/* Story Length Slider */}
              {/* <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Story Length</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">{lengthLabels[lengthLevel - 1]}</span>
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-pink-500 text-white text-xs font-bold rounded-full shadow-sm">{storyLengthStr}</span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={lengthLevel}
                    onChange={(e) => setLengthLevel(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none accent-amber-500 cursor-pointer"
                    style={{ background: `linear-gradient(to right, #f59e0b ${((lengthLevel - 1) / 2) * 100}%, #e5e7eb ${((lengthLevel - 1) / 2) * 100}%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-300 font-semibold mt-2 px-0.5">
                    <span>10 min</span><span>20 min</span><span>30 min</span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* ── SECTION 4: Format & Platform ── */}
          <div className={sectionCard}>
            <SectionHeader step="4" title="Format & Platform" subtitle="Choose the output aspect ratio for your story" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aspect Ratio</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-400 font-medium">Generate Both (16:9 & 9:16)</span>
                  <ToggleSwitch
                    checked={formData.dualPlatform}
                    onChange={() => handleInputChange("dualPlatform", !formData.dualPlatform)}
                    colorOn="bg-amber-500"
                  />
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${formData.dualPlatform ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                {[
                  { ratio: "9:16", label: "TikTok / Reels", icon: "/apps/tiktok.svg", sub: "9:16 Vertical" },
                  { ratio: "16:9", label: "YouTube", icon: "/apps/youtube.svg", sub: "16:9 Widescreen" },
                ].map(({ ratio, label, icon, sub }) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => handleInputChange("aspectRatio", ratio)}
                    className={`py-5 px-4 rounded-2xl border-2 text-center font-medium transition-all duration-200 ${formData.aspectRatio === ratio
                      ? "border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md shadow-amber-100"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      }`}
                  >
                    <div className="mb-1 rounded-xl overflow-hidden w-fit h-fit mx-auto"><img src={icon} alt={label} className=" w-8 h-8" /></div>
                    <div className={`text-sm font-bold ${formData.aspectRatio === ratio ? "text-amber-700" : "text-gray-700"}`}>{label}</div>
                    <div className={`text-xs ${formData.aspectRatio === ratio ? "text-amber-500" : "text-gray-400"}`}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className=" space-y-6">
          {/* ── SECTION 5: AI Features ── */}
          <div className={sectionCard}>
            <SectionHeader step="5" title="AI Features" subtitle="Supercharge your story with AI-generated visuals, music & effects" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Visual Generation */}
              <FeatureCard
                icon={
                  <svg className={`w-5 h-5 ${showImagePrompt ? "text-amber-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                title="Visual Generation"
                subtitle="AI artwork for every scene"
                checked={showImagePrompt}
                onChange={() => setShowImagePrompt(!showImagePrompt)}
                colorOn="bg-amber-500"
                accentBg="bg-gradient-to-br from-amber-400 to-orange-500"
                accentText="text-white"
              />

              {/* Background Music */}
              <FeatureCard
                icon={
                  <svg className={`w-5 h-5 ${formData.backgroundMusic ? "text-indigo-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                }
                title="Background Music"
                subtitle="Ambient atmospheric score"
                checked={formData.backgroundMusic}
                onChange={() => handleInputChange("backgroundMusic", !formData.backgroundMusic)}
                colorOn="bg-indigo-500"
                accentBg="bg-gradient-to-br from-indigo-400 to-violet-500"
                accentText="text-white"
              />

              {/* Sound Effects */}
              <FeatureCard
                icon={
                  <svg className={`w-5 h-5 ${formData.soundEffects ? "text-teal-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M8.464 8.464a5 5 0 000 7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Sound Effects"
                subtitle="ElevenLabs SFX per scene"
                checked={formData.soundEffects}
                onChange={() => handleInputChange("soundEffects", !formData.soundEffects)}
                colorOn="bg-teal-500"
                accentBg="bg-gradient-to-br from-teal-400 to-emerald-500"
                accentText="text-white"
              />

              {/* Character Talk */}
              <FeatureCard
                icon={
                  <svg className={`w-5 h-5 ${formData.characterTalk ? "text-violet-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
                title="Character Talk"
                subtitle="Native spoken character dialogue video"
                checked={formData.characterTalk}
                onChange={() => handleInputChange("characterTalk", !formData.characterTalk)}
                colorOn="bg-violet-500"
                accentBg="bg-gradient-to-br from-violet-500 to-indigo-600"
                accentText="text-white"
              />
            </div>

            {/* Character Talk Info Banner */}
            {formData.characterTalk && (
              <div className="mt-4 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl animate-fadeIn flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-900">
                    Native Character Voice & Dialogue (Gemini Omni Flash)
                  </p>
                  <p className="text-[11px] text-purple-700/80 mt-0.5 leading-relaxed">
                    {formData.voice
                      ? "Voiceover will narrate the script, and Omni video audio will play in the background seamlessly alongside the voiceover."
                      : "Gemini Omni Flash will generate a real video with spoken character audio reading the script. External voiceover generation is bypassed."}
                  </p>
                </div>
              </div>
            )}

            {/* Background Music Style Custom Prompt Input */}
            {formData.backgroundMusic && (
              <div className="mt-4 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl animate-fadeIn">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-indigo-900">
                    Background Music Style / Prompt
                  </label>
                  <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    Suno AI V5
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-800 placeholder-gray-400"
                  placeholder="e.g. slow dark ambient, suspenseful, minimalistic, cinematic tension"
                  value={formData.backgroundMusicStyle || ""}
                  onChange={(e) => handleInputChange("backgroundMusicStyle", e.target.value)}
                />
              </div>
            )}

            {/* Sound Effects info banner */}
            {/* {formData.soundEffects && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-teal-50 border border-teal-100 rounded-2xl animate-fadeIn">
                <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M8.464 8.464a5 5 0 000 7.072M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-800">ElevenLabs Sound Effects Enabled (Boosted Volume: 125%)</p>
                  <p className="text-xs text-teal-600 mt-0.5 leading-relaxed">High-impact cinematic sound effects will be generated and layered with boosted volume (125%) and optimized sidechain compressor ducking.</p>
                </div>
              </div>
            )} */}

            {/* Visual Generation expanded options */}
            {showImagePrompt && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-6 animate-fadeIn">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visual Generation Settings</p>

                {/* ── Media Type Tab Bar ── */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Media Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: "single_image",
                        label: "Single Image",
                        sub: "One scene",
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 15l5-5 4 4 3-3 6 6" />
                            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={1.8} />
                          </svg>
                        ),
                      },
                      {
                        key: "multi_image",
                        label: "Multi Scene",
                        sub: "Slideshow",
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="5" width="14" height="14" rx="2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 8h2a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2 14l4-4 4 4" />
                          </svg>
                        ),
                      },
                      {
                        key: "video",
                        label: "Video",
                        sub: "Animated",
                        icon: (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="5" width="15" height="14" rx="2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9l5-3v12l-5-3V9z" />
                          </svg>
                        ),
                      },
                    ].map(({ key, label, sub, icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          handleInputChange("mediaType", key);
                          if (key !== "single_image" && visualMode === "upload") {
                            setVisualMode("prompt");
                            handleInputChange("uploadedMediaUrl", "");
                          }
                        }}
                        className={`py-5 px-3 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center gap-2 ${formData.mediaType === key
                          ? "border-amber-400 bg-gradient-to-b from-amber-50 to-orange-50 shadow-lg shadow-amber-100"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                          }`}
                      >
                        <span className={formData.mediaType === key ? "text-amber-500" : "text-gray-400"}>{icon}</span>
                        <div>
                          <div className={`text-xs font-bold leading-tight ${formData.mediaType === key ? "text-amber-700" : "text-gray-600"
                            }`}>{label}</div>
                          <div className={`text-[10px] mt-0.5 ${formData.mediaType === key ? "text-amber-400" : "text-gray-300"
                            }`}>{sub}</div>
                        </div>
                        {formData.mediaType === key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Visual Content Source Selector ── */}
                <div className="space-y-4 animate-fadeIn mt-6">
                  {/* Mode picker tabs */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Content Source</label>
                    <div className="flex rounded-2xl bg-gray-50 border border-gray-100 p-1 gap-1">
                      {[
                        {
                          id: "prompt", label: "Write Prompt", icon: (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          )
                        },
                        {
                          id: "upload", label: "Direct Upload", icon: (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          )
                        },
                        {
                          id: "reference", label: "Character Ref", icon: (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          )
                        },
                      ].filter((tab) => formData.mediaType === "single_image" || tab.id !== "upload").map(({ id, label, icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setVisualMode(id);
                            // Clear conflicting data when switching
                            if (id !== "upload") handleInputChange("uploadedMediaUrl", "");
                            if (id !== "reference") handleInputChange("characterReferences", []);
                            if (id !== "prompt") handleInputChange("imagePrompt", "");
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${visualMode === id
                            ? "bg-white text-amber-600 shadow-md border border-amber-100"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PROMPT mode */}
                  {visualMode === "prompt" && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image Prompt</label>
                        <button type="button" onClick={() => setIsPromptEditorOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                          Full Editor
                        </button>
                      </div>
                      <textarea
                        placeholder={formData.mediaType === "single_image" ? "Describe your visual — lighting, setting, mood, characters..." : "Use this prompt as a reference for the images or video scene character..."}
                        value={formData.imagePrompt}
                        onChange={(e) => handleInputChange("imagePrompt", e.target.value)}
                        className={`${inputCls} h-28 resize-none`}
                      />
                    </div>
                  )}

                  {/* UPLOAD mode — styled card */}
                  {visualMode === "upload" && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Upload Image</label>
                      <label className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${formData.uploadedMediaUrl
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/30"
                        }`}>
                        <input type="file" accept="image/*" onChange={handleMediaUpload} disabled={isUploadingMedia} className="sr-only" />
                        {isUploadingMedia ? (
                          <>
                            <span className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-semibold text-amber-600">Uploading...</p>
                          </>
                        ) : formData.uploadedMediaUrl ? (
                          <>
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-green-700">Uploaded successfully</p>
                              <p className="text-xs text-green-500 mt-0.5 max-w-xs truncate">{formData.uploadedMediaUrl}</p>
                            </div>
                            <button type="button" onClick={(e) => { e.preventDefault(); handleInputChange("uploadedMediaUrl", ""); }} className="text-xs text-red-400 hover:text-red-600 font-medium">Remove & re-upload</button>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-600">Click to upload an image</p>
                              <p className="text-xs text-gray-400 mt-0.5">Bypasses AI generation — uses your image directly</p>
                            </div>
                            <span className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-sm">Browse Files</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  {/* CHARACTER REFERENCE mode — multi-character slot list */}
                  {visualMode === "reference" && (
                    <div className="animate-fadeIn space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Character References</label>
                        <span className="text-xs text-gray-400">{formData.characterReferences.length}/{MAX_CHAR_SLOTS} characters</span>
                      </div>

                      {formData.characterReferences.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600">No character references yet</p>
                            <p className="text-xs text-gray-400 mt-0.5">Add a slot for each character you want to anchor</p>
                          </div>
                        </div>
                      )}

                      {/* Character slots */}
                      <div className="space-y-2">
                        {formData.characterReferences.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-gray-50 group">

                            {/* Photo upload zone */}
                            <label className="relative flex-shrink-0 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={e => handleCharRefUploadForSlot(index, e.target.files[0])}
                              />
                              <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex items-center justify-center transition-all ${slot.base64
                                ? "border-purple-300 bg-purple-50"
                                : "border-dashed border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50"
                                }`}>
                                {uploadingSlots.has(index) ? (
                                  <span className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                ) : slot.base64 ? (
                                  <img src={slot.base64} alt={slot.name || `Char ${index + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                                )}
                              </div>
                              {slot.base64 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                              )}
                            </label>

                            {/* Name input */}
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                placeholder={`Character ${index + 1} name (e.g. Marcus)`}
                                value={slot.name}
                                onChange={e => handleCharNameChange(index, e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder:text-gray-400"
                              />
                              {slot.base64 && !slot.name && (
                                <p className="text-xs text-amber-500 mt-1 pl-1">Add a name so the AI can match this photo to the right character</p>
                              )}
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCharacter(index)}
                              className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove character"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add character button */}
                      {formData.characterReferences.length < MAX_CHAR_SLOTS && (
                        <button
                          type="button"
                          onClick={handleAddCharacter}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border-2 border-dashed border-purple-200 text-purple-500 text-sm font-semibold hover:border-purple-400 hover:bg-purple-50 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Add Character
                        </button>
                      )}

                      <p className="text-xs text-gray-400 pl-1">
                        Name each character exactly as they appear in your story — AI uses the name to match the photo to the right character.
                      </p>
                    </div>
                  )}
                </div>

                {/* Multi-image scene count */}
                {formData.mediaType === "multi_image" && (
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 animate-fadeIn">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Number of Scenes</span>
                      <span className="text-2xl font-bold text-amber-500">{formData.imageCount}</span>
                    </div>
                    <input
                      type="range" min="2" max="500"
                      value={formData.imageCount}
                      onChange={(e) => handleInputChange("imageCount", parseInt(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none accent-amber-500 cursor-pointer"
                      style={{ background: `linear-gradient(to right, #f59e0b ${((formData.imageCount - 2) / 498) * 100}%, #e5e7eb ${((formData.imageCount - 2) / 498) * 100}%)` }}
                    />
                    <div className="flex justify-between text-[10px] text-gray-300 font-semibold mt-2 px-0.5"><span>2</span><span>500</span></div>
                  </div>
                )}

                {/* Cover Art Prompt — styled like image prompt with editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cover Art Prompt</label>
                      <span className="text-gray-300 text-xs font-normal ml-1">(optional)</span>
                    </div>
                    <button type="button" onClick={() => setIsCoverArtEditorOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                      Full Editor
                    </button>
                  </div>
                  <textarea
                    placeholder="Describe the main cover art (used for 16:9 thumbnail)..."
                    value={formData.coverArtPrompt}
                    onChange={(e) => handleInputChange("coverArtPrompt", e.target.value)}
                    className={`${inputCls} h-20 resize-none`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION 6: Advanced Options (always open) ── */}
          <div className={sectionCard}>
            <SectionHeader step="6" title="Advanced Options" subtitle="SEO metadata and custom JSON output settings" />

            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SEO Content <span className="font-normal text-gray-300 normal-case">(JSON)</span></label>
            <textarea
              value={formData.seoMetadata}
              onChange={(e) => handleInputChange("seoMetadata", e.target.value)}
              className={`${inputCls} h-40 font-mono text-sm resize-none`}
            />
            <div className="flex justify-between items-center px-1 mt-2">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Must be valid JSON</p>
              {(() => {
                try {
                  JSON.parse(formData.seoMetadata);
                  return <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">✓ Valid JSON</span>;
                } catch {
                  return <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">✗ Invalid JSON</span>;
                }
              })()}
            </div>
          </div>
        </div>
        {/* ── ACTION AREA ── */}
        <div className="col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-5">
          {/* Schedule toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Schedule for Later</p>
                <p className="text-xs text-gray-400">Pick a date & time to auto-generate</p>
              </div>
            </div>
            <ToggleSwitch
              checked={scheduleForLater}
              onChange={() => setScheduleForLater(!scheduleForLater)}
              colorOn="bg-pink-500"
            />
          </div>

          {/* Date picker */}
          {scheduleForLater && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Schedule Date & Time <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="datetime-local"
                  value={scheduleInput}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => {
                    setScheduleInput(e.target.value);
                    setScheduleTime(new Date(e.target.value).toISOString());
                  }}
                  className={`${inputCls} pl-11`}
                />
              </div>
            </div>
          )}

          {/* Auto Publish Toggle */}
          {/* <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-4">
            <div>
              <p className="text-sm font-bold text-gray-800">Auto-Publish to Socials</p>
              <p className="text-xs text-gray-500 mt-0.5">Automatically post this story once it's done</p>
            </div>
            <ToggleSwitch
              checked={formData.autoPublish}
              onChange={() => handleInputChange("autoPublish", !formData.autoPublish)}
              colorOn="bg-emerald-500"
            />
          </div> */}

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !formData.title}
            className="w-full py-5 rounded-2xl text-base font-extrabold tracking-widest uppercase bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white shadow-xl shadow-pink-200/60 hover:shadow-pink-300/70 hover:scale-[1.015] active:scale-[0.98] transition-all duration-200 disabled:grayscale disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <span className="relative flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Bringing To Life...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {scheduleForLater ? "Schedule Story" : "Generate Story"}
                </>
              )}
            </span>
          </button>
        </div>

      </div>
    </main>
  );
};

export default GenerateStory;