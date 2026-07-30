"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PantallaQuiz() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respuestasUsuario, setRespuestasUsuario] = useState<Record<string, string>>({});
  const [evaluado, setEvaluado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // NUEVO: Estado para guardar y mostrar la nota final en pantalla
  const [puntajeFinalPantalla, setPuntajeFinalPantalla] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPreguntas() {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', id)
        .order('id', { ascending: true });
      
      if (data) setPreguntas(data);
      setLoading(false);
    }
    fetchPreguntas();
  }, [id]);

  const manejarCambio = (preguntaId: string, valor: string) => {
    if (!evaluado) {
      setRespuestasUsuario((prev) => ({ ...prev, [preguntaId]: valor }));
    }
  };

  const evaluarYGuardar = async () => {
    setGuardando(true);
    
    let correctas = 0;
    let totalEvaluables = 0;

    preguntas.forEach(pregunta => {
      if (pregunta.question_type !== 'OPEN_REFLECTION') {
        totalEvaluables++;
        
        // Limpiamos espacios en blanco invisibles por si acaso con .trim()
        const respuestaDelAlumno = respuestasUsuario[pregunta.id]?.trim() || "";
        const respuestaCorrecta = pregunta.correct_answer?.trim() || "";

        if (respuestaDelAlumno === respuestaCorrecta) {
          correctas++;
        }
      }
    });

    const notaCalculada = totalEvaluables > 0 ? Math.round((correctas / totalEvaluables) * 100) : 100;
    
    // Guardamos la nota para mostrarla en la pantalla
    setPuntajeFinalPantalla(notaCalculada);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('quiz_results').insert({
        student_id: user.id,
        lesson_id: id,
        score: notaCalculada,
        answers: respuestasUsuario 
      });
    }

    setEvaluado(true);
    setGuardando(false);
    // Hacemos scroll hacia abajo para que el alumno vea su nota final
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-500">Cargando actividades...</div>;
  }

  if (preguntas.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">No hay actividades para esta clase.</h2>
        <Link href={`/clases/${id}`} className="text-emerald-600 font-bold hover:underline">← Volver a la lectura</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <Link href={`/clases/${id}`} className="text-slate-500 hover:text-emerald-600 font-medium transition-colors">
            ← Volver a la lectura
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Evaluación de la Clase</h1>
        </div>

        <div className="space-y-10">
          {preguntas.map((pregunta, index) => {
            let opciones = [];
            try {
              opciones = typeof pregunta.options === 'string' ? JSON.parse(pregunta.options) : pregunta.options;
            } catch (e) {
              opciones = [];
            }

            const esReflexion = pregunta.question_type === 'OPEN_REFLECTION';
            const respuestaElegida = respuestasUsuario[pregunta.id] || '';
            
            // Verificamos si es correcta usando trim()
            const esCorrecta = respuestaElegida.trim() === pregunta.correct_answer?.trim();

            return (
              <div key={pregunta.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-6 leading-relaxed">
                  <span className="text-emerald-600 mr-2">{index + 1}.</span>
                  {pregunta.question_text}
                </h3>

                {esReflexion ? (
                  <div>
                    <textarea
                      className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all resize-y"
                      rows={4}
                      placeholder="Escribe tu reflexión detallada aquí..."
                      value={respuestaElegida}
                      onChange={(e) => manejarCambio(pregunta.id, e.target.value)}
                      disabled={evaluado}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opciones?.map((opcion: string, i: number) => {
                      let claseBoton = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";
                      
                      if (evaluado) {
                        if (opcion.trim() === pregunta.correct_answer?.trim()) {
                          claseBoton += "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                        } else if (opcion === respuestaElegida) {
                          claseBoton += "bg-red-50 border-red-500 text-red-900 line-through";
                        } else {
                          claseBoton += "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
                        }
                      } else {
                        claseBoton += respuestaElegida === opcion 
                          ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-900 shadow-sm" 
                          : "border-slate-200 hover:border-emerald-300 bg-white text-slate-700 hover:bg-slate-50";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => manejarCambio(pregunta.id, opcion)}
                          disabled={evaluado}
                          className={claseBoton}
                        >
                          {opcion}
                        </button>
                      );
                    })}
                  </div>
                )}

                {evaluado && (
                  <div className={`mt-6 p-5 rounded-xl border-l-4 ${esReflexion || esCorrecta ? 'bg-blue-50 border-blue-500' : 'bg-amber-50 border-amber-500'}`}>
                    <h4 className={`font-bold mb-2 ${esReflexion || esCorrecta ? 'text-blue-900' : 'text-amber-900'}`}>
                      {esReflexion ? 'Criterio de evaluación:' : (esCorrecta ? '¡Correcto!' : 'Respuesta incorrecta')}
                    </h4>
                    {!esReflexion && !esCorrecta && (
                      <p className="text-sm font-bold text-amber-800 mb-2">
                        La respuesta correcta era: {pregunta.correct_answer}
                      </p>
                    )}
                    {pregunta.biblical_support && (
                      <p className={`text-sm leading-relaxed ${esReflexion || esCorrecta ? 'text-blue-800' : 'text-amber-800'}`}>
                        <span className="font-semibold block mb-1">Soporte Bíblico / Lógico:</span>
                        {pregunta.biblical_support}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* NUEVO: Tarjeta de Puntaje Final */}
        {evaluado && puntajeFinalPantalla !== null && (
          <div className="mt-12 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">¡Evaluación Completada!</h2>
            <p className="text-emerald-700 text-lg mb-4">Tu calificación final es:</p>
            <div className="text-6xl font-extrabold text-emerald-600 mb-2">{puntajeFinalPantalla}/100</div>
            <p className="text-sm text-emerald-600 font-medium mt-4">Tus respuestas y reflexiones han sido guardadas con éxito.</p>
          </div>
        )}

        {!evaluado ? (
          <button 
            onClick={evaluarYGuardar}
            disabled={guardando}
            className="mt-12 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xl py-5 rounded-2xl transition-transform hover:scale-[1.02] shadow-xl disabled:opacity-50"
          >
            {guardando ? 'Guardando resultados...' : 'Evaluar mis respuestas'}
          </button>
        ) : (
          <Link href="/dashboard" className="block text-center mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl py-5 rounded-2xl transition-transform hover:scale-[1.02] shadow-xl">
            Finalizar y Volver a INICIO
          </Link>
        )}

      </div>
    </main>
  );
}