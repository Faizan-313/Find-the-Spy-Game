import React from "react";
import type { Room, Player } from "../types/index";

interface Props {
    room: Room;
    roleInfo?: { role: string; word: string } | null;
    resultData: any;
    isHost: boolean;
    currentPlayerId?: string;
    onNextRound: () => void;
    onEndGame: () => void;
}

export default function ResultsView({ room, roleInfo, resultData, isHost, currentPlayerId, onNextRound, onEndGame }: Props) {
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

    const getResultColor = () => {
        if (spyCaught) {
            return isCurrentPlayerSpy ? "from-red-600 to-red-800" : "from-emerald-600 to-emerald-800";
        } else {
            return isCurrentPlayerSpy ? "from-purple-600 to-purple-800" : "from-red-600 to-red-800";
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
        <div className="space-y-6">
            <div className={`bg-linear-to-r ${getResultColor()} rounded-lg p-8 shadow-2xl text-center`}>
                <div className="text-5xl font-black mb-4">{getResultTitle()}</div>
                <div className="text-xl opacity-90 mb-4">{getResultMessage()}</div>
                {roleInfo && (
                    <div className="flex justify-center gap-8 mt-6">
                        <div className="bg-black/30 px-6 py-3 rounded-lg">
                            <div className="text-xs opacity-75">Your Role</div>
                            <div className="text-2xl font-bold">{roleInfo.role.toUpperCase()}</div>
                        </div>
                        <div className="bg-black/30 px-6 py-3 rounded-lg">
                            <div className="text-xs opacity-75">Secret Word</div>
                            <div className="text-6xl font-black">{roleInfo.word}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">🗳️</span> Vote Breakdown
                    </h3>
                    <div className="space-y-3">
                        {room.players.map((suspect) => {
                            const voters = room.players.filter((p) => p.vote === suspect.username);
                            const isMostVoted = suspect.username === getMostVoted();
                            return (
                                <div
                                    key={suspect.socketId}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        isMostVoted
                                            ? "bg-amber-900/40 border-amber-500 shadow-lg"
                                            : "bg-slate-700 border-slate-600"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">
                                                {suspect.username === spyUsername ? "🕵️" : "👤"}
                                            </span>
                                            <div>
                                                <div className="font-semibold">{suspect.username}</div>
                                                {suspect.username === spyUsername && (
                                                    <div className="text-xs text-amber-300">The Spy</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-amber-400">{voters.length}</div>
                                            <div className="text-xs opacity-75">vote{voters.length !== 1 ? "s" : ""}</div>
                                        </div>
                                    </div>
                                    {voters.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {voters.map((v) => (
                                                <span
                                                    key={v.socketId}
                                                    className="text-xs bg-slate-600 px-2 py-1 rounded"
                                                >
                                                    {v.username}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-6 shadow-lg space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-2xl">📊</span> Final Scores
                    </h3>
                    <div className="space-y-3">
                        {room.players.map((player) => (
                            <div key={player.socketId} className="bg-slate-700 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{player.username}</div>
                                        <div className="text-xs opacity-75">
                                            {player.username === spyUsername ? "🕵️ Spy" : "👤 Player"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-emerald-400">{player.score}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isHost && (
                <div className="flex gap-3 justify-center pt-4">
                    <button
                        onClick={onNextRound}
                        className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-lg font-semibold text-white transition-colors shadow-lg"
                    >
                        Next Round
                    </button>
                    <button
                        onClick={onEndGame}
                        className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-lg font-semibold text-white transition-colors shadow-lg"
                    >
                        End Game
                    </button>
                </div>
            )}
        </div>
    );
}
