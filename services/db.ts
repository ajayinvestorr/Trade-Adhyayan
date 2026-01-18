
import { User, Trade, Strategy, UserSubscription } from '../types';
import { MOCK_TRADES } from './mockData';
import { supabase } from './supabase';

const DB_SESSION_KEY = 'trade_adhyayan_session';
const LOCAL_TRADES_KEY = 'trade_adhyayan_local_trades';
const LOCAL_USERS_KEY = 'trade_adhyayan_local_users';

class DatabaseService {
  private useLocalOnly = false;

  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  // --- Mappers ---

  private mapUser(dbUser: any): User {
    // Force subscription to be active for all users to make the app free
    const activeSubscription: UserSubscription = {
      plan: 'yearly',
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 365 * 50).toISOString(), // 50 years
      isActive: true
    };

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      photoURL: dbUser.photo_url, 
      bio: dbUser.bio,
      website: dbUser.website,
      password: dbUser.password,
      subscription: activeSubscription
    };
  }

  private mapToDbUser(user: User): any {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photo_url: user.photoURL,
      bio: user.bio,
      website: user.website,
      password: user.password,
      subscription: user.subscription
    };
  }

  private mapTrade(dbTrade: any): Trade {
    return {
      id: dbTrade.id,
      userId: dbTrade.user_id,
      symbol: dbTrade.symbol,
      assetClass: dbTrade.asset_class,
      type: dbTrade.type,
      entryDate: dbTrade.entry_date,
      exitDate: dbTrade.exit_date,
      entryPrice: Number(dbTrade.entry_price),
      exitPrice: Number(dbTrade.exit_price),
      quantity: Number(dbTrade.quantity),
      stopLoss: Number(dbTrade.stop_loss),
      target: Number(dbTrade.target),
      fees: Number(dbTrade.fees),
      pnl: Number(dbTrade.pnl),
      rrRatio: dbTrade.rr_ratio,
      status: dbTrade.status,
      setups: dbTrade.setups || [],
      strategies: dbTrade.strategies || [],
      marketCondition: dbTrade.market_condition,
      marketEvents: dbTrade.market_events || [],
      mistakes: dbTrade.mistakes || [],
      mood: dbTrade.mood,
      emotions: dbTrade.emotions || [],
      notes: dbTrade.notes,
      psychologyNotes: dbTrade.psychology_notes,
      rating: dbTrade.rating,
      imageUrls: dbTrade.image_urls || []
    };
  }

  private mapToDbTrade(trade: Trade): any {
    return {
      id: trade.id,
      user_id: trade.userId,
      symbol: trade.symbol,
      asset_class: trade.assetClass,
      type: trade.type,
      entry_date: trade.entryDate,
      exit_date: trade.exitDate,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      quantity: trade.quantity,
      stop_loss: trade.stopLoss,
      target: trade.target,
      fees: trade.fees,
      pnl: trade.pnl,
      rr_ratio: trade.rrRatio,
      status: trade.status,
      setups: trade.setups,
      strategies: trade.strategies,
      market_condition: trade.marketCondition,
      market_events: trade.marketEvents,
      mistakes: trade.mistakes,
      mood: trade.mood,
      emotions: trade.emotions,
      notes: trade.notes,
      psychology_notes: trade.psychologyNotes,
      rating: trade.rating,
      image_urls: trade.imageUrls
    };
  }

  // --- Session ---
  public getSession(): User | null { 
    const session = this.getStorageItem<User | null>(DB_SESSION_KEY, null); 
    if (session) {
      // Ensure session user also has active sub
      session.subscription = {
        plan: 'yearly',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 86400000 * 365 * 50).toISOString(),
        isActive: true
      };
    }
    return session;
  }
  
  public setSession(user: User): void { 
    this.setStorageItem(DB_SESSION_KEY, user); 
  }
  
  public clearSession(): void { 
    localStorage.removeItem(DB_SESSION_KEY); 
  }

  // --- Users ---
  public async loginUser(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error) {
        console.error("Supabase Login Query Error:", error);
        throw error;
      }
      
      if (!data) {
        // Fallback check in local users
        const localUsers = this.getStorageItem<User[]>(LOCAL_USERS_KEY, []);
        const localUser = localUsers.find(u => u.email === email && u.password === password);
        if (localUser) {
          const user = this.mapUser(this.mapToDbUser(localUser));
          this.setSession(user);
          return user;
        }
        throw new Error('Invalid email or password');
      }
      
      const user = this.mapUser(data);
      this.setSession(user);
      return user;
    } catch (err: any) {
      console.error("Login Error:", err);
      const message = err.message || (typeof err === 'string' ? err : 'Authentication failed');
      throw new Error(message);
    }
  }

  public async registerUser(user: User): Promise<User> {
    const newUser = { ...user, id: crypto.randomUUID() };
    
    try {
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) throw new Error('User with this email already exists');

      const dbUser = this.mapToDbUser(newUser);
      const { error: insertError } = await supabase.from('users').insert([dbUser]);
      if (insertError) throw insertError;

      const mappedUser = this.mapUser(dbUser);
      this.setSession(mappedUser);
      return mappedUser;
    } catch (err: any) {
      console.warn("Registration error, potentially falling back to local:", err);
      const localUsers = this.getStorageItem<User[]>(LOCAL_USERS_KEY, []);
      if (localUsers.find(u => u.email === user.email)) {
        throw new Error('User already exists');
      }
      localUsers.push(newUser);
      this.setStorageItem(LOCAL_USERS_KEY, localUsers);
      const mappedUser = this.mapUser(this.mapToDbUser(newUser));
      this.setSession(mappedUser);
      return mappedUser;
    }
  }

  // --- Trades ---
  public async getTradesForUser(userId: string): Promise<Trade[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(t => this.mapTrade(t));
    } catch (err) {
      const allLocal = this.getStorageItem<Trade[]>(LOCAL_TRADES_KEY, []);
      return allLocal.filter(t => t.userId === userId).sort((a,b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
    }
  }

  public async addTrade(trade: Trade): Promise<void> {
    try {
      const dbTrade = this.mapToDbTrade(trade);
      const { error } = await supabase.from('trades').insert([dbTrade]);
      if (error) throw error;
    } catch (err) {
      const allLocal = this.getStorageItem<Trade[]>(LOCAL_TRADES_KEY, []);
      allLocal.push(trade);
      this.setStorageItem(LOCAL_TRADES_KEY, allLocal);
    }
  }

  public async importTrades(trades: Trade[]): Promise<void> {
    const user = this.getSession();
    if (!user) return;
    
    try {
      const dbTrades = trades.map(t => this.mapToDbTrade({...t, userId: user.id}));
      const { error } = await supabase.from('trades').insert(dbTrades);
      if (error) throw error;
    } catch (err) {
      const allLocal = this.getStorageItem<Trade[]>(LOCAL_TRADES_KEY, []);
      const tradesWithUserId = trades.map(t => ({ ...t, userId: user.id }));
      this.setStorageItem(LOCAL_TRADES_KEY, [...allLocal, ...tradesWithUserId]);
    }
  }

  public async deleteTrade(tradeId: string): Promise<void> {
    try {
      const { error } = await supabase.from('trades').delete().eq('id', tradeId);
      if (error) throw error;
    } catch (err) {
      const allLocal = this.getStorageItem<Trade[]>(LOCAL_TRADES_KEY, []);
      this.setStorageItem(LOCAL_TRADES_KEY, allLocal.filter(t => t.id !== tradeId));
    }
  }

  // --- Rules & Strategies ---
  public async getRules(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.from('rules').select('*').eq('user_id', userId);
      if (error || !data || data.length === 0) {
        return this.getStorageItem(`rules_${userId}`, [
          { id: crypto.randomUUID(), userId, text: 'Never risk more than 1% per trade', streak: 0, committedToday: false, isActive: true },
          { id: crypto.randomUUID(), userId, text: 'Wait for candle close before entry', streak: 0, committedToday: false, isActive: true }
        ]);
      }
      return data.map(r => ({
          id: r.id, userId: r.user_id, text: r.text, streak: r.streak, committedToday: r.committed_today, isActive: r.is_active
      }));
    } catch (err) {
      return this.getStorageItem(`rules_${userId}`, []);
    }
  }

  public async saveRules(userId: string, rules: any[]): Promise<void> {
    this.setStorageItem(`rules_${userId}`, rules);
    try {
      await supabase.from('rules').delete().eq('user_id', userId);
      const dbRules = rules.map(r => ({
          id: r.id, user_id: userId, text: r.text, streak: r.streak, committed_today: r.committedToday, is_active: r.isActive
      }));
      await supabase.from('rules').insert(dbRules);
    } catch (err) {}
  }

  public async getStrategiesForUser(userId: string): Promise<Strategy[]> {
    try {
      const { data, error } = await supabase.from('strategies').select('*').eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(s => ({
          id: s.id, userId: s.user_id, name: s.name, description: s.description, timeframe: s.timeframe,
          entryRules: s.entry_rules, exitRules: s.exit_rules, stopLossLogic: s.stop_loss_logic,
          takeProfitLogic: s.take_profit_logic, riskManagement: s.risk_management, createdAt: s.created_at
      }));
    } catch (err) {
      return this.getStorageItem(`strats_${userId}`, []);
    }
  }

  public async addStrategy(strategy: Strategy): Promise<void> {
    const userId = strategy.userId;
    const current = await this.getStrategiesForUser(userId);
    this.setStorageItem(`strats_${userId}`, [...current, strategy]);
    try {
      const dbStrat = {
          id: strategy.id, user_id: strategy.userId, name: strategy.name, description: strategy.description,
          timeframe: strategy.timeframe, entry_rules: strategy.entryRules, exit_rules: strategy.exitRules,
          stop_loss_logic: strategy.stopLossLogic, take_profit_logic: strategy.takeProfitLogic,
          risk_management: strategy.riskManagement
      };
      await supabase.from('strategies').insert([dbStrat]);
    } catch (err) {}
  }

  public async updateStrategy(strategy: Strategy): Promise<void> {
    const userId = strategy.userId;
    const current = await this.getStrategiesForUser(userId);
    this.setStorageItem(`strats_${userId}`, current.map(s => s.id === strategy.id ? strategy : s));
    
    try {
      const dbStrat = {
          name: strategy.name, 
          description: strategy.description,
          timeframe: strategy.timeframe, 
          entry_rules: strategy.entryRules, 
          exit_rules: strategy.exitRules,
          stop_loss_logic: strategy.stopLossLogic, 
          take_profit_logic: strategy.takeProfitLogic,
          risk_management: strategy.riskManagement
      };
      await supabase.from('strategies').update(dbStrat).eq('id', strategy.id);
    } catch (err) {}
  }

  public async deleteStrategy(strategyId: string): Promise<void> {
    const user = this.getSession();
    if (user) {
        const current = await this.getStrategiesForUser(user.id);
        this.setStorageItem(`strats_${user.id}`, current.filter(s => s.id !== strategyId));
    }
    try {
      await supabase.from('strategies').delete().eq('id', strategyId);
    } catch (err) {}
  }

  public async subscribeUser(userId: string, plan: 'monthly' | 'yearly'): Promise<User> {
    const startDate = new Date().toISOString();
    const expiryDate = new Date();
    if (plan === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
    else expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    const subscription: UserSubscription = {
      plan,
      startDate,
      expiryDate: expiryDate.toISOString(),
      isActive: true
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ subscription })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      const user = this.mapUser(data);
      this.setSession(user);
      return user;
    } catch (err) {
      const user = this.getSession();
      if (user && user.id === userId) {
        user.subscription = subscription;
        this.setSession(user);
        const localUsers = this.getStorageItem<User[]>(LOCAL_USERS_KEY, []);
        this.setStorageItem(LOCAL_USERS_KEY, localUsers.map(u => u.id === userId ? user : u));
        return user;
      }
      throw new Error("Subscription failed");
    }
  }

  public async exportDatabase(): Promise<any> {
    const user = this.getSession();
    if (!user) throw new Error("No active session");
    const trades = await this.getTradesForUser(user.id);
    return { users: [user], trades: trades };
  }

  public async importDatabase(data: any): Promise<void> {
    const user = this.getSession();
    if (!user) return;
    if (data.trades && data.trades.length > 0) {
      const allLocal = this.getStorageItem<Trade[]>(LOCAL_TRADES_KEY, []);
      const merged = [...allLocal, ...data.trades.map((t:any) => ({...t, userId: user.id, id: crypto.randomUUID()}))];
      this.setStorageItem(LOCAL_TRADES_KEY, merged);
    }
  }

  public clearDatabase(): void {
    localStorage.clear();
  }

  public seedDemoData(userId: string): void {
    const trades = MOCK_TRADES.map(t => ({ ...t, userId, id: crypto.randomUUID() }));
    const allLocal = this.getStorageItem<Trade[]>(LOCAL_TRADES_KEY, []);
    this.setStorageItem(LOCAL_TRADES_KEY, [...allLocal, ...trades]);
  }

  public async getChallenges(userId: string): Promise<any[]> {
    return this.getStorageItem(`challenges_${userId}`, []);
  }

  public async saveChallenges(userId: string, challenges: any[]): Promise<void> {
    this.setStorageItem(`challenges_${userId}`, challenges);
  }
}

export const db = new DatabaseService();
