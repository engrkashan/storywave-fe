import React from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

const MergeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isMerging = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isMerging}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="px-6 pt-7 pb-6 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              size={25}
              className="text-emerald-600"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Ready to merge the story?
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This will merge all approved scenes into the final story.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isMerging}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isMerging}
            className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isMerging ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Merging...
              </>
            ) : (
              "Confirm & Merge"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeConfirmModal;