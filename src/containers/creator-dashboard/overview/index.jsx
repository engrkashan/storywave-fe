import {
  BiVideo,
  BiFilter,
  BiChevronDown,
  BiDownload,
  BiTrash,
  BiRefresh,
} from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const CreatorOverview = () => {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── STATIC MOCK DATA ─────────────────────────────
  const creatorName = "Creator";

  const stories = [
    {
      id: 1,
      title: "The Last Train Home",
      status: "COMPLETED",
      createdAt: new Date(),
      video: true,
    },
    {
      id: 2,
      title: "Echoes of Tomorrow",
      status: "PENDING",
      createdAt: new Date(),
    },
    {
      id: 3,
      title: "Midnight Signals",
      status: "CANCELLED",
      createdAt: new Date(),
    },
  ];

  const stats = {
    total: stories.length,
    pending: stories.filter(
      (s) => s.status === "PENDING" || s.status === "SCHEDULED",
    ).length,
    completed: stories.filter((s) => s.status === "COMPLETED").length,
    cancelled: stories.filter(
      (s) => s.status === "CANCELLED" || s.status === "FAILED",
    ).length,
  };

  const filteredStories = stories.filter((story) => {
    if (filterStatus === "ALL") return true;
    return story.status === filterStatus;
  });

  const overviewStats = [
    {
      label: "Total Creations",
      value: stats.total,
      color: "from-blue-500 to-blue-400",
      icon: BiVideo,
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "from-amber-500 to-orange-400",
      icon: () => (
        <div className="relative">
          <div className="w-5 h-5 border-2 border-white rounded-full"></div>
          <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      ),
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "from-emerald-500 to-green-400",
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      color: "from-gray-500 to-gray-400",
      icon: () => (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700";
      case "PENDING":
        return "bg-blue-50 text-blue-700";
      case "CANCELLED":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  // ── UI ───────────────────────────────────────────
  return (
    <main className="p-8 min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Welcome back, {creatorName}
            </h2>
            <p className="text-gray-600 mt-2">
              Overview of your published and in-progress creations
            </p>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 500);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <BiRefresh
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="font-medium">Refresh</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100 shadow-sm hover:shadow-md"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}
                    >
                      <div className="text-white">
                        <Icon />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </h3>
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

      {/* Stories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Your Creations</h3>
            <p className="text-gray-600 mt-1">Static preview data</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              <BiFilter />
              <span className="font-medium">{filterStatus}</span>
              <BiChevronDown />
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
                >
                  {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50"
                      >
                        {status}
                      </button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* List */}
        <div className="p-6 space-y-3">
          <AnimatePresence>
            {filteredStories.map((story) => (
              <motion.div
                key={story.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50"
              >
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {story.title}
                  </h4>
                  <span
                    className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      story.status,
                    )}`}
                  >
                    {story.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {story.status === "COMPLETED" && (
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <BiDownload />
                    </button>
                  )}
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <BiTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default CreatorOverview;
