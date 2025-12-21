// src/components/Block.jsx
import React from "react";
import { motion } from "framer-motion";

const Block = ({ x, y, width, height, type, health = 100, damage = 0 }) => {
  const colors = {
    wood: "#8B4513",
    stone: "#A9A9A9",
    glass: "#ADD8E6",
    ice: "#B0E0E6",
    metal: "#708090"
  };

  const damageRatio = damage / health;
  const isDamaged = damageRatio > 0;
  const isDestroyed = damageRatio >= 1;

  const cracksOpacity = Math.min(damageRatio * 1.5, 0.9);
  const tiltAngle = isDamaged ? damageRatio * 15 : 0;
  const shakeIntensity = isDamaged ? damageRatio * 3 : 0;

  return (
    <motion.div
      layout // This enables smooth sliding transitions for x and y
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDestroyed ? 0 : 1, 
        scale: isDestroyed ? 0 : (1 - damageRatio * 0.2),
        rotate: isDestroyed ? [0, 45, -45, 90] : tiltAngle,
        // Manual shake effect only if damaged and not falling
        x: isDamaged && !isDestroyed ? [0, shakeIntensity, -shakeIntensity, 0] : 0,
      }}
      transition={{ 
        layout: { type: "spring", stiffness: 200, damping: 25 }, // "Heavy" falling feel
        opacity: { duration: 0.2 },
        rotate: { duration: 0.3 }
      }}
      className="absolute rounded-md shadow-lg"
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundColor: colors[type] || "#8B4513",
        border: `2px solid rgba(0,0,0,${0.3 + damageRatio * 0.3})`,
        filter: `brightness(${1 - damageRatio * 0.4}) contrast(${1 + damageRatio * 0.3})`,
        zIndex: 10
      }}
    >
      {isDamaged && !isDestroyed && (
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: cracksOpacity }}>
          <svg className="w-full h-full" viewBox="0 0 60 60">
            <path d="M 30 0 L 30 60" stroke="rgba(0,0,0,0.4)" strokeWidth={1 + damageRatio * 2} fill="none" />
            <path d="M 0 30 L 60 30" stroke="rgba(0,0,0,0.4)" strokeWidth={1 + damageRatio * 2} fill="none" />
            <path d="M 10 10 L 50 50" stroke="rgba(0,0,0,0.3)" strokeWidth={0.5 + damageRatio} fill="none" />
            <path d="M 50 10 L 10 50" stroke="rgba(0,0,0,0.3)" strokeWidth={0.5 + damageRatio} fill="none" />
          </svg>
        </div>
      )}

      {isDamaged && !isDestroyed && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.max(0, 100 - damageRatio * 100)}%`,
              background: damageRatio > 0.7 ? '#ef4444' : '#22c55e'
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Block;