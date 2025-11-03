import React from "react";
import { motion } from "framer-motion";

const Block = ({ x, y, width, height, type, isDestroyed }) => {
  const colors = {
    wood: "#8B4513",
    stone: "#A9A9A9",
    glass: "#ADD8E6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDestroyed ? 0 : 1, 
        scale: isDestroyed ? 0 : 1,
        rotate: isDestroyed ? [0, 45, -45, 90] : 0
      }}
      exit={{ 
        opacity: 0, 
        scale: 0,
        rotate: 360,
        y: -50
      }}
      transition={{ 
        duration: isDestroyed ? 0.5 : 0.3,
        ease: "easeOut"
      }}
      className="absolute rounded-md shadow-lg"
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundColor: colors[type] || "#8B4513",
        border: "2px solid rgba(0,0,0,0.3)",
      }}
    />
  );
};

export default Block;