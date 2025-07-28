import { useQuery } from '@tanstack/react-query';
import { Trophy, Clock, Target, TrendingUp, Zap } from 'lucide-react';

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
}

interface GameScore {
  id: number;
  userId: number;
  gameId: string;
  score: number;
  timeCompleted: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

interface MyGameStatsProps {
  gameId: string;
  gameName: string;
}

export default function MyGameStats({ gameId, gameName }: MyGameStatsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['my-game-stats', gameId],
    queryFn: () => fetch(`/api/games/${gameId}/my-stats`).then(res => res.json()) as Promise<{
      stats: GameStats | null;
      recentScores: GameScore[];
    }>
  });

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">Loading your stats...</div>
      </div>
    );
  }

  const { stats, recentScores } = data || { stats: null, recentScores: [] };

  if (!stats && recentScores.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Play {gameName} to see your stats here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your {gameName} Statistics
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.bestScore.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Best Score
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalPlays}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Target className="w-3 h-3" />
                  Games Played
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.averageScore.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{formatTime(stats.bestTime)}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Best Time
                </div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.maxWinStreak}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" />
                  Max Streak
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{stats.totalScore.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.winStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {recentScores.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Games</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentScores.map((score, index) => (
                <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{score.score.toLocaleString()} points</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
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
                  <div className="text-xs text-muted-foreground">
                    {new Date(score.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}