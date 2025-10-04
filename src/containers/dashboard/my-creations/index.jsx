import { useEffect, useState } from "react";
import { BiPlayCircle, BiX } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCreations } from "../../../redux/slices/creations.slice";

const MyCreations = () => {
  const dispatch = useDispatch();
  const { stories, podcasts, status, error } = useSelector(
    (state) => state.creations
  );
  const [selectedStory, setSelectedStory] = useState(null);

  // Fetch creations on mount
  useEffect(() => {
    dispatch(fetchMyCreations());
  }, [dispatch]);

  // Merge stories and podcasts into one array for display
  const creations = [...stories, ...podcasts].map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type || (item.audioURL ? "Podcast" : "Story"),
    status: item.status || "Published",
    views: item.views || "0",
    engagement: item.engagement || "0%",
    preview: item.mediaURL || item.audioURL || "/videos/hero.mp4",
  }));

  return (
    <main className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-gray-900">My Creations</h2>
          <p className="text-gray-700">
            Browse all your generated stories, videos, and podcasts in one
            place.
          </p>
        </div>

        {/* All Creations */}
        <div className="mt-8">
          {status === "loading" && <p>Loading your creations...</p>}
          {status === "failed" && <p className="text-red-500">{error}</p>}

          {status === "succeeded" && creations.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-40">
              <p className="text-2xl font-semibold text-gray-700 mb-4">
                😢 Oops! You haven’t created anything yet.
              </p>
              <p className="text-gray-500">
                Start generating stories or podcasts and they will appear here.
              </p>
            </div>
          )}

          {creations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creations.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out"
                >
                  <video
                    src={item.preview}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                    autoPlay
                    muted
                    loop
                  />
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.type} • {item.date || "N/A"}
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm ${
                        item.status === "Published"
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                    <div className="mt-4 flex space-x-6 text-sm text-gray-600">
                      <span>Views: {item.views}</span>
                      <span>Engagement: {item.engagement}</span>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={() => setSelectedStory(item)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <BiPlayCircle className="text-lg" />
                      Play {item.type}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for playing story */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-2xl shadow-lg w-full sm:w-[90%] md:w-[80%] lg:max-w-3xl max-h-[90vh] p-4 relative overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <BiX className="w-7 h-7" />
            </button>

            {/* Title */}
            <h3 className="text-white text-lg mb-4 pr-10">
              {selectedStory.title}
            </h3>

            {/* Responsive Video */}
            <div className="w-full aspect-video">
              <video
                src={selectedStory.preview}
                controls
                autoPlay
                className="w-full h-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MyCreations;
