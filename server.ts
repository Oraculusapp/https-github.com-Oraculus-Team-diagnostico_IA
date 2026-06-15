
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import dotenv from "dotenv";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware for debugging API issues
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} (IP: ${req.ip || req.headers['x-forwarded-for']}) - Content-Type: ${req.headers['content-type']} - User-Agent: ${req.headers['user-agent']}\n`;
  try {
    fs.appendFileSync(path.join(process.cwd(), "api_debug.log"), logMsg);
  } catch (err) {
    console.error("Failed to write to api_debug.log:", err);
  }
  next();
});

// Firebase Admin Config - Lazy and safe to prevent app crash if credentials/db are missing
let firebaseDb: any = null;
let firebaseInitialized = false;

function getFirestoreDb() {
  if (firebaseInitialized) return firebaseDb;
  try {
    const adminApp = initializeApp({
      projectId: firebaseConfig.projectId,
    });
    firebaseDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Admin Firestore initialized successfully.");
  } catch (e) {
    console.warn("Firebase Admin safe warning (could mean already initialized or missing credentials):", e);
    try {
      // Try to get default db anyway if initialized elsewhere
      firebaseDb = getFirestore(undefined, firebaseConfig.firestoreDatabaseId);
    } catch {
      firebaseDb = null;
    }
  } finally {
    firebaseInitialized = true;
  }
  return firebaseDb;
}

// Gemini Configuration - Using the correct SDK
if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fail.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-to-prevent-null-crash",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Resend Configuration
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.all(["/api/diagnostico", "/api/diagnostico/"], (req, res, next) => {
  if (req.method !== "POST") {
    console.warn(`[WARNING] Non-POST request to /api/diagnostico: ${req.method} ${req.url}`);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed on /api/diagnostico. Se requiere un método POST.` });
  }
  next();
});

app.post(["/api/diagnostico", "/api/diagnostico/"], async (req, res) => {
  console.log("POST /api/diagnostico called");
  try {
    const { leadData, responses } = req.body;
    console.log("Lead Data received:", JSON.stringify(leadData, null, 2));
    
    if (!leadData || !responses || !leadData.scores || !leadData.ahorro) {
      console.error("Missing critical data in request body");
      return res.status(400).json({ error: "Datos insuficientes para el diagnóstico" });
    }

    const model = "gemini-3.5-flash"; 
    
    // Ensure numbers are definitely numbers
    const eurosAnual = Number(leadData.ahorro?.euros_anual) || 0;
    const globalScore = Number(leadData.scores?.global) || 0;

    let responseSummary = "Sin respuestas detalladas";
    if (responses) {
      if (Array.isArray(responses)) {
        responseSummary = responses.join('\n');
      } else if (typeof responses === 'object' && responses !== null) {
        responseSummary = Object.entries(responses)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
      }
    }

    // Default system prompt
    const systemPrompt = `Eres el Director de Estrategia Digital, Inteligencia Artificial y Transformación de Negocio de Actual Internet.
    Tu objetivo es generar un INFORME ESTRATÉGICO FINAL VISUAL, DIDÁCTICO Y CONSULTIVO en HTML limpio y responsive dispuesto en tarjetas, tablas y barras visuales de estado que ayude a la empresa a entender su situación actual y las oportunidades reales que tiene para mejorar con Inteligencia Artificial, digitalización y automatización de procesos.

    ENFOQUE DEL INFORME: MAPA DE OPORTUNIDADES, NO PRESUPUESTO
    - El informe no de bajo ningún concepto mostrar precios, importes, inversión inicial, ahorro económico en euros, facturación potencial ni ROI en euros (€).
    - El objetivo del diagnóstico no es presentar una propuesta económica, sino mostrar a la empresa su situación actual y las inmensas posibilidades de mejora que tiene con inteligencia artificial, digitalización y automatización.
    - Evita completamente: Ahorro potencial en euros, inversión inicial, presupuesto estimado, costes orientativos, facturación potencial, ROI económico y frases como "validamos estos números".
    - Sustituye cualquier análisis económico o financiero por un análisis de oportunidad y de impacto operativo/comercial.
    - Debes mostrar de forma destacada: Potencial de mejora, Nivel de oportunidad, Impacto esperado, Prioridad estratégica, Facilidad de implementación, Fase recomendada, Soluciones posibles, Camino de evolución recomendado.

    SISTEMA DE VALORACIÓN (Para tu análisis interno de las respuestas):
    Valora internamente cada respuesta de 0 a 4 puntos (0 = Situación crítica/ausencia total de sistema; 4 = Nivel avanzado/totalmente optimizado).
    Convierte internamente cada área (de las 6 áreas detalladas) a una puntuación de 0 a 100 de esta forma:
    - 0-25: Crítico (Nivel Crítico)
    - 26-50: Bajo (Nivel Bajo)
    - 51-70: Medio (Nivel Medio)
    - 71-85: Alto (Nivel Alto)
    - 86-100: Avanzado (Nivel Avanzado)

    REGLAS DE SELECCIÓN DE SOLUCIONES (Selecciona cuidadosamente las mejores opciones específicas según las respuestas del usuario):
    Las soluciones posibles para recomendar deben elegirse estrictamente entre estas 15 opciones de Actual Internet:
    1. Web IA / Smart Landing IA orientada a captación.
    2. Mejora de posicionamiento SEO.
    3. Optimización de Google Business Profile.
    4. Estrategia digital y campañas de captación.
    5. Agente comercial IA para la web.
    6. Agente IA de atención al cliente.
    7. Súper Agente IA conectado a web, WhatsApp, CRM y agenda.
    8. Gestión inteligente de WhatsApp.
    9. Automatización de agendas, reservas o reuniones.
    10. Automatización de correos y tareas administrativas.
    11. CRM y seguimiento comercial.
    12. Dashboard de KPIs y control de negocio.
    13. Agente IA de contenidos para redes sociales.
    14. Formación práctica en IA para el equipo.
    15. Consultoría estratégica gratuita inicial.

    Recuerda aplicar estas reglas lógicas para seleccionar e indicar las soluciones idóneas:
    - Si la empresa no tiene web: Prioriza "Web IA / Smart Landing IA orientada a captación". No priorices todavía un Súper Agente IA si no existe una base digital mínima.
    - Si la empresa tiene web básica: Recomienda mejora web (Web IA), "Mejora de posicionamiento SEO" y/o "Optimización de Google Business Profile", llamadas a la acción y posible "Agente comercial IA para la web".
    - Si la empresa tiene web pero no genera contactos: Recomienda optimización de conversión, "Agente comercial IA para la web", "CRM y seguimiento comercial", y campañas de captación.
    - Si la empresa ya tiene web optimizada: No recomiendes renovar la web. Recomienda "Agente comercial IA para la web", "Automatización de agendas, reservas o reuniones", "Gestión inteligente de WhatsApp", "CRM y seguimiento comercial" o "Dashboard de KPIs y control de negocio".
    - Si la empresa recibe muchas consultas: Recomienda "Agente IA de atención al cliente", "Gestión inteligente de WhatsApp" y/o "Automatización de correos y tareas administrativas".
    - Si la empresa pierde clientes por responder tarde: Prioriza "Agente comercial IA para la web", "Gestión inteligente de WhatsApp" y "CRM y seguimiento comercial" para automatizar el seguimiento veloz.
    - Si la empresa dedica muchas horas a administración: Recomienda "Automatización de correos y tareas administrativas" y/o "Dashboard de KPIs y control de negocio" para agilizar flujos de trabajo internos.
    - Si la empresa no mide KPIs: Recomienda "Dashboard de KPIs y control de negocio" y un sistema de indicadores.
    - Si la empresa publica poco en redes: Recomienda "Agente IA de contenidos para redes sociales", planificación editorial inteligente y visibilidad.
    - Si la empresa tiene bajo conocimiento de IA: Recomienda "Formación práctica en IA para el equipo" y "Consultoría estratégica gratuita inicial".
    - Si la empresa tiene alto interés en IA: Recomienda una sólida hoja de ruta en fases progresiva.

    Para cada solución recomendada o mencionada en tu análisis, indica de manera elegante:
    - Qué problema resuelve.
    - Por qué encaja con las respuestas del usuario.
    - Impacto esperado: Bajo, Medio, Alto o Muy alto.
    - Prioridad: Ahora, Próxima fase o Futuro.
    - Dificultad de implantación: Simple, Media o Avanzada.

    ESTRUCTURA DEL INFORME FINAL HTML (A generar directamente en español):
    Tu respuesta debe comenzar directamente con un div contenedor (sin envoltura markdown \`\`\`html ni \`\`\` al principio o final) y contener marcado HTML limpio y responsive usando estilos inline y clases de Tailwind CSS.

    CRÍTICO PARA DISEÑO, CONTRASTE Y LEGIBILIDAD (Asegúrate de destacar sobre el fondo oscuro de la aplicación):
    - Usa siempre fondos de tarjeta y tablas muy oscuros (ej: class="bg-[#0f172a] border border-white/10 p-6 rounded-2xl" o style="background-color: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1);") con textos claros y brillantes (ej: color: #ffffff, color: #e2e8f0, color: #38bdf8).
    - Evita fondos claros con letras claras. El contraste debe ser rotundo y profesional.
    - Todos los elementos deben verse impecables tanto digitalmente como al exportar/imprimir.

    Debe incluir los siguientes bloques estructurados de forma nítida en español:
    1. Título destacado personalizado en Serif elegante: "Informe Estratégico de Oportunidades Digitales e Inteligencia Artificial para [NOMBRE_EMPRESA]"
    2. Resumen ejecutivo elegante (2 o 3 párrafos de alta calidad de consultor estratégico analizando su madurez digital actual sin citar euros).
    3. Puntuación global grande en una tarjeta destacada con borde claro fino.
    4. Dashboard visual por áreas (área de las 6 correspondientes) usando una tabla estilizada de fondo oscuro sólido con:
       Área | Puntuación | Oportunidad | Estado visual (Usa caracteres gráficos excelentes como 🔴 ██░░░░░░░░ o 🟢 ██████████) | Prioridad
    5. SECCIÓN: “Mapa de oportunidades con IA y digitalización”
       Introduce esta sección con fuerza y muestra una tabla con fondo oscuro sólido y bordes visibles de alto contraste con estas columnas exactas:
       Área de mejora | Situación detectada | Oportunidad | Solución posible | Impacto esperado | Prioridad
       - En la columna "Solución posible", selecciona exclusivamente entre las 15 soluciones del catálogo de soluciones dadas arriba según lo que sea más coherente con el diagnóstico.
    6. SECCIÓN VISUAL EN HTML DE TARJETAS: "Tus principales caminos de mejora"
       Presenta esta sección como tarjetas visuales de estilo Grid con fondos oscuros (class="bg-[#12142d] border border-white/15 p-6 rounded-2xl relative overflow-hidden").
       Cada tarjeta debe incluir obligatoriamente:
       - Icono de emoji destacado (🚀, 🤖, 💬, 📅, 📊, 🧠, 📲, ⚙️, etc.)
       - Nombre de la solución posible recomendada.
       - Descripción breve.
       - Por qué encaja con sus respuestas.
       - Impacto esperado: (Muy alto, Alto, Medio o Bajo).
       - Prioridad: (Ahora, Próxima fase o Futuro).
       - Dificultad: (Simple, Media o Avanzada).
    7. SECCIÓN DEL PLAN EN FASES (Sin precios ni inversiones en euros):
       Genera un plan estratégico recomendado en 3 fases:
       - Fase 1: Base digital y oportunidades rápidas. Explicando: Objetivo, Acciones recomendadas, Soluciones posibles, Resultado esperado y Nivel de prioridad.
       - Fase 2: Automatización y captación. Explicando: Objetivo, Acciones recomendadas, Soluciones posibles, Resultado esperado y Nivel de prioridad.
       - Fase 3: Escalado con IA avanzada. Explicando: Objetivo, Acciones recomendadas, Soluciones posibles, Resultado esperado y Nivel de prioridad.
    8. CIERRE DEL INFORME (Cierre consultivo y honesto sin precios):
       Finaliza siempre con una invitación a una consultoría estratégica gratuita.
       Usa exactamente este enfoque de texto:
       “Este diagnóstico es una primera fotografía de tu situación digital e IA. El siguiente paso es revisar juntos qué oportunidades tienen más sentido para tu empresa, qué soluciones encajan mejor y cuál debería ser la primera fase de implantación.
       En una consultoría estratégica gratuita podemos analizar tu caso, priorizar las acciones y definir una hoja de ruta realista para aplicar IA en tu negocio.”

       Genera centrado un botón visual grande y llamativo con este contenido exacto:
       "Reservar consultoría gratuita" (Dirigiendo a: https://reuniones.clientify.com/#/oscartoha/Consultoria_IA).

    IMPORTANTE: No incluyas comentarios técnicos fuera del HTML ni marcas Markdown de código como \`\`\`html al inicio o final de tu respuesta, devuelve ÚNICAMENTE el fragmento HTML limpio y utilizable de forma directa.`;
    
    try {
      const activeDb = getFirestoreDb();
      if (activeDb) {
        await activeDb.collection("config").doc("prompts").set({
          systemPrompt: systemPrompt,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Updated config prompt saved to Firestore doc.");
      } else {
        console.warn("Firestore Admin not initialized. Skipping systemPrompt save.");
      }
    } catch (e) {
      console.warn("Failed to update system prompt in Firestore config doc:", e);
    }

    const prompt = `
      DATOS DE ENTRADA DE LA EMPRESA:
      - Nombre de empresa: ${leadData.empresa}
      - Sector: ${leadData.sector || leadData.empresa_sector || 'No especificado'}
      - Número de trabajadores: ${leadData.empleados || '1'}
      - Rol de la persona que responde: ${leadData.rol || 'Propietario / Gerente'}
      - Tiempo potencial a recuperar estimado de forma automática: ${((leadData.ahorro?.equivalente_staff || 0) * 1700).toLocaleString()} horas/año
      - Equivalente laboral en eficiencia optimizable: ${leadData.ahorro?.equivalente_staff || 0} FTEs (trabajadores equivalentes)
      - Madurez Tecnológica Inicial: ${globalScore}%

      RESPUESTAS COMPLETAS DEL CUESTIONARIO (Pregunta: Respuesta):
      ${responseSummary}

      Por favor, analiza estas respuestas de forma adaptada a las reglas y directrices estratégicas del sistema. Genera el informe final personalizado directamente en HTML limpio y pulido en español.
    `;

    console.log("Initializing Gemini Analysis for:", leadData.empresa);
    
    let analysis = "";
    try {
      console.log("Using model:", model);
      console.log("Prompt length:", prompt.length);
      console.log("System Prompt length:", systemPrompt.length);
      
      const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });
      
      console.log("Gemini response received object keys:", Object.keys(response || {}));
      let rawAnalysis = response.text || "";
      
      // Sanitización para eliminar cualquier envoltura markdown de código ```html si apareciera
      rawAnalysis = rawAnalysis.trim();
      if (rawAnalysis.startsWith("```html")) {
        rawAnalysis = rawAnalysis.substring(7);
      } else if (rawAnalysis.startsWith("```")) {
        rawAnalysis = rawAnalysis.substring(3);
      }
      if (rawAnalysis.endsWith("```")) {
        rawAnalysis = rawAnalysis.substring(0, rawAnalysis.length - 3);
      }
      analysis = rawAnalysis.trim();
      
      if (!analysis) {
        console.error("Gemini returned empty text. Full response:", JSON.stringify(response));
        throw new Error("Gemini no devolvió texto en el informe.");
      }
      console.log("Analysis generated successfully. Length:", analysis.length);
    } catch (aiError: any) {
      console.error("Gemini AI error details:", aiError);
      console.error("AI Error Code:", aiError.code);
      console.error("AI Error Status:", aiError.status);
      
      analysis = `Lo sentimos, hubo un problema al generar el análisis detallado vía IA (Status: ${aiError.status || 'unknown'}). Tus resultados básicos están disponibles a continuación.`;
    }

    // Save to Firestore - Clean up any undefined values
    const firestoreData = JSON.parse(JSON.stringify({
      ...leadData,
      analisis_ia: analysis,
      status: 'nuevo'
    }));
    
    try {
      const activeDb = getFirestoreDb();
      if (activeDb) {
        await activeDb.collection("leads").add({
          ...firestoreData,
          createdAt: FieldValue.serverTimestamp(),
        });
        console.log("Lead saved to Firestore successfully via Admin SDK");
      } else {
        console.warn("Firestore Admin not initialized. Skipping lead save on server.");
      }
    } catch (fsError) {
      console.error("Firestore save error:", fsError);
    }

    console.log("Returning response to client...");
    res.status(200).json({ analysis });

    // Send Email via Resend in the background
    if (resend) {
      console.log("Resend API Key detected (First 4 chars):", process.env.RESEND_API_KEY?.substring(0, 4), "...");
      console.log("Attempting to send emails to:", leadData.email, "and oscar@actualinternet.com");
      
      (async () => {
        try {
          // Use the verified domain email
          const finalFrom = 'Actual Internet <oscar@actualinternet.com>';

          // Generate beautiful responses format in HTML
          let responsesHtml = "";
          if (Array.isArray(responses)) {
            responsesHtml = responses.map(r => {
              const parts = r.split(':');
              if (parts.length > 1) {
                const q = parts[0].trim();
                const a = parts.slice(1).join(':').trim();
                return `<li style="margin-bottom: 10px; font-size: 14px; line-height: 1.5; color: #cbd5e1;"><strong style="color: #38bdf8;">${q}:</strong> <span style="background-color: rgba(56, 189, 248, 0.08); padding: 3px 8px; border-radius: 4px; color: #ffffff; border: 1px solid rgba(56, 189, 248, 0.15); display: inline-block; margin-top: 4px;">${a}</span></li>`;
              }
              return `<li style="margin-bottom: 10px; font-size: 14px; line-height: 1.5; color: #ffffff;">${r}</li>`;
            }).join('');
          } else if (typeof responses === 'object' && responses !== null) {
            responsesHtml = Object.entries(responses).map(([q, a]) => {
              return `<li style="margin-bottom: 10px; font-size: 14px; line-height: 1.5; color: #cbd5e1;"><strong style="color: #38bdf8;">${q}:</strong> <span style="background-color: rgba(56, 189, 248, 0.08); padding: 3px 8px; border-radius: 4px; color: #ffffff; border: 1px solid rgba(56, 189, 248, 0.15); display: inline-block; margin-top: 4px;">${a}</span></li>`;
            }).join('');
          } else {
            responsesHtml = `<p style="color: #94a3b8; font-style: italic;">Sin respuestas registradas o formato no compatible.</p>`;
          }

          const emailContent = `
            <div style="font-family: sans-serif; background-color: #020617; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #1e293b; max-width: 750px; margin: 0 auto;">
              <h1 style="color: #38bdf8; margin-bottom: 24px;">Informe Estratégico de Oportunidades - Actual Internet</h1>
              <p style="font-size: 18px; color: #94a3b8;">Hola <strong>${leadData.nombre}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Gracias por confiar en Actual Internet para tu diagnóstico tecnológico. Aquí tienes tu mapa de oportunidades personalizado para <strong>${leadData.empresa}</strong>.</p>
              
              <div style="background-color: rgba(56, 189, 248, 0.05); padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid rgba(56, 189, 248, 0.2);">
                <h2 style="margin-top: 0; color: #ffffff; font-size: 20px;">Nivel de Madurez Digital: <span style="color: #38bdf8;">${globalScore}%</span></h2>
                <p style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #cbd5e1;">Oportunidad de Mejora: <span style="color: #38bdf8;">${globalScore < 40 ? 'Muy Alta' : globalScore < 70 ? 'Alta' : 'Significativa'}</span></p>
                <p style="font-size: 14px; color: #94a3b8; margin: 0;">Impacto de optimización identificado para tu negocio.</p>
              </div>

              <!-- Informe estratégico generado -->
              <div style="margin-top: 20px;">
                ${analysis}
              </div>

              <div style="background-color: #38bdf8; padding: 30px; border-radius: 12px; margin-top: 40px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; color: #020617; font-size: 22px; font-weight: 950;">Diseñemos tu hoja de ruta</h2>
                <p style="margin: 0 0 20px 0; color: #020617; font-weight: 500;">Agenda tu consultoría estratégica gratuita de 45 minutos para priorizar estas oportunidades.</p>
                <a href="https://reuniones.clientify.com/#/oscartoha/Consultoria_IA" style="background-color: #020617; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  RESERVAR CONSULTORÍA GRATUITA
                </a>
              </div>

              <p style="margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5;">
                Enviado por Actual Internet • Oscar Tohá<br/>
                Para cualquier duda responde a este correo.
              </p>
            </div>
          `;

          // Send to Admin enriched with all the test responses
          try {
            const adminEmailContent = `
              <div style="font-family: sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; max-width: 700px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #38bdf8; padding-bottom: 15px;">
                  <h1 style="color: #38bdf8; margin: 0; font-size: 22px; font-weight: 900;">🚀 NUEVO LEAD REGISTRADO</h1>
                  <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 13px;">Se ha completado un autodiagnóstico de IA interactivo</p>
                </div>
                
                <h2 style="color: #ffffff; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-top: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">📋 Datos del Contacto</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; width: 140px; font-size: 14px;">Nombre:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${leadData.nombre}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 14px;">Empresa:</td>
                    <td style="padding: 6px 0; color: #38bdf8; font-weight: bold; font-size: 14px;">${leadData.empresa}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 14px;">Email:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-size: 14px;"><a href="mailto:${leadData.email}" style="color: #38bdf8; text-decoration: none;">${leadData.email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 14px;">Teléfono:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-size: 14px;"><a href="tel:${leadData.telefono}" style="color: #ffffff; text-decoration: none;">${leadData.telefono}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 14px;">Sector:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${leadData.sector || leadData.empresa_sector || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 14px;">Empleados:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${leadData.empleados || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-weight: bold; font-size: 14px;">Rol del contacto:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${leadData.rol || 'No especificado'}</td>
                  </tr>
                </table>

                <h2 style="color: #ffffff; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-top: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">📊 Diagnóstico Global</h2>
                <div style="background-color: rgba(56, 189, 248, 0.04); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid rgba(56, 189, 248, 0.15);">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">Madurez digital: <span style="color: #38bdf8; font-size: 18px; font-weight: bold;">${globalScore}%</span></p>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">Potencial de mejora: <span style="color: #818cf8; font-size: 18px; font-weight: bold;">${globalScore < 40 ? 'Muy Alto' : globalScore < 70 ? 'Alto' : 'Significativo'}</span></p>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">Capacidad optimizable: <span style="color: #34d399; font-size: 16px; font-weight: bold;">${leadData.ahorro?.equivalente_staff || 0} FTEs</span></p>
                  <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Tiempo estimado a liberar: <span style="color: #34d399; font-size: 16px; font-weight: bold;">~${((leadData.ahorro?.equivalente_staff || 0) * 1700).toLocaleString()} h/año</span></p>
                </div>

                <h2 style="color: #ffffff; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-top: 25px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">💬 Respuestas del Cuestionario</h2>
                <ul style="padding-left: 15px; margin-bottom: 25px; margin-top: 15px;">
                  ${responsesHtml}
                </ul>

                <h2 style="color: #ffffff; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-top: 25px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">🤖 Informe Estratégico Enviado al Cliente</h2>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 12px; line-height: 1.4;">A continuación se adjunta una vista previa directa del informe generado dinámicamente por la inteligencia artificial:</p>
                <div style="background-color: #020617; border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; font-size: 13px; line-height: 1.6; overflow-x: auto; max-height: 350px; color: #cbd5e1;">
                  ${analysis}
                </div>
              </div>
            `;

            const adminEmailResult = await resend.emails.send({
              from: finalFrom,
              to: ['oscar@actualinternet.com'],
              subject: `🚀 NUEVO LEAD IA: ${leadData.empresa} (${globalScore}%)`,
              html: adminEmailContent
            });
            console.log("Resend admin email success:", adminEmailResult.data?.id);
          } catch (e: any) {
            console.error("Resend admin email failure:", e.message);
          }

          // Send to Lead (Note: This might fail if using onboarding@resend.dev to a non-verified email.
          // By putting 'oscar@actualinternet.com' as an additional recipient (CC or BCC), Oscar is guaranteed to receive it as well,
          // bypassing sandbox constraints, allowing you to review exactly what the client received!)
          console.log("Sending report to lead:", leadData.email);
          try {
            const leadEmailResult = await resend.emails.send({
              from: finalFrom,
              to: [leadData.email],
              cc: ['oscar@actualinternet.com'], // CC to Oscar to guarantee receipt during testing!
              subject: `📋 Tu Diagnóstico IA - ${leadData.empresa}`,
              html: emailContent
            });
            
            if (leadEmailResult.error) {
              console.error("Resend lead email error details:", JSON.stringify(leadEmailResult.error));
              if (leadEmailResult.error.message.includes("onboarding")) {
                 console.warn("REVISIÓN: El correo al lead falló probablemente por usar onboarding@resend.dev. Debes verificar un dominio en Resend.");
              }
            } else {
              console.log("Resend lead email success:", leadEmailResult.data?.id);
            }
          } catch (leErr: any) {
            console.error("Error sending lead email via Resend:", leErr);
          }

        } catch (emailError: any) {
          console.error("Error sending emails in background:", emailError);
        }
      })();
    } else {
      console.warn("RESEND_API_KEY NO DETECTADA. El envío de emails está desactivado.");
    }
  } catch (error: any) {
    console.error("CRITICAL Diagnosis error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: error.message || "Error interno del servidor",
        details: process.env.NODE_ENV !== 'production' ? error.stack : undefined 
      });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
