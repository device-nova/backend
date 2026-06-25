// src/admin/components/DeviceTable.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Eye,
  RotateCw,
  UploadCloud,
  PowerOff,
  Power,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { useAdmin } from '../context/AdminContext.jsx';

const COLUMNS = [
  { key: 'id', label: 'Device ID' },
  { key: 'status', label: 'Status' },
  { key: 'model', label: 'Model Active' },
  { key: 'latency', label: 'Latency' },
  { key: 'lastSeen', label: 'Last Seen' },
  { key: 'location', label: 'Location' },
];

const PAGE_SIZE = 10;

function RowMenu({ device, onClose, anchorRef }) {
  const navigate = useNavigate();
  const { setDeviceStatus, restartDeviceAI, addToast } = useAdmin();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!menuRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  const items = [
    { label: 'View Details', icon: Eye, action: () => navigate(`/admin/devices/${device.id}`) },
    { label: 'Restart AI Inference', icon: RotateCw, action: () => restartDeviceAI(device.id) },
    { label: 'Push Model Update', icon: UploadCloud, action: () => addToast(`Model update queued for ${device.id}`) },
    device.status === 'offline'
      ? { label: 'Bring Online', icon: Power, action: () => { setDeviceStatus(device.id, 'online'); addToast(`${device.id} brought online`); } }
      : { label: 'Take Offline', icon: PowerOff, action: () => { setDeviceStatus(device.id, 'offline'); addToast(`${device.id} taken offline`, 'warning'); } },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-border
                 bg-surface-raised shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.action();
            onClose();
          }}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-primary
                     transition-colors hover:bg-surface focus-visible:outline-none focus-visible:bg-surface"
        >
          <item.icon size={16} className="text-muted" aria-hidden="true" />
          {item.label}
        </button>
      ))}
      <div className="border-t border-border" />
      <button
        onClick={() => {
          addToast(`${device.id} removed from fleet`, 'warning');
          onClose();
        }}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-amber
                   transition-colors hover:bg-surface focus-visible:outline-none focus-visible:bg-surface"
      >
        <Trash2 size={16} aria-hidden="true" />
        Remove Device
      </button>
    </motion.div>
  );
}

export default function DeviceTable({ devices }) {
  const navigate = useNavigate();
  const { setDeviceStatus, restartDeviceAI, addToast } = useAdmin();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const anchorRefs = useRef({});

  const sorted = useMemo(() => {
    if (!sortKey) return devices;
    const copy = [...devices];
    copy.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return String(av).localeCompare(String(bv), undefined, { numeric: true });
    });
    if (sortDir === 'desc') copy.reverse();
    return copy;
  }, [devices, sortKey, sortDir]);

  const totalPages = Math.max(Math.ceil(sorted.length / PAGE_SIZE), 1);
  const clampedPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [devices.length, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir('asc');
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelected((prev) => {
      const allSelected = pageItems.every((d) => prev.has(d.id));
      const next = new Set(prev);
      pageItems.forEach((d) => (allSelected ? next.delete(d.id) : next.add(d.id)));
      return next;
    });
  }

  function bulkAction(label, fn) {
    selected.forEach((id) => fn(id));
    addToast(`${label}: ${selected.size} device${selected.size === 1 ? '' : 's'}`);
    setSelected(new Set());
  }

  function goToPage(n) {
    const clamped = Math.min(Math.max(n, 1), totalPages);
    setPage(clamped);
    setPageInput(String(clamped));
  }

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((d) => selected.has(d.id));

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-visible">
          <table className="w-full">
            <thead className="bg-surface-raised">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all devices on this page"
                    className="h-4 w-4 rounded border-border accent-cyan-600"
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer select-none px-4 py-3 text-left font-mono text-xs uppercase
                               tracking-widest2 text-muted transition-colors hover:text-primary"
                    onClick={() => handleSort(col.key)}
                    scope="col"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest2 text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.map((device, i) => (
                <motion.tr
                  key={device.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`relative cursor-pointer transition-all hover:bg-surface-raised hover:border-l-2
                              hover:border-cyan ${selected.has(device.id) ? 'bg-cyan/5' : ''}`}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(device.id)}
                      onChange={() => toggleSelect(device.id)}
                      aria-label={`Select ${device.id}`}
                      className="h-4 w-4 rounded border-border accent-cyan-600"
                    />
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-sm font-semibold text-cyan"
                    onClick={() => navigate(`/admin/devices/${device.id}`)}
                  >
                    {device.id}
                  </td>
                  <td className="px-4 py-3" onClick={() => navigate(`/admin/devices/${device.id}`)}>
                    <StatusBadge status={device.status} />
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-sm text-primary"
                    onClick={() => navigate(`/admin/devices/${device.id}`)}
                  >
                    {device.model || '—'}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-sm tabular-nums text-primary"
                    onClick={() => navigate(`/admin/devices/${device.id}`)}
                  >
                    {device.latency}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs text-muted"
                    onClick={() => navigate(`/admin/devices/${device.id}`)}
                  >
                    {device.lastSeen}
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs text-muted"
                    onClick={() => navigate(`/admin/devices/${device.id}`)}
                  >
                    {device.location}
                  </td>
                  <td className="relative px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      ref={(el) => (anchorRefs.current[device.id] = el)}
                      onClick={() => setOpenMenuId(openMenuId === device.id ? null : device.id)}
                      aria-label={`Actions for ${device.id}`}
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === device.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted
                                 transition-colors hover:bg-surface hover:text-primary focus-visible:outline-none
                                 focus-visible:ring-2 focus-visible:ring-cyan"
                    >
                      <MoreVertical size={16} />
                    </button>
                    <AnimatePresence>
                      {openMenuId === device.id && (
                        <RowMenu
                          device={device}
                          onClose={() => setOpenMenuId(null)}
                          anchorRef={{ current: anchorRefs.current[device.id] }}
                        />
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {pageItems.map((device, i) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/admin/devices/${device.id}`)}
            className="flex items-start justify-between rounded-2xl border border-border bg-surface p-4
                       transition-all duration-200 active:bg-surface-raised"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={device.status} compact />
                <span className="font-mono text-sm font-semibold text-primary">{device.id}</span>
              </div>
              <span className="font-mono text-xs text-muted">{device.location}</span>
              {device.model && <span className="font-mono text-[0.65rem] text-cyan">{device.model}</span>}
              <span className="font-mono text-[0.6rem] text-muted">{device.lastSeen}</span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {device.latency !== '—' && <span className="font-mono text-xs text-cyan">{device.latency}</span>}
              <ChevronRight size={16} className="text-muted" aria-hidden="true" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="font-mono text-xs text-muted">
          {sorted.length} device{sorted.length === 1 ? '' : 's'} · page {clampedPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(clampedPage - 1)}
            disabled={clampedPage === 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-mono text-xs
                       text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
            Page
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => goToPage(parseInt(pageInput, 10) || 1)}
              onKeyDown={(e) => e.key === 'Enter' && goToPage(parseInt(pageInput, 10) || 1)}
              aria-label="Jump to page"
              className="w-12 rounded-lg border border-border bg-surface-raised px-2 py-1 text-center text-primary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            />
            of {totalPages}
          </div>
          <button
            onClick={() => goToPage(clampedPage + 1)}
            disabled={clampedPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-mono text-xs
                       text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="sticky bottom-4 z-20 mx-auto flex w-full max-w-xl flex-wrap items-center justify-between
                       gap-3 rounded-2xl border border-cyan/30 bg-surface-raised px-4 py-3 shadow-lg backdrop-blur"
          >
            <span className="font-mono text-xs text-primary">{selected.size} devices selected</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => bulkAction('Restart AI', restartDeviceAI)}
                className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 font-mono text-xs text-cyan
                           hover:bg-cyan/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              >
                Restart AI
              </button>
              <button
                onClick={() => bulkAction('Took offline', (id) => setDeviceStatus(id, 'offline'))}
                className="rounded-lg border border-amber/30 bg-amber/10 px-3 py-1.5 font-mono text-xs text-amber
                           hover:bg-amber/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
              >
                Take Offline
              </button>
              <button
                onClick={() => addToast(`Exported ${selected.size} devices to CSV`)}
                className="rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-primary
                           hover:border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              >
                Export
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="font-mono text-xs text-muted hover:text-primary"
              >
                Deselect all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
