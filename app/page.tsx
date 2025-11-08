'use client';
import { useState } from 'react';
import { GameDashboard } from "@/components/gameDashboard";
import { ResultsModal } from "@/components/modals/resultsModal";

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e4e7ff] font-sans">
      <div className="flex flex-col items-center justify-center gap-6">
        {!isGameStarted ? (
          <>
            <h1 className="text-6xl font-black text-black uppercase">Are you colorblind?</h1>
            <button 
              onClick={() => setIsGameStarted(true)}
              className="px-4 py-2 border border-black/10 text-white bg-blue-400 rounded hover:scale-120 hover:bg-blue-500 cursor-pointer transition-all ease-in-out"
            >
              Start Game
            </button>
          </>
        ) : (
          <GameDashboard 
            isVisible={true} 
            onRestart={() => {}} // Empty callback since we don't want to change game started state
          />
        )}
      </div>
    </div>
  );
}
