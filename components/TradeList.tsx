
import React, { useState, useEffect, useMemo } from 'react';
import { Trade, AssetClass, TradeType, User } from '../types';
import { Search, Filter, Calendar, LayoutList, X, RefreshCw, Trash2, History, SlidersHorizontal, Download, Lock } from 'lucide-react';
import { db } from '../services/db';

interface TradeListProps {
  trades: Trade[];
  onDeleteTrade?: (tradeId: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onDeleteTrade }) => {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterAsset, setFilterAsset] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStrategy, setFilterStrategy] = useState<string>('');
  const [filterEvent, setFilterEvent] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    setUser(db.getSession());
  }, []);

  const availableStrategies = useMemo(() => {
    const strategies = new Set<string>();
    trades.forEach(t => t.strategies?.forEach(s => strategies.add(s)));
    return Array.from(strategies).sort();
  }, [trades]);

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = searchTerm === '' || trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || (trade.setups && trade.setups.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesAsset = filterAsset === '' || trade.assetClass === filterAsset;
    const matchesType = filterType === '' || trade.type === filterType;
    const matchesStrategy = filterStrategy === '' || (trade.strategies && trade.strategies.includes(filterStrategy));
    const matchesEvent = filterEvent === '' || (trade.marketEvents && trade.marketEvents.includes(filterEvent));
    let matchesDate = true;
    if (startDate) matchesDate = matchesDate && new Date(trade.entryDate) >= new Date(startDate);
    if (endDate) { const end = new Date(endDate); end.setHours(23, 59, 59, 999); matchesDate = matchesDate && new Date(trade.entryDate) <= end; }
    return matchesSearch && matchesAsset && matchesType && matchesStrategy && matchesDate && matchesEvent;
  });

  const handleExport = async () => {
      try {
          const data = await db.exportDatabase();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trades_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
      } catch (e) {
          alert("Export failed.");
      }
  };

  const hasActiveFilters = searchTerm || filterAsset || filterType || filterStrategy || filterEvent || startDate || endDate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trade Journal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and analyze your trading history</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button 
                  onClick={handleExport}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold shadow-sm"
              >
                  <Download className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600">Export JSON</span>
              </button>
              <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center space-x-2 px-4 py-2.5 border rounded-xl transition-colors shadow-sm text-sm font-bold ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-300 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}
              >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
              </button>
          </div>
      </div>

      <div className="space-y-3">
        {trades.length > 0 ? (
          <>
            <div className="hidden md:grid grid-cols-7 gap-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-8">
                <div>Date</div><div>Symbol</div><div>Type</div><div className="col-span-2">Setups</div><div className="text-right">Price</div><div className="text-right pr-12">P&L</div>
            </div>
            {filteredTrades.map((trade) => (
              <div key={trade.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-all">
                <div className="flex flex-col md:grid md:grid-cols-7 gap-4 items-center">
                    <div className="flex items-center w-full md:w-auto text-sm font-medium text-slate-500"><Calendar className="h-4 w-4 mr-2 opacity-50" />{new Date(trade.entryDate).toLocaleDateString()}</div>
                    <div className="w-full md:w-auto"><div className="font-bold text-slate-900 dark:text-white">{trade.symbol}</div><div className="text-[10px] font-black text-slate-400 uppercase">{trade.assetClass}</div></div>
                    <div className="w-full md:w-auto"><span className={`px-2 py-0.5 inline-flex text-[10px] font-black rounded-lg uppercase tracking-wide ${trade.type.includes('Long') ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>{trade.type.includes('Long') ? 'LONG' : 'SHORT'}</span></div>
                    <div className="w-full md:col-span-2 flex flex-wrap gap-1">{trade.setups?.slice(0, 2).map((s, i) => (<span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-500 border border-slate-100 dark:border-slate-600">{s}</span>))}</div>
                    <div className="w-full md:w-auto text-right"><div className="font-mono text-sm">₹{trade.entryPrice}</div></div>
                    <div className="w-full md:w-auto text-right flex items-center justify-between md:justify-end gap-4"><div className={`text-sm font-black ${(trade.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹{(trade.pnl || 0).toLocaleString()}</div><button onClick={() => onDeleteTrade?.(trade.id)} className="p-2 rounded-full text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              </div>
            ))}
            {filteredTrades.length === 0 && <div className="py-20 text-center text-slate-400">No trades match filters.</div>}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-dashed border-slate-200">
             <LayoutList className="h-10 w-10 text-slate-300 mb-4" />
             <h3 className="text-xl font-bold">Your journal is empty</h3>
             <p className="text-slate-500 text-sm mt-2">Log your first trade to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeList;
