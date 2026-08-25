import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWorkflowsPage,
  deleteWorkflow,
} from "../../../redux/slices/overview.slice";
import { toast } from "react-hot-toast";
import {
  BiTrash,
  BiTime,
  BiCheckCircle,
  BiXCircle,
  BiEdit,
  BiVideo,
  BiMicrophone,
  BiCollection,
  BiPlay,
} from "react-icons/bi";
import { Layers, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import DeleteModal from "../../../components/modals/DeleteModal";
import { TfiReload } from "react-icons/tfi";

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
    color: "bg-emerald-500/90 text-white",
    icon: <BiCheckCircle className="w-3 h-3" />,
    label: "Completed",
  },
  PENDING: {
    color: "bg-blue-500/90 text-white",
    icon: <BiTime className="w-3 h-3" />,
    label: "Processing",
  },
  PROCESSING: {
    color: "bg-blue-500/90 text-white",
    icon: <BiTime className="w-3 h-3" />,
    label: "Processing",
  },
  USER_CONFIRMATION_REQUIRED: {
    color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-semibold",
    icon: <BiEdit className="w-3.5 h-3.5" />,
    label: "Review Required",
  },
  FAILED: {
    color: "bg-red-500/90 text-white",
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
    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${value === opt.value
            ? "bg-gray-900 text-white shadow-sm"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
});

const WorkflowCard = memo(({ story, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const status = STATUS_MAP[story.status?.toUpperCase()] || STATUS_MAP.PENDING;

  const has16_9 =
    story?.video?.video_16_9 || story?.coverArtURL_16_9 || story?.thumbnail;
  const has9_16 = story?.video?.video_9_16;

  // Fixed equal height for all card media frames
  const aspectClass = "h-48 shrink-0 bg-black";

  const renderMediaContent = () => {
    if (story?.isPodcast) {
      return (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BiMicrophone className="w-10 h-10 text-white" />
          </div>
        </div>
      );
    }

    let mediaUrl =
      story?.thumbnail || story?.coverArtURL_16_9 || story?.coverArtURL_9_16;
    let isVideo = false;

    if (!mediaUrl && story?.video) {
      mediaUrl =
        story.video.video_16_9 || story.video.video_9_16 || story.video.fileURL;
      isVideo = !!mediaUrl;
    }

    if (!mediaUrl)
      mediaUrl =
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop";

    if (isVideo) {
      return (
        <>
          <video
            className="absolute inset-0 w-full h-full object-contain bg-black"
            src={mediaUrl}
            muted
            loop
            playsInline
            onMouseOver={(e) => e.target.play()}
            onMouseOut={(e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-black/60 rounded-full p-2 backdrop-blur-sm">
              <BiPlay className="w-6 h-6 text-white" />
            </div>
          </div>
        </>
      );
    }

    return (
      <img
        className="absolute inset-0 w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500"
        src={mediaUrl}
        alt={story?.title}
      />
    );
  };

  // Handle Regenerate
  const handleRegenerate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(story);
    const targetPath = window.location.pathname.startsWith("/creator-dashboard")
      ? "/creator-dashboard/generate-story"
      : "/dashboard/generate-story";
    navigate(targetPath);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(story.id);
  };

  return (
    <div className="group relative w-full max-w-sm mx-auto sm:max-w-none h-full">
      <div className="relative h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 ">
        {/* Thumbnail Area */}
        <Link
          to={`/dashboard/workflows/${story.id}`}
          className={`relative block overflow-hidden ${aspectClass}`}
        >
          {/* Media */}
          <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
            {renderMediaContent()}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Top Badge */}
          <div className="absolute left-3 top-3">
            <div className="rounded-full border border-white/20 bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur-md shadow-sm">
              {resolveTypeLabel(story)}
            </div>
          </div>

          {/* Duration + Status */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {story?.video?.duration && (
              <div className="rounded-lg bg-black/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {story.video.duration}
              </div>
            )}

            {story.status !== "completed" && (
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-md ${status.color}`}
              >
                {status.icon}
                {status.label}
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <Link to={`/dashboard/workflows/${story.id}`}>
            <h3 className="mb-3 line-clamp-5 text-[14px] font-semibold text-gray-900 transition-colors duration-300 group-hover:text-indigo-600">
              {story.title || "Untitled Story"}
            </h3>
          </Link>

          {/* Series */}
          {story.series && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <BiCollection className="h-3.5 w-3.5" />
                {story.series.length > 25
                  ? `${story.series.slice(0, 25)}...`
                  : story.series}
              </span>
            </div>
          )}

          {/* Spacer to push footer down */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 mt-3">
            <span className="text-xs font-medium text-gray-500">
              {formatDate(story.createdAt)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2 translate-y-1 transition-all duration-300 group-hover:translate-y-0 ">
              {story.status === "USER_CONFIRMATION_REQUIRED" && (
                <Link
                  to={`/dashboard/editor/${story.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-md hover:scale-105 transition-all"
                >
                  <BiEdit size={14} />
                  <span>Review Story</span>
                </Link>
              )}
              <Link
                to={`/dashboard/workflows/${story.id}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600  transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                aria-label="Edit"
              >
                <BiEdit size={18} />
              </Link>
              <button
                onClick={handleRegenerate}
                title="Regenerate in Story Builder"
                aria-label="Regenerate"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600  transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <TfiReload size={18} />
              </button>

              <button
                onClick={handleDeleteClick}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600  transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete"
              >
                <BiTrash size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ------------------ MAIN COMPONENT ------------------ */
const ManageWorkflows = () => {
  const dispatch = useDispatch();
  const { stories, workflowsStatus, hasMore, paginationMeta } = useSelector((s) => s.overview);
  const [filterType, setFilterType] = useState("ALL");
  const [groupBySeries, setGroupBySeries] = useState(false);
  const [collapsedSeries, setCollapsedSeries] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    dispatch(fetchWorkflowsPage({ page: 1, limit: 12 }));
  }, [dispatch]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && workflowsStatus !== "loading") {
          dispatch(fetchWorkflowsPage({ page: paginationMeta.page + 1, limit: 12 }));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore, workflowsStatus, paginationMeta.page, dispatch]);

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
  if (workflowsStatus === "loading" && stories.length === 0) {
    return (
      <div className="flex flex-col gap-2 h-[calc(100vh-100px)] justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <span className="text-gray-500 font-medium">
          Loading your content...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-[calc(100vh-80px)] bg-gray-50 max-w-[1800px] mx-auto">
      {/* HEADER */}
      <div className="mb-8 z-10 pb-4 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Your Content
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div className="w-full sm:w-auto flex-1 overflow-hidden">
            <FilterChips value={filterType} onChange={setFilterType} />
          </div>
          {/* Group by Series Toggle */}
          <button
            onClick={() => setGroupBySeries((v) => !v)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${groupBySeries
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
          <div className="space-y-12">
            {groupedStories.map(([seriesName, items]) => (
              <div key={seriesName}>
                {/* Series Section Header */}
                <button
                  onClick={() => toggleSeries(seriesName)}
                  className="flex items-center gap-3 mb-5 w-full group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <BiCollection className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                      {seriesName}
                    </h2>
                    <span className="text-xs text-gray-500 font-medium">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-700 transition-colors">
                    {collapsedSeries[seriesName] ? (
                      <ChevronRight className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 h-px bg-gray-200 max-w-xs ml-2" />
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BiVideo className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">
            No Content Found
          </p>
          <p className="text-gray-500 max-w-sm">
            You haven't created any stories yet. Click create to get started.
          </p>
        </div>
      )}

      {/* Infinite Scroll Target */}
      <div ref={observerTarget} className="py-4 flex justify-center h-12">
        {workflowsStatus === "loading" && stories.length > 0 && (
          <div className="w-8 h-8 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
        )}
      </div>

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
