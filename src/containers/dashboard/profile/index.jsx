import { useState } from "react";
import {
  User,
  Lock,
  Link as LinkIcon,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";

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

const Profile = () => {
  const [user, setUser] = useState({
    name: "Muhammad Qasim",
    email: "muhammadqasimbhatti4@gmail.com",
    password: "********",
    twoFactor: "Disabled",
    associatedAccounts: ["Google"],
  });

  const [editMode, setEditMode] = useState({
    general: false,
    password: false,
  });

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <User className="text-blue-500 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">
                  General Information
                </h2>
              </div>
              <button
                onClick={() =>
                  setEditMode({ ...editMode, general: !editMode.general })
                }
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>{editMode.general ? "Save" : "Edit"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  readOnly={!editMode.general}
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    editMode.general
                      ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly={!editMode.general}
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    editMode.general
                      ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Password & Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Lock className="text-green-500 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Password & Security
                </h2>
              </div>
              <button
                onClick={() =>
                  setEditMode({ ...editMode, password: !editMode.password })
                }
                className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={user.password}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <LinkIcon className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-semibold text-gray-900">
                Connected Accounts
              </h2>
            </div>

            <div className="space-y-3">
              {user.associatedAccounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {account === "Google" && (
                      <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="w-6 h-6"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{account}</h3>
                      <p className="text-gray-600">Connected account</p>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* Open modal button */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Connect Another Account
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium text-gray-900">2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-[18px] font-black p-3 bg-red-600 flex items-center gap-2 text-white cursor-pointer rounded-lg transition-colors">
                <Trash2 className="w-6 h-6" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for connecting another account */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Connect a New Account
            </h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {integrations.map((app, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={app.icon} alt={app.name} className="w-6 h-6" />
                    <div>
                      <h3 className="font-medium text-gray-900">{app.name}</h3>
                      <p className="text-sm text-gray-600">{app.description}</p>
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1 text-sm rounded-lg ${
                      app.status === "connected"
                        ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {app.status === "connected" ? "Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
