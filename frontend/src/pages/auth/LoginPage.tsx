import { useState, useEffect } from 'react';
import { Sun, Moon, Shield } from 'lucide-react';
import NetworkTopologyBackground from '../../components/NetworkTopologyBackground';
import { SlidingAuthCard } from '../../components/SlidingAuthCard';

export default function LoginPage() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  // Toggle Global Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-950 dark:bg-[#060408] transition-colors duration-1000 relative">
      
      {/* 3D WebGL Moving Background Component behind sign-in */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 transition-opacity duration-1000">
        <NetworkTopologyBackground />
      </div>
      
      {/* Dark / Light Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-30 p-3 rounded-2xl bg-white/10 dark:bg-black/40 backdrop-blur-xl shadow-xl border border-white/20 dark:border-white/10 text-slate-200 dark:text-slate-100 hover:scale-110 hover:bg-white/20 dark:hover:bg-white/20 transition-all duration-300 group"
        title="Toggle Theme"
      >
        {isDark ? <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />}
      </button>

      {/* Left branding panel (Static Vertical Image Card Showcase) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 relative z-10">
        
        {/* Top Company Title with Shining Animation */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/70 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
            <Shield size={14} className="text-slate-300" /> 
            <span className="shining-silver-text font-mono">Graphix TechHire Enterprise</span>
          </div>
        </div>

        {/* Center Showcase Pro Illustration */}
        <div className="flex flex-col items-center justify-center my-auto w-full relative">
          <div className="relative p-2 transition-all duration-500 hover:scale-105 group">
            <div className="relative flex items-center justify-center">
              <img 
                src="/careerhub-pro-sketch.jpg" 
                alt="CareerHub Pro" 
                className="w-48 sm:w-64 h-48 sm:h-64 object-cover rounded-3xl shadow-2xl border-4 border-slate-800 transition-all duration-500 group-hover:border-brand-500" 
              />
            </div>
          </div>
          
          {/* Renamed Official Company Title */}
          <div className="text-center max-w-sm mt-6">
            <h1 className="text-xl sm:text-2xl font-black leading-tight mb-1 text-white tracking-tight font-display shining-silver-text">
              Graphix Infotech Private Limited
            </h1>
            <p className="text-slate-300 text-xs leading-relaxed font-normal mt-1">
              Innovate | Build | Grow Together
            </p>
            <div className="inline-flex items-center gap-3 mt-3.5 px-4 py-1.5 rounded-full bg-white/10 text-[11px] text-slate-200 font-medium tracking-wide shadow-md">
              <span className="text-amber-400">✦</span>
              <span>Enterprise Placement Platform</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-4">
          <span>© 2026 Graphix Infotech Pvt Ltd.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right side: Compact Sliding Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-[560px] animate-fadeIn relative z-10 flex justify-center">
          <SlidingAuthCard />
        </div>
      </div>
    </div>
  );
}
