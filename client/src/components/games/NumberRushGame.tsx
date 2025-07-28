import { useState, useEffect } from 'react';
import { Coins, Zap } from 'lucide-react';

interface NumberRushGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

export const NumberRushGame: React.FC<NumberRushGameProps> = ({ onComplete, reward }) => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const generateProblem = (): Problem => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    const question = `${num1} ${operation} ${num2}`;
    
    // Generate wrong options
    const wrongOptions: number[] = [];
    while (wrongOptions.length < 3) {
      const wrong: number = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== answer && wrong > 0 && !wrongOptions.includes(wrong)) {
        wrongOptions.push(wrong);
      }
    }
    
    const options = [answer, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    return { question, answer, options };
  };

  // Initialize first problem
  useEffect(() => {
    setCurrentProblem(generateProblem());
  }, []);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      endGame();
    }
  }, [gameStarted, timeLeft, gameComplete]);

  const endGame = () => {
    setGameComplete(true);
    const streakBonus = streak * 5;
    const timeBonus = Math.floor(timeLeft / 10) * 2;
    const finalScore = Math.floor(reward * (score / 10)) + streakBonus + timeBonus;
    onComplete(Math.max(finalScore, Math.floor(reward * 0.3))); // Minimum 30% of reward
  };

  const handleAnswer = (selectedOption: number) => {
    if (!gameStarted) setGameStarted(true);
    if (showResult) return;

    setSelectedAnswer(selectedOption);
    const correct = selectedOption === currentProblem?.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      setCurrentProblem(generateProblem());
    }, 1500);
  };

  if (!currentProblem) return null;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Number Rush</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Time: {timeLeft}s</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Score: {score}</span>
            {streak > 2 && (
              <>
                <span className="mx-2">|</span>
                <span className="font-medium text-orange-600 flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Streak: {streak}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-6xl font-bold mb-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
          {currentProblem.question} = ?
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {currentProblem.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              className={`
                py-4 px-6 text-2xl font-bold rounded-lg transition-all duration-200
                ${showResult && selectedAnswer === option
                  ? isCorrect 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                  : showResult && option === currentProblem.answer
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }
                ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showResult && (
        <div className={`text-center p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <p className="font-medium">
            {isCorrect ? 'Correct!' : `Wrong! The answer was ${currentProblem.answer}`}
          </p>
          {isCorrect && streak > 2 && (
            <p className="text-sm">Streak bonus: +{streak * 5} points!</p>
          )}
        </div>
      )}

      {gameComplete && (
        <div className="mt-6 text-center bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-medium">Game Complete!</p>
          <p className="text-sm">
            You answered {score} questions correctly with a best streak of {streak}!
          </p>
        </div>
      )}
    </div>
  );
};