import { Trash2, X, Loader2 } from "lucide-react";

const DeleteModal = ({
  show,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative text-center shadow-xl">
        {/* Close Button */}
        <X
          onClick={!isLoading ? onClose : undefined}
          className={`absolute top-4 right-4 w-6 h-6 ${
            isLoading
              ? "text-gray-300 cursor-not-allowed"
              : "cursor-pointer text-gray-400 hover:text-gray-600"
          }`}
        />

        {/* Icon */}
        <Trash2
          className={`mx-auto text-red-500 w-12 h-12 mb-4 ${
            !isLoading ? "animate-bounce" : ""
          }`}
        />

        {/* Title */}
        <h2 className="text-xl font-semibold mb-2">
          {title || "Are you sure?"}
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-6">
          {description || "This action cannot be undone."}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
              isLoading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            )}
            {isLoading ? "Deleting..." : "Yes, Sure"}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-6 py-2 rounded-full transition ${
              isLoading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
