import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserProfile, 
  getUserTransactions, 
  updateUserProfile, 
  subscribeToUserProfile, 
  subscribeToUserTransactions 
} from '../lib/firestore';

export const useUserProfile = (user: FirebaseUser | null) => {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to real-time profile updates
    const unsubscribeProfile = subscribeToUserProfile(user.uid, (profileData) => {
      setProfile(profileData);
      setLoading(false);
    });

    // Subscribe to real-time transaction updates
    const unsubscribeTransactions = subscribeToUserTransactions(user.uid, (transactionData) => {
      setTransactions(transactionData);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeTransactions();
    };
  }, [user]);

  const updateBalance = async (amount: number) => {
    if (!user || !profile) return;
    
    await updateUserProfile(user.uid, {
      dulpBalance: (profile.dulpBalance || 0) + amount,
      totalEarned: (profile.totalEarned || 0) + (amount > 0 ? amount : 0),
    });
  };

  const updateProfileData = async (updates: any) => {
    if (!user) return;
    
    await updateUserProfile(user.uid, updates);
  };

  const processReferral = async (referralCode: string) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    
    try {
      // TODO: Implement referral logic with Firestore
      return { success: true, message: 'Referral processed successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Referral failed' };
    }
  };

  return {
    profile,
    transactions,
    loading,
    updateBalance,
    updateProfileData,
    processReferral,
  };
};