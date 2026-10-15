import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, LogOut, Image, Plane, Loader2, LayoutDashboard, ReceiptText, Tags, TrendingUp, Search, MessageCircle, PenLine, Inbox, Calendar } from 'lucide-react';
import Login from './Login';
import { installAuthFetch, withToken, errorText } from './auth';
import InvestmentTracker from './InvestmentTracker';
import TravelExpenses from './TravelExpenses';
import { AmountBox, Terbilang, CategoryChip, SignedAmount, Dialog, Field, Empty, SectionTitle, TabErrorBoundary } from './ui';
import { localDate, startOfMonth } from './dates';

const API_URL = import.meta.env.VITE_API_URL || '';
installAuthFetch(API_URL);

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: ReceiptText },
  { key: 'categories', label: 'Categories', icon: Tags },
  { key: 'investments', label: 'Investments', icon: TrendingUp },
  { key: 'travel', label: 'Travel', icon: Plane },
];

// Display-only date formatting for 'YYYY-MM-DD' strings (parsed as local dates).
const parseDay = (s) => {
  const [y, m, d] = String(s || '').split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};
const fmtDay = (s, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  const d = parseDay(s);
  return d ? d.toLocaleDateString('en-GB', opts) : s || '';
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    net: 0,
    count: 0,
    byCategory: []
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(),
    endDate: localDate()
  });
  const [allTime, setAllTime] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem('expense_auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.authenticated) {
          setIsAuthenticated(true);
        }
      } catch { }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [dateRange, allTime, searchQuery, categoryId, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('expense_auth');
    setIsAuthenticated(false);
  };

  async function fetchData() {
    setLoading(true);
    try {
      // "All time" just drops the bounds - the API treats them as optional
      let expenseParams = new URLSearchParams({ limit: 1000 });
      if (!allTime) {
        expenseParams.append('startDate', dateRange.startDate);
        expenseParams.append('endDate', dateRange.endDate);
      }
      if (searchQuery) expenseParams.append('search', searchQuery);
      if (categoryId) expenseParams.append('categoryId', categoryId);

      let statsParams = new URLSearchParams();
      if (!allTime) {
        statsParams.append('startDate', dateRange.startDate);
        statsParams.append('endDate', dateRange.endDate);
      }
      if (searchQuery) statsParams.append('search', searchQuery);
      if (categoryId) statsParams.append('categoryId', categoryId);

      const [expRes, catRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/expenses?${expenseParams.toString()}`),
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/stats/summary?${statsParams.toString()}`)
      ]);

      setExpenses(await expRes.json());
      setCategories(await catRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Keep the current screen on refetch (dimmed) instead of blanking it; skeleton only before the first load.
  const [loadedOnce, setLoadedOnce] = useState(false);
  useEffect(() => {
    if (!loading) setLoadedOnce(true);
  }, [loading]);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const showFilters = activeTab === 'dashboard' || activeTab === 'transactions';
  const periodLabel = allTime
    ? 'All time'
    : `${fmtDay(dateRange.startDate, { day: 'numeric', month: 'short' })} – ${fmtDay(dateRange.endDate)}`;

  return (
    <div className="min-h-[100dvh] bg-ground pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="bg-shell text-shell-ink sticky top-0 z-40 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-8">
          <span className="text-lg font-extrabold tracking-tight whitespace-nowrap">Finance Tracker</span>
          <nav className="hidden md:flex self-stretch gap-1" aria-label="Sections">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                aria-current={activeTab === key ? 'page' : undefined}
                className={`relative flex items-center gap-2 px-3 text-sm font-semibold transition-colors ${activeTab === key
                  ? 'text-shell-ink after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-shell-ink'
                  : 'text-shell-dim hover:text-shell-ink'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 h-9 px-3 -mr-3 rounded-lg text-sm font-semibold text-shell-dim hover:text-shell-ink hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </div>
      </header>

      {/* Phone: thumb-reachable tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sheet border-t border-rule grid grid-cols-5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
        aria-label="Sections"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            aria-current={activeTab === key ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold transition-colors ${activeTab === key ? 'text-carbon' : 'text-ink-3'}`}
          >
            {activeTab === key && <span className="absolute top-0 inset-x-4 h-[3px] rounded-b bg-carbon" />}
            <Icon className="w-5 h-5" strokeWidth={activeTab === key ? 2.25 : 1.75} />
            {label}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <TabErrorBoundary key={activeTab}>
        {showFilters && (
          <section className="mb-6" aria-label="Period and filters">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-2xl sm:text-[1.75rem] font-extrabold tracking-tight num">{periodLabel}</h1>
              {loading && loadedOnce && <span className="text-xs font-medium text-ink-3">Updating…</span>}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-end">
              <Field label="From" className="lg:w-40">
                <input
                  type="date"
                  value={dateRange.startDate}
                  disabled={allTime}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="field num"
                />
              </Field>
              <Field label="To" className="lg:w-40">
                <input
                  type="date"
                  value={dateRange.endDate}
                  disabled={allTime}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="field num"
                />
              </Field>
              <button
                type="button"
                onClick={() => setAllTime(prev => !prev)}
                aria-pressed={allTime}
                title={allTime ? 'Showing all time - click to use the date range' : 'Ignore the date range and show everything'}
                className={`btn border ${allTime
                  ? 'bg-carbon-soft border-carbon text-carbon'
                  : 'bg-sheet border-rule-strong text-ink-2 hover:bg-well'}`}
              >
                <Calendar className="w-4 h-4" />
                All time
              </button>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-label="Category"
                className="field lg:w-44"
              >
                <option value="">All categories</option>
                <CategoryOptions categories={categories} />
              </select>
              <label className="relative col-span-2 lg:ml-auto lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3 pointer-events-none" />
                <span className="sr-only">Search descriptions</span>
                <input
                  type="search"
                  placeholder="Search descriptions"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="field pl-9"
                />
              </label>
            </div>
            <div className={`mt-4 ${loading && loadedOnce ? 'progress-line' : 'h-[2px]'}`} />
          </section>
        )}

        {loading && !loadedOnce ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading">
            <div className="grid sm:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <div key={i} className="sheet h-28 animate-pulse" />)}
            </div>
            <div className="sheet h-64 animate-pulse" />
          </div>
        ) : (
          <div className={`transition-opacity duration-200 ${loading && showFilters ? 'opacity-60' : ''}`}>
            {activeTab === 'dashboard' && (
              <Dashboard stats={stats} formatCurrency={formatCurrency} />
            )}
            {activeTab === 'transactions' && (
              <TransactionList
                expenses={expenses}
                categories={categories}
                formatCurrency={formatCurrency}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'categories' && (
              <CategoryList
                categories={categories}
                onRefresh={fetchData}
              />
            )}
            {activeTab === 'investments' && (
              <InvestmentTracker formatCurrency={formatCurrency} />
            )}
            {activeTab === 'travel' && (
              <TravelExpenses formatCurrency={formatCurrency} />
            )}
          </div>
        )}
        </TabErrorBoundary>
      </main>
    </div>
  );
}

// Rendered as a child so a malformed categories payload is caught by TabErrorBoundary.
const CategoryOptions = ({ categories }) => categories.map(c => (
  <option key={c.id} value={c.id}>
    {c.name}
  </option>
));

// Categories created by the spreadsheet backfill have a null color. Fall back to
// a stable palette so uncoloured categories stay distinct.
const FALLBACK_CATEGORY_COLORS = [
  '#6366F1', '#F59E0B', '#14B8A6', '#EC4899',
  '#8B5CF6', '#0EA5E9', '#84CC16', '#F97316'
];

const categoryColor = (color, index) =>
  color || FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length];

// Ranked category list: name, amount, share bar. Replaces the label-less pies.
function Breakdown({ rows, formatCurrency, emptyText }) {
  if (rows.length === 0) return <Empty icon={Inbox} title={emptyText} />;
  const total = rows.reduce((s, r) => s + r.value, 0);
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const max = sorted[0].value;
  return (
    <ol className="divide-y divide-rule">
      {sorted.map(r => {
        const share = total > 0 ? (r.value / total) * 100 : 0;
        return (
          <li key={r.name} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex items-center gap-2 min-w-0">
                <span className="chip-dot" style={{ backgroundColor: r.color }} />
                <span className="font-medium truncate">{r.name}</span>
              </span>
              <span className="flex items-baseline gap-3 shrink-0">
                <span className="num text-xs text-ink-3 w-10 text-right">{share.toFixed(share < 10 ? 1 : 0)}%</span>
                <span className="num font-semibold">{formatCurrency(r.value)}</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-well overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${max > 0 ? (r.value / max) * 100 : 0}%`, backgroundColor: r.color }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Dashboard({ stats, formatCurrency }) {
  const expenseData = stats.byCategory
    .filter(c => c.total > 0 && c.category_type === 'expense')
    .map((c, i) => ({ name: c.name, value: c.total, color: categoryColor(c.color, i) }));

  const incomeData = stats.byCategory
    .filter(c => c.total > 0 && c.category_type === 'income')
    .map((c, i) => ({ name: c.name, value: c.total, color: categoryColor(c.color, i) }));

  const income = stats.income || 0;
  const spent = stats.expenses || 0;
  const net = stats.net || 0;
  const spentShare = income > 0 ? (spent / income) * 100 : null;

  return (
    <div className="space-y-6">
      {/* Statement: three kwitansi amount fields */}
      <section className="grid sm:grid-cols-3 gap-3" aria-label="Summary">
        <div className="sheet p-4">
          <p className="form-head mb-2">Money in</p>
          <AmountBox value={income} tone="in" size="lg" />
          <p className="text-xs text-ink-3 mt-2 num">{stats.count || 0} transactions in period</p>
        </div>
        <div className="sheet p-4">
          <p className="form-head mb-2">Money out</p>
          <AmountBox value={spent} tone="out" size="lg" />
          <p className="text-xs text-ink-3 mt-2 num">
            {spentShare === null ? 'No income in period' : `${spentShare.toFixed(spentShare < 10 ? 1 : 0)}% of money in`}
          </p>
        </div>
        <div className="sheet p-4">
          <p className="form-head mb-2">Left over</p>
          <AmountBox value={Math.abs(net)} sign={net < 0 ? '−' : ''} tone={net < 0 ? 'out' : 'carbon'} size="lg" />
          <div className="mt-3 h-1.5 rounded-full bg-in-soft overflow-hidden" aria-hidden="true">
            <div className="h-full bg-out rounded-full" style={{ width: `${Math.min(100, spentShare ?? (spent > 0 ? 100 : 0))}%` }} />
          </div>
          <p className="text-xs text-ink-3 mt-1.5 num">
            {spentShare === null ? 'Nothing came in' : `${(100 - Math.min(100, spentShare)).toFixed(spentShare > 90 ? 1 : 0)}% of money in kept`}
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="sheet p-4 sm:p-5">
          <SectionTitle>Where it went</SectionTitle>
          <Breakdown rows={expenseData} formatCurrency={formatCurrency} emptyText="No spending in this period" />
        </section>
        <section className="sheet p-4 sm:p-5">
          <SectionTitle>Where it came from</SectionTitle>
          <Breakdown rows={incomeData} formatCurrency={formatCurrency} emptyText="No income in this period" />
        </section>
      </div>
    </div>
  );
}

function TransactionList({ expenses, categories, formatCurrency, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    description: '',
    vendor: '',
    category_id: '',
    date: localDate(),
    type: 'expense'
  });

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Filter categories based on selected transaction type
  const filteredCategories = categories.filter(cat => cat.type === form.type);

  // Filter transactions based on type filter
  const filteredTransactions = typeFilter === 'all'
    ? expenses
    : expenses.filter(e => e.type === typeFilter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const url = editingId
        ? `${API_URL}/api/expenses/${editingId}`
        : `${API_URL}/api/expenses`;

      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          category_id: form.category_id ? parseInt(form.category_id) : null
        })
      });

      setShowForm(false);
      setEditingId(null);
      setForm({ amount: '', description: '', vendor: '', category_id: '', date: localDate(), type: 'expense' });
      onRefresh();
    } catch (err) {
      console.error('Error submitting transaction:', err);
      alert(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction, e) => {
    e?.stopPropagation();
    setForm({
      amount: transaction.amount,
      description: transaction.description || '',
      vendor: transaction.vendor || '',
      category_id: transaction.category_id || '',
      date: transaction.date,
      type: transaction.type || 'expense'
    });
    setEditingId(transaction.id);
    setShowForm(true);
    setSelectedTransaction(null);
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!confirm('Delete this transaction?')) return;
    try {
      await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE' });
    } catch (err) {
      alert(errorText(err));
      return;
    }
    setSelectedTransaction(null);
    onRefresh();
  };

  const handleTypeChange = (newType) => {
    setForm(prev => ({ ...prev, type: newType, category_id: '' }));
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeForm = () => { if (!submitting) { setShowForm(false); setEditingId(null); } };

  // Group consecutive rows by date (API order preserved) so each date is a guide line.
  const groups = [];
  filteredTransactions.forEach(t => {
    const last = groups[groups.length - 1];
    if (last && last.date === t.date) last.items.push(t);
    else groups.push({ date: t.date, items: [t] });
  });

  const SOURCE = {
    whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
    whatsapp_image: { icon: Image, label: 'WhatsApp photo' },
    manual: { icon: PenLine, label: 'Manual' },
  };
  const sourceOf = (t) => SOURCE[t.source] || { icon: PenLine, label: t.source?.replace('_', ' ') || 'Manual' };

  return (
    <div className="space-y-4">
      {/* Transaction Detail */}
      {selectedTransaction && (() => {
        const t = selectedTransaction;
        const isIn = t.type === 'income';
        const src = sourceOf(t);
        return (
          <Dialog
            title={t.description || (isIn ? 'Income' : 'Expense')}
            tone={isIn ? 'in' : 'out'}
            onClose={() => setSelectedTransaction(null)}
            footer={<>
              <button onClick={(e) => handleEdit(t, e)} className="btn-primary flex-1">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={(e) => handleDelete(t.id, e)} className="btn-danger-quiet">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={`stamp ${isIn ? 'text-in border-in' : 'text-out border-out'}`}>{isIn ? 'Income' : 'Expense'}</span>
              <span className="text-sm text-ink-3 num">{fmtDay(t.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <AmountBox value={t.amount} sign={isIn ? '+' : '−'} tone={isIn ? 'in' : 'ink'} size="lg" />
            <Terbilang value={t.amount} className="mt-1.5" />

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div className="min-w-0">
                <dt className="form-head mb-1">Category</dt>
                <dd><CategoryChip name={t.category_name} icon={t.category_icon} color={t.category_color} /></dd>
              </div>
              <div className="min-w-0">
                <dt className="form-head mb-1">{isIn ? 'Source' : 'Vendor'}</dt>
                <dd className="font-medium break-words">{t.vendor || '—'}</dd>
              </div>
              <div className="min-w-0">
                <dt className="form-head mb-1">Entered via</dt>
                <dd className="font-medium flex items-center gap-1.5 capitalize"><src.icon className="w-4 h-4 text-ink-3" />{src.label}</dd>
              </div>
              <div className="min-w-0">
                <dt className="form-head mb-1">Date</dt>
                <dd className="font-medium num">{t.date}</dd>
              </div>
            </dl>

            {t.raw_text && (
              <figure className="mt-5">
                <figcaption className="form-head mb-1">Original message</figcaption>
                <blockquote className="text-sm text-ink-2 bg-well rounded-lg px-3 py-2.5 break-words">{t.raw_text}</blockquote>
              </figure>
            )}

            {t.image_url && (
              <figure className="mt-5">
                <figcaption className="form-head mb-1">Receipt</figcaption>
                <div className="rounded-lg border border-rule overflow-hidden bg-well">
                  <img
                    src={withToken(`${API_URL}${t.image_url}`)}
                    alt="Receipt"
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              </figure>
            )}

            <p className="mt-5 pt-4 border-t border-rule text-xs text-ink-3 num">
              Created {new Date(t.created_at).toLocaleString()}
              {t.updated_at !== t.created_at && <> · Updated {new Date(t.updated_at).toLocaleString()}</>}
            </p>
          </Dialog>
        );
      })()}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold flex items-baseline gap-2">
          Transactions <span className="text-sm font-medium text-ink-3 num">{filteredTransactions.length}</span>
        </h2>
        <div className="flex gap-2 sm:order-3">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'income' })); }}
            className="btn-in px-3"
          >
            <Plus className="w-4 h-4" />
            <span><span className="hidden sm:inline">Add </span>income</span>
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'expense' })); }}
            className="btn-out px-3"
          >
            <Plus className="w-4 h-4" />
            <span><span className="hidden sm:inline">Add </span>expense</span>
          </button>
        </div>
        <div className="seg w-full sm:w-auto sm:order-2 sm:mr-auto" role="group" aria-label="Filter by type">
          {['all', 'expense', 'income'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              aria-pressed={typeFilter === type}
              className="seg-btn flex-1 sm:flex-none capitalize"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <Dialog
          title={`${editingId ? 'Edit' : 'Add'} ${form.type === 'income' ? 'income' : 'expense'}`}
          tone={form.type === 'income' ? 'in' : 'out'}
          onClose={closeForm}
          footer={<>
            <button
              type="submit"
              form="tx-form"
              disabled={submitting}
              className={`${form.type === 'income' ? 'btn-in' : 'btn-out'} flex-1`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? (editingId ? 'Updating…' : 'Saving…') : (editingId ? 'Update' : 'Save')}
            </button>
            <button type="button" disabled={submitting} onClick={closeForm} className="btn-quiet">
              Cancel
            </button>
          </>}
        >
          <div className="seg w-full mb-5" role="group" aria-label="Type">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleTypeChange('expense')}
              aria-pressed={form.type === 'expense'}
              className="seg-btn flex-1"
            >
              Expense
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleTypeChange('income')}
              aria-pressed={form.type === 'income'}
              className="seg-btn flex-1"
            >
              Income
            </button>
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Field label="Amount (Rp) *">
                <div className="amount-box focus-within:border-carbon focus-within:shadow-[0_0_0_3px_var(--carbon-soft)]">
                  <span className="amount-rp">Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    disabled={submitting}
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="amount-fig text-xl bg-transparent outline-none disabled:cursor-not-allowed"
                    placeholder="50000"
                  />
                </div>
              </Field>
              <Terbilang value={form.amount} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date *">
                <input
                  type="date"
                  required
                  disabled={submitting}
                  value={form.date}
                  onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="field num"
                />
              </Field>
              <Field label="Category">
                <select
                  disabled={submitting}
                  value={form.category_id}
                  onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                  className="field"
                >
                  <option value="">Select category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <input
                  type="text"
                  disabled={submitting}
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="field"
                  placeholder={form.type === 'income' ? 'Salary payment' : 'Lunch'}
                />
              </Field>
              <Field label={form.type === 'income' ? 'Source' : 'Vendor'}>
                <input
                  type="text"
                  disabled={submitting}
                  value={form.vendor}
                  onChange={(e) => setForm(prev => ({ ...prev, vendor: e.target.value }))}
                  className="field"
                  placeholder={form.type === 'income' ? 'Company name' : 'Restaurant name'}
                />
              </Field>
            </div>
          </form>
        </Dialog>
      )}

      {groups.length === 0 ? (
        <div className="sheet">
          <Empty icon={ReceiptText} title="No transactions here">
            Widen the dates, clear the search, or add one with the buttons above.
          </Empty>
        </div>
      ) : (
        <div className="sheet overflow-clip">
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_12rem_10rem_11rem_5.5rem] gap-4 px-5 py-2.5 bg-well border-b border-rule form-head">
            <span>Description</span>
            <span>Category</span>
            <span>Entered via</span>
            <span className="text-right">Amount</span>
            <span className="sr-only">Actions</span>
          </div>
          {groups.map(g => (
            <section key={g.date + g.items[0].id} aria-label={fmtDay(g.date)}>
              <h3 className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-[1] bg-well px-4 md:px-5 py-1.5 text-xs font-bold text-ink-2 num border-y border-rule -mt-px">
                {fmtDay(g.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </h3>
              <ul className="divide-y divide-rule">
                {g.items.map(transaction => {
                  const src = sourceOf(transaction);
                  return (
                    <li
                      key={transaction.id}
                      className="relative group hover:bg-well transition-colors px-4 md:px-5 py-3 flex items-start gap-3 md:grid md:grid-cols-[minmax(0,1fr)_12rem_10rem_11rem_5.5rem] md:gap-4 md:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleRowClick(transaction)}
                          className="text-left font-semibold text-ink truncate max-w-full block after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-carbon focus-visible:after:-outline-offset-2"
                        >
                          {transaction.description || (transaction.type === 'income' ? 'Income' : 'Expense')}
                        </button>
                        <div className="mt-0.5 flex items-center gap-2 text-sm text-ink-3 min-w-0">
                          {transaction.vendor && <span className="truncate">{transaction.vendor}</span>}
                          <span className="md:hidden flex items-center gap-1 min-w-0">
                            {transaction.vendor && <span aria-hidden="true">·</span>}
                            <span className="chip-dot" style={{ backgroundColor: transaction.category_color || 'var(--ink-3)' }} />
                            <span className="truncate">{transaction.category_name || 'Uncategorized'}</span>
                          </span>
                        </div>
                      </div>
                      <div className="hidden md:block min-w-0">
                        <CategoryChip name={transaction.category_name} icon={transaction.category_icon} color={transaction.category_color} />
                      </div>
                      <div className="hidden md:flex items-center gap-1.5 text-sm text-ink-3 min-w-0">
                        <src.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate capitalize">{src.label}</span>
                        {transaction.image_url && <span className="stamp text-carbon border-carbon ml-1">Receipt</span>}
                      </div>
                      <div className="text-right shrink-0">
                        <SignedAmount type={transaction.type} amount={transaction.amount} formatCurrency={formatCurrency} />
                        {transaction.image_url && (
                          <span className="md:hidden flex justify-end mt-1"><span className="stamp text-carbon border-carbon">Receipt</span></span>
                        )}
                      </div>
                      <div className="hidden md:flex justify-end gap-1 relative z-[2]">
                        <button
                          onClick={(e) => handleEdit(transaction, e)}
                          className="icon-btn"
                          aria-label={`Edit ${transaction.description || 'transaction'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(transaction.id, e)}
                          className="icon-btn hover:!text-out"
                          aria-label={`Delete ${transaction.description || 'transaction'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryList({ categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '', color: '#4ECDC4', type: 'expense', exclude_from_dashboard: false });

  const API_URL = import.meta.env.VITE_API_URL || '';

  const filteredCategories = typeFilter === 'all'
    ? categories
    : categories.filter(c => c.type === typeFilter);

  const expenseCategories = filteredCategories.filter(c => c.type === 'expense');
  const incomeCategories = filteredCategories.filter(c => c.type === 'income');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const url = editingId
        ? `${API_URL}/api/categories/${editingId}`
        : `${API_URL}/api/categories`;

      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          exclude_from_dashboard: form.exclude_from_dashboard ? 1 : 0
        })
      });

      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', icon: '', color: '#4ECDC4', type: 'expense', exclude_from_dashboard: false });
      onRefresh();
    } catch (err) {
      console.error('Error submitting category:', err);
      alert(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#4ECDC4',
      type: category.type || 'expense',
      exclude_from_dashboard: Boolean(category.exclude_from_dashboard)
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
    } catch (err) {
      alert(errorText(err));
      return;
    }
    onRefresh();
  };

  const CategoryRow = ({ category }) => (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border border-rule"
        style={{ backgroundColor: category.color ? category.color + '22' : 'var(--well)' }}
        aria-hidden="true"
      >
        {category.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate flex items-center gap-2">
          <span className="chip-dot" style={{ backgroundColor: category.color || 'var(--ink-3)' }} />
          {category.name}
        </p>
        {Boolean(category.exclude_from_dashboard) && (
          <span className="stamp text-warn border-warn mt-1" title="Not counted in dashboard totals">Excluded from dashboard</span>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => handleEdit(category)}
          className="icon-btn"
          aria-label={`Edit ${category.name}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(category.id)}
          className="icon-btn hover:!text-out"
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );

  const Group = ({ title, items, tone, emptyText }) => (
    <section>
      <h3 className="text-base font-bold mb-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-sm ${tone === 'in' ? 'bg-in' : 'bg-out'}`} />
        {title} <span className="text-sm font-medium text-ink-3 num">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <div className="sheet"><Empty icon={Tags} title={emptyText} /></div>
      ) : (
        <ul className="sheet divide-y divide-rule">
          {items.map(category => <CategoryRow key={category.id} category={category} />)}
        </ul>
      )}
    </section>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold">Categories</h2>
        <div className="flex gap-2 sm:order-3">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'income', color: '#10B981', exclude_from_dashboard: false })); }}
            className="btn-in px-3"
          >
            <Plus className="w-4 h-4" />
            <span>Income<span className="hidden sm:inline"> category</span></span>
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'expense', color: '#EF4444', exclude_from_dashboard: false })); }}
            className="btn-out px-3"
          >
            <Plus className="w-4 h-4" />
            <span>Expense<span className="hidden sm:inline"> category</span></span>
          </button>
        </div>
        <div className="seg w-full sm:w-auto sm:order-2 sm:mr-auto" role="group" aria-label="Filter by type">
          {['all', 'expense', 'income'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              aria-pressed={typeFilter === type}
              className="seg-btn flex-1 sm:flex-none capitalize"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <section className="sheet overflow-hidden" aria-label="Category form">
          <div className={`h-1 ${form.type === 'income' ? 'bg-in' : 'bg-out'}`} />
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <h3 className="text-base font-bold">
                {editingId ? 'Edit' : 'Add'} {form.type === 'income' ? 'income' : 'expense'} category
              </h3>
              <div className="seg" role="group" aria-label="Type">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, type: 'expense', color: '#EF4444' }))}
                  aria-pressed={form.type === 'expense'}
                  className="seg-btn"
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, type: 'income', color: '#10B981' }))}
                  aria-pressed={form.type === 'income'}
                  className="seg-btn"
                >
                  Income
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[minmax(0,1fr)_5rem_4.5rem] sm:grid-cols-[minmax(0,1fr)_7rem_6rem] gap-3">
                <Field label="Name *">
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="field"
                    placeholder="Category name"
                  />
                </Field>
                <Field label="Icon">
                  <input
                    type="text"
                    disabled={submitting}
                    value={form.icon}
                    onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="field text-center text-lg"
                    placeholder={form.type === 'income' ? '💰' : '🍔'}
                    aria-label="Icon (emoji)"
                  />
                </Field>
                <Field label="Colour">
                  <input
                    type="color"
                    disabled={submitting}
                    value={form.color}
                    onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="field"
                  />
                </Field>
              </div>

              {/* Exclude from dashboard calculations toggle */}
              <label htmlFor="exclude_from_dashboard" className="flex items-start gap-3 p-3 rounded-lg bg-well cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="exclude_from_dashboard"
                  disabled={submitting}
                  checked={form.exclude_from_dashboard}
                  onChange={(e) => setForm(prev => ({ ...prev, exclude_from_dashboard: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  style={{ accentColor: 'var(--carbon)' }}
                />
                <span className="text-sm">
                  <span className="font-semibold text-ink">Exclude from dashboard calculations</span>
                  <span className="block text-ink-3 mt-0.5">
                    Transactions in this category will not be included in dashboard totals, net balance, or charts.
                  </span>
                </span>
              </label>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={form.type === 'income' ? 'btn-in' : 'btn-out'}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {submitting ? (editingId ? 'Updating…' : 'Saving…') : (editingId ? 'Update' : 'Save')}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => { if (!submitting) { setShowForm(false); setEditingId(null); } }}
                  className="btn-quiet"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Show categories grouped by type when filter is 'all' */}
      {typeFilter === 'all' ? (
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <Group title="Expense categories" items={expenseCategories} tone="out" emptyText="No expense categories" />
          <Group title="Income categories" items={incomeCategories} tone="in" emptyText="No income categories" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="sheet"><Empty icon={Tags} title="No categories found" /></div>
      ) : (
        <ul className="sheet divide-y divide-rule lg:max-w-2xl">
          {filteredCategories.map(category => <CategoryRow key={category.id} category={category} />)}
        </ul>
      )}
    </div>
  );
}

export default App;
