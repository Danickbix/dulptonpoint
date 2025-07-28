import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { completeGame } from '../lib/firestore';

interface GameCompleteParams {
  gameId: string;
  score: number;
  timeCompleted?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  metadata?: Record<string, any>;
}

export function useGameComplete() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: GameCompleteParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate reward based on score
      const baseReward = 10;
      const scoreMultiplier = Math.max(1, Math.floor(params.score / 100));
      const reward = baseReward * scoreMultiplier;

      await completeGame(user.uid, params.gameId, params.score, reward);
      
      return { 
        success: true, 
        reward,
        message: `Game completed! Earned ${reward} DULP tokens.`
      };
    },
    onSuccess: (data) => {
      console.log('Game completed successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to complete game:', error);
    }
  });
}