import React from 'react';

const ModernBentoNinja = ({ gameOver, score, startGame }) => {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-200 font-sans p-6 md:p-12 flex items-center justify-center relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Branding & CTA */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-12">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              System Active
            </div>
            
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white">
              Gesture<br />
              <span className="text-slate-500 font-light">Ninja.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
              A computer-vision powered reflex engine. Master your hand-eye coordination.
            </p>
          </div>

          {gameOver && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 backdrop-blur-md">
              <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-1">Session Ended</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-light text-white tracking-tighter">{score}</span>
                <span className="text-slate-400">points</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={startGame}
              className="flex-1 py-5 px-8 rounded-full bg-slate-100 text-slate-900 font-semibold text-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
            >
              {gameOver ? 'Restart Session' : 'Initialize Game'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>

            <button 
              onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
              className="py-5 px-6 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center"
              title="Fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: The Rules Bento Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:pl-10">
          
          {/* Rule 1 */}
          <div className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-3xl p-8 flex flex-col justify-between aspect-square group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rule 01</p>
              <h3 className="text-xl font-medium text-white mb-2">Calibrate Sensor</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Raise your index finger to the camera to initialize and control the digital blade.</p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-3xl p-8 flex flex-col justify-between aspect-square group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rule 02</p>
              <h3 className="text-xl font-medium text-white mb-2">Engage Targets</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Perform rapid swiping motions across the screen to slice through active targets.</p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-3xl p-8 flex flex-col justify-between aspect-square group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rule 03</p>
              <h3 className="text-xl font-medium text-white mb-2">Avoid Drops</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Do not let targets fall off the screen. Missed targets will result in a penalty.</p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-3xl p-8 flex flex-col justify-between aspect-square group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Objective</p>
              <h3 className="text-xl font-medium text-white mb-2">Maximize Score</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Combine speed and accuracy. Chain multiple slices together for maximum points.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModernBentoNinja;