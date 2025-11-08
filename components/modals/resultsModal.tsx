interface ResultsModalProps {
    isVisible: boolean;
    onRestart: () => void;
    currentLevel: number;
    colorMistakes: Array<{ color: string; count: number }>;
    gridSize: number;
}

export function ResultsModal({ isVisible, onRestart, currentLevel, colorMistakes, gridSize }: ResultsModalProps) {
    if (!isVisible) return null;

    // Enhanced analysis based on performance
    const getPerformanceAnalysis = () => {
        if (colorMistakes.length === 0) return "Great job! You didn't make any mistakes.";
        
        const totalMistakes = colorMistakes.reduce((sum, mistake) => sum + mistake.count, 0);
        const totalRounds = currentLevel;
        
        // Calculate accuracy percentage
        const accuracy = Math.round(((totalRounds - totalMistakes) / totalRounds) * 100);
        
        // Determine performance level
        let performanceLevel = "";
        if (accuracy >= 90) {
            performanceLevel = "Excellent! You have very good color discrimination.";
        } else if (accuracy >= 75) {
            performanceLevel = "Good! You have solid color discrimination skills.";
        } else if (accuracy >= 60) {
            performanceLevel = "Fair. You might have some difficulty with certain colors.";
        } else {
            performanceLevel = "You may have significant challenges with color discrimination.";
        }
        
        // Analyze specific color difficulties
        const sortedMistakes = [...colorMistakes].sort((a, b) => b.count - a.count);
        let colorAnalysis = "";
        
        if (sortedMistakes.length > 0) {
            const topColor = sortedMistakes[0];
            const percentage = Math.round((topColor.count / totalMistakes) * 100);
            
            if (percentage >= 30) {
                colorAnalysis = `You struggled significantly with ${topColor.color} (${percentage}% of mistakes).`;
            } else if (percentage >= 15) {
                colorAnalysis = `You had difficulty with ${topColor.color} (${percentage}% of mistakes).`;
            } else {
                colorAnalysis = `You had some trouble with ${topColor.color}.`;
            }
        }
        
        return `${performanceLevel} ${colorAnalysis}`;
    };

    const performanceMessage = getPerformanceAnalysis();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Game Over!</h1>
                <p className="text-lg mb-6 text-green-500 font-bold underline">You completed {currentLevel} rounds!</p>

                {colorMistakes.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-black/80">Performance Analysis:</h2>
                        <p className="text-sm text-gray-600 mb-4">{performanceMessage}</p>
                        
                        {/* <div className="mt-4">
                            <h3 className="font-medium mb-2">Mistakes by Color:</h3>
                            <div className="flex flex-col gap-2">
                                {colorMistakes.map(mistake => (
                                    <div key={mistake.color} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 shadow-sm">
                                        <span className="capitalize">{mistake.color}</span>
                                        <span className="text-red-500">{mistake.count} mistakes</span>
                                    </div>
                                ))}
                            </div>
                        </div> */}
                    </div>
                )}

                <button
                    onClick={onRestart}
                    className="w-full px-4 py-3 border border-black/10 text-white bg-blue-500 rounded hover:bg-blue-600 transition-all mb-4 cursor-pointer transition-all ease-in-out hover:font-semibold hover:underline"
                >
                    Play Again
                </button>

                <p className="text-xs text-black/40 text-center">
                    Note: This game does not determine if you're color blind, but it can help identify which colors you might have difficulty distinguishing.
                </p>
            </div>
        </div>
    );
}