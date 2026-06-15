
export interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
  category: string;
  dependsOn?: string;
  dependencyValue?: any;
  allowMultiple?: boolean;
}

export const CATEGORIES = [
  "Perfil de Empresa",
  "Conocimiento y Percepción IA",
  "Estrategia Digital",
  "Gestión Interna y Administración",
  "Ventas y Atención al Cliente",
  "Marketing y Redes Sociales"
];

export const questions: Question[] = [
  // BLOQUE 1: Perfil de Empresa
  {
    id: "Q1",
    category: "Perfil de Empresa",
    text: "¿Cuál es el tamaño actual de tu empresa?",
    options: [
      { value: 0, label: "Autónomo / 1 trabajador" },
      { value: 1, label: "2 a 5 trabajadores" },
      { value: 2, label: "6 a 10 trabajadores" },
      { value: 3, label: "11 a 25 trabajadores" },
      { value: 4, label: "Más de 25 trabajadores" },
    ],
  },
  {
    id: "Q2",
    category: "Perfil de Empresa",
    text: "¿En qué sector opera principalmente tu empresa?",
    options: [
      { value: 1, label: "Servicios profesionales" },
      { value: 2, label: "Construcción / reformas / instalaciones" },
      { value: 3, label: "Comercio / retail" },
      { value: 4, label: "Salud / bienestar" },
      { value: 5, label: "Tecnología" },
      { value: 6, label: "Otro" },
    ],
  },
  {
    id: "Q3",
    category: "Perfil de Empresa",
    text: "¿Cuál es tu rol dentro de la empresa?",
    options: [
      { value: 1, label: "Propietario / gerente" },
      { value: 2, label: "Dirección comercial" },
      { value: 3, label: "Administración" },
      { value: 4, label: "Marketing" },
      { value: 5, label: "Otro" },
    ],
  },
  {
    id: "Q4",
    category: "Perfil de Empresa",
    text: "¿Cuánto tiempo dedica tu empresa a tareas administrativas cada semana?",
    options: [
      { value: 0, label: "Menos de 5 horas" },
      { value: 1, label: "5 a 10 horas" },
      { value: 2, label: "10 a 20 horas" },
      { value: 3, label: "Más de 20 horas" },
    ],
  },
  {
    id: "Q5",
    category: "Perfil de Empresa",
    text: "¿Cuántas herramientas digitales utiliza actualmente tu empresa?",
    options: [
      { value: 0, label: "Ninguna" },
      { value: 1, label: "1 o 2 herramientas" },
      { value: 2, label: "3 a 5 herramientas" },
      { value: 3, label: "Más de 5 herramientas" },
    ],
  },
  {
    id: "Q6",
    category: "Perfil de Empresa",
    text: "¿Tu empresa tiene actualmente una estrategia digital definida?",
    options: [
      { value: 3, label: "Sí, claramente definida" },
      { value: 2, label: "Tenemos algunas acciones sueltas" },
      { value: 1, label: "Estamos empezando a plantearlo" },
      { value: 0, label: "No tenemos estrategia digital" },
    ],
  },

  // BLOQUE 2: Conocimiento y percepción de la IA
  {
    id: "Q7",
    category: "Conocimiento y Percepción IA",
    text: "¿Qué nivel de conocimiento tienes sobre inteligencia artificial?",
    options: [
      { value: 0, label: "Muy bajo" },
      { value: 1, label: "Básico" },
      { value: 2, label: "Intermedio" },
      { value: 3, label: "Avanzado" },
    ],
  },
  {
    id: "Q8",
    category: "Conocimiento y Percepción IA",
    text: "¿Tu empresa utiliza actualmente herramientas de IA?",
    options: [
      { value: 0, label: "No utilizamos ninguna" },
      { value: 1, label: "Hemos probado algunas herramientas" },
      { value: 2, label: "Usamos IA ocasionalmente" },
      { value: 3, label: "La usamos de forma habitual" },
    ],
  },
  {
    id: "Q9",
    category: "Conocimiento y Percepción IA",
    text: "¿Qué herramientas de IA habéis utilizado?",
    allowMultiple: true,
    options: [
      { value: 1, label: "ChatGPT / Gemini" },
      { value: 2, label: "Generación de imágenes" },
      { value: 3, label: "Automatización de procesos" },
      { value: 4, label: "Chatbots o asistentes" },
      { value: 0, label: "Ninguna" },
    ],
  },
  {
    id: "Q10",
    category: "Conocimiento y Percepción IA",
    text: "¿Cómo percibes la implementación de IA en tu empresa?",
    options: [
      { value: 0, label: "Muy lejana" },
      { value: 1, label: "Interesante pero complicada" },
      { value: 2, label: "Algo que queremos explorar" },
      { value: 3, label: "Algo que queremos implementar pronto" },
    ],
  },
  {
    id: "Q11",
    category: "Conocimiento y Percepción IA",
    text: "¿Qué frenos encuentras para implementar IA en tu empresa?",
    allowMultiple: true,
    options: [
      { value: 1, label: "Falta de conocimiento" },
      { value: 2, label: "Falta de tiempo" },
      { value: 3, label: "Falta de recursos económicos" },
      { value: 4, label: "No sabemos por dónde empezar" },
      { value: 0, label: "No lo vemos claro todavía" },
    ],
  },
  {
    id: "Q12",
    category: "Conocimiento y Percepción IA",
    text: "¿Qué impacto crees que tendrá la IA en tu sector en los próximos 5 años?",
    options: [
      { value: 0, label: "Muy bajo" },
      { value: 1, label: "Moderado" },
      { value: 2, label: "Alto" },
      { value: 3, label: "Transformador" },
    ],
  },

  // BLOQUE 3: Estrategia digital
  {
    id: "Q13",
    category: "Estrategia Digital",
    text: "¿Tu empresa tiene una página web activa?",
    options: [
      { value: 0, label: "No tenemos web" },
      { value: 1, label: "Tenemos una web básica" },
      { value: 2, label: "Tenemos una web pero no genera clientes" },
      { value: 3, label: "Tenemos una web optimizada para captar clientes" },
    ],
  },
  {
    id: "Q14",
    category: "Estrategia Digital",
    text: "¿Cada cuánto tiempo actualizáis vuestra web?",
    options: [
      { value: 0, label: "Nunca" },
      { value: 1, label: "Una vez al año" },
      { value: 2, label: "Varias veces al año" },
      { value: 3, label: "Mensualmente" },
    ],
  },
  {
    id: "Q15",
    category: "Estrategia Digital",
    text: "¿La web genera contactos o clientes potenciales?",
    options: [
      { value: 0, label: "No genera ninguno" },
      { value: 1, label: "Muy pocos" },
      { value: 2, label: "Algunos" },
      { value: 3, label: "Es una fuente importante de clientes" },
    ],
  },
  {
    id: "Q16",
    category: "Estrategia Digital",
    text: "¿Cómo gestionáis actualmente los contactos de clientes?",
    options: [
      { value: 1, label: "Email" },
      { value: 2, label: "Excel" },
      { value: 3, label: "CRM" },
      { value: 0, label: "No hay sistema definido" },
    ],
  },
  {
    id: "Q17",
    category: "Estrategia Digital",
    text: "¿Utilizáis automatizaciones para captar o gestionar clientes?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Muy pocas" },
      { value: 2, label: "Algunas" },
      { value: 3, label: "Muchas" },
    ],
  },
  {
    id: "Q18",
    category: "Estrategia Digital",
    text: "¿Te interesaría tener un agente IA que atienda automáticamente a los visitantes de tu web?",
    options: [
      { value: 0, label: "No lo veo necesario" },
      { value: 1, label: "Podría ser interesante" },
      { value: 2, label: "Sí, nos gustaría explorarlo" },
      { value: 3, label: "Sí, es algo prioritario" },
    ],
  },

  // BLOQUE 4: Gestión interna y administración
  {
    id: "Q19",
    category: "Gestión Interna y Administración",
    text: "¿Cuántos correos electrónicos recibe tu empresa cada día?",
    options: [
      { value: 0, label: "Menos de 10" },
      { value: 1, label: "10 a 30" },
      { value: 2, label: "30 a 50" },
      { value: 3, label: "Más de 50" },
    ],
  },
  {
    id: "Q20",
    category: "Gestión Interna y Administración",
    text: "¿Cómo se gestionan actualmente los correos?",
    options: [
      { value: 0, label: "De forma manual" },
      { value: 1, label: "Cada persona gestiona los suyos" },
      { value: 2, label: "Tenemos un sistema organizado" },
      { value: 3, label: "Utilizamos automatización" },
    ],
  },
  {
    id: "Q21",
    category: "Gestión Interna y Administración",
    text: "¿Cuánto tiempo dedicas a tareas repetitivas administrativas?",
    options: [
      { value: 0, label: "Menos de 5 horas semanales" },
      { value: 1, label: "5 a 10 horas" },
      { value: 2, label: "10 a 20 horas" },
      { value: 3, label: "Más de 20 horas" },
    ],
  },
  {
    id: "Q22",
    category: "Gestión Interna y Administración",
    text: "¿Tu empresa analiza indicadores o KPIs del negocio?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "De forma ocasional" },
      { value: 2, label: "Mensualmente" },
      { value: 3, label: "De forma habitual" },
    ],
  },
  {
    id: "Q23",
    category: "Gestión Interna y Administración",
    text: "¿Qué herramientas utilizáis para la gestión del negocio?",
    options: [
      { value: 0, label: "Ninguna" },
      { value: 1, label: "Excel" },
      { value: 2, label: "ERP" },
      { value: 3, label: "Software especializado" },
    ],
  },
  {
    id: "Q24",
    category: "Gestión Interna y Administración",
    text: "¿Te interesaría automatizar tareas administrativas con IA?",
    options: [
      { value: 0, label: "Poco interés" },
      { value: 1, label: "Interés moderado" },
      { value: 2, label: "Bastante interés" },
      { value: 3, label: "Muy prioritario" },
    ],
  },

  // BLOQUE 5: Ventas y atención al cliente
  {
    id: "Q25",
    category: "Ventas y Atención al Cliente",
    text: "¿Cómo llegan la mayoría de tus clientes?",
    options: [
      { value: 1, label: "Recomendaciones" },
      { value: 2, label: "Teléfono" },
      { value: 3, label: "Web" },
      { value: 4, label: "Redes sociales" },
    ],
  },
  {
    id: "Q26",
    category: "Ventas y Atención al Cliente",
    text: "¿Tu empresa responde rápidamente a consultas de clientes?",
    options: [
      { value: 0, label: "A veces tardamos mucho" },
      { value: 1, label: "Normalmente respondemos el mismo día" },
      { value: 2, label: "Respondemos rápidamente" },
      { value: 3, label: "Tenemos procesos automatizados" },
    ],
  },
  {
    id: "Q27",
    category: "Ventas y Atención al Cliente",
    text: "¿Cuántas consultas de clientes recibís semanalmente?",
    options: [
      { value: 0, label: "Menos de 10" },
      { value: 1, label: "10 a 30" },
      { value: 2, label: "30 a 50" },
      { value: 3, label: "Más de 50" },
    ],
  },
  {
    id: "Q28",
    category: "Ventas y Atención al Cliente",
    text: "¿Tienes algún sistema para responder automáticamente a clientes?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Solo respuestas básicas" },
      { value: 2, label: "Automatizaciones simples" },
      { value: 3, label: "Chatbots o IA" },
    ],
  },
  {
    id: "Q29",
    category: "Ventas y Atención al Cliente",
    text: "¿Crees que pierdes clientes por no responder rápido?",
    options: [
      { value: 3, label: "Sí, muchas veces" },
      { value: 2, label: "Algunas veces" },
      { value: 1, label: "Rara vez" },
      { value: 0, label: "No lo creo" },
    ],
  },
  {
    id: "Q30",
    category: "Ventas y Atención al Cliente",
    text: "¿Te interesaría un agente IA que responda automáticamente a clientes?",
    options: [
      { value: 0, label: "Poco interés" },
      { value: 1, label: "Interesante" },
      { value: 2, label: "Bastante interesante" },
      { value: 3, label: "Muy prioritario" },
    ],
  },

  // BLOQUE 6: Marketing y redes sociales
  {
    id: "Q31",
    category: "Marketing y Redes Sociales",
    text: "¿Tu empresa publica contenido en redes sociales?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Ocasionalmente" },
      { value: 2, label: "De forma regular" },
      { value: 3, label: "Con estrategia definida" },
    ],
  },
  {
    id: "Q32",
    category: "Marketing y Redes Sociales",
    text: "¿Qué redes sociales utilizáis?",
    allowMultiple: true,
    options: [
      { value: 1, label: "Instagram" },
      { value: 2, label: "Facebook" },
      { value: 3, label: "LinkedIn" },
      { value: 4, label: "TikTok" },
      { value: 0, label: "Ninguna" },
    ],
  },
  {
    id: "Q33",
    category: "Marketing y Redes Sociales",
    text: "¿Quién gestiona actualmente las redes sociales?",
    options: [
      { value: 0, label: "Nadie" },
      { value: 1, label: "Internamente" },
      { value: 2, label: "Un freelance" },
      { value: 3, label: "Una agencia" },
    ],
  },
  {
    id: "Q34",
    category: "Marketing y Redes Sociales",
    text: "¿Con qué frecuencia publicáis contenido?",
    options: [
      { value: 0, label: "Nunca" },
      { value: 1, label: "1 o 2 veces al mes" },
      { value: 2, label: "Semanalmente" },
      { value: 3, label: "Varias veces por semana" },
    ],
  },
  {
    id: "Q35",
    category: "Marketing y Redes Sociales",
    text: "¿Utilizáis herramientas para planificar contenidos?",
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Algunas herramientas" },
      { value: 2, label: "Herramientas profesionales" },
      { value: 3, label: "Automatización" },
    ],
  },
  {
    id: "Q36",
    category: "Marketing y Redes Sociales",
    text: "¿Te interesaría un agente IA que planifique y genere contenidos para redes sociales?",
    options: [
      { value: 0, label: "Poco interés" },
      { value: 1, label: "Interés moderado" },
      { value: 2, label: "Bastante interés" },
      { value: 13, label: "Muy prioritario" },
    ],
  },

  // PREGUNTA FINAL
  {
    id: "Q37",
    category: "Estrategia Digital",
    text: "¿Te gustaría recibir un diagnóstico personalizado sobre cómo implementar IA en tu empresa?",
    options: [
      { value: 3, label: "Sí, me gustaría una sesión estratégica" },
      { value: 2, label: "Sí, pero más adelante" },
      { value: 1, label: "Solo quiero recibir el informe" },
    ],
  }
];
