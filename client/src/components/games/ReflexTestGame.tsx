import { useState, useEffect } from 'react';
import { Coins, Zap, Target, Clock } from 'lucide-react';

interface ReflexTestGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

interface ReactionTest {
  id: number;
  startTime: number;
  reactionTime: number | null;
  isActive: boolean;
}

export const ReflexTestGame: React.FC<ReflexTestGameProps> = ({ onComplete, reward }) => {
  const [gameState, setGameState] = useState<'ready' | 'waiting' | 'active' | 'result' | 'complete'>('ready');
  const [currentTest, setCurrentTest] = useState<ReactionTest | null>(null);
  const [completedTests, setCompletedTests] = useState<ReactionTest[]>([]);
  const [testNumber, setTestNumber] = useState(1);
  const [waitTimeout, setWaitTimeout] = useState<NodeJS.Timeout | null>(null);
  const totalTests = 5;

  useEffect(() => {
    return () => {
      if (waitTimeout) clearTimeout(waitTimeout);
    };
  }, [waitTimeout]);

  const startTest = () => {
    setGameState('waiting');
    
    // Random delay between 2-6 seconds before showing target
    const delay = Math.random() * 4000 + 2000;
    
    const timeout = setTimeout(() => {
      const test: ReactionTest = {
        id: testNumber,
        startTime: Date.now(),
        reactionTime: null,
        isActive: true
      };
      setCurrentTest(test);
      setGameState('active');
    }, delay);
    
    setWaitTimeout(timeout);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Too early - clicked before target appeared
      setGameState('result');
      const failedTest: ReactionTest = {
        id: testNumber,
        startTime: 0,
        reactionTime: 9999, // Penalty time
        isActive: false
      };
      setCurrentTest(failedTest);
      if (waitTimeout) clearTimeout(waitTimeout);
      
      setTimeout(() => {
        setCompletedTests(prev => [...prev, failedTest]);
        nextTest();
      }, 2000);
    } else if (gameState === 'active' && currentTest) {
      // Good reaction
      const reactionTime = Date.now() - currentTest.startTime;
      const updatedTest = { ...currentTest, reactionTime, isActive: false };
      setCurrentTest(updatedTest);
      setGameState('result');
      
      setTimeout(() => {
        setCompletedTests(prev => [...prev, updatedTest]);
        nextTest();
      }, 2000);
    }
  };

  const nextTest = () => {
    if (testNumber >= totalTests) {
      completeGame();
    } else {
      setTestNumber(prev => prev + 1);
      setCurrentTest(null);
      setGameState('ready');
    }
  };

  const completeGame = () => {
    setGameState('complete');
    
    // Calculate score based on reaction times
    const validTests = completedTests.filter(test => test.reactionTime && test.reactionTime < 9999);
    const averageTime = validTests.length > 0 
      ? validTests.reduce((sum, test) => sum + (test.reactionTime || 0), 0) / validTests.length
      : 9999;
    
    // Score calculation: faster reactions = higher score
    let score = 0;
    if (averageTime < 300) score = reward * 1.5; // Excellent
    else if (averageTime < 500) score = reward * 1.2; // Good
    else if (averageTime < 800) score = reward; // Average
    else score = reward * 0.5; // Below average
    
    // Bonus for completing all tests
    const completionBonus = validTests.length * 10;
    const finalScore = Math.floor(score + completionBonus);
    
    onComplete(Math.max(finalScore, Math.floor(reward * 0.2)));
  };

  const getReactionColor = (time: number | null) => {
    if (!time || time >= 9999) return 'text-red-600';
    if (time < 300) return 'text-green-600';
    if (time < 500) return 'text-blue-600';
    if (time < 800) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getReactionRating = (time: number | null) => {
    if (!time || time >= 9999) return 'Too Early!';
    if (time < 300) return 'Excellent!';
    if (time < 500) return 'Good!';
    if (time < 800) return 'Average';
    return 'Slow';
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Reflex Test</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Test: {testNumber}/{totalTests}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-gray-900 rounded-2xl p-8 mb-6 min-h-[300px] flex items-center justify-center relative">
        {gameState === 'ready' && (
          <div className="text-center">
            <Target className="h-16 w-16 text-white mx-auto mb-4" />
            <p className="text-white text-lg mb-4">Test {testNumber} of {totalTests}</p>
            <p className="text-gray-300 mb-6">Click the button when it appears. Don't click too early!</p>
            <button
              onClick={startTest}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Test
            </button>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-lg">Wait for it...</p>
            <p className="text-gray-300">Don't click yet!</p>
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={handleClick}
            />
          </div>
        )}

        {gameState === 'active' && (
          <div className="text-center">
            <button
              onClick={handleClick}
              className="bg-red-600 hover:bg-red-700 text-white w-32 h-32 rounded-full text-2xl font-bold animate-pulse shadow-lg transform hover:scale-105 transition-all"
            >
              CLICK!
            </button>
          </div>
        )}

        {gameState === 'result' && currentTest && (
          <div className="text-center">
            <Zap className={`h-16 w-16 mx-auto mb-4 ${getReactionColor(currentTest.reactionTime)}`} />
            <p className="text-white text-xl mb-2">
              {currentTest.reactionTime && currentTest.reactionTime < 9999 
                ? `${currentTest.reactionTime}ms` 
                : 'Too Early!'}
            </p>
            <p className={`text-lg font-bold ${getReactionColor(currentTest.reactionTime)}`}>
              {getReactionRating(currentTest.reactionTime)}
            </p>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <Target className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-white text-xl mb-4">Test Complete!</p>
            <div className="text-gray-300">
              {completedTests.filter(test => test.reactionTime && test.reactionTime < 9999).length > 0 && (
                <p>
                  Average: {Math.round(
                    completedTests
                      .filter(test => test.reactionTime && test.reactionTime < 9999)
                      .reduce((sum, test) => sum + (test.reactionTime || 0), 0) / 
                    completedTests.filter(test => test.reactionTime && test.reactionTime < 9999).length
                  )}ms
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      {completedTests.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold mb-3">Test Results</h4>
          <div className="space-y-2">
            {completedTests.map((test) => (
              <div key={test.id} className="flex justify-between items-center bg-white rounded p-2">
                <span className="font-medium">Test {test.id}</span>
                <span className={`font-bold ${getReactionColor(test.reactionTime)}`}>
                  {test.reactionTime && test.reactionTime < 9999 
                    ? `${test.reactionTime}ms` 
                    : 'Too Early'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 bg-blue-50 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-2">How to Play:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Wait for the red button to appear</li>
          <li>• Click it as fast as possible</li>
          <li>• Don't click too early or you'll be penalized</li>
          <li>• Faster reactions = higher rewards</li>
        </ul>
      </div>
    </div>
  );
};