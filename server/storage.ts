import { 
  users, userStats, transactions, tasks, gameScores, gameAchievements, userAchievements, gameStats,
  type User, type UserStats, type Transaction, type Task, type GameScore, type GameAchievement, type UserAchievement, type GameStats,
  type InsertUser, type InsertUserStats, type InsertTransaction, type InsertTask, type InsertGameScore, type InsertGameAchievement, type InsertUserAchievement, type InsertGameStats
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // User stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats | undefined>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  
  // Game Score methods
  getGameScores(gameId: string, limit?: number): Promise<(GameScore & { user: User })[]>;
  getUserGameScores(userId: number, gameId?: string): Promise<GameScore[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  
  // Game Stats methods
  getGameStats(userId: number, gameId: string): Promise<GameStats | undefined>;
  updateGameStats(userId: number, gameId: string, updates: Partial<GameStats>): Promise<GameStats>;
  getTopGameStats(gameId: string, limit?: number): Promise<(GameStats & { user: User })[]>;
  
  // Game Achievement methods
  getGameAchievements(gameId?: string): Promise<GameAchievement[]>;
  getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: GameAchievement })[]>;
  unlockAchievement(userId: number, achievementId: string): Promise<UserAchievement>;
  claimAchievement(userId: number, achievementId: string): Promise<UserAchievement | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userStats: Map<number, UserStats>;
  private transactions: Map<number, Transaction>;
  private tasks: Map<number, Task>;
  private gameScores: Map<number, GameScore>;
  private gameAchievements: Map<string, GameAchievement>;
  private userAchievements: Map<string, UserAchievement>; // key: userId-achievementId
  private gameStats: Map<string, GameStats>; // key: userId-gameId
  private userIdCounter: number;
  private statsIdCounter: number;
  private transactionIdCounter: number;
  private taskIdCounter: number;
  private gameScoreIdCounter: number;

  constructor() {
    this.users = new Map();
    this.userStats = new Map();
    this.transactions = new Map();
    this.tasks = new Map();
    this.gameScores = new Map();
    this.gameAchievements = new Map();
    this.userAchievements = new Map();
    this.gameStats = new Map();
    this.userIdCounter = 1;
    this.statsIdCounter = 1;
    this.transactionIdCounter = 1;
    this.taskIdCounter = 1;
    this.gameScoreIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleTasks();
    this.initializeGameAchievements();
  }

  private async initializeSampleTasks() {
    const sampleTasks = [
      {
        title: "Complete Daily Survey",
        description: "Answer a quick 5-minute survey about consumer preferences",
        reward: 50,
        platform: "Dulpton Point",
        category: "daily" as const,
        icon: "📝",
        actionText: "Start Survey",
        difficulty: "easy" as const,
        estimatedTime: "5 minutes",
      },
      {
        title: "Watch Promotional Video",
        description: "Watch a 2-minute promotional video and earn DULP tokens",
        reward: 25,
        platform: "YouTube",
        category: "social" as const,
        icon: "🎥",
        actionText: "Watch Video",
        difficulty: "easy" as const,
        estimatedTime: "2 minutes",
      },
      {
        title: "Download Mobile App",
        description: "Download and test a new mobile application",
        reward: 100,
        platform: "App Store",
        category: "featured" as const,
        icon: "📱",
        actionText: "Download App",
        difficulty: "medium" as const,
        estimatedTime: "10 minutes",
      },
      {
        title: "Social Media Follow",
        description: "Follow our official social media accounts",
        reward: 30,
        platform: "Twitter",
        category: "social" as const,
        icon: "🐦",
        actionText: "Follow Now",
        difficulty: "easy" as const,
        estimatedTime: "1 minute",
      },
      {
        title: "Product Review",
        description: "Write a detailed review of a featured product",
        reward: 75,
        platform: "Review Site",
        category: "web" as const,
        icon: "⭐",
        actionText: "Write Review",
        difficulty: "medium" as const,
        estimatedTime: "15 minutes",
      }
    ];

    for (const task of sampleTasks) {
      await this.createTask(task);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      username: null,
      displayName: insertUser.displayName || null,
      avatar: null,
      bio: null,
      dulpBalance: 0,
      totalEarned: 0,
      referralCode: nanoid(8),
      referredBy: null,
      referralCount: 0,
      referralEarnings: 0,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    this.users.set(id, user);
    
    // Create initial user stats
    await this.createUserStats({
      userId: id,
      xp: 0,
      level: 1,
      tasksCompleted: 0,
      spinsCompleted: 0,
      loginStreak: 0,
      maxLoginStreak: 0,
      lootBoxes: [],
      achievements: [],
      dailyQuestProgress: {},
      weeklyEarnings: 0,
    });
    
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // User stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(stats => stats.userId === userId);
  }

  async createUserStats(insertStats: InsertUserStats): Promise<UserStats> {
    const id = this.statsIdCounter++;
    const stats: UserStats = { 
      id,
      userId: insertStats.userId,
      xp: insertStats.xp || 0,
      level: insertStats.level || 1,
      tasksCompleted: insertStats.tasksCompleted || 0,
      spinsCompleted: insertStats.spinsCompleted || 0,
      loginStreak: insertStats.loginStreak || 0,
      maxLoginStreak: insertStats.maxLoginStreak || 0,
      lastLoginDate: null,
      lastSpinDate: null,
      activeMultiplier: null,
      lootBoxes: insertStats.lootBoxes ? [...insertStats.lootBoxes] : [],
      achievements: insertStats.achievements ? [...insertStats.achievements] : [],
      dailyQuestProgress: insertStats.dailyQuestProgress || {},
      weeklyEarnings: insertStats.weeklyEarnings || 0,
      lastWeeklyReset: null,
    };
    this.userStats.set(id, stats);
    return stats;
  }

  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats | undefined> {
    const stats = Array.from(this.userStats.values()).find(s => s.userId === userId);
    if (!stats) return undefined;
    
    const updatedStats = { ...stats, ...updates };
    this.userStats.set(stats.id, updatedStats);
    return updatedStats;
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      type: insertTransaction.type as 'earn' | 'withdraw' | 'referral_bonus' | 'signup_bonus',
      status: (insertTransaction.status as 'pending' | 'completed' | 'failed') || 'pending',
      metadata: insertTransaction.metadata || null,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.isActive);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { 
      ...insertTask, 
      id,
      category: insertTask.category as 'social' | 'web' | 'daily' | 'featured',
      difficulty: insertTask.difficulty as 'easy' | 'medium' | 'hard',
      actionUrl: insertTask.actionUrl || null,
      requirements: insertTask.requirements ? [...insertTask.requirements] : null,
      isActive: insertTask.isActive !== undefined ? insertTask.isActive : true,
      expiresAt: insertTask.expiresAt || null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  private async initializeGameAchievements() {
    const achievements: InsertGameAchievement[] = [
      // Memory Match achievements
      {
        achievementId: 'memory-match-first-win',
        gameId: 'memory-match',
        title: 'First Match',
        description: 'Complete your first Memory Match game',
        icon: '🎯',
        requirement: { type: 'completion' as const, value: 1 },
        reward: 25
      },
      {
        achievementId: 'memory-match-speed-demon',
        gameId: 'memory-match',
        title: 'Speed Demon',
        description: 'Complete Memory Match in under 60 seconds',
        icon: '⚡',
        requirement: { type: 'time' as const, value: 60, operator: 'lte' as const },
        reward: 50
      },
      {
        achievementId: 'memory-match-perfect-score',
        gameId: 'memory-match',
        title: 'Perfect Memory',
        description: 'Score 100 points in Memory Match',
        icon: '🏆',
        requirement: { type: 'score' as const, value: 100, operator: 'gte' as const },
        reward: 75
      },
      
      // Number Rush achievements
      {
        achievementId: 'number-rush-first-win',
        gameId: 'number-rush',
        title: 'Math Master',
        description: 'Complete your first Number Rush game',
        icon: '🧮',
        requirement: { type: 'completion' as const, value: 1 },
        reward: 25
      },
      {
        achievementId: 'number-rush-streak',
        gameId: 'number-rush',
        title: 'Streak Master',
        description: 'Get a 10+ answer streak in Number Rush',
        icon: '🔥',
        requirement: { type: 'streak' as const, value: 10, operator: 'gte' as const },
        reward: 60
      },
      
      // Color Match achievements
      {
        achievementId: 'color-match-first-win',
        gameId: 'color-match',
        title: 'Color Genius',
        description: 'Complete your first Color Match game',
        icon: '🌈',
        requirement: { type: 'completion' as const, value: 1 },
        reward: 25
      },
      
      // Coin Collector achievements
      {
        achievementId: 'coin-collector-first-win',
        gameId: 'coin-collector',
        title: 'Coin Hunter',
        description: 'Complete your first Coin Collector game',
        icon: '💰',
        requirement: { type: 'completion' as const, value: 1 },
        reward: 25
      },
      {
        achievementId: 'coin-collector-high-score',
        gameId: 'coin-collector',
        title: 'Coin Master',
        description: 'Score 150+ points in Coin Collector',
        icon: '👑',
        requirement: { type: 'score' as const, value: 150, operator: 'gte' as const },
        reward: 100
      }
    ];

    for (const achievement of achievements) {
      const fullAchievement: GameAchievement = {
        id: this.gameAchievements.size + 1,
        achievementId: achievement.achievementId,
        gameId: achievement.gameId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        requirement: achievement.requirement as any,
        reward: achievement.reward,
        isActive: true,
        createdAt: new Date()
      };
      this.gameAchievements.set(achievement.achievementId, fullAchievement);
    }
  }

  // Game Score methods
  async getGameScores(gameId: string, limit: number = 10): Promise<(GameScore & { user: User })[]> {
    const scores = Array.from(this.gameScores.values())
      .filter(score => score.gameId === gameId)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores.map(score => ({
      ...score,
      user: this.users.get(score.userId)!
    }));
  }

  async getUserGameScores(userId: number, gameId?: string): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .filter(score => score.userId === userId && (!gameId || score.gameId === gameId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = this.gameScoreIdCounter++;
    const score: GameScore = {
      ...insertScore,
      id,
      difficulty: insertScore.difficulty as 'easy' | 'medium' | 'hard',
      timeCompleted: insertScore.timeCompleted || null,
      metadata: insertScore.metadata || null,
      createdAt: new Date()
    };
    this.gameScores.set(id, score);

    // Update game stats
    await this.updateGameStatsAfterScore(insertScore.userId, insertScore.gameId, score);
    
    // Check for achievements
    await this.checkAchievements(insertScore.userId, insertScore.gameId, score);

    return score;
  }

  // Game Stats methods
  async getGameStats(userId: number, gameId: string): Promise<GameStats | undefined> {
    const key = `${userId}-${gameId}`;
    return this.gameStats.get(key);
  }

  async updateGameStats(userId: number, gameId: string, updates: Partial<GameStats>): Promise<GameStats> {
    const key = `${userId}-${gameId}`;
    const existing = this.gameStats.get(key);
    
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date() };
      this.gameStats.set(key, updated);
      return updated;
    } else {
      const newStats: GameStats = {
        id: this.gameStats.size + 1,
        userId,
        gameId,
        totalPlays: 0,
        bestScore: 0,
        bestTime: null,
        totalScore: 0,
        averageScore: 0,
        completionRate: 0,
        winStreak: 0,
        maxWinStreak: 0,
        lastPlayedAt: null,
        updatedAt: new Date(),
        ...updates
      };
      this.gameStats.set(key, newStats);
      return newStats;
    }
  }

  async getTopGameStats(gameId: string, limit: number = 10): Promise<(GameStats & { user: User })[]> {
    const stats = Array.from(this.gameStats.values())
      .filter(stat => stat.gameId === gameId)
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, limit);

    return stats.map(stat => ({
      ...stat,
      user: this.users.get(stat.userId)!
    }));
  }

  private async updateGameStatsAfterScore(userId: number, gameId: string, score: GameScore): Promise<void> {
    const existing = await this.getGameStats(userId, gameId);
    
    const newTotalPlays = (existing?.totalPlays || 0) + 1;
    const newTotalScore = (existing?.totalScore || 0) + score.score;
    const newAverageScore = Math.round(newTotalScore / newTotalPlays);
    const newBestScore = Math.max(existing?.bestScore || 0, score.score);
    const newBestTime = existing?.bestTime && score.timeCompleted 
      ? Math.min(existing.bestTime, score.timeCompleted)
      : score.timeCompleted || existing?.bestTime || null;

    await this.updateGameStats(userId, gameId, {
      totalPlays: newTotalPlays,
      bestScore: newBestScore,
      bestTime: newBestTime,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      lastPlayedAt: new Date()
    });
  }

  // Game Achievement methods
  async getGameAchievements(gameId?: string): Promise<GameAchievement[]> {
    const achievements = Array.from(this.gameAchievements.values())
      .filter(a => a.isActive && (!gameId || a.gameId === gameId));
    return achievements;
  }

  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: GameAchievement })[]> {
    return Array.from(this.userAchievements.values())
      .filter(ua => ua.userId === userId)
      .map(ua => ({
        ...ua,
        achievement: this.gameAchievements.get(ua.achievementId)!
      }));
  }

  async unlockAchievement(userId: number, achievementId: string): Promise<UserAchievement> {
    const key = `${userId}-${achievementId}`;
    const existing = this.userAchievements.get(key);
    
    if (existing) {
      return existing;
    }

    const achievement: UserAchievement = {
      id: this.userAchievements.size + 1,
      userId,
      achievementId,
      unlockedAt: new Date(),
      claimed: false,
      claimedAt: null
    };
    
    this.userAchievements.set(key, achievement);
    return achievement;
  }

  async claimAchievement(userId: number, achievementId: string): Promise<UserAchievement | undefined> {
    const key = `${userId}-${achievementId}`;
    const userAchievement = this.userAchievements.get(key);
    
    if (!userAchievement || userAchievement.claimed) {
      return undefined;
    }

    const updated = {
      ...userAchievement,
      claimed: true,
      claimedAt: new Date()
    };
    
    this.userAchievements.set(key, updated);
    return updated;
  }

  private async checkAchievements(userId: number, gameId: string, score: GameScore): Promise<void> {
    const achievements = await this.getGameAchievements(gameId);
    const userStats = await this.getGameStats(userId, gameId);
    
    for (const achievement of achievements) {
      const key = `${userId}-${achievement.achievementId}`;
      const alreadyUnlocked = this.userAchievements.has(key);
      
      if (alreadyUnlocked) continue;

      let shouldUnlock = false;
      const req = achievement.requirement;

      switch (req.type) {
        case 'completion':
          shouldUnlock = (userStats?.totalPlays || 0) >= req.value;
          break;
        case 'score':
          const operator = req.operator || 'gte';
          if (operator === 'gte') shouldUnlock = score.score >= req.value;
          else if (operator === 'lte') shouldUnlock = score.score <= req.value;
          else if (operator === 'eq') shouldUnlock = score.score === req.value;
          break;
        case 'time':
          if (score.timeCompleted) {
            const timeOp = req.operator || 'lte';
            if (timeOp === 'lte') shouldUnlock = score.timeCompleted <= req.value;
            else if (timeOp === 'gte') shouldUnlock = score.timeCompleted >= req.value;
            else if (timeOp === 'eq') shouldUnlock = score.timeCompleted === req.value;
          }
          break;
        case 'streak':
          // This would need to be implemented based on game metadata
          const streakValue = score.metadata?.streak || 0;
          shouldUnlock = streakValue >= req.value;
          break;
      }

      if (shouldUnlock) {
        await this.unlockAchievement(userId, achievement.achievementId);
      }
    }
  }
}

export const storage = new MemStorage();
