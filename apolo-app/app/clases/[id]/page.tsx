"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function PaginaClase() {
  const params = useParams();
  const id = params.id as string;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [paginaActual, setPaginaActual] = useState(0);
  const [paginas, setPaginas] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLesson() {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setLesson(data);
        const textoDividido = data.content_html.split('---');
        setPaginas(textoDividido);

        // Recuperar la página guardada en la memoria del navegador
        const progresoGuardado = localStorage.getItem(`progreso_clase_${id}`);
        if (progresoGuardado) {
          setPaginaActual(Number(progresoGuardado));
        }
      }
      setLoading(false);
    }
    fetchLesson();
  }, [id]);

  // Función para cambiar de página y guardar el progreso
  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    localStorage.setItem(`progreso_clase_${id}`, nuevaPagina.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Cargando clase...</div>;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Clase no encontrada</h1>
        <Link href="/dashboard" className="text-emerald-600 hover:underline">← Volver a INICIO</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        
        {/* Encabezado */}
        <div className="mb-8 border-b pb-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-slate-500 hover:text-emerald-600 font-medium transition-colors">
            ← Volver a INICIO
          </Link>
          <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
            Semana {lesson.week_number}
          </span>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
            {lesson.title}
          </h1>
      
        </header>

        {/* BARRA DE HERRAMIENTAS: Selector de página y Botón de Tareas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          
          {/* 1. Botón / Desplegable para elegir página */}
          {paginas.length > 1 ? (
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-slate-700">Ir a la página:</label>
              <select 
                value={paginaActual}
                onChange={(e) => cambiarPagina(Number(e.target.value))}
                className="bg-white border-2 border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-bold p-2 cursor-pointer outline-none"
              >
                {paginas.map((_, index) => (
                  <option key={index} value={index}>
                    {index + 1} de {paginas.length}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-500">Página única</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {/* 2. NUEVO BOTÓN: Descargar PDF Original */}
            {lesson.file_url && (
              <a 
                href={lesson.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-2 px-6 rounded-lg transition-colors border border-blue-300 shadow-sm text-sm"
              >
                Descargar Clase 📥
              </a>
            )}

            {/* 3. Botón de acceso directo a las actividades */}
            <Link 
              href={`/clases/${lesson.id}/quiz`}
              className="inline-flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2 px-6 rounded-lg transition-colors border border-amber-300 shadow-sm text-sm"
            >
              Ir a las tareas 📝
            </Link>
          </div>
        </div>
      
        {/* Contenido Renderizado y Hermoso con ReactMarkdown */}
        <article className="prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed border-t pt-8 prose-headings:mt-12 prose-headings:mb-6 prose-p:mb-6 prose-strong:text-slate-900 prose-li:mb-2">
          <ReactMarkdown>
            {paginas[paginaActual]}
          </ReactMarkdown>
        </article>

        {/* Controles del Paginador Inferior */}
        <div className="mt-12 flex items-center justify-between border-t pt-8">
          <button
            onClick={() => cambiarPagina(Math.max(0, paginaActual - 1))}
            disabled={paginaActual === 0}
            className="px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-0 bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            ← Página Anterior
          </button>

          {/* Si estamos en la última página, mostramos el botón verde grande */}
          {paginaActual === paginas.length - 1 ? (
            <Link 
              href={`/clases/${lesson.id}/quiz`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-transform hover:scale-105 shadow-md"
            >
              Comenzar Actividades →
            </Link>
          ) : (
            <button
              onClick={() => cambiarPagina(Math.min(paginas.length - 1, paginaActual + 1))}
              className="px-6 py-3 rounded-xl font-bold transition-all bg-slate-900 hover:bg-slate-800 text-white shadow-md"
            >
              Siguiente Página →
            </button>
          )}
        </div>

      </div>
    </main>
  );
}