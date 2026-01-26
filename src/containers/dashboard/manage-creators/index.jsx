import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreatorModal from "../../../components/modals/CreatorModal";
import { Search, Plus, Edit2, Trash2, Users } from "lucide-react";

const initialCreators = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "******",
    status: "active",
    lastActive: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "******",
    status: "active",
    lastActive: "2024-01-14",
  },
];

const ManageCreators = () => {
  const [creators, setCreators] = useState(initialCreators);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);
  const [sortBy] = useState("name");

  /* ----------------------------- Derived State ----------------------------- */
  const { filteredCreators, activeCount } = useMemo(() => {
    const keyword = search.toLowerCase();

    const filtered = creators
      .filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.email.toLowerCase().includes(keyword),
      )
      .sort((a, b) =>
        sortBy === "name"
          ? a.name.localeCompare(b.name)
          : a.email.localeCompare(b.email),
      );

    return {
      filteredCreators: filtered,
      activeCount: creators.filter((c) => c.status === "active").length,
    };
  }, [creators, search, sortBy]);

  /* ------------------------------ Handlers ------------------------------ */
  const openCreateModal = useCallback(() => {
    setEditingCreator(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((creator) => {
    setEditingCreator(creator);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    setCreators((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleSave = useCallback(
    (data) => {
      setCreators((prev) => {
        if (editingCreator) {
          return prev.map((c) =>
            c.id === editingCreator.id ? { ...data, id: c.id } : c,
          );
        }

        return [
          ...prev,
          {
            ...data,
            id: Date.now(),
            status: "active",
            lastActive: new Date().toISOString().split("T")[0],
          },
        ];
      });
    },
    [editingCreator],
  );

  /* -------------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-8">
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Manage Creators
        </h2>
        <p className="mt-2 text-gray-600">
          Create, update and manage all creators from one place
        </p>
      </header>

      {/* Search & Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between mb-8">
        <div className="relative w-full bg-white rounded-xl lg:max-w-md shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border focus:border-gray-700 focus:outline-none"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex justify-center gap-2 items-center bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-md px-6 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Creator
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredCreators.length === 0 ? (
          <EmptyState onAdd={openCreateModal} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Creator</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Password</th>

                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {filteredCreators.map((creator) => (
                    <motion.tr
                      key={creator.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900">
                          {creator.name}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-gray-700">
                        {creator.email}
                      </td>
                      <td className="px-6 py-5 font-mono text-gray-600">
                        {creator.password}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <IconBtn
                            onClick={() => openEditModal(creator)}
                            icon={Edit2}
                          />
                          <IconBtn
                            danger
                            onClick={() => handleDelete(creator.id)}
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
        )}
      </div>

      {/* Modal */}
      <CreatorModal
        isOpen={isModalOpen}
        editingCreator={editingCreator}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </main>
  );
};

/* ----------------------------- UI Blocks ----------------------------- */

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

const EmptyState = ({ onAdd }) => (
  <div className="text-center py-20 ">
    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500 text-lg">No creators found</p>
    <div className="w-full mx-auto flex justify-center items-center mt-6">
      <button
        onClick={onAdd}
        className="flex justify-center gap-2 items-center bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg px-6 py-2 rounded hover:bg-indigo-700 transition"
      >
        <Plus className="w-4 h-4" />
        Add Creator
      </button>
    </div>
  </div>
);

export default ManageCreators;
