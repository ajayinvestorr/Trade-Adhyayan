
export enum TradeType {
  LONG = 'Buy (Long)',
  SHORT = 'Sell (Short)'
}

export enum AssetClass {
  EQUITY = 'Equity',
  INDEX = 'Index',
  FUTURES = 'Futures',
  OPTIONS = 'Options',
  CRYPTO = 'Crypto'
}

export enum TradeStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  BE = 'BREAK_EVEN'
}

export enum MarketCondition {
  TRENDING_STRONG = 'Trending (Strong)',
  TRENDING_MILD = 'Trending (Mild)',
  RANGE_BOUND = 'Range Bound',
  CHOPPY = 'Choppy/Volatile'
}

export enum Mood {
  NEUTRAL = 'Neutral',
  STRESSED = 'Stressed',
  EXCITED = 'Excited',
  BORED = 'Bored',
  DISTRACTED = 'Distracted'
}

export interface Trade {
  id: string;
  userId: string; // Foreign Key to User
  symbol: string;
  assetClass: AssetClass;
  type: TradeType;
  
  // Execution
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss?: number;
  target?: number;
  
  // Financials
  fees: number;
  pnl: number;
  rrRatio?: number | string; // Risk:Reward Ratio
  status: TradeStatus;
  
  // Context & Analysis
  setups: string[]; // Multi-select
  strategies: string[]; // Custom tags
  marketCondition?: MarketCondition;
  marketEvents?: string[]; // Custom market events (e.g. FOMC, Earnings)
  mistakes: string[];
  
  // Psychology
  mood?: Mood;
  emotions: string[];
  notes: string; // General/Execution Notes
  psychologyNotes?: string; // Specific Psychology Notes
  rating?: number; // 1-5
  
  // Media
  imageUrls: string[];
}

export interface Strategy {
    id: string;
    userId: string;
    name: string;
    description: string;
    timeframe?: string;
    // Detailed Rules
    entryRules?: string;
    exitRules?: string;
    stopLossLogic?: string;
    takeProfitLogic?: string;
    riskManagement?: string;
    createdAt: string;
}

export interface UserSubscription {
    plan: 'monthly' | 'yearly';
    startDate: string;
    expiryDate: string;
    isActive: boolean;
}

export interface User {
  id: string;
  // username: string; // Removed as per request
  email: string;
  name: string;
  photoURL?: string;
  bio?: string;
  website?: string;
  password?: string; // Stored only in mock DB, ideally hashed
  subscription?: UserSubscription;
}

export interface DashboardStats {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  averageWinner: number;
  averageLoser: number;
}
