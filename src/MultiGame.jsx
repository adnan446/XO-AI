import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "./socket/socket";

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function getWinLine(board) {
  for (const [a,b,c] of WIN_PATTERNS) {
    if (board[a] && board[a]===board[b] && board[a]===board[c]) return [a,b,c];
  }
  return [];
}

// ── Paper doodle background ────────────────────────────────────────────────────
function PaperDoodles() {
  const doodles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      symbol: Math.random() > 0.5 ? "X" : "O",
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: `${Math.random() * 40 - 20}deg`,
      size: 22 + Math.random() * 24,
      opacity: 0.04 + Math.random() * 0.06,
    }))
  ).current;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {doodles.map((d) => (
        <div key={d.id} className="absolute select-none"
          style={{ top:d.top, left:d.left, fontSize:d.size, opacity:d.opacity,
            transform:`rotate(${d.rotate})`, fontFamily:'"Permanent Marker",cursive', color:"#3f3f46" }}>
          {d.symbol}
        </div>
      ))}
    </div>
  );
}

// ── Sketchy cell ───────────────────────────────────────────────────────────────
function Cell({ value, index, onClick, isWin, canClick, isOldest }) {
  return (
    <button
      id={`cell-${index}`}
      onClick={onClick}
      disabled={!canClick || !!value}
      className={`relative aspect-square flex items-center justify-center transition-all duration-700 touch-manipulation ${isOldest ? 'opacity-20 scale-90' : 'opacity-100'}`}
      style={{
        fontFamily: '"Permanent Marker", cursive',
        fontSize: "clamp(2.5rem, 10vw, 3.5rem)",
        background: isWin ? "rgba(234,179,8,0.2)" : "transparent",
        borderRadius: isWin ? "9999px" : undefined,
        cursor: canClick && !value ? "pointer" : "default",
      }}
    >
      {value && (
        <span
          className={`transform ${isWin ? "scale-110" : "scale-100"} ${value==="X" ? "rotate-3" : "-rotate-2"}`}
          style={{ animation: "sketchBounce .35s ease-out" }}
        >
          {value}
        </span>
      )}
      {!value && canClick && (
        <span className="absolute inset-2 rounded-full opacity-0 hover:opacity-10 bg-zinc-800 transition-opacity duration-150" />
      )}
    </button>
  );
}

// ── Main Game ──────────────────────────────────────────────────────────────────
export default function MultiGame() {
  const { roomId } = useParams();
  const navigate   = useNavigate();

  const [phase, setPhase]         = useState("connecting");
  const [board, setBoard]         = useState(Array(9).fill(null));
  const [moves, setMoves]         = useState({ X: [], O: [] });
  const [turn, setTurn]           = useState("X");
  const [mySymbol, setMySymbol]   = useState(null);
  const [winner, setWinner]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [copied, setCopied]       = useState(false);

  // Keep refs so socket callbacks always have fresh values
  const mySymbolRef = useRef(null);
  const phaseRef    = useRef("connecting");
  const hasJoinedRef = useRef(false);

  function updatePhase(p) { phaseRef.current = p; setPhase(p); }
  function updateSymbol(s) { mySymbolRef.current = s; setMySymbol(s); }

  const winLine    = getWinLine(board);
  const isMyTurn   = phase === "playing" && turn === mySymbol;
  const inviteLink = `${window.location.origin}/multi/${roomId}`;

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (!hasJoinedRef.current) {
      hasJoinedRef.current = true;
      const savedSymbol = sessionStorage.getItem("mySymbol");
      const savedRoom   = sessionStorage.getItem("roomId");

      if (savedRoom === roomId && savedSymbol) {
        // Came from lobby — rejoin so server re-registers our new socket ID
        // and sends back current board state (fixes the stuck-on-waiting race condition)
        updateSymbol(savedSymbol);
        socket.emit("rejoin_room", { roomId, symbol: savedSymbol });
      } else {
        // Direct URL access — try to join as O
        socket.emit("join_room", roomId);
      }
    }

    // Server response to get_room_state — syncs board/phase on mount
    socket.on("room_state", ({ board: b, moves: m, turn: t, winner: w, playerCount, mySymbol: sym }) => {
      setBoard(b);
      setMoves(m);
      setTurn(t);
      if (sym) updateSymbol(sym);
      if (w) {
        setWinner(w);
        updatePhase("gameover");
      } else if (playerCount === 2) {
        updatePhase("playing");
      } else {
        updatePhase("waiting");
      }
    });

    socket.on("joined_room", ({ symbol }) => {
      updateSymbol(symbol);
      sessionStorage.setItem("mySymbol", symbol);
      sessionStorage.setItem("roomId", roomId);
      updatePhase("waiting");
    });

    // game_start fires for BOTH players — always transition to playing
    socket.on("game_start", ({ board: b, moves: m, turn: t }) => {
      setBoard(b);
      setMoves(m);
      setTurn(t);
      setWinner(null);
      updatePhase("playing");
    });

    socket.on("receive_move", ({ board: b, moves: m, turn: t }) => {
      setBoard(b);
      setMoves(m);
      setTurn(t);
    });

    socket.on("game_over", ({ board: b, moves: m, winner: w }) => {
      setBoard(b);
      setMoves(m);
      setWinner(w);
      updatePhase("gameover");
    });

    socket.on("player_left", () => {
      // Only show disconnect if game was in progress
      if (phaseRef.current !== "gameover") {
        updatePhase("disconnected");
      }
    });

    socket.on("player_rejoined", () => {
      // Recover from disconnect if opponent refreshes their page
      if (phaseRef.current === "disconnected") {
        updatePhase("playing");
      }
    });

    socket.on("error_message", (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 4000);
    });

    return () => {
      socket.off("room_state");
      socket.off("joined_room");
      socket.off("game_start");
      socket.off("receive_move");
      socket.off("game_over");
      socket.off("player_left");
      socket.off("player_rejoined");
      socket.off("error_message");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const handleCellClick = useCallback((index) => {
    if (!isMyTurn || board[index] || phase !== "playing") return;
    socket.emit("make_move", { roomId, index });
  }, [isMyTurn, board, phase, roomId]);

  function handleRematch() {
    // Both players will receive game_start — no need to set phase here,
    // game_start handler will set it to "playing" for both sides
    socket.emit("request_rematch", roomId);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function goBack() {
    sessionStorage.clear();
    navigate("/multiplayer");
  }

  // ── Status text ──────────────────────────────────────────────────────────
  function getStatus() {
    if (phase === "connecting")   return "Connecting…";
    if (phase === "waiting")      return "Waiting for opponent…";
    if (phase === "disconnected") return "Opponent left the game.";
    if (phase === "gameover") {
      if (winner === "draw") return "It's a Draw!";
      return winner === mySymbol ? "You Won! ✓" : "You Lost…";
    }
    return isMyTurn ? `Your turn (${mySymbol})` : `Opponent's turn (${turn})`;
  }

  const statusText = getStatus();
  const isWinState = phase === "gameover" && winner && winner !== "draw" && winner === mySymbol;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 font-serif overflow-hidden"
      style={{ backgroundColor: "#f4f1ea" }}>
      {/* Paper texture */}
      <div className="fixed inset-0 pointer-events-none opacity-20 contrast-125 z-0"
        style={{ backgroundImage:`url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />
      <PaperDoodles />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-100 border-2 border-red-700 text-red-800 px-6 py-3 text-sm font-bold"
          style={{ fontFamily:'"Permanent Marker",cursive', transform:"rotate(-1deg)" }}>
          ✗ {toast}
        </div>
      )}

      <div className="relative z-10 w-full max-w-xs sm:max-w-sm text-zinc-800">

        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter opacity-80"
            style={{ fontFamily:'"Permanent Marker",cursive' }}>
            Sketch XO
          </h1>
          <p className="text-xs sm:text-sm italic opacity-60">The ink fades every 3 moves...</p>
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <p className="text-xs italic opacity-50">Room #{roomId}</p>
            {mySymbol && (
              <span className="text-xs border border-zinc-500 px-2 py-0.5 opacity-60 italic"
                style={{ fontFamily:'"Permanent Marker",cursive' }}>
                You = {mySymbol}
              </span>
            )}
          </div>
        </header>

        {/* Online badge */}
        <div className="flex justify-center mb-6">
          <div className="relative flex border-2 border-zinc-800 p-1 rotate-1 bg-white/50">
            <span className="px-4 py-1 text-sm bg-zinc-800 text-white"
              style={{ fontFamily:'"Permanent Marker",cursive' }}>
              Online
            </span>
          </div>
        </div>

        {/* Board */}
        <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-none">
          <div className="grid grid-cols-3 p-2 h-full">
            {/* Hand-drawn grid lines */}
            <div className="absolute inset-0 flex justify-evenly pointer-events-none">
              <div className="w-0.5 sm:w-1 bg-zinc-800/80 rounded-full h-full transform -rotate-1 translate-x-1" />
              <div className="w-0.5 sm:w-1 bg-zinc-800/80 rounded-full h-full transform rotate-2 -translate-x-1" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none">
              <div className="h-0.5 sm:h-1 bg-zinc-800/80 rounded-full w-full transform rotate-1 translate-y-1" />
              <div className="h-0.5 sm:h-1 bg-zinc-800/80 rounded-full w-full transform -rotate-1 -translate-y-1" />
            </div>

            {board.map((cell, i) => {
              const isOldest = !winner && moves && (
                (turn === "X" && moves["X"] && moves["X"][0] === i && moves["X"].length === 3) ||
                (turn === "O" && moves["O"] && moves["O"][0] === i && moves["O"].length === 3)
              );

              return (
                <Cell
                  key={i}
                  value={cell}
                  index={i}
                  onClick={() => handleCellClick(i)}
                  isWin={winLine.includes(i)}
                  canClick={isMyTurn && phase === "playing"}
                  isOldest={isOldest}
                />
              );
            })}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="mt-8 sm:mt-10 text-center min-h-[110px]">
          <p className="text-lg sm:text-xl italic opacity-70 mb-4"
            style={{ fontFamily:'"Permanent Marker",cursive' }}>
            {statusText}
          </p>

          {/* WAITING — show invite link */}
          {phase === "waiting" && (
            <div className="flex flex-col gap-3" style={{ animation:"sketchFadeUp .3s ease-out" }}>
              <div className="border border-zinc-300 bg-white/50 px-3 py-2 text-xs text-zinc-400 font-mono break-all">
                {inviteLink}
              </div>
              <button onClick={handleCopyLink}
                className={`border-2 border-zinc-800 px-6 py-1.5 text-sm font-bold rotate-1 transition-all active:scale-95 ${
                  copied ? "bg-zinc-800 text-white" : "bg-white/60 hover:bg-zinc-800 hover:text-white"
                }`}
                style={{ fontFamily:'"Permanent Marker",cursive' }}>
                {copied ? "✓ Copied!" : "⎘ Copy Invite Link"}
              </button>
            </div>
          )}

          {/* GAME OVER */}
          {phase === "gameover" && (
            <div className="space-y-3" style={{ animation:"sketchFadeUp .3s ease-out" }}>
              <p className={`text-xl font-bold italic underline decoration-wavy ${
                winner === "draw" ? "decoration-zinc-500" : isWinState ? "decoration-green-600" : "decoration-red-500"
              }`} style={{ fontFamily:'"Permanent Marker",cursive' }}>
                {winner === "draw" ? "Nobody wins this time!" : isWinState ? "Brilliant! ✓" : "Better luck next time."}
              </p>
              <div className="flex flex-col gap-2">
                <button id="btn-rematch" onClick={handleRematch}
                  className="border-2 border-zinc-800 px-6 py-1.5 text-base font-bold bg-zinc-800 text-white -rotate-1 hover:bg-zinc-700 transition active:scale-95"
                  style={{ fontFamily:'"Permanent Marker",cursive' }}>
                  ↺ Rematch
                </button>
                <button onClick={goBack}
                  className="border-2 border-zinc-800 px-6 py-1.5 text-sm italic opacity-60 hover:opacity-90 rotate-1 transition active:scale-95"
                  style={{ fontFamily:'"Permanent Marker",cursive' }}>
                  ← Back to Lobby
                </button>
              </div>
            </div>
          )}

          {/* DISCONNECTED */}
          {phase === "disconnected" && (
            <div style={{ animation:"sketchFadeUp .3s ease-out" }}>
              <button onClick={goBack}
                className="border-2 border-zinc-800 px-6 py-1.5 text-base font-bold bg-zinc-800 text-white rotate-1 hover:bg-zinc-700 transition active:scale-95"
                style={{ fontFamily:'"Permanent Marker",cursive' }}>
                ← Back to Lobby
              </button>
            </div>
          )}

          {/* Leave during play */}
          {(phase === "playing" || phase === "connecting") && (
            <button onClick={goBack}
              className="text-xs italic opacity-30 hover:opacity-60 mt-4 transition block mx-auto"
              style={{ fontFamily:'"Permanent Marker",cursive' }}>
              leave game
            </button>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        body { touch-action: manipulation; }
        @keyframes sketchBounce {
          0%   { transform: scale(0) rotate(0); opacity:0; }
          60%  { transform: scale(1.15); opacity:1; }
          100% { transform: scale(1); opacity:1; }
        }
        @keyframes sketchFadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
