import Cookies from "js-cookie";
import {
  FileText,
  Home,
  LogOut,
  Menu,
  Speech,
  User,
  X,
  Workflow,
  Share2,
  Users,
  Send,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const adminLinks = [
  { to: "/overview", label: "Overview", icon: <Home className="text-xl flex-shrink-0" /> },
  {
    to: "/dashboard/generate-story",
    label: "Story Builder",
    icon: <FileText className="text-xl flex-shrink-0" />,
  },
  {
    to: "/dashboard/manage-workflows",
    label: "Manage Workflows",
    icon: <Workflow className="text-xl rotate-12 flex-shrink-0" />,
  },
  {
    to: "/dashboard/manage-users",
    label: "Manage Users",
    icon: <Users className="text-xl flex-shrink-0" />,
  },
  {
    to: "/dashboard/my-creations",
    label: "Stories & Podcasts",
    icon: <Speech className="text-xl flex-shrink-0" />,
  },
  {
    to: "/dashboard/publish",
    label: "Publish to Social",
    icon: <Send className="text-xl flex-shrink-0" />,
  },
  {
    to: "/dashboard/integrations",
    label: "Integrations",
    icon: <Share2 className="text-xl flex-shrink-0" />,
  },
];

const creatorLinks = [
  {
    to: "/creator-dashboard/overview",
    label: "Overview",
    icon: <Home className="text-xl flex-shrink-0" />,
  },
  {
    to: "/creator-dashboard/generate-story",
    label: "Story Builder",
    icon: <FileText className="text-xl flex-shrink-0" />,
  },
  {
    to: "/creator-dashboard/manage-workflows",
    label: "Manage Workflows",
    icon: <Workflow className="text-xl rotate-12 flex-shrink-0" />,
  },
  {
    to: "/creator-dashboard/creations",
    label: "My Creations",
    icon: <Speech className="text-xl flex-shrink-0" />,
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const role = Cookies.get("userRole");

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    Cookies.remove("userRole");
    Cookies.remove("fullName");
    window.location.href = "/";
  };

  // Determine which links to show
  const linksToShow =
    location.pathname.startsWith("/creator-dashboard") || role === "creator"
      ? creatorLinks
      : adminLinks;

  return (
    <>
      {/* Mobile Top Navbar — always on top */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 z-20 flex items-center justify-between px-4 shadow-sm">
        <img src="/logo.png" alt="Story Wave" className="h-10 w-auto" />
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="bg-gradient-to-r from-[#f8be4c] to-[#f0498f] text-white p-2 rounded-xl shadow-md transition-all hover:scale-105 min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Sidebar panel */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transform transition-transform duration-300 ease-in-out
        w-64 sm:w-72 h-full fixed left-0 top-0 z-40
        bg-white/20 backdrop-blur-2xl border-r border-white/30
        shadow-2xl rounded-r-3xl flex flex-col justify-between`}
      >
        {/* Close button on mobile */}
        <button
          onClick={toggleSidebar}
          aria-label="Close sidebar"
          className="text-white text-3xl absolute top-4 right-4 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={22} />
        </button>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 mt-6 px-4">
            <img
              src="/logo.png"
              alt="logo"
              className="w-auto h-16 sm:h-24 drop-shadow-lg"
            />
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-2 sm:space-y-4 px-3 sm:px-4">
              {linksToShow.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    onClick={() => {
                      // Auto-close sidebar on mobile after navigation
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-xl text-base sm:text-lg font-medium transition-all min-h-[48px]
                      ${
                        location.pathname === link.to
                          ? "bg-gradient-to-r from-[#f8be4c]/90 to-[#f0498f]/90 text-white shadow-lg scale-[1.02]"
                          : "text-white/90 hover:bg-white/20 hover:text-white hover:scale-[1.02]"
                      }`}
                  >
                    {link.icon}
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Logout Button — always at bottom */}
        <div className="px-3 sm:px-4 pb-6 pt-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 w-full px-4 py-3 rounded-xl text-base sm:text-lg font-semibold
              bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:scale-[1.03] transition-all min-h-[48px]"
          >
            <LogOut className="text-xl flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
