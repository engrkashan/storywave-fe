import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prevState) => !prevState);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-secondary-dark">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile overlay  */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex-1 md:ml-72 p-3 sm:p-5 transition-all duration-300 bg-secondary-light mt-0 md:m-4 md:mr-0 rounded-none md:rounded-lg min-w-0">
        <div className="h-16 md:hidden bg-white z-50" />
        {/* Main Content */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
