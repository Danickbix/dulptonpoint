import { Achievement } from '../types/gamification';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined Dulpton Point in the first 30 days',
    icon: '🌟',
    requirement: { type: 'signup_date', value: 30 },
    reward: 500,
    rarity: 'rare'
  },
  {
    id: 'first_hundred',
    name: 'Getting Started',
    description: 'Earned your first 100 DULP',
    icon: '👶',
    requirement: { type: 'total_earned', value: 100 },
    reward: 50,
    rarity: 'common'
  },
  {
    id: 'first_thousand',
    name: 'Rising Star',
    description: 'Earned your first 1,000 DULP',
    icon: '⭐',
    requirement: { type: 'total_earned', value: 1000 },
    reward: 100,
    rarity: 'common'
  },
  {
    id: 'five_thousand_club',
    name: 'High Roller',
    description: 'Earned 5,000 DULP total',
    icon: '🎰',
    requirement: { type: 'total_earned', value: 5000 },
    reward: 500,
    rarity: 'rare'
  },
  {
    id: 'grinder',
    name: 'The Grinder',
    description: 'Earned 10,000 DULP total',
    icon: '⚡',
    requirement: { type: 'total_earned', value: 10000 },
    reward: 1000,
    rarity: 'epic'
  },
  {
    id: 'big_earner',
    name: 'Big Earner',
    description: 'Earned 50,000 DULP total',
    icon: '💰',
    requirement: { type: 'total_earned', value: 50000 },
    reward: 5000,
    rarity: 'epic'
  },
  {
    id: 'dulp_millionaire',
    name: 'DULP Millionaire',
    description: 'Reached 100,000 total DULP earned',
    icon: '💎',
    requirement: { type: 'total_earned', value: 100000 },
    reward: 10000,
    rarity: 'legendary'
  },
  {
    id: 'first_referral',
    name: 'Recruiter',
    description: 'Successfully referred your first friend',
    icon: '🤝',
    requirement: { type: 'referrals', value: 1 },
    reward: 200,
    rarity: 'common'
  },
  {
    id: 'referral_master',
    name: 'Referral Master',
    description: 'Successfully referred 5 friends',
    icon: '👑',
    requirement: { type: 'referrals', value: 5 },
    reward: 1000,
    rarity: 'rare'
  },
  {
    id: 'social_master',
    name: 'Social Influencer',
    description: 'Successfully referred 10 friends',
    icon: '👥',
    requirement: { type: 'referrals', value: 10 },
    reward: 2000,
    rarity: 'epic'
  },
  {
    id: 'network_king',
    name: 'Network King',
    description: 'Successfully referred 25 friends',
    icon: '🏆',
    requirement: { type: 'referrals', value: 25 },
    reward: 5000,
    rarity: 'legendary'
  },
  {
    id: 'first_week',
    name: 'Week Warrior',
    description: 'Maintained a 7-day login streak',
    icon: '📅',
    requirement: { type: 'streak', value: 7 },
    reward: 300,
    rarity: 'common'
  },
  {
    id: 'two_week_streak',
    name: 'Dedication',
    description: 'Maintained a 14-day login streak',
    icon: '🎯',
    requirement: { type: 'streak', value: 14 },
    reward: 750,
    rarity: 'rare'
  },
  {
    id: 'streak_warrior',
    name: 'Streak Master',
    description: 'Maintained a 30-day login streak',
    icon: '🔥',
    requirement: { type: 'streak', value: 30 },
    reward: 3000,
    rarity: 'epic'
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintained a 100-day login streak',
    icon: '🌟',
    requirement: { type: 'streak', value: 100 },
    reward: 10000,
    rarity: 'legendary'
  },
  {
    id: 'task_starter',
    name: 'Task Starter',
    description: 'Completed 10 tasks',
    icon: '🎪',
    requirement: { type: 'tasks_completed', value: 10 },
    reward: 200,
    rarity: 'common'
  },
  {
    id: 'task_enthusiast',
    name: 'Task Enthusiast',
    description: 'Completed 50 tasks',
    icon: '🎨',
    requirement: { type: 'tasks_completed', value: 50 },
    reward: 750,
    rarity: 'rare'
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Completed 100 tasks',
    icon: '🎯',
    requirement: { type: 'tasks_completed', value: 100 },
    reward: 1500,
    rarity: 'rare'
  },
  {
    id: 'task_legend',
    name: 'Task Legend',
    description: 'Completed 500 tasks',
    icon: '🏅',
    requirement: { type: 'tasks_completed', value: 500 },
    reward: 7500,
    rarity: 'epic'
  },
  {
    id: 'spin_master',
    name: 'Lucky Spinner',
    description: 'Used the daily spin wheel 30 times',
    icon: '🎡',
    requirement: { type: 'spins_completed', value: 30 },
    reward: 1000,
    rarity: 'rare'
  }
];

export const LEVEL_REQUIREMENTS = [
  { level: 1, xp: 0, name: 'Bronze', multiplier: 1.0, color: 'text-orange-600 bg-orange-100', icon: '🥉' },
  { level: 2, xp: 500, name: 'Silver', multiplier: 1.02, color: 'text-gray-600 bg-gray-100', icon: '🥈' },
  { level: 3, xp: 1500, name: 'Gold', multiplier: 1.05, color: 'text-yellow-600 bg-yellow-100', icon: '🥇' },
  { level: 4, xp: 3500, name: 'Platinum', multiplier: 1.10, color: 'text-purple-600 bg-purple-100', icon: '💎' },
  { level: 5, xp: 7500, name: 'Diamond', multiplier: 1.15, color: 'text-blue-600 bg-blue-100', icon: '💠' },
  { level: 6, xp: 15000, name: 'Master', multiplier: 1.20, color: 'text-red-600 bg-red-100', icon: '👑' },
  { level: 7, xp: 30000, name: 'Grandmaster', multiplier: 1.25, color: 'text-indigo-600 bg-indigo-100', icon: '🏆' },
  { level: 8, xp: 60000, name: 'Legend', multiplier: 1.30, color: 'text-pink-600 bg-pink-100', icon: '⭐' },
];

export const SPIN_REWARDS: { reward: any; weight: number }[] = [
  { reward: { type: 'dulp', amount: 50, rarity: 'common' }, weight: 30 },
  { reward: { type: 'dulp', amount: 100, rarity: 'common' }, weight: 25 },
  { reward: { type: 'dulp', amount: 150, rarity: 'common' }, weight: 15 },
  { reward: { type: 'dulp', amount: 250, rarity: 'rare' }, weight: 15 },
  { reward: { type: 'dulp', amount: 500, rarity: 'epic' }, weight: 8 },
  { reward: { type: 'dulp', amount: 1000, rarity: 'epic' }, weight: 3 },
  { reward: { type: 'xp', amount: 100, rarity: 'common' }, weight: 10 },
  { reward: { type: 'xp', amount: 250, rarity: 'rare' }, weight: 5 },
  { reward: { type: 'multiplier', amount: 2, duration: 3600000, rarity: 'rare' }, weight: 7 }, // 1 hour
  { reward: { type: 'multiplier', amount: 3, duration: 1800000, rarity: 'epic' }, weight: 3 }, // 30 minutes
  { reward: { type: 'loot_box', amount: 1, rarity: 'rare' }, weight: 3 },
  { reward: { type: 'nothing', amount: 0, rarity: 'common' }, weight: 2 },
]