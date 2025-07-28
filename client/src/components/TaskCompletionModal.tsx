import { useState } from 'react';
import { X, ExternalLink, CheckCircle, Clock, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  type: string;
  category: string;
  url: string;
  timeEstimate: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TaskCompletionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: number) => Promise<void>;
  isCompleting: boolean;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  task,
  isOpen,
  onClose,
  onComplete,
  isCompleting
}) => {
  const [step, setStep] = useState<'instructions' | 'verification' | 'completed'>('instructions');
  const [verificationCode, setVerificationCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  if (!task) return null;

  const handleStartTask = () => {
    // Open the task URL
    window.open(task.url, '_blank', 'noopener,noreferrer');
    
    // Start verification process
    setStep('verification');
    
    // Set timer based on task difficulty
    const timeNeeded = task.difficulty === 'easy' ? 60 : task.difficulty === 'medium' ? 120 : 180;
    setTimeRemaining(timeNeeded);
    
    // Start countdown
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCompletion = async () => {
    try {
      await onComplete(task.id);
      setStep('completed');
    } catch (error) {
      console.error('Task completion failed:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return '👥';
      case 'web': return '🌐';
      case 'daily': return '📅';
      case 'featured': return '⭐';
      default: return '📋';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                <div>
                  <h3 className="text-xl font-semibold">{task.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.timeEstimate}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'instructions' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Task Description</h4>
                    <p className="text-gray-600">{task.description}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700">Reward</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{task.reward} DULP</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Click "Start Task" to open the task in a new tab</li>
                      <li>Complete the required action on the external site</li>
                      <li>Return here and click "I've Completed This Task"</li>
                      <li>Your reward will be added to your balance</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleStartTask}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Start Task
                  </button>
                </div>
              )}

              {step === 'verification' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⏱️</div>
                    <h4 className="text-lg font-semibold mb-2">Complete the Task</h4>
                    <p className="text-gray-600">
                      Please complete the task in the opened tab, then return here to verify completion.
                    </p>
                  </div>

                  {timeRemaining > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-yellow-700">
                        Minimum time required: <span className="font-semibold">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                      </p>
                      <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${100 - (timeRemaining / (task.difficulty === 'easy' ? 60 : task.difficulty === 'medium' ? 120 : 180)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleVerifyCompletion}
                    disabled={timeRemaining > 0 || isCompleting}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      timeRemaining > 0 || isCompleting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isCompleting ? 'Verifying...' : timeRemaining > 0 ? 'Please wait...' : "I've Completed This Task"}
                  </button>
                </div>
              )}

              {step === 'completed' && (
                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h4 className="text-xl font-semibold text-green-600">Task Completed!</h4>
                  <p className="text-gray-600">
                    Congratulations! You have successfully completed "{task.title}".
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-700 font-medium">
                      +{task.reward} DULP has been added to your balance!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};