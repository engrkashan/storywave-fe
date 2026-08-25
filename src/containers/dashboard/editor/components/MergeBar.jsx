import React from "react";
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react";

const MergeBar = ({
  scenes = [],
  onMerge,
  isMerging = false,
  mergeEligibility = null,
}) => {
  const totalScenes = scenes.length;
  const generatedScenes = scenes.filter((s) => s.status === "GENERATED" && s.assetUrl).length;
  const regeneratingScenes = scenes.filter((s) => s.status === "REGENERATING").length;
  const failedScenes = scenes.filter((s) => s.status === "REGEN_FAILED" || s.status === "FAILED").length;

  const isAllValid = totalScenes > 0 && generatedScenes === totalScenes && regeneratingScenes === 0 && failedScenes === 0;

  return (
    <div className="sticky bottom-4 left-0 right-0 z-30 px-4 max-w-7xl mx-auto animate-slideUp">
      <div className="p-4 sm:p-5 rounded-3xl bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3.5">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-2xl ${
              isAllValid
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : regeneratingScenes > 0
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isAllValid ? (
              <CheckCircle2 size={22} />
            ) : regeneratingScenes > 0 ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <AlertTriangle size={22} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold">
                {isAllValid
                  ? "All Scenes Ready for Assembly"
                  : regeneratingScenes > 0
                  ? `Regenerating Visuals (${regeneratingScenes} active)`
                  : failedScenes > 0
                  ? `${failedScenes} Scene(s) Require Attention`
                  : "Review in Progress"}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-gray-300">
                {generatedScenes}/{totalScenes} Scenes Valid
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAllValid
                ? "All visual scenes approved. Ready to perform final audio & subtitle merge."
                : regeneratingScenes > 0
                ? "Please wait for active regenerations to complete before merging."
                : "Ensure all scenes have valid generated visuals before proceeding to final assembly."}
            </p>
          </div>
        </div>

        {/* Merge Button */}
        <button
          type="button"
          onClick={onMerge}
          disabled={!isAllValid || isMerging}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
            isAllValid && !isMerging
              ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white hover:scale-105 shadow-emerald-500/25"
              : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
          }`}
        >
          {isMerging ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Starting Final Assembly...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Merge & Continue</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MergeBar;
