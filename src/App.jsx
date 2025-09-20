import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loader from "./components/loader";

// Common (Authentication)
const Login = lazy(() => import("./containers/common/login"));

// User Dashboard
const Overview = lazy(() => import("./containers/dashboard/overview"));
const Integrations = lazy(() => import("./containers/dashboard/integrations"));
const GenerateStory = lazy(() =>
  import("./containers/dashboard/generate-story")
);
const Profile = lazy(() => import("./containers/dashboard/profile"));
const MyCreations = lazy(() => import("./containers/dashboard/my-creations"));
const NarrationStudio = lazy(() => import("./containers/dashboard/voiceover"));

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import { Toaster } from "react-hot-toast";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const websiteRoutes = [{ path: "/", element: <Login /> }];

const authRoutes = [{ path: "/auth/login", element: <Login /> }];

const dashboardRoutes = [
  { path: "/overview", element: <Overview /> },
  { path: "/dashboard/integrations", element: <Integrations /> },
  { path: "/dashboard/generate-story", element: <GenerateStory /> },
  { path: "/dashboard/profile", element: <Profile /> },
  { path: "/dashboard/my-creations", element: <MyCreations /> },
  { path: "/dashboard/voiceover", element: <NarrationStudio /> },
];

const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
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

          {/* Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            {dashboardRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* Not Found Route */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-100 to-amber-200">
                <div className="p-10 custom-border rounded-[24px] shadow-2xl w-[420px] text-center bg-white/80 backdrop-blur-md">
                  <h1 className="text-5xl font-extrabold custom-text-gradient">
                    404
                  </h1>
                  <h2 className="text-2xl font-semibold mt-2 text-gray-800">
                    Page Not Found
                  </h2>
                  <p className="mt-4 text-gray-600">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                  </p>

                  {/* Button */}
                  <div className="mt-6">
                    <a
                      href="/overview"
                      className="inline-block px-6 py-3 rounded-xl text-lg font-semibold 
          bg-gradient-to-r from-[#f8be4c] to-[#f0498f] text-white 
          shadow-md hover:shadow-lg hover:scale-[1.05] transition-all"
                    >
                      Go Back Home
                    </a>
                  </div>
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
