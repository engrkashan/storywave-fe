import { BiVideo, BiLink, BiTrendingUp, BiHeart } from "react-icons/bi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Linked Platforms",
      value: 4,
      icon: BiLink,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Views",
      value: "2.5K",
      icon: BiTrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Engagements",
      value: 320,
      icon: BiHeart,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
    },
  ];

  // Data for platform progress
  const platformData = {
    labels: ["YouTube", "Instagram", "TikTok", "Spotify"],
    datasets: [
      {
        label: "Engagement",
        data: [85, 70, 72, 65],
        backgroundColor: "rgba(44, 43, 42, 0.6)",
        borderColor: "rgb(43, 43, 43)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <main className="p-8">
      <div className="space-y-8">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-gray-900">
            Welcome back, Muhammad!
          </h2>
          <p className="text-gray-700">
            Here's what's happening with your stories today.
          </p>
        </div>
        <div className="flex justify-between items-center">
          {/* Stats Section */}
          <div className="W-1/2 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className={`${stat.bgColor} flex items-start gap-5 p-6 rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`${stat.color} p-3 rounded-full`}>
                      <IconComponent className="text-white w-12 h-12" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <h3 className="text-md whitespace-nowrap font-semibold text-gray-600 ">
                      {stat.label}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Stories Section */}
        <div className="mt-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Recent Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out"
              >
                <video
                  src={story.preview}
                  alt={story.title}
                  className="w-full h-64 object-cover"
                  autoPlay
                  muted
                  loop
                />
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {story.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Date: {story.date}
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      story.status === "Published"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {story.status}
                  </span>
                  <div className="mt-4 flex space-x-6 text-sm text-gray-600">
                    <span>Views: {story.views}</span>
                    <span>Engagement: {story.engagement}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {story.platforms.length > 0 ? (
                      story.platforms.map((platform, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-3 py-1 rounded-lg text-xs bg-blue-100 text-blue-800"
                        >
                          {platform}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No platforms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Overview;
