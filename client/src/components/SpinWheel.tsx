import React, { useState } from 'react';
import { RotateCcw, Gift, Zap, X } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../hooks/useAuth';
import { SpinReward } from '../types/gamification';

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (reward: SpinReward) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ isOpen, onClose, onReward }) => {
  const { user } = useAuth();
  const { canSpin, spinWheel } = useGamification(user);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinReward | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = async () => {
    if (!canSpin() || spinning) return;

    setSpinning(true);
    setResult(null);

    // Animate wheel
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = rotation + (spins * 360);
    setRotation(finalRotation);

    try {
      // Wait for animation
      setTimeout(async () => {
        const reward = await spinWheel();
        setResult(reward);
        setSpinning(false);
        onReward(reward);
      }, 3000);
    } catch (error) {
      setSpinning(false);
      console.error('Spin failed:', error);
    }
  };

  const getRewardDisplay = (reward: SpinReward) => {
    switch (reward.type) {
      case 'dulp':
        return `${reward.amount} DULP`;
      case 'xp':
        return `${reward.amount} XP`;
      case 'multiplier':
        return `${reward.amount}x Boost (1h)`;
      case 'loot_box':
        return 'Loot Box!';
      case 'nothing':
        return 'Try Again Tomorrow';
      default:
        return 'Mystery Prize';
    }
  };

  const getRewardColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md relative mx-3 sm:mx-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-4 sm:p-6 md:p-8 text-center">
          <div className="mb-4 sm:mb-6">
            <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Daily Spin Wheel</h2>
            <p className="text-sm sm:text-base text-gray-600">Spin once per day for rewards!</p>
          </div>

          {/* Wheel */}
          <div className="relative mb-4 sm:mb-6">
            <div 
              className={`w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-full border-6 sm:border-8 border-purple-600 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 transition-transform duration-3000 ease-out ${spinning ? 'animate-spin' : ''}`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Wheel segments - simplified visual */}
              <div className="absolute inset-3 sm:inset-4 rounded-full bg-white/20 flex items-center justify-center">
                <div className="text-white font-bold text-base sm:text-lg">DULP</div>
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 sm:border-l-4 sm:border-r-4 sm:border-b-8 border-l-transparent border-r-transparent border-b-purple-600"></div>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          {!result && (
            <button
              onClick={handleSpin}
              disabled={!canSpin() || spinning}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                canSpin() && !spinning
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {spinning ? (
                <>
                  <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : canSpin() ? (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Spin Now!
                </>
              ) : (
                'Come Back Tomorrow'
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 sm:p-6 border border-green-200">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">🎉</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Congratulations!</h3>
                <p className={`text-base sm:text-lg font-semibold ${getRewardColor(result.rarity)}`}>
                  You won: {getRewardDisplay(result)}
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 sm:mt-4 bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base hover:bg-green-700 transition-colors"
                >
                  Claim Reward
                </button>
              </div>
            </div>
          )}

          {!canSpin() && !result && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4">
              <p className="text-yellow-800 text-xs sm:text-sm">
                You've already spun today! Come back in 24 hours for another chance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};