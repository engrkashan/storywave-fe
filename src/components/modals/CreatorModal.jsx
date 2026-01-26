import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, User, Mail, Key, Eye, EyeOff, Save } from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

const CreatorModal = ({ isOpen, onClose, onSave, editingCreator }) => {
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

    if (!form.name.trim()) e.name = "Required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password || form.password.length < 4)
      e.password = "Min 6 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-xl shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-gray-200 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingCreator ? "Edit Creator" : "Add Creator"}
            </h3>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <Field
              icon={User}
              placeholder="Full name"
              value={form.name}
              error={errors.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            {/* Email */}
            <Field
              icon={Mail}
              type="email"
              placeholder="Email"
              value={form.email}
              error={errors.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            {/* Password */}
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

            {/* Actions */}
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
                className="flex justify-center gap-2 items-center bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
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

/* ----------------------  Input ---------------------- */
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
