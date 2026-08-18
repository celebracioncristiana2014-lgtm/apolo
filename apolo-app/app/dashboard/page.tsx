"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes'; // <-- IMPORTAMOS EL CONTROLADOR DE TEMA

export default function DashboardPrincipal() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // <-- INICIALIZAMOS EL TEMA

  // Cargar los módulos y clases al iniciar la pantalla
  useEffect(() => {
    async function fetchModules() {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          id,
          title,
          order_index,
          lessons (
            id,
            week_number,
            title
          )
        `)
        .order('order_index', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setModules(data || []);
      }
      setLoading(false);
    }
    fetchModules();
  }, []);

  // FUNCIÓN PARA CERRAR SESIÓN
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirige automáticamente a la pantalla de Login (Nombre y PIN)
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xl bg-slate-50 dark:bg-slate-900 transition-colors">Cargando INICIO...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-red-500 font-mono bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
        <h2 className="text-xl font-bold mb-2">Error al conectar con Supabase:</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 lg:p-24 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* ENCABEZADO CON BOTONES */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-700 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Apologética Avanzada
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Selecciona un módulo y una clase para comenzar tu lectura y evaluación.
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* BOTÓN MODO OSCURO */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              title="Cambiar tema"
            >
              {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
            </button>

            {/* BOTÓN CERRAR SESIÓN */}
            <button 
              onClick={cerrarSesion}
              className="inline-flex items-center justify-center bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold py-3 px-6 rounded-xl transition-transform hover:scale-105 border-2 border-red-200 dark:border-red-800 shadow-sm whitespace-nowrap"
            >
              Cerrar Sesión 🚪
            </button>
          </div>
        </header>

        {/* LISTA DE MÓDULOS Y CLASES */}
        {(!modules || modules.length === 0) ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-6 text-amber-800 dark:text-amber-500">
            <h3 className="font-bold text-lg mb-1">Aún no hay módulos visibles.</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {modules.map((modulo) => (
              <section key={modulo.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 transition-colors">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                  {modulo.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modulo.lessons
                    ?.sort((a: any, b: any) => a.week_number - b.week_number)
                    .map((clase: any) => (
                    <Link 
                      href={`/clases/${clase.id}`} 
                      key={clase.id}
                      className="group block p-6 rounded-xl border-2 border-slate-100 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700"
                    >
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2 tracking-wide uppercase">
                        Semana {clase.week_number}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {clase.title}
                      </h3>
                      <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Leer clase y realizar tareas <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}