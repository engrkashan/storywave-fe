import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../../redux/slices/auth.slice";

const Login = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState("admin");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const savedToken = Cookies.get("token");
    const savedRole = Cookies.get("userRole");

    if (savedToken) {
      if (savedRole === "creator") {
        navigate("/creator-dashboard/overview");
      } else {
        navigate("/overview");
      }
    }
  }, [navigate]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   if (isForgotPassword) {
  //     toast.success(`Password reset link sent to ${email}`);
  //     setIsForgotPassword(false);
  //   } else {
  //     dispatch(loginAdmin({ email, password: newPassword }));
  //   }
  // };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isForgotPassword) {
      toast.success(`Password reset link sent to ${email}`);
      setIsForgotPassword(false);
      return;
    }

    if (role === "creator") {
      // Skip API call for creator
      Cookies.set("token", "creator-token", { expires: 7, sameSite: "Lax" });
      Cookies.set("userRole", "creator", { expires: 7, sameSite: "Lax" });
      Cookies.set("fullName", "Creator User", { expires: 7, sameSite: "Lax" });

      toast.success("Welcome Creator!");
      navigate("/creator-dashboard/overview");
    } else {
      // Admin login hits API
      dispatch(loginAdmin({ email, password: newPassword }));
    }
  };

  useEffect(() => {
    if (status === "succeeded" && user && token) {
      Cookies.set("token", token, { expires: 7, sameSite: "Lax" });
      Cookies.set("userId", user.id, { expires: 7, sameSite: "Lax" });
      Cookies.set("userRole", user.role || role, {
        expires: 7,
        sameSite: "Lax",
      });
      Cookies.set("fullName", user.fullName, { expires: 7, sameSite: "Lax" });

      toast.success("Welcome Onboard!");

      if ((user.role || role) === "creator") {
        navigate("/creator-dashboard/overview");
      } else {
        navigate("/overview");
      }
    }

    if (status === "failed" && error) {
      toast.error(error.message || "Oops! Login failed. Please try again.");
    }
  }, [status, error, user, token, navigate, role]);

  return (
    <div className="relative min-h-screen w-full p-4 md:px-20 grid grid-cols-1 md:grid-cols-5  items-center justify-center gap-6 md:gap-10 bg-gradient-to-b from-[#f8be4c]/60 to-[#f0498f]/60">
      <div className="w-full flex items-center justify-center md:justify-end h-full col-span-1 md:col-span-2">
        <div className="w-full max-w-lg p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
          <div className="flex items-center justify-center mb-5">
            <img src="/logo.png" alt="Story Wave" className="w-auto h-32 " />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block font-medium text-gray-900 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF007F] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label
                  htmlFor="password"
                  className="block font-medium text-gray-900 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF007F] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Select Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF007F] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <option value="" disabled>
                  Select User Role
                </option>
                <option value="admin">Admin</option>
                <option value="creator">Creator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-4 btn-gradient text-white font-semibold rounded-xl hover:from-[#FF3385] hover:to-[#FF007F] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Signing In..."
                : isForgotPassword
                  ? "Send Reset Link"
                  : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      <div className="w-full h-full rounded-2xl max-h-[85vh] overflow-hidden col-span-1 md:col-span-3 shadow-2xl">
        <video
          src="/videos/hero.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover "
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-2xl"></div>
      </div>
    </div>
  );
};

export default Login;
