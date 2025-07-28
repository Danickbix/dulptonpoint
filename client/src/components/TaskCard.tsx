import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, Clock, Zap, Star, AlertCircle } from 'lucide-react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  isCompleting: boolean;
  onComplete: (taskId: string) => void;
  onAction?: (url: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompleted,
  isCompleting,
  onComplete,
  onAction
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'from-blue-500 to-purple-600';
      case 'web': return 'from-green-500 to-teal-600';
      case 'daily': return 'from-orange-500 to-red-600';
      case 'featured': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleActionClick = () => {
    if (task.actionUrl && onAction) {
      onAction(task.actionUrl);
    }
  };

  const handleCompleteClick = () => {
    if (!isCompleted && !isCompleting) {
      onComplete(task.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
        isCompleted 
          ? 'border-green-200 bg-green-50/50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Header with category gradient */}
      <div className={`h-1 bg-gradient-to-r ${getCategoryColor(task.category)}`}></div>
      
      <div className="p-3 sm:p-4 md:p-6">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="text-xl sm:text-2xl flex-shrink-0">
              {task.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-sm sm:text-base md:text-lg font-semibold line-clamp-2 ${
                isCompleted ? 'text-green-800' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {task.platform}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
              </div>
            </div>
          </div>
          
          {isCompleted && (
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 ${
          isCompleted ? 'text-green-700' : 'text-gray-600'
        }`}>
          {task.description}
        </p>

        {/* Reward and Time */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              <span className={`text-sm sm:text-base font-bold ${
                isCompleted ? 'text-green-600' : 'text-purple-600'
              }`}>
                +{task.reward} DULP
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-500">
                {task.estimatedTime}
              </span>
            </div>
          </div>
          
          {task.category === 'featured' && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              <span className="text-xs sm:text-sm font-medium text-yellow-600">Featured</span>
            </div>
          )}
        </div>

        {/* Requirements */}
        {task.requirements && task.requirements.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-amber-700 font-medium mb-1">Requirements:</p>
                <ul className="text-xs text-amber-600 space-y-1">
                  {task.requirements.map((req, index) => (
                    <li key={index} className="line-clamp-1">• {req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Expiry Warning */}
        {task.expiresAt && (
          <div className="mb-3 sm:mb-4 bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              <span className="text-xs sm:text-sm text-orange-700">
                Expires: {task.expiresAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {task.actionUrl && !isCompleted && (
            <button
              onClick={handleActionClick}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{task.actionText}</span>
            </button>
          )}
          
          <button
            onClick={handleCompleteClick}
            disabled={isCompleted || isCompleting}
            className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 ${
              isCompleted
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : isCompleting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                <span>Completing...</span>
              </>
            ) : isCompleted ? (
              <>
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Mark as Done</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};