
// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trade, TradeType, AssetClass, TradeStatus, MarketCondition, Mood, Strategy, User } from '../types';
import { Save, Calculator, ChevronDown, ChevronUp, X, Star, Target, AlertCircle, Plus, Check, Search, Hash, Zap } from 'lucide-react';
import { db } from '../services/db';

const TagInput = ({ label, tags, onAdd, onRemove, suggestions = [], placeholder = "Type to search or add..." }: any) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        onAdd(input.trim());
        setInput('');
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (item: string) => {
      onAdd(item);
      setInput('');
      setIsOpen(false);
  };

  const availableSuggestions = suggestions.filter((s: string) => 
      !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative mb-4">
      {label && <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag: string, idx: number) => (
          <span key={idx} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center border border-indigo-100 dark:border-indigo-800">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="ml-1.5 hover:text-indigo-900 dark:hover:text-indigo-100"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
              setInput(e.target.value);
              setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2.5 text-sm placeholder-slate-400 dark:placeholder-slate-500 transition-colors outline-none"
          placeholder={placeholder}
        />
        
        {isOpen && availableSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto animate-fade-in-up">
            {availableSuggestions.map((s: string) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center justify-between group"
              >
                <span>{s}</span>
                <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StrategyInput = ({ selectedStrategies, allStrategies, onAdd, onRemove, onNavigate }: any) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const defaultSuggestions = ['Intraday Momentum', 'Swing Setup', 'Scalp Reversal', 'Gap Fill', 'Breakout Re-test'];

  const options = useMemo(() => {
    const term = input.toLowerCase();
    const safeStrats = Array.isArray(allStrategies) ? allStrategies : [];
    
    const userStrats = safeStrats
      .filter(s => !selectedStrategies.includes(s.name) && s.name.toLowerCase().includes(term))
      .map(s => ({ name: s.name, type: 'custom' }));

    const defaults = defaultSuggestions
      .filter(s => !selectedStrategies.includes(s) && s.toLowerCase().includes(term) && !userStrats.some(us => us.name === s))
      .map(s => ({ name: s, type: 'default' }));

    const merged = [...userStrats, ...defaults];
    if (input.trim() && !merged.some(m => m.name.toLowerCase() === input.trim().toLowerCase())) {
        merged.push({ name: input.trim(), type: 'new' });
    }
    return merged;
  }, [input, allStrategies, selectedStrategies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
      onAdd(name);
      setInput('');
      setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Strategy Focus</label>
        <button type="button" onClick={() => onNavigate('/strategies')} className="text-xs text-indigo-600 font-bold hover:underline">Manage</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {selectedStrategies.map((tag: string, idx: number) => (
          <span key={idx} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-lg text-xs font-bold flex items-center border border-indigo-200 dark:border-indigo-700">
            <Target className="h-3 w-3 mr-1.5 opacity-70" />
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="ml-2"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search saved strategies..."
        />
        {isOpen && options.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt.name}
                type="button"
                onClick={() => handleSelect(opt.name)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-slate-700 dark:text-slate-200 flex items-center"
              >
                {opt.type === 'custom' && <Star className="h-3 w-3 text-yellow-500 mr-2" />}
                {opt.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AddTradeForm: React.FC<any> = ({ onAddTrade, onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [monthlyTradeCount, setMonthlyTradeCount] = useState(0);
  const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Trade>>({
    symbol: '',
    assetClass: AssetClass.EQUITY,
    type: TradeType.LONG,
    entryDate: new Date().toISOString().slice(0, 16),
    status: TradeStatus.CLOSED,
    quantity: 1,
    fees: 0,
    pnl: 0,
    rating: 0,
    setups: [],
    strategies: [],
    mistakes: [],
    emotions: [],
    notes: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
        const session = db.getSession();
        if (session) {
            setUser(session);
            setSavedStrategies(await db.getStrategiesForUser(session.id));
            const trades = await db.getTradesForUser(session.id);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const count = trades.filter(t => {
                const d = new Date(t.entryDate);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;
            setMonthlyTradeCount(count);
        }
    };
    fetchInitialData();
  }, []);

  // Recalculate P/L whenever relevant fields change
  useEffect(() => {
    const { entryPrice, exitPrice, quantity, type, fees } = formData;
    if (entryPrice && exitPrice && quantity) {
      const priceDiff = exitPrice - entryPrice;
      const grossPnL = (type === TradeType.LONG ? priceDiff : -priceDiff) * quantity;
      const net = grossPnL - (fees || 0);
      setFormData(prev => ({ ...prev, pnl: Number(net.toFixed(2)) }));
    }
  }, [formData.entryPrice, formData.exitPrice, formData.quantity, formData.type, formData.fees]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.symbol?.trim()) newErrors.symbol = "Symbol required";
    if (!formData.entryPrice || formData.entryPrice <= 0) newErrors.entryPrice = "Entry price required";
    if (formData.status === TradeStatus.CLOSED && (!formData.exitPrice || formData.exitPrice <= 0)) newErrors.exitPrice = "Exit price required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const newTrade: Trade = { id: crypto.randomUUID(), ...formData as Trade };
    onAddTrade(newTrade);
    onNavigate('/trades');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['entryPrice', 'exitPrice', 'stopLoss', 'target', 'quantity', 'fees'].includes(name) ? parseFloat(value) : value
    }));
  };

  const handleArrayUpdate = (field: keyof Trade, value: string, action: 'add' | 'remove') => {
    setFormData(prev => {
      const current = (prev[field] as string[]) || [];
      const updated = action === 'add' ? [...current, value] : current.filter(item => item !== value);
      return { ...prev, [field]: updated };
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log Execution</h1>
            <p className="text-xs font-bold text-slate-400 mt-1">
                Currently tracking <span className="text-indigo-500">{monthlyTradeCount}</span> trades this month
            </p>
        </div>
        <button onClick={() => onNavigate('/trades')} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm">Cancel</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Trade Direction</label>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setFormData({...formData, type: TradeType.LONG})} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.type === TradeType.LONG ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}>Buy (Long)</button>
                <button type="button" onClick={() => setFormData({...formData, type: TradeType.SHORT})} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.type === TradeType.SHORT ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}>Sell (Short)</button>
              </div>
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Symbol</label>
               <input type="text" name="symbol" value={formData.symbol} onChange={handleInputChange} className={`w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 uppercase ${errors.symbol ? 'border-red-500' : 'border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white'}`} placeholder="BANKNIFTY" />
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Asset</label>
               <select name="assetClass" value={formData.assetClass} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl outline-none">
                 {Object.values(AssetClass).map(a => <option key={a} value={a}>{a}</option>)}
               </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qty</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entry</label><input type="number" step="0.05" name="entryPrice" value={formData.entryPrice || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exit</label><input type="number" step="0.05" name="exitPrice" value={formData.exitPrice || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fees</label><input type="number" step="0.01" name="fees" value={formData.fees || ''} onChange={handleInputChange} className="w-full p-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl outline-none" /></div>
              <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-xl border border-slate-100 dark:border-slate-600">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">P/L (Net)</label>
                  <div className={`text-lg font-black ${formData.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹{formData.pnl?.toLocaleString()}</div>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <StrategyInput selectedStrategies={formData.strategies} allStrategies={savedStrategies} onAdd={(v) => handleArrayUpdate('strategies', v, 'add')} onRemove={(v) => handleArrayUpdate('strategies', v, 'remove')} onNavigate={onNavigate} />
             <TagInput label="Setups" tags={formData.setups} suggestions={['ORB', 'VWAP Bounce', 'Trendline', 'Pin Bar']} onAdd={(v) => handleArrayUpdate('setups', v, 'add')} onRemove={(v) => handleArrayUpdate('setups', v, 'remove')} />
           </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <TagInput label="Mistakes" tags={formData.mistakes} suggestions={['FOMO', 'No SL', 'Averaging Down', 'Revenge Trade']} onAdd={(v) => handleArrayUpdate('mistakes', v, 'add')} onRemove={(v) => handleArrayUpdate('mistakes', v, 'remove')} />
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Psychology Notes</label>
               <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-xl h-24 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="How did you feel during this trade? (Fear, Greed, Calm...)" />
             </div>
           </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
           <button type="submit" className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none flex items-center transition-all hover:-translate-y-1 active:scale-95">
             <Save className="h-5 w-5 mr-2" /> Save Execution
           </button>
        </div>
      </form>
    </div>
  );
};

export default AddTradeForm;
