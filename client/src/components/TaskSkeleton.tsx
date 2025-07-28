import React from 'react';

export const TaskSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Header gradient */}
      <div className="h-1 bg-gray-200"></div>
      
      <div className="p-3 sm:p-4 md:p-6">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 sm:h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="flex items-center space-x-2">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1 w-full"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded mb-3 sm:mb-4 w-2/3"></div>

        {/* Reward and Time */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-4 sm:h-5 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 h-8 sm:h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-8 sm:h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};