// src/components/GamePage.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameCanvas from "./GameCanvas";

/**
 * Frontend-only game logic:
 * - calculateStructureScore(blocks): block-on-block scoring (1 if supported by ground or another block)
 * - simulateDestruction(blocks, angle, velocity): removes blocks within an impact radius based on shot
 * - shootBird(...) uses the above to compute birdScore and update game state
 */

const SLING_X = 150;
const SLING_Y = 360;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_HEIGHT = 20; // bottom area height as in GameCanvas
const GROUND_Y = CANVAS_HEIGHT - GROUND_HEIGHT; // y coordinate of ground top (480)

/** Helper: check horizontal overlap between two blocks (AABB) */
function isHorizontallyOverlapping(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x;
}

/** Calculate structure score: each block gets 1 if supported (on ground or on top of another block), else 0 */
function calculateStructureScore(blocks) {
  // We'll allow a tiny tolerance for Y matching
  const yTolerance = 6; // pixels
  let score = 0;

  blocks.forEach((block) => {
    const bottomY = block.y + block.height;

    // if block touches ground (bottom near ground top)
    if (Math.abs(bottomY - GROUND_Y) <= yTolerance || bottomY > GROUND_Y) {
      score += 1;
      return;
    }

    // Check if supported by some block below it (block A is supported if its bottom equals some other block's top and horizontally overlaps)
    const supported = blocks.some((other) => {
      if (other.id === block.id) return false;
      // otherTop:
      const otherTop = other.y;
      // If block bottom is aligned to other top (within tolerance) and horizontally overlaps
      if (Math.abs(bottomY - otherTop) <= yTolerance && isHorizontallyOverlapping(block, other)) {
        return true;
      }
      return false;
    });

    if (supported) score += 1;
    // else score += 0 (implicitly)
  });

  return score;
}

/** Simulate destruction locally: return new blocks array after removing blocks within impact radius.
 *  angle: degrees (as passed by GameCanvas), velocity: numeric
 */
function simulateDestruction(blocks, angleDeg, velocity) {
  // compute impact point roughly using sling origin and angle
  const rad = (angleDeg * Math.PI) / 180;
  // scale factor chosen by experimentation — larger velocity pushes impact farther
  const distanceScale = 28; // tuning knob
  const impactX = SLING_X + Math.cos(rad) * velocity * distanceScale;
  const impactY = SLING_Y - Math.sin(rad) * velocity * distanceScale; // subtract because canvas y grows downward

  // impact radius proportional to velocity
  const impactRadius = Math.min(Math.max(velocity * 8, 18), 160);

  // Keep blocks that are OUTSIDE impact radius (i.e., destroyed blocks are removed)
  const newBlocks = blocks.filter((b) => {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const dx = cx - impactX;
    const dy = cy - impactY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist > impactRadius;
  });

  return { newBlocks, impactX, impactY, impactRadius };
}

function GamePage() {
  const [gameState, setGameState] = useState({
    blocks: [
      { id: 1, x: 240, y: 355, width: 60, height: 60, type: "wood" },
      { id: 2, x: 270, y: 295, width: 60, height: 60, type: "stone" },
      { id: 3, x: 300, y: 355, width: 60, height: 60, type: "wood" },
    ],
    birds_left: 3,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing"); // "playing", "won", "lost"
  const [lastShotResult, setLastShotResult] = useState(null);
  const [birdFlying, setBirdFlying] = useState(null); // {angle, velocity, startTime}
  const [impactEffect, setImpactEffect] = useState(null); // {x, y, radius, timestamp}

  useEffect(() => {
    // Update gameStatus reactively if blocks become zero
    if (gameState.blocks.length === 0) {
      setGameStatus("won");
    } else if (gameState.birds_left === 0) {
      setGameStatus("lost");
    } else {
      setGameStatus("playing");
    }
  }, [gameState]);

  /** Main frontend-only replacement for backend apply_shot */
  function shootBird(angle, velocity) {
    if (gameState.birds_left <= 0 || gameStatus !== "playing") return;

    // Compute current score before shot
    const scoreBefore = calculateStructureScore(gameState.blocks);

    // Start bird flying animation
    setBirdFlying({ angle, velocity, startTime: Date.now() });
    setLastShotResult(null);

    // Calculate flight time based on velocity (approximate)
    const flightTime = Math.min(800, 300 + velocity * 15);

    // After flight animation, show impact
    setTimeout(() => {
      setBirdFlying(null);
      setIsLoading(true);

      const { newBlocks, impactX, impactY, impactRadius } = simulateDestruction(
        gameState.blocks,
        angle,
        velocity
      );

      // Show impact effect
      setImpactEffect({ x: impactX, y: impactY, radius: impactRadius, timestamp: Date.now() });

      // Clear impact effect after animation
      setTimeout(() => {
        setImpactEffect(null);
      }, 600);

      const scoreAfter = calculateStructureScore(newBlocks);
      const blocksDestroyed = gameState.blocks.length - newBlocks.length;
      const birdScore = Math.max(0, scoreBefore - scoreAfter); // number of supported-blocks lost

      // Update state: new blocks and decrement birds
      setGameState((prev) => ({
        ...prev,
        blocks: newBlocks,
        birds_left: Math.max(0, prev.birds_left - 1),
      }));

      // Show result
      setLastShotResult({
        blocksDestroyed,
        scoreGained: birdScore,
        accuracy: blocksDestroyed > 0 ? "Hit!" : "Miss!",
        power: Math.round(velocity),
        impact: { x: Math.round(impactX), y: Math.round(impactY), radius: Math.round(impactRadius) },
      });

      // Update final statuses
      if (scoreAfter === 0) {
        setGameStatus("won");
      } else if (gameState.birds_left - 1 <= 0) {
        setTimeout(() => {
          setGameState((prev) => {
            return { ...prev };
          });
        }, 0);
      }

      setIsLoading(false);
    }, flightTime);
  }

  function resetGame() {
    setGameState({
      blocks: [
        { id: 1, x: 520, y: 350, width: 60, height: 60, type: "wood" },
        { id: 2, x: 520, y: 290, width: 60, height: 60, type: "stone" },
        { id: 3, x: 580, y: 350, width: 60, height: 60, type: "wood" },
      ],
      birds_left: 3,
    });
    setGameStatus("playing");
    setLastShotResult(null);
    setBirdFlying(null);
    setImpactEffect(null);
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
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

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
                {gameState.birds_left}
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
              className={`inline-block px-4 py-2 rounded-lg font-bold text-white mb-4 ${
                lastShotResult.error
                  ? "bg-red-500"
                  : lastShotResult.blocksDestroyed > 0
                  ? "bg-green-500"
                  : "bg-orange-500"
              }`}
            >
              {lastShotResult.error || (
                <>
                  {lastShotResult.accuracy}
                  {lastShotResult.blocksDestroyed > 0 &&
                    ` ${lastShotResult.blocksDestroyed} blocks destroyed!`}
                  {lastShotResult.scoreGained !== undefined &&
                    ` Score: ${lastShotResult.scoreGained}`}
                  {` (Power: ${lastShotResult.power})`}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Canvas */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scaleY: 1.3, scaleX: 1.8, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <GameCanvas
          birdsLeft={gameState.birds_left}
          blocks={gameState.blocks}
          onShoot={shootBird}
          birdFlying={birdFlying}
          impactEffect={impactEffect}
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
                <div className="text-red text-xl font-semibold">
                  Processing Shot...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
              <p className="text-lg text-gray-600 mb-6">
                {gameStatus === "won"
                  ? "Congratulations! You destroyed all the blocks!"
                  : "No more birds left. Better luck next time!"}
              </p>
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
            <b className="text-black">How to play:</b> Click and drag the red
            bird to aim and set power. Release to shoot! <br />
            Destroy all blocks to win!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default GamePage; 