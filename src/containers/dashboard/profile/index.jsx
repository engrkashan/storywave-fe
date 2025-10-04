import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  deleteAdminUser,
} from "../../../redux/slices/admin.slice";
import {
  User,
  Lock,
  Link as LinkIcon,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { timeAgo } from "../../../utils/timeAgo";
import DeleteModal from "../../../components/modals/DeleteModal";

const integrations = [
  {
    name: "YouTube",
    description: "Upload and manage videos",
    icon: "/apps/youtube.svg",
    status: "connected",
  },
  {
    name: "Spotify",
    description: "Share music and podcasts",
    icon: "/apps/spotify.svg",
    status: "disconnected",
  },
  {
    name: "Instagram",
    description: "Post stories",
    icon: "/apps/instagram.svg",
    status: "connected",
  },
  {
    name: "TikTok",
    description: "Share short-form videos",
    icon: "/apps/tiktok.svg",
    status: "disconnected",
  },
  {
    name: "Twitter",
    description: "Post updates",
    icon: "/apps/x.svg",
    status: "connected",
  },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, status } = useSelector((state) => state.admin);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState({ general: false, password: false });
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getAdminProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile)
      setFormData({ fullName: profile.fullName, email: profile.email });
  }, [profile]);

  const handleGeneralSave = () => {
    dispatch(updateAdminProfile(formData)).then(() =>
      setEditMode({ ...editMode, general: false })
    );
  };

  const handlePasswordChange = () => {
    dispatch(changeAdminPassword(passwordData)).then(() =>
      setEditMode({ ...editMode, password: false })
    );
  };

  const handleConfirmDelete = () => {
    if (!profile?.id) return;
    dispatch(deleteAdminUser(profile.id));
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
      <p className="text-gray-600 mb-6">
        Manage your account settings and preferences
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User /> General Information
              </h2>
              <button
                onClick={() => {
                  if (editMode.general) handleGeneralSave();
                  setEditMode({ ...editMode, general: !editMode.general });
                }}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit /> {editMode.general ? "Save" : "Edit"}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  readOnly={!editMode.general}
                  className={`w-full p-3 border rounded-lg ${
                    editMode.general
                      ? "border-blue-300 focus:ring-blue-200"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  readOnly={!editMode.general}
                  className={`w-full p-3 border rounded-lg ${
                    editMode.general
                      ? "border-blue-300 focus:ring-blue-200"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lock /> Password & Security
              </h2>
              <button
                onClick={() =>
                  setEditMode({ ...editMode, password: !editMode.password })
                }
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Edit /> Change Password
              </button>
            </div>

            {editMode.password && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg border-gray-200"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Save Password
                </button>
              </div>
            )}
          </div>

          {/* Connected Accounts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <LinkIcon /> Connected Accounts
            </h2>
            {profile?.associatedAccounts?.map((acc) => (
              <div
                key={acc}
                className="flex justify-between p-3 border rounded-lg mb-2"
              >
                <span>{acc}</span>
                <button className="text-red-500">
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600"
            >
              <Plus /> Connect Account
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Login</span>
              <span className="font-medium text-gray-900">
                {profile?.lastLoginAt ? timeAgo(profile.lastLoginAt) : "Never"}
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-3 bg-red-600 text-white flex items-center gap-2 rounded-lg"
            >
              <Trash2 /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Modal for adding integration */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Connect a New Account
            </h2>
            {integrations.map((app) => (
              <div
                key={app.name}
                className="flex justify-between p-3 border rounded-lg mb-2"
              >
                <div className="flex items-center gap-3">
                  <img src={app.icon} alt={app.name} className="w-6 h-6" />
                  <span>{app.name}</span>
                </div>
                <button
                  className={`px-3 py-1 rounded-lg ${
                    app.status === "connected"
                      ? "bg-gray-200"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {app.status === "connected" ? "Connected" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account?"
        description="This action will permanently delete your account."
      />
    </div>
  );
};

export default Profile;
