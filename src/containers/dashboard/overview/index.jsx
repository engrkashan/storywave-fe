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
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOverview,
  cancelWorkflow,
  deleteWorkflow,
} from "../../../redux/slices/overview.slice";
import { toast } from "react-hot-toast";

const Overview = () => {
  const dispatch = useDispatch();
  const { totalStories, stories, status } = useSelector(
    (state) => state.overview,
  );
  const [workflowToCancel, setWorkflowToCancel] = useState(null);
  const [workflowToDelete, setWorkflowToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState(null);

  // Calculate story statistics
  const storyStats = {
    pending: stories.filter(
      (s) => s.status === "PENDING" || s.status === "SCHEDULED",
    ).length,
    completed: stories.filter((s) => s.status === "COMPLETED").length,
    cancelled: stories.filter(
      (s) => s.status === "CANCELLED" || s.status === "FAILED",
    ).length,
  };

  // Filter stories based on selected status
  const filteredStories = stories.filter((story) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING")
      return story.status === "PENDING" || story.status === "SCHEDULED";
    if (filterStatus === "COMPLETED") return story.status === "COMPLETED";
    if (filterStatus === "CANCELLED")
      return story.status === "CANCELLED" || story.status === "FAILED";
    return true;
  });

  const overviewStats = [
    {
      label: "Total Workflows",
      value: totalStories,
      icon: BiVideo,
      color: "from-blue-500 to-blue-400",
      description: "All generated narratives",
    },
    {
      label: "Pending Stories",
      value: storyStats.pending,
      icon: () => (
        <div className="relative">
          <div className="w-5 h-5 border-2 border-white border-opacity-90 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white bg-opacity-90 rounded-full animate-pulse"></div>
        </div>
      ),
      color: "from-amber-500 to-orange-400",
      description: "In progress or scheduled",
    },
    {
      label: "Completed Stories",
      value: storyStats.completed,
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      color: "from-emerald-500 to-green-400",
      description: "Successfully completed",
    },
    {
      label: "Cancelled Stories",
      value: storyStats.cancelled,
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      color: "from-gray-500 to-gray-400",
      description: "Cancelled or failed",
    },
  ];

  useEffect(() => {
    dispatch(fetchOverview());

    // Poll every 60 seconds to keep data fresh
    const interval = setInterval(() => {
      dispatch(fetchOverview());
    }, 60000);

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
      dispatch(fetchOverview());
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
      dispatch(fetchOverview());
    } catch (error) {
      console.error("Cancel workflow failed:", error);
      toast.error("Failed to cancel story. Try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "FAILED":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
      case "CANCELLED":
        return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-500" };
      case "SCHEDULED":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "PENDING":
        return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-50 text-purple-700";
      case "CREATOR":
        return "bg-indigo-50 text-indigo-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleDownload = async (story) => {
    try {
      const fileUrl = story.video?.url || story.audio?.url;
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

  return (
    <main className="p-8 min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome back, {Cookies.get("fullName")}
            </h2>
            <p className="text-gray-600 mt-2">
              Overview of all your story creations and their status
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || status === "loading"}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiRefresh
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="font-medium">Refresh</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {overviewStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl p-5 shadow-sm bg-white hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}
                    >
                      <div className="text-white">
                        <Icon />
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stories Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {filterStatus === "ALL"
                  ? "All stories"
                  : filterStatus === "PENDING"
                    ? "Pending stories"
                    : filterStatus === "COMPLETED"
                      ? "Completed stories"
                      : "Cancelled stories"}
              </h3>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <BiFilter className="w-4 h-4" />
                <span className="font-medium">
                  {filterStatus === "ALL"
                    ? "All Stories"
                    : filterStatus === "PENDING"
                      ? "Pending"
                      : filterStatus === "COMPLETED"
                        ? "Completed"
                        : "Cancelled"}
                </span>
                <BiChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
                  >
                    {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setFilterStatus(status);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            filterStatus === status
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700"
                          } first:rounded-t-xl last:rounded-b-xl`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                status === "ALL"
                                  ? "bg-gray-400"
                                  : status === "PENDING"
                                    ? "bg-blue-500"
                                    : status === "COMPLETED"
                                      ? "bg-emerald-500"
                                      : "bg-gray-500"
                              }`}
                            ></div>
                            {status === "ALL"
                              ? "All Stories"
                              : status === "PENDING"
                                ? "Pending"
                                : status === "COMPLETED"
                                  ? "Completed"
                                  : "Cancelled"}
                          </div>
                        </button>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stories List */}
        <div className="p-6">
          {status === "loading" && stories.length === 0 ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your stories...</p>
              </div>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BiVideo className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {filterStatus === "ALL"
                  ? "No stories found"
                  : `No ${filterStatus.toLowerCase()} stories`}
              </p>
              <p className="text-gray-500 max-w-md">
                {filterStatus === "ALL"
                  ? "You haven't created any stories yet. Start creating your first story!"
                  : `You don't have any ${filterStatus.toLowerCase()} stories.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 min-h-48">
              <AnimatePresence>
                {filteredStories.map((story) => {
                  const statusColor = getStatusColor(story.status);
                  return (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Status Indicator */}
                        <div className="flex-shrink-0 pt-1">
                          <div
                            className={`w-3 h-3 rounded-full ${statusColor.dot}`}
                          ></div>
                        </div>

                        {/* Story Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {story.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Status */}
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor.bg} ${statusColor.text}`}
                              >
                                {story.status}
                              </span>

                              {/* Role Tag */}
                              {story.owner && (
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(
                                    story.owner.name,
                                  )}`}
                                >
                                  {story.owner.name}
                                </span>
                              )}

                              {story.error && (
                                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                  Error
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span>
                              {new Date(story.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(story.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>

                            {story.error && (
                              <>
                                <span>•</span>
                                <span
                                  className="text-red-500 truncate max-w-[200px]"
                                  title={story.error}
                                >
                                  {story.error.substring(0, 50)}...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:ml-4">
                        {(story.status === "PENDING" ||
                          story.status === "SCHEDULED") && (
                          <button
                            onClick={() => setWorkflowToCancel(story)}
                            className="px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}

                        {story.status === "COMPLETED" &&
                          (story.video?.url || story.audio?.url) && (
                            <button
                              onClick={() => handleDownload(story)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download media"
                            >
                              <BiDownload className="w-4 h-4" />
                            </button>
                          )}

                        <button
                          onClick={() => setWorkflowToDelete(story)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete story"
                        >
                          <BiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {workflowToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
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
              <p className="text-gray-500 mb-6">
                Are you sure you want to cancel{" "}
                <strong>"{workflowToCancel.title}"</strong>? This action cannot
                be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setWorkflowToCancel(null)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
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
                  className="px-5 py-2.5 bg-amber-600 text-white font-medium hover:bg-amber-700 rounded-xl shadow-lg shadow-amber-200 transition-all"
                >
                  Yes, Cancel it
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
