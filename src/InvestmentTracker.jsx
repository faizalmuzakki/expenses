import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import {
    TrendingUp, Settings, PlusCircle, Check, X,
    Target, Wallet, Edit2, History, AlertCircle, Shield, Building2, Briefcase
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Holding display config
const HOLDING_CONFIG = {
    emergency_fund: { name: 'Emergency Fund', shortName: 'Emergency', emoji: '🛡️', color: '#6B7280', gradient: 'from-gray-500 to-gray-600' },
    pension_fund: { name: 'Pension Fund', shortName: 'Pension', emoji: '🏦', color: '#8B5CF6', gradient: 'from-purple-500 to-purple-600' },
    indonesian_equity: { name: 'Indonesian Equity', shortName: 'ID Equity', emoji: '🇮🇩', color: '#EF4444', gradient: 'from-red-500 to-red-600' },
    international_equity: { name: 'International', shortName: 'International', emoji: '🌍', color: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
    gold: { name: 'Gold', shortName: 'Gold', emoji: '🥇', color: '#F59E0B', gradient: 'from-amber-400 to-amber-500' }
};

// Bucket icons
const BUCKET_ICONS = {
    safety: Shield,
    pension: Building2,
    active: Briefcase
};

export default function InvestmentTracker({ formatCurrency }) {
    const [summary, setSummary] = useState(null);
    const [contributionPlan, setContributionPlan] = useState(null);
    const [contributions, setContributions] = useState([]);
    const [actionItems, setActionItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showContributeForm, setShowContributeForm] = useState(false);
    const [showEditHoldings, setShowEditHoldings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const [config, setConfig] = useState({ monthly_budget: 5000000 });
    const [contributeForm, setContributeForm] = useState({
        type: 'gold',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [holdingsForm, setHoldingsForm] = useState({});

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [summaryRes, planRes, contribRes, actionsRes] = await Promise.all([
                fetch(`${API_URL}/api/investments/summary`),
                fetch(`${API_URL}/api/investments/contribution-plan`),
                fetch(`${API_URL}/api/investments/contributions`),
                fetch(`${API_URL}/api/investments/action-items`)
            ]);

            const [summaryData, planData, contribData, actionsData] = await Promise.all([
                summaryRes.json(), planRes.json(), contribRes.json(), actionsRes.json()
            ]);

            setSummary(summaryData);
            setContributionPlan(planData);
            setContributions(contribData);
            setActionItems(actionsData);
            setConfig({ monthly_budget: planData.monthlyBudget });

            const holdingsObj = {};
            summaryData.holdings?.forEach(h => { holdingsObj[h.type] = h.current_value; });
            setHoldingsForm(holdingsObj);
        } catch (error) {
            console.error('Error fetching investment data:', error);
        }
        setLoading(false);
    }

    async function handleSaveConfig() {
        try {
            await fetch(`${API_URL}/api/investments/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            setShowSettings(false);
            fetchData();
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    async function handleContribute(e) {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/investments/contributions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...contributeForm, amount: parseFloat(contributeForm.amount) })
            });
            setShowContributeForm(false);
            setContributeForm({ type: 'gold', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
            fetchData();
        } catch (error) {
            console.error('Error recording contribution:', error);
        }
    }

    async function handleUpdateHoldings() {
        try {
            await Promise.all(
                Object.entries(holdingsForm).map(([type, value]) =>
                    fetch(`${API_URL}/api/investments/holdings/${type}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ current_value: parseFloat(value) || 0 })
                    })
                )
            );
            setShowEditHoldings(false);
            fetchData();
        } catch (error) {
            console.error('Error updating holdings:', error);
        }
    }

    if (loading) {
        return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    if (!summary) {
        return <div className="text-center py-12 text-gray-500">Failed to load investment data</div>;
    }

    // Prepare 50/40/10 chart data (active portfolio only)
    const activeAllocationData = (summary.activeAllocation || []).map(a => ({
        name: HOLDING_CONFIG[a.type]?.shortName || a.name,
        value: a.value,
        current: a.currentPercentage,
        target: a.targetPercentage,
        color: HOLDING_CONFIG[a.type]?.color || '#888'
    }));

    // Portfolio breakdown pie data
    const portfolioBreakdownData = (summary.portfolioBreakdown || []).map(b => ({
        name: b.name,
        value: b.value,
        color: b.color
    })).filter(b => b.value > 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">📊 Investment Portfolio</h2>
                    <p className="text-gray-500 mt-1">3 Buckets: Safety • Pension • Active (50/40/10)</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <History className="w-4 h-4" /> History
                    </button>
                    <button onClick={() => setShowEditHoldings(true)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <Edit2 className="w-4 h-4" /> Update
                    </button>
                    <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={() => setShowContributeForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg">
                        <PlusCircle className="w-4 h-4" /> Contribute
                    </button>
                </div>
            </div>

            {/* Action Items */}
            {actionItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5" /> Action Items
                    </h3>
                    <div className="space-y-2">
                        {actionItems.map(item => (
                            <div key={item.id} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-amber-100">
                                <div className={`p-1 rounded-full ${item.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                    <TrendingUp className={`w-4 h-4 ${item.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{item.title}</p>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Total Portfolio Overview */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Total Portfolio</p>
                        <p className="text-4xl font-bold">{formatCurrency(summary.totalPortfolio)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-sm mb-1">Monthly Budget</p>
                        <p className="text-2xl font-semibold">{formatCurrency(config.monthly_budget)}</p>
                    </div>
                </div>

                {/* Portfolio Breakdown Bar */}
                <div className="mt-6">
                    <div className="flex h-4 rounded-full overflow-hidden bg-slate-700">
                        {(summary.portfolioBreakdown || []).map((b, i) => (
                            <div
                                key={b.key}
                                style={{ width: `${b.percentage}%`, backgroundColor: b.color }}
                                className="transition-all"
                                title={`${b.name}: ${b.percentage.toFixed(1)}%`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400">
                        {(summary.portfolioBreakdown || []).map(b => (
                            <span key={b.key}>{b.emoji} {b.name} ({b.percentage.toFixed(0)}%)</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3 Bucket Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Safety Bucket */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5" />
                            <span className="font-semibold">Safety Bucket</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(summary.buckets?.safety?.total || 0)}</p>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Emergency Fund</span>
                            <span className="font-medium">{formatCurrency(summary.buckets?.safety?.total || 0)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gray-500 rounded-full"
                                style={{ width: `${Math.min(100, ((summary.buckets?.safety?.total || 0) / 30000000) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Target: Rp30M</p>
                    </div>
                </div>

                {/* Pension Bucket */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-5 h-5" />
                            <span className="font-semibold">Pension Bucket</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(summary.buckets?.pension?.total || 0)}</p>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Robo Agresif</span>
                            <span className="text-xs text-purple-600">Auto-pilot</span>
                        </div>
                        <p className="text-xs text-gray-500">90% stocks • 10% bonds</p>
                        <p className="text-xs text-gray-400 mt-1">Set and forget until age 55</p>
                    </div>
                </div>

                {/* Active Portfolio Bucket */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-5 h-5" />
                            <span className="font-semibold">Active Portfolio</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(summary.activePortfolioTotal || 0)}</p>
                    </div>
                    <div className="p-4">
                        <div className="text-xs font-medium text-gray-600 mb-2">50/40/10 Strategy</div>
                        <div className="space-y-1">
                            {(summary.activeAllocation || []).map(a => (
                                <div key={a.type} className="flex justify-between text-xs">
                                    <span>{HOLDING_CONFIG[a.type]?.emoji} {a.targetPercentage}%</span>
                                    <span className={a.currentPercentage >= a.targetPercentage ? 'text-green-600' : 'text-red-600'}>
                                        {a.currentPercentage.toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 50/40/10 Active Portfolio Detail */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Active Portfolio - 50/40/10 Allocation
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div>
                        {activeAllocationData.filter(a => a.value > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={activeAllocationData.filter(a => a.value > 0)}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        innerRadius={55}
                                        label={({ name, current }) => `${name} ${current.toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {activeAllocationData.filter(a => a.value > 0).map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-gray-500 text-center py-12">No active investments yet</div>
                        )}
                    </div>

                    {/* Bar Chart - Current vs Target */}
                    <div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={activeAllocationData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                <Legend />
                                <Bar dataKey="current" name="Current" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="target" name="Target" fill="#10B981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Holdings breakdown */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {(summary.activeAllocation || []).map(a => {
                        const cfg = HOLDING_CONFIG[a.type];
                        const diff = a.currentPercentage - a.targetPercentage;
                        return (
                            <div key={a.type} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{cfg?.emoji}</span>
                                    <span className="font-medium">{cfg?.shortName}</span>
                                </div>
                                <p className="text-xl font-bold">{formatCurrency(a.value)}</p>
                                <div className="flex justify-between mt-2 text-sm">
                                    <span className="text-gray-500">{a.currentPercentage.toFixed(1)}% / {a.targetPercentage}%</span>
                                    <span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Monthly Contribution Plan */}
            {contributionPlan && (
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-green-500" />
                        Monthly Contribution Plan
                    </h3>

                    {contributionPlan.note && (
                        <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            💡 {contributionPlan.note}
                        </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(contributionPlan.contributions || []).map(c => {
                            const cfg = HOLDING_CONFIG[c.type];
                            return (
                                <div key={c.type} className={`p-3 rounded-xl border-2 ${c.amount > 0 ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{cfg?.emoji}</span>
                                        <span className="text-xs font-medium text-gray-700">{cfg?.shortName}</span>
                                    </div>
                                    <p className={`font-bold ${c.amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {formatCurrency(c.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{c.reason}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Contribution History */}
            {showHistory && contributions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History className="w-5 h-5" /> Recent Contributions
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Asset</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {contributions.slice(0, 10).map(c => {
                                    const cfg = HOLDING_CONFIG[c.type];
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{c.date}</td>
                                            <td className="px-4 py-3"><span className="flex items-center gap-2"><span>{cfg?.emoji}</span><span className="text-sm">{cfg?.shortName || c.type}</span></span></td>
                                            <td className="px-4 py-3 text-right font-medium text-green-600">+{formatCurrency(c.amount)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{c.notes || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget (IDR)</label>
                            <input type="number" value={config.monthly_budget} onChange={(e) => setConfig({ monthly_budget: parseFloat(e.target.value) })} className="w-full border rounded-lg px-4 py-3 text-lg" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSaveConfig} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Save</button>
                            <button onClick={() => setShowSettings(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contribute Modal */}
            {showContributeForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContributeForm(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><PlusCircle className="w-6 h-6 text-green-500" /> Log Contribution</h3>
                            <button onClick={() => setShowContributeForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleContribute} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(HOLDING_CONFIG).map(([type, cfg]) => (
                                        <button key={type} type="button" onClick={() => setContributeForm(prev => ({ ...prev, type }))}
                                            className={`p-2 rounded-xl border-2 transition-all ${contributeForm.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <span className="text-xl block">{cfg.emoji}</span>
                                            <span className="text-xs text-gray-600 block truncate">{cfg.shortName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (IDR)</label>
                                <input type="number" required value={contributeForm.amount} onChange={(e) => setContributeForm(prev => ({ ...prev, amount: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-lg" placeholder="5000000" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input type="date" required value={contributeForm.date} onChange={(e) => setContributeForm(prev => ({ ...prev, date: e.target.value }))} className="w-full border rounded-lg px-4 py-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <input type="text" value={contributeForm.notes} onChange={(e) => setContributeForm(prev => ({ ...prev, notes: e.target.value }))} className="w-full border rounded-lg px-4 py-3" placeholder="Monthly" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"><Check className="w-4 h-4" /> Log</button>
                                <button type="button" onClick={() => setShowContributeForm(false)} className="px-4 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Holdings Modal */}
            {showEditHoldings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditHoldings(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Edit2 className="w-6 h-6 text-blue-500" /> Update Values</h3>
                            <button onClick={() => setShowEditHoldings(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            {(summary.holdings || []).map(h => {
                                const cfg = HOLDING_CONFIG[h.type];
                                return (
                                    <div key={h.type}>
                                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><span>{cfg?.emoji}</span> {cfg?.name}</label>
                                        <input type="number" value={holdingsForm[h.type] || 0} onChange={(e) => setHoldingsForm(prev => ({ ...prev, [h.type]: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-lg" />
                                        <p className="text-xs text-gray-500 mt-1">{h.platform}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleUpdateHoldings} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Update</button>
                            <button onClick={() => setShowEditHoldings(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
