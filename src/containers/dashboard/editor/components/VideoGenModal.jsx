import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Video,
  Sparkles,
  Clock,
  AlertCircle,
  RotateCcw,
  User,
  Upload,
  Trash2,
  Check,
  Film,
  Camera,
  Layers,
} from "lucide-react";

/**
 * Builds a cinematic motion graphic prompt tailored for Google Veo 3
 * using the current frame, scene duration, narration, and aspect ratio.
 */
export function buildDefaultVideoPrompt(scene) {
  if (!scene) return "";
  const basePrompt = (scene.userEditedPrompt || scene.activePrompt || scene.originalPrompt || "").trim();
  const duration = scene.durationSec ? `${scene.durationSec.toFixed(1)}s` : "5.0s";
  const narration = scene.narration ? ` Narration context: "${scene.narration}".` : "";
  const ratioNote = scene.ratio === "9:16"
    ? "Vertical 9:16 framing with subjects centered."
    : "Widescreen 16:9 cinematic framing.";

  // If already structured with motion guidelines, return as is
  if (basePrompt.toLowerCase().includes("cinematic motion") || basePrompt.toLowerCase().includes("camera movement")) {
    return basePrompt;
  }

  return `Cinematic motion graphic animation: ${basePrompt}. Smooth camera tracking with subtle depth of field, realistic physics, fluid natural movement, and dynamic lighting.${narration} Visual pacing and character action tailored for a ${duration} timeframe. ${ratioNote}`;
}

const MOTION_PRESETS = [
  { label: "+ Slow Zoom In", snippet: " Slow cinematic push-in zoom toward the focal subject." },
  { label: "+ Tracking Pan", snippet: " Smooth lateral camera tracking movement across the environment." },
  { label: "+ Ambient Particle Glow", snippet: " Atmospheric volumetric lighting with floating ambient particle dynamics." },
  { label: "+ Dynamic Action", snippet: " High-energy dynamic subject action with realistic kinetic momentum." },
];

const VideoGenModal = ({
  isOpen,
  onClose,
  scene,
  existingReferences = [],
  onGenerateVideo,
}) => {
  const [prompt, setPrompt] = useState("");
  const [characterRefImage, setCharacterRefImage] = useState(null);
  const [selectedExistingRef, setSelectedExistingRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scene && isOpen) {
      setPrompt(buildDefaultVideoPrompt(scene));
      setCharacterRefImage(null);
      setSelectedExistingRef(null);
      setIsSubmitting(false);

      if (scene.selectedRefs && Array.isArray(scene.selectedRefs) && scene.selectedRefs.length > 0) {
        const first = scene.selectedRefs[0];
        if (first?.url) {
          setSelectedExistingRef(first.url);
        }
      }
    }
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const handleResetPrompt = () => {
    setPrompt(buildDefaultVideoPrompt(scene));
  };

  const handleApplyPreset = (snippet) => {
    setPrompt((prev) => prev.trim() + snippet);
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
      return characterRefImage;
    }
    if (selectedExistingRef) {
      const match = existingReferences.find((r) => r.url === selectedExistingRef);
      return match || { url: selectedExistingRef, name: "Character Reference" };
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    try {
      const charRef = getActiveCharacterRef();
      if (onGenerateVideo) {
        await onGenerateVideo(scene, prompt.trim(), charRef);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationText = scene.durationSec ? `${scene.durationSec.toFixed(1)}s` : "5.0s";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md">
              <Video size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Generate Motion Graphic (Veo 3) — Scene {String(scene.index + 1).padStart(2, "0")}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                  Google Veo 3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                <span>Timeline Length: <strong className="text-indigo-600">{durationText}</strong></span>
                <span>•</span>
                <span>Ratio: <strong className="text-gray-700">{scene.ratio}</strong></span>
                <span>•</span>
                <span>Version: <strong className="text-gray-700">v{scene.activeVersion || 1}</strong></span>
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
          {/* Top Row: Visual Frame Anchor Preview & Timeframe Lock Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Frame Thumbnail */}
            <div className="sm:col-span-1 p-3 rounded-2xl bg-gray-950 border border-gray-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Film size={12} className="text-indigo-400" />
                Visual Motion Anchor
              </span>
              <div className="h-32 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {scene.assetUrl ? (
                  <img
                    src={scene.assetUrl}
                    alt="Current Scene Frame"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-500">No image frame</span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 italic text-center">
                Veo 3 will animate from this frame
              </span>
            </div>

            {/* Timeframe & Audio Lock Details */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex flex-col justify-between space-y-2.5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                  <Clock size={14} className="text-indigo-600" />
                  <span>Exact Timeframe Sync (Locked)</span>
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed">
                  The generated video clip will match this scene slot's duration (<strong>{durationText}</strong>, from <strong>{scene.startSec?.toFixed(1)}s</strong> to <strong>{scene.endSec?.toFixed(1)}s</strong>) perfectly to preserve audio synchronization.
                </p>
              </div>

              {scene.narration && (
                <div className="p-2.5 rounded-xl bg-white/80 border border-indigo-200/60 text-xs text-indigo-900 italic">
                  "{scene.narration}"
                </div>
              )}
            </div>
          </div>

          {/* Editable Motion Graphic Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={15} className="text-indigo-600" />
                <span>Motion Graphic Scene Prompt (Editable)</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={12} />
                  Reset to Auto-Built Prompt
                </button>
                <span className="text-xs text-gray-400">{prompt.length} chars</span>
              </div>
            </div>

            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe camera motion, action dynamics, lighting shifts, and character movement for this video clip..."
              className="w-full p-4 rounded-2xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-gray-900 leading-relaxed outline-none transition-all resize-y shadow-inner font-sans min-h-[140px]"
            />

            {/* Quick Motion Presets */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
                Add Motion Style:
              </span>
              {MOTION_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(preset.snippet)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 text-xs font-semibold border border-gray-200 hover:border-indigo-300 transition-all shadow-2xs"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Character Reference Section (Optional) */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gray-800 text-white">
                  <User size={14} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    Character Reference Likeness (Optional)
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Lock facial likeness and wardrobe identity during video synthesis.
                  </p>
                </div>
              </div>

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
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <Upload size={12} />
                <span>Upload Char Image</span>
              </button>
            </div>

            {characterRefImage && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={characterRefImage.previewUrl || characterRefImage.url}
                    alt="Character Ref"
                    className="w-10 h-10 rounded-lg object-cover border"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      {characterRefImage.name || "Custom Character Reference"}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Attached to Veo 3 Prompt
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCustomRef}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}

            {existingReferences.length > 0 && !characterRefImage && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                <span className="text-[11px] text-gray-500 shrink-0">Cast:</span>
                {existingReferences.map((ref, idx) => {
                  const isSelected = selectedExistingRef === ref.url;
                  return (
                    <button
                      key={ref.id || idx}
                      type="button"
                      onClick={() =>
                        setSelectedExistingRef(isSelected ? null : ref.url)
                      }
                      className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-700"
                          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <img
                        src={ref.url}
                        alt="Ref"
                        className="w-6 h-6 rounded-md object-cover"
                      />
                      <span>{ref.name || `Char ${idx + 1}`}</span>
                      {isSelected && <Check size={11} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSubmitting || !prompt.trim()}
            className="px-6 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Video size={16} />
            <span>
              {isSubmitting ? "Queueing Veo 3 Clip..." : `Generate Motion Graphic (${durationText})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoGenModal;
