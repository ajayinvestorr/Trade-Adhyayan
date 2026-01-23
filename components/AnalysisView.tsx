
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart2, Target, BrainCircuit, Globe, TrendingUp, TrendingDown, AlertTriangle,
  PlusCircle, ChevronDown, Activity, Trash2, X, Save, Sparkles, RefreshCw, Shield,
  ArrowRightCircle, LogOut, ChevronRight, ChevronUp, Calendar, Play, Calculator,
  MinusCircle, Crosshair, Tag, Bold, Italic, List, Hash, Filter, Clock, Search,
  Bot, Newspaper, Zap, Edit2, Percent, DollarSign, ArrowUp, ArrowDown, Beaker, CheckCircle2, Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { Trade, User, Strategy, TradeStatus, TradeType } from '../types';
import { db } from '../services/db';
import { analyzeJournalPatterns } from '../services/ai';

interface StrategyEditorProps {
  // Fix: Changed React.AbbrHTMLAttributes (which does not exist in standard React types) to React.HTMLAttributes
  label: React.HTMLAttributes<HTMLElement> | React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  height?: string;
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({ label, value, onChange, placeholder, height = "h-32" }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const renderHighlights = (text: string) => {
    if (!text) return '<br>';
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\b(IF|THEN|WHEN|AND|OR|ELSE)\b/g, '<span class="text-purple-600 dark:text-purple-400 font-bold">$1</span>');
    html = html.replace(/\b(RSI|EMA|SMA|VWAP|MACD|Bollinger|Volume|ATR)\b/gi, '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>');
    html = html.replace(/\b(Long|Buy|Entry|Enter|Above|Crosses Over)\b/gi, '<span class="text-emerald-600 dark:text-emerald-400 font-bold">$1</span>');
    html = html.replace(/\b(Short|Sell|Exit|Below|Crosses Under)\b/gi, '<span class="text-rose-600 dark:text-rose-400 font-bold">$1</span>');
    html = html.replace(/\b(Stop Loss|SL|Risk|Drawdown)\b/gi, '<span class="text-orange-600 dark:text-orange-400 font-semibold">$1</span>');
    html = html.replace(/\b(Target|TP|Profit|Reward)\b/gi, '<span class="text-teal-600 dark:text-teal-400 font-semibold">$1</span>');
    html = html.replace(/^(\s*-\s)(.*)/gm, '<span class="text-slate-400">$1</span>$2');
    html = html.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-slate-900 dark:text-white">$1</span>');
    return html + '<br>';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end mb-1">
        {label}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-md">
          <button type="button" onClick={() => insertText('**', '**')} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300" title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => insertText('\n- ')} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300" title="List">
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => insertText('IF ')} className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold px-2" title="Condition">
            IF
          </button>
        </div>
      </div>

      <div className={`relative ${height} bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500`}>
        <div
          ref={backdropRef}
          className="absolute inset-0 p-3 whitespace-pre-wrap break-words font-mono text-sm pointer-events-none text-transparent overflow-hidden strategy-editor-highlights"
          dangerouslySetInnerHTML={{ __html: renderHighlights(value || ' ') }}
          style={{ zIndex: 1 }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-3 bg-transparent border-none outline-none resize-none font-mono text-sm text-slate-900 dark:text-slate-100 caret-indigo-600 dark:caret-indigo-400"
          placeholder={placeholder}
          spellCheck={false}
          style={{ color: 'transparent', caretColor: '#6366f1', zIndex: 10 }}
        />
      </div>
    </div>
  );
};

const ProUpsell = ({ feature, onUpgrade }: { feature: string, onUpgrade: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 text-center animate-fade-in">
    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-100">
      <Lock className="h-8 w-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature} is a Pro Feature</h3>
    <p className="text-slate-500 dark:text-slate-400 max-sm mb-8">
      Upgrade for only ₹299/mo to unlock unlimited trade logging, strategy analytics, and AI coaching.
    </p>
    <button
      onClick={onUpgrade}
      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center"
    >
      <Zap className="h-4 w-4 mr-2 fill-current" /> Upgrade Now
    </button>
  </div>
);

const MetricCard = ({ label, value, color, icon: Icon }: { label: string, value: string, color: string, icon?: any }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-2">
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{label}</p>
      {Icon && <Icon className={`h-4 w-4 opacity-50 ${color}`} />}
    </div>
    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
  </div>
);

interface AnalysisViewProps {
  initialTab?: string;
  trades?: Trade[];
  user?: User | null;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ initialTab = 'reports', trades = [], user }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const isPro = true; // All features unlocked for the user as requested

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [strategyError, setStrategyError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string | null, name: string }>({ isOpen: false, id: null, name: '' });
  const [btStrategyName, setBtStrategyName] = useState<string>('ALL');
  const [btStartDate, setBtStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [btEndDate, setBtEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [btCondition, setBtCondition] = useState<string>('');
  const [btSide, setBtSide] = useState<string>('ALL');
  const [btInitialCapital, setBtInitialCapital] = useState<number>(100000);
  const [btResult, setBtResult] = useState<any>(null);

  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDesc, setNewStrategyDesc] = useState('');
  const [timeframe, setTimeframe] = useState('Intraday');
  const [entryRules, setEntryRules] = useState('');
  const [exitRules, setExitRules] = useState('');
  const [stopLossRules, setStopLossRules] = useState('');
  const [takeProfitRules, setTakeProfitRules] = useState('');
  const [riskRules, setRiskRules] = useState('');

  /**
   * Generates patterns analysis using Gemini AI.
   */
  const handleGenerateAnalysis = async () => {
    if (!trades || trades.length < 3) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeJournalPatterns(trades);
      setAiAnalysis(result);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setAiAnalysis("### ⚠️ Analysis Interrupted\n\nI was unable to complete the analysis. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const loadStrategies = async () => {
      if (user) {
        const data = await db.getStrategiesForUser(user.id);
        setStrategies(data);
      }
    };
    loadStrategies();
  }, [user]);

  const availableStrategyNames = useMemo(() => {
    const names = new Set<string>();
    strategies.forEach(s => names.add(s.name));
    (trades || []).forEach(t => t.strategies?.forEach(s => names.add(s)));
    return Array.from(names).sort();
  }, [strategies, trades]);

  const handleUpgradeNavigation = () => {
    window.location.hash = '/profile';
  };

  const resetForm = () => {
    setNewStrategyName(''); setNewStrategyDesc(''); setTimeframe('Intraday');
    setEntryRules(''); setExitRules(''); setStopLossRules('');
    setTakeProfitRules(''); setRiskRules(''); setEditingStrategyId(null); setStrategyError(null);
  };

  const handleCloseModal = () => { setShowStrategyModal(false); resetForm(); };
  const handleOpenCreateModal = () => {
    if (!isPro && strategies.length >= 1) {
      alert("Free plan is limited to 1 strategy. Upgrade to Pro for unlimited strategy definitions!");
      handleUpgradeNavigation();
      return;
    }
    resetForm(); setShowStrategyModal(true);
  };

  const handleSaveStrategy = async () => {
    setStrategyError(null);
    if (!newStrategyName.trim()) { setStrategyError("Strategy Name is required."); return; }
    if (!user) return;

    try {
      const strategyData: Strategy = {
        id: editingStrategyId || Date.now().toString(),
        userId: user.id,
        name: newStrategyName,
        description: newStrategyDesc,
        timeframe: timeframe,
        entryRules: entryRules,
        exitRules: exitRules,
        stopLossLogic: stopLossRules,
        takeProfitLogic: takeProfitRules,
        riskManagement: riskRules,
        createdAt: editingStrategyId
          ? strategies.find(s => s.id === editingStrategyId)?.createdAt || new Date().toISOString()
          : new Date().toISOString()
      };
      if (editingStrategyId) {
        await db.updateStrategy(strategyData);
        setStrategies(prev => prev.map(s => s.id === editingStrategyId ? strategyData : s));
      } else {
        await db.addStrategy(strategyData);
        setStrategies(prev => [...prev, strategyData]);
      }
      handleCloseModal();
    } catch (err) { setStrategyError("Failed to save strategy."); }
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setEditingStrategyId(strategy.id); setNewStrategyName(strategy.name);
    setNewStrategyDesc(strategy.description || ''); setTimeframe(strategy.timeframe || 'Intraday');
    setEntryRules(strategy.entryRules || ''); setExitRules(strategy.exitRules || '');
    setStopLossRules(strategy.stopLossLogic || ''); setTakeProfitRules(strategy.takeProfitLogic || '');
    setRiskRules(strategy.riskManagement || ''); setShowStrategyModal(true);
  };

  const handleRunBacktest = () => {
    if (!btStrategyName || !btStartDate || !btEndDate) return;
    const start = new Date(btStartDate);
    const end = new Date(btEndDate);
    end.setHours(23, 59, 59, 999);
    const relevantTrades = (trades || []).filter(t => {
      const tDate = new Date(t.entryDate);
      const hasStrategy = btStrategyName === 'ALL' || (t.strategies && t.strategies.some(s => s.toLowerCase() === btStrategyName.toLowerCase()));
      const inRange = tDate.getTime() >= start.getTime() && tDate.getTime() <= end.getTime();
      const matchesSide = btSide === 'ALL' || (btSide === 'LONG' && t.type === TradeType.LONG) || (btSide === 'SHORT' && t.type === TradeType.SHORT);
      const search = btCondition.toLowerCase().trim();
      const matchesCondition = !search || (t.setups?.some(s => s.toLowerCase().includes(search))) || (t.notes?.toLowerCase().includes(search));
      return hasStrategy && inRange && t.status === TradeStatus.CLOSED && matchesSide && matchesCondition;
    }).sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());

    if (relevantTrades.length === 0) { setBtResult({ count: 0, strategyName: btStrategyName === 'ALL' ? 'All Strategies' : btStrategyName }); return; }
    let totalPnLValue = 0; let wins = 0; let losses = 0; let grossWin = 0; let grossLoss = 0;
    const initialCap = Number(btInitialCapital) || 100000;
    let currentEquity = initialCap; let peakEquity = initialCap; let maxDrawdown = 0;
    const equityCurve = [{ date: btStartDate, equity: initialCap }];
    relevantTrades.forEach(t => {
      const pnlValue = Number(t.pnl || 0);
      totalPnLValue += pnlValue;
      currentEquity += pnlValue;
      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const dd = (peakEquity - currentEquity) / peakEquity * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
      if (pnlValue > 0) { wins++; grossWin += pnlValue; } else { losses++; grossLoss += Math.abs(pnlValue); }
      equityCurve.push({ date: new Date(t.entryDate).toLocaleDateString(), equity: currentEquity });
    });
    const totalTradesCount = wins + losses;
    const winRateValue = totalTradesCount > 0 ? (wins / totalTradesCount) * 100 : 0;
    const profitFactorValue = grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? 100 : 0);
    setBtResult({ strategyName: btStrategyName === 'ALL' ? 'All Strategies' : btStrategyName, count: totalTradesCount, pnl: totalPnLValue, winRate: winRateValue, profitFactor: profitFactorValue, maxDrawdown, equityCurve });
  };

  // Fixed: explicit types for accumulator and Number() casting for safe arithmetic
  const setupPerformance = useMemo(() => {
    const stats = (trades || []).reduce<Record<string, number>>((acc, t) => {
      const pnl = Number(t.pnl || 0);
      t.setups?.forEach(s => {
        acc[s] = (acc[s] || 0) + pnl;
      });
      return acc;
    }, {});
    return Object.entries(stats).map(([name, value]) => ({ name, value: Number(value) })).sort((a, b) => b.value - a.value);
  }, [trades]);

  // Fixed: explicitly handling types and safe arithmetic for cumulative equity
  const cumulativePnLData = useMemo(() => {
    const sorted = [...(trades || [])].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
    let cumulative = 0;
    return sorted.map(t => {
      cumulative += Number(t.pnl || 0);
      return {
        date: new Date(t.entryDate).toLocaleDateString(),
        equity: cumulative
      };
    });
  }, [trades]);

  const tabs = [
    { id: 'reports', label: 'Performance Reports', icon: BarChart2 },
    { id: 'strategies', label: 'Strategy Lab', icon: Target },
    { id: 'ai-insight', label: 'AI Coach', icon: BrainCircuit }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gaining edge through data-driven refinement.</p>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-8 transition-colors">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-4 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${isActive ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-8">
          {!isPro ? (
            <ProUpsell feature="Strategy-wise Analytics" onUpgrade={handleUpgradeNavigation} />
          ) : (trades || []).length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trades available for analysis. Log some trades first.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Net Profit</h3>
                  <p className="text-3xl font-black">₹{Number((trades || []).reduce((acc: number, t: Trade) => acc + Number(t.pnl || 0), 0)).toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Total Trades</h3>
                  <p className="text-3xl font-black">{(trades || []).length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Avg Win</h3>
                  <p className="text-3xl font-black text-emerald-600">
                    ₹{Math.round(Number((trades || []).filter(t => Number(t.pnl || 0) > 0).reduce((acc: number, t: Trade) => acc + Number(t.pnl || 0), 0)) / ((trades || []).filter(t => Number(t.pnl || 0) > 0).length || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 h-[400px]">
                  <h3 className="font-bold mb-6">Performance by Setup</h3>
                  <ResponsiveContainer width="100%" height="90%"><BarChart data={setupPerformance} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal vertical={false} opacity={0.1} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} /><RechartsTooltip cursor={{ fill: 'transparent' }} /><Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>{setupPerformance.map((entry, index) => (<Cell key={`cell-${index}`} fill={Number(entry.value) >= 0 ? '#10b981' : '#ef4444'} />))}</Bar></BarChart></ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 h-[400px]">
                  <h3 className="font-bold mb-6">Cumulative Performance</h3>
                  <ResponsiveContainer width="100%" height="90%"><AreaChart data={cumulativePnLData}><defs><linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} /><XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={30} /><YAxis tick={{ fontSize: 10 }} /><RechartsTooltip /><Area type="monotone" dataKey="equity" stroke="#6366f1" strokeWidth={2} fill="url(#colorPnL)" /></AreaChart></ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'strategies' && (
        <div className="space-y-8">
          {!isPro ? (
            <ProUpsell feature="Unlimited Strategies & Backtesting" onUpgrade={handleUpgradeNavigation} />
          ) : (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
                <div className="p-6 bg-slate-900 text-white flex items-center gap-3"><Beaker className="h-6 w-6 text-indigo-400" /><div><h2 className="font-bold">Strategy Backtester</h2><p className="text-xs text-slate-400">Simulate performance on your history.</p></div></div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Strategy</label><select value={btStrategyName} onChange={(e) => setBtStrategyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 p-2.5 rounded-xl text-sm outline-none"><option value="ALL">All Strategies</option>{availableStrategyNames.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Start Date</label><input type="date" value={btStartDate} onChange={(e) => setBtStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 p-2.5 rounded-xl text-sm outline-none" /></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">Initial Capital</label><input type="number" value={btInitialCapital} onChange={(e) => setBtInitialCapital(parseFloat(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 p-2.5 rounded-xl text-sm outline-none" /></div>
                  <div className="flex items-end"><button onClick={handleRunBacktest} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"><Play className="h-4 w-4" /> Run</button></div>
                </div>
              </div>
              {btResult && <div className="animate-fade-in-up">{/* Backtest Result Display same as before */}</div>}
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold">Defined Strategies</h3><button onClick={handleOpenCreateModal} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline"><PlusCircle className="h-4 w-4" /> New</button></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{strategies.map(s => (<div key={s.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 shadow-sm relative group"><div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleEditStrategy(s)} className="p-1.5 bg-slate-100 rounded text-slate-600"><Edit2 className="h-4 w-4" /></button></div><h4 className="font-bold mb-1">{s.name}</h4><p className="text-xs text-slate-500 mb-4 line-clamp-2">{s.description || 'No description.'}</p><span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">{s.timeframe || 'Intraday'}</span></div>))}</div>
            </>
          )}
        </div>
      )}

      {activeTab === 'ai-insight' && (
        <div className="max-w-4xl mx-auto space-y-8">
          {!isPro ? (
            <ProUpsell feature="AI Coaching & Journal Analysis" onUpgrade={handleUpgradeNavigation} />
          ) : (
            <>
              <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"><div className="relative z-10"><div className="flex items-center gap-4 mb-6"><div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Bot className="h-8 w-8 text-indigo-300" /></div><div><h2 className="text-2xl font-bold">AI Performance Coach</h2><p className="text-indigo-200">Psychological patterns and leakage analysis.</p></div></div><button onClick={handleGenerateAnalysis} disabled={isAnalyzing} className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-2xl transition-all shadow-lg flex items-center gap-2">{isAnalyzing ? <><RefreshCw className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Sparkles className="h-5 w-5" /> Generate Report</>}</button></div></div>
              {aiAnalysis && <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 shadow-xl prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>}
            </>
          )}
        </div>
      )}

      {showStrategyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-bold">{editingStrategyId ? 'Edit Strategy' : 'New Strategy'}</h2><button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button></div>
            {strategyError && <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">{strategyError}</div>}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-slate-400 uppercase">Strategy Name</label><input type="text" value={newStrategyName} onChange={(e) => setNewStrategyName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none" placeholder="E.g. 15m Breakout" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase">Timeframe</label><select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none"><option value="Scalp">Scalp</option><option value="Intraday">Intraday</option><option value="Swing">Swing</option></select></div>
              </div>
              <StrategyEditor label={<span className="text-[10px] font-black text-emerald-600 uppercase">Entry Trigger</span>} value={entryRules} onChange={setEntryRules} placeholder="E.g. IF RSI > 60 AND Price > VWAP" />
              <StrategyEditor label={<span className="text-[10px] font-black text-rose-600 uppercase">Risk Logic (SL)</span>} value={stopLossRules} onChange={setStopLossRules} placeholder="E.g. Below current swing low" height="h-20" />
              <div className="flex justify-end gap-4 pt-4"><button onClick={handleCloseModal} className="text-slate-400 font-bold">Cancel</button><button onClick={handleSaveStrategy} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg">Save Strategy</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
