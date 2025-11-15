import { BiVideo, BiLink, BiTrendingUp, BiHeart } from "react-icons/bi";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverview } from "../../../redux/slices/overview.slice";

const Overview = () => {
  const dispatch = useDispatch();
  const {
    totalStories,
    videosCreated,
    voiceovers,
    podcasts,
    stories,
    status,
    error,
  } = useSelector((state) => state.overview);
  
  // Fetch overview on mount
  useEffect(() => {
    dispatch(fetchOverview());
    
  }, [dispatch]);

  // Stat cards data from API
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
    <main className="p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
                className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-10`}
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
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}
                >
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Stories */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-6">
          Recent Stories
        </h3>

        {status === "loading" && <p className="text-gray-500">Loading...</p>}

        {status === "succeeded" && stories.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-40">
              <p className="text-2xl font-semibold text-gray-700 mb-4">
                😢 Oops! You haven’t created anything yet.
              </p>
              <p className="text-gray-500">
                Start generating stories and they will appear here.
              </p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -5 }}
              className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative group">
                <video
                  src={story.video?.url || "/videos/hero.mp4"}
                  className="w-full h-64 object-cover brightness-90 group-hover:brightness-75 transition-all duration-300"
                  autoPlay
                  muted
                  loop
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h4 className="text-lg font-bold text-white">
                    {story.title}
                  </h4>
                  <p className="text-sm text-gray-200">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Overview;
