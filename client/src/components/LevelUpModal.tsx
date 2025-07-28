import React from 'react';
import { X, TrendingUp, Star } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: string;
  multiplier: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, onClose, newLevel, multiplier }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md relative overflow-hidden mx-3 sm:mx-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 opacity-10"></div>
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative p-4 sm:p-6 md:p-8 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
              <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Level Up!</h2>
            <p className="text-sm sm:text-base text-gray-600 px-2">Congratulations on reaching a new level!</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 sm:p-6 border border-yellow-200 mb-4 sm:mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2 sm:mb-3">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{newLevel}</span>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-2">You've reached {newLevel} level!</p>
            <p className="text-sm text-gray-600">
              Earning bonus: <span className="font-semibold text-green-600">+{((multiplier - 1) * 100).toFixed(0)}%</span>
            </p>
          </div>

          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            <p>🎉 Higher earning multiplier</p>
            <p>🏆 Exclusive level badge</p>
            <p>⭐ Increased daily rewards</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
          >
            Continue Earning!
          </button>
        </div>
      </div>
    </div>
  );
};