import { BiVideo, BiBook, BiTrendingUp, BiHeart } from "react-icons/bi";

const MyCreations = () => {
  const creations = [
    {
      id: 1,
      title: "My First Story",
      date: "Aug 28, 2025",
      type: "Story",
      status: "Published",
      views: "1.2K",
      engagement: "85%",
      preview: "/videos/hero.mp4",
    },
    {
      id: 2,
      title: "Adventure Tale",
      date: "Aug 25, 2025",
      type: "Video",
      status: "Draft",
      views: "0",
      engagement: "0%",
      preview: "/videos/video-two.mp4",
    },
    {
      id: 3,
      title: "Tech Review",
      date: "Aug 20, 2025",
      type: "Story",
      status: "Published",
      views: "890",
      engagement: "72%",
      preview: "/videos/video-one.mp4",
    },
  ];

  return (
    <main className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-gray-900">My Creations</h2>
          <p className="text-gray-700">
            Browse all your generated stories and videos in one place.
          </p>
        </div>

        {/* All Creations */}
        <div className="mt-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Your Stories & Videos
          </h3>
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
                    {item.type} • {item.date}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyCreations;
