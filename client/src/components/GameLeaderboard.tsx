import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Medal, Award, Star, Clock, Target, TrendingUp, User, X } from 'lucide-react';

interface GameScore {
  id: number;
  userId: number;
  gameId: string;
  score: number;
  timeCompleted: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  user?: {
    id: number;
    username: string;
  };
}

interface GameStats {
  id: number;
  userId: number;
  gameId: string;
  totalPlays: number;
  bestScore: number;
  bestTime: number | null;
  totalScore: number;
  averageScore: number;
  completionRate: number;
  winStreak: number;
  maxWinStreak: number;
  lastPlayedAt: string | null;
  user?: {
    id: number;
    username: string;
  };
}

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'score' | 'time' | 'completion' | 'streak';
    value: number;
    gameId?: string;
  };
  reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: string;
  unlockedAt: string;
  claimed: boolean;
  claimedAt: string | null;
}

interface GameLeaderboardProps {
  gameId: string;
  gameName: string;
  onClose: () => void;
}

function ClaimButton({ achievementId }: { achievementId: string }) {
  const queryClient = useQueryClient();
  
  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to claim achievement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    }
  });

  return (
    <button 
      className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={claimMutation.isPending}
      onClick={() => claimMutation.mutate()}
    >
      {claimMutation.isPending ? 'Claiming...' : 'Claim Reward'}
    </button>
  );
}

export default function GameLeaderboard({ gameId, gameName, onClose }: GameLeaderboardProps) {
  const [activeTab, setActiveTab] = useState('scores');
  const queryClient = useQueryClient();

  // Fetch leaderboard scores
  const { data: scores, isLoading: scoresLoading } = useQuery({
    queryKey: ['leaderboard', gameId],
    queryFn: () => fetch(`/api/games/${gameId}/leaderboard`).then(res => res.json()) as Promise<GameScore[]>
  });

  // Fetch top player statistics
  const { data: topStats, isLoading: statsLoading } = useQuery({
    queryKey: ['leaderboard-stats', gameId],
    queryFn: () => fetch(`/api/games/${gameId}/stats`).then(res => res.json()) as Promise<GameStats[]>
  });

  // Fetch achievements for this game
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements', gameId],
    queryFn: () => fetch(`/api/games/${gameId}/achievements`).then(res => res.json()) as Promise<{
      available: Achievement[];
      userAchievements: UserAchievement[];
    }>
  });

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;  
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <div className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold text-sm">#{rank}</div>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              {gameName} Leaderboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scores' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              High Scores
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stats' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'achievements' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Achievements
            </button>
          </div>

          {/* High Scores Tab */}
          {activeTab === 'scores' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Scores
              </h3>
              {scoresLoading ? (
                <div className="text-center py-8">Loading scores...</div>
              ) : scores && scores.length > 0 ? (
                <div className="space-y-3">
                  {scores.slice(0, 10).map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {getRankIcon(index + 1)}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {score.user?.username || `Player ${score.userId}`}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {score.score.toLocaleString()} points
                            </span>
                            {score.timeCompleted && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(score.timeCompleted)}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(score.difficulty)}`}>
                              {score.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scores yet. Be the first to play!</p>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Players
              </h3>
              {statsLoading ? (
                <div className="text-center py-8">Loading statistics...</div>
              ) : topStats && topStats.length > 0 ? (
                <div className="space-y-3">
                  {topStats.slice(0, 10).map((stat, index) => (
                    <div key={stat.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          <div className="font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {stat.user?.username || `Player ${stat.userId}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.totalPlays} games played
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-lg text-blue-600">{stat.bestScore.toLocaleString()}</div>
                          <div className="text-gray-600">Best Score</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-green-600">{stat.averageScore.toLocaleString()}</div>
                          <div className="text-gray-600">Average</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-purple-600">{formatTime(stat.bestTime)}</div>
                          <div className="text-gray-600">Best Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg text-orange-600">{stat.maxWinStreak}</div>
                          <div className="text-gray-600">Max Streak</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No statistics available yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Game Achievements
              </h3>
              {achievementsLoading ? (
                <div className="text-center py-8">Loading achievements...</div>
              ) : achievements && achievements.available.length > 0 ? (
                <div className="space-y-4">
                  {achievements.available.map((achievement) => {
                    const userAchievement = achievements.userAchievements.find(ua => ua.achievementId === achievement.achievementId);
                    const isUnlocked = !!userAchievement;
                    const isClaimed = userAchievement?.claimed || false;
                    
                    return (
                      <div key={achievement.achievementId} className={`p-4 rounded-lg border-2 ${
                        isUnlocked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`text-2xl p-3 rounded-full ${
                              isUnlocked ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {achievement.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold">{achievement.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                                  {achievement.rarity}
                                </span>
                                {isUnlocked && (
                                  <div className="flex items-center gap-1 text-green-600 text-sm">
                                    <Star className="w-3 h-3 fill-current" />
                                    {isClaimed ? 'Claimed' : 'Unlocked!'}
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                              <div className="text-xs text-gray-500">
                                {achievement.requirement.type === 'score' ? `Score ${achievement.requirement.value.toLocaleString()}+ points` :
                                 achievement.requirement.type === 'time' ? `Complete in ${achievement.requirement.value}s or less` :
                                 achievement.requirement.type === 'completion' ? `Complete ${achievement.requirement.value} game${achievement.requirement.value > 1 ? 's' : ''}` :
                                 achievement.requirement.type === 'streak' ? `Get ${achievement.requirement.value}+ streak` : 'Unknown requirement'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{achievement.reward} DULP</div>
                            {isUnlocked && userAchievement && !isClaimed && (
                              <ClaimButton achievementId={achievement.achievementId} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements available for this game.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}