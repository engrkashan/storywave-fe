import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOverview,
  cancelWorkflow,
  deleteWorkflow,
} from "../../../redux/slices/overview.slice";
import { toast } from "react-hot-toast";
import {
  BiEditAlt,
  BiRefresh,
  BiTrash,
  BiVideo,
  BiTime,
  BiCheckCircle,
  BiXCircle,
  BiPlayCircle,
  BiCalendar,
  BiCopy,
  BiDownload,
  BiDotsVerticalRounded,
} from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const ManageWorkflows = () => {
  const dispatch = useDispatch();
  const { stories, status, totalStories } = useSelector(
    (state) => state.overview,
  );
  const [selectedStory, setSelectedStory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    dispatch(fetchOverview());
  }, [dispatch]);

  const handleEdit = (story) => {
    toast("Edit feature coming soon!", { icon: "✏️" });
    console.log("Edit story:", story);
  };

  const handleRegenerate = (story) => {
    toast("Regeneration started...", { icon: "♻️" });
    console.log("Regenerate story:", story);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;

    try {
      await dispatch(deleteWorkflow(id)).unwrap();
      toast.success("Story deleted successfully");
    } catch (err) {
      toast.error("Failed to delete story");
    }
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard!");
  };

  const handleViewDetails = (story) => {
    setSelectedStory(story);
  };

  const getStatusInfo = (status) => {
    const map = {
      COMPLETED: {
        color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
        icon: <BiCheckCircle className="w-4 h-4" />,
        label: "Completed",
        gradient: "from-emerald-50 to-emerald-100/30",
      },
      PENDING: {
        color: "bg-blue-500/10 text-blue-700 border-blue-200",
        icon: <BiTime className="w-4 h-4" />,
        label: "Processing",
        gradient: "from-blue-50 to-blue-100/30",
      },
      SCHEDULED: {
        color: "bg-amber-500/10 text-amber-700 border-amber-200",
        icon: <BiCalendar className="w-4 h-4" />,
        label: "Scheduled",
        gradient: "from-amber-50 to-amber-100/30",
      },
      FAILED: {
        color: "bg-red-500/10 text-red-700 border-red-200",
        icon: <BiXCircle className="w-4 h-4" />,
        label: "Failed",
        gradient: "from-red-50 to-red-100/30",
      },
      CANCELLED: {
        color: "bg-gray-500/10 text-gray-700 border-gray-200",
        icon: <BiXCircle className="w-4 h-4" />,
        label: "Cancelled",
        gradient: "from-gray-50 to-gray-100/30",
      },
    };
    return map[status] || map.PENDING;
  };

  const getStoryType = (story) => {
    if (story.video?.url) return "Video Story";
    if (story.voiceover?.audioURL) return "Audio Podcast";
    return "Content";
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const handleDownload = (story) => {
    toast("Download feature coming soon!", { icon: "📥" });
    console.log("Download story:", story);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/30 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Manage Workflows
            </h1>
            <p className="text-gray-600 mt-2">
              View, edit, regenerate or delete your created stories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
              <span className="text-gray-600">Total: </span>
              <strong className="text-lg text-gray-900">
                {totalStories || stories.length}
              </strong>
            </div>
            <button
              onClick={() => dispatch(fetchOverview())}
              className="p-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-colors"
              title="Refresh"
            >
              <BiRefresh className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {status === "loading" && stories.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500/30 border-t-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your stories...</p>
          </div>
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BiVideo className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            No stories yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Create your first story from the Generate page to see it here
          </p>
          <button
            onClick={() => (window.location.href = "/generate")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            Create First Story
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stories.map((story) => {
            const statusInfo = getStatusInfo(story.status);
            const storyType = getStoryType(story);

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
              >
                {/* Card Header */}
                <div
                  className={`h-40 relative overflow-hidden bg-gradient-to-br ${statusInfo.gradient}`}
                >
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                      {storyType}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 z-10">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Thumbnail/Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {story.status === "COMPLETED" ? (
                      <div className="relative">
                        <BiVideo className="w-20 h-20 text-indigo-400/60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BiPlayCircle className="w-8 h-8 text-indigo-500" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                        </div>
                        <p className="text-sm font-medium text-gray-700 px-4">
                          {statusInfo.label}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">
                    {story.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <BiCalendar className="w-4 h-4" />
                      {formatDate(story.createdAt)}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {story.storyType?.replace(/_/g, " ") || "Story"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(story)}
                        className="px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </div>

                    <div className="flex items-center gap-1 relative">
                      <button
                        onClick={() => handleRegenerate(story)}
                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Regenerate"
                      >
                        <BiRefresh className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === story.id ? null : story.id)
                        }
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <BiDotsVerticalRounded className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {menuOpen === story.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20"
                          >
                            <button
                              onClick={() => handleEdit(story)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <BiEditAlt className="w-4 h-4" />
                              Edit Story
                            </button>
                            <button
                              onClick={() => handleCopyContent(story.content)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <BiCopy className="w-4 h-4" />
                              Copy Content
                            </button>
                            <button
                              onClick={() => handleDownload(story)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                            >
                              <BiDownload className="w-4 h-4" />
                              Download
                            </button>
                            <div className="border-t border-gray-200">
                              <button
                                onClick={() => handleDelete(story.id)}
                                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600"
                              >
                                <BiTrash className="w-4 h-4" />
                                Delete Story
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedStory.title}
                </h3>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BiXCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusInfo(selectedStory.status).color}`}
                    >
                      {getStatusInfo(selectedStory.status).icon}
                      <span className="font-medium">
                        {getStatusInfo(selectedStory.status).label}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="font-medium text-gray-900">
                      {getStoryType(selectedStory)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Created</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedStory.createdAt)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Story Type</p>
                    <p className="font-medium text-gray-900">
                      {selectedStory.storyType?.replace(/_/g, " ") || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedStory.content && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Content
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                      <pre className="text-gray-700 whitespace-pre-wrap text-sm">
                        {selectedStory.content}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleCopyContent(selectedStory.content)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Copy Content
                  </button>
                  <button
                    onClick={() => handleDownload(selectedStory)}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
};

export default ManageWorkflows;
