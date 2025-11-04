// src/components/GamePage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameCanvas from "./GameCanvas";

/**
 * SCALABLE ANGRY BIRDS GAME ENGINE WITH BLOCK-ON-BLOCK AI ALGORITHM
 * 
 * Block-on-Block Algorithm:
 * - Each block correctly placed on another block or ground = +1 point
 * - Initial structure score calculated at game start
 * - After each shot: Final structure score calculated
 * - Bird's AI Score = Initial Score - Final Score
 * - Higher score = better structural damage
 */

// CONFIGURATION - Easy to extend for AI training
const GAME_CONFIG = {
  canvas: {
    width: 1000,
    height: 600,
    groundHeight: 20,
  },
  slingshot: {
    x: 180,
    y: 440,
  },
  physics: {
    gravity: 980,
    airResistance: 0.99,
    timeStep: 1/60,
  },
  collision: {
    birdRadius: 22,
    damageMultiplier: 0.5,
  }
};

// BIRD TYPES
const BIRD_TYPES = {
  red: {
    name: "Red",
    mass: 1.0,
    damage: 50,
    special: null,
  },
  blue: {
    name: "Blue",
    mass: 0.6,
    damage: 30,
    special: "split",
  },
  yellow: {
    name: "Yellow", 
    mass: 0.8,
    damage: 60,
    special: "speed",
  },
};

// BLOCK TYPES
const BLOCK_TYPES = {
  wood: {
    name: "Wood",
    health: 100,
    density: 1.0,
    color: "#8B4513"
  },
  stone: {
    name: "Stone",
    health: 200,
    density: 2.0,
    color: "#A9A9A9"
  },
  glass: {
    name: "Glass",
    health: 50,
    density: 0.8,
    color: "#ADD8E6"
  },
  ice: {
    name: "Ice",
    health: 80,
    density: 0.9,
    color: "#B0E0E6"
  },
  metal: {
    name: "Metal",
    health: 300,
    density: 3.0,
    color: "#708090"
  }
};

const GROUND_Y = GAME_CONFIG.canvas.height - GAME_CONFIG.canvas.groundHeight;

/**
 * BLOCK-ON-BLOCK AI ALGORITHM
 * Calculates structural stability score
 */
function calculateBlockOnBlockScore(blocks) {
  let score = 0;
  const HORIZONTAL_TOLERANCE = 35; // Horizontal alignment tolerance in pixels
  const VERTICAL_TOLERANCE = 5; // Vertical stacking tolerance in pixels
  
  blocks.forEach(block => {
    const blockBottom = block.y + block.height;
    
    // Check if block is on ground (within tolerance)
    if (Math.abs(blockBottom - GROUND_Y) <= VERTICAL_TOLERANCE) {
      score += 1;
      return;
    }
    
    // Check if block is correctly placed on another block
    const supportingBlock = blocks.find(otherBlock => {
      if (otherBlock.id === block.id) return false;
      
      const otherTop = otherBlock.y;
      
      // Check vertical alignment (block bottom should be near other block top)
      const verticallyAligned = Math.abs(blockBottom - otherTop) <= VERTICAL_TOLERANCE;
      
      if (!verticallyAligned) return false;
      
      // Check horizontal alignment (block center should be over supporting block)
      const blockCenterX = block.x + block.width / 2;
      const otherLeft = otherBlock.x;
      const otherRight = otherBlock.x + otherBlock.width;
      
      const horizontallyAligned = blockCenterX >= (otherLeft - HORIZONTAL_TOLERANCE) && 
                                  blockCenterX <= (otherRight + HORIZONTAL_TOLERANCE);
      
      return horizontallyAligned;
    });
    
    if (supportingBlock) {
      score += 1;
    }
  });
  
  return score;
}

/**
 * PHYSICS ENGINE - Accurate projectile trajectory
 */
function calculateTrajectory(angle, velocity, startX, startY, steps = 100) {
  const rad = (angle * Math.PI) / 180;
  const vx = Math.cos(rad) * velocity * 50;
  const vy = -Math.sin(rad) * velocity * 50;
  
  const trajectory = [];
  const dt = GAME_CONFIG.physics.timeStep;
  
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    const x = startX + vx * t * Math.pow(GAME_CONFIG.physics.airResistance, i);
    const y = startY + vy * t + 0.5 * GAME_CONFIG.physics.gravity * t * t;
    
    if (y >= GROUND_Y || x > GAME_CONFIG.canvas.width || y < 0) break;
    
    trajectory.push({ x, y, t });
  }
  
  return trajectory;
}

/**
 * COLLISION DETECTION
 */
function checkCollision(birdX, birdY, block) {
  const birdRadius = GAME_CONFIG.collision.birdRadius;
  
  const closestX = Math.max(block.x, Math.min(birdX, block.x + block.width));
  const closestY = Math.max(block.y, Math.min(birdY, block.y + block.height));
  
  const distanceX = birdX - closestX;
  const distanceY = birdY - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;
  
  return distanceSquared < (birdRadius * birdRadius);
}

/**
 * DAMAGE CALCULATION
 */
function calculateDamage(velocity, birdType, blockType) {
  const bird = BIRD_TYPES[birdType];
  const block = BLOCK_TYPES[blockType];
  
  const velocityFactor = Math.min(velocity / 20, 2);
  const damage = bird.damage * velocityFactor / block.density * GAME_CONFIG.collision.damageMultiplier;
  
  return Math.round(damage);
}

/**
 * SIMULATE SHOT
 */
function simulateShot(blocks, angle, velocity, birdType = 'red') {
  const trajectory = calculateTrajectory(
    angle, 
    velocity, 
    GAME_CONFIG.slingshot.x, 
    GAME_CONFIG.slingshot.y
  );
  
  if (trajectory.length === 0) {
    return { 
      newBlocks: blocks, 
      trajectory, 
      collisions: [],
      reward: 0
    };
  }
  
  const collisions = [];
  const updatedBlocks = blocks.map(block => ({ ...block }));
  
  for (let i = 0; i < trajectory.length; i++) {
    const point = trajectory[i];
    
    for (let blockIdx = 0; blockIdx < updatedBlocks.length; blockIdx++) {
      const block = updatedBlocks[blockIdx];
      
      if (checkCollision(point.x, point.y, block)) {
        const currentVelocity = velocity * Math.pow(GAME_CONFIG.physics.airResistance, i);
        const damage = calculateDamage(currentVelocity, birdType, block.type);
        
        if (!block.damage) block.damage = 0;
        block.damage += damage;
        
        collisions.push({
          blockId: block.id,
          position: { x: point.x, y: point.y },
          damage: damage,
          timestamp: point.t
        });
        
        if (damage > 20) {
          trajectory.splice(i + 1);
          break;
        }
      }
    }
  }
  
  const newBlocks = updatedBlocks.filter(block => {
    const blockType = BLOCK_TYPES[block.type];
    return !block.damage || block.damage < blockType.health;
  });
  
  const blocksDestroyed = blocks.length - newBlocks.length;
  const totalDamage = collisions.reduce((sum, col) => sum + col.damage, 0);
  const reward = blocksDestroyed * 100 + totalDamage;
  
  return { 
    newBlocks, 
    trajectory, 
    collisions,
    blocksDestroyed,
    totalDamage,
    reward
  };
}

function GamePage() {
  const initialBlocks = [
    { id: 1, x: 400, y: 450, width: 60, height: 60, type: "wood", damage: 0 }, 
    { id: 2, x: 370, y: 330, width: 60, height: 60, type: "stone", damage: 0 }, 
    { id: 3, x: 340, y: 450, width: 60, height: 60, type: "wood", damage: 0 }, 
    { id: 4, x: 340, y: 390, width: 60, height: 60, type: "glass", damage: 0 }, 
    { id: 5, x: 400, y: 390, width: 60, height: 60, type: "ice", damage: 0 },
  ];

  const [gameState, setGameState] = useState({
    blocks: initialBlocks,
    birds: [
      { type: 'red', used: false },
      { type: 'blue', used: false },
      { type: 'yellow', used: false },
    ],
    currentBirdIndex: 0,
    score: 0,
    shots: [],
    initialStructureScore: calculateBlockOnBlockScore(initialBlocks)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");
  const [lastShotResult, setLastShotResult] = useState(null);
  const [birdFlying, setBirdFlying] = useState(null);
  const [impactEffects, setImpactEffects] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

  const birdsLeft = gameState.birds.filter(b => !b.used).length;
  const currentBird = gameState.birds[gameState.currentBirdIndex];
  const currentStructureScore = calculateBlockOnBlockScore(gameState.blocks);

  useEffect(() => {
    if (gameState.blocks.length === 0) {
      setGameStatus("won");
    } else if (birdsLeft === 0) {
      setGameStatus("lost");
    } else {
      setGameStatus("playing");
    }
  }, [gameState.blocks.length, birdsLeft]);

  function shootBird(angle, velocity) {
    if (birdsLeft <= 0 || gameStatus !== "playing" || !currentBird) return;

    const birdType = currentBird.type;
    const beforeScore = calculateBlockOnBlockScore(gameState.blocks);
    const shotResult = simulateShot(gameState.blocks, angle, velocity, birdType);
    
    setBirdFlying({ 
      angle, 
      velocity, 
      birdType,
      trajectory: shotResult.trajectory,
      startTime: Date.now() 
    });
    setLastShotResult(null);

    const flightTime = Math.min(1200, shotResult.trajectory.length * 16);

    setTimeout(() => {
      setBirdFlying(null);
      setIsLoading(true);

      const effects = shotResult.collisions.map((collision, idx) => ({
        ...collision,
        id: Date.now() + idx,
        radius: 50
      }));
      setImpactEffects(effects);

      setTimeout(() => setImpactEffects([]), 600);

      // Calculate Block-on-Block AI score
      const afterScore = calculateBlockOnBlockScore(shotResult.newBlocks);
      const aiScore = beforeScore - afterScore;

      const newBirds = [...gameState.birds];
      newBirds[gameState.currentBirdIndex].used = true;

      setGameState(prev => ({
        ...prev,
        blocks: shotResult.newBlocks,
        birds: newBirds,
        currentBirdIndex: prev.currentBirdIndex + 1,
        score: prev.score + shotResult.reward,
        shots: [...prev.shots, {
          angle,
          velocity,
          birdType,
          blocksDestroyed: shotResult.blocksDestroyed,
          totalDamage: shotResult.totalDamage,
          reward: shotResult.reward,
          beforeStructureScore: beforeScore,
          afterStructureScore: afterScore,
          aiScore: aiScore,
          timestamp: Date.now()
        }]
      }));

      setLastShotResult({
        blocksDestroyed: shotResult.blocksDestroyed,
        totalDamage: shotResult.totalDamage,
        accuracy: shotResult.blocksDestroyed > 0 ? "Hit!" : "Miss!",
        power: Math.round(velocity),
        score: Math.round(shotResult.reward),
        aiScore: aiScore,
        beforeStructureScore: beforeScore,
        afterStructureScore: afterScore
      });

      setIsLoading(false);
    }, flightTime);
  }

  function resetGame() {
    setGameState({
      blocks: initialBlocks,
      birds: [
        { type: 'red', used: false },
        { type: 'blue', used: false },
        { type: 'yellow', used: false },
      ],
      currentBirdIndex: 0,
      score: 0,
      shots: [],
      initialStructureScore: calculateBlockOnBlockScore(initialBlocks)
    });
    setGameStatus("playing");
    setLastShotResult(null);
    setBirdFlying(null);
    setImpactEffects([]);
    setShowScoreboard(false);
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FECA57 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
      }}
    >
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Scoreboard Button - Top Right */}
      <motion.button
        className="fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition-colors z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowScoreboard(!showScoreboard)}
      >
        📊 AI Scoreboard {gameState.shots.length > 0 && `(${gameState.shots.length})`}
      </motion.button>

      {/* Structure Stability Indicator - Top Right */}
      <div className="fixed top-20 right-4 bg-blue-600 bg-opacity-90 text-white px-4 py-3 rounded-lg shadow-lg z-40">
        <div className="text-xs font-semibold mb-1">STRUCTURE STABILITY</div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{currentStructureScore}</div>
          <div className="text-xs opacity-75">/ {gameState.initialStructureScore}</div>
        </div>
        <div className="w-32 h-2 bg-white bg-opacity-30 rounded-full mt-2">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(currentStructureScore / gameState.initialStructureScore) * 100}%`,
              background: currentStructureScore === gameState.initialStructureScore 
                ? "#22c55e" 
                : currentStructureScore > gameState.initialStructureScore / 2 
                ? "#f59e0b" 
                : "#ef4444"
            }}
          />
        </div>
      </div>

      {/* Game Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-black mb-4 drop-shadow-lg">
          Angry Birds 2.0
        </h1>

        {/* Game Stats */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <motion.div
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-yellow-700 text-lg font-semibold">
              Birds Left:{" "}
              <span className="text-yellow-700 text-2xl font-bold">
                {birdsLeft}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-red-800 text-lg font-semibold">
              Blocks Left:{" "}
              <span className="text-red-800 text-2xl font-bold">
                {gameState.blocks.length}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Shot Result */}
        <AnimatePresence>
          {lastShotResult && (
            <motion.div
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              className="space-y-2"
            >
              <div className={`inline-block px-4 py-2 rounded-lg font-bold text-white ${
                lastShotResult.blocksDestroyed > 0 ? "bg-green-500" : "bg-orange-500"
              }`}>
                {lastShotResult.accuracy}
                {lastShotResult.blocksDestroyed > 0 &&
                  ` ${lastShotResult.blocksDestroyed} blocks destroyed!`}
                {` Score: ${lastShotResult.score}`}
                {` (Power: ${lastShotResult.power})`}
              </div>
              
              {lastShotResult.aiScore > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block px-4 py-2 rounded-lg font-bold text-white bg-purple-600 ml-2"
                >
                  🤖 AI Score: {lastShotResult.aiScore} 
                  <span className="text-sm ml-2">
                    ({lastShotResult.beforeStructureScore} → {lastShotResult.afterStructureScore})
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Canvas */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <GameCanvas
          birdsLeft={birdsLeft}
          currentBird={currentBird}
          remainingBirds={gameState.birds}
          blocks={gameState.blocks}
          onShoot={shootBird}
          birdFlying={birdFlying}
          impactEffects={impactEffects}
          config={GAME_CONFIG}
        />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
                />
                <div className="text-white text-xl font-semibold">
                  Processing Shot...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scoreboard Modal */}
      <AnimatePresence>
        {showScoreboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowScoreboard(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">🏆 AI Scoreboard</h2>
                <button 
                  onClick={() => setShowScoreboard(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-2">📊 Block-on-Block Algorithm</h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>How it works:</strong> Each block correctly placed on top of another block or the ground = +1 point
                </p>
                <p className="text-sm text-blue-800">
                  <strong>AI Score = </strong>Structure Score Before Shot - Structure Score After Shot
                  <br />
                  <em>Higher AI scores = Better structural damage!</em>
                </p>
              </div>

              {gameState.shots.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-lg">
                  🎯 No shots yet. Start playing to see AI scores!
                </div>
              ) : (
                <div className="space-y-3">
                  {gameState.shots.map((shot, idx) => {
                    const birdEmoji = shot.birdType === 'red' ? '🔴' : shot.birdType === 'blue' ? '🔵' : '🟡';
                    const birdName = BIRD_TYPES[shot.birdType].name;
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{birdEmoji}</span>
                            <div>
                              <div className="font-bold text-gray-800">
                                Shot #{idx + 1} - {birdName} Bird
                              </div>
                              <div className="text-xs text-gray-500">
                                Angle: {Math.round(shot.angle)}° | Power: {Math.round(shot.velocity)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {shot.aiScore}
                            </div>
                            <div className="text-xs text-gray-500">AI Score</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                          <div className="bg-white rounded p-2 text-center">
                            <div className="text-gray-600 text-xs">Blocks Destroyed</div>
                            <div className="text-lg font-bold text-red-600">{shot.blocksDestroyed}</div>
                          </div>
                          <div className="bg-white rounded p-2 text-center">
                            <div className="text-gray-600 text-xs">Before → After</div>
                            <div className="text-lg font-bold text-blue-600">
                              {shot.beforeStructureScore} → {shot.afterStructureScore}
                            </div>
                          </div>
                          <div className="bg-white rounded p-2 text-center">
                            <div className="text-gray-600 text-xs">Game Score</div>
                            <div className="text-lg font-bold text-green-600">{shot.reward}</div>
                          </div>
                        </div>

                        {shot.aiScore > 0 && (
                          <div className="mt-2 text-center">
                            <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                              ⭐ Structural Damage: {shot.aiScore} {shot.aiScore > 2 ? 'points! Great shot!' : 'point'}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {gameState.shots.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total AI Score (Structural Damage)</div>
                    <div className="text-4xl font-bold text-orange-600">
                      {gameState.shots.reduce((sum, shot) => sum + shot.aiScore, 0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Initial Structure: {gameState.initialStructureScore} | 
                      Current Structure: {currentStructureScore} | 
                      Total Damage: {gameState.initialStructureScore - currentStructureScore}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameStatus !== "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="bg-white rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                {gameStatus === "won" ? "Victory!" : "Game Over!"}
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                {gameStatus === "won"
                  ? "Congratulations! You destroyed all the blocks!"
                  : "No more birds left. Better luck next time!"}
              </p>
              
              {gameState.shots.length > 0 && (
                <div className="my-4 p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total AI Score</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {gameState.shots.reduce((sum, shot) => sum + shot.aiScore, 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Structural Damage Points
                  </div>
                </div>
              )}
              
              <motion.button
                onClick={resetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                🔄 Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        className="mt-6 text-center max-w-2xl"
        initial={{ y: 45, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
          <p className="text-red-700 text-sm">
            <b className="text-black">How to play:</b> Click and drag the bird to aim and set power. Release to shoot! <br />
            Destroy all blocks to win! Watch the AI score to see structural damage!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default GamePage;