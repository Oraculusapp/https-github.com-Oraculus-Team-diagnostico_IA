
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Search, Download, Eye, 
  ArrowUpDown, Filter, ChevronRight,
  TrendingUp, TrendingDown, Clock, Bot,
  Lock, LayoutDashboard, Database, Mail,
  LogOut, LogIn, Settings, Save, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { Lead } from '../data/types';

const ADMIN_EMAIL = "oscar@actualinternet.com";

export const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.email);
      setUser(user);
      setLoading(false);
      
      const isAuthorized = user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      if (isAuthorized) {
        // Fetch leads
        const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const unsubLeads = onSnapshot(qLeads, (snapshot) => {
          const leadsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Lead[];
          setLeads(leadsData);
        }, (error) => {
          console.error("Error fetching leads:", error);
          if (error.code === 'permission-denied') {
            alert(`Error de permisos en Firestore para ${user.email}. Asegúrate de que las reglas de seguridad están desplegadas y tu email es oscar@actualinternet.com`);
          }
        });

        // Fetch config
        const fetchConfig = async () => {
          const docSnap = await getDoc(doc(db, "config", "prompts"));
          if (docSnap.exists()) {
             setSystemPrompt(docSnap.data().systemPrompt || "");
          }
        };
        fetchConfig();

        return () => unsubLeads();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSavePrompt = async () => {
    setSavingPrompt(true);
    try {
      await setDoc(doc(db, "config", "prompts"), { systemPrompt }, { merge: true });
      alert("System Prompt actualizado correctamente");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const exportToCSV = () => {
    const headers = ["Nombre", "Empresa", "Email", "Telefono", "Score", "Ahorro", "Tipo", "Fecha"];
    const rows = leads.map(l => [
      l.nombre,
      l.empresa,
      l.email,
      l.telefono,
      l.scores.global,
      l.ahorro.euros_anual,
      l.tipo_lead,
      l.createdAt instanceof Date ? l.createdAt.toLocaleDateString() : (l.createdAt as any)?.toDate?.().toLocaleDateString() || ""
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_actual_internet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredLeads = leads.filter(l => 
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Bot className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center">
        <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 rounded-[2.5rem] p-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="p-5 rounded-3xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Este panel es exclusivo para administradores de Actual Internet. 
            Por favor, inicia sesión con tu cuenta autorizada.
          </p>
          <Button 
            onClick={handleLogin} 
            className="w-full h-14 rounded-2xl font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Inicia sesión con Google
          </Button>
          {user && user.email !== ADMIN_EMAIL && (
            <p className="mt-6 text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              La cuenta <strong>{user.email}</strong> no tiene permisos de administrador.
              <button onClick={handleLogout} className="block w-full mt-2 underline font-bold uppercase text-[10px]">Cerrar sesión</button>
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
             </div>
             Actual Board
          </h1>
          <p className="text-slate-400 flex items-center gap-2 text-sm font-medium">
            Panel de control avanzado • <span className="text-primary font-bold">{user.email}</span>
          </p>
        </div>
        <Button variant="ghost" className="rounded-xl text-slate-500 h-10 px-4 hover:bg-white/5 hover:text-white uppercase text-[10px] font-black tracking-widest" onClick={handleLogout}>
             <LogOut className="w-4 h-4 mr-2" />
             Salir
        </Button>
      </div>

      <Tabs defaultValue="leads" className="space-y-8">
        <TabsList className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl h-16 w-fit mb-8">
          <TabsTrigger value="leads" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all">
            <Users className="w-4 h-4 mr-2" />
            Leads Capturados
          </TabsTrigger>
          <TabsTrigger value="config" className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-slate-950 font-black uppercase text-[10px] tracking-widest transition-all">
            <Settings className="w-4 h-4 mr-2" />
            Configuración IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-8 outline-none">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between sleek-card p-6 border-none bg-slate-900/20">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <Input 
                  placeholder="Filtrar por nombre, empresa..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-slate-950 border-slate-800 rounded-xl h-12 focus:border-primary border-2 transition-all font-medium" 
               />
            </div>
            <Button variant="outline" className="rounded-xl border-slate-800 h-12 px-6 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <Card className="sleek-card overflow-hidden border-none bg-slate-900/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50">
                    <th className="p-6 label-caps">Información Lead</th>
                    <th className="p-6 label-caps">Contacto</th>
                    <th className="p-6 label-caps text-center">Madurez</th>
                    <th className="p-6 label-caps">Ahorro Est.</th>
                    <th className="p-6 label-caps text-center">Estado</th>
                    <th className="p-6 label-caps">Fecha</th>
                    <th className="p-6 label-caps text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-white leading-none mb-1.5">{lead.nombre}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{lead.empresa}</div>
                      </td>
                      <td className="p-6 whitespace-nowrap">
                        <div className="text-sm text-slate-300 font-mono mb-1">{lead.email}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{lead.telefono}</div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center">
                           <span className="text-lg font-black text-primary font-mono">{lead.scores.global}%</span>
                           <div className="w-12 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${lead.scores.global}%` }} />
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-indigo-400 font-black text-lg">
                           {lead.ahorro.euros_anual.toLocaleString()}€
                        </div>
                        <div className="label-caps !text-slate-600">/ año</div>
                      </td>
                      <td className="p-6 text-center">
                        <Badge className={`
                          ${lead.tipo_lead === 'caliente' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                            lead.tipo_lead === 'tibio' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'}
                           rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] border
                        `}>
                          {lead.tipo_lead}
                        </Badge>
                      </td>
                      <td className="p-6 text-[10px] text-slate-500 font-black uppercase whitespace-nowrap">
                        {lead.createdAt instanceof Date ? lead.createdAt.toLocaleDateString() : (lead.createdAt as any)?.toDate?.().toLocaleDateString() || "Reciente"}
                      </td>
                      <td className="p-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-10 h-10 rounded-xl hover:bg-primary hover:text-slate-950 transition-all shadow-lg"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-24 text-center">
                        <Database className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No hay registros</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="outline-none">
          <Card className="sleek-card p-12 max-w-4xl border-none bg-slate-900/20">
             <div className="flex items-center gap-5 mb-12">
               <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                  <Sparkles className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-2xl font-black tracking-tight">Motor de Diagnóstico</h3>
                  <p className="text-slate-500 font-medium text-sm">Configura las directrices que Gemini seguirá para analizar los leads.</p>
               </div>
             </div>

             <div className="space-y-8">
                <div className="space-y-3">
                   <div className="flex justify-between items-end">
                      <label className="label-caps">System Prompt Principal</label>
                      <span className="text-[10px] text-slate-500 font-mono font-bold tracking-tight">{systemPrompt.length} CHARS</span>
                   </div>
                   <textarea 
                     value={systemPrompt}
                     onChange={(e) => setSystemPrompt(e.target.value)}
                     className="w-full min-h-[400px] bg-slate-950 border-2 border-slate-800 rounded-[2rem] p-8 text-slate-300 font-mono text-sm focus:border-primary outline-none transition-all leading-relaxed shadow-inner"
                     placeholder="Define el comportamiento de la IA..."
                   />
                </div>

                <div className="flex justify-end pt-4">
                   <Button 
                     onClick={handleSavePrompt} 
                     disabled={savingPrompt}
                     className="bg-primary text-slate-950 font-black h-14 px-10 rounded-2xl hover:bg-cyan-500 transition-all shadow-2xl shadow-cyan-500/20 uppercase text-[10px] tracking-widest"
                   >
                     {savingPrompt ? <Clock className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                     Guardar Configuración
                   </Button>
                </div>
             </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
          {selectedLead && (
            <div className="flex flex-col h-full">
               <div className="p-10 pb-6 border-b border-white/5">
                  <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                       <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                          <Bot className="w-8 h-8" />
                       </div>
                       <div>
                          <DialogTitle className="text-3xl font-black">{selectedLead.nombre}</DialogTitle>
                          <DialogDescription className="text-slate-500 font-medium text-lg">
                            {selectedLead.empresa}
                          </DialogDescription>
                       </div>
                    </div>
                  </DialogHeader>
               </div>

               <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Contacto Directo</span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-slate-300">
                           <Mail className="w-4 h-4 text-primary" />
                           <span className="font-medium">{selectedLead.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                           <Users className="w-4 h-4" />
                           <span>Tlf: {selectedLead.telefono}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest block mb-1">Potencial Lead</span>
                      <div className="flex items-end gap-2">
                         <span className="text-2xl font-black text-white">{selectedLead.scores.global}%</span>
                         <Badge className="mb-1 bg-primary text-slate-950 font-black">{selectedLead.tipo_lead.toUpperCase()}</Badge>
                      </div>
                      <div className="text-xs text-indigo-400 font-bold mt-1">
                         Ahorro: {selectedLead.ahorro.euros_anual.toLocaleString()}€ / año
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="font-black text-xl flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        Análisis Gemini 1.5
                     </h4>
                     <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-8 rounded-3xl">
                        <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                          {selectedLead.analisis_ia}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="font-black text-xl flex items-center gap-3">
                        <Database className="w-5 h-5 text-emerald-400" />
                        Auditoría de Datos
                     </h4>
                     <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {Object.entries(selectedLead.respuestas).map(([key, val]: any) => (
                          <div key={key} className="bg-slate-900 p-3 rounded-2xl border border-white/5 text-center group hover:border-primary transition-colors">
                            <span className="text-[8px] text-slate-600 block mb-1 font-black group-hover:text-primary">{key}</span>
                            <span className="text-lg font-black text-white">{val}</span>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
