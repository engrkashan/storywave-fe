import { useEffect, useState } from "react"
import { BiPlayCircle, BiX, BiHeadphone, BiVideo, BiBook } from "react-icons/bi"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyCreations } from "../../../redux/slices/creations.slice";
import { BiTrash } from "react-icons/bi";
import { deleteStory } from "../../../redux/slices/story.slice";

const MyCreations = () => {
  const dispatch = useDispatch()
  const { stories, podcasts, status } = useSelector((state) => state.creations)
  const [selectedCreation, setSelectedCreation] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  // Fetch creations on mount
  useEffect(() => {
    dispatch(fetchMyCreations())
  }, [dispatch])

  // Merge both types
  const creations = [...stories].map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    video: item.video?.url || null,
    content: item.content || item.episode?.script || null,
    audio: item.voiceover?.audioURL || item.episode?.audioURL || null,
    duration: item.video?.duration || item.episode?.duration || null,
    createdAt: new Date(item.createdAt).toLocaleDateString(),
  }))
  // Handle delete
  const handleDelete = async (e, id) => {
    e.stopPropagation() // prevent card click
    setDeletingId(id)
    try {
      await dispatch(deleteStory(id))
      await dispatch(fetchMyCreations())
    } catch (err) {
      console.error("Delete failed", err)
    } finally {
      setDeletingId(null)
    }
  }
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Creations
        </h1>
        <p className="text-gray-600 text-xl">
          Explore your stories and podcasts in an immersive experience
        </p>
      </div>


      {/* Loading / Empty States */}
      {/* {status === "loading" && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your creations...</p>
          </div>
        </div>
      )} */}

      {status === "succeeded" && creations.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center min-h-96">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-3xl font-semibold text-gray-900 mb-2">No creations yet</p>
          <p className="text-gray-600 text-lg">Start generating stories or podcasts and they will appear here.</p>
        </div>
      )}

      {/* Grid */}
      {creations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creations.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-emerald-500/15 transition-all duration-300 cursor-pointer border border-gray-200"
              onClick={() => setSelectedCreation(item)}
            >
              {/* Image/Video Thumbnail */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                {item.video ? (
                  <video
                    src={item.video}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                    loop
                    autoPlay
                  />
                ) : (
                  <img
                    src={item.type === "PODCAST" ? "/podcast.jpeg" : "/placeholder.jpg"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={item.title}
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{item.title}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-base text-gray-600">
                    {item.type} • {item.createdAt}
                  </p>
                  <div className="flex gap-2 items-center">
                    {item.video && <BiVideo className="w-5 h-5 text-emerald-500" />}
                    {item.audio && <BiHeadphone className="w-5 h-5 text-emerald-500" />}
                    {item.content && <BiBook className="w-5 h-5 text-emerald-500" />}
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="relative"
                    >
                      {deletingId === item.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BiTrash className="w-5 h-5 text-red-500 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal - Side by Side Layout */}
      {selectedCreation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCreation(null)}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-900 transition-colors z-10 bg-white/80 hover:bg-gray-100 rounded-full p-2 border border-gray-200"
            >
              <BiX className="w-6 h-6" />
            </button>

            {/* Left Side - Video/Media */}
            <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6 lg:p-8 min-h-96 lg:min-h-auto">
              {selectedCreation.video ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <video src={selectedCreation.video} controls autoPlay className="w-full h-full" />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <BiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No video available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Content & Audio */}
            <div className="flex-1 flex flex-col p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-200">
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{selectedCreation.title}</h3>
                <p className="text-base text-gray-600">
                  {selectedCreation.type} • {selectedCreation.createdAt}
                </p>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-4">
                {/* Audio Player */}
                {selectedCreation.audio && (
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-500 rounded-full p-2">
                        <BiHeadphone className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg">Audio</h4>
                    </div>
                    <audio controls src={selectedCreation.audio} className="w-full accent-emerald-500" />
                    {selectedCreation.duration && (
                      <p className="text-sm text-gray-600 mt-3">
                        Duration: {Math.floor(selectedCreation.duration / 60)} min
                      </p>
                    )}
                  </div>
                )}

                {/* Content/Script */}
                {selectedCreation.content && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 rounded-full p-2">
                        <BiBook className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-lg">Content</h4>
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto pr-3">
                      {selectedCreation.content}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!selectedCreation.audio && !selectedCreation.content && (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <p className="text-lg">No additional content available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>)
}

export default MyCreations
