import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthProps {
    onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [needsConfirmation, setNeedsConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;

                if (data.user && data.session === null) {
                    setNeedsConfirmation(true);
                } else if (data.session) {
                    onSuccess();
                }
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                onSuccess();
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            if (err.message === 'Invalid login credentials') {
                setError('Email o contraseña incorrectos.');
            } else if (err.message === 'Email not confirmed') {
                setError('Por favor, confirma tu email antes de iniciar sesión.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (needsConfirmation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center animate-fade-in">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-primary">mark_email_read</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">¡Ya casi está!</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Hemos enviado un enlace de confirmación a <span className="font-bold text-slate-900 dark:text-white">{email}</span>.
                    </p>
                    <p className="text-sm text-slate-400">
                        Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
                    </p>
                    <button
                        onClick={() => setNeedsConfirmation(false)}
                        className="w-full py-3 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <h1 className="text-3xl font-bold text-center text-primary font-display">World Cup Tracker</h1>
                <p className="text-center text-slate-500 dark:text-slate-400">
                    {isSignUp ? 'Crea tu cuenta para empezar' : 'Inicia sesión para continuar'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center text-sm">
                    {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="ml-2 text-primary font-bold"
                    >
                        {isSignUp ? 'Inicia Sesión' : 'Regístrate'}
                    </button>
                </p>
            </div>
        </div>
    );
};
