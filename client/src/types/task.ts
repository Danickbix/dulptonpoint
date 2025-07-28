export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  platform: string;
  category: 'social' | 'web' | 'daily' | 'featured';
  icon: string;
  actionUrl?: string;
  actionText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  requirements?: string[];
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface TaskCompletion {
  taskId: string;
  userId: string;
  completedAt: Date;
  verified: boolean;
  rewardClaimed: boolean;
}

export interface TaskProgress {
  taskId: string;
  progress: number;
  maxProgress: number;
  lastUpdated: Date;
}