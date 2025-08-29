import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX, FiMenu, FiHome, FiSettings, FiShare2, FiUser } from "react-icons/fi";
import { RiAiGenerate } from "react-icons/ri";

const sidebarLinks = [
  { to: "/dashboard", label: "Overview", icon: <FiHome className="text-xl" /> },
  { to: "/dashboard/generate-story", label: "Generate Story", icon: <RiAiGenerate className="text-xl" /> },

  { to: "/dashboard/integrations", label: "Integrations", icon: <FiShare2 className="text-xl" /> },
  { to: "/dashboard/settings", label: "Settings", icon: <FiSettings className="text-xl" /> },
  { to: "/dashboard/profile", label: "Profile", icon: <FiUser className="text-xl" /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();  // Get the current URL path

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-6 left-6 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-lg transition-all hover:bg-indigo-700"
      >
        <FiMenu className="text-2xl" />
      </button>

      {/* Sidebar */}
      <div
        className={`${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } transform transition-transform duration-300 ease-in-out w-72 h-full bg-secondary-dark text-white fixed left-0 top-0 p-6 pr-0 z-40`}
      >
        <button
          onClick={toggleSidebar}
          className="text-white text-3xl absolute top-6 right-6 md:hidden"
        >
          <FiX />
        </button>

        <div className="flex items-center justify-center space-x-2 mb-10">
          <img src="/logo.png" alt="logo" className="w-auto h-32" />
        </div>

        <nav>
          <ul className="space-y-6">
            {sidebarLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.to}
                  className={`${location.pathname === link.to
                    ? "bg-secondary-light text-secondary-dark rounded-l-full"
                    : "text-white hover:scale-105"
                    } flex items-center space-x-3 text-xl font-medium px-4 py-2 transition-colors`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
