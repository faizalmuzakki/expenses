import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import {
    TrendingUp, Settings, PlusCircle, Check, X, RefreshCw,
    Target, Wallet, Calendar, ArrowRight, Edit2, History,
    ChevronDown, ChevronUp
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Asset type display config
const ASSET_CONFIG = {
    indonesian_equity: {
        name: 'Indonesian Equity',
        shortName: 'ID Equity',
        emoji: '🇮🇩',
        color: '#EF4444',
        gradient: 'from-red-500 to-red-600'
    },
    international_equity: {
        name: 'International Equity',
        shortName: 'Intl Equity',
        emoji: '🌍',
        color: '#3B82F6',
        gradient: 'from-blue-500 to-blue-600'
    },
    gold: {
        name: 'Gold',
        shortName: 'Gold',
        emoji: '🥇',
        color: '#F59E0B',
        gradient: 'from-amber-400 to-amber-500'
    }
};

export default function InvestmentTracker({ formatCurrency }) {
    const [summary, setSummary] = useState(null);
    const [contributionPlan, setContributionPlan] = useState(null);
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showContributeForm, setShowContributeForm] = useState(false);
    const [showEditHoldings, setShowEditHoldings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const [config, setConfig] = useState({
        monthly_budget: 5000000,
        catch_up_phase: true
    });

    const [contributeForm, setContributeForm] = useState({
        type: 'indonesian_equity',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const [holdingsForm, setHoldingsForm] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [summaryRes, planRes, contribRes] = await Promise.all([
                fetch(`${API_URL}/api/investments/summary`),
                fetch(`${API_URL}/api/investments/contribution-plan`),
                fetch(`${API_URL}/api/investments/contributions`)
            ]);

            const summaryData = await summaryRes.json();
            const planData = await planRes.json();
            const contribData = await contribRes.json();

            setSummary(summaryData);
            setContributionPlan(planData);
            setContributions(contribData);
            setConfig({
                monthly_budget: planData.monthlyBudget,
                catch_up_phase: planData.isInCatchUpPhase
            });

            // Initialize holdings form
            const holdingsObj = {};
            summaryData.holdings.forEach(h => {
                holdingsObj[h.type] = h.current_value;
            });
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
                body: JSON.stringify({
                    ...contributeForm,
                    amount: parseFloat(contributeForm.amount)
                })
            });
            setShowContributeForm(false);
            setContributeForm({
                type: 'indonesian_equity',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
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
                        body: JSON.stringify({ current_value: parseFloat(value) })
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
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="text-center py-12 text-gray-500">
                Failed to load investment data
            </div>
        );
    }

    // Prepare chart data
    const pieData = summary.holdings.map(h => ({
        name: ASSET_CONFIG[h.type]?.shortName || h.name,
        value: h.current_value,
        color: ASSET_CONFIG[h.type]?.color || '#888'
    })).filter(d => d.value > 0);

    const allocationComparisonData = summary.holdings.map(h => ({
        name: ASSET_CONFIG[h.type]?.shortName || h.name,
        current: h.percentage,
        target: summary.targets[h.type] || 0,
        color: ASSET_CONFIG[h.type]?.color || '#888'
    }));

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        📊 Investment Portfolio
                    </h2>
                    <p className="text-gray-500 mt-1">50/40/10 Allocation Strategy</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <History className="w-4 h-4" />
                        History
                    </button>
                    <button
                        onClick={() => setShowEditHoldings(true)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Update Values
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button
                        onClick={() => setShowContributeForm(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Log Contribution
                    </button>
                </div>
            </div>

            {/* Total Portfolio Value */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
                        <p className="text-4xl font-bold">{formatCurrency(summary.totalValue)}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${contributionPlan?.isInCatchUpPhase ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {contributionPlan?.isInCatchUpPhase ? '🎯 Catch-up Phase' : '✅ Maintenance Phase'}
                            </span>
                            {contributionPlan?.monthsToTarget && (
                                <span className="text-slate-400 text-sm">
                                    ~{contributionPlan.monthsToTarget} months to target
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-sm mb-1">Monthly Budget</p>
                        <p className="text-2xl font-semibold">{formatCurrency(config.monthly_budget)}</p>
                    </div>
                </div>
            </div>

            {/* Holdings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.holdings.map(holding => {
                    const assetConfig = ASSET_CONFIG[holding.type];
                    const target = summary.targets[holding.type] || 0;
                    const diff = holding.percentage - target;
                    const contribution = contributionPlan?.contributions?.find(c => c.type === holding.type);

                    return (
                        <div
                            key={holding.type}
                            className="bg-white rounded-xl shadow-sm border overflow-hidden"
                        >
                            <div className={`bg-gradient-to-r ${assetConfig?.gradient} p-4 text-white`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{assetConfig?.emoji}</span>
                                    <span className="font-semibold">{assetConfig?.name || holding.name}</span>
                                </div>
                                <p className="text-2xl font-bold">{formatCurrency(holding.current_value)}</p>
                                <p className="text-white/80 text-sm mt-1">{holding.platform}</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Current</span>
                                    <span className="font-semibold">{holding.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Target</span>
                                    <span className="font-medium text-gray-700">{target}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Difference</span>
                                    <span className={`font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="relative pt-1">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-400">Allocation</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${assetConfig?.gradient}`}
                                            style={{ width: `${Math.min(100, (holding.percentage / target) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {contribution && contribution.suggestedContribution > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500">Suggested contribution</p>
                                        <p className="font-semibold text-green-600">
                                            {formatCurrency(contribution.suggestedContribution)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Allocation Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-500" />
                        Current Allocation
                    </h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 text-center py-12">No investment data yet</p>
                    )}
                </div>

                {/* Current vs Target Comparison */}
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Current vs Target Allocation
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={allocationComparisonData} layout="vertical">
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

            {/* Contribution Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Monthly Contribution Plan
                    {contributionPlan?.isInCatchUpPhase && (
                        <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                            Catch-up Mode
                        </span>
                    )}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contributionPlan?.contributions?.map(contrib => {
                        const assetConfig = ASSET_CONFIG[contrib.type];
                        return (
                            <div
                                key={contrib.type}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">{assetConfig?.emoji}</span>
                                    <span className="font-medium text-gray-700">{assetConfig?.shortName}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(contrib.suggestedContribution)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {contrib.contributionPercentage.toFixed(0)}% of budget
                                </p>
                                {contrib.suggestedContribution === 0 && (
                                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                        ⏸️ Paused during catch-up
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {contributionPlan?.isInCatchUpPhase && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>🎯 Catch-up Phase Active:</strong> You're currently underweight on some assets.
                            Focus your contributions on the underweight assets until your allocation is balanced.
                            {contributionPlan?.monthsToTarget && (
                                <span className="block mt-1">
                                    Estimated time to reach target allocation: <strong>~{contributionPlan.monthsToTarget} months</strong>
                                </span>
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* Contribution History */}
            {showHistory && (
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-500" />
                        Recent Contributions
                    </h3>
                    {contributions.length > 0 ? (
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
                                        const assetConfig = ASSET_CONFIG[c.type];
                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{c.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span>{assetConfig?.emoji}</span>
                                                        <span className="text-sm">{assetConfig?.shortName}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                                    +{formatCurrency(c.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{c.notes || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No contributions recorded yet</p>
                    )}
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Investment Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Investment Budget (IDR)
                                </label>
                                <input
                                    type="number"
                                    value={config.monthly_budget}
                                    onChange={(e) => setConfig(prev => ({ ...prev, monthly_budget: parseFloat(e.target.value) }))}
                                    className="w-full border rounded-lg px-4 py-3 text-lg"
                                    placeholder="5000000"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="catchUpPhase"
                                    checked={config.catch_up_phase}
                                    onChange={(e) => setConfig(prev => ({ ...prev, catch_up_phase: e.target.checked }))}
                                    className="w-5 h-5 rounded"
                                />
                                <label htmlFor="catchUpPhase" className="text-sm text-gray-700">
                                    Enable catch-up phase (prioritize underweight assets)
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveConfig}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save Settings
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Contribution Modal */}
            {showContributeForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowContributeForm(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <PlusCircle className="w-6 h-6 text-green-500" />
                                Log Contribution
                            </h3>
                            <button onClick={() => setShowContributeForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleContribute} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(ASSET_CONFIG).map(([type, config]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setContributeForm(prev => ({ ...prev, type }))}
                                            className={`p-3 rounded-xl border-2 transition-all ${contributeForm.type === type
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="text-2xl block mb-1">{config.emoji}</span>
                                            <span className="text-xs text-gray-600">{config.shortName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (IDR)</label>
                                <input
                                    type="number"
                                    required
                                    value={contributeForm.amount}
                                    onChange={(e) => setContributeForm(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full border rounded-lg px-4 py-3 text-lg"
                                    placeholder="3500000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={contributeForm.date}
                                    onChange={(e) => setContributeForm(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={contributeForm.notes}
                                    onChange={(e) => setContributeForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full border rounded-lg px-4 py-3"
                                    placeholder="Monthly DCA"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
                                >
                                    <Check className="w-4 h-4" />
                                    Log Contribution
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowContributeForm(false)}
                                    className="px-4 py-3 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Holdings Modal */}
            {showEditHoldings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditHoldings(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit2 className="w-6 h-6 text-blue-500" />
                                Update Portfolio Values
                            </h3>
                            <button onClick={() => setShowEditHoldings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {summary.holdings.map(holding => {
                                const assetConfig = ASSET_CONFIG[holding.type];
                                return (
                                    <div key={holding.type}>
                                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <span>{assetConfig?.emoji}</span>
                                            {assetConfig?.name} ({holding.platform})
                                        </label>
                                        <input
                                            type="number"
                                            value={holdingsForm[holding.type] || 0}
                                            onChange={(e) => setHoldingsForm(prev => ({
                                                ...prev,
                                                [holding.type]: e.target.value
                                            }))}
                                            className="w-full border rounded-lg px-4 py-3 text-lg"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleUpdateHoldings}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Update Values
                            </button>
                            <button
                                onClick={() => setShowEditHoldings(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
