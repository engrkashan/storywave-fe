import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  AlertCircle,
  RotateCcw,
  FileText,
  Check,
  Volume2,
  Upload,
  User,
  Trash2,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Users,
} from "lucide-react";

const PromptModal = ({
  isOpen,
  onClose,
  scene,
  existingReferences = [],
  onSavePromptOnly,
  onRegenerateImage,
  onGenerateVideo,
}) => {
  const [prompt, setPrompt] = useState("");
  const [customRefImages, setCustomRefImages] = useState([]); // [{ id, file, previewUrl, url, name }]
  const [selectedExistingRefs, setSelectedExistingRefs] = useState([]); // [url1, url2, ...]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null); // 'save' | 'image' | 'video'
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scene) {
      setPrompt(scene.userEditedPrompt || scene.activePrompt || scene.originalPrompt || "");
      setCustomRefImages([]);
      setIsSubmitting(false);
      setActionType(null);

      // Populate pre-selected character references if present on scene
      if (scene.selectedRefs && Array.isArray(scene.selectedRefs) && scene.selectedRefs.length > 0) {
        const urls = scene.selectedRefs
          .map((r) => (typeof r === "string" ? r : r.url || r.secureUrl || r.imageUrl))
          .filter(Boolean);
        setSelectedExistingRefs(urls);
      } else {
        setSelectedExistingRefs([]);
      }
    }
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const handleResetToOriginal = () => {
    setPrompt(scene.originalPrompt || "");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validImages = files.filter((f) => f.type.startsWith("image/"));
    if (validImages.length < files.length) {
      alert("Some files were skipped because they are not valid image files (PNG, JPG, WEBP).");
    }

    const newCustomRefs = validImages.map((file) => ({
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, ""),
    }));

    setCustomRefImages((prev) => [...prev, ...newCustomRefs]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveCustomRef = (idToRemove) => {
    setCustomRefImages((prev) => {
      const target = prev.find((r) => r.id === idToRemove);
      if (target?.previewUrl && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((r) => r.id !== idToRemove);
    });
  };

  const handleCustomRefNameChange = (id, newName) => {
    setCustomRefImages((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: newName } : r))
    );
  };

  const handleToggleExistingRef = (url) => {
    setSelectedExistingRefs((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleSelectAllExisting = () => {
    const allUrls = existingReferences.map((r) => r.url).filter(Boolean);
    setSelectedExistingRefs(allUrls);
  };

  const handleClearAllExisting = () => {
    setSelectedExistingRefs([]);
  };

  const getActiveCharacterRefs = () => {
    const matchedExisting = existingReferences
      .filter((r) => selectedExistingRefs.includes(r.url))
      .map((r) => ({
        id: r.id || `char_ref_${r.name || "ref"}`,
        name: r.name || "Character Reference",
        url: r.url,
        isCustomOverride: true,
        isExplicit: true,
      }));

    const customs = customRefImages.map((r) => ({
      id: r.id,
      name: r.name || "Custom Character Ref",
      file: r.file,
      url: r.url || r.previewUrl,
      previewUrl: r.previewUrl,
      isCustomOverride: true,
      isExplicit: true,
    }));

    return [...matchedExisting, ...customs];
  };

  const activeRefs = getActiveCharacterRefs();

  const handleSaveOnly = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    setActionType("save");
    try {
      if (onSavePromptOnly) {
        await onSavePromptOnly(scene.id, prompt.trim());
      }
      onClose();
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleRegenImage = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    setActionType("image");
    try {
      if (onRegenerateImage) {
        await onRegenerateImage(scene, prompt.trim(), activeRefs);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleGenerateVideoClip = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    setActionType("video");
    try {
      if (onGenerateVideo) {
        await onGenerateVideo(scene, prompt.trim(), activeRefs);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Scene {String(scene.index + 1).padStart(2, "0")} — Visual Studio</span>
                {scene.assetType === "video" ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">
                    Video Scene
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">
                    Image Frame
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Ratio: <span className="font-semibold text-gray-700">{scene.ratio}</span> • Duration: <span className="font-semibold text-gray-700">{scene.durationSec?.toFixed(1)}s</span> • Active Version: <span className="font-semibold text-gray-700">v{scene.activeVersion || 1}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-gray-400 hover:text-gray-700 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Top Row: Narration Context + Original MGE Prompt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Narration Context (Read-only) */}
            {scene.narration ? (
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100/90 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5">
                    <Volume2 size={14} className="text-indigo-600" />
                    <span>Audio Narration (Locked Spine)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-950 italic leading-relaxed">
                    "{scene.narration}"
                  </p>
                </div>
                <span className="text-[11px] text-indigo-600 font-medium">
                  Timing: {scene.startSec?.toFixed(1)}s → {scene.endSec?.toFixed(1)}s
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-center">
                No audio narration attached to this scene slot.
              </div>
            )}

            {/* Original Generated Prompt */}
            <div className="p-4 rounded-2xl bg-gray-50/90 border border-gray-200 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-gray-500" />
                  Original MGE Prompt
                </span>
                <button
                  type="button"
                  onClick={handleResetToOriginal}
                  className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <RotateCcw size={12} />
                  Reset to this
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto pr-1 text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-wrap break-words bg-white p-3 rounded-xl border border-gray-200/70 select-text">
                {scene.originalPrompt || "No original prompt available."}
              </div>
            </div>
          </div>

          {/* Active Visual Prompt Editor (Large Area) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider block">
                Visual Scene Prompt (Editable)
              </label>
              <span className="text-xs text-gray-400">
                {prompt.length} characters
              </span>
            </div>

            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the desired visual composition, character action, motion, lighting, and camera angle..."
              className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm text-gray-900 leading-relaxed outline-none transition-all resize-y shadow-inner font-sans min-h-[140px]"
            />
          </div>

          {/* Character Reference Images Section (Multi-Select & Multi-Upload) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
                  <Users size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">
                      Character Reference Images (Multiple Selection)
                    </h4>
                    {activeRefs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                        {activeRefs.length} Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Select one or more character images from the cast or upload new ones to anchor likeness in this scene prompt.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
              >
                <Upload size={13} />
                <span>Upload Character Image(s)</span>
              </button>
            </div>

            {/* Custom Uploaded References List */}
            {customRefImages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-700 block">
                  Uploaded Custom References:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {customRefImages.map((customRef) => (
                    <div
                      key={customRef.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 shadow-sm animate-fadeIn"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={customRef.previewUrl || customRef.url}
                          alt={customRef.name}
                          className="w-10 h-10 rounded-lg object-cover border border-amber-300 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={customRef.name}
                            onChange={(e) => handleCustomRefNameChange(customRef.id, e.target.value)}
                            className="text-xs font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-amber-500 outline-none w-full truncate"
                            placeholder="Character name"
                          />
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            Attached for prompt
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomRef(customRef.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 ml-2"
                        title="Remove reference"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Story Cast Reference Picker */}
            {existingReferences.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 block">
                    Select from Story Cast ({selectedExistingRefs.length}/{existingReferences.length} active):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllExisting}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold underline"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleClearAllExisting}
                      className="text-[11px] text-gray-500 hover:text-gray-700 font-semibold underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5">
                  {existingReferences.map((ref, idx) => {
                    const isSelected = selectedExistingRefs.includes(ref.url);
                    return (
                      <button
                        key={ref.id || ref.url || idx}
                        type="button"
                        onClick={() => handleToggleExistingRef(ref.url)}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all flex-shrink-0 ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02] ring-2 ring-amber-400"
                            : "bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                        }`}
                      >
                        <img
                          src={ref.url}
                          alt={ref.name || `Ref ${idx + 1}`}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-xs font-semibold">
                          {ref.name || `Character ${idx + 1}`}
                        </span>
                        {isSelected && <Check size={13} className="ml-1 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active References Summary */}
            {activeRefs.length > 0 ? (
              <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>{activeRefs.length} character reference image{activeRefs.length > 1 ? "s" : ""}</strong> ({activeRefs.map((r) => r.name).join(", ")}) will be passed into the prompt generation engine.
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 italic">
                No character reference selected. The AI will generate visuals based purely on the text prompt.
              </div>
            )}
          </div>
        </div>

        {/* Footer with 3 distinct actions */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 sm:px-8 py-4 sm:py-5 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* 1. Save Prompt Only */}
            <button
              type="button"
              onClick={handleSaveOnly}
              disabled={isSubmitting || !prompt.trim()}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting && actionType === "save" ? "Saving..." : "Save Prompt Only"}
            </button>

            {/* 2. Regenerate Image */}
            <button
              type="button"
              onClick={handleRegenImage}
              disabled={isSubmitting || !prompt.trim()}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <ImageIcon size={15} />
              <span>
                {isSubmitting && actionType === "image" ? "Queueing..." : "Regenerate Image"}
              </span>
            </button>

            {/* 3. Generate as Video (Veo 3) */}
            <button
              type="button"
              onClick={handleGenerateVideoClip}
              disabled={isSubmitting || !prompt.trim()}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Video size={15} />
              <span>
                {isSubmitting && actionType === "video" ? "Queueing Veo 3..." : "Generate as Video (Veo 3)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
