
import { useState } from "react"
import { BiTrash, BiEdit, BiUser, BiLock, BiShield, BiLink } from "react-icons/bi"

const Profile = () => {
  const [user, setUser] = useState({
    name: "Muhammad Qasim",
    email: "muhammadqasimbhatti4@gmail.com",
    password: "********",
    twoFactor: "Disabled",
    associatedAccounts: ["Google"],
  })

  const [editMode, setEditMode] = useState({
    general: false,
    password: false,
  })

  return (
    <div className="min-h-screen p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BiUser className="text-blue-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">General Information</h2>
              </div>
              <button
                onClick={() => setEditMode({ ...editMode, general: !editMode.general })}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <BiEdit className="text-xl" />
                <span className=" font-medium">{editMode.general ? "Save" : "Edit"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block  font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  readOnly={!editMode.general}
                  className={`w-full p-3 border rounded-lg transition-colors ${editMode.general
                    ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                    }`}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly={!editMode.general}
                  className={`w-full p-3 border rounded-lg transition-colors ${editMode.general
                    ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Password & Security Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BiLock className="text-green-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
              </div>
              <button
                onClick={() => setEditMode({ ...editMode, password: !editMode.password })}
                className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <BiEdit className="text-xl"/>
                <span className=" font-medium">Change Password</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block  font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={user.password}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>

              {/* Two-Factor Authentication */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BiShield className="text-orange-500 text-lg" />
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className=" text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.twoFactor === "Enabled" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.twoFactor}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BiLink className="text-purple-500 text-xl" />
              <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
            </div>

            <div className="space-y-3">
              {user.associatedAccounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {account === "Google" && (
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{account}</h3>
                      <p className=" text-gray-600">Connected account</p>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <BiTrash className="text-lg" />
                  </button>
                </div>
              ))}

              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                + Connect Another Account
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className=" text-gray-600">Account Type</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Premium</span>
              </div>
              <div className="flex items-center justify-between">
                <span className=" text-gray-600">Member Since</span>
                <span className=" font-medium text-gray-900">Jan 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className=" text-gray-600">Last Login</span>
                <span className=" font-medium text-gray-900">2 hours ago</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-3  text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Download Account Data
              </button>
              <button className="w-full text-left p-3  text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Privacy Settings
              </button>
              <button className="w-full text-left p-3  text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Notification Preferences
              </button>
              <button className="w-full text-left p-3  text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
