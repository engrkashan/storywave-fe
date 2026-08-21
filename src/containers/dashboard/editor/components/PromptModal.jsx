import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, RotateCcw, FileText, Check, Volume2 } from "lucide-react";

const PromptModal = ({ isOpen, onClose, scene, onSave }) => {
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (scene) {
      setPrompt(scene.userEditedPrompt || scene.activePrompt || scene.originalPrompt || "");
    }
  }, [scene]);

  if (!isOpen || !scene) return null;

  const handleResetToOriginal = () => {
    setPrompt(scene.originalPrompt || "");
  };

  const handleSave = async () => {
    if (!prompt.trim()) return;
    setIsSaving(true);
    try {
      await onSave(scene.id, prompt.trim());
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Edit Prompt — Scene {String(scene.index + 1).padStart(2, "0")}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Aspect Ratio: <span className="font-semibold text-gray-700">{scene.ratio}</span> • Duration: <span className="font-semibold text-gray-700">{scene.durationSec?.toFixed(1)}s</span> • Active Version: <span className="font-semibold text-gray-700">v{scene.activeVersion || 1}</span>
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

        {/* Body - Large Spacious Two-Section Layout */}
        <div className="p-8 overflow-y-auto space-y-6">
          {/* Top Row: Narration Context + Original MGE Prompt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Narration Context (Read-only) */}
            {scene.narration ? (
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100/90 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5">
                    <Volume2 size={14} className="text-indigo-600" />
                    <span>Audio Narration (Locked Spine)</span>
                  </div>
                  <p className="text-sm text-indigo-950 italic leading-relaxed">
                    "{scene.narration}"
                  </p>
                </div>
                <span className="text-[11px] text-indigo-600 font-medium">
                  Timing synchronized: {scene.startSec?.toFixed(1)}s → {scene.endSec?.toFixed(1)}s
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
              <p className="text-xs text-gray-600 leading-relaxed font-mono line-clamp-4">
                {scene.originalPrompt || "No original prompt available."}
              </p>
            </div>
          </div>

          {/* Active Visual Prompt Editor (Large Area) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-wider block">
                Active Visual Realization Prompt (Editable)
              </label>
              <span className="text-xs text-gray-400">
                {prompt.length} characters
              </span>
            </div>

            <textarea
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the desired visual composition, subject action, camera movement, and lighting for this scene..."
              className="w-full p-5 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-sm sm:text-base text-gray-900 leading-relaxed outline-none transition-all resize-y shadow-inner font-sans min-h-[220px]"
            />

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Continuity Anchor:</strong> Character identities, wardrobe consistency, and previous-scene visual continuity will be automatically preserved by the engine when regenerating with this prompt.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3.5 px-8 py-5 border-t border-gray-100 bg-gray-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !prompt.trim()}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
