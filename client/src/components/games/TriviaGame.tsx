import { useState, useEffect } from 'react';
import { Coins, Brain, Clock } from 'lucide-react';

interface TriviaGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const triviaQuestions: Question[] = [
  {
    question: "What does DULP stand for in the context of cryptocurrency?",
    options: ["Digital Universal Loyalty Points", "Decentralized User Ledger Protocol", "Dynamic Utility Layer Platform", "Digital Unified Liquidity Pool"],
    correct: 0,
    category: "Crypto"
  },
  {
    question: "Which programming language is primarily used for smart contracts on Ethereum?",
    options: ["JavaScript", "Python", "Solidity", "Rust"],
    correct: 2,
    category: "Blockchain"
  },
  {
    question: "What is the maximum supply of Bitcoin?",
    options: ["21 million", "100 million", "1 billion", "Unlimited"],
    correct: 0,
    category: "Bitcoin"
  },
  {
    question: "Which consensus mechanism does Ethereum 2.0 use?",
    options: ["Proof of Work", "Proof of Stake", "Delegated Proof of Stake", "Proof of Authority"],
    correct: 1,
    category: "Ethereum"
  },
  {
    question: "What is a DApp?",
    options: ["Decentralized Application", "Digital Asset Protocol", "Dynamic App Platform", "Distributed API"],
    correct: 0,
    category: "DeFi"
  },
  {
    question: "Which year was Bitcoin first released?",
    options: ["2008", "2009", "2010", "2011"],
    correct: 1,
    category: "History"
  },
  {
    question: "What is the process of validating transactions called in blockchain?",
    options: ["Hashing", "Mining", "Staking", "All of the above"],
    correct: 3,
    category: "Blockchain"
  },
  {
    question: "Which company created the Replit development platform?",
    options: ["Google", "Microsoft", "Replit Inc.", "GitHub"],
    correct: 2,
    category: "Technology"
  }
];

export const TriviaGame: React.FC<TriviaGameProps> = ({ onComplete, reward }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Initialize random questions
  useEffect(() => {
    const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 5)); // Use 5 random questions
  }, []);

  // Timer for each question
  useEffect(() => {
    if (gameStarted && !showResult && !gameComplete && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      // Time's up for this question
      handleAnswer(-1); // -1 indicates timeout
    }
  }, [gameStarted, timeLeft, showResult, gameComplete]);

  const handleAnswer = (answerIndex: number) => {
    if (!gameStarted) setGameStarted(true);
    if (showResult || gameComplete) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 5); // Extra points for quick answers
      setScore(prev => prev + 10 + timeBonus);
    }

    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        // Game complete
        endGame();
      } else {
        // Next question
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      }
    }, 2000);
  };

  const endGame = () => {
    setGameComplete(true);
    const percentage = (score / (questions.length * 10)) * 100;
    const finalReward = Math.floor(reward * (percentage / 100)) + Math.floor(score * 2);
    setTimeout(() => onComplete(Math.max(finalReward, Math.floor(reward * 0.2))), 1500);
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
  };

  if (questions.length === 0) {
    return <div className="p-6 text-center">Loading questions...</div>;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Trivia Challenge</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm flex items-center gap-4">
            <span className="font-medium">Question: {currentQuestion + 1}/{questions.length}</span>
            <span className="font-medium">Score: {score}</span>
            {gameStarted && !gameComplete && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-red-500" />
                <span className={`font-medium ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!gameStarted && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🧠</div>
          <h4 className="text-xl font-semibold">Welcome to Trivia Challenge!</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Answer {questions.length} questions about cryptocurrency, blockchain, and technology. 
            You have 30 seconds per question. Quick answers earn bonus points!
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
          >
            Start Challenge
          </button>
        </div>
      )}

      {gameStarted && !gameComplete && currentQ && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">{currentQ.category}</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                {currentQ.question}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`
                  p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium
                  ${showResult && selectedAnswer === index
                    ? index === currentQ.correct
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-red-500 text-white border-red-500'
                    : showResult && index === currentQ.correct
                      ? 'bg-green-500 text-white border-green-500'
                      : showResult
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }
                  ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`text-center p-4 rounded-lg ${
              selectedAnswer === currentQ.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <p className="font-medium">
                {selectedAnswer === currentQ.correct ? 'Correct!' : selectedAnswer === -1 ? 'Time\'s up!' : 'Incorrect!'}
              </p>
              {selectedAnswer === currentQ.correct && timeLeft > 25 && (
                <p className="text-sm">Quick answer bonus: +{Math.floor(timeLeft / 5)} points!</p>
              )}
            </div>
          )}
        </div>
      )}

      {gameComplete && (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">
            {score >= questions.length * 8 ? '🏆' : score >= questions.length * 5 ? '🎉' : '👍'}
          </div>
          <h4 className="text-xl font-semibold">
            {score >= questions.length * 8 ? 'Outstanding!' : score >= questions.length * 5 ? 'Well Done!' : 'Good Effort!'}
          </h4>
          <p className="text-gray-600">
            You scored {score} points out of {questions.length * 10} possible!
          </p>
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium">
              Challenge Complete! Calculating your DULP reward...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};