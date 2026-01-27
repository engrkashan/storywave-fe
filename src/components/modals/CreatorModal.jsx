import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  Save,
  UserCircle,
} from "lucide-react";

const emptyForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  role: "ADMIN",
};

const roles = ["ADMIN", "CREATOR"];

const CreatorModal = ({
  isOpen,
  onClose,
  onSave,
  editingCreator,
  isSaving,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setForm(editingCreator || emptyForm);
    setErrors({});
    setShowPassword(false);
  }, [editingCreator, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.username.trim()) e.username = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password || form.password.length < 4)
      e.password = "Min 4 characters";
    if (!form.role) e.role = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-xl shadow-xl"
        >
          <div className="flex items-center justify-between px-6 py-4 border-gray-200 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingCreator ? "Edit User" : "Add User"}
            </h3>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Field
              icon={User}
              placeholder="Full name"
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
            />
            <Field
              icon={UserCircle}
              placeholder="Username"
              value={form.username}
              error={errors.username}
              onChange={(v) => setForm({ ...form, username: v })}
            />
            <Field
              icon={Mail}
              type="email"
              placeholder="Email"
              value={form.email}
              error={errors.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <div className="relative">
              <Field
                icon={Key}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                error={errors.password}
                onChange={(v) => setForm({ ...form, password: v })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Role */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={`w-full pl-3 pr-4 py-2.5 rounded-lg border ${
                  errors.role ? "border-red-400" : "border-gray-200"
                } focus:border focus:border-gray-800 focus:outline-none`}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex justify-center gap-2 items-center bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {editingCreator ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatorModal;

const Field = ({ icon: Icon, error, onChange, ...props }) => (
  <div>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
          error ? "border-red-400" : "border-gray-200"
        } focus:border focus:border-gray-800 focus:outline-none`}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
