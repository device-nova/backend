// src/admin/pages/Users.jsx
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, X, MoreVertical, Pencil, UserX, UserCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext.jsx';
import { SkeletonRow } from '../components/SkeletonCard.jsx';

const ROLES = ['Super Admin', 'Admin', 'Operator', 'Viewer'];

const emptyForm = { id: null, name: '', email: '', role: 'Viewer', status: 'active', welcomeEmail: false };

export default function Users() {
  const { users, usersLoading, addToast } = useAdmin();
  const [localUsers, setLocalUsers] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState(null);

  useEffect(() => {
    if (!hydrated && users.length) {
      setLocalUsers(users);
      setHydrated(true);
    }
  }, [users, hydrated]);

  const filtered = useMemo(
    () =>
      localUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ),
    [localUsers, search]
  );

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setPanelOpen(true);
  }

  function openEdit(user) {
    setForm({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, welcomeEmail: false });
    setErrors({});
    setPanelOpen(true);
    setMenuOpenId(null);
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    return next;
  }

  function handleSave(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    if (form.id) {
      setLocalUsers((prev) => prev.map((u) => (u.id === form.id ? { ...u, ...form } : u)));
      addToast('User updated successfully');
    } else {
      const newUser = {
        id: `USR-${String(localUsers.length + 1).padStart(3, '0')}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        lastActive: 'Just now',
      };
      setLocalUsers((prev) => [newUser, ...prev]);
      addToast(form.welcomeEmail ? `${newUser.name} added — welcome email sent` : `${newUser.name} added`);
    }
    setPanelOpen(false);
  }

  function deactivate(id) {
    setLocalUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'inactive' } : u)));
    addToast('User deactivated', 'warning');
    setConfirmDeactivateId(null);
    setMenuOpenId(null);
  }

  function reactivate(id) {
    setLocalUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u)));
    addToast('User reactivated');
    setMenuOpenId(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            aria-label="Search users"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-primary
                       placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 self-start rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2.5
                     font-mono text-xs text-cyan transition-colors hover:bg-cyan/20 focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-cyan sm:self-auto"
        >
          <Plus size={13} /> Add User
        </button>
      </div>

      {usersLoading ? (
        <div className="rounded-2xl border border-border bg-surface">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full">
            <thead className="bg-surface-raised">
              <tr>
                {['User', 'Role', 'Status', 'Last Active', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest2 text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-raised">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-cyan/20 bg-cyan/10">
                        <span className="font-mono text-xs font-semibold text-cyan">
                          {u.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">{u.name}</p>
                        <p className="truncate font-mono text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest2 ${
                        u.status === 'active'
                          ? 'border-success/20 bg-success/10 text-success'
                          : 'border-border bg-surface-raised text-muted'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{u.lastActive}</td>
                  <td className="relative px-4 py-3">
                    {confirmDeactivateId === u.id ? (
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="font-mono text-[0.65rem] text-amber">Are you sure?</span>
                        <button onClick={() => deactivate(u.id)} className="font-mono text-[0.65rem] text-amber underline">
                          Yes, deactivate
                        </button>
                        <button onClick={() => setConfirmDeactivateId(null)} className="font-mono text-[0.65rem] text-muted">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === u.id ? null : u.id)}
                        aria-label={`Actions for ${u.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-primary"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                      >
                        <MoreVertical size={15} />
                      </button>
                    )}
                    <AnimatePresence>
                      {menuOpenId === u.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          className="absolute right-2 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border
                                     border-border bg-surface-raised shadow-lg"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                        >
                          <button
                            onClick={() => openEdit(u)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-primary hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                          >
                            <Pencil size={13} className="text-muted" /> Edit
                          </button>
                          {u.status === 'active' ? (
                            <button
                              onClick={() => {
                                setMenuOpenId(null);
                                setConfirmDeactivateId(u.id);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-amber hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                            >
                              <UserX size={13} /> Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivate(u.id)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-success hover:bg-surface"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                            >
                              <UserCheck size={13} /> Reactivate
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit slide-in panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label={form.id ? 'Edit user' : 'Add user'}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] overflow-y-auto border-l border-border bg-surface p-6"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-primary">{form.id ? 'Edit User' : 'Add User'}</h2>
                <button
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close panel"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-raised hover:text-primary"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="u-name" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                    Full Name
                  </label>
                  <input
                    id="u-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="u-email" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                    Email
                  </label>
                  <input
                    id="u-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="u-role" className="mb-1.5 block font-mono text-xs uppercase tracking-widest2 text-muted">
                    Role
                  </label>
                  <select
                    id="u-role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-sm text-primary
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="flex items-center gap-3">
                  <legend className="mb-1.5 block w-full font-mono text-xs uppercase tracking-widest2 text-muted">
                    Status
                  </legend>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, status: f.status === 'active' ? 'inactive' : 'active' }))}
                    aria-pressed={form.status === 'active'}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      form.status === 'active' ? 'bg-cyan' : 'bg-surface-raised'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-void transition-transform ${
                        form.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-primary">{form.status === 'active' ? 'Active' : 'Inactive'}</span>
                </fieldset>

                {!form.id && (
                  <label className="flex items-center gap-2 text-sm text-primary">
                    <input
                      type="checkbox"
                      checked={form.welcomeEmail}
                      onChange={(e) => setForm((f) => ({ ...f, welcomeEmail: e.target.checked }))}
                      className="h-4 w-4 rounded border-border accent-cyan-600"
                    />
                    Send Welcome Email
                  </label>
                )}

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 font-mono text-xs text-primary hover:border-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2 font-mono text-xs text-cyan hover:bg-cyan/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
