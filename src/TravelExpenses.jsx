import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, X, Check, Calendar, Search, Plane, RefreshCw, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    currency: 'USD',
    converted_amount: '',
    converted_currency: 'IDR',
    exchange_rate: '',
    description: '',
    vendor: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    trip_name: '',
    source: 'manual',
    notes: ''
  });

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
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
      if (!res.ok) {
        const data = await res.json();
        setRateError(data.error || 'Failed to fetch rate');
        return;
      }
      const data = await res.json();
      const rate = data.rate;
      setExpenseForm(prev => ({
        ...prev,
        exchange_rate: String(rate),
        converted_amount: prev.amount ? String(Math.round(parseFloat(prev.amount) * rate)) : ''
      }));
    } catch {
      setRateError('Failed to reach exchange rate service');
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
  }

  function resetExpenseForm() {
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
      date: new Date().toISOString().split('T')[0],
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
    await fetch(`${TRAVEL_API}/${id}`, { method: 'DELETE' });
    setSelectedExpense(null);
    await fetchExpenses();
    const tripsRes = await fetch(`${TRAVEL_API}/trips`);
    setTrips(await tripsRes.json());
  }

  // Category CRUD
  async function handleCategorySubmit(e) {
    e.preventDefault();
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
  }

  async function handleDeleteCategory(id) {
    if (!confirm('Delete this travel category?')) return;
    const res = await fetch(`${TRAVEL_API}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete');
      return;
    }
    const catRes = await fetch(`${TRAVEL_API}/categories`);
    setCategories(await catRes.json());
  }

  const formatAmount = (amount, currency) => {
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'expenses', label: 'Expenses' },
          { key: 'trips', label: 'Trips' },
          { key: 'summary', label: 'Summary' },
          { key: 'categories', label: 'Categories' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setActiveView(key);
              if (key === 'summary') fetchSummary();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== EXPENSES VIEW ===== */}
      {activeView === 'expenses' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={filters.categoryId}
                onChange={e => setFilters(p => ({ ...p, categoryId: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={filters.currency}
                onChange={e => setFilters(p => ({ ...p, currency: e.target.value.toUpperCase() }))}
                className="border rounded-lg px-3 py-2 text-sm"
                placeholder="Currency (e.g. JPY)"
                maxLength={3}
              />
              <select
                value={filters.tripName}
                onChange={e => setFilters(p => ({ ...p, tripName: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All trips</option>
                {tripNames.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={fetchExpenses}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => {
                  setFilters({ startDate: '', endDate: '', categoryId: '', currency: '', tripName: '' });
                  setTimeout(fetchExpenses, 0);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Add button */}
          <div className="flex justify-end">
            <button
              onClick={() => { setShowExpenseForm(true); setEditingExpenseId(null); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add Travel Expense
            </button>
          </div>

          {/* Expense Form Modal */}
          {showExpenseForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={resetExpenseForm}>
              <div
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Plane className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        {editingExpenseId ? 'Edit' : 'Add'} Travel Expense
                      </h3>
                    </div>
                    <button onClick={resetExpenseForm} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleExpenseSubmit} className="space-y-4">
                    {/* Amount & Currency row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={expenseForm.amount}
                          onChange={e => {
                            const amt = e.target.value;
                            setExpenseForm(prev => ({
                              ...prev,
                              amount: amt,
                              converted_amount: recalcConverted(amt, prev.exchange_rate)
                            }));
                          }}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <input
                          type="text"
                          value={expenseForm.currency}
                          onChange={e => setExpenseForm(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="USD"
                          maxLength={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          required
                          value={expenseForm.date}
                          onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Exchange rate section */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Currency Conversion</span>
                        <button
                          type="button"
                          onClick={fetchExchangeRate}
                          disabled={rateLoading}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${rateLoading ? 'animate-spin' : ''}`} />
                          Fetch Rate
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Exchange Rate</label>
                          <input
                            type="number"
                            step="any"
                            value={expenseForm.exchange_rate}
                            onChange={e => {
                              const rate = e.target.value;
                              setExpenseForm(prev => ({
                                ...prev,
                                exchange_rate: rate,
                                converted_amount: recalcConverted(prev.amount, rate)
                              }));
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="106"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Converted Amount</label>
                          <input
                            type="number"
                            step="any"
                            value={expenseForm.converted_amount}
                            onChange={e => setExpenseForm(prev => ({ ...prev, converted_amount: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="530000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Home Currency</label>
                          <input
                            type="text"
                            value={expenseForm.converted_currency}
                            onChange={e => setExpenseForm(prev => ({ ...prev, converted_currency: e.target.value.toUpperCase() }))}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                            placeholder="IDR"
                            maxLength={3}
                          />
                        </div>
                      </div>
                      {rateError && <p className="text-xs text-red-500">{rateError}</p>}
                    </div>

                    {/* Description & vendor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={expenseForm.description}
                          onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Ramen lunch"
                          maxLength={500}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <input
                          type="text"
                          value={expenseForm.vendor}
                          onChange={e => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Ichiran"
                          maxLength={200}
                        />
                      </div>
                    </div>

                    {/* Category & Trip */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={expenseForm.category_id}
                          onChange={e => setExpenseForm(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="">Select category</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                        <input
                          type="text"
                          value={expenseForm.trip_name}
                          onChange={e => setExpenseForm(prev => ({ ...prev, trip_name: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Japan 2026"
                          maxLength={200}
                          list="trip-names"
                        />
                        <datalist id="trip-names">
                          {tripNames.map(t => (
                            <option key={t} value={t} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={expenseForm.notes}
                        onChange={e => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="Additional notes..."
                        maxLength={1000}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Check className="w-5 h-5" />
                        {editingExpenseId ? 'Update' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={resetExpenseForm}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          {selectedExpense && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedExpense(null)}>
              <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Plane className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl sm:text-3xl font-bold text-blue-600">
                          {formatAmount(selectedExpense.amount, selectedExpense.currency)}
                        </p>
                        {selectedExpense.converted_amount && (
                          <p className="text-sm text-gray-500">
                            = {formatAmount(selectedExpense.converted_amount, selectedExpense.converted_currency)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setSelectedExpense(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {selectedExpense.date}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      {selectedExpense.category_name ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: selectedExpense.category_color + '20', color: selectedExpense.category_color }}
                        >
                          {selectedExpense.category_icon} {selectedExpense.category_name}
                        </span>
                      ) : (
                        <p className="text-gray-400">Uncategorized</p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="font-medium">{selectedExpense.description || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Vendor</p>
                      <p className="font-medium">{selectedExpense.vendor || '-'}</p>
                    </div>
                    {selectedExpense.trip_name && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Trip</p>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {selectedExpense.trip_name}
                        </p>
                      </div>
                    )}
                    {selectedExpense.exchange_rate && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Exchange Rate</p>
                        <p className="font-medium">
                          1 {selectedExpense.currency} = {selectedExpense.exchange_rate} {selectedExpense.converted_currency}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedExpense.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-600">{selectedExpense.notes}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 pt-4 border-t">
                    <p>Created: {new Date(selectedExpense.created_at).toLocaleString()}</p>
                    {selectedExpense.updated_at !== selectedExpense.created_at && (
                      <p>Updated: {new Date(selectedExpense.updated_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex gap-2 justify-end">
                  <button
                    onClick={e => handleEditExpense(selectedExpense, e)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={e => handleDeleteExpense(selectedExpense.id, e)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Trip</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Converted</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No travel expenses found
                    </td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr
                      key={exp.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedExpense(exp)}
                    >
                      <td className="px-4 py-3 text-sm">{exp.date}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{exp.description || '-'}</div>
                        {exp.vendor && <div className="text-sm text-gray-500">{exp.vendor}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {exp.category_name ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                            style={{ backgroundColor: (exp.category_color || '#999') + '20', color: exp.category_color || '#999' }}
                          >
                            {exp.category_icon} {exp.category_name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{exp.trip_name || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatAmount(exp.amount, exp.currency)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {exp.converted_amount
                          ? formatAmount(exp.converted_amount, exp.converted_currency)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => handleEditExpense(exp, e)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleDeleteExpense(exp.id, e)}
                          className="p-1 text-gray-500 hover:text-red-600 ml-2"
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Trips
          </h2>
          {trips.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
              No trips found. Create travel expenses with a trip name to see them here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Plane className="w-5 h-5 text-blue-600" />
                      {trip.trip_name}
                    </h3>
                    <span className="text-sm text-gray-500">{trip.expense_count} expenses</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Total ({trip.currency})</p>
                      <p className="font-bold text-blue-700">
                        {formatAmount(trip.total_amount, trip.currency)}
                      </p>
                    </div>
                    {trip.total_converted && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Converted ({trip.converted_currency})</p>
                        <p className="font-bold text-green-700">
                          {formatAmount(trip.total_converted, trip.converted_currency)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {trip.start_date} — {trip.end_date}
                  </div>
                  <button
                    onClick={() => {
                      setFilters(p => ({ ...p, tripName: trip.trip_name }));
                      setActiveView('expenses');
                      setTimeout(fetchExpenses, 0);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View expenses →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SUMMARY VIEW ===== */}
      {activeView === 'summary' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Trip Summary</h2>

          {/* Summary Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={summaryFilters.tripName}
                onChange={e => setSummaryFilters(p => ({ ...p, tripName: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All trips</option>
                {tripNames.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="date"
                value={summaryFilters.startDate}
                onChange={e => setSummaryFilters(p => ({ ...p, startDate: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={summaryFilters.endDate}
                onChange={e => setSummaryFilters(p => ({ ...p, endDate: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={fetchSummary}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Search className="w-4 h-4" />
                Get Summary
              </button>
            </div>
          </div>

          {summary ? (
            <div className="space-y-6">
              {/* By Currency */}
              {summary.by_currency && summary.by_currency.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">By Currency</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summary.by_currency.map((item, i) => (
                      <div key={i} className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">{item.currency}</p>
                        <p className="text-xl font-bold text-blue-700">{formatAmount(item.total, item.currency)}</p>
                        <p className="text-sm text-gray-500">{item.count} expenses</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Converted Total */}
              {summary.converted_total && summary.converted_total.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Total Converted</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {summary.converted_total.map((item, i) => (
                      <div key={i} className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">{item.converted_currency}</p>
                        <p className="text-2xl font-bold text-green-700">{formatAmount(item.total, item.converted_currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Category */}
              {summary.by_category && summary.by_category.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">By Category</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {summary.by_category.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                              style={{ backgroundColor: (item.category_color || '#999') + '20', color: item.category_color || '#999' }}
                            >
                              {item.category_icon} {item.category_name}
                            </span>
                            <span className="text-xs text-gray-500">{item.count} items</span>
                          </div>
                          <span className="font-medium">{formatAmount(item.total, item.currency)}</span>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={summary.by_category.map(c => ({
                            name: c.category_name,
                            value: c.total,
                            color: c.category_color || '#999'
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {summary.by_category.map((entry, index) => (
                            <Cell key={index} fill={entry.category_color || '#999'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
              Click "Get Summary" to load trip summary data.
            </div>
          )}
        </div>
      )}

      {/* ===== CATEGORIES VIEW ===== */}
      {activeView === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-semibold">Travel Categories</h2>
            <button
              onClick={() => { setShowCategoryForm(true); setEditingCategoryId(null); setCategoryForm({ name: '', icon: '', color: '#4ECDC4' }); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {showCategoryForm && (
            <div className="bg-blue-50 rounded-xl shadow-sm p-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold mb-4">
                {editingCategoryId ? 'Edit' : 'Add'} Travel Category
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={e => setCategoryForm(p => ({ ...p, icon: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      placeholder="✈️"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={e => setCategoryForm(p => ({ ...p, color: e.target.value }))}
                      className="w-full h-10 border rounded-lg cursor-pointer bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Check className="w-5 h-5" />
                    {editingCategoryId ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCategoryForm(false); setEditingCategoryId(null); }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-5 h-5" /> Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 border-2 border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setCategoryForm({ name: cat.name, icon: cat.icon || '', color: cat.color || '#4ECDC4' });
                      setEditingCategoryId(cat.id);
                      setShowCategoryForm(true);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">No travel categories yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelExpenses;
