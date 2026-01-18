import React, { useState, useMemo } from 'react';
import { Trade, TradeStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TradeCalendarProps {
  trades: Trade[];
}

const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    
    // Map trades to days
    const dailyStats: Record<number, { pnl: number, trades: number, wins: number }> = {};
    let monthPnL = 0;
    
    trades.forEach(trade => {
        const tDate = new Date(trade.entryDate);
        if (tDate.getFullYear() === year && tDate.getMonth() === month && trade.status === TradeStatus.CLOSED) {
            const day = tDate.getDate();
            if (!dailyStats[day]) {
                dailyStats[day] = { pnl: 0, trades: 0, wins: 0 };
            }
            dailyStats[day].pnl += trade.pnl;
            dailyStats[day].trades += 1;
            if (trade.pnl > 0) dailyStats[day].wins += 1;
            monthPnL += trade.pnl;
        }
    });

    return { daysCount, startDay, dailyStats, monthPnL };
  }, [trades, currentDate]);

  const { daysCount, startDay, dailyStats, monthPnL } = calendarData;

  const renderDays = () => {
      const days = [];
      // Empty cells for previous month
      for (let i = 0; i < startDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border-b border-r border-slate-100"></div>);
      }

      // Actual days
      for (let day = 1; day <= daysCount; day++) {
          const stats = dailyStats[day];
          const hasActivity = !!stats;
          const isProfitable = hasActivity && stats.pnl >= 0;
          
          days.push(
              <div key={day} className="h-32 border-b border-r border-slate-200 bg-white p-2 relative group hover:bg-slate-50 transition-colors">
                  <span className={`text-sm font-semibold ${hasActivity ? 'text-slate-700' : 'text-slate-400'}`}>{day}</span>
                  
                  {hasActivity && (
                      <div className="mt-2 flex flex-col items-center justify-center h-full pb-6">
                          <div className={`text-lg font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {stats.pnl > 0 ? '+' : ''}₹{stats.pnl.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                             <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {stats.trades} Trades
                             </span>
                          </div>
                          {stats.trades > 0 && (
                            <div className="mt-1 h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${isProfitable ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                                    style={{ width: `${(stats.wins / stats.trades) * 100}%` }}
                                ></div>
                            </div>
                          )}
                      </div>
                  )}
              </div>
          );
      }
      return days;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Trade Calendar</h1>
            <p className="text-slate-500 text-sm">Review your consistency and daily performance.</p>
        </div>
        <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 uppercase font-semibold">Monthly P&L</p>
                <p className={`text-xl font-bold ${monthPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {monthPnL > 0 ? '+' : ''}₹{monthPnL.toLocaleString()}
                </p>
            </div>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="px-4 font-bold text-slate-800 min-w-[140px] text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-md text-slate-600">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                    {day}
                </div>
            ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-slate-100 border-l border-t border-slate-200">
            {renderDays()}
        </div>
      </div>
    </div>
  );
};

export default TradeCalendar;