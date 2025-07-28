export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  dulpBalance: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  referralEarnings: number;
  createdAt: Date;
  lastActive: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'earn' | 'withdraw' | 'referral_bonus' | 'signup_bonus';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  metadata?: {
    taskId?: string;
    referralUserId?: string;
    withdrawalAddress?: string;
  };
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  bonusAmount: number;
  status: 'pending' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}