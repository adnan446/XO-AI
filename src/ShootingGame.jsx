import React, { useState, useRef, useCallback } from 'react';
import GameArea from './components/GameArea';

const ShootingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef(null);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setLives(10);
    setGameOver(false);
  };

  const handleScoreChange = useCallback((newScore, newCombo) => {
    setScore(newScore);
    setCombo(newCombo);
  }, []);

  const handleLivesChange = useCallback((change) => {
    setLives(prev => {
      const next = prev + change;
      if (next <= 0) {
        setGameOver(true);
        setIsPlaying(false);
      }
      return next;
    });
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-white font-sans overflow-hidden select-none">
      {/* Absolute Header HUD */}
      {isPlaying && (
        <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between pointer-events-none">
          <div>
            <h2 className="text-4xl font-black text-yellow-400 drop-shadow-lg">SCORE: {score}</h2>
            {combo > 1 && (
              <p className="text-xl font-bold text-orange-500 animate-pulse">Combo x{combo}</p>
            )}
          </div>
          <div>
            <div className="flex gap-2">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-8 rounded-sm ${i < lives ? 'bg-red-500' : 'bg-gray-800'}`}
                  style={{ boxShadow: i < lives ? '0 0 10px #ef4444' : 'none' }}
                />
              ))}
            </div>
            <p className="text-right mt-2 text-gray-300 font-bold uppercase">Lives</p>
          </div>
        </div>
      )}

      {/* Game Area */}
      {isPlaying ? (
        <GameArea 
          onScoreChange={handleScoreChange} 
          onLivesChange={handleLivesChange} 
          gameStateRef={gameStateRef} 
        />
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center bg-gray-900 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black opacity-80 z-0"></div>
          
          <div className="z-10 flex flex-col items-center bg-black/60 p-12 rounded-3xl backdrop-blur-md border border-gray-700 shadow-2xl mt-[-5%]">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-6 drop-shadow-xl text-center">
              GESTURE NINJA
            </h1>
            
            {gameOver && (
              <div className="mb-8 text-center text-red-500">
                <h2 className="text-4xl font-bold mb-2 text-red-500 uppercase tracking-widest drop-shadow-md">Game Over</h2>
                <p className="text-2xl text-white">Final Score: <span className="text-yellow-400 font-black">{score}</span></p>
              </div>
            )}

            <div className="mb-10 w-96">
              <h3 className="text-xl font-bold mb-4 text-emerald-300 text-center border-b border-gray-700 pb-2">How to Play</h3>
              <ul className="text-gray-300 space-y-3 leading-relaxed">
                <li className="flex items-center gap-3"><span className="text-2xl">✋</span> <strong>Blade:</strong> Point your Index finger to control the blade.</li>
                <li className="flex items-center gap-3"><span className="text-2xl">⚔️</span> <strong>Slice:</strong> Swipe your hand across the screen to cut targets!</li>
                <li className="flex items-center gap-3"><span className="text-2xl">🍎</span> <strong>Goal:</strong> Slice the red apples before they drop off screen!</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={startGame}
                className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-2xl rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span>{gameOver ? 'PLAY AGAIN' : 'START MISSION'}</span>
                <span className="text-3xl">🚀</span>
              </button>

              <button 
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen();
                  }
                }}
                className="px-6 py-5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center border border-gray-600"
                title="Toggle Fullscreen"
              >
                <span className="text-2xl">🖥️</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShootingGame;
