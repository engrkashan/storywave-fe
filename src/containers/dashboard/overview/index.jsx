import { BiVideo, BiLink, BiTrendingUp, BiHeart } from "react-icons/bi";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

const Overview = () => {
  const recentStories = [
    {
      id: 1,
      title: "My First Story",
      date: "Aug 28, 2025",
      status: "Published",
      platforms: ["YouTube", "Instagram"],
      views: "1.2K",
      engagement: "85%",
      preview: "/videos/hero.mp4",
    },
    {
      id: 2,
      title: "Adventure Tale",
      date: "Aug 25, 2025",
      status: "Draft",
      platforms: [],
      views: "0",
      engagement: "0%",
      preview: "/videos/video-two.mp4",
    },
    {
      id: 3,
      title: "Tech Review",
      date: "Aug 20, 2025",
      status: "Published",
      platforms: ["Twitter", "TikTok"],
      views: "890",
      engagement: "72%",
      preview: "/videos/video-one.mp4",
    },
  ];

  const stats = [
    {
      label: "Total Stories",
      value: 15,
      icon: BiVideo,
      color: "from-blue-500 to-blue-400",
      description: "Generated narratives and scripts",
    },
    {
      label: "Videos Created",
      value: 8,
      icon: BiTrendingUp,
      color: "from-purple-500 to-indigo-400",
      description: "Completed video outputs",
    },
    {
      label: "Voiceovers",
      value: 12,
      icon: BiHeart,
      color: "from-pink-500 to-rose-400",
      description: "Generated AI voice narrations",
    },
    {
      label: "Podcasts",
      value: 5,
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
          Here's what's happening with your stories today.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentStories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ y: -5 }}
              className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative group">
                <video
                  src={story.preview}
                  className="w-full h-64 object-cover brightness-90 group-hover:brightness-75 transition-all duration-300"
                  autoPlay
                  muted
                  loop
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h4 className="text-lg font-bold text-white">
                    {story.title}
                  </h4>
                  <p className="text-sm text-gray-200">{story.date}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      story.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {story.status}
                  </span>
                  <div className="text-sm text-gray-500 flex gap-4">
                    <span>👁 {story.views}</span>
                    <span>❤️ {story.engagement}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.platforms.length > 0 ? (
                    story.platforms.map((platform, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium"
                      >
                        {platform}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">
                      No linked platforms
                    </span>
                  )}
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
