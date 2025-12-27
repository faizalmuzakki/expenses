import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, X, Check, TrendingUp, TrendingDown, Wallet, Calendar, Tag, LogOut, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Login from './Login';

const API_URL = import.meta.env.VITE_API_URL || '';

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
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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
  }, [dateRange, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('expense_auth');
    setIsAuthenticated(false);
  };

  async function fetchData() {
    setLoading(true);
    try {
      const [expRes, catRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/expenses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/stats/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
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

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">💰 Finance Tracker</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4">
            {['dashboard', 'transactions', 'categories'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium capitalize transition-colors ${activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}

function Dashboard({ stats, formatCurrency }) {
  const expenseData = stats.byCategory
    .filter(c => c.total > 0 && c.category_type === 'expense')
    .map(c => ({ name: c.name, value: c.total, color: c.color }));

  const incomeData = stats.byCategory
    .filter(c => c.total > 0 && c.category_type === 'income')
    .map(c => ({ name: c.name, value: c.total, color: c.color }));

  const summaryChartData = [
    { name: 'Income', value: stats.income || 0, color: '#10B981' },
    { name: 'Expenses', value: stats.expenses || 0, color: '#EF4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.income || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.expenses || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${(stats.net || 0) >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <Wallet className={`w-6 h-6 ${(stats.net || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold ${(stats.net || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(stats.net || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-2xl font-bold">{stats.count || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
        {summaryChartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summaryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {summaryChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summaryChartData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {summaryChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No data for this period</p>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-red-500" />
            Expense Breakdown
          </h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No expense data</p>
          )}
        </div>

        {/* Income Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-green-500" />
            Income Breakdown
          </h3>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No income data</p>
          )}
        </div>
      </div>

      {/* Category Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Top Expense Categories</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData.slice(0, 5)} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseData.slice(0, 5).map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No expense data</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Top Income Sources</h3>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData.slice(0, 5)} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {incomeData.slice(0, 5).map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No income data</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionList({ expenses, categories, formatCurrency, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({
    amount: '',
    description: '',
    vendor: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
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
    setForm({ amount: '', description: '', vendor: '', category_id: '', date: new Date().toISOString().split('T')[0], type: 'expense' });
    onRefresh();
  };

  const handleEdit = (transaction) => {
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
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const handleTypeChange = (newType) => {
    setForm(prev => ({ ...prev, type: newType, category_id: '' }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Transactions</h2>
          {/* Type Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1 ml-4">
            {['all', 'expense', 'income'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  typeFilter === type
                    ? type === 'income' 
                      ? 'bg-green-500 text-white' 
                      : type === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'income' })); }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowUpCircle className="w-5 h-5" />
            Add Income
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'expense' })); }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowDownCircle className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`rounded-xl shadow-sm p-6 border-2 ${form.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            {form.type === 'income' ? (
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit' : 'Add'} {form.type === 'income' ? 'Income' : 'Expense'}
            </h3>
          </div>
          
          {/* Type Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex bg-white rounded-lg p-1 w-fit border">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  placeholder={form.type === 'income' ? 'Salary payment' : 'Lunch'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.type === 'income' ? 'Source' : 'Vendor'}
                </label>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(e) => setForm(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  placeholder={form.type === 'income' ? 'Company name' : 'Restaurant name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">Select category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors ${
                  form.type === 'income' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Description</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{transaction.date}</td>
                  <td className="px-4 py-3">
                    {transaction.type === 'income' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <ArrowUpCircle className="w-3 h-3" />
                        Income
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <ArrowDownCircle className="w-3 h-3" />
                        Expense
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{transaction.description || '-'}</div>
                    {transaction.vendor && (
                      <div className="text-sm text-gray-500">{transaction.vendor}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {transaction.category_name ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                        style={{ backgroundColor: transaction.category_color + '20', color: transaction.category_color }}
                      >
                        {transaction.category_icon} {transaction.category_name}
                      </span>
                    ) : '-'}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
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
  );
}

function CategoryList({ categories, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({ name: '', icon: '', color: '#4ECDC4', type: 'expense' });

  const API_URL = import.meta.env.VITE_API_URL || '';

  const filteredCategories = typeFilter === 'all' 
    ? categories 
    : categories.filter(c => c.type === typeFilter);

  const expenseCategories = filteredCategories.filter(c => c.type === 'expense');
  const incomeCategories = filteredCategories.filter(c => c.type === 'income');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `${API_URL}/api/categories/${editingId}`
      : `${API_URL}/api/categories`;

    await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', icon: '', color: '#4ECDC4', type: 'expense' });
    onRefresh();
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#4ECDC4',
      type: category.type || 'expense'
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    const res = await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    onRefresh();
  };

  const CategoryCard = ({ category }) => (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 border-2 flex items-center justify-between ${
        category.type === 'income' ? 'border-green-200' : 'border-red-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: category.color + '20' }}
        >
          {category.icon}
        </div>
        <div>
          <span className="font-medium">{category.name}</span>
          <div className={`text-xs ${category.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {category.type}
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => handleEdit(category)}
          className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(category.id)}
          className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Categories</h2>
          {/* Type Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1 ml-4">
            {['all', 'expense', 'income'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                  typeFilter === type
                    ? type === 'income' 
                      ? 'bg-green-500 text-white' 
                      : type === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'income', color: '#10B981' })); }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add Income Category
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(prev => ({ ...prev, type: 'expense', color: '#EF4444' })); }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Add Expense Category
          </button>
        </div>
      </div>

      {showForm && (
        <div className={`rounded-xl shadow-sm p-6 border-2 ${form.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            {form.type === 'income' ? (
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit' : 'Add'} {form.type === 'income' ? 'Income' : 'Expense'} Category
            </h3>
          </div>

          {/* Type Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex bg-white rounded-lg p-1 w-fit border">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: 'expense', color: '#EF4444' }))}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: 'income', color: '#10B981' }))}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  placeholder={form.type === 'income' ? '💰' : '🍔'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border rounded-lg cursor-pointer bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors ${
                  form.type === 'income' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Check className="w-5 h-5" />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Show categories grouped by type when filter is 'all' */}
      {typeFilter === 'all' ? (
        <div className="space-y-6">
          {/* Expense Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
              Expense Categories ({expenseCategories.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-gray-500 col-span-full">No expense categories</p>
              )}
            </div>
          </div>

          {/* Income Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
              Income Categories ({incomeCategories.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-gray-500 col-span-full">No income categories</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
          {filteredCategories.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-8">No categories found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
