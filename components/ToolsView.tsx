
import React, { useState } from 'react';
import { Calculator, Crosshair, DollarSign, Percent, RefreshCw, BarChart } from 'lucide-react';

const ToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'position' | 'pivot'>('position');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trading Tools</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Utilities to assist your trade planning and execution.</p>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('position')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center ${
            activeTab === 'position'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="h-4 w-4 mr-2" /> Position Size Calculator
        </button>
        <button
          onClick={() => setActiveTab('pivot')}
          className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center ${
            activeTab === 'pivot'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart className="h-4 w-4 mr-2" /> Pivot Points
        </button>
      </div>

      {activeTab === 'position' ? <PositionSizeCalculator /> : <PivotPointCalculator />}
    </div>
  );
};

const PositionSizeCalculator: React.FC = () => {
  const [accountBalance, setAccountBalance] = useState<number>(100000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);

  const calculate = () => {
    if (!entryPrice || !stopLoss) return null;
    
    const riskAmount = (accountBalance * riskPercent) / 100;
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    
    if (riskPerShare === 0) return null;

    const quantity = Math.floor(riskAmount / riskPerShare);
    const totalCapital = quantity * entryPrice;

    return { riskAmount, riskPerShare, quantity, totalCapital };
  };

  const results = calculate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-indigo-500" /> Inputs
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Account Balance (₹)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                        type="number" 
                        value={accountBalance} 
                        onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Risk Per Trade (%)</label>
                <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                        type="number" 
                        step="0.1"
                        value={riskPercent} 
                        onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Entry Price</label>
                    <input 
                        type="number" 
                        value={entryPrice || ''} 
                        onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Stop Loss</label>
                    <input 
                        type="number" 
                        value={stopLoss || ''} 
                        onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                        placeholder="0.00"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-center">
        {!results ? (
             <div className="text-center opacity-50">
                <Crosshair className="h-16 w-16 mx-auto mb-4" />
                <p>Enter trade details to see position size.</p>
             </div>
        ) : (
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Recommended Quantity</p>
                    <div className="text-5xl font-bold text-emerald-400">{results.quantity.toLocaleString()} <span className="text-lg text-slate-400 font-normal">Units</span></div>
                </div>
                
                <div className="h-px bg-slate-700 w-full"></div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <p className="text-xs text-slate-400 uppercase">Total Risk Amount</p>
                         <p className="text-xl font-bold text-rose-400">₹{results.riskAmount.toLocaleString()}</p>
                    </div>
                    <div>
                         <p className="text-xs text-slate-400 uppercase">Capital Required</p>
                         <p className="text-xl font-bold text-indigo-300">₹{results.totalCapital.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 mt-2">
                    <p className="text-xs text-slate-300">
                        <span className="font-bold">Logic:</span> You are risking <span className="text-rose-400">₹{results.riskAmount}</span> (1%) on a <span className="text-rose-400">₹{results.riskPerShare.toFixed(2)}</span> move against you.
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const PivotPointCalculator: React.FC = () => {
    const [high, setHigh] = useState<number>(0);
    const [low, setLow] = useState<number>(0);
    const [close, setClose] = useState<number>(0);

    const calculatePivots = () => {
        if(!high || !low || !close) return null;
        const pp = (high + low + close) / 3;
        const r1 = (2 * pp) - low;
        const s1 = (2 * pp) - high;
        const r2 = pp + (high - low);
        const s2 = pp - (high - low);
        const r3 = high + 2 * (pp - low);
        const s3 = low - 2 * (high - pp);

        return { pp, r1, s1, r2, s2, r3, s3 };
    };

    const pivots = calculatePivots();

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Previous Day Candle</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">High</label>
                            <input type="number" value={high || ''} onChange={(e) => setHigh(parseFloat(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Low</label>
                            <input type="number" value={low || ''} onChange={(e) => setLow(parseFloat(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Close</label>
                            <input type="number" value={close || ''} onChange={(e) => setClose(parseFloat(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                        </div>
                        <button onClick={() => {setHigh(0); setLow(0); setClose(0);}} className="flex items-center justify-center w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors">
                            <RefreshCw className="h-4 w-4 mr-2" /> Reset
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Standard Pivot Points</h3>
                    {!pivots ? (
                        <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                            <p className="text-slate-400 text-sm">Enter OHLC data to generate levels</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                                <span className="font-bold text-red-700 dark:text-red-400">Resistance 3 (R3)</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">{pivots.r3.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded border-l-4 border-red-400">
                                <span className="font-bold text-red-600 dark:text-red-300">Resistance 2 (R2)</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">{pivots.r2.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/5 rounded border-l-4 border-red-300">
                                <span className="font-bold text-red-500 dark:text-red-200">Resistance 1 (R1)</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">{pivots.r1.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded border-x-4 border-indigo-600 my-4 transform scale-105 shadow-sm">
                                <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">Pivot Point (PP)</span>
                                <span className="font-mono text-xl font-extrabold text-indigo-700 dark:text-white">{pivots.pp.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/5 rounded border-l-4 border-emerald-300">
                                <span className="font-bold text-emerald-500 dark:text-emerald-200">Support 1 (S1)</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">{pivots.s1.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded border-l-4 border-emerald-400">
                                <span className="font-bold text-emerald-600 dark:text-emerald-300">Support 2 (S2)</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">{pivots.s2.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded border-l-4 border-emerald-500">
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">Support 3 (S3)</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-white">{pivots.s3.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default ToolsView;
