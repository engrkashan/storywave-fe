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
  BiEdit,
  BiVideo,
  BiMicrophone,
  BiDotsVerticalRounded,
  BiCollection,
} from "react-icons/bi";
import { Layers, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import DeleteModal from "../../../components/modals/DeleteModal";

/* ------------------ HELPERS ------------------ */
const resolveType = (story) => (story.isPodcast ? "PODCAST" : "STORY");
const resolveTypeLabel = (story) =>
  story.isPodcast ? "Podcast" : "Video Story";
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
    icon: <BiCheckCircle className="w-3 h-3" />,
    label: "Completed",
  },
  PENDING: {
    color: "bg-blue-500 text-white",
    icon: <BiTime className="w-3 h-3" />,
    label: "Processing",
  },
  FAILED: {
    color: "bg-red-500 text-white",
    icon: <BiXCircle className="w-3 h-3" />,
    label: "Failed",
  },
};

/* ------------------ FILTER CHIPS ------------------ */
const FilterChips = memo(({ value, onChange }) => {
  const options = [
    { value: "ALL", label: "All" },
    { value: "STORY", label: "Videos" },
    { value: "PODCAST", label: "Podcasts" },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${value === opt.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
});

/* ------------------ WORKFLOW CARD ------------------ */
const WorkflowCard = memo(({ story, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const status = STATUS_MAP[story.status?.toUpperCase()] || STATUS_MAP.PENDING;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const has16_9 = story?.video?.video_16_9 || story?.coverArtURL_16_9 || story?.thumbnail;
  const has9_16 = story?.video?.video_9_16;

  // Aspect ratio determination
  let aspectClass = "aspect-video"; // default 16:9
  if (story?.isPodcast) aspectClass = "aspect-square max-h-[300px]";
  else if (has16_9) aspectClass = "aspect-video";
  else if (has9_16) aspectClass = "aspect-[9/16]";

  const renderMediaContent = () => {
    if (story?.isPodcast) {
      return (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BiMicrophone className="w-12 h-12 text-white" />
          </div>
        </div>
      );
    }

    let mediaUrl = story?.thumbnail || story?.coverArtURL_16_9 || story?.coverArtURL_1_1;
    let isVideo = false;

    if (!mediaUrl && story?.video) {
      mediaUrl = story.video.video_16_9 || story.video.video_9_16 || story.video.fileURL;
      isVideo = !!mediaUrl;
    }

    if (!mediaUrl) mediaUrl = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

    if (isVideo) {
      return (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={mediaUrl}
          muted
          loop
          playsInline
          onMouseOver={(e) => e.target.play()}
          onMouseOut={(e) => { e.target.pause(); e.target.currentTime = 0; }}
        />
      );
    }

    return (
      <img
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        src={mediaUrl}
        alt={story?.title}
      />
    );
  };

  return (
    <div className="flex flex-col gap-3 group relative w-full max-w-sm mx-auto sm:max-w-none">
      {/* Thumbnail Area */}
      <Link
        to={`/dashboard/workflows/${story.id}`}
        className={`relative w-full rounded-xl overflow-hidden bg-gray-100 cursor-pointer ${aspectClass}`}
      >
        {renderMediaContent()}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

        {/* Status / Duration Overlay */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {story?.video?.duration && (
            <div className="px-1.5 py-0.5 bg-black/80 text-white text-xs font-semibold rounded backdrop-blur-sm">
              {story.video.duration}
            </div>
          )}
          {story.status !== "completed" && (
            <div className={`px-2 py-0.5 text-xs font-semibold rounded backdrop-blur-md flex items-center gap-1 ${status.color}`}>
              {status.icon}
              {status.label}
            </div>
          )}
        </div>
      </Link>

      {/* Metadata Area */}
      <div className="flex items-start gap-3 px-1">
        {/* Avatar / Type Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center">
            {story?.isPodcast ? (
              <BiMicrophone className="w-5 h-5 text-gray-500" />
            ) : (
              <BiVideo className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0 pr-6">
          <Link to={`/dashboard/workflows/${story.id}`}>
            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1 break-words">
              {story.title || "Untitled Story"}
            </h3>
          </Link>

          <div className="flex flex-col text-sm text-gray-500">
            {story.series && (
              <span className="font-medium text-indigo-600 truncate">
                {story.series}
              </span>
            )}
            <span className="flex items-center gap-1 truncate">
              {resolveTypeLabel(story)} • {formatDate(story.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Menu Button */}
      <div className="absolute right-0 top-[calc(100%-4rem)] translate-y-2 mt-1 sm:translate-y-0" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
        >
          <BiDotsVerticalRounded size={20} />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[999]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(story);
                  window.location.href = "/dashboard/generate-story";
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <BiEdit size={16} /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(story.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <BiTrash size={16} /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

/* ------------------ MAIN ------------------ */
const ManageWorkflows = () => {
  const dispatch = useDispatch();
  const { stories, status } = useSelector((s) => s.overview);
  const [filterType, setFilterType] = useState("ALL");
  const [groupBySeries, setGroupBySeries] = useState(false);
  const [collapsedSeries, setCollapsedSeries] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  const filteredStories = useMemo(() => {
    if (filterType === "ALL") return stories;
    return stories.filter((story) => resolveType(story) === filterType);
  }, [stories, filterType]);

  // Group stories by their series field
  const groupedStories = useMemo(() => {
    const groups = {};
    filteredStories.forEach((story) => {
      const key = story.series?.trim() || "Unsorted";
      if (!groups[key]) groups[key] = [];
      groups[key].push(story);
    });
    // Sort: named series first, "Unsorted" last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === "Unsorted") return 1;
      if (b === "Unsorted") return -1;
      return a.localeCompare(b);
    });
  }, [filteredStories]);

  const toggleSeries = (key) =>
    setCollapsedSeries((prev) => ({ ...prev, [key]: !prev[key] }));

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
      <div className="flex flex-col gap-2 h-[calc(100vh-100px)] justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <span className="text-gray-500 font-medium">Loading your content...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-[calc(100vh-80px)] bg-white max-w-[1800px] mx-auto">
      {/* HEADER */}
      <div className="mb-6 sticky top-0 bg-white z-10 pb-4 pt-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Your Content</h1>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <FilterChips value={filterType} onChange={setFilterType} />
          {/* Group by Series Toggle */}
          <button
            onClick={() => setGroupBySeries((v) => !v)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${groupBySeries
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
          >
            <Layers className="w-4 h-4" />
            Group by Series
          </button>
        </div>
      </div>

      {/* GRID OR EMPTY STATE */}
      {filteredStories.length > 0 ? (
        groupBySeries ? (
          /* ── GROUPED VIEW ── */
          <div className="space-y-10">
            {groupedStories.map(([seriesName, items]) => (
              <div key={seriesName}>
                {/* Series Section Header */}
                <button
                  onClick={() => toggleSeries(seriesName)}
                  className="flex items-center gap-3 mb-4 w-full group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <BiCollection className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                      {seriesName}
                    </h2>
                    <span className="text-xs text-gray-400 font-medium">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-700 transition-colors">
                    {collapsedSeries[seriesName] ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gray-100 max-w-xs ml-2" />
                </button>

                {/* Series Cards Grid */}
                <AnimatePresence initial={false}>
                  {!collapsedSeries[seriesName] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
                        {items.map((story) => (
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          /* ── FLAT VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-10">
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
        )
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-[50vh] text-center mt-10">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <BiVideo className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">
            No Content Found
          </p>
          <p className="text-gray-500 max-w-sm">
            You haven't created any stories yet. Click create to get started.
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
        description="Are you sure you want to delete this content? This action cannot be undone."
      />
    </div>
  );
};

export default ManageWorkflows;

