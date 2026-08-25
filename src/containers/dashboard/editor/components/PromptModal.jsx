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
  const [characterRefImage, setCharacterRefImage] = useState(null); // { file, previewUrl, url, name }
  const [selectedExistingRef, setSelectedExistingRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState(null); // 'save' | 'image' | 'video'
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scene) {
      setPrompt(scene.userEditedPrompt || scene.activePrompt || scene.originalPrompt || "");
      setCharacterRefImage(null);
      setSelectedExistingRef(null);
      setIsSubmitting(false);
      setActionType(null);

      // Check if scene has any pre-selected character ref
      if (scene.selectedRefs && Array.isArray(scene.selectedRefs) && scene.selectedRefs.length > 0) {
        const first = scene.selectedRefs[0];
        if (first?.url) {
          setSelectedExistingRef(first.url);
        }
      }
    }
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const handleResetToOriginal = () => {
    setPrompt(scene.originalPrompt || "");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCharacterRefImage({
      file,
      previewUrl,
      name: file.name,
    });
    setSelectedExistingRef(null);
  };

  const handleRemoveCustomRef = () => {
    if (characterRefImage?.previewUrl && characterRefImage.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(characterRefImage.previewUrl);
    }
    setCharacterRefImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getActiveCharacterRef = () => {
    if (characterRefImage) {
      return characterRefImage; // has .file or .url
    }
    if (selectedExistingRef) {
      const match = existingReferences.find((r) => r.url === selectedExistingRef);
      return match || { url: selectedExistingRef, name: "Character Reference" };
    }
    return null;
  };

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
      const charRef = getActiveCharacterRef();
      if (onRegenerateImage) {
        await onRegenerateImage(scene, prompt.trim(), charRef);
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
      const charRef = getActiveCharacterRef();
      if (onGenerateVideo) {
        await onGenerateVideo(scene, prompt.trim(), charRef);
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
              <p className="text-xs text-gray-600 leading-relaxed font-mono line-clamp-3">
                {scene.originalPrompt || "No original prompt available."}
              </p>
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

          {/* Character Reference Image Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm">
                  <User size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Character Reference Likeness (Optional)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Upload or select a character reference image to lock identity & facial structure during regeneration.
                  </p>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
              >
                <Upload size={13} />
                <span>Upload New Character Image</span>
              </button>
            </div>

            {/* Custom Uploaded Ref Preview */}
            {characterRefImage && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-3">
                  <img
                    src={characterRefImage.previewUrl || characterRefImage.url}
                    alt="Custom Character Ref"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        {characterRefImage.name || "Custom Character Reference"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Attached
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Will be sent directly to AI prompt engine for likeness continuity.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCustomRef}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove reference"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Existing Reference Picker (if available from story) */}
            {existingReferences.length > 0 && !characterRefImage && (
              <div className="space-y-2 pt-2 border-t border-amber-100">
                <span className="text-xs font-semibold text-gray-600 block">
                  Or select from Story Cast References:
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {existingReferences.map((ref, idx) => {
                    const isSelected = selectedExistingRef === ref.url;
                    return (
                      <button
                        key={ref.id || idx}
                        type="button"
                        onClick={() =>
                          setSelectedExistingRef(isSelected ? null : ref.url)
                        }
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all ${isSelected
                            ? "bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]"
                            : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
                          }`}
                      >
                        <img
                          src={ref.url}
                          alt={ref.name || "Ref"}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-xs font-semibold">
                          {ref.name || `Character ${idx + 1}`}
                        </span>
                        {isSelected && <Check size={12} className="ml-1" />}
                      </button>
                    );
                  })}
                </div>
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

