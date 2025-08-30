import {
  BiMicrophone,
  BiTime,
  BiPlayCircle,
  BiCloudUpload,
} from "react-icons/bi";

const NarrationStudio = () => {
  const narrations = [
    {
      id: 1,
      title: "Calm Intro Voice",
      date: "Aug 29, 2025",
      status: "Published",
      duration: "1:45",
      platforms: ["YouTube", "Instagram"],
      preview: "/audios/narration-one.mp3",
    },
    {
      id: 2,
      title: "Adventure Narration",
      date: "Aug 26, 2025",
      status: "Draft",
      duration: "2:20",
      platforms: [],
      preview: "/audios/narration-two.mp3",
    },
    {
      id: 3,
      title: "Tech Voiceover",
      date: "Aug 22, 2025",
      status: "Published",
      duration: "3:05",
      platforms: ["TikTok"],
      preview: "/audios/narration-three.mp3",
    },
  ];

  const stats = [
    {
      label: "Total Narrations",
      value: 14,
      icon: BiMicrophone,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Duration",
      value: "48m",
      icon: BiTime,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Published",
      value: 9,
      icon: BiCloudUpload,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Drafts",
      value: 5,
      icon: BiPlayCircle,
      color: "bg-pink-500",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <main className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-gray-900">Narration Studio</h2>
          <p className="text-gray-700">
            Manage and listen to your generated narrations.
          </p>
        </div>

        {/* Narrations List */}
        <div className="mt-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Your Narrations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {narrations.map((narration) => (
              <div
                key={narration.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out"
              >
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {narration.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {narration.date} • {narration.duration}
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      narration.status === "Published"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {narration.status}
                  </span>

                  {/* Audio Player */}
                  <div className="mt-4">
                    <audio
                      controls
                      src={narration.preview}
                      className="w-full"
                    />
                  </div>

                  {/* Platforms */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {narration.platforms.length > 0 ? (
                      narration.platforms.map((platform, idx) => (
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

export default NarrationStudio;
