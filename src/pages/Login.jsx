import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSuccess } from "../redux/features/auth/authSlice";
import { apiPost } from "../api/apiFetch";
import apiPath from "../api/apipath";
import Ballpit from "./Ballpit";

const LoginForm = ({ switchToRegister }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const e = {};
    if (!formData.username.trim()) e.username = "Username is required";
    if (!formData.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiPost(apiPath.loginUser, formData);

      if (res?.token) {
        dispatch(loginSuccess({ user: res, token: res.token }));
        toast.success("Welcome back ✨");
        navigate("/chat");
      } else {
        toast.error(res?.message || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🔴 CRITICAL: DISABLE CANVAS CLICK BLOCKING */}
      <style>{`
        canvas {
          pointer-events: none !important;
        }
      `}</style>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-[#3B006E] px-4">

        {/* 🔮 BALLPIT BACKGROUND (VISIBLE & SAFE) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
         <Ballpit
              count={100}
              gravity={0.01}
              friction={0.9975}
              wallBounce={0.95}
              followCursor={true}
              colors={["#5D009F", "#8B5CF6", "#A855F7", "#C084FC"]}
            />
        </div>

        {/* 🪟 GLASS LOGIN CARD */}
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-[#C084FC] text-transparent bg-clip-text">
              Welcome Back
            </h2>
            <p className="text-gray-300 mt-2 text-sm">
              Sign in to continue
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* USERNAME */}
            <div>
              <label className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                <FaUser /> Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                <FaLock /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            {/* SWITCH */}
            <p className="text-center text-sm text-gray-300">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={switchToRegister}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Create one
              </button>
            </p>

          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;



//fdshjfhjdshfkhdskfhds