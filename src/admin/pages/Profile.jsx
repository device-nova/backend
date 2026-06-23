import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, Moon, Sun, Monitor, Camera, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase.js';
import { getUserProfile, updateUserProfile, updateUserPhoto } from '../../services/userService.js';
import { uploadProfilePhoto } from '../../services/storageService.js';

function strengthScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Moderate', 'Strong', 'Very Strong'];
const STRENGTH_COLORS = ['bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-cyan', 'bg-success'];

export default function Profile() {
  const { addToast } = useAdmin();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [savedField, setSavedField] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { theme, toggleTheme, setTheme: setGlobalTheme } = useTheme();
  const [notifPrefs, setNotifPrefs] = useState({ critical: true, warning: true, info: false, digest: false });

  const fileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoURL(user.photoURL || '');
      getUserProfile(user.uid).then((p) => setProfile(p)).catch(() => {});
    }
  }, [user]);

  const score = strengthScore(newPw);

  function saveField(field) {
    if (field === 'Name' && name !== user.displayName) {
      updateProfile(auth.currentUser, { displayName: name });
      if (user) updateUserProfile(user.uid, { name }).catch(() => {});
    }
    if (field === 'Email') {
      addToast('Email changes require verification (coming soon)', 'warning');
      return;
    }
    setSavedField(field);
    addToast(`${field} updated`);
    setTimeout(() => setSavedField(null), 2000);
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProfilePhoto(file, user.uid);
      await updateProfile(auth.currentUser, { photoURL: url });
      await updateUserPhoto(user.uid, url);
      setPhotoURL(url);
      addToast('Photo updated');
    } catch {
      addToast('Upload failed', 'warning');
    } finally {
      setUploading(false);
    }
  }

  function updatePassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      addToast('Passwords do not match', 'warning');
      return;
    }
    if (score < 3) {
      addToast('Password is too weak', 'warning');
      return;
    }
    addToast('Password updated (Firebase requires re-auth for this — coming soon)');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {/* Identity */}
      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="group relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-cyan/30 bg-cyan/10">
              {photoURL ? (
                <img src={photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-2xl font-bold text-cyan">JO</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-raised text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </div>
            <button
              onClick={() => saveField('Name')}
              className="flex h-10 items-center gap-1 rounded-xl border border-cyan/30 bg-cyan/10 px-3 font-mono text-xs
                         text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {savedField === 'Name' ? <Check size={13} /> : null}
              {savedField === 'Name' ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              />
            </div>
            <button
              onClick={() => saveField('Email')}
              className="flex h-10 items-center gap-1 rounded-xl border border-cyan/30 bg-cyan/10 px-3 font-mono text-xs
                         text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              {savedField === 'Email' ? <Check size={13} /> : null}
              {savedField === 'Email' ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest2 text-muted">Role</span>
            <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 font-mono text-xs text-success">
              {profile?.role || 'Admin'}
            </span>
          </div>
          <p className="font-mono text-[0.65rem] text-muted">
            {profile?.createdAt
              ? `Member since ${new Date(profile.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : ''}
          </p>
        </div>
      </section>

      {/* Password */}
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-primary">Change Password</h2>
        <form onSubmit={updatePassword} className="flex flex-col gap-4">
          <PasswordField
            id="current-pw"
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            show={showCurrent}
            toggleShow={() => setShowCurrent((v) => !v)}
          />
          <PasswordField
            id="new-pw"
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            show={showNew}
            toggleShow={() => setShowNew((v) => !v)}
          />
          <PasswordField
            id="confirm-pw"
            label="Confirm Password"
            value={confirmPw}
            onChange={setConfirmPw}
            show={showConfirm}
            toggleShow={() => setShowConfirm((v) => !v)}
          />

          {newPw && (
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i < score ? STRENGTH_COLORS[score - 1] : 'bg-border'}`}
                  />
                ))}
              </div>
              <span className={`font-mono text-xs ${score > 0 ? 'text-primary' : 'text-muted'}`}>
                {score > 0 ? STRENGTH_LABELS[score - 1] : 'Weak'}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="self-start rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 font-mono text-xs text-cyan
                       hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* Sessions & Preferences */}
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-primary">Preferences</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest2 text-muted">Theme</label>
            <div className="flex gap-2">
              {[
                { key: 'dark', icon: Moon, label: 'Dark' },
                { key: 'light', icon: Sun, label: 'Light' },
                { key: 'system', icon: Monitor, label: 'System' },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() =>
                      t.key === 'system'
                        ? (toggleTheme(), setGlobalTheme('dark'))
                        : setGlobalTheme(t.key)
                    }
                    aria-pressed={theme === t.key}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs transition-colors
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan ${
                                  theme === t.key
                                    ? 'border-cyan/40 bg-cyan/10 text-cyan'
                                    : 'border-border text-muted hover:text-primary'
                                }`}
                  >
                    <Icon size={13} aria-hidden="true" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest2 text-muted">Notification Preferences</label>
            <div className="flex flex-col gap-3">
              {[
                { key: 'critical', label: 'Critical alerts' },
                { key: 'warning', label: 'Warning alerts' },
                { key: 'info', label: 'Info alerts' },
                { key: 'digest', label: 'Weekly digest' },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-primary">{n.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifPrefs((prev) => ({ ...prev, [n.key]: !prev[n.key] }))
                    }
                    aria-pressed={notifPrefs[n.key]}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifPrefs[n.key] ? 'bg-cyan' : 'bg-surface-raised'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-void transition-transform ${
                        notifPrefs[n.key] ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, toggleShow }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 pr-10 text-sm text-primary
                     placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        />
        <button
          type="button"
          onClick={toggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}
