import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import {
    Settings, PlusCircle, Check,
    Target, Wallet, Edit2, History, AlertCircle, Shield, Building2, Briefcase, Loader2
} from 'lucide-react';
import { AmountBox, Terbilang, Dialog, Field, Empty, SectionTitle } from './ui';

const API_URL = import.meta.env.VITE_API_URL || '';

// Holding display config
const HOLDING_CONFIG = {
    emergency_fund: { name: 'Emergency Fund', shortName: 'Emergency', emoji: '🛡️', color: '#6B7280' },
    pension_fund: { name: 'Pension Fund', shortName: 'Pension', emoji: '🏦', color: '#8B5CF6' },
    indonesian_equity: { name: 'Indonesian Equity', shortName: 'ID Equity', emoji: '🇮🇩', color: '#EF4444' },
    international_equity: { name: 'International', shortName: 'International', emoji: '🌍', color: '#3B82F6' },
    gold: { name: 'Gold', shortName: 'Gold', emoji: '🥇', color: '#F59E0B' }
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
    const [submittingContribute, setSubmittingContribute] = useState(false);
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
            summaryData.holdings?.forEach(h => {
                holdingsObj[h.type] = {
                    current_value: h.current_value ?? 0,
                    current_grams: h.current_grams ?? 0
                };
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
        if (submittingContribute) return;

        setSubmittingContribute(true);
        try {
            const res = await fetch(`${API_URL}/api/investments/contributions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...contributeForm, amount: parseFloat(contributeForm.amount) })
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.error || 'Failed to record contribution');
                return;
            }
            setShowContributeForm(false);
            setContributeForm({ type: 'gold', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
            fetchData();
        } catch (error) {
            console.error('Error recording contribution:', error);
            alert('Failed to connect to server. Please try again.');
        } finally {
            setSubmittingContribute(false);
        }
    }

    async function handleUpdateHoldings() {
        try {
            await Promise.all(
                Object.entries(holdingsForm).map(([type, value]) =>
                    fetch(`${API_URL}/api/investments/holdings/${type}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            current_value: parseFloat(value.current_value) || 0,
                            ...(type === 'gold' ? { current_grams: parseFloat(value.current_grams) || 0 } : {})
                        })
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
            <div className="sheet overflow-hidden" role="status">
                <div className="progress-line" />
                <p className="px-5 py-12 text-center text-sm text-ink-3">Loading portfolio…</p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="sheet">
                <Empty icon={AlertCircle} title="Failed to load investment data">Check the connection, then open this tab again.</Empty>
            </div>
        );
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

    // Display only: off-target either way reads as "needs attention", not good/bad.
    const offTarget = (a) => Math.abs(a.currentPercentage - a.targetPercentage) >= 1;
    const closeContribute = () => { if (!submittingContribute) setShowContributeForm(false); };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink">Investment Portfolio</h2>
                    <p className="text-ink-3 mt-1 text-sm">3 Buckets: Safety • Pension • Active (50/40/10)</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowHistory(!showHistory)} aria-pressed={showHistory} aria-label="History" title="History" className={`btn-quiet px-3 ${showHistory ? 'bg-well' : ''}`}>
                        <History className="w-4 h-4" /> <span className="hidden sm:inline">History</span>
                    </button>
                    <button onClick={() => setShowEditHoldings(true)} aria-label="Update values" title="Update values" className="btn-quiet px-3">
                        <Edit2 className="w-4 h-4" /> <span className="hidden sm:inline">Update</span>
                    </button>
                    <button onClick={() => setShowSettings(true)} aria-label="Settings" title="Settings" className="btn-quiet px-3">
                        <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Settings</span>
                    </button>
                    <button onClick={() => setShowContributeForm(true)} className="btn-in">
                        <PlusCircle className="w-4 h-4" /> Contribute
                    </button>
                </div>
            </div>

            {/* Action Items */}
            {actionItems.length > 0 && (
                <div className="rounded-sheet bg-warn-soft p-4">
                    <h3 className="font-bold text-ink flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-warn" /> Action Items
                    </h3>
                    <ul className="space-y-2">
                        {actionItems.map(item => (
                            <li key={item.id} className="flex items-start gap-3 bg-sheet rounded-lg p-3 border border-rule">
                                <span className={`stamp mt-0.5 ${item.priority === 'high' ? 'text-out border-out' : 'text-warn border-warn'}`}>
                                    {item.priority || 'note'}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-semibold text-ink">{item.title}</p>
                                    <p className="text-sm text-ink-2">{item.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Total Portfolio Overview */}
            <div className="rounded-sheet bg-shell text-shell-ink p-5 sm:p-6">
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <div className="min-w-0 w-full sm:w-auto sm:min-w-[320px]">
                        <p className="form-head text-shell-dim mb-2">Total Portfolio</p>
                        <AmountBox value={summary.totalPortfolio} size="lg" />
                        <p className="text-sm text-shell-dim mt-2 num">
                            Gold: {(summary.goldHoldings?.currentGrams || 0).toFixed(2)} g
                        </p>
                    </div>
                    <div className="sm:text-right">
                        <p className="form-head text-shell-dim mb-1">Monthly Budget</p>
                        <p className="text-xl font-bold num">{formatCurrency(config.monthly_budget)}</p>
                    </div>
                </div>

                {/* Portfolio Breakdown Bar */}
                <div className="mt-6">
                    <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
                        {(summary.portfolioBreakdown || []).map((b, i) => (
                            <div
                                key={b.key}
                                style={{ width: `${b.percentage}%`, backgroundColor: b.color }}
                                className="transition-all"
                                title={`${b.name}: ${b.percentage.toFixed(1)}%`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap mt-3 text-xs text-shell-dim gap-x-4 gap-y-1">
                        {(summary.portfolioBreakdown || []).map(b => (
                            <span key={b.key} className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                                {b.name} <span className="num text-shell-ink">{b.percentage.toFixed(0)}%</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3 Bucket Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BucketCard icon={Shield} title="Safety Bucket" color={HOLDING_CONFIG.emergency_fund.color} total={summary.buckets?.safety?.total || 0}>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-ink-2">Emergency Fund</span>
                        <span className="font-semibold num">{formatCurrency(summary.buckets?.safety?.total || 0)}</span>
                    </div>
                    <div className="h-2 bg-well rounded-full overflow-hidden">
                        <div
                            className="h-full bg-ink-3 rounded-full"
                            style={{ width: `${Math.min(100, ((summary.buckets?.safety?.total || 0) / 30000000) * 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-ink-3 mt-1.5">Target: Rp30M</p>
                </BucketCard>

                <BucketCard icon={Building2} title="Pension Bucket" color={HOLDING_CONFIG.pension_fund.color} total={summary.buckets?.pension?.total || 0}>
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-ink-2">Robo Agresif</span>
                        <span className="stamp text-carbon border-carbon">Auto-pilot</span>
                    </div>
                    <p className="text-xs text-ink-2">90% stocks • 10% bonds</p>
                    <p className="text-xs text-ink-3 mt-1">Set and forget until age 55</p>
                </BucketCard>

                <BucketCard icon={Briefcase} title="Active Portfolio" color="var(--carbon)" total={summary.activePortfolioTotal || 0}>
                    <div className="form-head mb-2">50/40/10 Strategy</div>
                    <div className="space-y-1">
                        {(summary.activeAllocation || []).map(a => (
                            <div key={a.type} className="flex justify-between text-xs">
                                <span className="text-ink-2">{HOLDING_CONFIG[a.type]?.shortName || a.name} <span className="text-ink-3">· target {a.targetPercentage}%</span></span>
                                <span className={`num font-semibold ${offTarget(a) ? 'text-warn' : 'text-ink-2'}`}>
                                    {a.currentPercentage.toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </BucketCard>
            </div>

            {/* 50/40/10 Active Portfolio Detail */}
            <div className="sheet p-5">
                <SectionTitle>
                    <Target className="w-5 h-5 text-carbon" />
                    Active Portfolio: 50/40/10 Allocation
                </SectionTitle>

                {activeAllocationData.filter(a => a.value > 0).length === 0 ? (
                    <Empty icon={Briefcase} title="No active investments yet">Log a contribution to start the 50/40/10 split.</Empty>
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={activeAllocationData} layout="vertical" barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--rule)" />
                            <XAxis type="number" domain={[0, 60]} tickFormatter={(v) => `${v}%`} tick={AXIS_TICK} stroke="var(--rule-strong)" />
                            <YAxis type="category" dataKey="name" width={88} tick={AXIS_TICK} stroke="var(--rule-strong)" />
                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'var(--ink)' }} cursor={{ fill: 'var(--well)' }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--ink-2)' }} />
                            <Bar dataKey="current" name="Current" fill="var(--carbon)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                            <Bar dataKey="target" name="Target" fill="var(--rule-strong)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {/* Holdings breakdown: ruled rows */}
                <ul className="mt-4 divide-y divide-rule border-t border-rule">
                    {(summary.activeAllocation || []).map(a => {
                        const cfg = HOLDING_CONFIG[a.type];
                        const diff = a.currentPercentage - a.targetPercentage;
                        return (
                            <li key={a.type} className="py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 items-baseline">
                                <span className="flex items-center gap-2 font-semibold min-w-0">
                                    <span className="chip-dot" style={{ backgroundColor: cfg?.color }} />
                                    <span className="truncate">{cfg?.shortName}</span>
                                    {a.type === 'gold' && (
                                        <span className="text-sm font-normal text-ink-3 num">{(summary.goldHoldings?.currentGrams || 0).toFixed(2)} g</span>
                                    )}
                                </span>
                                <span className="num font-semibold text-right">{formatCurrency(a.value)}</span>
                                <span className="text-sm text-ink-3 num">{a.currentPercentage.toFixed(1)}% of {a.targetPercentage}% target</span>
                                <span className={`text-sm num font-semibold text-right ${offTarget(a) ? 'text-warn' : 'text-ink-2'}`}>
                                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)} pts
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Monthly Contribution Plan */}
            {contributionPlan && (
                <div className="sheet p-5">
                    <SectionTitle>
                        <Wallet className="w-5 h-5 text-in" />
                        Monthly Contribution Plan
                    </SectionTitle>

                    {contributionPlan.note && (
                        <p className="text-sm text-ink mb-4 p-3 bg-carbon-soft rounded-lg">
                            {contributionPlan.note}
                        </p>
                    )}

                    <ul className="divide-y divide-rule border-t border-rule">
                        {(contributionPlan.contributions || []).map(c => {
                            const cfg = HOLDING_CONFIG[c.type];
                            return (
                                <li key={c.type} className="py-3 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 items-baseline">
                                    <span className="flex items-center gap-2 font-semibold min-w-0">
                                        <span className="chip-dot" style={{ backgroundColor: cfg?.color }} />
                                        <span className="truncate">{cfg?.shortName}</span>
                                    </span>
                                    <span className={`num font-semibold text-right ${c.amount > 0 ? 'text-in' : 'text-ink-3'}`}>
                                        {c.amount > 0 ? '+' : ''}{formatCurrency(c.amount)}
                                    </span>
                                    <span className="col-span-2 text-sm text-ink-3">{c.reason}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Contribution History */}
            {showHistory && contributions.length > 0 && (
                <div className="sheet p-5">
                    <SectionTitle>
                        <History className="w-5 h-5 text-ink-2" /> Recent Contributions
                    </SectionTitle>
                    <div className="overflow-x-auto -mx-5">
                        <table className="w-full">
                            <thead className="bg-well border-y border-rule">
                                <tr>
                                    <th className="text-left px-5 py-2.5 form-head">Date</th>
                                    <th className="text-left px-3 py-2.5 form-head">Asset</th>
                                    <th className="text-right px-5 sm:px-3 py-2.5 form-head">Amount</th>
                                    <th className="text-left px-5 py-2.5 form-head hidden sm:table-cell">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rule">
                                {contributions.slice(0, 10).map(c => {
                                    const cfg = HOLDING_CONFIG[c.type];
                                    return (
                                        <tr key={c.id} className="hover:bg-well">
                                            <td className="px-5 py-3 text-sm num text-ink-2">{c.date}</td>
                                            <td className="px-3 py-3"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cfg?.color }} /><span className="text-sm">{cfg?.shortName || c.type}</span></span></td>
                                            <td className="px-5 sm:px-3 py-3 text-right font-semibold num text-in">+{formatCurrency(c.amount)}</td>
                                            <td className="px-5 py-3 text-sm text-ink-3 hidden sm:table-cell">{c.notes || '-'}</td>
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
                <Dialog
                    title="Settings"
                    onClose={() => setShowSettings(false)}
                    footer={<>
                        <button onClick={handleSaveConfig} className="btn-primary flex-1"><Check className="w-4 h-4" /> Save</button>
                        <button onClick={() => setShowSettings(false)} className="btn-quiet">Cancel</button>
                    </>}
                >
                    <Field label="Monthly Budget (IDR)">
                        <div className="amount-box focus-within:border-carbon focus-within:shadow-[0_0_0_3px_var(--carbon-soft)]"><span className="amount-rp">Rp</span><input type="number" value={config.monthly_budget} onChange={(e) => setConfig({ monthly_budget: parseFloat(e.target.value) })} inputMode="numeric" className="amount-fig h-12 text-lg bg-transparent outline-none" /></div>
                    </Field>
                    <Terbilang value={config.monthly_budget} className="mt-2" />
                </Dialog>
            )}

            {/* Contribute Modal */}
            {showContributeForm && (
                <Dialog
                    title="Log Contribution"
                    tone="in"
                    onClose={closeContribute}
                    footer={<>
                        <button
                            type="submit"
                            form="contribute-form"
                            disabled={submittingContribute}
                            className="btn-in flex-1"
                        >
                            {submittingContribute ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {submittingContribute ? 'Logging...' : 'Log'}
                        </button>
                        <button
                            type="button"
                            disabled={submittingContribute}
                            onClick={closeContribute}
                            className="btn-quiet"
                        >
                            Cancel
                        </button>
                    </>}
                >
                    <form id="contribute-form" onSubmit={handleContribute} className="space-y-4">
                        <div>
                            <span className="form-head block mb-1.5">Asset</span>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {Object.entries(HOLDING_CONFIG).map(([type, cfg]) => (
                                    <button
                                        key={type}
                                        type="button"
                                        aria-pressed={contributeForm.type === type}
                                        disabled={submittingContribute}
                                        onClick={() => setContributeForm(prev => ({ ...prev, type }))}
                                        className={`p-2 rounded-lg border text-center transition-colors disabled:opacity-50 ${contributeForm.type === type ? 'border-carbon bg-carbon-soft text-ink' : 'border-rule text-ink-2 hover:border-rule-strong'}`}
                                    >
                                        <span className="text-xl block" aria-hidden="true">{cfg.emoji}</span>
                                        <span className="text-xs font-medium block truncate">{cfg.shortName}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Field label="Amount (IDR)">
                                <div className="amount-box focus-within:border-carbon focus-within:shadow-[0_0_0_3px_var(--carbon-soft)]"><span className="amount-rp">Rp</span><input
                                    type="number"
                                    required
                                    disabled={submittingContribute}
                                    value={contributeForm.amount}
                                    onChange={(e) => setContributeForm(prev => ({ ...prev, amount: e.target.value }))}
                                    inputMode="numeric" className="amount-fig h-12 text-lg bg-transparent outline-none disabled:cursor-not-allowed"
                                    placeholder="5000000"
                                /></div>
                            </Field>
                            <Terbilang value={contributeForm.amount} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Date">
                                <input
                                    type="date"
                                    required
                                    disabled={submittingContribute}
                                    value={contributeForm.date}
                                    onChange={(e) => setContributeForm(prev => ({ ...prev, date: e.target.value }))}
                                    className="field"
                                />
                            </Field>
                            <Field label="Notes">
                                <input
                                    type="text"
                                    disabled={submittingContribute}
                                    value={contributeForm.notes}
                                    onChange={(e) => setContributeForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="field"
                                    placeholder="Monthly"
                                />
                            </Field>
                        </div>
                    </form>
                </Dialog>
            )}

            {/* Edit Holdings Modal */}
            {showEditHoldings && (
                <Dialog
                    title="Update Values"
                    onClose={() => setShowEditHoldings(false)}
                    footer={<>
                        <button onClick={handleUpdateHoldings} className="btn-primary flex-1"><Check className="w-4 h-4" /> Update</button>
                        <button onClick={() => setShowEditHoldings(false)} className="btn-quiet">Cancel</button>
                    </>}
                >
                    <div className="space-y-5">
                        {(summary.holdings || []).map(h => {
                            const cfg = HOLDING_CONFIG[h.type];
                            return (
                                <div key={h.type}>
                                    <Field label={cfg?.name || h.type}>
                                        <div className="amount-box focus-within:border-carbon focus-within:shadow-[0_0_0_3px_var(--carbon-soft)]"><span className="amount-rp">Rp</span><input
                                            type="number"
                                            value={holdingsForm[h.type]?.current_value ?? 0}
                                            onChange={(e) => setHoldingsForm(prev => ({
                                                ...prev,
                                                [h.type]: {
                                                    ...prev[h.type],
                                                    current_value: e.target.value
                                                }
                                            }))}
                                            inputMode="numeric" className="amount-fig h-12 text-lg bg-transparent outline-none disabled:cursor-not-allowed"
                                        /></div>
                                    </Field>
                                    {h.type === 'gold' && (
                                        <Field label="Current Gold (grams)" className="mt-3">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={holdingsForm[h.type]?.current_grams ?? 0}
                                                onChange={(e) => setHoldingsForm(prev => ({
                                                    ...prev,
                                                    [h.type]: {
                                                        ...prev[h.type],
                                                        current_grams: e.target.value
                                                    }
                                                }))}
                                                className="field h-12 text-lg num"
                                            />
                                        </Field>
                                    )}
                                    <p className="text-xs text-ink-3 mt-1">{h.platform}</p>
                                </div>
                            );
                        })}
                    </div>
                </Dialog>
            )}
        </div>
    );
}

const AXIS_TICK = { fill: 'var(--ink-3)', fontSize: 12 };
const TOOLTIP_STYLE = { background: 'var(--sheet)', border: '1px solid var(--rule)', borderRadius: 8, color: 'var(--ink)' };

// A bucket: a sheet whose colour lives in its dot; total in an amount box.
function BucketCard({ icon: Icon, title, color, total, children }) {
    return (
        <div className="sheet">
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3 text-ink-2">
                    <span className="chip-dot" style={{ backgroundColor: color }} />
                    <Icon className="w-4 h-4" />
                    <span className="form-head">{title}</span>
                </div>
                <AmountBox value={total} />
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}
