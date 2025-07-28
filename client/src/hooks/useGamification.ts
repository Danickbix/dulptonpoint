import { User as FirebaseUser } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { UserStats, Achievement, SpinReward, DailyQuest, UserQuest } from '../types/gamification';
import { ACHIEVEMENTS, LEVEL_REQUIREMENTS, SPIN_REWARDS } from '../data/achievements';
import { generateDailyQuests, generateWeeklyQuests } from '../data/quests';
import { getUserStats, updateUserStats } from '../lib/firestore';

export const useGamification = (user: FirebaseUser | null) => {
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserStats(null);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const stats = await getUserStats(user.uid);
        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getCurrentLevel = () => {
    if (!userStats) return LEVEL_REQUIREMENTS[0];
    
    for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (userStats.xp >= LEVEL_REQUIREMENTS[i].xp) {
        return LEVEL_REQUIREMENTS[i];
      }
    }
    return LEVEL_REQUIREMENTS[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevelIndex = LEVEL_REQUIREMENTS.findIndex(l => l.level === currentLevel.level) + 1;
    return nextLevelIndex < LEVEL_REQUIREMENTS.length ? LEVEL_REQUIREMENTS[nextLevelIndex] : null;
  };

  const addXP = async (amount: number) => {
    if (!user || !userStats) return { levelUp: false };
    
    try {
      const newXP = (userStats.xp || 0) + amount;
      const currentLevel = getCurrentLevel();
      const nextLevel = getNextLevel();
      
      let levelUp = false;
      if (nextLevel && newXP >= nextLevel.xp) {
        levelUp = true;
      }

      await updateUserStats(user.uid, {
        xp: newXP,
        level: levelUp && nextLevel ? nextLevel.level : currentLevel.level,
      });

      // Refresh stats
      const updatedStats = await getUserStats(user.uid);
      setUserStats(updatedStats);

      return { levelUp, newLevel: levelUp && nextLevel ? nextLevel : null };
    } catch (error) {
      return { levelUp: false };
    }
  };

  const canSpin = () => {
    if (!userStats?.lastSpinDate) return true;
    
    const now = new Date();
    const lastSpin = new Date(userStats.lastSpinDate);
    const timeDiff = now.getTime() - lastSpin.getTime();
    
    return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
  };

  const spinWheel = async (): Promise<SpinReward> => {
    if (!user || !canSpin()) throw new Error('Cannot spin yet');

    // Get random reward
    const randomIndex = Math.floor(Math.random() * SPIN_REWARDS.length);
    const rewardData = SPIN_REWARDS[randomIndex];
    
    // Convert to proper SpinReward format
    const reward: SpinReward = {
      type: rewardData.reward?.type || 'dulp',
      amount: rewardData.reward?.amount || 0,
      rarity: rewardData.reward?.rarity || 'common'
    };

    await updateUserStats(user.uid, {
      lastSpinDate: new Date(),
    });

    // Refresh stats
    const updatedStats = await getUserStats(user.uid);
    setUserStats(updatedStats);

    return reward;
  };

  const completeTask = async () => {
    if (!user) return { levelUp: false };

    const newTasksCompleted = (userStats?.tasksCompleted || 0) + 1;
    
    await updateUserStats(user.uid, {
      tasksCompleted: newTasksCompleted,
    });

    // Refresh stats
    const updatedStats = await getUserStats(user.uid);
    setUserStats(updatedStats);

    return { levelUp: false };

  };

  const getActiveMultiplier = () => {
    if (!userStats?.activeMultiplier) return 1;
    
    const now = new Date();
    if (now > new Date(userStats.activeMultiplier.expiresAt)) return 1;
    
    return userStats.activeMultiplier.value;
  };

  const getDailyQuests = (): (DailyQuest & { progress: number; completed: boolean })[] => {
    const dailyQuests = generateDailyQuests();
    return dailyQuests.map(quest => ({
      ...quest,
      progress: userStats?.dailyQuestProgress?.[quest.id] || 0,
      completed: (userStats?.dailyQuestProgress?.[quest.id] || 0) >= quest.target
    }));
  };

  const getWeeklyQuests = (): (DailyQuest & { progress: number; completed: boolean })[] => {
    const weeklyQuests = generateWeeklyQuests();
    return weeklyQuests.map(quest => ({
      ...quest,
      progress: userStats?.dailyQuestProgress?.[quest.id] || 0,
      completed: (userStats?.dailyQuestProgress?.[quest.id] || 0) >= quest.target
    }));
  };

  return {
    userStats,
    loading,
    getCurrentLevel,
    getNextLevel,
    addXP,
    canSpin,
    spinWheel,
    completeTask,
    getDailyQuests,
    getWeeklyQuests,
    getActiveMultiplier
  };
};