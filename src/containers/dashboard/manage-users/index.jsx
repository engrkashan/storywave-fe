import { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import CreatorModal from "../../../components/modals/CreatorModal";
import DeleteModal from "../../../components/modals/DeleteModal";
import toast from "react-hot-toast";
import { Search, Plus, Edit2, Trash2, Users } from "lucide-react";
import {
  registerUser,
  getAllUsers,
  deleteUser,
  updateUser,
} from "../../../redux/slices/auth.slice";

const ManageCreators = () => {
  const dispatch = useDispatch();
  const reduxUsers = useSelector((state) => state.auth.users);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortBy] = useState("name");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    setUsers(reduxUsers);
  }, [reduxUsers]);

  const { filteredUsers } = useMemo(() => {
    const keyword = search.toLowerCase();
    const filtered = users
      .filter(
        (u) =>
          u.fullName?.toLowerCase().includes(keyword) ||
          u.username?.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword),
      )
      .sort((a, b) =>
        sortBy === "name"
          ? (a.fullName || "").localeCompare(b.fullName || "")
          : (a.email || "").localeCompare(b.email || ""),
      );
    return { filteredUsers: filtered };
  }, [users, search, sortBy]);

  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    setDeletingUserId(id);
    setDeleteModalOpen(true);
  }, []);

  // handle save
  const handleSave = useCallback(
    async (data) => {
      setIsSaving(true);
      try {
        if (editingUser && editingUser.id) {
          // Update existing user via thunk
          const updatedUser = await dispatch(
            updateUser({ id: editingUser.id, userData: data }),
          ).unwrap();

          // Update local state
          setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
          );

          toast.success("User updated successfully");
        } else {
          // Create new user
          const response = await dispatch(registerUser(data)).unwrap();
          const returnedUser = response.user;

          setUsers((prev) => [
            ...prev,
            {
              id: returnedUser.id,
              fullName: returnedUser.fullName,
              username: returnedUser.username,
              email: returnedUser.email,
              password: returnedUser.password,
              role: returnedUser.role,
              status: "active",
              lastActive: new Date().toISOString().split("T")[0],
            },
          ]);

          toast.success("User created successfully");
        }

        setIsModalOpen(false);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || "Failed to save user");
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch, editingUser],
  );

  // handle confirmDelete
  const confirmDelete = useCallback(async () => {
    if (!deletingUserId) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteUser(deletingUserId)).unwrap();
      setUsers((prev) => prev.filter((u) => u.id !== deletingUserId));
      toast.success("User deleted successfully");
      setDeleteModalOpen(false);
      setDeletingUserId(null);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, deletingUserId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-8">
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Manage Users
        </h2>
        <p className="mt-2 text-gray-600">
          Create, update and manage all users from one place
        </p>
      </header>

      {/* Search & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between mb-8">
        <div className="relative w-full bg-white rounded-xl lg:max-w-md shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username or email"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border focus:border-gray-700 focus:outline-none"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex justify-center gap-2 items-center bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-md px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
          {/* Mobile Card View */}
          <div className="block sm:hidden divide-y divide-gray-100">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 hover:bg-gray-50/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.username}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${user.role === "ADMIN" ? "bg-green-500" : ""} ${user.role === "CREATOR" ? "bg-blue-500" : ""}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1 truncate">{user.email}</div>
                  <div className="text-sm font-mono mb-3">
                    {user.password && user.password !== "******" ? (
                      <span className="text-red-600 font-medium">
                        {user.password}
                      </span>
                    ) : (
                      <span className="text-gray-400">•••••••</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                    <IconBtn
                      onClick={() => openEditModal(user)}
                      icon={Edit2}
                    />
                    <IconBtn
                      danger
                      onClick={() => handleDelete(user.id)}
                      icon={Trash2}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Username</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Password</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-5">{user.fullName}</td>
                      <td className="px-6 py-5">{user.username}</td>
                      <td className="px-6 py-5">{user.email}</td>
                      <td className="px-6 py-5 font-mono">
                        {user.password && user.password !== "******" ? (
                          <span className="text-red-600 font-medium">
                            {user.password}
                          </span>
                        ) : (
                          <span className="text-gray-400">•••••••</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`
      px-3 py-1 rounded-full text-white text-sm font-semibold
      ${user.role === "ADMIN" ? "bg-green-500" : ""}
      ${user.role === "CREATOR" ? "bg-blue-500" : ""}
    `}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <IconBtn
                            onClick={() => openEditModal(user)}
                            icon={Edit2}
                          />
                          <IconBtn
                            danger
                            onClick={() => handleDelete(user.id)}
                            icon={Trash2}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CreatorModal
        isOpen={isModalOpen}
        editingCreator={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <DeleteModal
        show={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setDeletingUserId(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Delete User?"
        description="This action cannot be undone."
        isLoading={isDeleting}
      />
    </main>
  );
};

const IconBtn = ({ icon: Icon, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition ${
      danger
        ? "text-gray-500 hover:text-red-600 hover:bg-red-50"
        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const EmptyState = () => (
  <div className="text-center py-20 h-[50vh] flex flex-col justify-center items-center">
    <Users className="w-12 h-12 text-gray-300 mb-4" />
    <p className="text-gray-500 text-lg">No users found</p>
  </div>
);

export default ManageCreators;
