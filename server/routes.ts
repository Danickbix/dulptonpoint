import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserProfileSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: 'dulpton-point-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check password using bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        displayName: displayName || email.split('@')[0],
      });

      // Create initial user stats
      await storage.createUserStats({ userId: user.id });

      // Set session
      req.session.userId = user.id;

      res.json({ user: { ...user, password: undefined }, message: 'Registration successful' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });



  app.get('/api/auth/me', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ ...user, password: undefined });
  });

  // User profile routes
  app.get('/api/profile', requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ...user, password: undefined });
  });

  app.patch('/api/profile', requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const updates = updateUserProfileSchema.parse(req.body);
      
      // Check if username is already taken (if username is being updated)
      if (updates.username) {
        const existingUser = await storage.getUserByUsername(updates.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(400).json({ error: 'Invalid profile data' });
    }
  });

  app.get('/api/transactions', requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });

  app.get('/api/stats', requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const stats = await storage.getUserStats(userId);
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    res.json(stats);
  });

  // Game routes
  app.post('/api/games/play', requireAuth, async (req, res) => {
    try {
      const { gameId } = req.body;
      const userId = req.session.userId!;
      
      // Game rewards based on game type
      const gameRewards: Record<string, number> = {
        'memory-match': 50,
        'number-rush': 75,
        'coin-collector': 100,
        'lucky-slots': 25,
        'word-builder': 60,
        'reflex-test': 80,
        'color-match': 45,
        'trivia-challenge': 90
      };
      
      const reward = gameRewards[gameId] || 25;
      
      // Update user balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await storage.updateUser(userId, {
        dulpBalance: user.dulpBalance + reward,
        totalEarned: user.totalEarned + reward
      });
      
      // Create transaction
      await storage.createTransaction({
        userId,
        type: 'earn',
        amount: reward,
        description: `Completed game: ${gameId}`,
        status: 'completed'
      });
      
      // Update user stats
      const stats = await storage.getUserStats(userId);
      if (stats) {
        await storage.updateUserStats(userId, {
          xp: stats.xp + Math.floor(reward / 2),
          tasksCompleted: stats.tasksCompleted + 1
        });
      }
      
      res.json({ reward, gameId });
    } catch (error) {
      console.error('Game completion error:', error);
      res.status(400).json({ error: 'Failed to complete game' });
    }
  });

  // Task routes
  app.get('/api/tasks', requireAuth, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post('/api/tasks/complete', requireAuth, async (req, res) => {
    const { taskId } = req.body;
    const task = await storage.getTask(parseInt(taskId));
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create a transaction for the task completion
    await storage.createTransaction({
      userId: req.session.userId!,
      type: 'earn',
      amount: task.reward,
      description: `Completed task: ${task.title}`,
      status: 'completed',
    });

    // Update user balance
    const user = await storage.getUser(req.session.userId!);
    if (user) {
      await storage.updateUser(user.id, {
        dulpBalance: user.dulpBalance + task.reward,
        totalEarned: user.totalEarned + task.reward,
      });
    }

    // Update user stats
    const stats = await storage.getUserStats(req.session.userId!);
    if (stats) {
      await storage.updateUserStats(req.session.userId!, {
        tasksCompleted: stats.tasksCompleted + 1,
        xp: stats.xp + 25, // 25 XP per task
      });
    }

    res.json({ success: true, reward: task.reward });
  });

  // Profile update routes
  app.patch('/api/profile/balance', requireAuth, async (req, res) => {
    const { amount } = req.body;
    const user = await storage.getUser(req.session.userId!);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await storage.updateUser(user.id, {
      dulpBalance: user.dulpBalance + amount,
    });

    res.json(updatedUser);
  });

  app.post('/api/profile/referral', requireAuth, async (req, res) => {
    const { referralCode } = req.body;
    
    // Find user with this referral code
    const referrer = Array.from(storage['users'].values()).find(u => u.referralCode === referralCode);
    
    if (!referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.referredBy) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    // Update user with referral
    await storage.updateUser(user.id, {
      referredBy: referralCode,
    });

    // Give bonus to referrer
    await storage.updateUser(referrer.id, {
      referralCount: referrer.referralCount + 1,
      referralEarnings: referrer.referralEarnings + 500,
      dulpBalance: referrer.dulpBalance + 500,
    });

    // Create transactions
    await storage.createTransaction({
      userId: referrer.id,
      type: 'referral_bonus',
      amount: 500,
      description: 'Referral bonus',
      status: 'completed',
    });

    res.json({ message: 'Referral processed successfully!' });
  });

  // Stats update routes
  app.patch('/api/stats/xp', requireAuth, async (req, res) => {
    const { amount } = req.body;
    const stats = await storage.getUserStats(req.session.userId!);
    
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    const newXP = stats.xp + amount;
    // Simple level calculation: level = floor(xp / 100) + 1
    const newLevel = Math.floor(newXP / 100) + 1;
    const levelUp = newLevel > stats.level;

    await storage.updateUserStats(req.session.userId!, {
      xp: newXP,
      level: newLevel,
    });

    res.json({ levelUp, newLevel: levelUp ? `Level ${newLevel}` : undefined });
  });

  app.post('/api/stats/spin', requireAuth, async (req, res) => {
    const stats = await storage.getUserStats(req.session.userId!);
    
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    // Simple spin reward logic
    const rewards = [
      { type: 'dulp', amount: 25, rarity: 'common' },
      { type: 'dulp', amount: 50, rarity: 'common' },
      { type: 'xp', amount: 100, rarity: 'common' },
      { type: 'dulp', amount: 100, rarity: 'rare' },
      { type: 'multiplier', amount: 2, duration: 3600000, rarity: 'epic' }, // 1 hour
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    await storage.updateUserStats(req.session.userId!, {
      lastSpinDate: new Date(),
      spinsCompleted: stats.spinsCompleted + 1,
    });

    res.json(reward);
  });

  app.post('/api/stats/task-complete', requireAuth, async (req, res) => {
    const stats = await storage.getUserStats(req.session.userId!);
    
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    const newTaskCount = stats.tasksCompleted + 1;
    const xpGain = 25;
    const newXP = stats.xp + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;
    const levelUp = newLevel > stats.level;

    await storage.updateUserStats(req.session.userId!, {
      tasksCompleted: newTaskCount,
      xp: newXP,
      level: newLevel,
    });

    res.json({ levelUp, newLevel: levelUp ? `Level ${newLevel}` : undefined });
  });

  // Enhanced games endpoint with score recording
  app.post("/api/games/complete", requireAuth, async (req, res) => {
    try {
      const { gameId, score, timeCompleted, difficulty = 'medium', metadata } = req.body;
      
      if (!gameId) {
        return res.status(400).json({ error: "Game ID is required" });
      }

      const userId = req.session.userId!;
      const actualScore = score || 50;
      
      // Record the game score in leaderboard
      const gameScore = await storage.createGameScore({
        userId,
        gameId,
        score: actualScore,
        timeCompleted: timeCompleted || null,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        metadata: metadata || null
      });
      
      // Calculate reward based on score
      const baseReward = Math.max(Math.floor(actualScore * 0.5), 25);
      const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.8 : 1;
      const reward = Math.floor(baseReward * difficultyMultiplier);
      
      // Update user balance
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(user.id, {
          dulpBalance: user.dulpBalance + reward,
          totalEarned: user.totalEarned + reward
        });
        
        // Create transaction record
        await storage.createTransaction({
          userId: user.id,
          type: 'earn',
          amount: reward,
          description: `Game reward: ${gameId} (Score: ${actualScore})`,
          status: 'completed'
        });
      }

      res.json({ reward, gameId, score: actualScore, gameScoreId: gameScore.id });
    } catch (error) {
      console.error("Game completion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const leaderboard = await storage.getGameScores(gameId, limit);
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/leaderboard/:gameId/stats", async (req, res) => {
    try {
      const { gameId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const topStats = await storage.getTopGameStats(gameId, limit);
      
      res.json(topStats);
    } catch (error) {
      console.error("Game stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/games/:gameId/my-stats", requireAuth, async (req, res) => {
    try {
      const { gameId } = req.params;
      const userId = req.session.userId!;
      
      const [gameStats, recentScores] = await Promise.all([
        storage.getGameStats(userId, gameId),
        storage.getUserGameScores(userId, gameId)
      ]);
      
      res.json({
        stats: gameStats,
        recentScores: recentScores.slice(0, 5)
      });
    } catch (error) {
      console.error("User game stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Achievement routes
  app.get("/api/achievements/:gameId", async (req, res) => {
    try {
      const { gameId } = req.params;
      const achievements = await storage.getGameAchievements(gameId);
      
      res.json(achievements);
    } catch (error) {
      console.error("Achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getGameAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("All achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/my-achievements", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const userAchievements = await storage.getUserAchievements(userId);
      
      res.json(userAchievements);
    } catch (error) {
      console.error("User achievements error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/achievements/:achievementId/claim", requireAuth, async (req, res) => {
    try {
      const { achievementId } = req.params;
      const userId = req.session.userId!;
      
      const claimed = await storage.claimAchievement(userId, achievementId);
      
      if (!claimed) {
        return res.status(400).json({ error: "Achievement not found or already claimed" });
      }

      // Get achievement details for reward
      const achievements = await storage.getGameAchievements();
      const achievement = achievements.find(a => a.achievementId === achievementId);
      
      if (achievement) {
        // Award the achievement reward
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUser(user.id, {
            dulpBalance: user.dulpBalance + achievement.reward,
            totalEarned: user.totalEarned + achievement.reward
          });
          
          await storage.createTransaction({
            userId: user.id,
            type: 'earn',
            amount: achievement.reward,
            description: `Achievement reward: ${achievement.title}`,
            status: 'completed'
          });
        }
      }
      
      res.json(claimed);
    } catch (error) {
      console.error("Claim achievement error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
