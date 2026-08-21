import React, { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  History,
  AlertTriangle,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit3,
  Video,
  Image as ImageIcon,
  Maximize2,
} from "lucide-react";

const SceneCard = ({
  scene,
  onEditPrompt,
  onRegenerate,
  onOpenVersions,
  onViewFullSize,
  characterTalk = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const isVideo = scene.assetType === "video" || scene.mediaType === "video";
  const isRegenerating = scene.status === "REGENERATING";
  const isFailed = scene.status === "REGEN_FAILED" || scene.status === "FAILED";
  const attempts = scene.generationAttempts || 1;

  // Status mapping
  const renderStatusBadge = () => {
    if (isRegenerating) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-sm animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          <span>Regenerating...</span>
        </div>
      );
    }
    if (isFailed) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold shadow-sm">
          <AlertCircle size={12} />
          <span>Regen Failed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold shadow-sm">
        <CheckCircle2 size={12} />
        <span>Generated (v{scene.activeVersion || 1})</span>
      </div>
    );
  };

  return (
    <div className="group relative rounded-3xl border border-gray-200/80 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Card Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50/70 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-900 text-white font-bold text-xs shadow-sm">
            {String(scene.index + 1).padStart(2, "0")}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Scene {String(scene.index + 1).padStart(2, "0")}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>{scene.ratio}</span>
              <span>•</span>
              <span>{scene.durationSec?.toFixed(1)}s</span>
              {isVideo ? (
                <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                  <Video size={11} /> Video
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                  <ImageIcon size={11} /> Image
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        {renderStatusBadge()}
      </div>

      {/* Media Preview Frame */}
      <div className="relative h-60 sm:h-64 bg-black/95 flex items-center justify-center overflow-hidden">
        {scene.assetUrl ? (
          isVideo ? (
            <video
              src={scene.assetUrl}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
              playsInline
            />
          ) : (
            <img
              src={scene.assetUrl}
              alt={`Scene ${scene.index + 1}`}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
            <ImageIcon size={32} className="text-gray-600" />
            <span className="text-xs">No preview asset available</span>
          </div>
        )}

        {/* View Full Size Floating Button */}
        {scene.assetUrl && !isRegenerating && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewFullSize && onViewFullSize(scene);
            }}
            className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-105 border border-white/15"
            title="View Full Size"
          >
            <Maximize2 size={13} />
            <span>Full Size</span>
          </button>
        )}

        {/* Loading Overlay during regeneration */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin flex items-center justify-center" />
            <div className="text-center px-4">
              <p className="text-sm font-bold text-amber-400">Regenerating Visual...</p>
              <p className="text-xs text-gray-300 mt-1">Applying continuity context & prompt</p>
            </div>
          </div>
        )}
      </div>

      {/* Details & Prompts */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Soft Warning if attempts >= 10 */}
        {attempts >= 10 && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              This scene has been regenerated {attempts} times. Further generations may increase processing time and AI generation costs.
            </span>
          </div>
        )}

        {/* Narration Box */}
        {scene.narration && (
          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/70">
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
              <Clock size={11} />
              <span>Audio Narration (Locked)</span>
            </div>
            <p className="text-xs text-indigo-950 italic line-clamp-3">
              "{scene.narration}"
            </p>
          </div>
        )}

        {/* Active Prompt Box */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-600">
            <span>Visual Prompt</span>
            {scene.userEditedPrompt && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                User Edited
              </span>
            )}
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/70 text-xs text-gray-800 line-clamp-3">
            {scene.activePrompt || scene.originalPrompt || "No prompt recorded."}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          {/* Version History Button */}
          <button
            type="button"
            onClick={() => onOpenVersions(scene)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <History size={13} />
            <span>Versions ({scene.versions?.length || 1})</span>
          </button>

          {/* Edit Prompt & Regenerate Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditPrompt(scene)}
              disabled={isRegenerating}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-gray-700 hover:text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Edit3 size={13} />
              <span>Edit Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => onRegenerate(scene)}
              disabled={isRegenerating}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
            >
              <Sparkles size={13} />
              <span>{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
