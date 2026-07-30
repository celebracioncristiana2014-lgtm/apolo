"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function PantallaLogin() {
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Revisar automáticamente si el alumno ya dejó su sesión abierta
  useEffect(() => {
    const revisarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    revisarSesion();
  }, [router]);

  const prepararCredenciales = () => {
    const fakeEmail = `${nombre.trim().toLowerCase().replace(/\s+/g, '.')}@apolo.com`;
    const safePassword = `${pin}-apolo`; 
    return { fakeEmail, safePassword };
  };

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiamos errores de intentos anteriores para que no se trabe

    const { fakeEmail, safePassword } = prepararCredenciales();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: safePassword
    });

    if (signInError) {
      // Mostramos el error real de Supabase para saber exactamente qué pasa
      setError(`Error al entrar: ${signInError.message}`);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const registrarse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Limpiamos errores de intentos anteriores para que no se trabe

    const { fakeEmail, safePassword } = prepararCredenciales();

    const { error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password: safePassword
    });

    if (signUpError) {
      setError(`Error al crear cuenta: ${signUpError.message}`);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Comprobando acceso...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Apologética Avanzada</h1>
          <p className="text-slate-500">Ingresá tu nombre y PIN para acceder</p>
        </div>

        <form className="space-y-6" onSubmit={iniciarSesion}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre y Apellido</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all text-slate-900 font-medium"
              placeholder="Ej: Juan Perez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">PIN de Acceso (4 números)</label>
            <input 
              type="number" 
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 4))}
              className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all text-center tracking-widest text-lg font-bold text-slate-900"
              placeholder="••••"
              maxLength={4}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading || !nombre || pin.length !== 4}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-transform hover:scale-[1.02] shadow-md disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Entrar a mis clases'}
            </button>
            
            <button 
              type="button" 
              onClick={registrarse}
              disabled={loading || !nombre || pin.length !== 4}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl transition-colors border-2 border-emerald-200 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Crear alumno nuevo'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}