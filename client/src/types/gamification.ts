export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'total_earned' | 'referrals' | 'streak' | 'tasks_completed' | 'signup_date' | 'spins_completed';
    value: number;
  };
  reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  claimed: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'earn_dulp' | 'complete_tasks' | 'refer_friends' | 'login_streak' | 'spin_wheel';
  target: number;
  reward: number;
  xpReward: number;
  expiresAt: Date;
}

export interface UserQuest {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  startedAt: Date;
}

export interface SpinReward {
  type: 'dulp' | 'xp' | 'multiplier' | 'loot_box' | 'nothing';
  amount: number;
  duration?: number; // for multipliers
  rarity: 'common' | 'rare' | 'epic';
}

export interface LootBox {
  id: string;
  type: 'common' | 'premium' | 'vip';
  cost: number;
  rewards: SpinReward[];
}

export interface UserStats {
  xp: number;
  level: number;
  tasksCompleted: number;
  spinsCompleted: number;
  loginStreak: number;
  maxLoginStreak: number;
  lastLoginDate: Date | null;
  lastSpinDate: Date | null;
  activeMultiplier: {
    value: number;
    expiresAt: Date;
  } | null;
  lootBoxes: string[];
  achievements: UserAchievement[];
  quests: UserQuest[];
  dailyQuestProgress: {
    [questId: string]: number;
  };
  weeklyEarnings: number;
  lastWeeklyReset: Date | null;
}