
import { Timestamp } from 'firebase/firestore';

export interface Lead {
  id?: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  empleados: number;
  respuestas: Record<string, string | number>;
  scores: {
    global: number;
    porBloque: Record<string, number>;
  };
  ahorro: {
    semanal: number;
    anual: number;
    euros_anual: number;
    equivalente_staff: number;
  };
  analisis_ia: string;
  tipo_lead: "frio" | "tibio" | "caliente";
  createdAt: Timestamp | Date;
  status: 'pending' | 'completed';
}

export interface AppConfig {
  systemPrompt: string;
  resendApiKey?: string;
  adminEmail: string;
}

export type SurveyResponse = Record<string, string | number>;
