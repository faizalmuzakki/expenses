import { useState } from 'react';

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
                localStorage.setItem('expense_auth', JSON.stringify({ email, authenticated: true }));
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
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">💰</div>
                    <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
                    <p className="text-gray-500 mt-2">
                        {step === 'email' ? 'Enter your email to continue' : 'Enter your PIN'}
                    </p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="you@example.com"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Continue'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PIN Code
                            </label>
                            <input
                                type="password"
                                required
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="••••••"
                                maxLength={10}
                            />
                        </div>

                        <p className="text-sm text-gray-500 text-center">
                            Send <code className="bg-gray-100 px-2 py-1 rounded">/pin</code> to WhatsApp bot to get your PIN
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('email'); setError(''); }}
                            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
                        >
                            ← Back to email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
