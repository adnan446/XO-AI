import React, { useState, useRef, useCallback, useEffect } from 'react';
import GameArea from './components/GameArea';
import PremiumStartScreen from './components/ui/PremiumStartScreen';

const HUD = React.memo(({ score, lives, combo }) => (
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
));

const ShootingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef(null);
  
  const scoreBufferRef = useRef(0);
  const comboRef = useRef(0);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setLives(10);
    setGameOver(false);
    scoreBufferRef.current = 0;
    comboRef.current = 0;
  };

  const handleScoreChange = useCallback((points, newCombo) => {
    scoreBufferRef.current += points;
    comboRef.current = newCombo;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scoreBufferRef.current > 0) {
        setScore(s => s + scoreBufferRef.current);
        scoreBufferRef.current = 0;
      }
      setCombo(c => (c !== comboRef.current ? comboRef.current : c));
    }, 100);
    return () => clearInterval(interval);
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
      {isPlaying && <HUD score={score} lives={lives} combo={combo} />}

      {/* Game Area */}
      {isPlaying ? (
        <GameArea 
          onScoreChange={handleScoreChange} 
          onLivesChange={handleLivesChange} 
          gameStateRef={gameStateRef} 
        />
      ) : (
        <PremiumStartScreen 
          gameOver={gameOver} 
          score={score} 
          startGame={startGame} 
        />
      )}
    </div>
  );
};

export default ShootingGame;
