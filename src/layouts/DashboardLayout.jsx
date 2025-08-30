import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prevState) => !prevState);

  return (
    <div className="flex min-h-screen bg-secondary-dark">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex-1 md:ml-72 p-5 transition-all duration-300 bg-secondary-light m-4 mr-0 rounded-lg">
        {/* Main Content */}
        <div className="mt-5 md:mt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
