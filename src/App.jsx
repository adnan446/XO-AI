import { useState, useEffect } from "react";

// Winning combinations
const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// Confetti component
function Confetti() {
  const [confettiPieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: Math.random() * 6 + 3,
      color: ['#00f7ff', '#ff3ec9', '#a3ff12', '#ffffff', '#444444'][Math.floor(Math.random() * 5)],
      shape: Math.random() > 0.5 ? 'square' : 'circle'
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
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

// Floating particles for premium effect
function PremiumParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 8 + Math.random() * 4,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.2 + 0.1,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-gray-600 to-gray-400"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            animationName: 'float-around',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}

// Premium Winner Modal with advanced animations
function WinnerModal({ winner, onClose, onRestart }) {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (winner) {
      setTimeout(() => setShowContent(true), 200);
      setTimeout(() => setShowButtons(true), 600);
    } else {
      setShowContent(false);
      setShowButtons(false);
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-40 animate-fade-in backdrop-blur-lg p-4">
      {/* Floating particles */}
      <PremiumParticles />

      {/* Main modal container - responsive sizing */}
      <div className="relative bg-black border-2 border-gray-800 p-6 sm:p-8 md:p-12 rounded-3xl text-center backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.1)] animate-modal-entrance max-w-sm sm:max-w-md w-full mx-4">

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl animate-border-glow pointer-events-none" />

        {/* Content container */}
        <div className="relative z-10">

          {/* Crown and winner symbol */}
          <div className={`relative mb-6 sm:mb-8 ${showContent ? 'animate-winner-entrance' : 'opacity-0'}`}>
            {/* Floating crown */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-16 text-6xl sm:text-8xl animate-crown-float z-10">
              👑
            </div>

            {/* Winner symbol with premium styling */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 animate-spin-slow opacity-50 blur-sm" />

              {/* Inner winner circle */}
              <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-2xl border-4 border-gray-700">
                <span className="animate-winner-symbol">{winner}</span>
              </div>

              {/* Sparkle effects */}
              <div className="absolute -top-2 -right-2 text-white text-lg sm:text-2xl animate-sparkle-1">✨</div>
              <div className="absolute -bottom-2 -left-2 text-gray-300 text-base sm:text-xl animate-sparkle-2">⭐</div>
              <div className="absolute top-1/2 -left-4 text-gray-400 text-sm sm:text-lg animate-sparkle-3">💫</div>
            </div>
          </div>

          {/* Victory text */}
          <div className={`mb-6 sm:mb-10 ${showContent ? 'animate-text-entrance' : 'opacity-0'}`}>
            <h2 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3 sm:mb-4 animate-gradient-text">
              VICTORY!
            </h2>
            <div className="text-lg sm:text-2xl font-bold text-white mb-2 animate-pulse-gentle">
              🎉 {winner === 'X' ? 'You' : 'AI'} Conquered! 🎉
            </div>
            <p className="text-gray-400 text-base sm:text-lg font-light tracking-wide">
              {winner === 'X' ? 'Brilliantly played, champion!' : 'The AI claims victory this time!'}
            </p>
          </div>

          {/* Action button */}
          <div className={`flex justify-center ${showButtons ? 'animate-buttons-entrance' : 'opacity-0'}`}>
            <button
              onClick={onRestart}
              className="group relative px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-gray-800 to-black text-white font-bold rounded-2xl shadow-lg border-2 border-gray-700 hover:border-gray-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
                Play Again
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const result = getWinner(board);
  const winner = result?.winner;
  const winLine = result?.line || [];
  const isDraw = !winner && board.every(cell => cell);

  useEffect(() => {
    if (winner) {
      setShowWinnerModal(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [winner]);

  function handleClick(index) {
    if (board[index] || winner || !xTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setXTurn(false);

    setTimeout(() => {
      if (getWinner(newBoard) || newBoard.every(cell => cell)) {
        setXTurn(true);
        return;
      }

      const { move } = minimax(newBoard, true);
      if (move !== null) {
        const newBoardAfterAI = [...newBoard];
        newBoardAfterAI[move] = 'O';
        setBoard(newBoardAfterAI);
        setXTurn(true);
      }
    }, 300);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setXTurn(true);
    setShowWinnerModal(false);
    setShowConfetti(false);
  }

  function closeModal() {
    setShowWinnerModal(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 sm:gap-6 p-4 relative overflow-hidden">

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Title - responsive sizing */}
      <div className="text-center mb-2">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#00f7ff] drop-shadow-[0_0_10px_#00f7ff] tracking-widest z-10">XO-XO</h1>
        <p className="text-gray-500 text-sm sm:text-base">Neon Battle Edition</p>
      </div>

      {/* AI thinking indicator - premium style */}
      {!xTurn && !winner && !isDraw && (
        <div className="fixed top-4 right-4 z-50">
          <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-cyan-400/20 rounded-2xl blur-lg animate-pulse-glow" />
            
            {/* Main container */}
            <div className="relative bg-black/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-4 py-3 shadow-2xl">
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-400/30 animate-border-flow" />
              
              {/* Content */}
              <div className="relative flex items-center gap-3">
                {/* AI Brain Icon with animation */}
                <div className="relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center animate-brain-pulse">
                    <span className="text-xs sm:text-sm">🧠</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 to-cyan-400/50 rounded-lg blur animate-ping" />
                </div>
                
                {/* Text */}
                <div className="text-sm sm:text-base font-bold tracking-wide">
                  <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-shift">
                    AI is thinking
                  </span>
                  <span className="text-cyan-400 animate-dot-cascade ml-1">...</span>
                </div>
              </div>
              
              {/* Floating particles inside */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute top-2 left-3 w-1 h-1 bg-purple-400 rounded-full animate-float-1 opacity-60" />
                <div className="absolute top-4 right-5 w-1 h-1 bg-pink-400 rounded-full animate-float-2 opacity-40" />
                <div className="absolute bottom-3 left-6 w-1 h-1 bg-cyan-400 rounded-full animate-float-3 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Board - responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 shadow-2xl z-10 w-full max-w-xs sm:max-w-sm">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!!cell || !!winner || !xTurn}
            className={`
              aspect-square text-3xl sm:text-4xl md:text-5xl font-bold rounded-xl sm:rounded-2xl transition-all duration-300
              flex items-center justify-center border-2 select-none
              ${winLine.includes(i)
                ? 'bg-[#1a1a1a] border-[#a3ff12] text-[#a3ff12] animate-glow-pulse shadow-[0_0_20px_#a3ff12] scale-110'
                : cell
                  ? 'bg-[#1a1a1a] text-white border-[#333] shadow-inner'
                  : 'bg-black hover:bg-[#1c1c1c] active:bg-[#2a2a2a] text-gray-400 border-[#333] hover:shadow-[0_0_10px_#333] active:scale-95'
              }
              ${cell === 'X' ? 'text-[#00f7ff]' : cell === 'O' ? 'text-[#ff3ec9]' : ''}
            `}
            style={{ touchAction: 'manipulation' }}
          >
            <span className={cell ? 'animate-bounce-in' : ''}>{cell}</span>
          </button>
        ))}
      </div>

      {/* Status - mobile optimized */}
      <div className="text-lg sm:text-xl z-10 text-center px-4">
        {winner ? (
          <div className="text-[#a3ff12] font-semibold animate-pulse"></div>
        ) : isDraw ? (
          <div className="text-gray-400">It's a Draw!</div>
        ) : xTurn ? (
          <div className="text-[#00f7ff] font-semibold">Your Turn</div>
        ) : null}
      </div>

      {/* Reset Button - mobile friendly */}
      <button
        className="px-6 sm:px-8 py-2 sm:py-3 bg-black text-white border-2 border-[#333] rounded-xl hover:border-[#00f7ff] hover:shadow-[0_0_15px_#00f7ff] active:scale-95 transition-all duration-300 z-10 text-base sm:text-lg"
        onClick={resetGame}
        style={{ touchAction: 'manipulation' }}
      >
        New Game
      </button>

      {/* Winner Modal */}
      <WinnerModal winner={winner} onClose={closeModal} onRestart={resetGame} />

      {/* Enhanced Custom Styles */}
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
        @keyframes modal-entrance {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(2deg); opacity: 0.8; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes winner-entrance {
          0% { transform: translateY(-50px) scale(0.5); opacity: 0; }
          60% { transform: translateY(10px) scale(1.1); opacity: 0.8; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes text-entrance {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes buttons-entrance {
          0% { transform: translateY(30px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes crown-float {
          0%, 100% { transform: translateY(-10px) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes winner-symbol {
          0% { transform: scale(0) rotate(-180deg); }
          70% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes sparkle-1 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes sparkle-2 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          60% { opacity: 1; transform: scale(1) rotate(-180deg); }
        }
        @keyframes sparkle-3 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          40% { opacity: 1; transform: scale(1) rotate(360deg); }
        }
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes border-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255,255,255,0.1), 
                        inset 0 0 20px rgba(128,128,128,0.1); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(255,255,255,0.2), 
                        inset 0 0 20px rgba(128,128,128,0.2); 
          }
        }
        @keyframes float-around {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-15px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        @keyframes fade-in-slow {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes border-flow {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
        @keyframes brain-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes dot-cascade {
          0% { opacity: 1; }
          33% { opacity: 0.3; }
          66% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          50% { transform: translateY(-8px) translateX(4px); opacity: 0.2; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50% { transform: translateY(-6px) translateX(-3px); opacity: 0.8; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
          50% { transform: translateY(-5px) translateX(2px); opacity: 0.3; }
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
        .animate-modal-entrance {
          animation: modal-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-winner-entrance {
          animation: winner-entrance 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-text-entrance {
          animation: text-entrance 0.8s ease-out 0.3s both;
        }
        .animate-buttons-entrance {
          animation: buttons-entrance 0.6s ease-out 0.7s both;
        }
        .animate-crown-float {
          animation: crown-float 3s ease-in-out infinite;
        }
        .animate-winner-symbol {
          animation: winner-symbol 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }
        .animate-sparkle-1 {
          animation: sparkle-1 2s ease-in-out infinite;
        }
        .animate-sparkle-2 {
          animation: sparkle-2 2.5s ease-in-out infinite 0.5s;
        }
        .animate-sparkle-3 {
          animation: sparkle-3 3s ease-in-out infinite 1s;
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease-in-out infinite;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-border-glow {
          animation: border-glow 3s ease-in-out infinite;
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 1.2s ease-out forwards;
        }
        .animate-dot-blink::after {
          content: '';
          display: inline-block;
          width: 1ch;
          animation: dot-blink 1.2s infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-border-flow {
          animation: border-flow 2s ease-in-out infinite;
        }
        .animate-brain-pulse {
          animation: brain-pulse 1.5s ease-in-out infinite;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease-in-out infinite;
        }
        .animate-dot-cascade {
          animation: dot-cascade 1.5s ease-in-out infinite;
        }
        .animate-float-1 {
          animation: float-1 3s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 2.5s ease-in-out infinite 0.5s;
        }
        .animate-float-3 {
          animation: float-3 3.5s ease-in-out infinite 1s;
        }

        /* Disable text selection on game elements */
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Prevent zoom on double tap for iOS */
        button {
          touch-action: manipulation;
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

// Minimax AI function
function minimax(board, isMaximizing) {
  const result = getWinner(board);
  if (result?.winner === 'O') return { score: 1 };
  if (result?.winner === 'X') return { score: -1 };
  if (board.every(cell => cell)) return { score: 0 };

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = null;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const score = minimax(board, false).score;
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = null;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const score = minimax(board, true).score;
        board[i] = null;
        if (score < bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return { score: bestScore, move: bestMove };
  }
}