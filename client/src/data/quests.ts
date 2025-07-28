import { DailyQuest } from '../types/gamification';

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'daily_earn_500',
    title: 'Daily Earner',
    description: 'Earn 500 DULP today',
    type: 'earn_dulp',
    target: 500,
    reward: 100,
    xpReward: 50,
    expiresAt: new Date() // Will be set dynamically
  },
  {
    id: 'daily_complete_5_tasks',
    title: 'Task Crusher',
    description: 'Complete 5 tasks today',
    type: 'complete_tasks',
    target: 5,
    reward: 200,
    xpReward: 75,
    expiresAt: new Date()
  },
  {
    id: 'daily_spin_wheel',
    title: 'Lucky Day',
    description: 'Use the daily spin wheel',
    type: 'spin_wheel',
    target: 1,
    reward: 50,
    xpReward: 25,
    expiresAt: new Date()
  }
];

export const WEEKLY_QUESTS: DailyQuest[] = [
  {
    id: 'weekly_earn_3000',
    title: 'Weekly Grinder',
    description: 'Earn 3,000 DULP this week',
    type: 'earn_dulp',
    target: 3000,
    reward: 500,
    xpReward: 200,
    expiresAt: new Date()
  },
  {
    id: 'weekly_complete_25_tasks',
    title: 'Task Master',
    description: 'Complete 25 tasks this week',
    type: 'complete_tasks',
    target: 25,
    reward: 750,
    xpReward: 300,
    expiresAt: new Date()
  },
  {
    id: 'weekly_refer_friend',
    title: 'Social Butterfly',
    description: 'Refer 1 friend this week',
    type: 'refer_friends',
    target: 1,
    reward: 1000,
    xpReward: 400,
    expiresAt: new Date()
  },
  {
    id: 'weekly_login_streak',
    title: 'Consistency King',
    description: 'Maintain a 7-day login streak',
    type: 'login_streak',
    target: 7,
    reward: 600,
    xpReward: 250,
    expiresAt: new Date()
  }
];

export const generateDailyQuests = (): DailyQuest[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return DAILY_QUESTS.map(quest => ({
    ...quest,
    expiresAt: tomorrow
  }));
};

export const generateWeeklyQuests = (): DailyQuest[] => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
  nextWeek.setHours(0, 0, 0, 0);

  return WEEKLY_QUESTS.map(quest => ({
    ...quest,
    expiresAt: nextWeek
  }));
};