import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Gift, 
  Copy, 
  Check, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Zap,
  Trophy,
  Target,
  Flame,
  List,
  Gamepad2,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useGamification } from '../hooks/useGamification';
import { SpinWheel } from './SpinWheel';
import { AchievementModal } from './AchievementModal';
import { LevelUpModal } from './LevelUpModal';
import { QuestPanel } from './QuestPanel';
import { SpinReward, Achievement } from '../types/gamification';

interface DashboardProps {
  setCurrentPage: (page: 'home' | 'dashboard' | 'tasks' | 'games' | 'profile') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { user } = useAuth();
  const { profile, transactions, loading, updateBalance, processReferral } = useUserProfile(user);
  const { userStats, getCurrentLevel, getNextLevel, canSpin, completeTask, getActiveMultiplier } = useGamification(user);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: string; multiplier: number } | null>(null);
  const [showTasks, setShowTasks] = useState(false);

  const copyReferralLink = () => {
    if (!profile) return;
    
    const referralLink = `${window.location.origin}?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) return;

    const result = await processReferral(referralCode.trim());
    setReferralMessage(result.message);
    if (result.success) {
      setReferralCode('');
    }
    setTimeout(() => setReferralMessage(''), 5000);
  };



  const handleSpinReward = async (reward: SpinReward) => {
    if (reward.type === 'dulp') {
      await updateBalance(reward.amount);
    }
    // Other reward types are handled by the gamification system
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'text-orange-600 bg-orange-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'platinum': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionIcon = (type: string) => {
    if (!type) {
      return <Clock className="h-4 w-4 text-gray-600" />;
    }
    
    switch (type) {
      case 'earn': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'referral_bonus': return <Users className="h-4 w-4 text-blue-600" />;
      case 'signup_bonus': return <Gift className="h-4 w-4 text-purple-600" />;
      case 'withdraw': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const activeMultiplier = getActiveMultiplier();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="gradient-primary text-white">
        <div className="container-responsive py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-responsive-2xl font-bold">Welcome back!</h1>
              <p className="text-purple-100 mt-1 text-responsive-sm">Ready to earn more $DULP tokens?</p>
              {activeMultiplier > 1 && (
                <div className="flex items-center mt-2 bg-white/20 rounded-full px-3 py-1 w-fit">
                  <Zap className="h-4 w-4 mr-1" />
                  <span className="text-responsive-xs font-medium">{activeMultiplier}x Earning Boost Active!</span>
                </div>
              )}
            </div>
            <div className={`px-3 py-2 rounded-full text-responsive-xs font-medium ${currentLevel.color} flex items-center space-x-1 sm:space-x-2 w-fit`}>
              <span className="text-base sm:text-lg">{currentLevel.icon}</span>
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{currentLevel.name}</span>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          {userStats && nextLevel && (
            <div className="mt-3 sm:mt-4 bg-white/20 rounded-full p-1">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                <span>Level {currentLevel.level}</span>
                <span>{userStats.xp} / {nextLevel.xp} XP</span>
              </div>
              <div className="bg-white/30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${((userStats.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile-First Navigation */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="btn-responsive btn-gradient flex-1 sm:flex-none"
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('tasks')}
            className="btn-responsive btn-gradient-secondary flex-1 sm:flex-none"
          >
            Tasks
          </button>
          <button 
            onClick={() => setCurrentPage('games')}
            className="btn-responsive btn-gradient flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <Gamepad2 className="h-4 w-4" />
            <span className="hidden sm:inline">Games</span>
          </button>
          <button 
            onClick={() => setCurrentPage('profile')}
            className="btn-responsive btn-gradient-secondary flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Balance</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{profile.dulpBalance.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-500">$DULP</p>
              </div>
              <div className="bg-green-100 rounded-full p-2 sm:p-3">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{profile.totalEarned.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-500">$DULP</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{profile.referralCount}</p>
                <p className="text-xs sm:text-sm text-gray-500">Friends</p>
              </div>
              <div className="bg-purple-100 rounded-full p-2 sm:p-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Streak</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{userStats?.loginStreak || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">Days</p>
              </div>
              <div className="bg-red-100 rounded-full p-2 sm:p-3">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{userStats?.tasksCompleted || 0}</p>
                <p className="text-xs sm:text-sm text-gray-500">Done</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-2 sm:p-3">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
              
              <button
                onClick={() => setCurrentPage('tasks')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 mb-3 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                View Available Tasks
                {activeMultiplier > 1 && (
                  <span className="ml-1 sm:ml-2 bg-white/20 px-1 sm:px-2 py-1 rounded-full text-xs">
                    {activeMultiplier}x
                  </span>
                )}
              </button>



              <button
                onClick={() => setShowSpinWheel(true)}
                disabled={!canSpin()}
                className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 transform hover:scale-105 mb-3 flex items-center justify-center ${
                  canSpin() 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {canSpin() ? 'Daily Spin Wheel' : 'Spin Used Today'}
              </button>

              <div className="border-t pt-3 sm:pt-4">
                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Your Referral Code</h4>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <code className="bg-gray-100 px-2 sm:px-3 py-2 rounded-lg font-mono text-sm sm:text-lg flex-1 text-center">
                    {profile.referralCode}
                  </code>
                  <button
                    onClick={copyReferralLink}
                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0"
                  >
                    {copiedReferral ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Copy className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Earn 500 $DULP for each friend who joins!
                </p>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Achievements</h3>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unlocked</span>
                  <span className="font-semibold">{userStats?.achievements.length || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-semibold">{currentLevel.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">XP</span>
                  <span className="font-semibold">{userStats?.xp || 0}</span>
                </div>
              </div>
            </div>
            {/* Enter Referral Code */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Have a Referral Code?</h3>
              <form onSubmit={handleReferralSubmit} className="space-y-3">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!!profile.referredBy}
                />
                <button
                  type="submit"
                  disabled={!referralCode.trim() || !!profile.referredBy}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profile.referredBy ? 'Already Used Referral' : 'Apply Code'}
                </button>
              </form>
              {referralMessage && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  referralMessage.includes('success') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {referralMessage}
                </div>
              )}
            </div>
          </div>

          {/* Quests Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <QuestPanel />
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Recent Transactions</h3>
              
              {transactions.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Clock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-gray-600">No transactions yet</p>
                  <p className="text-xs sm:text-sm text-gray-500">Complete your first task to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="bg-white rounded-full p-2">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{transaction.description}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`font-semibold ${
                          transaction.type === 'withdraw' ? 'text-red-600' : 'text-green-600'
                        } text-sm sm:text-base`}>
                          {transaction.type === 'withdraw' ? '-' : '+'}
                          {transaction.amount.toLocaleString()} $DULP
                        </p>
                        <p className={`text-xs px-1 sm:px-2 py-1 rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <SpinWheel
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onReward={handleSpinReward}
      />
      
      <AchievementModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={newAchievements}
      />
      
      {levelUpData && (
        <LevelUpModal
          isOpen={showLevelUp}
          onClose={() => setShowLevelUp(false)}
          newLevel={levelUpData.newLevel}
          multiplier={levelUpData.multiplier}
        />
      )}
    </div>
  );
};