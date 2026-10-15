import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Login({ onLogin }) {
    const [step, setStep] = useState('email'); // 'email' or 'pin'
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setStep('pin');
            } else {
                setError(data.error || 'Invalid email');
            }
        } catch (err) {
            setError('Connection error');
        }
        setLoading(false);
    };

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/auth/verify-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pin })
            });

            const data = await res.json();

            if (res.ok) {
                // Store auth in localStorage
                localStorage.setItem('expense_auth', JSON.stringify({ email, authenticated: true, token: data.token }));
                onLogin();
            } else {
                setError(data.error || 'Invalid PIN');
            }
        } catch (err) {
            setError('Connection error');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[100dvh] bg-ground flex flex-col">
            <div className="bg-shell text-shell-ink px-5 pt-10 pb-24 sm:pb-28">
                <div className="max-w-sm mx-auto">
                    <h1 className="text-[1.75rem] font-extrabold tracking-tight">Finance Tracker</h1>
                    <p className="text-sm text-shell-dim mt-1">Income, spending and what's left.</p>
                </div>
            </div>
            <div className="flex-1 px-4 -mt-16 sm:-mt-20">
                <div className="sheet max-w-sm mx-auto p-6 sm:p-7" style={{ boxShadow: 'var(--shadow)' }}>
                    <h2 className="text-lg font-bold">{step === 'email' ? 'Sign in' : 'Enter your PIN'}</h2>
                    <p className="text-sm text-ink-3 mt-1 mb-6">
                        {step === 'email' ? 'Enter your email to continue.' : <>Signing in as <span className="text-ink-2 font-medium break-all">{email}</span>.</>}
                    </p>

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <label className="block">
                                <span className="form-head block mb-1.5">Email address</span>
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="field h-11 text-base"
                                    placeholder="you@example.com"
                                />
                            </label>

                            {error && (
                                <p role="alert" className="text-sm text-out bg-out-soft rounded-lg px-3 py-2.5">{error}</p>
                            )}

                            <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Verifying…' : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <label className="block">
                                <span className="form-head block mb-1.5">PIN code</span>
                                <input
                                    type="password"
                                    required
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="field h-14 text-center text-2xl tracking-[0.5em] num"
                                    placeholder="••••••"
                                    maxLength={10}
                                />
                            </label>

                            <p className="text-sm text-ink-3">
                                No PIN? Send <code className="font-semibold text-ink bg-well px-1.5 py-0.5 rounded">/pin</code> to the WhatsApp bot.
                            </p>

                            {error && (
                                <p role="alert" className="text-sm text-out bg-out-soft rounded-lg px-3 py-2.5">{error}</p>
                            )}

                            <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Verifying…' : 'Sign in'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('email'); setError(''); }}
                                className="btn w-full text-ink-2 hover:text-ink hover:bg-well"
                            >
                                <ArrowLeft className="w-4 h-4" /> Use a different email
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
