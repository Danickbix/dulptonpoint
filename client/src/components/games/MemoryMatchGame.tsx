import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { useGameComplete } from '../../hooks/useGameComplete';

interface MemoryMatchGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🎯', '🎮', '💎', '🏆', '⭐', '🎪', '🎨', '🎭'];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onComplete, reward }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const gameCompleteMutation = useGameComplete();

  // Initialize game
  useEffect(() => {
    const gameEmojis = emojis.slice(0, 6); // Use 6 pairs
    const shuffledCards = [...gameEmojis, ...gameEmojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffledCards);
  }, []);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      // Time's up
      const score = Math.max(0, Math.floor(reward * (matchedPairs / 6)));
      const timeCompleted = startTime ? Math.floor((Date.now() - startTime) / 1000) : 60;
      
      gameCompleteMutation.mutate({
        gameId: 'memory-match',
        score,
        timeCompleted,
        difficulty: 'medium',
        metadata: { pairs: matchedPairs, moves, totalPairs: 6 }
      });
      
      onComplete(score);
      setGameComplete(true);
    }
  }, [gameStarted, timeLeft, gameComplete, matchedPairs, reward, onComplete]);

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      setTimeout(() => {
        if (firstCard.value === secondCard.value) {
          // Match found
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          
          // Check if game complete
          if (matchedPairs + 1 === 6) {
            const timeBonus = Math.floor(timeLeft / 10) * 5;
            const moveBonus = Math.max(0, (20 - moves) * 2);
            const finalScore = reward + timeBonus + moveBonus;
            const timeCompleted = startTime ? Math.floor((Date.now() - startTime) / 1000) : 60;
            
            gameCompleteMutation.mutate({
              gameId: 'memory-match',
              score: finalScore,
              timeCompleted,
              difficulty: 'medium',
              metadata: { pairs: matchedPairs + 1, moves, totalPairs: 6, timeBonus, moveBonus }
            });
            
            onComplete(finalScore);
            setGameComplete(true);
          }
        } else {
          // No match, flip back
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
        }
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards, cards, matchedPairs, moves, timeLeft, reward, onComplete]);

  const flipCard = (id: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }
    
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    setCards(prev => prev.map(card =>
      card.id === id ? { ...card, isFlipped: true } : card
    ));

    setFlippedCards(prev => [...prev, id]);
    
    if (flippedCards.length === 1) {
      setMoves(prev => prev + 1);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Memory Match</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Time: {timeLeft}s</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Moves: {moves}</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Pairs: {matchedPairs}/6</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={`
              aspect-square rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-3xl font-bold
              ${card.isFlipped || card.isMatched 
                ? 'bg-white border-2 border-blue-300 shadow-lg transform scale-105' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md'
              }
              ${card.isMatched ? 'border-green-400 bg-green-50' : ''}
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.value : '?'}
          </div>
        ))}
      </div>

      {gameComplete && (
        <div className="mt-6 text-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-medium">
            {matchedPairs === 6 ? 'Perfect Game!' : 'Time\'s Up!'}
          </p>
          <p className="text-sm">
            You earned bonus points for speed and efficiency!
          </p>
        </div>
      )}
    </div>
  );
};