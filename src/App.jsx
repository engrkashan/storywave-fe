import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Loader from "./components/loader";

// Common (Authentication)
const Login = lazy(() => import("./containers/common/login"));

// User Dashboard
const Overview = lazy(() => import("./containers/dashboard/overview"));
const Integrations = lazy(() => import("./containers/dashboard/integrations"));
const GenerateStory = lazy(
  () => import("./containers/dashboard/generate-story"),
);
const Profile = lazy(() => import("./containers/dashboard/profile"));

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import { Toaster } from "react-hot-toast";
import ManageWorkflows from "./containers/dashboard/manage-workflows";
import WorkflowDetailPage from "./containers/dashboard/manage-workflows/detail";
import ManageCreators from "./containers/dashboard/manage-users";
import MyCreations from "./containers/dashboard/my-creations";
import Publish from "./containers/dashboard/publish";

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
  { path: "/dashboard/manage-workflows", element: <ManageWorkflows /> },
  { path: "/dashboard/manage-users", element: <ManageCreators /> },
  { path: "/dashboard/workflows/:id", element: <WorkflowDetailPage /> },
  { path: "/dashboard/generate-story", element: <GenerateStory /> },
  { path: "/dashboard/profile", element: <Profile /> },
  { path: "/dashboard/my-creations", element: <MyCreations /> },
  { path: "/dashboard/publish", element: <Publish /> },
];

const creatorDashboardRoutes = [
  {
    path: "/creator-dashboard/creations",
    element: <MyCreations />,
  },
  {
    path: "/creator-dashboard/overview",
    element: <Overview />,
  },
  { path: "/creator-dashboard/manage-workflows", element: <ManageWorkflows /> },
  {
    path: "/creator-dashboard/generate-story",
    element: <GenerateStory />,
  },
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
          {/* Creator Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            {creatorDashboardRoutes.map(({ path, element }) => (
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
                    Oops! The page you&apos;re looking for doesn&apos;t exist or
                    has been moved.
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
