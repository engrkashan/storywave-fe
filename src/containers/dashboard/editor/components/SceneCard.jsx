import React, { useState, useRef } from "react";
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
  Upload,
  Film,
  Download,
} from "lucide-react";

const SceneCard = ({
  scene,
  onEditPrompt,
  onRegenerate,
  onGenerateVideo,
  onReplaceFrame,
  onOpenVersions,
  onViewFullSize,
  characterTalk = false,
}) => {
  const [isUploadingFrame, setIsUploadingFrame] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef(null);

  const isVideo = scene.assetType === "video" || scene.mediaType === "video";
  const isRegenerating = scene.status === "REGENERATING";
  const isFailed = scene.status === "REGEN_FAILED" || scene.status === "FAILED";
  const attempts = scene.generationAttempts || 1;

  const handleDownloadFrame = async (e) => {
    e.stopPropagation();
    if (!scene.assetUrl) return;

    setIsDownloading(true);
    try {
      const ext = isVideo ? "mp4" : "png";
      const filename = `scene_${String(scene.index + 1).padStart(2, "0")}_v${scene.activeVersion || 1}_${scene.ratio?.replace(":", "_") || "16_9"}.${ext}`;

      const res = await fetch(scene.assetUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback if CORS prevents blob fetch
      const a = document.createElement("a");
      a.href = scene.assetUrl;
      a.target = "_blank";
      a.download = `scene_${scene.index + 1}.${isVideo ? "mp4" : "png"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setIsUploadingFrame(true);
    try {
      if (onReplaceFrame) {
        await onReplaceFrame(scene, file);
      }
    } finally {
      setIsUploadingFrame(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Status mapping
  const renderStatusBadge = () => {
    if (isRegenerating) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-sm animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          <span>{isVideo ? "Generating Video..." : "Regenerating..."}</span>
        </div>
      );
    }
    if (isUploadingFrame) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold shadow-sm animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          <span>Uploading Frame...</span>
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
      {/* Hidden File Input for Replace Frame */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilePicked}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

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
              {/* <span>{scene.ratio}</span> */}
              {/* <span>•</span> */}
              <span>{scene.durationSec?.toFixed(1)}s</span>
              {isVideo ? (
                <span className="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  <Video size={11} /> Veo 3 Video
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ImageIcon size={11} /> Image Frame
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

        {/* Top-Right Floating Actions */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-2">
          {/* Quick Replace Frame Button */}
          {!isRegenerating && !isUploadingFrame && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-105 border border-white/15"
              title="Replace this frame with a custom image"
            >
              <Upload size={12} />
              <span>Replace Frame</span>
            </button>
          )}

          {/* Download Frame Button */}
          {scene.assetUrl && !isRegenerating && !isUploadingFrame && (
            <button
              type="button"
              onClick={handleDownloadFrame}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-105 border border-white/15 disabled:opacity-50"
              title={isVideo ? "Download video clip" : "Download frame image"}
            >
              <Download size={12} className={isDownloading ? "animate-bounce" : ""} />
              <span>{isDownloading ? "..." : "Download"}</span>
            </button>
          )}

          {/* View Full Size Floating Button */}
          {scene.assetUrl && !isRegenerating && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewFullSize && onViewFullSize(scene);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md hover:scale-105 border border-white/15"
              title="View Full Size"
            >
              <Maximize2 size={12} />
              <span>Full Size</span>
            </button>
          )}
        </div>

        {/* Loading Overlay during regeneration or upload */}
        {(isRegenerating || isUploadingFrame) && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin flex items-center justify-center" />
            <div className="text-center px-4">
              <p className="text-sm font-bold text-amber-400">
                {isUploadingFrame
                  ? "Uploading Custom Frame..."
                  : isVideo
                    ? "Generating Veo 3 Motion Graphic..."
                    : "Regenerating Visual Frame..."}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {isUploadingFrame
                  ? "Saving to scene version history"
                  : "Preserving audio timeline & likeness"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details & Prompts */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Soft Warning if attempts >= 10 */}
        {/* {attempts >= 10 && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              This scene has been regenerated {attempts} times. Further generations may increase processing time and AI generation costs.
            </span>
          </div>
        )} */}

        {/* Narration Box */}
        {/* {scene.narration && (
          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/70">
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
              <Clock size={11} />
              <span>Audio Narration (Locked)</span>
            </div>
            <p className="text-xs text-indigo-950 italic line-clamp-3">
              "{scene.narration}"
            </p>
          </div>
        )} */}

        {/* Active Prompt Box */}
        {/* <div className="space-y-1">
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
        </div> */}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          {/* Version History Button */}
          {/* <button
            type="button"
            onClick={() => onOpenVersions(scene)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <History size={13} />
            <span>Versions ({scene.versions?.length || 1})</span>
          </button> */}

          {/* Action Row: Veo 3 Video, Edit Prompt, Regenerate */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Generate as Video (Veo 3) Button */}
            {!isVideo && (
              <button
                type="button"
                onClick={() => onGenerateVideo(scene)}
                disabled={isRegenerating || isUploadingFrame}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                title="Convert this image frame into a motion graphic clip using Veo 3"
              >
                <Video size={13} />
                <span>Veo 3 Video</span>
              </button>
            )}

            {/* Edit Prompt & Options Button */}
            <button
              type="button"
              onClick={() => onEditPrompt(scene)}
              disabled={isRegenerating || isUploadingFrame}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-gray-700 hover:text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Edit3 size={13} />
              <span>Studio / Ref</span>
            </button>

            {/* Quick Regenerate Image Button */}
            <button
              type="button"
              onClick={() => onRegenerate(scene)}
              disabled={isRegenerating || isUploadingFrame}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
            >
              <Sparkles size={13} />
              <span>{isRegenerating ? "Regenerating..." : "Regen"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCard;

