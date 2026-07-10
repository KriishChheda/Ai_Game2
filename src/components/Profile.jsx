import React from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SoftAurora from "./SoftAurora";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center font-sans overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <SoftAurora speed={0.1} opacity={0.3} />
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md p-8 mx-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl text-center"
      >
        {/* Avatar / Icon */}
        <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-inner">
          👤
        </div>

        {/* User Info */}
        <h1 className="text-4xl font-black italic tracking-tighter mb-1 uppercase">
          {user?.displayName || "Pilot"}
        </h1>
        <p className="text-white/40 font-mono text-sm tracking-widest uppercase mb-10">
          {user?.email}
        </p>

        {/* Navigation Actions */}
        <div className="space-y-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-gray-200"
          >
            Back to Game
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full bg-red-500/10 text-red-400 py-4 rounded-2xl border border-red-500/20 font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-red-500/20"
          >
            Logout
          </motion.button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
            Angry Birds 2.0 • Session Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}