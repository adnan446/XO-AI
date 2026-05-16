import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const floatingXO = Array.from({ length: 40 }, (_, i) => {
    const isX = Math.random() > 0.5;
    return {
      key: `xo-${i}`,
      content: isX ? 'X' : 'O',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: `${Math.random() * 40 - 20}deg`,
      size: `${1.5 + Math.random() * 2}rem`,
      opacity: 0.05 + Math.random() * 0.1,
    };
  });

  const modes = [
    {
      title: "Multiplayer",
      desc: "Battle online with friends",
      path: "/multiplayer",
      icon: "⚔️",
      color: "bg-yellow-100",
      border: "border-zinc-800",
    },
    {
      title: "Play with AI",
      desc: "Challenge the smart bot",
      path: "/withai",
      icon: "🤖",
      color: "bg-cyan-100",
      border: "border-zinc-800",
    },
    {
      title: "Sketch Mode",
      desc: "Classic hand-drawn ink",
      path: "/sketch",
      icon: "✎",
      color: "bg-rose-100",
      border: "border-zinc-800",
    },
    {
      title: "Shooting Game",
      desc: "Action packed shooter",
      path: "/shooter",
      icon: "🎯",
      color: "bg-emerald-100",
      border: "border-zinc-800",
      hideOnMobile: true,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#f4f1ea] flex flex-col items-center justify-center overflow-hidden px-4 font-serif">
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 contrast-125 z-0"
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />

      {/* Floating Elements (Doodles) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {floatingXO.map((xo) => (
          <div
            key={xo.key}
            className="absolute font-bold text-zinc-800 select-none"
            style={{
              top: xo.top,
              left: xo.left,
              fontSize: xo.size,
              opacity: xo.opacity,
              transform: `rotate(${xo.rotate})`,
              fontFamily: '"Permanent Marker", cursive',
            }}
          >
            {xo.content}
          </div>
        ))}
      </div>

      {/* Main Hub */}
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-block px-4 py-1 border-2 border-zinc-800 bg-white/80 rotate-1 text-xs font-bold text-zinc-800 uppercase mb-2"
            style={{ fontFamily: '"Permanent Marker", cursive' }}>
            Main Menu
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold text-zinc-800 tracking-tighter"
            style={{ fontFamily: '"Permanent Marker", cursive' }}>
            Sketch XO
          </h1>
          <p className="text-zinc-600 text-lg italic mt-2">
            Select a mode to play
          </p>
          <div className="w-40 h-1 bg-zinc-800 mx-auto mt-2 rounded-full opacity-70" />
        </div>

        {/* Grid of Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {modes.map((mode, i) => (
            <div
              key={mode.path}
              onClick={() => navigate(mode.path)}
              className={`group relative overflow-hidden ${mode.color} border-2 border-zinc-800 p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95 flex flex-col justify-between h-40 ${mode.hideOnMobile ? 'hidden md:flex' : ''}`}
              style={{ 
                transform: `rotate(${i % 2 === 0 ? '-1deg' : '1deg'})`,
                boxShadow: "4px 4px 0px 0px #27272a"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-4xl">{mode.icon}</div>
                <div className="text-sm font-bold text-zinc-500" style={{ fontFamily: '"Permanent Marker", cursive' }}>
                  #{i + 1}
                </div>
              </div>

              <div className="mt-auto">
                <h2 className="text-2xl font-bold text-zinc-800 flex items-center gap-2" style={{ fontFamily: '"Permanent Marker", cursive' }}>
                  {mode.title}
                </h2>
                <p className="text-sm text-zinc-600 italic mt-1">{mode.desc}</p>
              </div>

              {/* Hand-drawn look underline on hover */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-zinc-800 transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-xs text-zinc-500 font-serif">
          <p className="italic">"The ink fades every 3 moves..."</p>
          <p className="mt-1">© 2026 XO Games</p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        body {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  );
}
