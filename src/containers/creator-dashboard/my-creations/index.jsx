import { useState } from "react";
import {
  BiBook,
  BiHeadphone,
  BiVideo,
  BiFilm,
  BiPodcast,
  BiX,
} from "react-icons/bi";

const STATIC_CREATIONS = [
  {
    id: 1,
    title: "The Last City on Earth",
    type: "story",
    video: null,
    audio: "/mock/audio1.mp3",
    content: "This is a static story script for preview purposes.",
    duration: 480,
    createdAt: "Jan 12, 2024",
  },
  {
    id: 2,
    title: "Future of AI Podcast",
    type: "podcast",
    video: null,
    audio: "/mock/audio2.mp3",
    content: "Static podcast discussion script.",
    duration: 900,
    createdAt: "Jan 15, 2024",
  },
];

const CreatorCreations = () => {
  const [activeTab, setActiveTab] = useState("story");
  const [selectedCreation, setSelectedCreation] = useState(null);

  const storyCreations = STATIC_CREATIONS.filter((c) => c.type === "story");
  const podcastCreations = STATIC_CREATIONS.filter((c) => c.type === "podcast");

  const currentCreations =
    activeTab === "story" ? storyCreations : podcastCreations;

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/30">
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Creations
          </h1>
          <p className="text-gray-600 text-xl">
            Explore stories and podcasts
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("story")}
            className={`flex items-center gap-2 px-6 py-3 text-lg font-medium border-b-2 transition-all ${
              activeTab === "story"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BiFilm className="w-5 h-5" />
            Stories ({storyCreations.length})
          </button>

          <button
            onClick={() => setActiveTab("podcast")}
            className={`flex items-center gap-2 px-6 py-3 text-lg font-medium border-b-2 transition-all ${
              activeTab === "podcast"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BiPodcast className="w-5 h-5" />
            Podcasts ({podcastCreations.length})
          </button>
        </div>

        {/* Empty State */}
        {currentCreations.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center min-h-96 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl border border-gray-200">
            <div className="text-6xl mb-4">
              {activeTab === "story" ? "🎬" : "🎧"}
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-2">
              No {activeTab === "story" ? "stories" : "podcasts"} available
            </p>
          </div>
        )}

        {/* Grid */}
        {currentCreations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCreations.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedCreation(item)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer"
              >
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activeTab === "story"
                        ? "bg-emerald-500 text-white"
                        : "bg-purple-500 text-white"
                    }`}
                  >
                    {activeTab === "story" ? "Story" : "Podcast"}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      activeTab === "story"
                        ? "bg-emerald-100 text-emerald-500"
                        : "bg-purple-100 text-purple-500"
                    }`}
                  >
                    {activeTab === "story" ? (
                      <BiFilm className="w-10 h-10" />
                    ) : (
                      <BiPodcast className="w-10 h-10" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{item.createdAt}</span>
                    <span>
                      {item.duration
                        ? `${Math.floor(item.duration / 60)} min`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedCreation && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-200 relative">
              <button
                onClick={() => setSelectedCreation(null)}
                className="absolute top-6 right-6 bg-white rounded-full p-2 border hover:bg-gray-100"
              >
                <BiX className="w-6 h-6" />
              </button>

              {/* Left */}
              <div className="flex-1 bg-gray-50 flex items-center justify-center p-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    activeTab === "story"
                      ? "bg-emerald-100 text-emerald-500"
                      : "bg-purple-100 text-purple-500"
                  }`}
                >
                  {activeTab === "story" ? (
                    <BiFilm className="w-12 h-12" />
                  ) : (
                    <BiPodcast className="w-12 h-12" />
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex-1 p-6 overflow-y-auto">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                    activeTab === "story"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {activeTab === "story" ? "Story" : "Podcast"}
                </span>

                <h3 className="text-3xl font-bold mb-4">
                  {selectedCreation.title}
                </h3>

                {selectedCreation.audio && (
                  <div className="mb-6">
                    <audio controls className="w-full">
                      <source src={selectedCreation.audio} />
                    </audio>
                  </div>
                )}

                {selectedCreation.content && (
                  <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <BiBook className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-lg">Content</h4>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedCreation.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorCreations;
