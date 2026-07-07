import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { registerUser, loginWithGoogle } from '../services/authService.js';
import logoDark from '../assets/logos/logo-dark.png';
import logoLight from '../assets/logos/logo-light.png';

export default function Signup() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function strengthScore(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const score = strengthScore(password);
  const STRENGTH_LABELS = ['Weak', 'Fair', 'Moderate', 'Strong', 'Very Strong'];
  const STRENGTH_COLORS = ['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-cyan', 'bg-success'];

  async function handleEmailSignup(e) {
    e.preventDefault();
    setError('');

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirst) { setError('Please enter your first name.'); return; }
    if (!trimmedLast) { setError('Please enter your last name.'); return; }
    if (!trimmedEmail) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter a password.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (score < 2) { setError('Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.'); return; }

    setLoading(true);
    try {
      await registerUser(trimmedEmail, password, trimmedFirst, trimmedLast);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
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
          <p className="font-mono text-xs text-muted">Create your account</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 font-mono text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="flex flex-col gap-4" noValidate>
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="firstName" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); if (error) setError(''); }}
                required
                autoComplete="given-name"
                placeholder="James"
                className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); if (error) setError(''); }}
                required
                autoComplete="family-name"
                placeholder="Okonkwo"
                className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 pr-10 text-sm text-primary placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex flex-1 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? STRENGTH_COLORS[score - 1] : 'bg-border'}`} />
                  ))}
                </div>
                <span className={`font-mono text-xs ${score > 0 ? 'text-primary' : 'text-muted'}`}>
                  {score > 0 ? STRENGTH_LABELS[score - 1] : 'Weak'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPw" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
              Confirm Password
            </label>
            <input
              id="confirmPw"
              type="password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); if (error) setError(''); }}
              required
              autoComplete="new-password"
              placeholder="••••••••"
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
              <UserPlus size={15} />
            )}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          aria-busy={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2.5 font-mono text-sm text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center font-mono text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
