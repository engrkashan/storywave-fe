import { BiLinkExternal } from "react-icons/bi";

export default function Integrations() {
  const integrations = [
    {
      name: "YouTube",
      description: "Upload and manage your video content directly to YouTube",
      icon: "/apps/youtube.svg",
      status: "connected",
      category: "Video",
    },
    {
      name: "Spotify",
      description: "Share your music and podcasts on Spotify",
      icon: "/apps/spotify.svg",
      status: "disconnected",
      category: "Music",
    },
    {
      name: "Instagram",
      description: "Post stories and content to your Instagram account",
      icon: "/apps/instagram.svg",
      status: "connected",
      category: "Social Media",
    },
    {
      name: "TikTok",
      description: "Share short-form videos and stories on TikTok",
      icon: "/apps/tiktok.svg",
      status: "disconnected",
      category: "Social Media",
    },
    {
      name: "Twitter",
      description: "Post updates and engage with your Twitter audience",
      icon: "/apps/x.svg",
      status: "connected",
      category: "Social Media",
    },
  ];

  return (
    <div className="flex-1 px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">
          Integrations
        </h2>
        <p className="text-gray-600 text-xl">
          Connect StoryWave with your favorite tools
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {integrations.map((integration, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl border border-gray-300 hover:border-gray-400 p-4 hover:shadow-lg transition-shadow relative group"
          >
            <div className="flex items-start justify-between mb-4">
              <img
                src={integration.icon}
                alt={integration.name}
                className="w-14 h-auto"
              />

              <button className=" transition-opacity p-1 hover:bg-gray-100 rounded">
                <BiLinkExternal className="text-2xl" />
              </button>
              {integration.isNew && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  NEW
                </span>
              )}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {integration.name}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {integration.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
