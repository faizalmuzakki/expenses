import { Component, useEffect } from 'react';
import { X, TriangleAlert } from 'lucide-react';
import { terbilang } from './terbilang';

export { terbilang };

// Display-only helpers. No amount math here beyond formatting.

export const formatNumber = (n) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(n) || 0);

const TONE = { in: 'text-in', out: 'text-out', ink: 'text-ink', carbon: 'text-carbon' };

// The kwitansi amount box: hatched "Rp" tab + tabular figure.
export function AmountBox({ value, tone = 'ink', sign = '', size = 'md', currency = 'Rp', className = '' }) {
  const fig = size === 'lg' ? 'text-2xl sm:text-[1.75rem]' : size === 'sm' ? 'text-base' : 'text-xl';
  return (
    <div className={`amount-box ${className}`}>
      <span className="amount-rp">{currency}</span>
      <span className={`amount-fig ${fig} ${TONE[tone]}`}>{sign}{formatNumber(value)}</span>
    </div>
  );
}

export function Terbilang({ value, className = '' }) {
  const words = terbilang(value);
  if (!words || !Number(value)) return null;
  return <p className={`text-xs italic text-ink-3 first-letter:uppercase ${className}`}>{words} rupiah</p>;
}

export function CategoryChip({ name, icon, color }) {
  if (!name) return <span className="text-sm text-ink-3">Uncategorized</span>;
  return (
    <span className="chip" title={name}>
      <span className="chip-dot" style={{ backgroundColor: color || 'var(--ink-3)' }} />
      {icon && <span aria-hidden="true">{icon}</span>}
      <span className="truncate">{name}</span>
    </span>
  );
}

export function SignedAmount({ type, amount, formatCurrency, className = '' }) {
  const isIn = type === 'income';
  return (
    <span className={`num font-semibold ${isIn ? 'text-in' : 'text-ink'} ${className}`}>
      {isIn ? '+' : '−'}{formatCurrency(amount)}
    </span>
  );
}

// Sheet on phones, centred dialog from sm up. Escape and scrim click call onClose.
export function Dialog({ title, onClose, children, footer, wide = false, tone }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const band = tone === 'in' ? 'bg-in' : tone === 'out' ? 'bg-out' : 'bg-carbon';
  return (
    <div className="scrim" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`dialog ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1 ${band}`} />
        <div className="sticky top-0 z-10 bg-sheet flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-rule">
          <h3 className="text-lg font-bold min-w-0">{title}</h3>
          <button type="button" onClick={onClose} className="icon-btn -mr-2" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && <div className="sticky bottom-0 bg-sheet border-t border-rule px-5 py-4 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="form-head block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      {Icon && <Icon className="w-8 h-8 text-ink-3 mb-3" strokeWidth={1.5} />}
      <p className="font-semibold text-ink">{title}</p>
      {children && <p className="text-sm text-ink-3 mt-1 max-w-sm">{children}</p>}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h3 className="text-base font-bold text-ink flex items-center gap-2">{children}</h3>
      {action}
    </div>
  );
}

// Keeps the shell usable when a tab throws (e.g. an API error payload where a list was expected).
export class TabErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Tab crashed:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="sheet">
        <Empty icon={TriangleAlert} title="This section couldn't load">
          The server sent something unexpected. Check your connection, then reload.
        </Empty>
        <div className="flex justify-center pb-8">
          <button className="btn-quiet" onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}
