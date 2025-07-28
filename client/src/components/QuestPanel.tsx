import React from 'react';
import { Target, Clock, CheckCircle, Gift, Zap } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../hooks/useAuth';

export const QuestPanel: React.FC = () => {
  const { user } = useAuth();
  const { getDailyQuests, getWeeklyQuests } = useGamification(user);

  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'earn_dulp': return <Gift className="h-4 w-4" />;
      case 'complete_tasks': return <Target className="h-4 w-4" />;
      case 'spin_wheel': return <Zap className="h-4 w-4" />;
      case 'login_streak': return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getProgressColor = (completed: boolean) => {
    return completed ? 'bg-green-500' : 'bg-blue-500';
  };

  const QuestItem = ({ quest, progress, completed }: any) => (
    <div className={`p-3 sm:p-4 rounded-lg border transition-all ${
      completed 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`p-1 rounded-full ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            {completed ? <CheckCircle className="h-4 w-4" /> : getQuestIcon(quest.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className={`text-sm sm:text-base font-medium ${completed ? 'text-green-900' : 'text-gray-900'} truncate`}>
              {quest.title}
            </h4>
            <p className={`text-xs sm:text-sm ${completed ? 'text-green-600' : 'text-gray-600'} line-clamp-2`}>
              {quest.description}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className={`text-xs sm:text-sm font-medium ${completed ? 'text-green-600' : 'text-blue-600'}`}>
            +{quest.reward} DULP
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            +{quest.xpReward} XP
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-2 sm:mr-3">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(completed)}`}
              style={{ width: `${Math.min((progress / quest.target) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        <span className={`text-xs sm:text-sm font-medium ${completed ? 'text-green-600' : 'text-gray-600'}`}>
          {progress}/{quest.target}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Daily Quests */}
      <div>
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Daily Quests</h3>
            <p className="text-xs sm:text-sm text-gray-600">Reset every 24 hours</p>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {dailyQuests.map((quest) => (
            <QuestItem
              key={quest.id}
              quest={quest}
              progress={quest.progress}
              completed={quest.completed}
            />
          ))}
        </div>
      </div>

      {/* Weekly Quests */}
      <div>
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Weekly Quests</h3>
            <p className="text-xs sm:text-sm text-gray-600">Reset every Sunday</p>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {weeklyQuests.map((quest) => (
            <QuestItem
              key={quest.id}
              quest={quest}
              progress={quest.progress}
              completed={quest.completed}
            />
          ))}
        </div>
      </div>
    </div>
  );
};