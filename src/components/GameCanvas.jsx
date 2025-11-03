import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Block from "./Block";
import red from "../assets/red.png";
import blue from "../assets/blue.png";
import yellow from "../assets/yellow.png";

function GameCanvas({ birdsLeft, blocks, onShoot }) {
  const slingRef = useRef(null);
  const [dragPos, setDragPos] = useState(null);
  // dragPos is an object which has the x and y coordinates of the mouse when the user is dragging the bird to aim.
  const [isAiming, setIsAiming] = useState(false);
  // isAiming is a boolean state which is true when the user is dragging the bird to aim and false when the user is not dragging the bird.
  
  const slingX = 150;
  const slingY = 360;
  // slingX and slingY are the coordinates of the base of the slingshot.

  const handleMouseDown = (e) => {
    if (birdsLeft <= 0) return;
    const rect = slingRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsAiming(true);
  };

  const handleMouseMove = (e) => {
    if (!dragPos) return;
    const rect = slingRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseUp = () => {
    if (!dragPos) return;
    const dx = slingX - dragPos.x;
    const dy = slingY - dragPos.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const velocity = Math.sqrt(dx * dx + dy * dy) / 5;
    
    onShoot(angle, velocity);
    setDragPos(null);
    setIsAiming(false);
  };

  const stretchDistance = dragPos ? Math.sqrt(Math.pow(slingX - dragPos.x, 2) + Math.pow(slingY - dragPos.y, 2)) : 0;

  return (
    // this div is the internal div which has all the angry birds and the blocks. It has a width of 800px and height of 500px. It has a background which is a gradient from sky blue to light green. The left side of the div is the slingshot area where the bird is placed and the right side of the div is the blocks area where the blocks are placed. The div has a border radius of 16px and a box shadow to give it a slight 3D effect. The div also has a cursor pointer when there are birds left to shoot and a not-allowed cursor when there are no birds left to shoot. The div also has mouse event handlers to handle the dragging and shooting of the bird.
    <div
      ref={slingRef}
      className="relative overflow-hidden rounded-2xl shadow-2xl shadow-yellow-100 border-4 border-green-800"
      style={{
        width: "800px",
        height: "500px",
        background: "linear-gradient(to bottom, #87CEEB 0%, #98FB98 60%, #90EE90 100%)",
        cursor: birdsLeft > 0 ? "crosshair" : "not-allowed"
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Sky with clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cloud 1 - Large fluffy cloud */}
        <div className="absolute top-4 left-0">
          <div 
            className="relative" 
            style={{
              animation: 'cloudFloat 25s ease-in-out infinite',
              animationDelay: '0s'
            }}  
          >
            <div className="absolute w-16 h-8 bg-white opacity-75 rounded-full"></div>
            <div className="absolute top-1 left-3 w-12 h-6 bg-white opacity-80 rounded-full"></div>
            <div className="absolute top-0 left-6 w-14 h-7 bg-white opacity-70 rounded-full"></div>
            <div className="absolute top-2 left-9 w-10 h-5 bg-white opacity-75 rounded-full"></div>
            <div className="absolute top-0 left-12 w-8 h-4 bg-white opacity-65 rounded-full"></div>
          </div>
        </div>

        {/* Cloud 2 - Medium cloud */}
        <div className="absolute top-12 right-0">
          <div 
            className="relative" 
            style={{
              animation: 'cloudDrift 30s linear infinite',
              transform: 'translateX(-120px)'
            }}
          >
            <div className="absolute w-20 h-10 bg-white opacity-65 rounded-full"></div>
            <div className="absolute top-1 left-4 w-16 h-8 bg-white opacity-70 rounded-full"></div>
            <div className="absolute top-2 left-8 w-12 h-6 bg-white opacity-60 rounded-full"></div>
            <div className="absolute top-0 left-12 w-10 h-5 bg-white opacity-65 rounded-full"></div>
          </div>
        </div>

        {/* Cloud 3 - Small wispy cloud */}
        <div className="absolute top-8 left-1/4">
          <div 
            className="relative" 
            style={{
              animation: 'cloudGentle 35s ease-in-out infinite reverse',
              animationDelay: '-10s'
            }}
          >
            <div className="absolute w-12 h-6 bg-white opacity-55 rounded-full"></div>
            <div className="absolute top-0 left-2 w-10 h-5 bg-white opacity-60 rounded-full"></div>
            <div className="absolute top-1 left-4 w-8 h-4 bg-white opacity-50 rounded-full"></div>
          </div>
        </div>

        {/* Cloud 4 - Large background cloud */}
        <div className="absolute top-20 left-2/5">
          <div 
            className="relative" 
            style={{
              animation: 'cloudSlow 40s ease-in-out infinite reverse',
              animationDelay: '-15s'
            }}
          >
            <div className="absolute w-18 h-9 bg-white opacity-45 rounded-full"></div>
            <div className="absolute top-1 left-4 w-16 h-8 bg-white opacity-50 rounded-full"></div>
            <div className="absolute top-0 left-8 w-14 h-7 bg-white opacity-40 rounded-full"></div>
            <div className="absolute top-2 left-12 w-12 h-6 bg-white opacity-45 rounded-full"></div>
          </div>
        </div>

        {/* Cloud 5 - High wispy cloud */}
        <div className="absolute top-2 right-1/4">
          <div 
            className="relative" 
            style={{
              animation: 'cloudFloat 28s ease-in-out infinite reverse',
              animationDelay: '-20s'
            }}
          >
            <div className="absolute w-14 h-7 bg-white opacity-40 rounded-full"></div>
            <div className="absolute top-0 left-3 w-12 h-6 bg-white opacity-45 rounded-full"></div>
            <div className="absolute top-1 left-6 w-10 h-5 bg-white opacity-35 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Ground with texture */}
      <div 
        className="absolute bottom-0 left-0 w-full h-20"
        style={{
          background: "linear-gradient(to bottom, #228B22 0%, #32CD32 30%, #228B22 100%)",
          borderTop: "3px solid #1a5f1a"
        }}
      >
        {/* Grass texture */}
        <div className="absolute inset-0 opacity-50">
          {Array.from({ length: 700 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-green-950"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: "0px",
                width: "0.5px",
                height: `${Math.random() * 30 + 5}px`,
                transform: `rotate(${Math.random() * 35 - 10}deg)`
              }}
            />
          ))}
        </div>
      </div>

  {/* Left side – Sling + Bird */}
  <div className="absolute left-0 top-0 w-1/2 h-full">
    {/* Y-shaped slingshot frame */}
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        {/* Wood texture gradient */}
        {/* Provided a linear gradient (x1,y1) is the starting point of the gradient which is the top left corner (x2,y2) is the ending point of the gradient which is the bottom right */}
        {/* Each stop defines a colour at a particular stop along the gradient. offset is the position along the gradient */}
        <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D2B48C" />
          <stop offset="25%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#A0522D" />
          <stop offset="75%" stopColor="#654321" />
          <stop offset="100%" stopColor="#5D4037" />
        </linearGradient>
        
        {/* Wood grain pattern */}
        <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="20" height="4">
          <rect width="20" height="4" fill="#8B4513"/>
          <rect x="0" y="1" width="20" height="1" fill="#654321" opacity="0.7"/>
          <rect x="0" y="3" width="20" height="1" fill="#A0522D" opacity="0.5"/>
        </pattern>
        
        {/* Elastic band gradient */}
        <linearGradient id="elasticGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2C1810" />
          <stop offset="30%" stopColor="#4A2C17" />
          <stop offset="50%" stopColor="#654321" />
          <stop offset="70%" stopColor="#4A2C17" />
          <stop offset="100%" stopColor="#2C1810" />
        </linearGradient>
        
        {/* Glow effect for tension */}
        <filter id="glowEffect">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Shadow filter */}
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      
      {/* Main trunk of Y-shape */}
      <path
        d={`M ${slingX - 8} ${slingY + 60} 
            L ${slingX + 8} ${slingY + 60} 
            L ${slingX + 6} ${slingY - 100} 
            L ${slingX - 6} ${slingY - 100} Z`}
        fill="url(#woodGradient)"
        stroke="#3E2723"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      
      {/* Left branch of Y-shape */}
      <path
        d={`M ${slingX - 6} ${slingY - 100} 
            L ${slingX - 4} ${slingY - 100} 
            L ${slingX - 35} ${slingY - 160} 
            L ${slingX - 42} ${slingY - 155} 
            L ${slingX - 38} ${slingY - 145} 
            L ${slingX - 8} ${slingY - 95} Z`}
        fill="url(#woodGradient)"
        stroke="#3E2723"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      
      {/* Right branch of Y-shape */}
      <path
        d={`M ${slingX + 6} ${slingY - 100} 
            L ${slingX + 4} ${slingY - 100} 
            L ${slingX + 35} ${slingY - 160} 
            L ${slingX + 42} ${slingY - 155} 
            L ${slingX + 38} ${slingY - 145} 
            L ${slingX + 8} ${slingY - 95} Z`}
        fill="url(#woodGradient)"
        stroke="#3E2723"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      
      {/* Metal reinforcements at connection points */}
      <circle
        cx={slingX - 38}
        cy={slingY - 150}
        r="4"
        fill="linear-gradient(45deg, #C0C0C0, #808080)"
        stroke="#606060"
        strokeWidth="1"
      />
      <circle
        cx={slingX + 38}
        cy={slingY - 150}
        r="4"
        fill="linear-gradient(45deg, #C0C0C0, #808080)"
        stroke="#606060"
        strokeWidth="1"
      />
      
      {/* Base reinforcement */}
      <ellipse
        cx={slingX}
        cy={slingY + 55}
        rx="11"
        ry="8"
        fill="linear-gradient(45deg, #8B4513, #654321)"
        stroke="#5D4037"
        strokeWidth="2"
      />
    </svg>

    {/* Enhanced elastic bands with physics-based curves */}
    {isAiming && dragPos && (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {(() => {
          // Calculate tension and curve for realistic elastic effect
          const leftAnchor = { x: slingX - 38, y: slingY - 150 };
          const rightAnchor = { x: slingX + 38, y: slingY - 150 };
          const pullPoint = { x: dragPos.x, y: dragPos.y };
          
          // Calculate distance for tension effect
          const leftDistance = Math.sqrt(
            Math.pow(pullPoint.x - leftAnchor.x, 2) + 
            Math.pow(pullPoint.y - leftAnchor.y, 2)
          );
          const rightDistance = Math.sqrt(
            Math.pow(pullPoint.x - rightAnchor.x, 2) + 
            Math.pow(pullPoint.y - rightAnchor.y, 2)
          );
          
          // Calculate tension factor (more stretch = more tension)
          const maxStretch = 150;
          const leftTension = Math.min(leftDistance / maxStretch, 1);
          const rightTension = Math.min(rightDistance / maxStretch, 1);
          
          // Calculate control points for curved elastic bands
          const leftMid = {
            x: (leftAnchor.x + pullPoint.x) / 2,
            y: (leftAnchor.y + pullPoint.y) / 2 + leftTension * 20
          };
          const rightMid = {
            x: (rightAnchor.x + pullPoint.x) / 2,
            y: (rightAnchor.y + pullPoint.y) / 2 + rightTension * 20
          };
          
          return (
            <g>
              {/* Left elastic band with curve */}
              <path
                d={`M ${leftAnchor.x} ${leftAnchor.y} 
                    Q ${leftMid.x} ${leftMid.y} ${pullPoint.x} ${pullPoint.y}`}
                stroke="url(#elasticGradient)"
                strokeWidth={4 + leftTension * 2}
                fill="none"
                // filter={leftTension > 0.7 ? "url(#glowEffect)" : "url(#dropShadow)"}
                opacity={0.9}
              />
              
              {/* Right elastic band with curve */}
              <path
                d={`M ${rightAnchor.x} ${rightAnchor.y} 
                    Q ${rightMid.x} ${rightMid.y} ${pullPoint.x} ${pullPoint.y}`}
                stroke="url(#elasticGradient)"
                strokeWidth={4 + rightTension * 2}
                fill="none"
                // filter={rightTension > 0.7 ? "url(#glowEffect)" : "url(#dropShadow)"}
                opacity={0.9}
              />
              
              {/* Elastic band highlights for 3D effect */}
              <path
                d={`M ${leftAnchor.x} ${leftAnchor.y} 
                    Q ${leftMid.x} ${leftMid.y} ${pullPoint.x} ${pullPoint.y}`}
                stroke="rgba(139, 69, 19, 0.6)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="0,2"
              />
              <path
                d={`M ${rightAnchor.x} ${rightAnchor.y} 
                    Q ${rightMid.x} ${rightMid.y} ${pullPoint.x} ${pullPoint.y}`}
                stroke="rgba(139, 69, 19, 0.6)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="0,2"
              />
              
              {/* Tension indicator particles */}
              {leftTension > 0.8 && (
                <g opacity={leftTension}>
                  <circle cx={leftMid.x - 5} cy={leftMid.y} r="1" fill="#FFD700" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={leftMid.x + 3} cy={leftMid.y - 3} r="0.8" fill="#FFA500" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.7s" repeatCount="indefinite"/>
                  </circle>
                </g>
              )}
              
              {rightTension > 0.8 && (
                <g opacity={rightTension}>
                  <circle cx={rightMid.x + 5} cy={rightMid.y} r="1" fill="#FFD700" opacity="0.8">
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx={rightMid.x - 3} cy={rightMid.y - 3} r="0.8" fill="#FFA500" opacity="0.6">
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.7s" repeatCount="indefinite"/>
                  </circle>
                </g>
              )}
              
              {/* Pouch/pocket for the projectile */}
              <ellipse
                cx={pullPoint.x}
                cy={pullPoint.y}
                rx="8"
                ry="6"
                fill="linear-gradient(45deg, #8B4513, #A0522D)"
                stroke="#654321"
                strokeWidth="2"
                opacity="0.8"
              />
              
              {/* Small grip texture on pouch */}
              <ellipse
                cx={pullPoint.x}
                cy={pullPoint.y}
                rx="6"
                ry="4"
                fill="none"
                stroke="#654321"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.5"
              />
            </g>
          );
        })()}
      </svg>
    )}

    {/* Power indicator */}
    {isAiming && stretchDistance > 0 && (
      <div className="absolute left-4 top-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
        <div className="text-xs font-bold">POWER</div>
        <div className="w-20 h-2 rounded mt-1">
          {/* This div here is the horizontal line that will dynamically grow or shrink */}
          <div 
            className="h-full rounded transition-all duration-75"
            style={{
              width: `${Math.min(stretchDistance / 2, 100)}%`,
              background: stretchDistance > 100 
                ? "linear-gradient(90deg, #ff4444, #ff0000)" 
                : "linear-gradient(90deg, #44ff44, #ffff44, #ff4444)"
            }}
          />
        </div>
      </div>
    )}

    {/* Bird on sling using image */}
        {birdsLeft > 0 && (
          <motion.div
            className="absolute cursor-grab select-none"
            style={{
              width: 44,
              height: 44,
              left: dragPos ? dragPos.x - 22 : slingX - 22,
              top: dragPos ? dragPos.y - 22 : slingY - 22,
              zIndex:50,
              transform: isAiming ? `scale(${1 + stretchDistance * 0.001})` : "scale(1)",
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"
            }}
            animate={{ y: dragPos ? 0 : [0, -3, 0] }}
            transition={{ repeat: dragPos ? 0 : Infinity, duration: 1.2 }}
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={red}
              alt="Angry Bird"
              className="w-full h-full object-contain rounded-full"
              style={{
                imageRendering: "crisp-edges",
                transform: dragPos ? `rotate(${Math.atan2(dragPos.y - slingY, dragPos.x - slingX) * 180 / Math.PI}deg)` : "rotate(0deg)"
              }}
              draggable={false}
            />
            {/* Optional: Add a subtle border/outline to make the bird stand out */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: "inset 0 0 8px rgba(255,255,255,0.2)"
              }}
            />
          </motion.div>
        )}

        {/* Enhanced birds queue with images */}
        <div className="absolute left-6 bottom-24">
          <div className="text-xs font-bold text-green-800 mb-2">Next Birds:</div>
          <div className="flex gap-2">
            {Array.from({ length: Math.max(0, birdsLeft - 1) }).map((_, idx) => (
              <motion.div
                key={idx}
                className="relative"
                style={{
                  width: 32,
                  height: 32,
                }}
                animate={{ y: [0, -2, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  delay: idx * 0.2
                }}
              >
                <img
                  src={red}
                  alt="Next Bird"
                  className="w-full h-full object-contain rounded-full"
                  style={{
                    filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3)) brightness(0.9)"
                  }}
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-full " />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side – Blocks */}
      <div className="absolute right-0 top-0 w-1/2 h-full">
        <div 
          className="absolute bottom-20 right-8 w-32 h-40 opacity-20"
          style={{
            background: "linear-gradient(135deg, #8B7355 0%, #A0856B 50%, #6B5B47 100%)",
            clipPath: "polygon(0 100%, 0 20%, 25% 0, 75% 0, 100% 20%, 100% 100%)"
          }}
        />
        
        {blocks.map((block, idx) => (
          <Block
            key={idx}
            x={block.x}
            y={block.y}
            width={block.width || 60}
            height={block.height || 60}
            type={block.type || "wood"}
          />
        ))}
      </div>

      {/* Aim helper line */}
      {isAiming && dragPos && (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="aimLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="50%" stopColor="rgba(255,255,0,0.6)" />
              <stop offset="100%" stopColor="rgba(255,0,0,0.4)" />
            </linearGradient>
          </defs>
          <line
            x1={dragPos.x}
            y1={dragPos.y}
            x2={dragPos.x + (dragPos.x - slingX) * 3}
            y2={dragPos.y + (dragPos.y - slingY) * 3}
            stroke="url(#aimLine)"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        </svg>
      )}

      <style jsx>{`
        @keyframes cloudFloat {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(15px) translateY(-8px); }
          50% { transform: translateX(0) translateY(-4px); }
          75% { transform: translateX(-10px) translateY(3px); }
        }
        
        @keyframes cloudDrift {
          0% { transform: translateX(-150px) translateY(0); }
          100% { transform: translateX(900px) translateY(-15px); }
        }
        
        @keyframes cloudSlow {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); }
          50% { transform: translateX(30px) translateY(-10px) scale(1.05); }
        }
        
        @keyframes cloudGentle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-6px) rotate(0.5deg); }
          66% { transform: translateY(4px) rotate(-0.3deg); }
        }
      `}</style>
    </div>
  );
}

export default GameCanvas;