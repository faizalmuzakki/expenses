import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import {
    TrendingUp, Settings, PlusCircle, Check, X,
    Target, Wallet, Calendar, Edit2, History, Play, AlertCircle,
    CheckCircle2, Clock, ArrowRight, Layers
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Individual holding display config
const HOLDING_CONFIG = {
    emergency_fund: {
        name: 'Emergency Fund',
        shortName: 'Emergency',
        emoji: '🛡️',
        color: '#6B7280',
        gradient: 'from-gray-500 to-gray-600'
    },
    pension_fund: {
        name: 'Pension Fund',
        shortName: 'Pension',
        emoji: '🏦',
        color: '#8B5CF6',
        gradient: 'from-purple-500 to-purple-600'
    },
    indonesian_equity: {
        name: 'Indonesian Equity',
        shortName: 'Indo Equity',
        emoji: '📈',
        color: '#EF4444',
        gradient: 'from-red-500 to-red-600'
    },
    international_equity: {
        name: 'International',
        shortName: 'International',
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

// Allocation group config (for 50/40/10)
const ALLOCATION_CONFIG = {
    indonesian: {
        name: 'Indonesian',
        emoji: '🇮🇩',
        color: '#EF4444',
        gradient: 'from-red-500 to-red-600',
        includes: ['Emergency Fund', 'Pension Fund', 'Indo Equity']
    },
    international: {
        name: 'International',
        emoji: '🌍',
        color: '#3B82F6',
        gradient: 'from-blue-500 to-blue-600',
        includes: ['Gotrade']
    },
    gold: {
        name: 'Gold',
        emoji: '🥇',
        color: '#F59E0B',
        gradient: 'from-amber-400 to-amber-500',
        includes: ['Gold']
    }
};

// Phase config
const PHASE_CONFIG = {
    1: { color: 'amber', icon: '🥇', label: 'Phase 1: Build Gold' },
    2: { color: 'red', icon: '🇮🇩', label: 'Phase 2: Build Indo' },
    3: { color: 'green', icon: '⚖️', label: 'Phase 3: Maintenance' }
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
    const [viewMode, setViewMode] = useState('allocation'); // 'allocation' or 'detailed'

    const [config, setConfig] = useState({
        monthly_budget: 5000000,
        start_date: null
    });

    const [contributeForm, setContributeForm] = useState({
        type: 'gold',
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
            const [summaryRes, planRes, contribRes, actionsRes] = await Promise.all([
                fetch(`${API_URL}/api/investments/summary`),
                fetch(`${API_URL}/api/investments/contribution-plan`),
                fetch(`${API_URL}/api/investments/contributions`),
                fetch(`${API_URL}/api/investments/action-items`)
            ]);

            const summaryData = await summaryRes.json();
            const planData = await planRes.json();
            const contribData = await contribRes.json();
            const actionsData = await actionsRes.json();

            setSummary(summaryData);
            setContributionPlan(planData);
            setContributions(contribData);
            setActionItems(actionsData);
            setConfig({
                monthly_budget: planData.monthlyBudget,
                start_date: summaryData.startDate
            });

            const holdingsObj = {};
            summaryData.holdings.forEach(h => {
                holdingsObj[h.type] = h.current_value;
            });
            setHoldingsForm(holdingsObj);

            if (planData.currentPhase === 1) {
                setContributeForm(prev => ({ ...prev, type: 'gold' }));
            } else if (planData.currentPhase === 2) {
                setContributeForm(prev => ({ ...prev, type: 'indonesian_equity' }));
            }
        } catch (error) {
            console.error('Error fetching investment data:', error);
        }
        setLoading(false);
    }

    async function handleStartPlan() {
        try {
            await fetch(`${API_URL}/api/investments/start-plan`, { method: 'POST' });
            fetchData();
        } catch (error) {
            console.error('Error starting plan:', error);
        }
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
                type: contributionPlan?.currentPhase === 1 ? 'gold' : 'indonesian_equity',
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

    // Prepare 50/40/10 allocation chart data
    const allocationPieData = (summary.allocations || [])
        .filter(a => a.value > 0)
        .map(a => ({
            name: a.name,
            value: a.value,
            color: a.color,
            percentage: a.percentage,
            target: a.target
        }));

    // Prepare allocation vs target comparison
    const allocationComparisonData = (summary.allocations || []).map(a => ({
        name: a.name,
        current: a.percentage,
        target: a.target,
        color: a.color
    }));

    // Detailed holdings pie data
    const holdingsPieData = summary.holdings
        .filter(h => h.current_value > 0)
        .map(h => ({
            name: HOLDING_CONFIG[h.type]?.shortName || h.name,
            value: h.current_value,
            color: HOLDING_CONFIG[h.type]?.color || '#888'
        }));

    const currentPhase = contributionPlan?.currentPhase || 1;
    const phaseConfig = PHASE_CONFIG[currentPhase];

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Action Items */}
            {actionItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5" />
                        Action Items ({actionItems.length})
                    </h3>
                    <div className="space-y-2">
                        {actionItems.map(item => (
                            <div key={item.id} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-amber-100">
                                <div className={`p-1 rounded-full ${item.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                                    {item.category === 'setup' ? (
                                        <Settings className={`w-4 h-4 ${item.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                                    ) : (
                                        <TrendingUp className={`w-4 h-4 ${item.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.title}</p>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                                {item.id === 'start_plan' && (
                                    <button
                                        onClick={handleStartPlan}
                                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                                    >
                                        <Play className="w-4 h-4" />
                                        Start Plan
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Total Portfolio + Phase */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Total Portfolio Value</p>
                        <p className="text-4xl font-bold">{formatCurrency(summary.totalValue)}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 border border-white/20">
                                {phaseConfig.icon} {phaseConfig.label}
                            </span>
                            {contributionPlan?.monthsRemaining !== null && contributionPlan?.monthsRemaining > 0 && (
                                <span className="text-slate-400 text-sm flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {contributionPlan.monthsRemaining} months left
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

            {/* 50/40/10 Allocation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(summary.allocations || []).map(alloc => {
                    const cfg = ALLOCATION_CONFIG[alloc.group];
                    const diff = alloc.percentage - alloc.target;
                    const groupContrib = contributionPlan?.groupContributions?.find(c => c.group === alloc.group);

                    return (
                        <div key={alloc.group} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className={`bg-gradient-to-r ${cfg?.gradient} p-4 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cfg?.emoji}</span>
                                        <span className="font-semibold text-lg">{alloc.name}</span>
                                    </div>
                                    <span className="text-2xl font-bold">{alloc.target}%</span>
                                </div>
                                <p className="text-2xl font-bold mt-2">{formatCurrency(alloc.value)}</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Current</span>
                                    <span className="font-semibold">{alloc.percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${cfg?.gradient}`}
                                        style={{ width: `${Math.min(100, (alloc.percentage / alloc.target) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">vs Target</span>
                                    <span className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                                    </span>
                                </div>
                                {groupContrib && groupContrib.suggestedContribution > 0 && (
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-gray-500">This month's contribution</p>
                                        <p className="font-semibold text-green-600">{formatCurrency(groupContrib.suggestedContribution)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('allocation')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'allocation' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                            }`}
                    >
                        50/40/10 Allocation
                    </button>
                    <button
                        onClick={() => setViewMode('detailed')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'detailed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                            }`}
                    >
                        Detailed Holdings
                    </button>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {viewMode === 'allocation' ? (
                    <>
                        {/* 50/40/10 Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-blue-500" />
                                50/40/10 Allocation
                            </h3>
                            {allocationPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={allocationPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={60}
                                            label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {allocationPieData.map((entry, index) => (
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

                        {/* Current vs Target Bar */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                Current vs Target
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={allocationComparisonData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
                                    <YAxis type="category" dataKey="name" width={90} />
                                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                    <Legend />
                                    <Bar dataKey="current" name="Current" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="target" name="Target" fill="#10B981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Detailed Holdings Pie */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-blue-500" />
                                Holdings Breakdown
                            </h3>
                            {holdingsPieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={holdingsPieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            innerRadius={50}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {holdingsPieData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 text-center py-12">No holdings yet</p>
                            )}
                        </div>

                        {/* Holdings List */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border">
                            <h3 className="text-lg font-semibold mb-4">Individual Holdings</h3>
                            <div className="space-y-3">
                                {summary.holdings.map(h => {
                                    const cfg = HOLDING_CONFIG[h.type];
                                    return (
                                        <div key={h.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{cfg?.emoji}</span>
                                                <div>
                                                    <p className="font-medium">{cfg?.name || h.name}</p>
                                                    <p className="text-xs text-gray-500">{h.platform}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(h.current_value)}</p>
                                                <p className="text-xs text-gray-500">{h.percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Phase Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6 border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Investment Timeline
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3].map((phase, idx) => {
                        const isActive = currentPhase === phase;
                        const isPast = currentPhase > phase;

                        return (
                            <div key={phase} className="flex items-center">
                                <div
                                    className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 ${isActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : isPast
                                                ? 'border-green-300 bg-green-50'
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isPast ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : isActive ? (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 animate-pulse" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-gray-300" />
                                        )}
                                        <div>
                                            <p className={`font-medium text-sm ${isActive ? 'text-blue-700' : isPast ? 'text-green-700' : 'text-gray-600'}`}>
                                                {PHASE_CONFIG[phase].label}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {phase === 1 ? 'Months 1-2' : phase === 2 ? 'Months 3-8' : 'Month 9+'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {idx < 2 && <ArrowRight className="w-5 h-5 text-gray-300 mx-2 flex-shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contribution History */}
            {showHistory && contributions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-500" />
                        Recent Contributions
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
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <span>{cfg?.emoji}</span>
                                                    <span className="text-sm">{cfg?.shortName || c.type}</span>
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
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget (IDR)</label>
                                <input
                                    type="number"
                                    value={config.monthly_budget}
                                    onChange={(e) => setConfig(prev => ({ ...prev, monthly_budget: parseFloat(e.target.value) }))}
                                    className="w-full border rounded-lg px-4 py-3 text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Start Date</label>
                                <input
                                    type="date"
                                    value={config.start_date || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, start_date: e.target.value }))}
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSaveConfig} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Save
                            </button>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.entries(HOLDING_CONFIG).map(([type, cfg]) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setContributeForm(prev => ({ ...prev, type }))}
                                            className={`p-2 rounded-xl border-2 transition-all ${contributeForm.type === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="text-xl block">{cfg.emoji}</span>
                                            <span className="text-xs text-gray-600 block truncate">{cfg.shortName}</span>
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
                                    placeholder="5000000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <input
                                        type="text"
                                        value={contributeForm.notes}
                                        onChange={(e) => setContributeForm(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full border rounded-lg px-4 py-3"
                                        placeholder="Monthly DCA"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium">
                                    <Check className="w-4 h-4" /> Log Contribution
                                </button>
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
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Edit2 className="w-6 h-6 text-blue-500" />
                                Update Values
                            </h3>
                            <button onClick={() => setShowEditHoldings(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {summary.holdings.map(h => {
                                const cfg = HOLDING_CONFIG[h.type];
                                return (
                                    <div key={h.type}>
                                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <span>{cfg?.emoji}</span> {cfg?.name}
                                        </label>
                                        <input
                                            type="number"
                                            value={holdingsForm[h.type] || 0}
                                            onChange={(e) => setHoldingsForm(prev => ({ ...prev, [h.type]: e.target.value }))}
                                            className="w-full border rounded-lg px-4 py-3 text-lg"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{h.platform}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={handleUpdateHoldings} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> Update
                            </button>
                            <button onClick={() => setShowEditHoldings(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
