
import { questions, CATEGORIES } from '../data/survey';

export function calculateScores(respuestas: Record<string, any>) {
  const porBloque: Record<string, number> = {};
  
  // Helper to get numeric value from a response (which could be a label or a number)
  const getPoints = (questionId: string, response: any): number => {
    if (response === undefined || response === null) return 0;
    if (typeof response === "number") return response;
    
    // If it's a label, find the question and the option with that label
    const question = questions.find(q => q.id === questionId);
    if (!question) return 0;
    
    const option = question.options.find(o => o.label === response);
    return option ? option.value : 0;
  };
  
  CATEGORIES.forEach(category => {
    const categoryQuestions = questions.filter(q => q.category === category);
    let maxPossibleScore = 0;
    let actualScore = 0;
    
    categoryQuestions.forEach(q => {
      const questionMax = Math.max(...q.options.map(o => o.value));
      // Only count questions that have points associated with them
      if (questionMax > 0) {
        maxPossibleScore += questionMax;
        actualScore += getPoints(q.id, respuestas[q.id]);
      }
    });
    
    porBloque[category] = maxPossibleScore > 0 
      ? Math.round((actualScore / maxPossibleScore) * 100) 
      : 0;
  });
  
  const global = Math.round(
    Object.values(porBloque).reduce((a, b) => a + b, 0) / CATEGORIES.length
  );
  
  return { global, porBloque };
}

export function calculateSavings(respuestas: Record<string, any>, manualEmployees?: number) {
  // Helper to get value
  const getVal = (questionId: string, response: any): number => {
    if (typeof response === "number") return response;
    const question = questions.find(q => q.id === questionId);
    if (!question) return 0;
    const option = question.options.find(o => o.label === response);
    return option ? option.value : 0;
  };

  // Q1: "¿Cuál es el tamaño actual de tu empresa?"
  let numEmployees = manualEmployees || 1;
  
  if (!manualEmployees) {
    const q1Val = getVal('Q1', respuestas['Q1']);
    const sizeMap: Record<number, number> = { 0: 1, 1: 3.5, 2: 8, 3: 18, 4: 40 };
    numEmployees = sizeMap[q1Val] || 1;
  }

  // Q21: "¿Cuánto tiempo dedicas a tareas repetitivas administrativas?"
  const q21Val = getVal('Q21', respuestas['Q21']);
  const hoursMap: Record<number, number> = { 0: 3, 1: 7, 2: 15, 3: 25 };
  const currentRepetitiveHours = hoursMap[q21Val] || 3;
  
  // Assume IA can automate 40% of those tasks
  const hoursSavedPerEmployee = currentRepetitiveHours * 0.4;
  
  const semanal = Number((hoursSavedPerEmployee * numEmployees).toFixed(1));
  const anual = semanal * 50; 
  const euros_anual = Math.round(anual * 35); 
  const equivalente_staff = Number((anual / 1700).toFixed(2));
  
  return { semanal, anual, euros_anual, equivalente_staff };
}

export function determineLeadType(globalScore: number): "frio" | "tibio" | "caliente" {
  if (globalScore < 40) return "frio";
  if (globalScore < 70) return "tibio";
  return "caliente";
}
