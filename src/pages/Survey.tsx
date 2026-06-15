
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ArrowRight, ArrowLeft, Send, Bot } from 'lucide-react';
import { useSurvey } from '../context/SurveyContext';
import { questions, CATEGORIES } from '../data/survey';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { LeadCapture } from '../components/survey/LeadCapture';

export const Survey = () => {
  const { 
    responses, setResponses, 
    currentStep, setCurrentStep,
    leadData, setLeadData
  } = useSurvey();
  const [showCapture, setShowCapture] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = questions[currentStep];
  
  // Progress calculation
  const totalQuestions = questions.length;
  const progressPercent = Math.round((currentStep / totalQuestions) * 100);

  // Filter visible questions (handle skipping)
  const getNextStep = (current: number) => {
    let next = current + 1;
    while (next < totalQuestions) {
      const q = questions[next];
      if (!q.dependsOn) return next;
      
      const parentValue = responses[q.dependsOn];
      if (parentValue === q.dependencyValue) return next;
      
      next++;
    }
    return next;
  };

  const getPrevStep = (current: number) => {
    let prev = current - 1;
    while (prev >= 0) {
      const q = questions[prev];
      if (!q.dependsOn) return prev;
      
      const parentValue = responses[q.dependsOn];
      if (parentValue === q.dependencyValue) return prev;
      
      prev--;
    }
    return prev;
  };

  const handleOptionSelect = (label: string) => {
    if (currentQuestion.allowMultiple) {
      const currentVal = responses[currentQuestion.id];
      const currentResponses = typeof currentVal === 'string' ? currentVal.split(", ").filter(Boolean) : [];
      let newResponses;
      if (currentResponses.includes(label)) {
        newResponses = currentResponses.filter(r => r !== label);
      } else {
        newResponses = [...currentResponses, label];
      }
      setResponses(prev => ({ ...prev, [currentQuestion.id]: newResponses.join(", ") }));
    } else {
      setResponses(prev => ({ ...prev, [currentQuestion.id]: label }));
      
      // Auto-advance after small delay for single choice
      setTimeout(() => {
        const next = getNextStep(currentStep);
        if (next >= totalQuestions) {
          setShowCapture(true);
        } else {
          setCurrentStep(next);
        }
      }, 400); 
    }
  };

  const handleNext = () => {
    const next = getNextStep(currentStep);
    if (next >= totalQuestions) {
      setShowCapture(true);
    } else {
      setCurrentStep(next);
    }
  };

  const handlePrev = () => {
    const prev = getPrevStep(currentStep);
    if (prev >= 0) {
      setCurrentStep(prev);
    }
  };

  useEffect(() => {
    console.log("Survey Version 3.2.5 loaded");
  }, []);

  if (showCapture) {
    return <LeadCapture onBack={() => setShowCapture(false)} />;
  }

  const isSelected = (label: string) => {
    const val = responses[currentQuestion.id] || "";
    if (currentQuestion.allowMultiple) {
      return typeof val === 'string' ? val.split(", ").includes(label) : false;
    }
    return val === label;
  };

  const autoFillAll = () => {
    const newResponses: Record<string, string> = {};
    questions.forEach(q => {
      if (q.allowMultiple) {
        newResponses[q.id] = q.options[0].label;
      } else {
        newResponses[q.id] = q.options[0].label;
      }
    });
    setResponses(newResponses);
    setShowCapture(true);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-2xl min-h-[70vh] flex flex-col">
      {/* Sleek Horizontal Progress Section - Mission Dashboard Style */}
      <div className="mb-8 w-full">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1.5">
            <motion.div
              key={currentQuestion.category}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-block px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
            >
              MÓDULO: {currentQuestion.category}
            </motion.div>
            <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em] ml-1">DIAGNÓSTICO ACTUAL INTERNET V3.2.5</p>
          </div>
          
          <div className="text-right">
            <motion.div 
              key={progressPercent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-black text-white leading-none mb-1"
            >
              {progressPercent}%
            </motion.div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
              PASO {currentStep + 1} DE {totalQuestions}
            </span>
          </div>
        </div>

        {/* High-end Progress Bar */}
        <div className="h-2 w-full bg-slate-900/50 rounded-full overflow-hidden relative border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 h-full bg-gradient-to-r from-sky-600 via-primary to-sky-400 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)]"
          />
          <motion.div 
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg] animate-[shimmer_2s_infinite]"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="sleek-card p-8 md:p-12 shadow-[0_0_80px_-20px_rgba(56,189,248,0.2)] relative overflow-hidden group border-white/10 bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem]"
          >
            {currentQuestion.allowMultiple && (
              <div className="absolute top-6 right-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30">
                <Bot className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Multi-selección</span>
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-black mb-10 leading-tight text-white tracking-tight">
              {currentQuestion.text}
            </h2>

            <div className="grid gap-1">
              {currentQuestion.options.map((option) => (
                <Label
                  key={option.label}
                  onClick={() => handleOptionSelect(option.label)}
                  className={`
                    flex items-center gap-3 p-3 md:p-3.5 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden group/opt
                    ${isSelected(option.label) 
                      ? "border-primary bg-primary shadow-[0_0_15px_rgba(56,189,248,0.25)] scale-[1.005] z-10" 
                      : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05] hover:scale-[1.002]"}
                  `}
                >
                  <div className={`
                    w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all duration-300
                    ${isSelected(option.label) 
                      ? "border-slate-950 bg-slate-950 rotate-0" 
                      : "border-white/20 bg-white/5 rotate-[-8deg] group-hover/opt:rotate-0"}
                  `}>
                    <AnimatePresence>
                      {isSelected(option.label) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                        >
                          <Check className="w-3.5 h-3.5 text-primary stroke-[4px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={`
                    text-[15px] font-bold tracking-tight leading-tight transition-colors duration-300
                    ${isSelected(option.label) ? "text-slate-950" : "text-white/90 group-hover/opt:text-white"}
                  `}>
                    {option.label}
                  </span>
                  
                  {isSelected(option.label) && (
                    <motion.div 
                      layoutId="active-shimmer"
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"
                    />
                  )}
                </Label>
              ))}
            </div>

            {currentQuestion.allowMultiple && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 pt-8 border-t border-white/10 flex justify-end"
              >
                <Button
                  onClick={handleNext}
                  disabled={!(responses[currentQuestion.id])}
                  className="bg-primary text-slate-950 hover:bg-white font-black uppercase text-[12px] tracking-[0.2em] px-10 py-7 h-auto rounded-2xl group shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Continuar Diagnóstico
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-between items-center gap-8">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="rounded-2xl px-6 md:px-8 py-5 h-auto border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 uppercase text-[10px] font-black tracking-widest transition-all"
          >
            <ArrowLeft className="w-5 h-5 md:mr-3" />
            <span className="hidden md:inline">Atrás</span>
          </Button>

          {currentStep === 0 && (
            <Button
              variant="outline"
              onClick={autoFillAll}
              className="rounded-2xl px-4 md:px-6 py-5 h-auto border-dashed border-primary/30 text-primary/60 hover:text-primary hover:border-primary uppercase text-[9px] font-black tracking-widest transition-all"
            >
              🚀 AUTO-RELLENAR
            </Button>
          )}
        </div>
        
        {!currentQuestion.allowMultiple && (
          <button
            onClick={handleNext}
            className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors group flex items-center py-2"
          >
            Siguiente <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
