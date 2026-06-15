
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BrainCircuit, Rocket, ShieldCheck, Zap, ArrowRight, BarChart } from 'lucide-react';
import { Button } from '../components/ui/button';

export const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero BG Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent blur-3xl -z-10" />
      
      <section className="container mx-auto px-4 pt-32 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sky-400 text-[11px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Actual Internet V3.2.5 • Diagnóstico IA Empresarial
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-[-0.04em] mb-12 max-w-5xl leading-[0.95] text-white uppercase text-balance"
        >
          Tu negocio con <span className="text-primary italic">el mejor</span> diagnóstico IA
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-300/80 max-w-3xl mb-16 leading-relaxed font-medium text-balance"
        >
          Analizamos la situación actual de tu negocio en 3 minutos y generamos una hoja de ruta a tu correo con el <span className="text-white font-bold underline decoration-primary/30 underline-offset-4">potencial de crecimiento gracias a la implementación de soluciones IA</span> mediante Gemini.
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="flex flex-col sm:flex-row gap-6"
        >
          <Button asChild size="lg" className="rounded-2xl px-12 py-8 text-sm h-auto font-black uppercase tracking-[0.2em] bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-2xl shadow-sky-500/10 glow-button border-none">
            <Link to="/survey" className="flex items-center gap-4">
              Iniciar Diagnóstico
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-2xl px-12 py-8 text-sm h-auto border-white/20 hover:bg-white/5 text-white font-black uppercase tracking-[0.2em] transition-all">
            Ver Metodología
          </Button>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BarChart className="w-6 h-6 text-primary" />}
            title="37 KPIs de Negocio"
            description="Evaluación profunda de procesos, datos, cultura y stack tecnológico actual."
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6 text-indigo-400" />}
            title="Analizador Gemini 1.5"
            description="Motor de IA avanzado que detecta ineficiencias y propone agentes específicos."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
            title="Certificado RGPD"
            description="Procesamiento seguro de datos corporativos bajo estándares europeos de privacidad."
          />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800 rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center flex flex-col items-center backdrop-blur-sm">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
            <h2 className="text-3xl md:text-5xl font-black mb-8 max-w-3xl tracking-tight leading-[1] text-white">¿Lideras o sigues? Toma el control de tu digitalización.</h2>
            <p className="text-slate-400 mb-14 max-w-xl text-lg font-medium leading-relaxed">
              El informe incluye ahorro anual estimado, reducción de FTEs y recomendación de agentes IA específicos por área.
            </p>
            <Button asChild size="lg" className="rounded-2xl px-12 py-8 text-sm h-auto font-black uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-2xl">
              <Link to="/survey">Empezar Ahora</Link>
            </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="sleek-card p-10 flex flex-col gap-6 hover:-translate-y-2 group bg-slate-900/20 border-slate-800/50">
    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5 shadow-inner group-hover:border-primary/30 transition-all duration-500">
      {icon}
    </div>
    <div>
      <h3 className="label-caps mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm font-medium">{description}</p>
    </div>
  </div>
);
