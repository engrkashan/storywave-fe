import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { Headphones, MessageSquare, ArrowLeft } from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((prevState) => !prevState);

  const fullName = Cookies.get("fullName") || "Creator";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showBackButton = location.pathname !== "/overview";

  return (
    <div className="flex min-h-screen bg-secondary-dark overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 md:ml-20 p-5 transition-all duration-300 bg-secondary-light m-4 rounded-3xl flex flex-col min-h-[calc(100vh-2rem)] overflow-x-hidden">
    
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50">
       
          <div className="min-h-10 flex items-center">
            {showBackButton ? (
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#f0498f] hover:text-[#f5876c] font-bold text-base transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </motion.button>
            ) : (
              <div className="text-gray-400 font-semibold text-sm">Dashboard Home</div>
            )}
          </div>

          {/* Right: Techsupport & User Avatar */}
          <div className="flex items-center gap-6">
        
            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/dashboard/profile")}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f8be4c] to-[#f0498f] flex items-center justify-center text-white font-extrabold text-xs shadow-md border-2 border-white">
                {initials}
              </div>
              <span className="hidden md:inline font-bold text-sm text-gray-800 truncate max-w-28">
                {fullName}
              </span>
            </motion.div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
