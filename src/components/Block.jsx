// src/components/Block.jsx
import React from "react";
import { motion } from "framer-motion";

const Block = ({ x, y, width, height, type }) => {
  const colors = {
    wood: "#8B4513",
    stone: "#A9A9A9",
    glass: "#ADD8E6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute rounded-md shadow-lg"
      style={{
        left: x,
        top: y, // use bottom so stacking feels natural
        width,
        height,
        backgroundColor: colors[type] || "#8B4513",
        border: "2px solid rgba(0,0,0,0.3)",
      }}
    />
  );
};

export default Block;
