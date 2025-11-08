'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ResultsModal } from './modals/resultsModal';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

interface GameDashboardProps {
    isVisible: boolean;
    onRestart: () => void;
}

type ColorSet = {
    base: string;
    different: string;
    name: string;
};

type ColorMistake = {
    color: string;
    count: number;
};

const COLORS_BY_LEVEL: ColorSet[] = [
    { base: 'bg-blue-400', different: 'bg-blue-300', name: 'blue' },
    { base: 'bg-yellow-400', different: 'bg-yellow-300', name: 'yellow' },
    { base: 'bg-green-400', different: 'bg-green-300', name: 'green' },
    { base: 'bg-purple-400', different: 'bg-purple-300', name: 'purple' },
    { base: 'bg-red-400', different: 'bg-red-300', name: 'red' },
];

const GRID_SIZES = [2, 4, 8, 12];
const ROUNDS_PER_LEVEL = 5;
const MAX_MISTAKES = 5;

export function GameDashboard({ isVisible, onRestart }: GameDashboardProps) {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [roundsCompleted, setRoundsCompleted] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [differentColorIndex, setDifferentColorIndex] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [currentColorSet, setCurrentColorSet] = useState(0);
    const [difficulty, setDifficulty] = useState(1);
    const [timer, setTimer] = useState(3);
    const [isSelectable, setIsSelectable] = useState(false);
    const [colorMistakes, setColorMistakes] = useState<ColorMistake[]>([]);
    const [timerBorder, setTimerBorder] = useState(100);
    const [currentGridSize, setCurrentGridSize] = useState(GRID_SIZES[0]);
    const [timerKey, setTimerKey] = useState(0);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const getGridSize = useCallback((level: number) => {
        if (level < 5) {
            return GRID_SIZES[Math.min(level, GRID_SIZES.length - 1)];
        }
        const randomIndex = Math.floor(Math.random() * GRID_SIZES.length);
        return GRID_SIZES[randomIndex];
    }, []);

    const totalCells = currentGridSize * currentGridSize;

    const startNewRound = useCallback(() => {
        if (gameOver) return;
        
        const level = Math.floor(currentLevel / ROUNDS_PER_LEVEL);
        const newGridSize = getGridSize(level);
        setCurrentGridSize(newGridSize);
        const newTotalCells = newGridSize * newGridSize;
        
        setTimer(3);
        setTimerBorder(100);
        setIsSelectable(true);
        setTimerKey(prev => prev + 1); // Increment timer key to force remount
        setDifferentColorIndex(Math.floor(Math.random() * newTotalCells));
        setCurrentColorSet((prev) => (prev + 1) % COLORS_BY_LEVEL.length);
        
        if (roundsCompleted > 0 && roundsCompleted % 3 === 0) {
            setDifficulty((prev) => Math.min(prev + 0.2, 3));
        }
    }, [currentLevel, roundsCompleted, gameOver, getGridSize]);

    const handleSelection = useCallback((index: number) => {
        if (!isSelectable || gameOver) return;
        
        setIsSelectable(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        
        const currentColor = COLORS_BY_LEVEL[currentColorSet].name;
        
        if (index === differentColorIndex) {
            // Correct selection - instantly move to next round
            if (!gameOver) {
                setCurrentLevel(prev => prev + 1);
                setRoundsCompleted(prev => prev + 1);
                startNewRound();
            }
        } else {
            // Incorrect selection - instantly move to next round
            setColorMistakes(prev => {
                const existingIndex = prev.findIndex(m => m.color === currentColor);
                const newMistakes = [...prev];
                
                if (existingIndex >= 0) {
                    newMistakes[existingIndex] = {
                        ...newMistakes[existingIndex],
                        count: newMistakes[existingIndex].count + 1
                    };
                } else {
                    newMistakes.push({ color: currentColor, count: 1 });
                }
                
                setMistakes(prevMistakes => {
                    const newMistakes = prevMistakes + 1;
                    if (newMistakes >= MAX_MISTAKES) {
                        setGameOver(true);
                    }
                    return newMistakes;
                });
                
                return newMistakes;
            });
            
            if (!gameOver) {
                startNewRound();
            }
        }
    }, [isSelectable, gameOver, differentColorIndex, currentColorSet, startNewRound]);

    // Initialize game
    useEffect(() => {
        if (isVisible && !gameOver) {
            startNewRound();
        }
    }, [isVisible, gameOver, startNewRound]);

    // Timer effect
    useEffect(() => {
        if (isSelectable && !gameOver) {
            // Timer is now handled by the CountdownCircleTimer component
        }
        
        return () => {
            // Cleanup if needed
        };
    }, [isSelectable, gameOver]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Render grid cells
    const renderGrid = useCallback(() => {
        if (!gridRef.current) return null;
        
        const cells = [];
        const currentColor = COLORS_BY_LEVEL[currentColorSet];
        
        for (let i = 0; i < totalCells; i++) {
            const isDifferent = i === differentColorIndex;
            const cellClass = `w-full h-full rounded-full ${
                isDifferent ? currentColor.different : currentColor.base
            } ${isSelectable ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`;
            
            cells.push(
                <div
                    key={i}
                    className={cellClass}
                    onClick={() => handleSelection(i)}
                />
            );
        }
        
        return cells;
    }, [totalCells, currentColorSet, differentColorIndex, isSelectable, handleSelection]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-[#e4e7ff] font-sans">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                {/* Stats bar */}
                <div className="w-full max-w-2xl flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold text-black">
                        Level: {Math.floor(currentLevel / ROUNDS_PER_LEVEL) + 1}
                    </div>
                    <div className="text-lg font-semibold text-black">
                        Rounds: {roundsCompleted}
                    </div>
                    <div className="text-lg font-semibold text-black">
                        Mistakes: {mistakes}/{MAX_MISTAKES}
                    </div>
                </div>
                
                {/* Timer Circle */}
                <div className="mb-8">
                    <CountdownCircleTimer
                        key={timerKey}
                        isPlaying={isSelectable && !gameOver}
                        duration={3} // 3 seconds
                        colors={['#004777', '#004777', '#004777']}
                        colorsTime={[2, 1, 0]}
                        size={120}
                        strokeWidth={8}
                        trailColor="#e0e0e0"
                        onComplete={() => {
                          if (!gameOver && isSelectable) {
                            setIsSelectable(false);
                            // Handle timeout - increment mistakes
                            setMistakes(prevMistakes => {
                              const newMistakes = prevMistakes + 1;
                              if (newMistakes >= MAX_MISTAKES) {
                                setGameOver(true);
                              }
                              return newMistakes;
                            });
                            // Instantly start next round
                            if (!gameOver) {
                              startNewRound();
                            }
                          }
                          return { shouldRepeat: false };
                        }}
                      >
                        {({ remainingTime }) => (
                          <div className="text-3xl font-bold text-black">
                            {remainingTime}
                          </div>
                        )}
                      </CountdownCircleTimer>
                </div>
                
                {/* Grid */}
                <div 
                    ref={gridRef}
                    className="grid gap-2 mb-8"
                    style={{
                        gridTemplateColumns: `repeat(${currentGridSize}, minmax(0, 1fr))`,
                        width: 'min(80vw, 500px)',
                        aspectRatio: '1/1'
                    }}
                >
                    {renderGrid()}
                </div>
                
                {/* Instructions */}
                {!gameOver && (
                    <h1 className="text-2xl font-light text-black mb-8">
                        Select the color with a different hue
                    </h1>
                )}
                
                {/* Results Modal */}
                <ResultsModal
                    isVisible={gameOver}
                    onRestart={() => {
                        // Reset game state
                        setCurrentLevel(0);
                        setRoundsCompleted(0);
                        setMistakes(0);
                        setCurrentColorSet(0);
                        setDifficulty(1);
                        setColorMistakes([]);
                        setIsSelectable(false);
                        setGameOver(false);
                        setTimerKey(0); // Reset timer key
                        onRestart();
                    }}
                    currentLevel={currentLevel}
                    colorMistakes={colorMistakes}
                    gridSize={currentGridSize}
                />
            </div>
        </div>
    );
}