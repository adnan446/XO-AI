import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const floatingXO = Array.from({ length: 90 }, (_, i) => {
    const isX = Math.random() > 0.5;
    return {
      key: `xo-${i}`,
      content: isX ? 'X' : 'O',
      color: isX ? 'text-pink-400' : 'text-cyan-400',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: `${Math.random() * 360}deg`,
      duration: `${6 + Math.random() * 4}s`,
      delay: `${Math.random() * 4}s`,
    };
  });

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden px-4">
      {/* Floating XO Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {floatingXO.map((xo) => (
          <div
            key={xo.key}
            className={`absolute text-3xl sm:text-4xl font-bold opacity-20 animate-blink select-none ${xo.color}`}
            style={{
              top: xo.top,
              left: xo.left,
              transform: `rotate(${xo.rotate})`,
              animation: `floatXO ${xo.duration} ease-in-out infinite, blink 2s infinite`,
              animationDelay: `${xo.delay}, ${xo.delay}`,
            }}
          >
            {xo.content}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm bg-[#0a0a0a] border border-gray-800 rounded-3xl shadow-xl p-6 sm:p-10 space-y-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wider glow-text">
          XO-AI
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">Choose your game mode</p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 sm:gap-5 items-center mt-15">
          <button
            onClick={() => navigate('/multiplayer')}
            className="px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold text-white border border-pink-500 rounded-full bg-black hover:bg-pink-500/20 hover:shadow-pink-500 transition-all duration-300 w-40 sm:w-48"
          >
            Multiplayer
          </button>
          <button
            onClick={() => navigate('/withai')}
            className="px-5 sm:px-6 py-3 text-sm sm:text-base font-semibold text-white border border-cyan-400 rounded-full bg-black hover:bg-cyan-400/20 hover:shadow-cyan-400 transition-all duration-300 w-40 sm:w-48"
          >
            Play with AI
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes floatXO {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
          100% {
            transform: translateY(0px) rotate(360deg);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            text-shadow: 0 0 5px #0ff, 0 0 15px #f0f, 0 0 30px #0ff;
          }
          50% {
            text-shadow: 0 0 10px #f0f, 0 0 25px #0ff, 0 0 45px #f0f;
          }
        }

        .glow-text {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        /* Extra Responsive Tweaks */

        /* Very small devices: smaller title and buttons */
        @media (max-width: 360px) {
          h1.glow-text {
            font-size: 2.5rem !important; /* ~ text-3xl */
          }
          button {
            width: 140px !important;
            font-size: 0.8rem !important;
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
        }

        /* Tablets: increase padding and spacing */
        @media (min-width: 640px) and (max-width: 1023px) {
          div.relative.z-10 {
            padding: 3rem !important; /* more padding on tablets */
          }
          div.flex.flex-col.gap-4 {
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
