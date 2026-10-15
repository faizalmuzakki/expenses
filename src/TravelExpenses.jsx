import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, X, Check, Calendar, Search, Plane, RefreshCw, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { AmountBox, Terbilang, CategoryChip, Dialog, Field, Empty, SectionTitle, formatNumber } from './ui';
import { localDate } from './dates';
import { errorText } from './auth';

const API_URL = import.meta.env.VITE_API_URL || '';
const TRAVEL_API = `${API_URL}/api/travel-expenses`;

function TravelExpenses({ formatCurrency }) {
  const [activeView, setActiveView] = useState('expenses');
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    currency: '',
    tripName: ''
  });

  // Expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    currency: 'USD',
    converted_amount: '',
    converted_currency: 'IDR',
    exchange_rate: '',
    description: '',
    vendor: '',
    category_id: '',
    date: localDate(),
    trip_name: '',
    source: 'manual',
    notes: ''
  });

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    color: '#4ECDC4'
  });

  // Exchange rate
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  // Detail modal
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Summary filters
  const [summaryFilters, setSummaryFilters] = useState({
    tripName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [catRes, tripsRes] = await Promise.all([
        fetch(`${TRAVEL_API}/categories`),
        fetch(`${TRAVEL_API}/trips`)
      ]);
      setCategories(await catRes.json());
      setTrips(await tripsRes.json());
      await fetchExpenses();
    } catch (error) {
      console.error('Error fetching travel data:', error);
    }
    setLoading(false);
  }

  async function fetchExpenses() {
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.currency) params.set('currency', filters.currency);
    if (filters.tripName) params.set('tripName', filters.tripName);
    params.set('limit', '100');

    const res = await fetch(`${TRAVEL_API}?${params}`);
    setExpenses(await res.json());
  }

  async function fetchSummary() {
    const params = new URLSearchParams();
    if (summaryFilters.tripName) params.set('tripName', summaryFilters.tripName);
    if (summaryFilters.startDate) params.set('startDate', summaryFilters.startDate);
    if (summaryFilters.endDate) params.set('endDate', summaryFilters.endDate);

    const res = await fetch(`${TRAVEL_API}/summary?${params}`);
    setSummary(await res.json());
  }

  async function fetchExchangeRate() {
    if (!expenseForm.currency || !expenseForm.converted_currency) return;
    if (expenseForm.currency === expenseForm.converted_currency) {
      setExpenseForm(prev => ({ ...prev, exchange_rate: '1', converted_amount: prev.amount }));
      return;
    }
    setRateLoading(true);
    setRateError('');
    try {
      const res = await fetch(`${TRAVEL_API}/exchange-rate?from=${expenseForm.currency}&to=${expenseForm.converted_currency}`);
      const data = await res.json();
      const rate = data.rate;
      setExpenseForm(prev => ({
        ...prev,
        exchange_rate: String(rate),
        converted_amount: prev.amount ? String(Math.round(parseFloat(prev.amount) * rate)) : ''
      }));
    } catch (err) {
      setRateError(err.status ? err.message : 'Failed to reach exchange rate service');
    } finally {
      setRateLoading(false);
    }
  }

  // Recalculate converted amount when amount or rate changes
  const recalcConverted = (amount, rate) => {
    if (amount && rate) {
      return String(Math.round(parseFloat(amount) * parseFloat(rate)));
    }
    return '';
  };

  // Expense CRUD
  async function handleExpenseSubmit(e) {
    e.preventDefault();
    if (submittingExpense) return;

    setSubmittingExpense(true);
    try {
      const url = editingExpenseId ? `${TRAVEL_API}/${editingExpenseId}` : TRAVEL_API;
      const body = {
        amount: parseFloat(expenseForm.amount),
        currency: expenseForm.currency,
        converted_amount: expenseForm.converted_amount ? parseFloat(expenseForm.converted_amount) : null,
        converted_currency: expenseForm.converted_currency,
        exchange_rate: expenseForm.exchange_rate ? parseFloat(expenseForm.exchange_rate) : null,
        description: expenseForm.description || null,
        vendor: expenseForm.vendor || null,
        category_id: expenseForm.category_id ? parseInt(expenseForm.category_id) : null,
        date: expenseForm.date,
        trip_name: expenseForm.trip_name || null,
        source: expenseForm.source || 'manual',
        notes: expenseForm.notes || null
      };

      await fetch(url, {
        method: editingExpenseId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      resetExpenseForm();
      await fetchExpenses();
      // Refresh trips too
      const tripsRes = await fetch(`${TRAVEL_API}/trips`);
      setTrips(await tripsRes.json());
    } catch (error) {
      console.error('Error submitting travel expense:', error);
      alert(errorText(error));
    } finally {
      setSubmittingExpense(false);
    }
  }

  function resetExpenseForm() {
    if (submittingExpense) return;
    setShowExpenseForm(false);
    setEditingExpenseId(null);
    setExpenseForm({
      amount: '',
      currency: 'USD',
      converted_amount: '',
      converted_currency: 'IDR',
      exchange_rate: '',
      description: '',
      vendor: '',
      category_id: '',
      date: localDate(),
      trip_name: '',
      source: 'manual',
      notes: ''
    });
    setRateError('');
  }

  function handleEditExpense(expense, e) {
    e?.stopPropagation();
    setExpenseForm({
      amount: String(expense.amount),
      currency: expense.currency || 'USD',
      converted_amount: expense.converted_amount ? String(expense.converted_amount) : '',
      converted_currency: expense.converted_currency || 'IDR',
      exchange_rate: expense.exchange_rate ? String(expense.exchange_rate) : '',
      description: expense.description || '',
      vendor: expense.vendor || '',
      category_id: expense.category_id ? String(expense.category_id) : '',
      date: expense.date,
      trip_name: expense.trip_name || '',
      source: expense.source || 'manual',
      notes: expense.notes || ''
    });
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
    setSelectedExpense(null);
  }

  async function handleDeleteExpense(id, e) {
    e?.stopPropagation();
    if (!confirm('Delete this travel expense?')) return;
    try {
      await fetch(`${TRAVEL_API}/${id}`, { method: 'DELETE' });
    } catch (err) {
      alert(errorText(err));
      return;
    }
    setSelectedExpense(null);
    try {
      await fetchExpenses();
      const tripsRes = await fetch(`${TRAVEL_API}/trips`);
      setTrips(await tripsRes.json());
    } catch (err) {
      console.error('Error refreshing travel expenses:', err);
    }
  }

  // Category CRUD
  async function handleCategorySubmit(e) {
    e.preventDefault();
    if (submittingCategory) return;

    setSubmittingCategory(true);
    try {
      const url = editingCategoryId
        ? `${TRAVEL_API}/categories/${editingCategoryId}`
        : `${TRAVEL_API}/categories`;

      await fetch(url, {
        method: editingCategoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });

      setShowCategoryForm(false);
      setEditingCategoryId(null);
      setCategoryForm({ name: '', icon: '', color: '#4ECDC4' });
      const catRes = await fetch(`${TRAVEL_API}/categories`);
      setCategories(await catRes.json());
    } catch (error) {
      console.error('Error submitting category:', error);
      alert(errorText(error));
    } finally {
      setSubmittingCategory(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this travel category?')) return;
    try {
      await fetch(`${TRAVEL_API}/categories/${id}`, { method: 'DELETE' });
      const catRes = await fetch(`${TRAVEL_API}/categories`);
      setCategories(await catRes.json());
    } catch (err) {
      alert(errorText(err));
    }
  }

  const formatAmount = (amount, currency) => {
    // Rupiah reads the same as everywhere else in the app.
    if (String(currency || '').toUpperCase() === 'IDR') return `Rp ${formatNumber(amount)}`;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  };

  // Get unique trip names for filter dropdown
  const tripNames = [...new Set(trips.map(t => t.trip_name))];
  if (loading) {
    return (
      <div className="sheet overflow-hidden" role="status">
        <div className="progress-line" />
        <p className="px-5 py-12 text-center text-sm text-ink-3">Loading travel expenses…</p>
      </div>
    );
  }

  const openExpense = (exp) => setSelectedExpense(exp);
  const rowKey = (exp) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openExpense(exp); } };
  const convLabel = (code) => (code === 'IDR' ? 'Rp' : code);

  return (
    <div className="space-y-5">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="seg max-w-full overflow-x-auto" role="group" aria-label="Travel views">
          {[
            { key: 'expenses', label: 'Expenses' },
            { key: 'trips', label: 'Trips' },
            { key: 'summary', label: 'Summary' },
            { key: 'categories', label: 'Categories' }
          ].map(({ key, label }) => (
            <button
              key={key}
              aria-pressed={activeView === key}
              onClick={() => {
                setActiveView(key);
                if (key === 'summary') fetchSummary();
              }}
              className="seg-btn"
            >
              {label}
            </button>
          ))}
        </div>
        {activeView === 'expenses' && (
          <button
            onClick={() => { setShowExpenseForm(true); setEditingExpenseId(null); }}
            className="btn-primary"
          >
            <PlusCircle className="w-4 h-4" />
            Add Travel Expense
          </button>
        )}
      </div>

      {/* ===== EXPENSES VIEW ===== */}
      {activeView === 'expenses' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="sheet p-4">
            <div className="flex items-center gap-2 mb-3 text-ink-2">
              <Search className="w-4 h-4" />
              <span className="form-head">Filters</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Field label="From">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="field"
                  placeholder="Start date"
                />
              </Field>
              <Field label="To">
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="field"
                />
              </Field>
              <Field label="Category">
                <select
                  value={filters.categoryId}
                  onChange={e => setFilters(p => ({ ...p, categoryId: e.target.value }))}
                  className="field"
                >
                  <option value="">All categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Currency">
                <input
                  type="text"
                  value={filters.currency}
                  onChange={e => setFilters(p => ({ ...p, currency: e.target.value.toUpperCase() }))}
                  className="field uppercase placeholder:normal-case"
                  placeholder="e.g. JPY"
                  maxLength={3}
                />
              </Field>
              <Field label="Trip" className="col-span-2 lg:col-span-1">
                <select
                  value={filters.tripName}
                  onChange={e => setFilters(p => ({ ...p, tripName: e.target.value }))}
                  className="field"
                >
                  <option value="">All trips</option>
                  {tripNames.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={fetchExpenses}
                className="btn-primary"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => {
                  setFilters({ startDate: '', endDate: '', categoryId: '', currency: '', tripName: '' });
                  setTimeout(fetchExpenses, 0);
                }}
                className="btn-quiet"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Expense Form Modal */}
          {showExpenseForm && (
            <Dialog
              wide
              title={`${editingExpenseId ? 'Edit' : 'Add'} Travel Expense`}
              onClose={resetExpenseForm}
              footer={<>
                <button
                  type="submit"
                  form="travel-expense-form"
                  disabled={submittingExpense}
                  className="btn-primary flex-1"
                >
                  {submittingExpense ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {submittingExpense ? (editingExpenseId ? 'Updating...' : 'Saving...') : (editingExpenseId ? 'Update' : 'Save')}
                </button>
                <button
                  type="button"
                  disabled={submittingExpense}
                  onClick={resetExpenseForm}
                  className="btn-quiet"
                >
                  Cancel
                </button>
              </>}
            >
              <form id="travel-expense-form" onSubmit={handleExpenseSubmit} className="space-y-4">
                {/* Amount & Currency row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Field label="Amount *">
                    <div className="amount-box focus-within:border-carbon focus-within:shadow-[0_0_0_3px_var(--carbon-soft)]"><span className="amount-rp">{expenseForm.currency || '—'}</span><input
                      type="number"
                      step="any"
                      required
                      disabled={submittingExpense}
                      value={expenseForm.amount}
                      onChange={e => {
                        const amt = e.target.value;
                        setExpenseForm(prev => ({
                          ...prev,
                          amount: amt,
                          converted_amount: recalcConverted(amt, prev.exchange_rate)
                        }));
                      }}
                      className="amount-fig text-base bg-transparent outline-none disabled:cursor-not-allowed"
                      placeholder="5000"
                    /></div>
                  </Field>
                  <Field label="Currency">
                    <input
                      type="text"
                      disabled={submittingExpense}
                      value={expenseForm.currency}
                      onChange={e => setExpenseForm(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                      className="field uppercase placeholder:normal-case"
                      placeholder="USD"
                      maxLength={3}
                    />
                  </Field>
                  <Field label="Date *" className="col-span-2 sm:col-span-1">
                    <input
                      type="date"
                      required
                      disabled={submittingExpense}
                      value={expenseForm.date}
                      onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      className="field"
                    />
                  </Field>
                </div>

                {/* Exchange rate section */}
                <div className="bg-well rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="form-head">Currency Conversion</span>
                    <button
                      type="button"
                      onClick={fetchExchangeRate}
                      disabled={rateLoading || submittingExpense}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-carbon hover:text-carbon-hover disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${rateLoading ? 'animate-spin' : ''}`} />
                      Fetch Rate
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field label="Exchange Rate" className="order-1">
                      <input
                        type="number"
                        step="any"
                        disabled={submittingExpense}
                        value={expenseForm.exchange_rate}
                        onChange={e => {
                          const rate = e.target.value;
                          setExpenseForm(prev => ({
                            ...prev,
                            exchange_rate: rate,
                            converted_amount: recalcConverted(prev.amount, rate)
                          }));
                        }}
                        className="field num"
                        placeholder="106"
                      />
                    </Field>
                    <Field label="Home Currency" className="order-2 sm:order-3">
                      <input
                        type="text"
                        disabled={submittingExpense}
                        value={expenseForm.converted_currency}
                        onChange={e => setExpenseForm(prev => ({ ...prev, converted_currency: e.target.value.toUpperCase() }))}
                        className="field uppercase placeholder:normal-case"
                        placeholder="IDR"
                        maxLength={3}
                      />
                    </Field>
                    <Field label="Converted Amount" className="order-3 sm:order-2 col-span-2 sm:col-span-1">
                      <div className="amount-box focus-within:border-carbon focus-within:shadow-[0_0_0_3px_var(--carbon-soft)]"><span className="amount-rp">{expenseForm.converted_currency === 'IDR' ? 'Rp' : (expenseForm.converted_currency || '—')}</span><input
                        type="number"
                        step="any"
                        disabled={submittingExpense}
                        value={expenseForm.converted_amount}
                        onChange={e => setExpenseForm(prev => ({ ...prev, converted_amount: e.target.value }))}
                        className="amount-fig text-base bg-transparent outline-none disabled:cursor-not-allowed"
                        placeholder="530000"
                      /></div>
                    </Field>
                  </div>
                  {expenseForm.converted_currency === 'IDR' && <Terbilang value={expenseForm.converted_amount} />}
                  {rateError && <p className="text-xs font-medium text-out" role="alert">{rateError}</p>}
                </div>

                {/* Description & vendor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Description">
                    <input
                      type="text"
                      disabled={submittingExpense}
                      value={expenseForm.description}
                      onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                      className="field"
                      placeholder="Ramen lunch"
                      maxLength={500}
                    />
                  </Field>
                  <Field label="Vendor">
                    <input
                      type="text"
                      disabled={submittingExpense}
                      value={expenseForm.vendor}
                      onChange={e => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                      className="field"
                      placeholder="Ichiran"
                      maxLength={200}
                    />
                  </Field>
                </div>

                {/* Category & Trip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Category">
                    <select
                      disabled={submittingExpense}
                      value={expenseForm.category_id}
                      onChange={e => setExpenseForm(prev => ({ ...prev, category_id: e.target.value }))}
                      className="field"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Trip Name">
                    <input
                      type="text"
                      disabled={submittingExpense}
                      value={expenseForm.trip_name}
                      onChange={e => setExpenseForm(prev => ({ ...prev, trip_name: e.target.value }))}
                      className="field"
                      placeholder="Japan 2026"
                      maxLength={200}
                      list="trip-names"
                    />
                    <datalist id="trip-names">
                      {tripNames.map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </Field>
                </div>

                {/* Notes */}
                <Field label="Notes">
                  <textarea
                    disabled={submittingExpense}
                    value={expenseForm.notes}
                    onChange={e => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="field"
                    rows={2}
                    placeholder="Additional notes..."
                    maxLength={1000}
                  />
                </Field>
              </form>
            </Dialog>
          )}

          {/* Detail Modal */}
          {selectedExpense && (
            <Dialog
              wide
              title="Travel expense"
              onClose={() => setSelectedExpense(null)}
              footer={<>
                <button
                  onClick={e => handleDeleteExpense(selectedExpense.id, e)}
                  className="btn-danger-quiet"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  onClick={e => handleEditExpense(selectedExpense, e)}
                  className="btn-primary flex-1"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </>}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold num text-ink">
                    {formatAmount(selectedExpense.amount, selectedExpense.currency)}
                  </p>
                  {selectedExpense.converted_amount ? (
                    <div className="mt-3 max-w-xs">
                      <AmountBox value={selectedExpense.converted_amount} currency={convLabel(selectedExpense.converted_currency)} size="sm" />
                      {selectedExpense.converted_currency === 'IDR' && <Terbilang value={selectedExpense.converted_amount} className="mt-1.5" />}
                    </div>
                  ) : null}
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Detail label="Date">
                    <span className="flex items-center gap-2 num">
                      <Calendar className="w-4 h-4 text-ink-3" />
                      {selectedExpense.date}
                    </span>
                  </Detail>
                  <Detail label="Category">
                    <CategoryChip name={selectedExpense.category_name} icon={selectedExpense.category_icon} color={selectedExpense.category_color} />
                  </Detail>
                  <Detail label="Description">{selectedExpense.description || '-'}</Detail>
                  <Detail label="Vendor">{selectedExpense.vendor || '-'}</Detail>
                  {selectedExpense.trip_name && (
                    <Detail label="Trip">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-ink-3" />
                        {selectedExpense.trip_name}
                      </span>
                    </Detail>
                  )}
                  {selectedExpense.exchange_rate && (
                    <Detail label="Exchange Rate">
                      <span className="num">1 {selectedExpense.currency} = {selectedExpense.exchange_rate} {selectedExpense.converted_currency}</span>
                    </Detail>
                  )}
                </dl>
                {selectedExpense.notes && (
                  <dl>
                    <Detail label="Notes">
                      <span className="text-sm text-ink-2 font-normal">{selectedExpense.notes}</span>
                    </Detail>
                  </dl>
                )}
                <div className="text-xs text-ink-3 pt-4 border-t border-rule num">
                  <p>Created: {new Date(selectedExpense.created_at).toLocaleString()}</p>
                  {selectedExpense.updated_at !== selectedExpense.created_at && (
                    <p>Updated: {new Date(selectedExpense.updated_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </Dialog>
          )}

          {/* Expenses list: stacked rows on phones */}
          <ul className="sheet divide-y divide-rule overflow-hidden md:hidden">
            {expenses.length === 0 ? (
              <li>
                <Empty icon={Plane} title="No travel expenses found">Change the filters or add a travel expense.</Empty>
              </li>
            ) : (
              expenses.map(exp => (
                <li key={exp.id}>
                  <button
                    type="button"
                    onClick={() => openExpense(exp)}
                    className="w-full text-left px-4 py-3 flex gap-3 hover:bg-well transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink truncate">{exp.description || '-'}</p>
                      {(exp.vendor || exp.trip_name) && (
                        <p className="text-sm text-ink-3 truncate">{[exp.vendor, exp.trip_name].filter(Boolean).join(' · ')}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 min-w-0">
                        <span className="text-xs text-ink-3 num shrink-0">{exp.date}</span>
                        {exp.category_name && (
                          <CategoryChip name={exp.category_name} icon={exp.category_icon} color={exp.category_color} />
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="num font-semibold text-ink">{formatAmount(exp.amount, exp.currency)}</p>
                      {exp.converted_amount ? (
                        <p className="num text-xs text-ink-3 mt-0.5">{formatAmount(exp.converted_amount, exp.converted_currency)}</p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Expenses Table: md and up */}
          <div className="sheet overflow-hidden overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="bg-well border-b border-rule">
                <tr>
                  <th className="text-left px-4 py-2.5 form-head">Date</th>
                  <th className="text-left px-4 py-2.5 form-head">Description</th>
                  <th className="text-left px-4 py-2.5 form-head">Category</th>
                  <th className="text-left px-4 py-2.5 form-head">Trip</th>
                  <th className="text-right px-4 py-2.5 form-head">Amount</th>
                  <th className="text-right px-4 py-2.5 form-head">Converted</th>
                  <th className="text-right px-4 py-2.5 form-head"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <Empty icon={Plane} title="No travel expenses found">Change the filters or add a travel expense.</Empty>
                    </td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr
                      key={exp.id}
                      tabIndex={0}
                      className="hover:bg-well cursor-pointer transition-colors focus-visible:bg-well"
                      onClick={() => openExpense(exp)}
                      onKeyDown={rowKey(exp)}
                    >
                      <td className="px-4 py-3 text-sm num text-ink-2 whitespace-nowrap">{exp.date}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-ink">{exp.description || '-'}</div>
                        {exp.vendor && <div className="text-sm text-ink-3">{exp.vendor}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {exp.category_name ? (
                          <CategoryChip name={exp.category_name} icon={exp.category_icon} color={exp.category_color} />
                        ) : <span className="text-ink-3">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-2">{exp.trip_name || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold num text-ink">
                        {formatAmount(exp.amount, exp.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm num text-ink-3">
                        {exp.converted_amount
                          ? formatAmount(exp.converted_amount, exp.converted_currency)
                          : '-'}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={e => handleEditExpense(exp, e)}
                          className="icon-btn"
                          aria-label={`Edit ${exp.description || 'travel expense'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleDeleteExpense(exp.id, e)}
                          className="icon-btn hover:text-out"
                          aria-label={`Delete ${exp.description || 'travel expense'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TRIPS VIEW ===== */}
      {activeView === 'trips' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-carbon" />
            Trips
          </h2>
          {trips.length === 0 ? (
            <div className="sheet">
              <Empty icon={MapPin} title="No trips found">Create travel expenses with a trip name to see them here.</Empty>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip, i) => (
                <div key={i} className="sheet p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold flex items-center gap-2 min-w-0">
                      <Plane className="w-5 h-5 text-carbon shrink-0" />
                      <span className="truncate">{trip.trip_name}</span>
                    </h3>
                    <span className="text-sm text-ink-3 num shrink-0 mt-1">{trip.expense_count} expenses</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="form-head mb-1.5">Total ({trip.currency})</p>
                      <p className="text-xl font-bold num text-ink">
                        {formatAmount(trip.total_amount, trip.currency)}
                      </p>
                    </div>
                    {trip.total_converted ? (
                      <div>
                        <p className="form-head mb-1.5">Converted ({trip.converted_currency})</p>
                        <AmountBox value={trip.total_converted} currency={convLabel(trip.converted_currency)} />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-rule">
                    <span className="text-sm text-ink-3 flex items-center gap-2 num">
                      <Calendar className="w-4 h-4" />
                      {trip.start_date} – {trip.end_date}
                    </span>
                    <button
                      onClick={() => {
                        setFilters(p => ({ ...p, tripName: trip.trip_name }));
                        setActiveView('expenses');
                        setTimeout(fetchExpenses, 0);
                      }}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-carbon hover:text-carbon-hover"
                    >
                      View expenses <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SUMMARY VIEW ===== */}
      {activeView === 'summary' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Trip Summary</h2>

          {/* Summary Filters */}
          <div className="sheet p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <Field label="Trip" className="col-span-2 sm:col-span-1">
                <select
                  value={summaryFilters.tripName}
                  onChange={e => setSummaryFilters(p => ({ ...p, tripName: e.target.value }))}
                  className="field"
                >
                  <option value="">All trips</option>
                  {tripNames.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="From">
                <input
                  type="date"
                  value={summaryFilters.startDate}
                  onChange={e => setSummaryFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="field"
                />
              </Field>
              <Field label="To">
                <input
                  type="date"
                  value={summaryFilters.endDate}
                  onChange={e => setSummaryFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="field"
                />
              </Field>
              <button
                onClick={fetchSummary}
                className="btn-primary col-span-2 sm:col-span-1"
              >
                <Search className="w-4 h-4" />
                Get Summary
              </button>
            </div>
          </div>

          {summary ? (
            <div className="space-y-4">
              {/* Converted Total */}
              {summary.converted_total && summary.converted_total.length > 0 && (
                <div className="sheet p-5">
                  <SectionTitle>Total Converted</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {summary.converted_total.map((item, i) => (
                      <div key={i}>
                        <p className="form-head mb-1.5">{item.converted_currency}</p>
                        <AmountBox value={item.total} currency={convLabel(item.converted_currency)} size="lg" />
                        {item.converted_currency === 'IDR' && <Terbilang value={item.total} className="mt-1.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Currency */}
              {summary.by_currency && summary.by_currency.length > 0 && (
                <div className="sheet p-5">
                  <SectionTitle>By Currency</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {summary.by_currency.map((item, i) => (
                      <div key={i} className="rounded-lg border border-rule p-4">
                        <p className="form-head">{item.currency}</p>
                        <p className="text-xl font-bold num text-ink mt-1">{formatAmount(item.total, item.currency)}</p>
                        <p className="text-sm text-ink-3 num">{item.count} expenses</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Category */}
              {summary.by_category && summary.by_category.length > 0 && (
                <div className="sheet p-5">
                  <SectionTitle>By Category</SectionTitle>
                  {(() => {
                    // Share bars only when every row is in one currency; mixed currencies don't compare.
                    const oneCurrency = new Set(summary.by_category.map(c => c.currency)).size === 1;
                    const max = Math.max(...summary.by_category.map(c => Number(c.total) || 0));
                    return (
                      <ul className="divide-y divide-rule lg:max-w-2xl">
                        {summary.by_category.map((item, i) => (
                          <li key={i} className="py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <CategoryChip name={item.category_name} icon={item.category_icon} color={item.category_color} />
                                <span className="text-xs text-ink-3 num shrink-0">{item.count} items</span>
                              </div>
                              <span className="font-semibold num text-ink">{formatAmount(item.total, item.currency)}</span>
                            </div>
                            {oneCurrency && max > 0 && (
                              <div className="mt-2 h-1.5 rounded-full bg-well overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(item.total / max) * 100}%`, backgroundColor: item.category_color || 'var(--ink-3)' }} />
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="sheet">
              <Empty icon={Search} title="No summary loaded">Pick a trip or dates, then Get Summary.</Empty>
            </div>
          )}
        </div>
      )}

      {/* ===== CATEGORIES VIEW ===== */}
      {activeView === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-xl font-bold">Travel Categories</h2>
            <button
              onClick={() => { setShowCategoryForm(true); setEditingCategoryId(null); setCategoryForm({ name: '', icon: '', color: '#4ECDC4' }); }}
              className="btn-primary"
            >
              <PlusCircle className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {showCategoryForm && (
            <div className="sheet overflow-hidden">
              <div className="h-1 bg-carbon" />
              <div className="p-5">
                <h3 className="text-lg font-bold mb-4">
                  {editingCategoryId ? 'Edit' : 'Add'} Travel Category
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Name *" className="col-span-2 md:col-span-1">
                      <input
                        type="text"
                        required
                        disabled={submittingCategory}
                        value={categoryForm.name}
                        onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))}
                        className="field"
                        placeholder="Category name"
                      />
                    </Field>
                    <Field label="Icon (emoji)">
                      <input
                        type="text"
                        disabled={submittingCategory}
                        value={categoryForm.icon}
                        onChange={e => setCategoryForm(p => ({ ...p, icon: e.target.value }))}
                        className="field"
                        placeholder="✈️"
                      />
                    </Field>
                    <Field label="Color">
                      <input
                        type="color"
                        disabled={submittingCategory}
                        value={categoryForm.color}
                        onChange={e => setCategoryForm(p => ({ ...p, color: e.target.value }))}
                        className="field"
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submittingCategory}
                      className="btn-primary"
                    >
                      {submittingCategory ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      {submittingCategory ? (editingCategoryId ? 'Updating...' : 'Saving...') : (editingCategoryId ? 'Update' : 'Save')}
                    </button>
                    <button
                      type="button"
                      disabled={submittingCategory}
                      onClick={() => { if (!submittingCategory) { setShowCategoryForm(false); setEditingCategoryId(null); } }}
                      className="btn-quiet"
                    >
                      <X className="w-5 h-5" /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="sheet p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-well flex items-center justify-center text-xl shrink-0" aria-hidden="true">
                    {cat.icon}
                  </div>
                  <span className="chip-dot" style={{ backgroundColor: cat.color || 'var(--ink-3)' }} />
                  <span className="font-semibold truncate">{cat.name}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setCategoryForm({ name: cat.name, icon: cat.icon || '', color: cat.color || '#4ECDC4' });
                      setEditingCategoryId(cat.id);
                      setShowCategoryForm(true);
                    }}
                    className="icon-btn"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="icon-btn hover:text-out"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="sheet col-span-full">
                <Empty icon={Plane} title="No travel categories yet">Add one to group trip spending.</Empty>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function Detail({ label, children }) {
  return (
    <div className="rounded-lg border border-rule p-3">
      <dt className="form-head mb-1">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

export default TravelExpenses;
