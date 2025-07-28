import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Globe, Calendar, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useUserProfile } from '../hooks/useUserProfile';
import { TaskCard } from './TaskCard';
import { TaskSkeleton } from './TaskSkeleton';
import { TaskCompletionModal } from './TaskCompletionModal';
import { Task } from '../types/task';

type TabType = 'social' | 'web' | 'daily' | 'featured';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'social',
    label: 'Social Tasks',
    icon: <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />,
    emoji: '📢',
    description: 'Follow, like, and share on social media'
  },
  {
    id: 'web',
    label: 'Web/App Tasks',
    icon: <Globe className="h-4 w-4 sm:h-5 sm:w-5" />,
    emoji: '🌐',
    description: 'Surveys, downloads, and web activities'
  },
  {
    id: 'daily',
    label: 'Daily Quests',
    icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />,
    emoji: '🗓️',
    description: 'Daily challenges and bonuses'
  },
  {
    id: 'featured',
    label: 'Featured Tasks',
    icon: <Target className="h-4 w-4 sm:h-5 sm:w-5" />,
    emoji: '🎯',
    description: 'High-reward premium tasks'
  }
];

interface TasksPageProps {
  setCurrentPage?: (page: 'home' | 'dashboard' | 'tasks' | 'games') => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const { profile, updateBalance } = useUserProfile(user);
  const { 
    loading, 
    completeTask, 
    getTasksByCategory, 
    isTaskCompleted, 
    isTaskCompleting,
    completedTasksCount 
  } = useTasks(user);
  
  const [activeTab, setActiveTab] = useState<TabType>('social');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleTaskComplete = async (taskId: number) => {
    try {
      await completeTask(taskId.toString());
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Task completion failed:', error);
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskAction = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentTasks = getTasksByCategory(activeTab);
  const completedInCategory = currentTasks.filter((task: any) => isTaskCompleted(task.id)).length;

  const getTabGradient = (tabId: TabType) => {
    switch (tabId) {
      case 'social': return 'from-blue-500 to-purple-600';
      case 'web': return 'from-green-500 to-teal-600';
      case 'daily': return 'from-orange-500 to-red-600';
      case 'featured': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="text-center text-white">
            {/* Back Button */}
            {setCurrentPage && (
              <div className="flex justify-start mb-4">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  ← Back to Dashboard
                </button>
              </div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                Complete Tasks & Earn Rewards
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
                Choose from hundreds of tasks and start earning $DULP tokens today
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">{completedTasksCount}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">Completed</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">
                      {profile?.dulpBalance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">DULP Balance</p>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">
                      {currentTasks.length}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80">Available</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm md:text-base font-medium transition-all duration-200 flex items-center space-x-2 min-w-0 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${getTabGradient(tab.id)} rounded-lg`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 text-base sm:text-lg flex-shrink-0">{tab.emoji}</span>
                <span className="relative z-10 hidden sm:inline truncate">{tab.label}</span>
                <span className="relative z-10 sm:hidden truncate">{tab.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
          
          {/* Tab Description */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 sm:mt-4 text-center sm:text-left"
          >
            <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
              {TABS.find(tab => tab.id === activeTab)?.description}
            </p>
            <div className="mt-2 flex items-center justify-center sm:justify-start space-x-4 text-xs sm:text-sm text-gray-500">
              <span>{currentTasks.length} available tasks</span>
              <span>•</span>
              <span>{completedInCategory} completed</span>
            </div>
          </motion.div>
        </div>

        {/* Task Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <TaskSkeleton key={index} />
                ))}
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-6xl mb-4">🎯</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No tasks available
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                  Check back later for new {activeTab} tasks, or try a different category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentTasks.map((task: any, index: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TaskCard
                      task={task}
                      isCompleted={isTaskCompleted(task.id)}
                      isCompleting={isTaskCompleting(task.id)}
                      onComplete={() => handleTaskClick(task)}
                      onAction={handleTaskAction}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onComplete={handleTaskComplete}
        isCompleting={isTaskCompleting(selectedTask?.id)}
      />
    </div>
  );
};