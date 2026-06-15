
import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSurvey } from '../context/SurveyContext';
import { CATEGORIES } from '../data/survey';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingDown, TrendingUp, Clock, Euro, Users, 
  Download, RefreshCcw, Bot as BotIcon, BrainCircuit, Sparkles, FileText,
  Zap, BarChart2, Check
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Simple utility for tailwind classes
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

import ReactMarkdown from 'react-markdown';

export const Results = () => {
  const { leadData, resetSurvey } = useSurvey();
  const reportRef = useRef<HTMLDivElement>(null);

  if (!leadData || !leadData.scores || !leadData.ahorro) {
    return (
      <div className="container mx-auto px-4 py-32 text-center bg-slate-950 min-h-screen flex flex-col items-center justify-center">
        <motion.div
           animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity }}
        >
          <BotIcon className="w-20 h-20 text-primary/20 mb-8" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">Esperando tu diagnóstico...</h2>
        <p className="text-slate-500 mb-12 max-w-sm mx-auto font-medium">Si has llegado aquí directamente, primero debes completar el cuestionario de madurez tecnológica.</p>
        <Button asChild className="bg-primary text-slate-950 font-black h-16 rounded-2xl px-12 uppercase tracking-widest text-xs hover:scale-105 transition-transform">
           <Link to="/survey">Comenzar Cuestionario</Link>
        </Button>
      </div>
    );
  }

  const scores = leadData.scores;
  const globalScore = scores.global || 0;
  const ahorro = leadData.ahorro;

  // Benchmarking Data
  const industryAvg = 45; // Average score for SME sector
  const benchmarkData = [
    { name: 'Tu Empresa', score: globalScore, fill: '#38bdf8' },
    { name: 'Mediana Sector', score: industryAvg, fill: 'rgba(255,255,255,0.1)' },
    { name: 'Top 10%', score: 85, fill: 'rgba(255,255,255,0.05)' },
  ];

  // Specific Insights based on answers
  const getInsights = () => {
    const insights = [];
    const resp = leadData.respuestas || {};
    
    // Website Insight
    if (resp['Q13'] === 'No tenemos web' || resp['Q13'] === 'Tenemos una web básica') {
      insights.push({
        title: "Oportunidad de Captación",
        desc: "Tu presencia web es limitada. Una Landing IA multiplicaría tus leads.",
        impact: "Alto",
        color: "text-rose-400"
      });
    }

    // Social Media Insight
    const q32Val = resp['Q32'];
    const hasLittleSocial = resp['Q31'] === 'No' || 
                           resp['Q31'] === 'Ocasionalmente' || 
                           (typeof q32Val === 'string' && q32Val.includes('Ninguna'));
    
    if (hasLittleSocial) {
      insights.push({
        title: "Escalabilidad en Redes",
        desc: "Tienes poco impacto en redes. Un Agente de Contenidos es clave.",
        impact: "Medio",
        color: "text-amber-400"
      });
    }

    // Email/Admin Efficiency
    if (resp['Q24'] === 'Muy prioritario' || resp['Q19'] === 'Más de 50') {
      insights.push({
        title: "Eficiencia Operativa",
        desc: "El volumen de gestión manual es crítico. Automatizar emails te ahorrará +20h/semana.",
        impact: "Crítico",
        color: "text-primary"
      });
    }

    return insights;
  };

  const insights = getInsights();

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    const element = document.getElementById('printable-report-area');
    if (!element || isExporting) return;
    
    setIsExporting(true);
    try {
      console.log("Starting PDF Export...");
      // Scroll to top and wait for layout to settle
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 800));

      const canvas = await html2canvas(element, {
        scale: 1.5, // 1.5 is often a better compromise for complexity vs quality
        useCORS: true,
        backgroundColor: "#020617",
        logging: false,
        allowTaint: true,
        windowWidth: 1200, // Force a wider window for the capture context
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('printable-report-area');
          if (el) {
            el.style.width = "1100px"; 
            el.style.padding = "60px";
            el.style.background = "#020617";
            
            // Ensure all text is visible and charts are rendered
            const svgs = el.querySelectorAll('svg');
            svgs.forEach(svg => {
              if (svg instanceof SVGElement) {
                svg.setAttribute('width', svg.getBoundingClientRect().width.toString());
                svg.setAttribute('height', svg.getBoundingClientRect().height.toString());
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Calculate split if it's too tall for one page
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`Diagnostico_IA_${leadData.empresa}.pdf`);
      console.log("PDF Export Complete");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert(`Error al generar PDF: ${error.message || 'Error desconocido'}. Intenta de nuevo.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Render strategic implementation options
  const investmentPlans = [
    {
      name: "Fase Inicial · Opción A",
      price: "Captación Smart IA",
      features: ["Agente de Captación y Citas 24/7", "Smart Landing IA optimizada", "CRM e Integración Comercial"],
      cta: "Optimizar Ventas con IA",
      highlight: false
    },
    {
      name: "Fase de Optimización · Opción B",
      price: "Eficiencia Operativa",
      features: ["Automatización de Emails y Seguimiento", "Agente IA de Soporte y FAQ", "Liberación de tareas repetitivas"],
      cta: "Automatizar Operaciones",
      highlight: true
    },
    {
      name: "Fase de Escalado · Opción C",
      price: "Ecosistema Full IA",
      features: ["AI-First en todos los departamentos", "Formación Corporativa a medida", "Dashboard KPIs y Soporte continuo"],
      cta: "Plan de Transformación",
      highlight: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
             Dashboard Estratégico Real-Time
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Resultados de <br/> <span className="text-primary italic">Transformación IA</span></h1>
          <p className="text-slate-400 text-lg font-medium">
            Diagnóstico exclusivo para <span className="text-white font-bold">{leadData.empresa}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            disabled={isExporting}
            className="rounded-xl bg-white text-slate-950 font-black h-12 px-6 hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/10 uppercase text-[10px] tracking-widest border-none" 
            onClick={handleExportPDF}
          >
            {isExporting ? (
              <RefreshCcw className="w-4 h-4 mr-3 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-3" />
            )}
            {isExporting ? 'Generando...' : 'Descargar Informe'}
          </Button>
          <Button variant="outline" className="rounded-xl border-white/10 text-slate-400 hover:text-white h-12 px-6 uppercase text-[10px] font-black tracking-widest" onClick={resetSurvey}>
            <RefreshCcw className="w-4 h-4 mr-3" />
            Reset
          </Button>
        </div>
      </div>

      <div id="printable-report-area" ref={reportRef} className="space-y-12 bg-slate-950/20 p-6 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden">
        {/* Logo and Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-white/10">
          <img 
            src="https://www.actualinternet.com/propuestas/logo-actualinternet-2026.jpg" 
            alt="Actual Internet Logo" 
            className="h-10 w-auto object-contain rounded-lg shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="text-center sm:text-right text-slate-500 text-[10px] font-mono leading-relaxed">
            <div className="font-bold text-slate-400">INFORME ESTRATÉGICO PERSONALIZADO</div>
            <div>ACTUAL INTERNET · INTELIGENCIA ARTIFICIAL</div>
          </div>
        </div>
        {/* TOP DASHBOARD: Main KPIs & Benchmark */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main Score & Benchmark */}
          <Card className="col-span-12 lg:col-span-7 sleek-card p-10 min-h-[420px] flex flex-col md:flex-row gap-10 items-center bg-white/[0.03] border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
            
            <div className="w-full md:w-2/5 flex flex-col items-center justify-center text-center relative z-10">
              <span className="label-caps mb-8 !text-slate-500 tracking-[0.4em]">Madurez Global</span>
              <div className="relative h-56 w-56 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                  <motion.circle 
                    cx="112" cy="112" r="100" 
                    initial={{ strokeDashoffset: 628 }}
                    animate={{ strokeDashoffset: 628 - (628 * globalScore) / 100 }}
                    transition={{ duration: 2, ease: "circOut" }}
                    stroke="currentColor" strokeWidth="12" 
                    fill="transparent" 
                    className="text-primary" 
                    strokeDasharray="628" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl font-black text-white tracking-tighter"
                  >
                    {globalScore}%
                  </motion.span>
                  <div className="mt-2 px-3 py-1 rounded-full bg-primary text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    {leadData.tipo_lead}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-3/5 h-full flex flex-col justify-between pt-4 relative z-10">
              <div>
                <h3 className="label-caps mb-8 !text-slate-500 tracking-[0.2em]">Comparativa Sectorial</h3>
                <div className="space-y-8">
                  {benchmarkData.map((item) => (
                    <div key={item.name} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="text-white">{item.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                          className="h-full rounded-full shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                          style={{ backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                  * Tu empresa está un <span className="text-primary font-bold">{Math.abs(globalScore - industryAvg)}%</span> por {globalScore > industryAvg ? 'encima' : 'debajo'} de la media de digitalización en tu sector.
                </p>
              </div>
            </div>
          </Card>

          {/* Efficiency & Impact Card */}
          <Card className="col-span-12 lg:col-span-5 p-10 bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#141d33] border border-sky-500/20 flex flex-col justify-between group overflow-hidden rounded-2xl shadow-2xl relative">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 blur-[120px] rounded-full translate-x-32 -translate-y-32"></div>
             <div>
                <div className="flex items-center gap-2 mb-3">
                   <div className="p-2 bg-sky-500/10 rounded-lg"><Zap className="w-5 h-5 text-sky-400" /></div>
                   <span className="label-caps !text-sky-400 tracking-widest text-[10px] font-bold">Potencial de Mejora IA</span>
                </div>
                <div className="flex items-baseline gap-2 text-white">
                   <h2 className="text-[34px] md:text-[38px] font-black tracking-tighter drop-shadow-sm leading-none">
                     {globalScore < 40 ? "Muy Alto" : globalScore < 70 ? "Alto" : "Significativo"}
                   </h2>
                </div>
                <p className="text-slate-300 font-medium mt-6 text-sm leading-relaxed max-w-[280px]">
                  Nivel de oportunidad para liberar tiempo administrativo y automatizar captación de clientes.
                </p>
             </div>
             
             <div className="pt-8 border-t border-white/10 mt-8 grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Capacidad</p>
                  <p className="text-2xl font-black text-white leading-none">{ahorro.equivalente_staff || 0} <span className="text-sm text-sky-400 font-bold ml-1 opacity-90">FTEs</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Tiempo/Año</p>
                  <p className="text-2xl font-black text-white leading-none">~{((ahorro.equivalente_staff || 0) * 1700).toLocaleString()} <span className="text-sm text-sky-400 font-bold ml-1 opacity-90">h</span></p>
                </div>
             </div>
          </Card>
        </div>

        {/* MIDDLE SECTION: INSIGHTS & THE 4 PILLARS */}
        <div className="grid grid-cols-12 gap-8">
          {/* Detailed Area Insights */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              <h3 className="label-caps !text-white text-sm">Alertas de Oportunidad</h3>
            </div>
            {insights.length > 0 ? insights.map((insight, i) => (
              <Card key={i} className="p-6 bg-white/[0.02] border-white/5 space-y-3 hover:bg-white/[0.04] transition-all">
                <div className="flex justify-between items-start">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", insight.color)}>Impacto {insight.impact}</span>
                  <div className="p-1 rounded-full bg-white/5"><Check className="w-3 h-3 text-white/20" /></div>
                </div>
                <h4 className="text-white font-black text-sm uppercase tracking-tight">{insight.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">{insight.desc}</p>
              </Card>
            )) : (
              <p className="text-slate-500 text-xs italic">No se detectaron cuellos de botella críticos inmediatos.</p>
            )}

            <div className="pt-6 border-t border-white/5 mt-8">
               <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="label-caps !text-white text-[10px]">Evolución Proyectada</h3>
               </div>
               <div className="space-y-8">
                  <div className="relative pl-8 border-l border-white/10 space-y-1">
                     <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-500"></div>
                     <p className="text-[10px] font-black uppercase text-slate-500">Hoy</p>
                     <p className="text-sm font-bold text-white">Procesos Manuales</p>
                  </div>
                  <div className="relative pl-8 border-l border-white/10 space-y-1">
                     <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                     <p className="text-[10px] font-black uppercase text-primary">Mes 1</p>
                     <p className="text-sm font-bold text-white">Agente IA de Captación</p>
                     <p className="text-[10px] text-slate-400 font-medium">+24% Eficiencia</p>
                  </div>
                  <div className="relative pl-8 border-l border-white/10 space-y-1 opacity-50">
                     <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-700"></div>
                     <p className="text-[10px] font-black uppercase text-slate-700">Mes 6+</p>
                     <p className="text-sm font-bold text-white">Ecosistema AI-First</p>
                     <p className="text-[10px] text-slate-400 font-medium">+80% Escalabilidad</p>
                  </div>
               </div>
            </div>
          </div>

          {/* AI Custom-styled HTML Report */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-1 bg-primary rounded-full"></div>
              <h2 className="label-caps !text-white text-lg tracking-[0.3em]">Informe Estratégico Personalizado</h2>
            </div>

            {!leadData.analisis_ia ? (
              <Card className="p-20 text-center bg-white/[0.02] border-white/5">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
                    <p className="font-bold text-slate-400">Gemini está trazando tu estrategia personalizada...</p>
                  </div>
              </Card>
            ) : (
              <Card className="sleek-card p-6 md:p-10 bg-white/[0.02] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-92 h-92 bg-primary/5 blur-[120px] rounded-full translate-x-32 -translate-y-32 pointer-events-none"></div>
                
                <div 
                  className="ai-html-report text-slate-300"
                  dangerouslySetInnerHTML={{ __html: leadData.analisis_ia }}
                />
              </Card>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: PRICING & CALL TO ACTION */}
        <div className="pt-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-1 bg-primary rounded-full"></div>
            <h2 className="label-caps !text-white text-lg tracking-[0.3em]">Opciones de Implantación de IA sugeridas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {investmentPlans.map((plan, idx) => (
              <Card key={idx} className={cn(
                "p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden group flex flex-col justify-between",
                plan.highlight 
                  ? "bg-primary border-primary shadow-2xl shadow-primary/25 scale-[1.05] z-10" 
                  : "bg-white/[0.03] border-white/5 hover:border-white/20"
              )}>
                <div className="relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-3", plan.highlight ? "text-slate-950/70" : "text-primary")}>
                      {plan.name}
                    </h4>
                    <div className={cn("text-2xl md:text-3xl font-black mb-8 tracking-tight font-serif", plan.highlight ? "text-slate-950" : "text-white")}>
                      {plan.price}
                    </div>
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((f, i) => (
                        <li key={i} className={cn("flex items-start gap-3 text-sm font-bold leading-snug", plan.highlight ? "text-slate-950" : "text-slate-300")}>
                          <Check className={cn("w-4 h-4 shrink-0 mt-0.5", plan.highlight ? "text-slate-950" : "text-primary")} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button asChild className={cn(
                    "w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                    plan.highlight 
                      ? "bg-slate-950 text-white hover:scale-[1.02]" 
                      : "bg-white text-slate-950 hover:bg-primary"
                  )}>
                    <a href="https://reuniones.clientify.com/#/oscartoha/Consultoria_IA" target="_blank" rel="noopener noreferrer">
                      {plan.cta}
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* CUSTOM HIGH-FIDELITY CTA BOX (Matches uploaded attachment) */}
          <div className="mt-24 p-8 md:p-12 rounded-[2.5rem] bg-[#0c0d1e] border border-white/10 shadow-3xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/5 blur-[120px] rounded-full translate-x-32 -translate-y-32 pointer-events-none"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Left Content Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  ⏰ TIEMPO LIMITADO · CONSULTORÍA ESTRATÉGICA GRATUITA
                </div>
                
                <h3 className="text-3xl md:text-4xl font-serif font-black text-white leading-tight">
                  Hablemos de la estrategia digital de tu negocio.
                </h3>
                
                <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed max-w-2xl">
                  En 45 minutos analizamos tu situación actual e identificamos exactamente dónde la IA puede potenciar tu captación, automatizar tus procesos y mejorar tu presencia digital. Sin coste. Sin compromiso.
                </p>

                {/* Key Bullet Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  {[
                    "Auditoría de tu estrategia digital actual",
                    "Plan de captación y visibilidad con IA",
                    "Identificamos procesos automatizables en tu negocio",
                    "Propuesta personalizada sin compromiso"
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-white font-bold text-xs md:text-sm">
                      <span className="text-[#38bdf8] text-lg leading-none shrink-0 font-black">✓</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a 
                    href="https://wa.me/34611882156" 
                    target="_blank" 
                    rel="no-referrer" 
                    className="inline-flex items-center justify-center gap-3 bg-[#059669] hover:bg-[#047857] text-white font-black uppercase tracking-wider text-[11px] px-8 h-14 rounded-xl shadow-lg shadow-emerald-500/10 transition-all border border-emerald-500/20"
                  >
                    <span className="text-lg">💬</span> WhatsApp +34 611 88 21 56
                  </a>
                  
                  <a 
                    href="tel:930485318" 
                    className="inline-flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 font-black uppercase tracking-wider text-[11px] px-8 h-14 rounded-xl transition-all"
                  >
                    <span className="text-lg">📞</span> 930 485 318
                  </a>
                </div>
              </div>

              {/* Right Profile Column */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="w-full max-w-[340px] bg-[#12142d] border border-white/10 rounded-3xl p-6 shadow-2xl relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
                  
                  {/* Oscar Tohà Profile Photo */}
                  <a 
                    href="https://reuniones.clientify.com/#/oscartoha/Consultoria_IA" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 border border-white/5 outline-none shadow-inner"
                  >
                    <img 
                      src="https://www.actualinternet.com/propuestas/oscar-toha.jpg" 
                      alt="Oscar Tohà" 
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none"></div>
                  </a>

                  {/* Profile texts */}
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-white tracking-tight font-serif mb-1">
                      Oscar Tohà
                    </h4>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                      Estrategia Digital e IA
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono tracking-normal">
                      Actual Internet
                    </p>
                  </div>

                  {/* Interactive Option Pills inside profile */}
                  <div className="space-y-2.5">
                    <a 
                      href="https://wa.me/34611882156" 
                      target="_blank" 
                      rel="no-referrer"
                      className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-[#10b981] font-bold text-xs tracking-wide transition-all"
                    >
                      <span>💬</span> 611 88 21 56
                    </a>
                    
                    <a 
                      href="tel:930485318"
                      className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 text-slate-300 font-bold text-xs tracking-wide transition-all"
                    >
                      <span>📞</span> 930 485 318
                    </a>

                    <a 
                      href="https://reuniones.clientify.com/#/oscartoha/Consultoria_IA" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 border border-[#0ea5e9]/20 hover:border-[#0ea5e9]/30 text-sky-400 font-bold text-xs tracking-wide transition-all"
                    >
                      <span>⏱️</span> 45 min - Sin coste
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
