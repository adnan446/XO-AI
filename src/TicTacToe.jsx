import React, { useState, useEffect, useCallback } from "react";

// --- Configuration ---
const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const PLAYER_X = "X";
const PLAYER_O = "O";
const MAX_DEPTH = 6;

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [moves, setMoves] = useState({ [PLAYER_X]: [], [PLAYER_O]: [] });
  const [turn, setTurn] = useState(PLAYER_X);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  // New State: 'ai' or 'multiplayer'
  const [gameMode, setGameMode] = useState("ai");

  // --- Logic: Win Detection ---
  const findWinningLine = useCallback((currentBoard) => {
    for (const pattern of WIN_PATTERNS) {
      const [a, b, c] = pattern;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: pattern };
      }
    }
    return null;
  }, []);

  // --- Logic: Reset Game ---
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setMoves({ [PLAYER_X]: [], [PLAYER_O]: [] });
    setTurn(PLAYER_X);
    setWinner(null);
    setWinningLine([]);
    setIsAiThinking(false);
  };

  // --- Logic: Move Execution ---
  const executeMove = useCallback((index, player) => {
    if (board[index] || winner) return;

    setBoard((prevBoard) => {
      const nextBoard = [...prevBoard];
      const playerMoves = [...moves[player], index];
      nextBoard[index] = player;

      if (playerMoves.length > 3) {
        const oldestIndex = playerMoves.shift();
        nextBoard[oldestIndex] = null;
      }

      setMoves(prev => ({ ...prev, [player]: playerMoves }));

      const winResult = findWinningLine(nextBoard);
      if (winResult) {
        setWinner(winResult.winner);
        setWinningLine(winResult.line);
      } else {
        setTurn(player === PLAYER_X ? PLAYER_O : PLAYER_X);
      }
      return nextBoard;
    });
  }, [board, moves, winner, findWinningLine]);

  // --- AI Logic (Minimax) ---
  const minimax = (tempBoard, tempMoves, depth, isMaximizing) => {
    const winResult = findWinningLine(tempBoard);
    if (winResult?.winner === PLAYER_O) return 10 - depth;
    if (winResult?.winner === PLAYER_X) return depth - 10;
    if (depth >= MAX_DEPTH) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
      if (!tempBoard[i]) {
        const nextB = [...tempBoard];
        const nextM = {
          [PLAYER_X]: [...tempMoves[PLAYER_X]],
          [PLAYER_O]: [...tempMoves[PLAYER_O]]
        };
        const activePlayer = isMaximizing ? PLAYER_O : PLAYER_X;

        nextM[activePlayer].push(i);
        nextB[i] = activePlayer;

        if (nextM[activePlayer].length > 3) {
          const oldest = nextM[activePlayer].shift();
          nextB[oldest] = null;
        }

        const res = minimax(nextB, nextM, depth + 1, !isMaximizing);
        bestScore = isMaximizing ? Math.max(res, bestScore) : Math.min(res, bestScore);
      }
    }
    return bestScore;
  };

  // --- Effect: AI Turn Trigger ---
  useEffect(() => {
    // Only trigger if it's O's turn AND mode is AI
    if (gameMode === "ai" && turn === PLAYER_O && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
          if (!board[i]) {
            const nextB = [...board];
            const nextM = { [PLAYER_X]: [...moves[PLAYER_X]], [PLAYER_O]: [...moves[PLAYER_O], i] };
            nextB[i] = PLAYER_O;
            if (nextM[PLAYER_O].length > 3) nextB[nextM[PLAYER_O].shift()] = null;
            const score = minimax(nextB, nextM, 0, false);
            if (score > bestScore) {
              bestScore = score;
              move = i;
            }
          }
        }
        if (move !== -1) executeMove(move, PLAYER_O);
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, winner, board, moves, gameMode, executeMove]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f1ea] p-4 sm:p-6 font-serif overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20 contrast-125"
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />

      <div className="relative w-full max-w-xs sm:max-w-sm text-zinc-800">
        <header className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter opacity-80" style={{ fontFamily: '"Permanent Marker", cursive' }}>
            Sketch XO
          </h1>
          <p className="text-xs sm:text-sm italic opacity-60">The ink fades every 3 moves...</p>
        </header>

        {/* --- Mode Toggle --- */}
        <div className="flex justify-center mb-8">
          <div className="relative flex border-2 border-zinc-800 p-1 rotate-1 bg-white/50">
            <button 
              onClick={() => { setGameMode("ai"); resetGame(); }}
              className={`px-4 py-1 text-sm transition-colors ${gameMode === 'ai' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-200'}`}
            >
              AI
            </button>
            <button 
              onClick={() => { setGameMode("multiplayer"); resetGame(); }}
              className={`px-4 py-1 text-sm transition-colors ${gameMode === 'multiplayer' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-200'}`}
            >
              Multi
            </button>
          </div>
        </div>

        {/* The Grid */}
        <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-none">
          <div className="grid grid-cols-3 p-2 h-full">
            {/* Hand-drawn Grid Lines */}
            <div className="absolute inset-0 flex justify-evenly pointer-events-none">
              <div className="w-0.5 sm:w-1 bg-zinc-800/80 rounded-full h-full transform -rotate-1 translate-x-1" />
              <div className="w-0.5 sm:w-1 bg-zinc-800/80 rounded-full h-full transform rotate-2 -translate-x-1" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none">
              <div className="h-0.5 sm:h-1 bg-zinc-800/80 rounded-full w-full transform rotate-1 translate-y-1" />
              <div className="h-0.5 sm:h-1 bg-zinc-800/80 rounded-full w-full transform -rotate-1 -translate-y-1" />
            </div>

            {board.map((cell, i) => {
              const isWinningTile = winningLine.includes(i);
              const isOldest = !winner && (
                (turn === PLAYER_X && moves[PLAYER_X][0] === i && moves[PLAYER_X].length === 3) ||
                (turn === PLAYER_O && moves[PLAYER_O][0] === i && moves[PLAYER_O].length === 3)
              );

              return (
                <button
                  key={i}
                  disabled={!!cell || !!winner || (gameMode === 'ai' && isAiThinking)}
                  onClick={() => executeMove(i, turn)}
                  className={`
                    relative aspect-square flex items-center justify-center text-5xl sm:text-6xl transition-all duration-700
                    ${isOldest ? 'opacity-20 scale-90' : 'opacity-100'}
                    ${isWinningTile ? 'bg-yellow-400/30 rounded-full' : ''}
                    touch-manipulation
                  `}
                  style={{ fontFamily: '"Permanent Marker", cursive' }}
                >
                  {cell && (
                    <span className={`transform ${isWinningTile ? 'scale-110 sm:scale-125' : 'scale-100'} ${cell === 'X' ? 'rotate-3' : '-rotate-2'}`}>
                      {cell}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-8 sm:mt-12 text-center min-h-[80px]">
          {winner ? (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <p className="text-xl sm:text-2xl font-bold italic underline decoration-wavy decoration-red-500">
                {gameMode === 'ai' 
                  ? (winner === PLAYER_X ? "You Won!" : "AI Wins!") 
                  : `Player ${winner} Wins!`}
              </p>
              <button
                onClick={resetGame}
                className="text-base sm:text-lg border-2 border-zinc-800 px-6 py-1 hover:bg-zinc-800 hover:text-white transition-colors rotate-1 active:scale-95"
              >
                Tear page & Restart
              </button>
            </div>
          ) : (
            <p className="text-lg sm:text-xl italic opacity-70">
              {isAiThinking ? "AI is sketching..." : `${turn}'s turn`}
            </p>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        body { touch-action: manipulation; }
      `}} />
    </div>
  );
}