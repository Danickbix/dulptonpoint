import React from 'react';
import { X, Trophy, Star } from 'lucide-react';
import { Achievement } from '../types/gamification';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose, achievements }) => {
  if (!isOpen || achievements.length === 0) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

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
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
            <p className="text-sm sm:text-base text-gray-600">You've earned new achievements!</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                      {achievement.name}
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-yellow-500 flex-shrink-0" />
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
                    <p className="text-xs sm:text-sm font-semibold text-green-600">+{achievement.reward} DULP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};