import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOverview,
  deleteWorkflow,
} from "../../../redux/slices/overview.slice";
import { toast } from "react-hot-toast";
import {
  BiTrash,
  BiTime,
  BiCheckCircle,
  BiXCircle,
  BiCalendar,
  BiShow,
  BiEdit,
  BiChevronDown,
  BiChevronUp,
  BiVideo,
} from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import DeleteModal from "../../../components/modals/DeleteModal";

/* ------------------ HELPERS ------------------ */
const resolveType = (story) => (story.video?.url ? "STORY" : "PODCAST");
const resolveTypeLabel = (story) =>
  story.video?.url ? "Video Story" : "Podcast";
const formatDate = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return new Date(date).toLocaleDateString();
  }
};

/* ------------------ STATUS MAP ------------------ */
const STATUS_MAP = {
  COMPLETED: {
    color: "bg-emerald-500 text-white",
    icon: <BiCheckCircle className="w-4 h-4" />,
    label: "Completed",
  },
  PENDING: {
    color: "bg-blue-500 text-white",
    icon: <BiTime className="w-4 h-4" />,
    label: "Processing",
  },
  FAILED: {
    color: "bg-red-500 text-white",
    icon: <BiXCircle className="w-4 h-4" />,
    label: "Failed",
  },
};

/* ------------------ CUSTOM DROPDOWN ------------------ */
const FilterDropdown = memo(({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const options = [
    { value: "ALL", label: "All Types" },
    { value: "STORY", label: "Stories" },
    { value: "PODCAST", label: "Podcasts" },
  ];
  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 w-48 group"
      >
        <span className="font-medium text-gray-700">
          {selectedOption.label}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-gray-400 group-hover:text-gray-600"
        >
          {isOpen ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 w-full rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50 bg-white"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${value === option.value
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <BiCheckCircle className="w-4 h-4 text-indigo-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ------------------ WORKFLOW CARD ------------------ */
const WorkflowCard = memo(({ story, onEdit, onDelete }) => {
  const status = STATUS_MAP[story.status] || STATUS_MAP.PENDING;

  const renderHeaderContent = () => {
    if (story?.isPodcast === false) {
      return (
        <div className="absolute inset-0 w-full h-full">
          <video
            className="w-full h-full object-cover"
            src={story?.video?.url}
            muted
            loop
            playsInline
            autoPlay={false}
            preload="metadata"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      );
    }

    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 12px 24px rgba(0,0,0,0.12)" }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
    >
      <div className="h-40 relative overflow-hidden">
        {renderHeaderContent()}
      </div>

      <div className="p-5 flex flex-col justify-between h-[calc(100%-160px)]">
        <h3 className="font-semibold text-lg line-clamp-2 mb-3 text-gray-800">
          {story.title}
        </h3>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <BiCalendar className="w-4 h-4" />
            {formatDate(story.createdAt)}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
            {resolveTypeLabel(story)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <Link to={`/dashboard/workflows/${story.id}`} title="View">
            <button className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition">
              <BiShow className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(story);
                window.location.href = "/dashboard/generate-story";
              }}
              title="Edit"
              className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition"
            >
              <BiEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(story.id)}
              title="Delete"
              className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
            >
              <BiTrash className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

/* ------------------ MAIN ------------------ */
const ManageWorkflows = () => {
  const dispatch = useDispatch();
  const { stories, status } = useSelector((s) => s.overview);
  const [filterType, setFilterType] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  const filteredStories = useMemo(() => {
    if (filterType === "ALL") return stories;
    return stories.filter((story) => resolveType(story) === filterType);
  }, [stories, filterType]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteWorkflow(deleteId)).unwrap();
      toast.success("Deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, dispatch]);

  const handleDeleteClick = (id) => setDeleteId(id);

  /* ----------- LOADER ----------- */
  if (status === "loading") {
    return (
      <div className="flex flex-col gap-2 h-screen justify-center items-center">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        Loading Workflows...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/30">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Workflows</h1>
        <FilterDropdown value={filterType} onChange={setFilterType} />
      </div>

      {/* GRID OR EMPTY STATE */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredStories.map((story) => (
            <WorkflowCard
              key={story.id}
              story={story}
              onDelete={handleDeleteClick}
              onEdit={(story) =>
                localStorage.setItem("editWorkflowId", story.id)
              }
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-[70vh] bg-white shadow-md mx-auto text-center border border-gray-100 rounded-2xl mt-10">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BiVideo className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No Workflow Found
          </p>
          <p className="text-gray-500 max-w-sm">
            You haven't created any stories yet.
          </p>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteModal
        show={!!deleteId}
        isLoading={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete"
        description="Are you sure you want to delete this workflow? This action cannot be undone."
      />
    </div>
  );
};

export default ManageWorkflows;
