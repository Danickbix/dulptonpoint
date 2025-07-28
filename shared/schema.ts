import { pgTable, text, serial, integer, boolean, timestamp, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  bio: text("bio"),
  dulpBalance: integer("dulp_balance").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  referralCount: integer("referral_count").notNull().default(0),
  referralEarnings: integer("referral_earnings").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActive: timestamp("last_active").notNull().defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  spinsCompleted: integer("spins_completed").notNull().default(0),
  loginStreak: integer("login_streak").notNull().default(0),
  maxLoginStreak: integer("max_login_streak").notNull().default(0),
  lastLoginDate: timestamp("last_login_date"),
  lastSpinDate: timestamp("last_spin_date"),
  activeMultiplier: json("active_multiplier"),
  lootBoxes: json("loot_boxes").$type<string[]>().default([]),
  achievements: json("achievements").$type<Array<{achievementId: string, unlockedAt: Date, claimed: boolean}>>().default([]),
  dailyQuestProgress: json("daily_quest_progress").$type<Record<string, number>>().default({}),
  weeklyEarnings: integer("weekly_earnings").notNull().default(0),
  lastWeeklyReset: timestamp("last_weekly_reset"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull().$type<'earn' | 'withdraw' | 'referral_bonus' | 'signup_bonus'>(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().$type<'pending' | 'completed' | 'failed'>().default('pending'),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  platform: text("platform").notNull(),
  category: text("category").notNull().$type<'social' | 'web' | 'daily' | 'featured'>(),
  icon: text("icon").notNull(),
  actionUrl: text("action_url"),
  actionText: text("action_text").notNull(),
  difficulty: text("difficulty").notNull().$type<'easy' | 'medium' | 'hard'>(),
  estimatedTime: text("estimated_time").notNull(),
  requirements: json("requirements").$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Game leaderboard entries
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: text("game_id").notNull(),
  score: integer("score").notNull(),
  timeCompleted: integer("time_completed"), // Time in seconds
  difficulty: text("difficulty").notNull().$type<'easy' | 'medium' | 'hard'>(),
  metadata: json("metadata").$type<Record<string, any>>(), // Additional game-specific data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Game achievements
export const gameAchievements = pgTable("game_achievements", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(),
  gameId: text("game_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: json("requirement").$type<{
    type: 'score' | 'time' | 'streak' | 'completion';
    value: number;
    operator?: 'gte' | 'lte' | 'eq';
  }>().notNull(),
  reward: integer("reward").notNull(), // DULP reward
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User achievement unlocks
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: text("achievement_id").notNull().references(() => gameAchievements.achievementId),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  claimed: boolean("claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
}, (table) => ({
  userAchievementUnique: unique().on(table.userId, table.achievementId),
}));

// Game statistics for leaderboards
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: text("game_id").notNull(),
  totalPlays: integer("total_plays").notNull().default(0),
  bestScore: integer("best_score").notNull().default(0),
  bestTime: integer("best_time"), // Best completion time in seconds
  totalScore: integer("total_score").notNull().default(0),
  averageScore: integer("average_score").notNull().default(0),
  completionRate: integer("completion_rate").notNull().default(0), // Percentage
  winStreak: integer("win_streak").notNull().default(0),
  maxWinStreak: integer("max_win_streak").notNull().default(0),
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userGameUnique: unique().on(table.userId, table.gameId),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  displayName: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  username: true,
  displayName: true,
  bio: true,
  avatar: true,
}).partial();

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
  createdAt: true,
});

export const insertGameAchievementSchema = createInsertSchema(gameAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type GameAchievement = typeof gameAchievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type InsertGameAchievement = z.infer<typeof insertGameAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
