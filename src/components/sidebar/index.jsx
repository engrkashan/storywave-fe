import Cookies from "js-cookie";
import {
  Home,
  FileText,
  LayoutGrid,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const sidebarLinks = [
  { to: "/overview", label: "Overview", icon: <Home className="w-5 h-5" /> },
  {
    to: "/dashboard/generate-story",
    label: "Story Builder",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    to: "/dashboard/my-creations",
    label: "My Creations",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    to: "/dashboard/integrations",
    label: "Publish & Share",
    icon: <Share2 className="w-5 h-5" />,
  },
  {
    to: "/dashboard/profile",
    label: "My Account",
    icon: <Settings className="w-5 h-5" />,
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    Cookies.remove("userRole");
    Cookies.remove("fullName");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-[#f8be4c] to-[#f0498f] text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Thin Sidebar */}
      <div
        className={`${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } transform transition-transform duration-300 ease-in-out 
        w-20 h-full fixed left-0 top-0 z-40
        bg-white border-r border-gray-200
        shadow-xl flex flex-col justify-between items-center py-8`}
      >
        {/* Close button on mobile */}
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-800 absolute top-4 right-4 md:hidden cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Navigation */}
        <div className="flex flex-col items-center w-full gap-10">
          {/* Storywave Official Logo */}
          <Link to="/overview" className="relative group">
            <img
              src="/logo.png"
              alt="Storywave Logo"
              className="w-24 h-auto drop-shadow-md hover:scale-105 transition-all duration-300"
            />
            <span className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md z-50 pointer-events-none origin-left">
              Storywave Home
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="w-full">
            <ul className="flex flex-col items-center gap-6 w-full">
              {sidebarLinks.map((link, index) => {
                const isActive = location.pathname === link.to;
                return (
                  <li key={index}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={link.to}
                        onClick={toggleSidebar}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all relative group
                          ${isActive
                            ? "bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg shadow-[#f0498f]/20"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          }`}
                      >
                        {link.icon}
                        {/* Tooltip */}
                        <span className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md z-50 pointer-events-none origin-left">
                          {link.label}
                        </span>
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Logout at the bottom */}
        <div className="flex flex-col items-center w-full">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all cursor-pointer shadow-sm relative group"
            >
              <LogOut className="w-5 h-5" />
              <span className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md z-50 pointer-events-none origin-left">
                Logout
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
