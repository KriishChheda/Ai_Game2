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

  // Check if this is a bottom block (near ground at y ~= 455 for 600px canvas height)
  const GROUND_Y = 580; // 600 - 20 (ground height)
  const blockBottom = y + height;
  const isBottomBlock = Math.abs(blockBottom - GROUND_Y) <= 10;

  // Calculate damage effects
  const damageRatio = damage / health;
  const isDamaged = damageRatio > 0;
  const isDestroyed = damageRatio >= 1;

  // Visual distortion based on damage
  const cracksOpacity = Math.min(damageRatio * 1.5, 0.9);
  const tiltAngle = isDamaged ? damageRatio * 15 : 0;
  const shakeIntensity = isDamaged ? damageRatio * 3 : 0;

  return (
    <motion.div
      initial={false} // Disable initial animation for existing blocks
      animate={{ 
        opacity: isDestroyed ? 0 : 1, 
        scale: isDestroyed ? 0 : (1 - damageRatio * 0.1),
        // Use layout transition for smooth y-coordinate changes (falling)
        x: x, 
        y: y,
        rotate: isDestroyed ? [0, 45, -45, 90] : tiltAngle,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 100, // Makes it feel heavy like a block
        damping: 15,
        mass: 1,
        opacity: { duration: 0.2 }
      }}
      className="absolute rounded-md shadow-lg"
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundColor: colors[type] || "#8B4513",
        border: `2px solid rgba(0,0,0,${0.3 + damageRatio * 0.3})`,
        filter: `brightness(${1 - damageRatio * 0.4}) contrast(${1 + damageRatio * 0.3})`
      }}
    >
      {/* Damage cracks overlay */}
      {isDamaged && !isDestroyed && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: cracksOpacity }}
        >
          {/* Crack pattern */}
          <svg className="w-full h-full" viewBox="0 0 60 60">
            <path
              d="M 30 0 L 30 60"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={1 + damageRatio * 2}
              fill="none"
            />
            <path
              d="M 0 30 L 60 30"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={1 + damageRatio * 2}
              fill="none"
            />
            <path
              d="M 10 10 L 50 50"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={0.5 + damageRatio}
              fill="none"
            />
            <path
              d="M 50 10 L 10 50"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={0.5 + damageRatio}
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* Show health bar for any damaged block to help the player aim */}
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