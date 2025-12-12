import { BiVideo, BiLink, BiTrendingUp, BiHeart } from "react-icons/bi";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverview, cancelWorkflow } from "../../../redux/slices/overview.slice";

const Overview = () => {
  const dispatch = useDispatch();
  const { totalStories, videosCreated, voiceovers, podcasts, stories, status } =
    useSelector((state) => state.overview);
  const [workflowToCancel, setWorkflowToCancel] = useState(null);

  useEffect(() => {
    dispatch(fetchOverview());

    // Poll every 5 seconds to keep data fresh
    const interval = setInterval(() => {
      dispatch(fetchOverview());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const stats = [
    {
      label: "Total Stories",
      value: totalStories,
      icon: BiVideo,
      color: "from-blue-500 to-blue-400",
      description: "Generated narratives and scripts",
    },
    {
      label: "Videos Created",
      value: videosCreated,
      icon: BiTrendingUp,
      color: "from-purple-500 to-indigo-400",
      description: "Completed video outputs",
    },
    {
      label: "Voiceovers",
      value: voiceovers,
      icon: BiHeart,
      color: "from-pink-500 to-rose-400",
      description: "Generated AI voice narrations",
    },
    {
      label: "Podcasts",
      value: podcasts,
      icon: BiLink,
      color: "from-green-500 to-emerald-400",
      description: "Published audio series",
    },
  ];

  return (
    <main className="p-8 min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900">
          Welcome back, {Cookies.get("fullName")}
        </h2>
        <p className="text-gray-600 text-lg mt-2">
          Here's an overview of all your creations.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden rounded-2xl p-6 shadow-md bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div
                className={`absolute inset-0 bg-linear-to-r ${stat.color} opacity-10`}
              ></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <h3 className="text-4xl font-extrabold text-gray-900 mt-1">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-xl bg-linear-to-br ${stat.color} text-white`}
                >
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          Recent Activity
        </h3>

        {status === "loading" && stories.length === 0 && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your Activity...</p>
            </div>
          </div>
        )}

        {status !== "loading" && stories.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center mt-40">
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              😢 Oops! You haven’t created anything yet.
            </p>
            <p className="text-gray-500">
              Start generating stories and they will appear here.
            </p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            {stories.map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Thumbnail / Status Icon */}
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {story.status === "COMPLETED" && story.video?.url ? (
                      <video
                        src={story.video.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseOver={(e) => e.target.play()}
                        onMouseOut={(e) => e.target.pause()}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {story.status === "FAILED" ? (
                          <div className="text-red-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        ) : story.status === "CANCELLED" ? (
                          <div className="text-gray-400">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        ) : (
                          <div className="text-blue-500 animate-spin">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 truncate">
                      {story.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>

                      {story.error && (
                        <span
                          className="text-sm text-red-500 truncate max-w-[250px] md:max-w-[500px] lg:max-w-[800px] cursor-help"
                          title={story.error}
                        >
                          • {story.error}
                        </span>
                      )}

                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 ml-4">
                  <span
                    className={` font-bold px-2 py-0.5 rounded-full ${story.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : story.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : story.status === "CANCELLED"
                          ? "bg-gray-100 text-gray-600"
                          : story.status === "SCHEDULED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {story.status}
                  </span>
                  {(story.status === "PENDING" || story.status === "SCHEDULED") && (
                    <button
                      onClick={() => setWorkflowToCancel(story)}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {story.status === "COMPLETED" && story.video?.url && (
                    <a
                      href={story.video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Download
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {workflowToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Workflow?
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to cancel <strong>"{workflowToCancel.title}"</strong>? This action cannot be undone.
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
                    dispatch(cancelWorkflow(workflowToCancel.workflow || workflowToCancel.id));
                    setWorkflowToCancel(null);
                    dispatch(fetchOverview());
                  }}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl shadow-lg shadow-red-200 transition-all"
                >
                  Yes, Cancel it
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

export default Overview;
