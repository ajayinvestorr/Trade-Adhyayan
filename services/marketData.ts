
import { useState, useEffect } from 'react';

export interface MarketIndex {
  symbol: string;
  price: number;
  change: number; // percentage
}

export const useMarketData = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([
    { symbol: 'NIFTY 50', price: 24142.50, change: 0.45 },
    { symbol: 'BANK NIFTY', price: 51120.20, change: -0.12 },
    { symbol: 'NIFTY FIN', price: 23890.00, change: 0.97 },
    { symbol: 'NIFTY IT', price: 38200.10, change: -0.34 },
    { symbol: 'SENSEX', price: 79800.00, change: 0.21 },
    { symbol: 'GOLD', price: 72500.00, change: 0.05 },
    { symbol: 'USD/INR', price: 83.45, change: 0.02 },
    { symbol: 'CRUDEOIL', price: 6450.00, change: -1.20 },
  ]);

  useEffect(() => {
    // Increased interval to 5 seconds to reduce re-renders and potential lag
    const interval = setInterval(() => {
      setIndices(prev => prev.map(item => {
        // Reduced volatility for smoother updates
        const volatility = 0.0002; 
        const changeFactor = 1 + (Math.random() * volatility * 2 - volatility);
        
        const newPrice = item.price * changeFactor;
        const newChange = item.change + ((changeFactor - 1) * 100);
        
        return {
          ...item,
          price: Number(newPrice.toFixed(2)),
          change: Number(newChange.toFixed(2))
        };
      }));
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return indices;
};
