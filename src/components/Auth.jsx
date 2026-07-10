import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SoftAurora from "./SoftAurora.jsx"; // Assuming this is the filename

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // if isLogin is true, show login form, else show signup form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate("/"); 
    } catch (err) {
      setError("Failed to " + (isLogin ? "login" : "create account"));
    }
  } // if signup() or login() throws an error, we catch it and set a user-friendly error message to display on the form.

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      
      {/* Aurora Background Layer */}
      <div className="absolute inset-0 z-0">
        <SoftAurora 
          color1="#00e1ff" 
          color2="#e100ff"
          speed={0.3}
          brightness={1.2}
        />
      </div>

      {/* Auth Card Layer */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-1"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-black text-center mb-2 text-white tracking-tighter italic">
            ANGRY <span className="text-yellow-400">BIRDS</span>
          </h2>
          <p className="text-center text-white/60 mb-8 font-medium uppercase tracking-widest text-xs">
            {isLogin ? "Welcome Back, Pilot" : "Register for Flight"}
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-white/50 text-[10px] font-bold uppercase ml-2">Email</label>
              <input
                type="email"
                placeholder="email@domain.com"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-white/50 text-[10px] font-bold uppercase ml-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-purple-500/20 transition-all mt-4"
            >
              {isLogin ? "LOBBY LOGIN" : "RECRUIT PILOT"}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              {isLogin ? "New to the flock? " : "Already a pilot? "}
              <span className="text-blue-400 font-bold underline decoration-2 underline-offset-4">
                {isLogin ? "Sign Up" : "Login"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}