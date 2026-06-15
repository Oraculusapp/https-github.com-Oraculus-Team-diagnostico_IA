
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { Loader2, ArrowLeft, Send, Shield, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useSurvey } from '../../context/SurveyContext';
import { questions } from '../../data/survey';
import { calculateScores, calculateSavings, determineLeadType } from '../../lib/calculations';

const schema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  empresa: z.string().min(2, "Nombre de empresa requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(9, "Teléfono inválido"),
  empleados: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Mínimo 1 empleado")
  ),
  gdpr: z.boolean().refine(val => val === true, {
    message: "Debes aceptar la política de privacidad",
  })
});

type FormData = z.infer<typeof schema>;

export const LeadCapture = ({ onBack }: { onBack: () => void }) => {
  const { leadData, setLeadData, responses, setIsSubmitting } = useSurvey();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const deriveEmployees = () => {
    const q1Resp = responses['Q1'];
    if (!q1Resp) return 1;
    const sizeMap: Record<string, number> = { 
      "Autónomo / 1 trabajador": 1, 
      "2 a 5 trabajadores": 3, 
      "6 a 10 trabajadores": 8, 
      "11 a 25 trabajadores": 18, 
      "Más de 25 trabajadores": 40 
    };
    return sizeMap[q1Resp as string] || 1;
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      nombre: leadData.nombre || "",
      empresa: leadData.empresa || "",
      email: leadData.email || "",
      telefono: leadData.telefono || "",
      empleados: leadData.empleados || deriveEmployees(),
      gdpr: false
    }
  });

  const gdprValue = watch("gdpr");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      // 1. Calculate Results
      const scores = calculateScores(responses);
      const ahorro = calculateSavings(responses, data.empleados);
      const tipo_lead = determineLeadType(scores.global);
      
      console.log("Calculated Ahorro:", ahorro);
      
      if (!scores || !ahorro) {
        throw new Error("Error al calcular los resultados del diagnóstico.");
      }

      const fullLeadData = {
        ...data,
        empleados: Number(data.empleados),
        respuestas: responses,
        scores,
        ahorro,
        tipo_lead,
        status: 'pending' as const,
        createdAt: new Date()
      };
      
      setLeadData(fullLeadData);

      // 2. Call AI Backend for Analysis
      
      // Prepare detailed responses for AI
      const detailedResponses = Object.entries(responses).map(([id, value]) => {
        const question = questions.find(q => q.id === id);
        let label = value;
        if (typeof value === 'number') {
          const option = question?.options.find(o => o.value === value);
          label = option?.label || value;
        }
        return `${question?.text}: ${label}`;
      });

      const response = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadData: fullLeadData, 
          responses: detailedResponses 
        })
      });
      
      const contentType = response.headers.get("content-type");
      const responseText = await response.text();
      
      console.log("Response Status:", response.status);
      console.log("Content-Type:", contentType);
      
      if (!response.ok) {
        throw new Error(`Error en el servidor (${response.status}): ${responseText.substring(0, 150)}`);
      }

      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response received:", responseText);
        const snippet = responseText.substring(0, 100);
        throw new Error(`El servidor no devolvió JSON (Content-Type: ${contentType}). Status: ${response.status}. Respuesta: ${snippet}...`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonErr) {
        console.error("JSON parse error:", jsonErr, "Response was:", responseText);
        throw new Error("Respuesta del servidor corrupta. Revisa la consola.");
      }
      
      const analysis = result.analysis;
      
      if (!analysis) {
        throw new Error("No se pudo generar el análisis IA.");
      }

      // Update lead data with AI analysis
      const finalLeadData = { ...fullLeadData, analisis_ia: analysis };
      setLeadData(finalLeadData);

      // Save to Firestore
      try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        await addDoc(collection(db, 'leads'), {
          ...finalLeadData,
          createdAt: serverTimestamp(),
          status: 'nuevo'
        });
        console.log("Lead saved successfully to Firestore");
      } catch (fsError) {
        console.error("Firestore save error:", fsError);
        // We don't block navigation if save fails, as AI worked and local state is updated
      }

      navigate('/results');
    } catch (error: any) {
      console.error("Submission failed:", error);
      alert("Hubo un problema al procesar tu diagnóstico. Por favor, inténtalo de nuevo o contacta con soporte. Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cyclingMessages = [
    "Calculando ROI Potencial y ahorros anuales...",
    "Conectando con Gemini 1.5 Pro para análisis profundo...",
    "Diseñando tu hoja de ruta de implementación IA...",
    "Identificando cuellos de botella en tus procesos...",
    "Comparando tu madurez con el sector...",
    "Generando informe ejecutivo para Actual Internet..."
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % cyclingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-md w-full text-center space-y-12 relative z-10">
          <div className="relative h-48 w-48 mx-auto">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-primary border-opacity-30"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border-b-2 border-sky-400 border-opacity-30"
            />
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
              className="absolute inset-10 rounded-full border-r-2 border-primary/20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div
                 animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               >
                 <Bot className="w-16 h-16 text-primary drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]" />
               </motion.div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Procesando Datos</h3>
            <div className="h-4 flex items-center justify-center overflow-hidden">
               <motion.p 
                 key={messageIndex}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 className="text-primary text-[10px] font-black uppercase tracking-[0.4em]"
               >
                 {cyclingMessages[messageIndex]}
               </motion.p>
            </div>
          </div>
          
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
             <div className="flex justify-between items-center px-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nivel de Análisis</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Avanzado</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   animate={{ width: "100%" }}
                   transition={{ duration: 15, ease: "linear" }}
                   className="h-full bg-primary shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                />
             </div>
          </div>

          <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto leading-relaxed">
            Por favor, mantén esta pestaña abierta. El motor de Actual Internet está estructurando tu hoja de ruta personalizada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sleek-card p-10 md:p-16 border-none bg-slate-900/30"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
             Último Paso
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Finalizar Diagnóstico</h2>
          <p className="text-slate-400 text-sm font-medium">
            Tus respuestas han sido procesadas. Identifica tu proyecto para recibir el análisis detallado de Gemini 1.5.
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="nombre" className="label-caps !text-white opacity-90">Tu nombre</Label>
              <Input 
                id="nombre" 
                {...register("nombre")} 
                placeholder="Nombre completo"
                className="bg-white/5 border-white/10 rounded-xl h-14 focus:border-primary transition-all border-2 text-white placeholder:text-slate-600" 
              />
              {errors.nombre && <p className="text-red-400 text-xs mt-1 font-bold">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-3">
              <Label htmlFor="empresa" className="label-caps !text-white opacity-90">Empresa</Label>
              <Input 
                id="empresa" 
                {...register("empresa")} 
                placeholder="Empresa S.L."
                className="bg-white/5 border-white/10 rounded-xl h-14 focus:border-primary transition-all border-2 text-white placeholder:text-slate-600" 
              />
              {errors.empresa && <p className="text-red-400 text-xs mt-1 font-bold">{errors.empresa.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="label-caps !text-white opacity-90">Email Profesional</Label>
              <Input 
                id="email" 
                {...register("email")} 
                placeholder="email@empresa.com"
                className="bg-white/5 border-white/10 rounded-xl h-14 focus:border-primary transition-all border-2 text-white placeholder:text-slate-600" 
              />
              {errors.email && <p className="text-red-400 text-xs mt-1 font-bold">{errors.email.message}</p>}
            </div>
            <div className="space-y-3">
              <Label htmlFor="telefono" className="label-caps !text-white opacity-90">Teléfono</Label>
              <Input 
                id="telefono" 
                {...register("telefono")} 
                placeholder="+34 ..."
                className="bg-white/5 border-white/10 rounded-xl h-14 focus:border-primary transition-all border-2 text-white placeholder:text-slate-600" 
              />
              {errors.telefono && <p className="text-red-400 text-xs mt-1 font-bold">{errors.telefono.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="empleados" className="label-caps !text-white opacity-90">Tamaño del Equipo (Nº Personas)</Label>
            <Input 
              id="empleados" 
              type="number"
              {...register("empleados")} 
              placeholder="10"
              className="bg-white/5 border-white/10 rounded-xl h-14 focus:border-primary transition-all border-2 text-white placeholder:text-slate-600" 
            />
            {errors.empleados && <p className="text-red-400 text-xs mt-1 font-bold">{errors.empleados.message}</p>}
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-primary/50 transition-colors">
            <div className="pt-1">
              <Checkbox 
                id="gdpr" 
                checked={gdprValue}
                onCheckedChange={(checked) => setValue("gdpr", checked === true)}
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-slate-950"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gdpr" className="text-xs font-bold text-slate-300 leading-relaxed cursor-pointer select-none">
                Confirmo que he leído y acepto el tratamiento de mis datos de acuerdo a la Ley de Protección de Datos vigente para la generación del informe.
              </Label>
              {errors.gdpr && <p className="text-red-400 text-[10px] font-bold uppercase tracking-tight">{errors.gdpr.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6">
            <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-18 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-white text-slate-950 hover:bg-sky-400 transition-all shadow-2xl shadow-sky-500/10 glow-button border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  IA PROCESANDO...
                </>
              ) : (
                <>
                  Obtener Score de Madurez
                  <Send className="ml-3 h-4 w-4" />
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onBack} 
              className="text-slate-500 hover:text-white uppercase text-[10px] font-black tracking-[0.2em] h-12 rounded-xl"
            >
              Regresar al cuestionario
            </Button>
          </div>
        </form>
        
        <div className="mt-12 flex items-center justify-center gap-2 text-[9px] text-slate-600 uppercase tracking-[0.3em] font-black">
            <Shield className="w-4 h-4 text-slate-700" />
            Empresa de confianza • Datos cifrados TLS 1.3
        </div>
      </motion.div>
    </div>
  );
};
