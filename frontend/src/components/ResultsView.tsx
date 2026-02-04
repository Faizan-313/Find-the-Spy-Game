import type { Room } from "../types/index";

interface Props {
    room: Room;
    roleInfo?: { role: string; word: string } | null;
    resultData: any;
    isHost: boolean;
    currentPlayerId?: string;
    onNextRound: () => void;
    onEndGame: () => void;
}

export default function ResultsView({
    room,
    roleInfo,
    resultData,
    isHost,
    onNextRound,
    onEndGame,
    }: Props) {
    if (!resultData) return null;

    const spyUsername = resultData.spyUsername;
    const spyCaught = resultData.spyCaught;
    const isCurrentPlayerSpy = roleInfo?.role === "spy";

    const getResultTitle = () => {
        if (spyCaught) {
        return isCurrentPlayerSpy ? "YOU WERE CAUGHT! 😱" : "SPY ELIMINATED! 🎉";
        } else {
        return isCurrentPlayerSpy ? "YOU ESCAPED! 🕵️" : "SPY ESCAPED! 😢";
        }
    };

    const getResultBackground = () => {
        if (spyCaught) {
        return isCurrentPlayerSpy
            ? "linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #b91c1c 100%)"
            : "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)";
        } else {
        return isCurrentPlayerSpy
            ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)"
            : "linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)";
        }
    };

    const getResultMessage = () => {
        if (spyCaught) {
        if (isCurrentPlayerSpy) {
            return "You were voted out! Better luck next time.";
        } else {
            return "You successfully identified the spy!";
        }
        } else {
        if (isCurrentPlayerSpy) {
            return `You survived the round! The word was "${resultData.spyWord}"`;
        } else {
            return `The spy escaped with the word "${resultData.spyWord}"!`;
        }
        }
    };

    const getMostVoted = () => {
        const votes = resultData.voteCounts || {};
        const maxVotes = Math.max(...Object.values(votes).map((v: any) => v));
        return Object.keys(votes).find((name) => votes[name] === maxVotes);
    };

    return (
        <div className="min-h-screen text-white p-4 md:p-8 overflow-auto" 
            style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
        <div className="relative max-w-5xl mx-auto">
            <div className="mb-6 md:mb-10">
            <div className="relative rounded-2xl p-6 md:p-10 shadow-2xl overflow-hidden"
                style={{ background: getResultBackground() }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-tr-full" />
                
                <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 md:mb-4 text-center tracking-tight drop-shadow-lg"
                    style={{ fontFamily: '"Oswald", "Impact", sans-serif', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    {getResultTitle()}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-center text-white/90 font-medium max-w-2xl mx-auto px-4"
                    style={{ fontFamily: '"Montserrat", sans-serif' }}>
                    {getResultMessage()}
                </p>
                </div>
            </div>
            </div>

            {roleInfo && (
            <div className="mb-6 md:mb-8">
                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 md:p-6 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 transition-all hover:bg-slate-700/70">
                    <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                        Your Role
                    </p>
                    <p className="text-xl sm:text-2xl font-black"
                        style={{ 
                        fontFamily: '"Oswald", sans-serif',
                        background: 'linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                        }}>
                        {roleInfo.role.toUpperCase()}
                    </p>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 transition-all hover:bg-slate-700/70">
                    <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                        Secret Word
                    </p>
                    <p className="text-xl sm:text-2xl font-black"
                        style={{ 
                        fontFamily: '"Oswald", sans-serif',
                        background: 'linear-gradient(90deg, #34d399 0%, #14b8a6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                        }}>
                        {roleInfo.word}
                    </p>
                    </div>
                </div>
                </div>
            </div>
            )}

            <div className="mb-6 md:mb-8">
            <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 md:p-6 lg:p-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
                    style={{ fontFamily: '"Oswald", sans-serif' }}>
                <span className="text-2xl md:text-3xl"></span>
                <span>Vote Breakdown</span>
                </h2>
                
                <div className="space-y-3">
                {room.players.map((suspect) => {
                    const voters = room.players.filter((p) => p.vote === suspect.username);
                    const isMostVoted = suspect.username === getMostVoted();
                    const isSpy = suspect.username === spyUsername;

                    return (
                    <div
                        key={suspect.username}
                        className={`group relative bg-slate-700/40 hover:bg-slate-700/60 border rounded-lg transition-all duration-300 overflow-hidden ${
                        isMostVoted
                            ? "border-amber-500/60 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30"
                            : "border-slate-600/40 hover:border-slate-500/60"
                        }`}
                    >
                        {/* Highlight bar for most voted */}
                        {isMostVoted && (
                        <div className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ background: 'linear-gradient(180deg, #fbbf24 0%, #f97316 100%)' }} />
                        )}

                        <div className="p-3 md:p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <span className="text-xl md:text-2xl shrink-0">
                                {isSpy ? "🕵️" : "👤"}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-base md:text-lg text-white truncate">
                                {suspect.username}
                                </p>
                                {isSpy && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 rounded-full mt-1">
                                    The Spy
                                </span>
                                )}
                            </div>
                            </div>
                            
                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <div className="text-right">
                                <div className="text-xl md:text-2xl font-black text-white">
                                {voters.length}
                                </div>
                                <div className="text-xs text-slate-400 font-medium">
                                vote{voters.length !== 1 ? "s" : ""}
                                </div>
                            </div>
                            {voters.length > 0 && (
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-base md:text-lg shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                                {voters.length}
                                </div>
                            )}
                            </div>
                        </div>

                        {/* Voters list */}
                        {voters.length > 0 && (
                            <div className="pt-3 border-t border-slate-600/40">
                            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                                Voted by:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {voters.map((v) => (
                                <span
                                    key={v.username}
                                    className="inline-flex items-center px-2 md:px-3 py-1 bg-slate-600/40 hover:bg-slate-600/60 text-slate-200 rounded-full text-xs md:text-sm font-medium transition-colors border border-slate-500/30"
                                >
                                    {v.username}
                                </span>
                                ))}
                            </div>
                            </div>
                        )}
                        </div>
                    </div>
                    );
                })}
                </div>
            </div>
            </div>

            <div className="mb-6 md:mb-8">
            <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 md:p-6 lg:p-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3"
                    style={{ fontFamily: '"Oswald", sans-serif' }}>
                <span className="text-2xl md:text-3xl"></span>
                <span>Final Scores</span>
                </h2>
                
                <div className="grid gap-3">
                {room.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, idx) => {
                    const isSpy = player.username === spyUsername;
                    const isLeader = idx === 0;

                    return (
                        <div
                        key={player.username}
                        className={`group relative rounded-lg transition-all duration-300 overflow-hidden ${
                            isLeader
                            ? "border-2 border-amber-500/50"
                            : "border border-slate-600/40 hover:border-slate-500/60"
                        }`}
                        style={{
                            background: isLeader
                            ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.2) 100%)'
                            : 'linear-gradient(90deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%)'
                        }}
                        >
                        {isLeader && (
                            <div className="absolute top-2 left-2">
                            <span className="text-xl md:text-2xl drop-shadow-lg">👑</span>
                            </div>
                        )}

                        <div className="p-3 md:p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                            {isLeader && <div className="w-6 md:w-8" />}
                            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-base md:text-xl shadow-lg shrink-0 ${
                                isLeader 
                                    ? "text-white" 
                                    : "bg-slate-600 text-slate-300"
                                }`}
                                style={isLeader ? { background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' } : {}}>
                                {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                <p className="font-bold text-base md:text-lg text-white truncate">
                                    {player.username}
                                </p>
                                <p className="text-xs md:text-sm text-slate-400 font-medium flex items-center gap-1">
                                    {isSpy ? "🕵️ Spy" : "👤 Player"}
                                </p>
                                </div>
                            </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                            <div className={`text-2xl md:text-3xl font-black ${
                                isLeader ? "text-amber-400" : "text-white"
                            }`}>
                                {player.score}
                            </div>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                points
                            </div>
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
            </div>
            </div>

            {isHost && (
            <div className="w-full max-w-2xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <button
                    onClick={onNextRound}
                    className="w-full text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-emerald-400/30 hover:border-emerald-300/50"
                    style={{ 
                    fontFamily: '"Montserrat", sans-serif',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                    }}
                >
                    Next Round
                </button>
                <button
                    onClick={onEndGame}
                    className="w-full text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-slate-600/50 hover:border-slate-500/70"
                    style={{ 
                    fontFamily: '"Montserrat", sans-serif',
                    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                    }}
                >
                    End Game
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}