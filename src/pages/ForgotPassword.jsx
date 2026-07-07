import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { resetPassword } from '../services/authService.js';
import logoDark from '../assets/logos/logo-dark.png';
import logoLight from '../assets/logos/logo-light.png';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await resetPassword(trimmedEmail);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 flex flex-col items-center gap-4">
          <img
            src={theme === 'dark' ? logoLight : logoDark}
            alt="Device-Nova"
            className="h-14 w-auto sm:h-16"
          />
          <p className="font-mono text-xs text-muted">Reset your password</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
            {error}
          </div>
        )}

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={40} className="text-success" />
            <p className="text-center font-mono text-sm text-primary">Password reset link sent!</p>
            <p className="text-center font-mono text-xs text-muted">
              Check your email inbox at <span className="text-cyan">{email}</span> and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="mt-2 flex items-center gap-1.5 font-mono text-xs text-cyan hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="reset-email" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 font-mono text-sm text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
              ) : (
                <Mail size={15} />
              )}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link to="/login" className="mt-2 flex items-center justify-center gap-1.5 font-mono text-xs text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
