import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { NumberRushGame } from './games/NumberRushGame';
import { ColorMatchGame } from './games/ColorMatchGame';
import { TriviaGame } from './games/TriviaGame';
import { CoinCollectorGame } from './games/CoinCollectorGame';
import { LuckySlotsGame } from './games/LuckySlotsGame';
import { WordBuilderGame } from './games/WordBuilderGame';
import { ReflexTestGame } from './games/ReflexTestGame';
import { Gamepad2, Star, Clock, Coins, Gift, Target, Zap, Trophy, Puzzle, Shuffle, BarChart3 } from 'lucide-react';
import GameLeaderboard from './GameLeaderboard';
import MyGameStats from './MyGameStats';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  category: 'puzzle' | 'skill' | 'luck' | 'arcade';
  isAvailable: boolean;
}

const games: Game[] = [
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Match pairs of cards to earn tokens',
    icon: Puzzle,
    reward: 75,
    difficulty: 'easy',
    estimatedTime: '3 min',
    category: 'puzzle',
    isAvailable: true
  },
  {
    id: 'number-rush',
    title: 'Number Rush',
    description: 'Solve math problems quickly',
    icon: Target,
    reward: 100,
    difficulty: 'medium',
    estimatedTime: '2 min',
    category: 'skill',
    isAvailable: true
  },
  {
    id: 'color-match',
    title: 'Color Match',
    description: 'Remember and match color sequences',
    icon: Shuffle,
    reward: 80,
    difficulty: 'easy',
    estimatedTime: '2 min',
    category: 'puzzle',
    isAvailable: true
  },
  {
    id: 'coin-collector',
    title: 'Coin Collector',
    description: 'Collect coins while avoiding obstacles',
    icon: Coins,
    reward: 120,
    difficulty: 'hard',
    estimatedTime: '3 min',
    category: 'arcade',
    isAvailable: true
  },
  {
    id: 'lucky-slots',
    title: 'Lucky Slots',
    description: 'Test your luck with slot machines',
    icon: Trophy,
    reward: 150,
    difficulty: 'easy',
    estimatedTime: '1 min',
    category: 'luck',
    isAvailable: true
  },
  {
    id: 'word-builder',
    title: 'Word Builder',
    description: 'Create words from letter tiles',
    icon: Zap,
    reward: 95,
    difficulty: 'medium',
    estimatedTime: '4 min',
    category: 'skill',
    isAvailable: true
  },
  {
    id: 'reflex-test',
    title: 'Reflex Test',
    description: 'Test your reaction time',
    icon: Target,
    reward: 85,
    difficulty: 'medium',
    estimatedTime: '2 min',
    category: 'skill',
    isAvailable: true
  },
  {
    id: 'trivia-challenge',
    title: 'Trivia Challenge',
    description: 'Answer questions to earn tokens',
    icon: Gift,
    reward: 90,
    difficulty: 'medium',
    estimatedTime: '5 min',
    category: 'skill',
    isAvailable: true
  }
];

const difficultyColors = {
  easy: 'bg-green-500 text-white',
  medium: 'bg-yellow-500 text-white',
  hard: 'bg-red-500 text-white'
};

const categoryColors = {
  puzzle: 'bg-purple-500 text-white',
  skill: 'bg-blue-500 text-white',
  luck: 'bg-orange-500 text-white',
  arcade: 'bg-pink-500 text-white'
};

interface GamesPageProps {
  setCurrentPage?: (page: 'home' | 'dashboard' | 'tasks' | 'games') => void;
}

export default function GamesPage({ setCurrentPage }: GamesPageProps) {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameProgress, setGameProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMyStats, setShowMyStats] = useState(false);
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup effect
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playGameMutation = useMutation({
    mutationFn: async (gameId: string) => {
      const response = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete game');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (!isMountedRef.current) return;
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    }
  });

  const startGame = (game: Game) => {
    if (!game.isAvailable || isPlaying) return; // Prevent multiple starts
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setSelectedGame(game);
    setIsPlaying(true);
    setGameProgress(0);
    setGameCompleted(false);
    
    // Only use simulation for games without specific components
    const hasCustomComponent = ['memory-match', 'number-rush', 'color-match', 'trivia-challenge', 'coin-collector', 'lucky-slots', 'word-builder', 'reflex-test'].includes(game.id);
    
    if (!hasCustomComponent) {
      // Enhanced game simulation with variable timing based on difficulty
      const getGameSpeed = (difficulty: string) => {
        switch (difficulty) {
          case 'easy': return 300;
          case 'medium': return 500;
          case 'hard': return 700;
          default: return 500;
        }
      };
      
      const getProgressIncrement = (difficulty: string) => {
        switch (difficulty) {
          case 'easy': return 12;
          case 'medium': return 8;
          case 'hard': return 5;
          default: return 8;
        }
      };
      
      const speed = getGameSpeed(game.difficulty);
      const increment = getProgressIncrement(game.difficulty);
      
      intervalRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          intervalRef.current && clearInterval(intervalRef.current);
          return;
        }
        
        setGameProgress(prev => {
          const newProgress = prev + increment;
          if (newProgress >= 100 && !gameCompleted) {
            intervalRef.current && clearInterval(intervalRef.current);
            setTimeout(() => completeGame(game), 500);
            return 100;
          }
          return newProgress;
        });
      }, speed);
    }
  };

  const completeGame = async (game: Game, customScore?: number) => {
    // Prevent multiple completions
    if (gameCompleted || !isMountedRef.current) return;
    
    setGameCompleted(true);
    
    // Clear any running intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    try {
      const gameData = await playGameMutation.mutateAsync(game.id);
      
      if (!isMountedRef.current) return;
      
      const finalScore = customScore || gameData.reward;
      setMessage(`Game Complete! You earned ${finalScore} DULP tokens!`);
      
      setTimeout(() => {
        if (isMountedRef.current) {
          setMessage('');
          setIsPlaying(false);
          setSelectedGame(null);
          setGameProgress(0);
          setGameCompleted(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Game completion failed:', error);
      if (isMountedRef.current) {
        setMessage('Game completion failed. Please try again.');
        setTimeout(() => {
          if (isMountedRef.current) {
            setMessage('');
            setIsPlaying(false);
            setSelectedGame(null);
            setGameProgress(0);
            setGameCompleted(false);
          }
        }, 3000);
      }
    }
  };

  const handleGameComplete = (score: number) => {
    if (selectedGame && !gameCompleted) {
      completeGame(selectedGame, score);
    }
  };

  // Centralized game component renderer
  const renderGameComponent = () => {
    if (!selectedGame) return null;

    const gameComponents = {
      'memory-match': MemoryMatchGame,
      'number-rush': NumberRushGame,
      'color-match': ColorMatchGame,
      'trivia-challenge': TriviaGame,
      'coin-collector': CoinCollectorGame,
      'lucky-slots': LuckySlotsGame,
      'word-builder': WordBuilderGame,
      'reflex-test': ReflexTestGame,
    };

    const GameComponent = gameComponents[selectedGame.id as keyof typeof gameComponents];

    if (GameComponent) {
      return <GameComponent onComplete={handleGameComplete} reward={selectedGame.reward} />;
    }

    // Fallback simulation for games without custom components
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <selectedGame.icon className="h-16 w-16 mx-auto text-blue-600" />
          <h3 className="text-xl font-bold">{selectedGame.title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{selectedGame.description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{gameProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${gameProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="font-medium">Reward: {selectedGame.reward} DULP</span>
          </div>
          
          {gameProgress < 100 && !gameCompleted && (
            <p className="text-gray-600">Playing game...</p>
          )}
          
          {gameProgress === 100 || gameCompleted ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">Game Complete!</p>
              <p className="text-sm">You earned {selectedGame.reward} DULP tokens!</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const availableGames = games.filter(game => game.isAvailable);
  const upcomingGames = games.filter(game => !game.isAvailable);

  if (isPlaying && selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Playing: {selectedGame.title}</h1>
            </div>
            <button 
              onClick={() => {
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
                setIsPlaying(false);
                setSelectedGame(null);
                setGameProgress(0);
                setGameCompleted(false);
                setMessage('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Games
            </button>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            {renderGameComponent()}
          </div>
        </div>
      </div>
    );
  }

  // Show leaderboard overlay
  if (showLeaderboard && selectedGame) {
    return (
      <GameLeaderboard
        gameId={selectedGame.id}
        gameName={selectedGame.title}
        onClose={() => {
          setShowLeaderboard(false);
          setSelectedGame(null);
        }}
      />
    );
  }

  // Show my stats view
  if (showMyStats && selectedGame) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowMyStats(false);
              setSelectedGame(null);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Back to games"
          >
            <Gamepad2 className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">{selectedGame.title} - My Stats</h1>
        </div>
        <MyGameStats gameId={selectedGame.id} gameName={selectedGame.title} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {setCurrentPage && (
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back
              </button>
            )}
            <Gamepad2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Games</h1>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-gray-600">Earn DULP by playing games</span>
          </div>
        </div>

        {/* Available Games */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Available Games
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableGames.map((game) => (
              <div key={game.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <game.icon className="h-8 w-8 text-blue-600" />
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[game.difficulty]}`}>
                        {game.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[game.category]}`}>
                        {game.category}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{game.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{game.description}</p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{game.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      <span className="font-medium">{game.reward} DULP</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => startGame(game)}
                      disabled={isPlaying}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isPlaying 
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isPlaying ? 'Game Running...' : 'Play Game'}
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedGame(game);
                          setShowLeaderboard(true);
                        }}
                        className="flex-1 py-1 px-2 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trophy className="w-3 h-3" />
                        Leaderboard
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGame(game);
                          setShowMyStats(true);
                        }}
                        className="flex-1 py-1 px-2 text-xs bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <BarChart3 className="w-3 h-3" />
                        My Stats
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Coming Soon
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingGames.map((game) => (
                <div key={game.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg opacity-60">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <game.icon className="h-8 w-8 text-gray-400" />
                      <div className="flex gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                          {game.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-300 text-gray-700">
                          {game.category}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 text-gray-600">{game.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{game.description}</p>
                    
                    <div className="flex items-center justify-between text-sm mb-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{game.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        <span className="font-medium">{game.reward} DULP</span>
                      </div>
                    </div>
                    
                    <button 
                      disabled
                      className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}