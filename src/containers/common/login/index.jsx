import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../redux/slices/auth.slice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error, user, token } = useSelector((state) => state.auth);

  // Auto redirect if already logged in
  useEffect(() => {
    const savedToken = Cookies.get("token");
    const savedRole = Cookies.get("role");

    if (savedToken && savedRole) {
      if (savedRole === "CREATOR") {
        navigate("/creator-dashboard/overview");
      } else {
        navigate("/overview");
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isForgotPassword) {
      toast.success(`Password reset link sent to ${email}`);
      setIsForgotPassword(false);
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (status === "succeeded" && user && token) {
      Cookies.set("token", token, { expires: 7, sameSite: "Lax" });
      Cookies.set("role", user.role, { expires: 7, sameSite: "Lax" });
      Cookies.set("userId", user.id, { expires: 7, sameSite: "Lax" });
      Cookies.set("fullName", user.fullName || "", {
        expires: 7,
        sameSite: "Lax",
      });

      toast.success(
        `Welcome ${user.role === "CREATOR" ? "Creator" : "Admin"}!`,
      );

      if (user.role === "CREATOR") {
        navigate("/creator-dashboard/overview");
      } else {
        navigate("/overview");
      }
    }

    if (status === "failed" && error) {
      toast.error(error.error || "Login failed");
    }
  }, [status, error, user, token, navigate]);

  return (
    <div className="relative h-screen w-full p-4 md:px-20 grid grid-cols-1 md:grid-cols-5 items-center justify-center gap-6 md:gap-10 bg-gradient-to-b from-[#f8be4c]/60 to-[#f0498f]/60">
      {/* LEFT */}
      <div className="w-full z-50 flex items-center justify-center md:justify-end h-full col-span-1 md:col-span-2">
        <div className="w-full max-w-lg p-5 sm:p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
          <div className="flex items-center justify-center mb-5">
            <img src="/logo.png" alt="Story Wave" className="h-20 sm:h-32" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div>
              <label className="block font-medium text-white md:text-gray-900 mb-2">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF007F]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            {!isForgotPassword && (
              <div>
                <label className="block font-medium text-white md:text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF007F]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-4 btn-gradient text-white font-semibold rounded-xl transition-all duration-300 shadow-lg disabled:opacity-60"
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

      {/* RIGHT VIDEO */}
      <div className="absolute md:relative bottom-0 md:block w-screen md:w-auto h-full md:rounded-2xl overflow-hidden col-span-1 md:col-span-3 md:shadow-2xl">
        <video
          src="/videos/hero.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-t md:from-black/20 md:to-transparent md:rounded-2xl" />
      </div>
    </div>
  );
};

export default Login;
