import React, { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loader from "./components/loader";

// Common (Authentication)
const Login = lazy(() => import("./containers/common/login"));

// User Dashboard
const Overview = lazy(() => import("./containers/dashboard/overview"));
const Integrations = lazy(() => import("./containers/dashboard/integrations"));
const GenerateStory = lazy(() => import("./containers/dashboard/generate-story"));
const Profile = lazy(() => import("./containers/dashboard/profile"));

// Website
const Home = lazy(() => import("./containers/website/home"));

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const websiteRoutes = [
  // { path: "/", element: <Home /> },
  { path: "/", element: <Login /> },
];

const authRoutes = [
  { path: "/auth/login", element: <Login /> },
];

const dashboardRoutes = [
  { path: "/dashboard", element: <Overview /> },
  { path: "/dashboard/integrations", element: <Integrations /> },
  { path: "/dashboard/generate-story", element: <GenerateStory /> },
  { path: "/dashboard/profile", element: <Profile /> },
];

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="w-full h-[70vh] flex items-center justify-center">
            <Loader />
          </div>
        }
      >
        <Routes>
          {/* Website Routes */}
          {websiteRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Authentication Routes */}
          {authRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/*  Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            {dashboardRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* Not Found Route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen">
                <div className="p-8 custom-border rounded-[24px] shadow-lg w-96 text-center">
                  <h1 className="text-3xl font-bold custom-text-gradient">
                    404 - Page Not Found
                  </h1>
                  <p className="mt-4 text-white">
                    Oops! The page you&apos;re looking for doesn&apos;t exist.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
