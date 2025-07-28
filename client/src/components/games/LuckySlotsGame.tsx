import { useState, useEffect } from 'react';
import { Coins, Dice6, Sparkles } from 'lucide-react';

interface LuckySlotsGameProps {
  onComplete: (score: number) => void;
  reward: number;
}

const symbols = ['🍒', '🍋', '🍊', '🔔', '⭐', '💎', '7️⃣'];
const symbolValues = {
  '🍒': 5,
  '🍋': 10,
  '🍊': 15,
  '🔔': 20,
  '⭐': 50,
  '💎': 100,
  '7️⃣': 250
};

export const LuckySlotsGame: React.FC<LuckySlotsGameProps> = ({ onComplete, reward }) => {
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [spinning, setSpinning] = useState(false);
  const [spins, setSpins] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const maxSpins = 5;

  const spin = () => {
    if (spinning || gameComplete || spins >= maxSpins) return;
    
    setSpinning(true);
    setSpins(prev => prev + 1);

    // Animate spinning
    const spinInterval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Final result
      const finalReels = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      setReels(finalReels);
      setSpinning(false);

      // Calculate winnings
      let winAmount = 0;
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        // Three of a kind
        winAmount = symbolValues[finalReels[0] as keyof typeof symbolValues] * 3;
      } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
        // Two of a kind
        const matchedSymbol = finalReels[0] === finalReels[1] ? finalReels[0] : 
                             finalReels[1] === finalReels[2] ? finalReels[1] : finalReels[0];
        winAmount = symbolValues[matchedSymbol as keyof typeof symbolValues];
      }

      setTotalWin(prev => prev + winAmount);

      if (spins + 1 >= maxSpins) {
        setTimeout(() => {
          setGameComplete(true);
          const finalScore = Math.min(totalWin + winAmount, reward * 2); // Cap at 2x reward
          onComplete(Math.max(finalScore, Math.floor(reward * 0.2))); // Minimum 20% of reward
        }, 1000);
      }
    }, 2000);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Lucky Slots</h3>
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Reward: {reward} DULP</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Spins: {spins}/{maxSpins}</span>
            <span className="mx-2">|</span>
            <span className="font-medium">Won: {totalWin}</span>
          </div>
        </div>
      </div>

      {/* Slot Machine */}
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex justify-center gap-4">
            {reels.map((symbol, index) => (
              <div 
                key={index}
                className={`bg-gray-800 rounded-lg w-20 h-20 flex items-center justify-center text-3xl border-4 border-yellow-400 ${
                  spinning ? 'animate-pulse' : ''
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={spin}
          disabled={spinning || gameComplete || spins >= maxSpins}
          className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all ${
            spinning || gameComplete || spins >= maxSpins
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
          }`}
        >
          {spinning ? (
            <div className="flex items-center justify-center gap-2">
              <Dice6 className="h-5 w-5 animate-spin" />
              Spinning...
            </div>
          ) : gameComplete ? (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              Game Complete!
            </div>
          ) : spins >= maxSpins ? (
            'No Spins Left'
          ) : (
            `SPIN (${maxSpins - spins} left)`
          )}
        </button>
      </div>

      {/* Paytable */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-bold mb-2 text-center">Paytable</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>3x 7️⃣ = 750 pts</div>
          <div>3x 💎 = 300 pts</div>
          <div>3x ⭐ = 150 pts</div>
          <div>3x 🔔 = 60 pts</div>
          <div>3x 🍊 = 45 pts</div>
          <div>3x 🍋 = 30 pts</div>
          <div>3x 🍒 = 15 pts</div>
          <div className="col-span-2 text-center mt-2 text-gray-600">
            2 matching symbols = 1x value
          </div>
        </div>
      </div>
    </div>
  );
};