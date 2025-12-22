import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMars,
  FaVenus,
} from "react-icons/fa";
import Ballpit from "./Ballpit";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import apiPath from "../api/apipath";
import { apiPost } from "../api/apiFetch";
const GENDER_OPTIONS = [
  {
    value: "male",
    label: "Male",
    icon: <FaMars />,
  },
  {
    value: "female",
    label: "Female",
    icon: <FaVenus />,
  },
];


const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmpassword: "",
    gender: "male",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmpassword, setShowconfirmpassword] = useState(false);

  /* ===========================
     🔮 React Query Mutation
     =========================== */
  const registerMutation = useMutation({
    mutationFn: (payload) =>
      apiPost(apiPath.registerUser, payload),

    onSuccess: (res) => {
      toast.success("Account created successfully 🎉");
      navigate("/login");
    },

    onError: (err) => {
      toast.error(
        err?.message || "Registration failed"
      );
    },
  });

  /* ===========================
     ✅ Validation
     =========================== */
  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.username.trim()) e.username = "Username is required";
    if (!formData.password) e.password = "Password is required";
    if (formData.password !== formData.confirmpassword)
      e.confirmpassword = "Passwords do not match";
    return e;
  };

  /* ===========================
     🚀 Submit
     =========================== */
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const {  ...payload } = formData;

    registerMutation.mutate(payload);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-[#3B006E] px-4 overflow-hidden">

      {/* 🔮 Bubble Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Ballpit
          count={80}
          gravity={0.05}
          friction={0.995}
          wallBounce={0.95}
          followCursor={false}
          colors={["#5D009F", "#8B5CF6", "#A855F7", "#C084FC"]}
        />
      </div>

      {/* 🪟 Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-[#C084FC] text-transparent bg-clip-text">
            Create Account
          </h2>
          <p className="text-gray-300 mt-2 text-sm">
            Join the community ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <input
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />

          {/* Username */}
          <input
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showconfirmpassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmpassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmpassword: e.target.value,
                })
              }
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button
              type="button"
              onClick={() =>
                setShowconfirmpassword(!showconfirmpassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showconfirmpassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Gender */}
    <div className="space-y-2">
  <p className="text-sm text-gray-300">Gender</p>

  <div className="flex gap-3">
    {GENDER_OPTIONS.map(({ value, label, icon }) => {
      const isActive = formData.gender === value;

      return (
        <button
          key={value}
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, gender: value }))
          }
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition
            ${
              isActive
                ? "border-purple-500 bg-purple-500/20 text-white"
                : "border-white/10 text-gray-300 hover:border-white/20"
            }`}
        >
          {icon}
          <span className="capitalize">{label}</span>
        </button>
      );
    })}
  </div>
</div>


          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 disabled:opacity-50"
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-300">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-400 font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
