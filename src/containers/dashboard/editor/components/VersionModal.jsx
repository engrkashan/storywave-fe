import React, { useState } from "react";
import { X, History, CheckCircle2, RotateCcw, Image as ImageIcon, Video as VideoIcon, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const VersionModal = ({ isOpen, onClose, scene, onRevert }) => {
  const [revertingVersion, setRevertingVersion] = useState(null);

  if (!isOpen || !scene) return null;

  const versions = scene.versions || [];
  const activeVersion = scene.activeVersion || 1;

  const handleDownloadVersion = async (ver) => {
    if (!ver.assetUrl) return;
    try {
      const isVideo = ver.assetType === "video" || ver.assetUrl.endsWith(".mp4");
      const ext = isVideo ? "mp4" : "png";
      const filename = `scene_${String(scene.index + 1).padStart(2, "0")}_v${ver.version}_${(ver.ratio || scene.ratio || "16:9").replace(":", "_")}.${ext}`;

      const res = await fetch(ver.assetUrl);
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
      const a = document.createElement("a");
      a.href = ver.assetUrl;
      a.target = "_blank";
      a.download = `scene_${scene.index + 1}_v${ver.version}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleRevertClick = async (versionNumber) => {
    setRevertingVersion(versionNumber);
    try {
      await onRevert(scene.id, versionNumber);
      onClose();
    } finally {
      setRevertingVersion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Version History — Scene {String(scene.index + 1).padStart(2, "0")}
              </h3>
              <p className="text-xs text-gray-500">
                Total versions: {versions.length} • Current active: v{activeVersion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {versions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No previous versions recorded for this scene.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {versions.map((ver) => {
                const isActive = ver.version === activeVersion;
                const isRevertingThis = revertingVersion === ver.version;
                const isVideo = ver.assetType === "video" || ver.assetUrl?.endsWith(".mp4");

                return (
                  <div
                    key={ver.id || ver.version}
                    className={`relative rounded-2xl border-2 overflow-hidden flex flex-col transition-all ${
                      isActive
                        ? "border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-md">
                        <CheckCircle2 size={12} />
                        Active
                      </div>
                    )}

                    {/* Media frame */}
                    <div className="relative h-44 bg-black/95 flex items-center justify-center overflow-hidden">
                      {isVideo ? (
                        <video
                          src={ver.assetUrl}
                          className="w-full h-full object-contain"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={ver.assetUrl}
                          alt={`Scene ${scene.index + 1} v${ver.version}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                          <span>Version {ver.version}</span>
                          <span className="text-[11px] font-normal text-gray-500">
                            {ver.createdAt
                              ? formatDistanceToNow(new Date(ver.createdAt), { addSuffix: true })
                              : ""}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1 italic">
                          "{ver.prompt}"
                        </p>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadVersion(ver)}
                          className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-xs"
                          title="Download this version"
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </button>

                        {/* Revert Button */}
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleRevertClick(ver.version)}
                            disabled={isRevertingThis}
                            className="flex-1 py-1.5 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <RotateCcw size={12} />
                            {isRevertingThis ? "Reverting..." : `Revert to v${ver.version}`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/70 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionModal;
