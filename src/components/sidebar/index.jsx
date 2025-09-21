import Cookies from "js-cookie";
import {
  FileText,
  FolderOpen,
  Home,
  LogOut,
  Menu,
  Mic,
  Share2,
  User,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarLinks = [
  { to: "/overview", label: "Overview", icon: <Home className="text-xl" /> },
  {
    to: "/dashboard/generate-story",
    label: "Story Builder",
    icon: <FileText className="text-xl" />,
  },
  {
    to: "/dashboard/voiceover",
    label: "Narration Studio",
    icon: <Mic className="text-xl" />,
  },
  {
    to: "/dashboard/my-creations",
    label: "My Creations",
    icon: <FolderOpen className="text-xl" />,
  },
  {
    to: "/dashboard/integrations",
    label: "Publish & Share",
    icon: <Share2 className="text-xl" />,
  },
  {
    to: "/dashboard/profile",
    label: "My Account",
    icon: <User className="text-xl" />,
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
        className="md:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-[#f8be4c] to-[#f0498f] text-white p-3 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <Menu className="text-2xl" />
      </button>

      {/* Sidebar */}
      <div
        className={`${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } transform transition-transform duration-300 ease-in-out 
        w-72 h-full fixed left-0 top-0 z-40
        bg-white/20 backdrop-blur-2xl border-r border-white/30
        shadow-2xl rounded-r-3xl flex flex-col justify-between`}
      >
        {/* Close button on mobile */}
        <button
          onClick={toggleSidebar}
          className="text-white text-3xl absolute top-6 right-6 md:hidden"
        >
          <X />
        </button>

        <div>
          {/* Logo */}
          <div className="flex items-center justify-center mb-10 mt-8">
            <img
              src="/logo.png"
              alt="logo"
              className="w-auto h-24 drop-shadow-lg"
            />
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-4 px-4">
              {sidebarLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-lg font-medium transition-all
                      ${location.pathname === link.to
                        ? "bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg scale-[1.02]"
                        : "text-white/90 hover:bg-white/20 hover:text-white hover:scale-[1.02]"
                      }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 w-full px-4 py-3 rounded-xl text-lg font-semibold
              bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:scale-[1.03] transition-all"
          >
            <LogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
