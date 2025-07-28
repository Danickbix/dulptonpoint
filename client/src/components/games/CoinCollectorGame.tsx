import { useState, useEffect, useRef } from 'react';
import { Coins, Zap, Heart } from 'lucide-react';

interface CoinCollectorGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

interface GameObject {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'obstacle' | 'powerup';
  value?: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CoinCollectorGame: React.FC<CoinCollectorGameProps> = ({ onComplete, reward }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [player, setPlayer] = useState<Player>({ x: 200, y: 300, width: 40, height: 40 });
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameSpeed, setGameSpeed] = useState(2);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const objectIdRef = useRef(0);

  const gameArea = { width: 400, height: 500 };

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameState, timeLeft]);

  const startGameLoop = () => {
    gameLoopRef.current = setInterval(() => {
      // Spawn new objects
      if (Math.random() < 0.3) {
        spawnObject();
      }

      // Move objects down
      setObjects(prevObjects => 
        prevObjects
          .map(obj => ({ ...obj, y: obj.y + gameSpeed }))
          .filter(obj => obj.y < gameArea.height + 50)
      );

      // Increase game speed gradually
      setGameSpeed(prev => Math.min(prev + 0.01, 5));
    }, 50);
  };

  const spawnObject = () => {
    const objectType = Math.random();
    let type: 'coin' | 'obstacle' | 'powerup';
    let value = 10;

    if (objectType < 0.6) {
      type = 'coin';
      value = Math.random() < 0.2 ? 50 : 10; // 20% chance for golden coin
    } else if (objectType < 0.85) {
      type = 'obstacle';
      value = 0;
    } else {
      type = 'powerup';
      value = 100;
    }

    const newObject: GameObject = {
      id: objectIdRef.current++,
      x: Math.random() * (gameArea.width - 30),
      y: -30,
      type,
      value
    };

    setObjects(prev => [...prev, newObject]);
  };

  const movePlayer = (direction: 'left' | 'right') => {
    setPlayer(prev => ({
      ...prev,
      x: Math.max(0, Math.min(gameArea.width - prev.width, 
        prev.x + (direction === 'left' ? -20 : 20)))
    }));
  };

  const checkCollisions = () => {
    objects.forEach(obj => {
      const collision = 
        player.x < obj.x + 30 &&
        player.x + player.width > obj.x &&
        player.y < obj.y + 30 &&
        player.y + player.height > obj.y;

      if (collision) {
        if (obj.type === 'coin') {
          setScore(prev => prev + (obj.value || 10));
          removeObject(obj.id);
        } else if (obj.type === 'obstacle') {
          setLives(prev => prev - 1);
          removeObject(obj.id);
          if (lives <= 1) {
            endGame();
          }
        } else if (obj.type === 'powerup') {
          setScore(prev => prev + 100);
          setTimeLeft(prev => prev + 10); // Extra time
          removeObject(obj.id);
        }
      }
    });
  };

  const removeObject = (id: number) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  };

  useEffect(() => {
    if (gameState === 'playing') {
      checkCollisions();
    }
  }, [player, objects]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setGameSpeed(2);
    setObjects([]);
    setPlayer({ x: 200, y: 300, width: 40, height: 40 });
  };

  const endGame = () => {
    setGameState('complete');
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    const survivalBonus = lives * 50;
    const timeBonus = timeLeft * 5;
    const finalScore = Math.floor(reward * (score / 500)) + survivalBonus + timeBonus;
    
    setTimeout(() => {
      onComplete(Math.max(finalScore, Math.floor(reward * 0.3)));
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (gameState !== 'playing') return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      movePlayer('left');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      movePlayer('right');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto" tabIndex={0} onKeyDown={handleKeyPress}>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Coin Collector</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          {gameState === 'playing' && (
            <div className="text-sm flex items-center gap-4">
              <span className="font-medium">Score: {score}</span>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="font-medium">{lives}</span>
              </div>
              <span className="font-medium">Time: {timeLeft}s</span>
            </div>
          )}
        </div>
      </div>

      {gameState === 'start' && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🪙</div>
          <h4 className="text-xl font-semibold">Welcome to Coin Collector!</h4>
          <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <h5 className="font-semibold mb-2">How to Play:</h5>
            <ul className="text-sm space-y-1">
              <li>• Use arrow keys or A/D to move</li>
              <li>• Collect coins (🪙) for points</li>
              <li>• Avoid obstacles (💀) - they cost lives</li>
              <li>• Grab power-ups (⭐) for bonus points and time</li>
              <li>• Survive 60 seconds to win!</li>
            </ul>
          </div>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all font-medium"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center space-y-4">
          {/* Game Area */}
          <div 
            ref={gameAreaRef}
            className="relative bg-gradient-to-b from-sky-200 to-green-200 border-4 border-gray-400 rounded-lg overflow-hidden"
            style={{ width: gameArea.width, height: gameArea.height }}
          >
            {/* Player */}
            <div
              className="absolute bg-blue-500 rounded-full border-2 border-blue-700 transition-all duration-100"
              style={{
                left: player.x,
                top: player.y,
                width: player.width,
                height: player.height
              }}
            >
              <div className="text-white text-center text-xl leading-9">🚀</div>
            </div>

            {/* Objects */}
            {objects.map(obj => (
              <div
                key={obj.id}
                className="absolute text-2xl transition-all duration-75"
                style={{
                  left: obj.x,
                  top: obj.y,
                  width: 30,
                  height: 30
                }}
              >
                {obj.type === 'coin' && (obj.value === 50 ? '🏆' : '🪙')}
                {obj.type === 'obstacle' && '💀'}
                {obj.type === 'powerup' && '⭐'}
              </div>
            ))}
          </div>

          {/* Controls hint */}
          <div className="text-sm text-gray-600 text-center">
            Use ← → arrow keys or A/D to move
          </div>

          {/* Mobile controls */}
          <div className="flex gap-4 md:hidden">
            <button
              onTouchStart={() => movePlayer('left')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              ← Left
            </button>
            <button
              onTouchStart={() => movePlayer('right')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              Right →
            </button>
          </div>
        </div>
      )}

      {gameState === 'complete' && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">
            {score >= 300 ? '🏆' : score >= 150 ? '🎉' : '👍'}
          </div>
          <h4 className="text-xl font-semibold">
            {score >= 300 ? 'Amazing!' : score >= 150 ? 'Well Done!' : 'Good Try!'}
          </h4>
          <p className="text-gray-600">
            Final Score: {score} points with {lives} lives remaining!
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">
              Game Complete! Calculating your DULP reward...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};