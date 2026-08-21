import React, { useEffect } from "react";
import { X, Maximize2, ExternalLink, Download, Clock, Film, Image as ImageIcon, CheckCircle2 } from "lucide-react";

const MediaPreviewModal = ({ isOpen, onClose, scene }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !scene || !scene.assetUrl) return null;

  const isVideo = scene.assetType === "video" || scene.mediaType === "video" || scene.assetUrl.endsWith(".mp4");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-900/80 text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm">
              {String(scene.index + 1).padStart(2, "0")}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scene {String(scene.index + 1).padStart(2, "0")} — Full Size Preview</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-gray-300">
                  v{scene.activeVersion || 1}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Aspect Ratio: {scene.ratio} • Duration: {scene.durationSec?.toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={scene.assetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title="Open raw asset in new tab"
            >
              <ExternalLink size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Media Viewing Area */}
        <div className="relative bg-black flex items-center justify-center p-4 w-full h-[90vh]">
          {isVideo ? (
            <video
              src={scene.assetUrl}
              className="h-full w-full rounded-xl object-contain shadow-2xl"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={scene.assetUrl}
              alt={`Scene ${scene.index + 1} Full Preview`}
              className="h-full w-full object-contain rounded-xl shadow-2xl select-none"
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default MediaPreviewModal;
