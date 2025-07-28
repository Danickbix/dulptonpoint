import { useState, useEffect } from 'react';
import { Coins, Star } from 'lucide-react';

interface ColorMatchGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

const colors = [
  { name: 'Red', value: '#EF4444', light: '#FEF2F2' },
  { name: 'Blue', value: '#3B82F6', light: '#EFF6FF' },
  { name: 'Green', value: '#10B981', light: '#F0FDF4' },
  { name: 'Yellow', value: '#F59E0B', light: '#FFFBEB' },
  { name: 'Purple', value: '#8B5CF6', light: '#F5F3FF' },
  { name: 'Pink', value: '#EC4899', light: '#FDF2F8' },
];

export const ColorMatchGame: React.FC<ColorMatchGameProps> = ({ onComplete, reward }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState<number | null>(null);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [gamePhase, setGamePhase] = useState<'start' | 'showing' | 'playing' | 'complete'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const generateSequence = (length: number): number[] => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * colors.length));
    }
    return newSequence;
  };

  const startNewLevel = () => {
    const newSequence = generateSequence(level + 2); // Start with 3 colors, increase each level
    setSequence(newSequence);
    setPlayerSequence([]);
    setGamePhase('showing');
    showSequence(newSequence);
  };

  const showSequence = (seq: number[]) => {
    setIsDisplaying(true);
    let index = 0;
    
    const showNext = () => {
      if (index < seq.length) {
        setCurrentDisplay(seq[index]);
        setTimeout(() => {
          setCurrentDisplay(null);
          setTimeout(() => {
            index++;
            showNext();
          }, 300);
        }, 600);
      } else {
        setIsDisplaying(false);
        setGamePhase('playing');
      }
    };
    
    setTimeout(showNext, 1000);
  };

  const handleColorClick = (colorIndex: number) => {
    if (gamePhase !== 'playing' || isDisplaying) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    // Check if the player's sequence matches so far
    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      // Wrong color - game over
      endGame();
      return;
    }

    // Check if player completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      // Level complete!
      const levelScore = level * 10;
      setScore(prev => prev + levelScore);
      
      if (level >= 5) {
        // Game complete after 5 levels
        endGame(true);
      } else {
        setLevel(prev => prev + 1);
        setTimeout(() => {
          startNewLevel();
        }, 1500);
      }
    }
  };

  const endGame = (success = false) => {
    setGameComplete(true);
    setGamePhase('complete');
    
    const baseScore = success ? reward : Math.floor(reward * (score / 50));
    const finalScore = Math.max(baseScore, Math.floor(reward * 0.2)); // Minimum 20% of reward
    
    setTimeout(() => {
      onComplete(finalScore);
    }, 2000);
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setGameComplete(false);
    startNewLevel();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Color Match</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Level: {level}</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Score: {score}</span>
          </div>
        </div>
      </div>

      {gamePhase === 'start' && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎨</div>
          <h4 className="text-xl font-semibold">Welcome to Color Match!</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Watch the color sequence carefully, then repeat it by clicking the colors in the same order. 
            Complete 5 levels to win the full reward!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium"
          >
            Start Game
          </button>
        </div>
      )}

      {gamePhase === 'showing' && (
        <div className="text-center space-y-4">
          <h4 className="text-lg font-semibold">Watch the sequence...</h4>
          <p className="text-gray-600">Level {level} - Remember {sequence.length} colors</p>
        </div>
      )}

      {gamePhase === 'playing' && (
        <div className="text-center space-y-4">
          <h4 className="text-lg font-semibold">Repeat the sequence!</h4>
          <p className="text-gray-600">
            Progress: {playerSequence.length} / {sequence.length}
          </p>
        </div>
      )}

      {(gamePhase === 'showing' || gamePhase === 'playing') && (
        <div className="grid grid-cols-3 gap-4 mt-8">
          {colors.map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorClick(index)}
              disabled={gamePhase !== 'playing'}
              className={`
                aspect-square rounded-xl transition-all duration-200 border-4 flex items-center justify-center font-bold text-white
                ${currentDisplay === index 
                  ? 'scale-110 border-white shadow-2xl' 
                  : 'border-gray-300 hover:scale-105'
                }
                ${gamePhase === 'playing' ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              style={{ 
                backgroundColor: currentDisplay === index ? color.value : color.light,
                color: currentDisplay === index ? 'white' : color.value
              }}
            >
              {color.name}
            </button>
          ))}
        </div>
      )}

      {gamePhase === 'complete' && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">
            {score >= 30 ? '🏆' : score >= 15 ? '🎉' : '😊'}
          </div>
          <h4 className="text-xl font-semibold">
            {score >= 30 ? 'Perfect Game!' : score >= 15 ? 'Great Job!' : 'Good Try!'}
          </h4>
          <p className="text-gray-600">
            You completed {level - 1} levels and scored {score} points!
          </p>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium">
              Game Complete! Calculating your DULP reward...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};