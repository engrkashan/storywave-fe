import { Trash2, X } from "lucide-react";

const DeleteModal = ({ show, onClose, onConfirm, title, description }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative text-center shadow-xl">
        {/* Close Button */}
        <X
          onClick={onClose}
          className="absolute top-4 right-4 w-6 h-6 cursor-pointer text-gray-400 hover:text-gray-600"
        />
        {/* Trash Icon */}
        <Trash2 className="mx-auto text-red-500 w-12 h-12 mb-4 animate-bounce" />
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
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            Yes, Sure
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
