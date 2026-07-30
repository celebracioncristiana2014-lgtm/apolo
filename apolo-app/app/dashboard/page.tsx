"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPrincipal() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 text-xl">Cargando INICIO...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-red-500 font-mono">
        <h2 className="text-xl font-bold mb-2">Error al conectar con Supabase:</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 lg:p-24">
      <div className="max-w-5xl mx-auto">
        
        {/* ENCABEZADO CON BOTÓN DE CERRAR SESIÓN */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Apologética Avanzada
            </h1>
            <p className="text-lg text-slate-600">
              Selecciona un módulo y una clase para comenzar tu lectura y evaluación.
            </p>
          </div>
          
          <button 
            onClick={cerrarSesion}
            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 px-6 rounded-xl transition-transform hover:scale-105 border-2 border-red-200 shadow-sm whitespace-nowrap"
          >
            Cerrar Sesión 🚪
          </button>
        </header>

        {/* LISTA DE MÓDULOS Y CLASES */}
        {(!modules || modules.length === 0) ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
            <h3 className="font-bold text-lg mb-1">Aún no hay módulos visibles.</h3>
          </div>
        ) : (
          <div className="space-y-12">
            {modules.map((modulo) => (
              <section key={modulo.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">
                  {modulo.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modulo.lessons
                    ?.sort((a: any, b: any) => a.week_number - b.week_number)
                    .map((clase: any) => (
                    <Link 
                      href={`/clases/${clase.id}`} 
                      key={clase.id}
                      className="group block p-6 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all duration-200 bg-slate-50 hover:bg-white"
                    >
                      <div className="text-sm font-bold text-emerald-600 mb-2 tracking-wide uppercase">
                        Semana {clase.week_number}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {clase.title}
                      </h3>
                      <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
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