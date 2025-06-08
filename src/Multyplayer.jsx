
import { useState, useEffect, useRef } from "react";

// Winning combinations
const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Confetti component
function Confetti() {
  const [confettiPieces] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: Math.random() * 8 + 4,
      color: ['#00f7ff', '#ff3ec9', '#a3ff12', '#ffffff', '#444444'][Math.floor(Math.random() * 5)],
      shape: Math.random() > 0.5 ? 'square' : 'circle'
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className={`absolute ${piece.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            animationName: 'confetti-fall',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            top: '-20px'
          }}
        />
      ))}
    </div>
  );
}

// Animated XO background
function XOBackground({ gameActive }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!gameActive) {
      setItems([]);
      return;
    }

    const generateItems = () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i + "-" + Math.random(),
        symbol: Math.random() > 0.5 ? "X" : "O",
        left: Math.random() * 100,
        top: 100 + Math.random() * 100,
        duration: 20 + Math.random() * 10,
        size: 24 + Math.random() * 24,
        color: Math.random() > 0.5 ? "#00f7ff" : "#ff3ec9"
      }));

    setItems(generateItems());

    const interval = setInterval(() => {
      setItems(prev => [...prev, ...generateItems()]);
    }, 3000);

    return () => clearInterval(interval);
  }, [gameActive]);

  if (!gameActive) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute font-extrabold opacity-10 animate-xo-rise"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            fontSize: `${item.size}px`,
            color: item.color,
            animationDuration: `${item.duration}s`
          }}
        >
          {item.symbol}
        </div>
      ))}
    </div>
  );
}

// Winner Modal
function WinnerModal({ winner, onClose, onRestart }) {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#111] p-8 rounded-3xl text-center backdrop-blur-xl border-2 border-[#e7e7e7] shadow-[0_0_20px_#00f7ff]">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#00f7ff] to-[#ff3ec9] rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {winner}
          </div>
          <div className="absolute text-yellow-400 text-5xl left-1/2 -translate-x-1/2 -top-8 -rotate-12">
            👑
          </div>
        </div>
        <h2 className="text-4xl font-bold text-yellow-300 mb-2">🎉 Winner! 🎉</h2>
        <p className="text-gray-300 mb-6">That was a brilliant victory!</p>
        <div className="flex justify-center gap-4">
          <button onClick={onRestart} className="px-6 py-3 bg-black border border-[#00f7ff] text-[#00f7ff] hover:bg-[#0f0f0f] rounded-xl shadow-lg hover:shadow-[0_0_10px_#00f7ff] transition">
            Play Again
          </button>

        </div>
      </div>
    </div>
  );
}

// Main App
export default function Multyplayer() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const result = getWinner(board);
  const winner = result?.winner;
  const winLine = result?.line || [];
  const isDraw = !winner && board.every(cell => cell);
  const gameActive = !winner && !isDraw;


  const clickSoundRef = useRef(new Audio("/sounds/click.wav"));
  const winSoundRef = useRef(new Audio("/sounds/win.wav"));


  useEffect(() => {
    if (winner) {
      setShowWinnerModal(true);
      setShowConfetti(true);

      // Play win sound
      winSoundRef.current.currentTime = 0;
      winSoundRef.current.play();

      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [winner]);



  function handleClick(index) {
    if (board[index] || winner) return;

    // Play click sound
    clickSoundRef.current.currentTime = 0;
    clickSoundRef.current.play();

    const newBoard = [...board];
    newBoard[index] = xTurn ? 'X' : 'O';
    setBoard(newBoard);
    setXTurn(!xTurn);
  }



  function resetGame() {
    setBoard(Array(9).fill(null));
    setXTurn(true);
    setShowWinnerModal(false);
    setShowConfetti(false);

    // Stop win sound
    winSoundRef.current.pause();
    winSoundRef.current.currentTime = 0;
  }


  function closeModal() {
    setShowWinnerModal(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-6 p-4 relative overflow-hidden">
      <XOBackground gameActive={gameActive} />
      {showConfetti && <Confetti />}
      <h1 className="text-5xl sm:text-6xl font-black text-[#00f7ff] drop-shadow-[0_0_10px_#00f7ff] tracking-widest z-10">XO-XO</h1>
      <p className="text-gray-500 z-10">Neon Battle Edition</p>
      <div className="grid grid-cols-3 gap-3 shadow-2xl z-10">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!!cell || !!winner}
            className={`w-20 h-20 sm:w-28 sm:h-28 text-4xl sm:text-5xl font-bold rounded-2xl transition-all duration-300 flex items-center justify-center border-2
              ${winLine.includes(i)
                ? 'bg-[#1a1a1a] border-[#a3ff12] text-[#a3ff12] animate-glow-pulse shadow-[0_0_20px_#a3ff12] scale-110'
                : cell === 'X'
                  ? 'bg-[#1a1a1a] text-[#00f7ff] border-[#333] shadow-inner'
                  : cell === 'O'
                    ? 'bg-[#1a1a1a] text-[#ff3ec9] border-[#333] shadow-inner'
                    : 'bg-black hover:bg-[#1c1c1c] text-gray-400 border-[#333] hover:shadow-[0_0_10px_#333]'}`}
          >
            <span className={cell ? 'animate-bounce-in' : ''}>{cell}</span>
          </button>
        ))}
      </div>
      <div className="text-lg sm:text-xl z-10">
        {winner ? (
          <div className="text-[#a3ff12] font-semibold animate-pulse"></div>
        ) : isDraw ? (
          <div className="text-gray-400">It's a Draw!</div>
        ) : (
          <div className={`${xTurn ? 'text-[#00f7ff]' : 'text-[#ff3ec9]'} font-semibold`}>
            {xTurn ? 'X' : 'O'}'s Turn
          </div>
        )}
      </div>
      <button
        className="px-8 py-3 bg-black text-white border border-[#444] hover:border-[#00f7ff] hover:shadow-[0_0_5px_#00f7ff] rounded-xl transition z-10"
        onClick={resetGame}
      >
        New Game
      </button>
      <WinnerModal winner={winner} onClose={closeModal} onRestart={resetGame} />
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes glow-pulse {
          0% { box-shadow: 0 0 5px #a3ff12; }
          50% { box-shadow: 0 0 20px #a3ff12; }
          100% { box-shadow: 0 0 5px #a3ff12; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes xo-rise {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        .animate-glow-pulse {
          animation: glow-pulse 1.5s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-xo-rise {
          animation-name: xo-rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}

// Winner check function
function getWinner(board) {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return null;
}