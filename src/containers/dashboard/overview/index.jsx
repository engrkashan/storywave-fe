import {
  BiDownload,
  BiTrash,
  BiVideo,
  BiFilter,
  BiChevronDown,
  BiRefresh,
} from "react-icons/bi";
import DeleteModal from "../../../components/modals/DeleteModal";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchOverview,
  cancelWorkflow,
  deleteWorkflow,
} from "../../../redux/slices/overview.slice";
import { toast } from "react-hot-toast";

// ─── Animated counter hook ────────────────────────────────────────────────────
const useAnimatedCounter = (target, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// ─── Summary stat card  ─────────────────────────────────────────────
const SummaryCard = ({
  label,
  value,
  icon: Icon,
  gradient,
  delay,
  description,
}) => {
  const animated = useAnimatedCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
      className="relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-white/60 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Gradient background layer */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.13] transition-opacity duration-300`}
      />

      {/* Glow accent top-right */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
            {animated}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-700 leading-tight">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-snug">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Status badge helper ──────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  switch (status) {
    case "COMPLETED":
      return {
        pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "PROCESSING":
      return {
        pill: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        dot: "bg-yellow-500 animate-pulse",
      };
    case "FAILED":
      return {
        pill: "bg-red-100 text-red-700 border border-red-200",
        dot: "bg-red-500",
      };
    case "CANCELLED":
      return {
        pill: "bg-gray-100 text-gray-500 border border-gray-200",
        dot: "bg-gray-400",
      };
    case "SCHEDULED":
      return {
        pill: "bg-amber-100 text-amber-700 border border-amber-200",
        dot: "bg-amber-500 animate-pulse",
      };
    case "PENDING":
      return {
        pill: "bg-blue-100 text-blue-700 border border-blue-200",
        dot: "bg-blue-500 animate-pulse",
      };
    default:
      return {
        pill: "bg-gray-100 text-gray-600 border border-gray-200",
        dot: "bg-gray-400",
      };
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    case "CREATOR":
      return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconTotal = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
);
const IconVideo = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const IconPodcast = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);
const IconVoiceover = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
    />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Overview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalStories, stories, status, voiceovers } = useSelector(
    (state) => state.overview,
  );
  const [workflowToCancel, setWorkflowToCancel] = useState(null);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#filter-dropdown-container")) {
        setShowFilterDropdown(false);
      }
    };
    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterDropdown]);

  // ── Dynamic counts from stories  ──────────────────
  const podcastCount = useMemo(
    () => stories.filter((s) => s.isPodcast).length,
    [stories],
  );
  const videoCount = useMemo(
    () => stories.filter((s) => !s.isPodcast).length,
    [stories],
  );

  // Summary cards data
  const summaryCards = useMemo(
    () => [
      {
        label: "Total Stories",
        value: totalStories,
        icon: IconTotal,
        gradient: "from-[#f8be4c] to-[#f5876c]",
        description: "All generated narratives",
      },
      {
        label: "Total Videos",
        value: videoCount,
        icon: IconVideo,
        gradient: "from-blue-500 to-cyan-400",
        description: "Video stories created",
      },
      {
        label: "Total Podcasts",
        value: podcastCount,
        icon: IconPodcast,
        gradient: "from-purple-500 to-[#f0498f]",
        description: "Podcast episodes created",
      },
      {
        label: "Total Voiceovers",
        value: voiceovers ?? 0,
        icon: IconVoiceover,
        gradient: "from-emerald-500 to-teal-400",
        description: "Voice narrations generated",
      },
    ],
    [totalStories, videoCount, podcastCount, voiceovers],
  );

  // Filter stories
  const filteredStories = useMemo(
    () =>
      stories.filter((story) => {
        if (filterStatus === "ALL") return true;
        if (filterStatus === "PENDING")
          return story.status === "PENDING" || story.status === "SCHEDULED";
        if (filterStatus === "COMPLETED") return story.status === "COMPLETED";
        if (filterStatus === "CANCELLED")
          return story.status === "CANCELLED" || story.status === "FAILED";
        return true;
      }),
    [stories, filterStatus],
  );

  useEffect(() => {
    dispatch(fetchOverview());
    const interval = setInterval(() => dispatch(fetchOverview()), 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOverview());
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDelete = async (workflowId) => {
    setDeletingWorkflowId(workflowId);
    try {
      await dispatch(deleteWorkflow(workflowId)).unwrap();
      toast.success("Story deleted successfully!");
      setWorkflowToDelete(null);
    } catch (error) {
      console.error("Delete story failed:", error);
      toast.error("Failed to delete story. Try again.");
    } finally {
      setDeletingWorkflowId(null);
    }
  };

  const handleCancelWorkflow = async (workflowId) => {
    try {
      await dispatch(cancelWorkflow(workflowId)).unwrap();
      toast.success("Story cancelled successfully!");
      setWorkflowToCancel(null);
    } catch (error) {
      console.error("Cancel workflow failed:", error);
      toast.error("Failed to cancel story. Try again.");
    }
  };

  const handleDownload = async (story) => {
    try {
      const fileUrl = story.video?.url || story.audioURL;
      if (!fileUrl) return;
      const fileName = story.video
        ? `${story.title}.mp4`
        : `${story.title}.mp3`;
      const response = await fetch(fileUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file. Try again.");
    }
  };

  const filterLabel = {
    ALL: "All Stories",
    PENDING: "Pending",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 px-4 py-8 sm:px-6 md:px-8">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Welcome back,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#f8be4c,#f5876c,#f0498f)",
              }}
            >
              {Cookies.get("fullName")}
            </span>
          </h2>
          <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
            Overview of all your story creations and their status
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing || status === "loading"}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl
            hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-gray-700 shadow-sm self-start sm:self-auto"
        >
          <BiRefresh
            className={`w-4 h-4 ${refreshing || status === "loading" ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </motion.div>

      {/* ── Summary Cards (4-column overview) ───────────────────────────────── */}
      <section className="mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3"
        >
          Dashboard Summary
        </motion.p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <SummaryCard key={card.label} {...card} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {/* ── Stories Section ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden"
      >
        {/* Section header */}
        <div className="px-5 py-4 sm:px-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {filterLabel[filterStatus]}{" "}
                <span className="ml-1.5 text-sm font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {filteredStories.length}
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Recent activity and story lifecycle
              </p>
            </div>

            {/* Filter dropdown */}
            <div id="filter-dropdown-container" className="relative self-start sm:self-auto">
              <button
                onClick={() => setShowFilterDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl
                  hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200
                  text-sm font-semibold text-gray-700"
              >
                <BiFilter className="w-4 h-4 text-gray-500" />
                {filterLabel[filterStatus]}
                <BiChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFilterDropdown ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map((s) => {
                      const dotColors = {
                        ALL: "bg-gray-400",
                        PENDING: "bg-blue-500",
                        COMPLETED: "bg-emerald-500",
                        CANCELLED: "bg-gray-500",
                      };
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            setFilterStatus(s);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 ${filterStatus === s ? "bg-amber-50 text-amber-700 font-semibold" : "text-gray-700"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[s]}`}
                          />
                          {filterLabel[s]}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stories list body */}
        <div className="p-4 sm:p-6">
          {status === "loading" && stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-56 gap-3">
              <div className="w-11 h-11 rounded-full border-[3px] border-amber-200 border-t-amber-500 animate-spin" />
              <p className="text-gray-500 text-sm">Loading your stories…</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <BiVideo className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-600">
                {filterStatus === "ALL"
                  ? "No stories yet"
                  : `No ${filterStatus.toLowerCase()} stories`}
              </p>
              <p className="text-sm text-gray-400 max-w-xs">
                {filterStatus === "ALL"
                  ? "Start creating your first story from Story Builder."
                  : `You don't have any ${filterStatus.toLowerCase()} stories.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence>
                {filteredStories.map((story, idx) => {
                  const statusStyle = getStatusStyle(story.status);
                  const isDownloadable =
                    story.status === "COMPLETED" &&
                    (story.video?.url || story.audioURL);
                  const isCancellable =
                    story.status === "PENDING" || story.status === "SCHEDULED";

                  return (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.3), duration: 0.4, ease: "easeOut" }}
                      onClick={() => navigate(`/dashboard/workflows/${story.id}`)}
                      className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 md:p-5 rounded-2xl
                        bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]
                        hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-amber-200/50 hover:bg-white
                        transition-all duration-300 cursor-pointer"
                    >
                      {/* Left: Thumbnail & Type Overlay */}
                      <div className="flex-shrink-0 relative self-start">
                        <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100/80 bg-gray-50 aspect-square">
                          {story.isPodcast ? (
                            <img
                              src="/poadcast.jpg"
                              className="h-16 w-16 sm:h-20 sm:w-20  group-hover:scale-110 transition-transform duration-700 ease-in-out"
                              alt="Podcast"
                            />
                          ) : (
                            <img
                              src="/video.jpg"
                              className="h-16 w-16 sm:h-20 sm:w-20  group-hover:scale-110 transition-transform duration-700 ease-in-out"
                              alt="Video"
                            />
                          )}
                        </div>
                        {/* Type Icon Badge */}
                        <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg text-white shadow-lg ring-2 ring-white
                          ${story.isPodcast ? "bg-gradient-to-br from-purple-500 to-[#f0498f]" : "bg-gradient-to-br from-[#f8be4c] to-[#f5876c]"}`}
                        >
                           {story.isPodcast ? <IconPodcast className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <IconVideo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        </div>
                      </div>

                      {/* Center: Story Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center pt-1 sm:pt-0">
                        {/* Title and Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-2.5">
                          <h4
                            className="text-base sm:text-lg font-bold text-gray-900  line-clamp-1 group-hover:text-[#f0498f] transition-colors duration-300"
                            title={story.title}
                          >
                            {story.title}
                          </h4>

                          {/* Status Badge */}
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${statusStyle.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {story.status}
                          </div>

                          {/* Role Tag */}
                          {story.owner && (
                            <span
                              className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getRoleColor(story.owner.name)}`}
                            >
                              {story.owner.name}
                            </span>
                          )}

                          {/* Error Tag */}
                          {story.error && (
                            <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider shadow-sm">
                              Error
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs font-medium text-gray-500">
                          {story?.series && (
                            <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100/80 px-2.5 py-1 rounded-md border border-gray-200/60 shadow-sm">
                              <span className="text-[#f8be4c]">❖</span>
                              {story.series}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1.5 text-gray-500 bg-white/50 px-2 py-1 rounded-md border border-gray-100">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {new Date(story.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-500 bg-white/50 px-2 py-1 rounded-md border border-gray-100">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              {new Date(story.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {story.error && (
                            <div className="flex items-center gap-1.5 text-red-600 bg-red-50/80 px-2.5 py-1 rounded-md border border-red-100 shadow-sm max-w-[200px] sm:max-w-xs md:max-w-md">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="truncate" title={story.error}>
                                {story.error}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col items-center justify-end gap-2 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {isCancellable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWorkflowToCancel(story);
                            }}
                            className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 rounded-xl sm:rounded-lg transition-all shadow-sm hover:shadow w-full sm:w-auto text-center"
                          >
                            Cancel
                          </button>
                        )}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {isDownloadable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(story);
                              }}
                              className="flex-1 sm:flex-none p-2.5 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl sm:rounded-lg transition-all border border-blue-100 hover:border-blue-600 shadow-sm hover:shadow"
                              title={
                                story.isPodcast
                                  ? "Download audio"
                                  : "Download video"
                              }
                            >
                              <BiDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWorkflowToDelete(story);
                            }}
                            className="flex-1 sm:flex-none p-2.5 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl sm:rounded-lg transition-all border border-red-100 hover:border-red-500 shadow-sm hover:shadow"
                            title="Delete story"
                          >
                            <BiTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Cancel Confirmation Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {workflowToCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Cancel Story?
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Are you sure you want to cancel{" "}
                  <strong>&quot;{workflowToCancel.title}&quot;</strong>? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setWorkflowToCancel(null)}
                    className="px-5 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                  >
                    Keep it
                  </button>
                  <button
                    onClick={() => {
                      handleCancelWorkflow(
                        workflowToCancel.workflow || workflowToCancel.id,
                      );
                      setWorkflowToCancel(null);
                    }}
                    className="px-5 py-2.5 bg-amber-500 text-white font-semibold hover:bg-amber-600 rounded-xl shadow-lg shadow-amber-200 transition-all text-sm"
                  >
                    Yes, Cancel it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {workflowToDelete && (
        <DeleteModal
          show={!!workflowToDelete}
          onClose={() => setWorkflowToDelete(null)}
          title="Delete Story?"
          isLoading={
            deletingWorkflowId ===
            (workflowToDelete?.workflow || workflowToDelete?.id)
          }
          description={
            workflowToDelete
              ? `Are you sure you want to permanently delete "${workflowToDelete.title}"? This action cannot be undone.`
              : ""
          }
          onConfirm={() =>
            handleDelete(workflowToDelete.workflow || workflowToDelete.id)
          }
        />
      )}
    </main>
  );
};

export default Overview;
