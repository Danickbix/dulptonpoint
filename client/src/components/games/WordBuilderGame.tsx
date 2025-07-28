import { useState, useEffect } from 'react';
import { Coins, Type, Check, X } from 'lucide-react';

interface WordBuilderGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

const wordList = [
  'REACT', 'JAVASCRIPT', 'CODING', 'DEVELOPMENT', 'COMPUTER', 'PROGRAM', 'WEBSITE', 'MOBILE',
  'DESIGN', 'CREATIVE', 'DIGITAL', 'INNOVATION', 'TECHNOLOGY', 'SOFTWARE', 'NETWORK', 'DATABASE'
];

const getRandomLetters = (word: string, extraCount: number = 4) => {
  const wordLetters = word.split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const extraLetters = [];
  
  for (let i = 0; i < extraCount; i++) {
    extraLetters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  
  return [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5);
};

export const WordBuilderGame: React.FC<WordBuilderGameProps> = ({ onComplete, reward }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [wordsFound, setWordsFound] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Initialize game
  useEffect(() => {
    if (currentRound < wordList.length) {
      const word = wordList[currentRound];
      setCurrentWord(word);
      setAvailableLetters(getRandomLetters(word));
      setSelectedLetters([]);
    }
  }, [currentRound]);

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
    const timeBonus = Math.floor(timeLeft / 10) * 2;
    const wordBonus = wordsFound.length * 20;
    const finalScore = Math.floor(reward * (wordsFound.length / Math.min(5, wordList.length))) + timeBonus + wordBonus;
    onComplete(Math.max(finalScore, Math.floor(reward * 0.3)));
  };

  const selectLetter = (letter: string, index: number) => {
    if (!gameStarted) setGameStarted(true);
    
    setSelectedLetters(prev => [...prev, letter]);
    setAvailableLetters(prev => prev.filter((_, i) => i !== index));
  };

  const deselectLetter = (index: number) => {
    const letter = selectedLetters[index];
    setAvailableLetters(prev => [...prev, letter]);
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
  };

  const submitWord = () => {
    const formedWord = selectedLetters.join('');
    
    if (formedWord === currentWord) {
      setWordsFound(prev => [...prev, formedWord]);
      setShowFeedback('correct');
      
      setTimeout(() => {
        setShowFeedback(null);
        if (currentRound + 1 < Math.min(5, wordList.length)) {
          setCurrentRound(prev => prev + 1);
        } else {
          endGame();
        }
      }, 1500);
    } else {
      setShowFeedback('wrong');
      setTimeout(() => {
        setShowFeedback(null);
        // Return letters to available pool
        setAvailableLetters(prev => [...prev, ...selectedLetters]);
        setSelectedLetters([]);
      }, 1500);
    }
  };

  const clearSelection = () => {
    setAvailableLetters(prev => [...prev, ...selectedLetters]);
    setSelectedLetters([]);
  };

  const getHint = () => {
    if (selectedLetters.length < currentWord.length) {
      const nextLetter = currentWord[selectedLetters.length];
      const letterIndex = availableLetters.findIndex(letter => letter === nextLetter);
      if (letterIndex !== -1) {
        selectLetter(nextLetter, letterIndex);
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Word Builder</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Time: {timeLeft}s</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Round: {currentRound + 1}/5</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Found: {wordsFound.length}</span>
          </div>
        </div>
      </div>

      {/* Word Length Hint */}
      <div className="mb-4 text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">
          Build this word: <span className="font-bold">{currentWord.length} letters</span>
        </p>
        <div className="flex justify-center gap-1">
          {Array.from({ length: currentWord.length }).map((_, index) => (
            <div key={index} className="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center">
              {selectedLetters[index] ? (
                <span className="font-bold text-blue-600">{selectedLetters[index]}</span>
              ) : (
                <span className="text-gray-400">_</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Letters */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Your Word:</h4>
        <div className="bg-blue-50 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
          {selectedLetters.length > 0 ? (
            <div className="flex gap-2">
              {selectedLetters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => deselectLetter(index)}
                  className="bg-blue-600 text-white w-10 h-10 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  {letter}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Select letters to build your word</p>
          )}
        </div>
      </div>

      {/* Available Letters */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Available Letters:</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {availableLetters.map((letter, index) => (
              <button
                key={index}
                onClick={() => selectLetter(letter, index)}
                className="bg-white border-2 border-gray-300 hover:border-blue-500 w-10 h-10 rounded-lg font-bold transition-colors hover:bg-blue-50"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={submitWord}
          disabled={selectedLetters.length !== currentWord.length || showFeedback !== null}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Submit Word
        </button>
        <button
          onClick={clearSelection}
          disabled={selectedLetters.length === 0 || showFeedback !== null}
          className="bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
        <button
          onClick={getHint}
          disabled={selectedLetters.length >= currentWord.length || showFeedback !== null}
          className="bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Hint
        </button>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`text-center p-4 rounded-lg mb-4 ${
          showFeedback === 'correct' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {showFeedback === 'correct' ? (
              <>
                <Check className="h-6 w-6" />
                <span className="font-bold">Correct! Well done!</span>
              </>
            ) : (
              <>
                <X className="h-6 w-6" />
                <span className="font-bold">Incorrect! Try again.</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Words Found */}
      {wordsFound.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-green-800">Words Found:</h4>
          <div className="flex flex-wrap gap-2">
            {wordsFound.map((word, index) => (
              <span key={index} className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};