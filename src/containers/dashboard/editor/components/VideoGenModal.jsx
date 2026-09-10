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
  Users,
  CheckCircle2,
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
  const [customRefImages, setCustomRefImages] = useState([]);
  const [selectedExistingRefs, setSelectedExistingRefs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scene && isOpen) {
      setPrompt(buildDefaultVideoPrompt(scene));
      setCustomRefImages([]);
      setIsSubmitting(false);

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

  const handleResetPrompt = () => {
    setPrompt(buildDefaultVideoPrompt(scene));
  };

  const handleApplyPreset = (snippet) => {
    setPrompt((prev) => prev.trim() + snippet);
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    try {
      if (onGenerateVideo) {
        await onGenerateVideo(scene, prompt.trim(), activeRefs);
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
                <span>Active Version: <strong className="text-gray-700">v{scene.activeVersion || 1}</strong></span>
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
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
          {/* Source Image / Previous Frame Context */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            {scene.assetUrl ? (
              <img
                src={scene.assetUrl}
                alt="Source Frame"
                className="w-20 h-14 object-cover rounded-xl border border-indigo-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-20 h-14 bg-indigo-200 rounded-xl flex items-center justify-center shrink-0 text-indigo-700">
                <Film size={24} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-0.5">
                <Sparkles size={14} className="text-indigo-600" />
                <span>Image-to-Video Synthesis</span>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed">
                Google Veo 3 will synthesize realistic cinematic camera motion and dynamic character action based on your active frame and prompt.
              </p>
            </div>
          </div>

          {/* Editable Motion Graphic Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider block">
                Veo 3 Motion Graphic Prompt
              </label>
              <button
                type="button"
                onClick={handleResetPrompt}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Regenerate Default Prompt</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe camera movement, physical action, atmospheric lighting, depth of field..."
              className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm text-gray-900 leading-relaxed outline-none transition-all resize-y font-sans shadow-inner min-h-[120px]"
            />

            {/* Motion Presets Chips */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
                <Camera size={13} />
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

          {/* Character Reference Section (Multi-Select & Multi-Upload) */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <Users size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                      Character Reference Images (Multiple Selection)
                    </h4>
                    {activeRefs.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                        {activeRefs.length} Selected
                      </span>
                    )}
                  </div>
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
                multiple
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <Upload size={12} />
                <span>Upload Char Image(s)</span>
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
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-indigo-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={customRef.previewUrl || customRef.url}
                          alt={customRef.name}
                          className="w-9 h-9 rounded-lg object-cover border border-indigo-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={customRef.name}
                            onChange={(e) => handleCustomRefNameChange(customRef.id, e.target.value)}
                            className="text-xs font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none w-full truncate"
                            placeholder="Character name"
                          />
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            Attached
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomRef(customRef.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                        title="Remove reference"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Story Cast Reference Picker */}
            {existingReferences.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-600">
                    Story Cast References ({selectedExistingRefs.length}/{existingReferences.length} active):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllExisting}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
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

                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                  {existingReferences.map((ref, idx) => {
                    const isSelected = selectedExistingRefs.includes(ref.url);
                    return (
                      <button
                        key={ref.id || ref.url || idx}
                        type="button"
                        onClick={() => handleToggleExistingRef(ref.url)}
                        className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-lg border text-xs font-semibold transition-all flex-shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                        }`}
                      >
                        <img
                          src={ref.url}
                          alt="Ref"
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <span>{ref.name || `Char ${idx + 1}`}</span>
                        {isSelected && <Check size={11} className="text-white ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeRefs.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-900 bg-indigo-50/90 p-2 rounded-lg border border-indigo-100">
                <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                <span>
                  <strong>{activeRefs.length} character reference image{activeRefs.length > 1 ? "s" : ""}</strong> ({activeRefs.map((r) => r.name).join(", ")}) attached to Veo 3 prompt.
                </span>
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
