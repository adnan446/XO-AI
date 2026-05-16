import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./socket/socket";

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2"
      style={{ animation: "sketchSlideDown .25s ease-out" }}>
      <div className="bg-red-100 border-2 border-red-700 text-red-800 px-6 py-3 text-sm font-bold"
        style={{ fontFamily: '"Permanent Marker", cursive', transform: "rotate(-1deg)" }}>
        ✗ {message}
      </div>
    </div>
  );
}

// ── Doodle background ──────────────────────────────────────────────────────────
function PaperDoodles() {
  const doodles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      symbol: Math.random() > 0.5 ? "X" : "O",
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: `${Math.random() * 40 - 20}deg`,
      size: 24 + Math.random() * 28,
      opacity: 0.05 + Math.random() * 0.07,
    }))
  ).current;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {doodles.map((d) => (
        <div key={d.id} className="absolute select-none"
          style={{ top: d.top, left: d.left, fontSize: d.size, opacity: d.opacity,
            transform: `rotate(${d.rotate})`, fontFamily: '"Permanent Marker", cursive', color: "#3f3f46" }}>
          {d.symbol}
        </div>
      ))}
    </div>
  );
}

// ── Sketchy Button ─────────────────────────────────────────────────────────────
function SketchButton({ id, onClick, disabled, children, rotate = "rotate-1", variant = "dark" }) {
  const base = "relative px-6 py-3 w-full text-base font-bold border-2 border-zinc-800 transition-all duration-200 active:scale-95 disabled:opacity-40";
  const light = "bg-white/60 text-zinc-800 hover:bg-zinc-800 hover:text-white";
  const dark  = "bg-zinc-800 text-white hover:bg-zinc-700";
  return (
    <button id={id} onClick={onClick} disabled={disabled}
      className={`${base} ${variant === "dark" ? dark : light} ${rotate}`}
      style={{ fontFamily: '"Permanent Marker", cursive' }}>
      {children}
    </button>
  );
}

// ── Main Lobby ─────────────────────────────────────────────────────────────────
export default function MultiLobby() {
  const navigate = useNavigate();
  const [screen, setScreen]             = useState("menu");
  const [joinInput, setJoinInput]       = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [toast, setToast]               = useState(null);
  const [copied, setCopied]             = useState(false);
  const [createdLink, setCreatedLink]   = useState(null);
  const [createdRoomId, setCreatedRoomId] = useState(null);

  // Use a ref so game_start listener always has the latest roomId (fixes stale closure bug)
  const createdRoomIdRef = useRef(null);

  // ── Socket lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("room_created", ({ roomId, symbol }) => {
      const link = `${window.location.origin}/multi/${roomId}`;
      createdRoomIdRef.current = roomId;
      setCreatedRoomId(roomId);
      setCreatedLink(link);
      setIsLoading(false);
      sessionStorage.setItem("mySymbol", symbol);
      sessionStorage.setItem("roomId", roomId);
    });

    socket.on("joined_room", ({ roomId, symbol }) => {
      sessionStorage.setItem("mySymbol", symbol);
      sessionStorage.setItem("roomId", roomId);
      setIsLoading(false);
      navigate(`/multi/${roomId}`);
    });

    // FIX: Use ref so we always read the latest roomId, even after state updates
    socket.on("game_start", () => {
      const rid = createdRoomIdRef.current;
      if (rid) navigate(`/multi/${rid}`);
    });

    socket.on("error_message", (msg) => {
      setIsLoading(false);
      setToast(msg);
    });

    return () => {
      socket.off("room_created");
      socket.off("joined_room");
      socket.off("game_start");
      socket.off("error_message");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCreateRoom() {
    setIsLoading(true);
    socket.emit("create_room");
    setScreen("create");
  }

  function handleJoinRoom() {
    const raw = joinInput.trim();
    if (!raw) { setToast("Please enter a room code or link."); return; }
    const roomId = raw.includes("/") ? raw.split("/").pop().toUpperCase() : raw.toUpperCase();
    if (roomId.length !== 6) { setToast("Room code must be 6 characters."); return; }
    setIsLoading(true);
    socket.emit("join_room", roomId);
  }

  function handleCopyLink() {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 font-serif overflow-hidden"
      style={{ backgroundColor: "#f4f1ea" }}>
      <div className="fixed inset-0 pointer-events-none opacity-20 contrast-125 z-0"
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />
      <PaperDoodles />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="relative z-10 w-full max-w-xs sm:max-w-sm text-zinc-800">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter opacity-80"
            style={{ fontFamily: '"Permanent Marker", cursive' }}>
            Sketch XO
          </h1>
          <p className="text-xs sm:text-sm italic opacity-60 mt-1">Online Multiplayer</p>
        </header>

        {/* MENU */}
        {screen === "menu" && (
          <div className="flex flex-col gap-4" style={{ animation: "sketchFadeUp .3s ease-out" }}>
            <SketchButton id="btn-create-room" onClick={handleCreateRoom} disabled={isLoading} rotate="-rotate-1" variant="dark">
              ✦ Create Room
            </SketchButton>
            <SketchButton id="btn-join-room" onClick={() => setScreen("join")} rotate="rotate-1" variant="light">
              ↗ Join Room
            </SketchButton>
            <button onClick={() => window.history.back()}
              className="mt-2 text-xs italic opacity-50 hover:opacity-80 text-center transition"
              style={{ fontFamily: '"Permanent Marker", cursive' }}>
              ← back
            </button>
          </div>
        )}

        {/* CREATE */}
        {screen === "create" && (
          <div className="flex flex-col items-center gap-6" style={{ animation: "sketchFadeUp .3s ease-out" }}>
            {isLoading && !createdLink ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-transparent rounded-full animate-spin opacity-70" />
                <p className="text-sm italic opacity-60" style={{ fontFamily: '"Permanent Marker", cursive' }}>
                  Writing room code…
                </p>
              </div>
            ) : createdLink ? (
              <>
                <div className="w-full border-2 border-zinc-800 bg-white/60 p-5 flex flex-col gap-4"
                  style={{ transform: "rotate(-0.5deg)" }}>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Room Code</p>
                    <p className="text-4xl font-bold tracking-widest opacity-90"
                      style={{ fontFamily: '"Permanent Marker", cursive' }}>
                      {createdRoomId}
                    </p>
                  </div>
                  <div className="border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 font-mono break-all">
                    {createdLink}
                  </div>
                  <SketchButton id="btn-copy-link" onClick={handleCopyLink} rotate="rotate-0" variant={copied ? "light" : "dark"}>
                    {copied ? "✓ Copied!" : "⎘ Copy Link"}
                  </SketchButton>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                    <p className="text-sm italic opacity-70" style={{ fontFamily: '"Permanent Marker", cursive' }}>
                      Waiting for opponent…
                    </p>
                  </div>
                  <button id="btn-go-to-room" onClick={() => navigate(`/multi/${createdRoomId}`)}
                    className="text-xs italic opacity-40 hover:opacity-70 underline transition"
                    style={{ fontFamily: '"Permanent Marker", cursive' }}>
                    Go to game room →
                  </button>
                </div>
              </>
            ) : null}
            <button onClick={() => { setScreen("menu"); setCreatedLink(null); setCreatedRoomId(null); createdRoomIdRef.current = null; }}
              className="text-xs italic opacity-50 hover:opacity-80 transition"
              style={{ fontFamily: '"Permanent Marker", cursive' }}>
              ← back
            </button>
          </div>
        )}

        {/* JOIN */}
        {screen === "join" && (
          <div className="flex flex-col gap-5" style={{ animation: "sketchFadeUp .3s ease-out" }}>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest opacity-50"
                style={{ fontFamily: '"Permanent Marker", cursive' }}>
                Room Code or Link
              </label>
              <input id="input-join-room" type="text" value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                placeholder="e.g. A7X92K" autoFocus
                className="w-full bg-white/70 border-2 border-zinc-800 px-4 py-3 text-zinc-800 text-lg font-mono tracking-widest placeholder:text-zinc-400 placeholder:text-sm placeholder:font-sans outline-none transition-all hover:border-zinc-600 focus:bg-white"
                style={{ transform: "rotate(0.5deg)" }} />
            </div>
            <SketchButton id="btn-join-submit" onClick={handleJoinRoom} disabled={isLoading} rotate="-rotate-1" variant="dark">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Joining…
                </span>
              ) : "Join →"}
            </SketchButton>
            <button onClick={() => setScreen("menu")}
              className="text-xs italic opacity-50 hover:opacity-80 text-center transition"
              style={{ fontFamily: '"Permanent Marker", cursive' }}>
              ← back
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        body { touch-action: manipulation; }
        @keyframes sketchFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sketchSlideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
