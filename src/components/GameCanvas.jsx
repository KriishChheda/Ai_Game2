import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Block from "./Block";
import red from "../assets/red.png";

function GameCanvas({ birdsLeft, blocks, onShoot, birdFlying, impactEffect }) {
  const slingRef = useRef(null);
  const [dragPos, setDragPos] = useState(null);
  const [isAiming, setIsAiming] = useState(false);
  const [flyingBirdPos, setFlyingBirdPos] = useState(null);
  
  const slingX = 150;
  const slingY = 360;

  // Animate flying bird
  useEffect(() => {
    if (!birdFlying) {
      setFlyingBirdPos(null);
      return;
    }

    const { angle, velocity, startTime } = birdFlying;
    const rad = (angle * Math.PI) / 180;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 1000; // time in seconds
      
      // Physics-based trajectory
      const vx = Math.cos(rad) * velocity * 30;
      const vy = -Math.sin(rad) * velocity * 30;
      const gravity = 200; // pixels per second squared
      
      const x = slingX + vx * progress;
      const y = slingY + vy * progress + 0.5 * gravity * progress * progress;
      
      // Rotation based on velocity direction
      const currentVy = vy + gravity * progress;
      const rotation = Math.atan2(currentVy, vx) * 180 / Math.PI;
      
      setFlyingBirdPos({ x, y, rotation });
      
      // Continue animation if bird is still in bounds
      if (x < 900 && y < 600) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [birdFlying]);

  const handleMouseDown = (e) => {
    if (birdsLeft <= 0 || birdFlying) return;
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
    <div
      ref={slingRef}
      className="relative overflow-hidden rounded-2xl shadow-2xl shadow-yellow-100 border-4 border-green-800"
      style={{
        width: "800px",
        height: "500px",
        background: "linear-gradient(to bottom, #87CEEB 0%, #98FB98 60%, #90EE90 100%)",
        cursor: birdsLeft > 0 && !birdFlying ? "crosshair" : "not-allowed"
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
            <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D2B48C" />
              <stop offset="25%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="75%" stopColor="#654321" />
              <stop offset="100%" stopColor="#5D4037" />
            </linearGradient>
            
            <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="20" height="4">
              <rect width="20" height="4" fill="#8B4513"/>
              <rect x="0" y="1" width="20" height="1" fill="#654321" opacity="0.7"/>
              <rect x="0" y="3" width="20" height="1" fill="#A0522D" opacity="0.5"/>
            </pattern>
            
            <linearGradient id="elasticGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2C1810" />
              <stop offset="30%" stopColor="#4A2C17" />
              <stop offset="50%" stopColor="#654321" />
              <stop offset="70%" stopColor="#4A2C17" />
              <stop offset="100%" stopColor="#2C1810" />
            </linearGradient>
            
            <filter id="glowEffect">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="3" dy="3" stdDeviation="2" floodColor="rgba(0,0,0,0.4)"/>
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
            fill="#C0C0C0"
            stroke="#606060"
            strokeWidth="1"
          />
          <circle
            cx={slingX + 38}
            cy={slingY - 150}
            r="4"
            fill="#C0C0C0"
            stroke="#606060"
            strokeWidth="1"
          />
          
          {/* Base reinforcement */}
          <ellipse
            cx={slingX}
            cy={slingY + 55}
            rx="11"
            ry="8"
            fill="#8B4513"
            stroke="#5D4037"
            strokeWidth="2"
          />
        </svg>

        {/* Enhanced elastic bands with physics-based curves */}
        {isAiming && dragPos && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {(() => {
              const leftAnchor = { x: slingX - 38, y: slingY - 150 };
              const rightAnchor = { x: slingX + 38, y: slingY - 150 };
              const pullPoint = { x: dragPos.x, y: dragPos.y };
              
              const leftDistance = Math.sqrt(
                Math.pow(pullPoint.x - leftAnchor.x, 2) + 
                Math.pow(pullPoint.y - leftAnchor.y, 2)
              );
              const rightDistance = Math.sqrt(
                Math.pow(pullPoint.x - rightAnchor.x, 2) + 
                Math.pow(pullPoint.y - rightAnchor.y, 2)
              );
              
              const maxStretch = 150;
              const leftTension = Math.min(leftDistance / maxStretch, 1);
              const rightTension = Math.min(rightDistance / maxStretch, 1);
              
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
                  <path
                    d={`M ${leftAnchor.x} ${leftAnchor.y} 
                        Q ${leftMid.x} ${leftMid.y} ${pullPoint.x} ${pullPoint.y}`}
                    stroke="url(#elasticGradient)"
                    strokeWidth={4 + leftTension * 2}
                    fill="none"
                    opacity={0.9}
                  />
                  
                  <path
                    d={`M ${rightAnchor.x} ${rightAnchor.y} 
                        Q ${rightMid.x} ${rightMid.y} ${pullPoint.x} ${pullPoint.y}`}
                    stroke="url(#elasticGradient)"
                    strokeWidth={4 + rightTension * 2}
                    fill="none"
                    opacity={0.9}
                  />
                  
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
                  
                  <ellipse
                    cx={pullPoint.x}
                    cy={pullPoint.y}
                    rx="8"
                    ry="6"
                    fill="#8B4513"
                    stroke="#654321"
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  
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

        {/* Bird on sling */}
        {birdsLeft > 0 && !birdFlying && (
          <motion.div
            className="absolute cursor-grab select-none"
            style={{
              width: 44,
              height: 44,
              left: dragPos ? dragPos.x - 22 : slingX - 22,
              top: dragPos ? dragPos.y - 22 : slingY - 22,
              zIndex: 50,
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
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: "inset 0 0 8px rgba(255,255,255,0.2)"
              }}
            />
          </motion.div>
        )}

        {/* Flying bird */}
        <AnimatePresence>
          {flyingBirdPos && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                width: 44,
                height: 44,
                left: flyingBirdPos.x - 22,
                top: flyingBirdPos.y - 22,
                zIndex: 100,
                filter: "drop-shadow(2px 2px 6px rgba(0,0,0,0.4))"
              }}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              <motion.img
                src={red}
                alt="Flying Bird"
                className="w-full h-full object-contain"
                style={{
                  transform: `rotate(${flyingBirdPos.rotation}deg)`,
                  imageRendering: "crisp-edges"
                }}
                draggable={false}
              />
              {/* Motion trail */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(255,0,0,0.3) 0%, transparent 70%)",
                  transform: "scale(1.5)",
                  zIndex: -1
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Birds queue */}
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
        
        <AnimatePresence>
          {blocks.map((block) => (
            <Block
              key={block.id}
              x={block.x}
              y={block.y}
              width={block.width || 60}
              height={block.height || 60}
              type={block.type || "wood"}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Impact effect */}
      <AnimatePresence>
        {impactEffect && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: impactEffect.x - impactEffect.radius,
              top: impactEffect.y - impactEffect.radius,
              width: impactEffect.radius * 2,
              height: impactEffect.radius * 2,
              zIndex: 200
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Explosion burst */}
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-400 via-orange-500 to-red-600 opacity-80" />
            
            {/* Particles */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * 60,
                    y: Math.sin(angle) * 60,
                    opacity: 0
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              );
            })}
            
            {/* Impact shockwave */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-white"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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