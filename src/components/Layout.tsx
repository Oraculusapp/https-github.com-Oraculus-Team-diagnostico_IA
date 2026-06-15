
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Home, BarChart3, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-cyan-500/30">
      <header className="sticky top-0 z-50 h-20 w-full border-b border-white/5 bg-[--background]/80 backdrop-blur-xl">
        <div className="container mx-auto px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <img 
              src="https://www.actualinternet.com/propuestas/logo-actualinternet-2026.jpg" 
              alt="Actual Internet Logo" 
              className="h-9 w-auto object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            <Link 
              to="/" 
              className={cn("hover:text-white transition-all hover:tracking-[0.3em]", location.pathname === "/" && "text-white")}
            >
              Inicio
            </Link>
            <Link 
              to="/survey" 
              className={cn("hover:text-white transition-all hover:tracking-[0.3em]", location.pathname === "/survey" && "text-white")}
            >
              Diagnóstico
            </Link>
            <Link 
              to="/admin" 
              className={cn("hover:text-white transition-all hover:tracking-[0.3em]", location.pathname === "/admin" && "text-white")}
            >
              Admin
            </Link>
          </nav>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
              <span className="text-[10px] font-black tracking-widest text-slate-400">STATUS: ON</span>
            </div>
            <Link 
              to="/survey" 
              className="px-6 py-3 bg-white hover:bg-sky-400 text-slate-950 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-white/5"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="h-12 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span>Actual Internet © {new Date().getFullYear()}</span>
          <span className="hidden md:block text-slate-600">Región: europe-southwest1</span>
          <span className="text-primary font-bold">Cumplimiento RGPD Activo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>Gemini 1.5 Flash Conectado</span>
        </div>
      </footer>
    </div>
  );
};
