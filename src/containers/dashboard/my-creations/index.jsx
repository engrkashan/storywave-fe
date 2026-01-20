import { useEffect, useState } from "react";
import {
  BiBook,
  BiHeadphone,
  BiTrash,
  BiVideo,
  BiX,
  BiFilm,
  BiPodcast,
} from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCreations } from "../../../redux/slices/creations.slice";
import { deleteStory } from "../../../redux/slices/story.slice";
import DeleteModal from "../../../components/modals/DeleteModal";


const MyCreations = () => {
  const dispatch = useDispatch();
  const { stories, status } = useSelector((state) => state.creations);
  const [selectedCreation, setSelectedCreation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("story");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchMyCreations());
  }, [dispatch]);

  const { storyCreations, podcastCreations } = stories.reduce(
    (acc, item) => {
      const creation = {
        id: item.id,
        title: item.title,
        type: item.type,
        video: item.video?.url || null,
        content: item.content || item.episode?.script || null,
        audio: item.voiceover?.audioURL || item.episode?.audioURL || null,
        duration: item.video?.duration || item.episode?.duration || null,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        hasVideo: !!item.video?.url,
      };

      if (creation.hasVideo) {
        acc.storyCreations.push(creation);
      } else {
        acc.podcastCreations.push(creation);
      }
      return acc;
    },
    { storyCreations: [], podcastCreations: [] },
  );

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await dispatch(deleteStory(id));
      await dispatch(fetchMyCreations());
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);

    try {
      await dispatch(deleteStory(deleteTarget.id)).unwrap();
      await dispatch(fetchMyCreations());
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
      setShowDeleteModal(false);
    }
  };

  const downloadFileWithName = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const currentCreations =
    activeTab === "story" ? storyCreations : podcastCreations;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Creations</h1>
        <p className="text-gray-600 text-xl">
          Explore your stories and podcasts in an immersive experience
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

      {/* Loading State */}
      {status === "loading" && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your creations...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {status !== "loading" && currentCreations.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center min-h-96 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl border border-gray-200">
          <div className="text-6xl mb-4">
            {activeTab === "story" ? "🎬" : "🎧"}
          </div>
          <p className="text-3xl font-semibold text-gray-900 mb-2">
            No {activeTab === "story" ? "stories" : "podcasts"} yet
          </p>
          <p className="text-gray-600 text-lg max-w-md">
            {activeTab === "story"
              ? "Create amazing video stories and they will appear here."
              : "Generate audio podcasts and they will appear here."}
          </p>
        </div>
      )}

      {/* Grid */}
      {status !== "loading" && currentCreations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentCreations.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer border border-gray-200 hover:border-emerald-200"
              onClick={() => setSelectedCreation(item)}
            >
              {/* Type Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    activeTab === "story"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-purple-500/90 text-white"
                  }`}
                >
                  {activeTab === "story" ? "Story" : "Podcast"}
                </span>
              </div>

              {/* Media Thumbnail */}
              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {item.video ? (
                  <>
                    <video
                      src={item.video}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                      loop
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div
                      className={`text-center p-6 ${activeTab === "podcast" ? "animate-pulse-slow" : ""}`}
                    >
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          activeTab === "story"
                            ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-500"
                            : "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-500"
                        }`}
                      >
                        {activeTab === "story" ? (
                          <BiFilm className="w-10 h-10" />
                        ) : (
                          <BiPodcast className="w-10 h-10" />
                        )}
                      </div>
                      <p className="text-gray-500 font-medium">
                        {activeTab === "story" ? "No video" : "Audio Podcast"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {item.createdAt}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {item.duration
                        ? `${Math.floor(item.duration / 60)} min`
                        : "Unknown duration"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.video && (
                      <BiVideo
                        className={`w-5 h-5 ${activeTab === "story" ? "text-emerald-500" : "text-purple-500"}`}
                      />
                    )}
                    {item.audio && (
                      <BiHeadphone
                        className={`w-5 h-5 ${activeTab === "story" ? "text-emerald-500" : "text-purple-500"}`}
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                        setShowDeleteModal(true);
                      }}
                      className="relative hover:scale-110 transition-transform"
                      title="Delete"
                    >
                      {deletingId === item.id ? (
                        <div
                          className={`w-5 h-5 border-2 ${activeTab === "story" ? "border-emerald-500" : "border-purple-500"} border-t-transparent rounded-full animate-spin`}
                        />
                      ) : (
                        <BiTrash className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedCreation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-200">
            <button
              onClick={() => setSelectedCreation(null)}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-900 transition-colors z-10 bg-white/80 hover:bg-gray-100 rounded-full p-2 border border-gray-200"
            >
              <BiX className="w-6 h-6" />
            </button>

            {/* Left Side - Media */}
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100/50 flex flex-col items-center justify-center p-6 lg:p-8">
              {selectedCreation.video ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                  <video
                    src={selectedCreation.video}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        activeTab === "story"
                          ? "bg-gradient-to-br from-emerald-100 to-emerald-200"
                          : "bg-gradient-to-br from-purple-100 to-purple-200"
                      }`}
                    >
                      {activeTab === "story" ? (
                        <BiFilm className="w-12 h-12 text-emerald-500" />
                      ) : (
                        <BiPodcast className="w-12 h-12 text-purple-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-xl font-medium">
                      {activeTab === "story" ? "Video Story" : "Audio Podcast"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 flex flex-col p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeTab === "story"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {activeTab === "story" ? "Story" : "Podcast"}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">
                    {selectedCreation.createdAt}
                  </span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {selectedCreation.title}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-4">
                {/* Audio Player */}
                {selectedCreation.audio && (
                  <div
                    className={`rounded-2xl p-6 border ${
                      activeTab === "story"
                        ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200"
                        : "bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`rounded-full p-2 ${
                          activeTab === "story"
                            ? "bg-emerald-500"
                            : "bg-purple-500"
                        }`}
                      >
                        <BiHeadphone className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Audio
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <audio
                        controls
                        src={selectedCreation.audio}
                        className="w-full accent-emerald-500"
                      />

                      <button
                        onClick={() =>
                          downloadFileWithName(
                            selectedCreation.audio,
                            `${selectedCreation.title.replace(/[^a-z0-9]/gi, "_")}.mp3`,
                          )
                        }
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all
      ${
        activeTab === "story"
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : "bg-purple-600 text-white hover:bg-purple-700"
      }`}
                      >
                        <BiHeadphone className="w-4 h-4" />
                        Download Audio
                      </button>
                    </div>
                  </div>
                )}

                {/* Content/Script */}
                {selectedCreation.content && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 rounded-full p-2">
                        <BiBook className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Content
                      </h4>
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto pr-3">
                      {selectedCreation.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        isLoading={deletingId === deleteTarget?.id}
        onConfirm={confirmDelete}
        title="Delete Creation?"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default MyCreations;
