import React, { useState } from "react";
import { Socket } from "socket.io-client";
import type { Player, Room } from "../types/index";
import ResultsView from "./ResultsView";

interface Props {
    socketRef: React.MutableRefObject<Socket | null>;
    room: Room;
    roleInfo?: { role: string; word: string } | null;
    resultData?: any;
}

export default function RoomView({ socketRef, room, roleInfo, resultData }: Props) {
    const [voteTarget, setVoteTarget] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const isHost = socketRef.current?.id === room.hostId;
    const hostPlayer = room.players.find((p) => p.socketId === room.hostId);

    const copyRoomId = () => {
        navigator.clipboard.writeText(room.roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const startGame = () => {
        socketRef.current?.emit("start-game", { roomId: room.roomId });
    };

    const startVoting = () => {
        socketRef.current?.emit("submit_vote", { roomId: room.roomId });
    };

    const castVote = () => {
        if (!voteTarget) return;
        socketRef.current?.emit("cast-vote", {
            roomId: room.roomId,
            candidateUserName: voteTarget,
        });
        setVoteTarget("");
    };

    const reveal = () => {
        socketRef.current?.emit("reveal_results", { roomId: room.roomId });
    };

    const endRoom = () => {
        socketRef.current?.emit("end-room", { roomId: room.roomId });
    };

    const currentPlayer = room.players.find((p) => p.socketId === socketRef.current?.id);
    const allVoted = room.players.every((p) => p.vote && p.vote.length > 0);
    const notVotedYet = room.players.filter((p) => !p.vote || p.vote.length === 0);
    const hasVoted = !!currentPlayer?.vote;

    const getVoteCount = (playerName: string) => {
        return room.players.filter((p) => p.vote === playerName).length;
    };

    const otherPlayers = room.players.filter((p) => p.socketId !== socketRef.current?.id);

    const startNextRound = () => {
        socketRef.current?.emit("start-game", { roomId: room.roomId });
    };

    if (room.phase === "RESULT" && resultData) {
        return (
            <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
                <div className="relative">
                    <button
                        onClick={() => socketRef.current?.emit("end-room", { roomId: room.roomId })}
                        className="absolute top-4 right-4 md:top-6 md:right-6 px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 border-2 border-red-500/30 hover:border-red-400/50 z-10"
                        style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
                    >
                        Leave Game
                    </button>
                </div>
                <ResultsView
                    room={room}
                    roleInfo={roleInfo}
                    resultData={resultData}
                    isHost={isHost}
                    currentPlayerId={socketRef.current?.id}
                    onNextRound={startNextRound}
                    onEndGame={endRoom}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
            <div className="max-w-6xl mx-auto">
                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 md:p-6 lg:p-8 shadow-2xl">
                    {roleInfo && (
                        <div className="mb-4 md:mb-6 p-4 md:p-5 rounded-xl border shadow-lg"
                             style={{ background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)', borderColor: 'rgba(100, 116, 139, 0.4)' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                                        Your Role
                                    </div>
                                    <div className="text-xl md:text-2xl font-black"
                                         style={{ 
                                             fontFamily: '"Oswald", sans-serif',
                                             background: 'linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)',
                                             WebkitBackgroundClip: 'text',
                                             WebkitTextFillColor: 'transparent',
                                             backgroundClip: 'text'
                                         }}>
                                        {roleInfo.role.toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                                        Secret Word
                                    </div>
                                    <div className="text-xl md:text-2xl font-black"
                                         style={{ 
                                             fontFamily: '"Oswald", sans-serif',
                                             background: 'linear-gradient(90deg, #34d399 0%, #14b8a6 100%)',
                                             WebkitBackgroundClip: 'text',
                                             WebkitTextFillColor: 'transparent',
                                             backgroundClip: 'text'
                                         }}>
                                        {roleInfo.word}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl md:text-2xl font-black truncate"
                                    style={{ fontFamily: '"Oswald", sans-serif' }}>
                                    Room: {room.roomId}
                                </h2>
                                <button
                                    onClick={copyRoomId}
                                    className="shrink-0 text-xs md:text-sm px-3 py-1.5 rounded-lg font-semibold transition-all hover:-translate-y-0.5 border shadow-md"
                                    style={{ 
                                        background: copied ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                                        borderColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(71, 85, 105, 0.3)'
                                    }}
                                >
                                    {copied ? "✓ Copied" : "Copy"}
                                </button>
                            </div>
                            <p className="text-sm md:text-base text-slate-400">
                                Host: <span className="text-white font-semibold">{hostPlayer ? hostPlayer.username : "Unknown"}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {isHost && room.phase === "LOBBY" && (
                                <button
                                    onClick={startGame}
                                    className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-sm md:text-base shadow-lg transition-all hover:-translate-y-0.5 border-2 border-emerald-400/30 hover:border-emerald-300/50"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: '#ffffff'
                                    }}
                                >
                                    Start Game
                                </button>
                            )}
                            {isHost && room.phase === "DISCUSSION" && (
                                <button
                                    onClick={startVoting}
                                    className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-sm md:text-base shadow-lg transition-all hover:-translate-y-0.5 border-2 border-amber-400/30 hover:border-amber-300/50"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: '#ffffff'
                                    }}
                                >
                                    Start Voting
                                </button>
                            )}
                            {isHost && room.phase === "VOTING" && (
                                <button
                                    onClick={reveal}
                                    disabled={!allVoted}
                                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-sm md:text-base shadow-lg transition-all border-2 ${
                                        allVoted 
                                            ? 'hover:-translate-y-0.5 border-indigo-400/30 hover:border-indigo-300/50' 
                                            : 'cursor-not-allowed opacity-60 border-slate-600/30'
                                    }`}
                                    style={{ 
                                        background: allVoted 
                                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                                            : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                                        color: '#ffffff'
                                    }}
                                >
                                    Reveal Results
                                </button>
                            )}
                            {isHost && (
                                <button
                                    onClick={endRoom}
                                    className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg font-bold text-sm md:text-base shadow-lg transition-all hover:-translate-y-0.5 border-2 border-red-500/30 hover:border-red-400/50"
                                    style={{ 
                                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                        color: '#ffffff'
                                    }}
                                >
                                    End Game
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 flex items-center gap-2"
                                style={{ fontFamily: '"Oswald", sans-serif' }}>
                                <span className="text-xl md:text-2xl">👥</span>
                                <span>Players ({room.players.length})</span>
                            </h3>
                            <div className="space-y-2 md:space-y-3">
                                {room.players.map((p: Player) => {
                                    const voteCount = getVoteCount(p.username);
                                    const hasVoted = p.vote && p.vote.length > 0;
                                    
                                    return (
                                        <div
                                            key={p.socketId}
                                            className={`flex items-center justify-between p-3 md:p-4 rounded-lg transition-all border ${
                                                hasVoted 
                                                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
                                                    : 'border-slate-600/40 hover:border-slate-500/60'
                                            }`}
                                            style={{
                                                background: hasVoted
                                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
                                                    : 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%)'
                                            }}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-base md:text-lg flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="truncate">{p.username}</span>
                                                    {room.phase === "VOTING" && voteCount > 0 && (
                                                        <span className="shrink-0 text-xs font-black px-2 py-0.5 rounded-full shadow-lg"
                                                              style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#ffffff' }}>
                                                            {voteCount}
                                                        </span>
                                                    )}
                                                    {p.vote && room.phase !== "RESULT" && (
                                                        <span className="shrink-0 text-xs font-semibold text-emerald-300">
                                                            (✓ Voted)
                                                        </span>
                                                    )}
                                                    {p.vote && room.phase === "RESULT" && (
                                                        <span className="shrink-0 text-xs font-semibold text-amber-300">
                                                            → {p.vote}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs md:text-sm text-slate-400">
                                                    Score: <span className="font-semibold text-white">{p.score}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm md:text-base shrink-0 ml-2">
                                                {room.spyId === p.socketId ? "👁️" : ""}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Not Voted Yet Section */}
                            {room.phase === "VOTING" && isHost && notVotedYet.length > 0 && (
                                <div className="mt-4 p-4 rounded-lg border shadow-lg"
                                     style={{ 
                                         background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(194, 65, 12, 0.15) 100%)',
                                         borderColor: 'rgba(234, 88, 12, 0.4)'
                                     }}>
                                    <div className="font-bold text-sm md:text-base mb-3 flex items-center gap-2"
                                         style={{ fontFamily: '"Oswald", sans-serif' }}>
                                        <span>⏳</span>
                                        <span>Waiting for Votes ({notVotedYet.length})</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {notVotedYet.map((p) => (
                                            <div key={p.socketId} className="text-sm md:text-base flex items-center gap-2 text-orange-200">
                                                <span className="text-orange-400 font-bold">•</span>
                                                <span className="font-medium">{p.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 flex items-center gap-2"
                                style={{ fontFamily: '"Oswald", sans-serif' }}>
                                <span className="text-xl md:text-2xl">⚡</span>
                                <span>Actions</span>
                            </h3>
                            <div className="bg-slate-700/50 backdrop-blur-sm border border-slate-600/40 p-4 md:p-6 rounded-xl shadow-lg">
                                {/* Discussion Phase */}
                                {room.phase === "DISCUSSION" && (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-lg border"
                                             style={{ 
                                                 background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                                 borderColor: 'rgba(59, 130, 246, 0.3)'
                                             }}>
                                            <div className="text-2xl md:text-3xl mb-2">💬</div>
                                            <div className="text-sm md:text-base font-semibold text-blue-200 mb-1">
                                                Discussion Phase
                                            </div>
                                            <div className="text-xs md:text-sm text-blue-300/90">
                                                Discuss with other players. The spy has a different word. Try to find out who the spy is!
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Voting Phase */}
                                {room.phase === "VOTING" && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border mb-4"
                                             style={{ 
                                                 background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)',
                                                 borderColor: 'rgba(168, 85, 247, 0.3)'
                                             }}>
                                            <div className="text-2xl md:text-3xl mb-2">🗳️</div>
                                            <div className="text-sm md:text-base font-semibold text-purple-200 mb-1">
                                                Voting Time
                                            </div>
                                            <div className="text-xs md:text-sm text-purple-300/90">
                                                Cast your vote for who you think is the spy
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs md:text-sm font-bold block mb-2 text-slate-300 uppercase tracking-wide">
                                                Vote for the Spy:
                                            </label>
                                            <select
                                                className="w-full p-3 rounded-lg bg-slate-800/80 border-2 border-slate-600/50 focus:border-purple-500/50 focus:outline-none text-sm md:text-base font-medium transition-all"
                                                value={voteTarget}
                                                onChange={(e) => setVoteTarget(e.target.value)}
                                                disabled={hasVoted}
                                                style={{ color: '#ffffff' }}
                                            >
                                                <option value="">Select a player...</option>
                                                {otherPlayers.map((p) => (
                                                    <option key={p.socketId} value={p.username}>
                                                        {p.username}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            onClick={castVote}
                                            disabled={!voteTarget || hasVoted}
                                            className={`w-full py-3 md:py-4 rounded-lg font-bold text-sm md:text-base shadow-lg transition-all border-2 ${
                                                !voteTarget || hasVoted
                                                    ? 'cursor-not-allowed opacity-60 border-slate-600/30'
                                                    : 'hover:-translate-y-0.5 border-purple-400/30 hover:border-purple-300/50'
                                            }`}
                                            style={{ 
                                                background: !voteTarget || hasVoted
                                                    ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
                                                    : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                                                color: '#ffffff'
                                            }}
                                        >
                                            {hasVoted ? "✓ Vote Submitted" : "Cast Vote"}
                                        </button>
                                    </div>
                                )}

                                {/* Lobby Phase */}
                                {room.phase === "LOBBY" && (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-lg border"
                                             style={{ 
                                                 background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                                 borderColor: 'rgba(16, 185, 129, 0.3)'
                                             }}>
                                            <div className="text-2xl md:text-3xl mb-2">⏳</div>
                                            <div className="text-sm md:text-base font-semibold text-emerald-200 mb-1">
                                                Waiting in Lobby
                                            </div>
                                            <div className="text-xs md:text-sm text-emerald-300/90">
                                                {isHost 
                                                    ? "You're the host! Click 'Start Game' when everyone is ready."
                                                    : "Waiting for the host to start the game..."
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Result Phase (Vote Breakdown) */}
                                {room.phase === "RESULT" && (
                                    <div className="space-y-3">
                                        <div className="text-sm md:text-base font-bold mb-3 text-slate-300">
                                            Vote Breakdown:
                                        </div>
                                        {room.players.map((suspect) => {
                                            const voters = room.players.filter((p) => p.vote === suspect.username);
                                            return (
                                                <div key={suspect.socketId} 
                                                     className="p-3 rounded-lg border transition-all hover:border-slate-500/60"
                                                     style={{ 
                                                         background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.4) 0%, rgba(51, 65, 85, 0.3) 100%)',
                                                         borderColor: 'rgba(100, 116, 139, 0.4)'
                                                     }}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-sm md:text-base">{suspect.username}</span>
                                                        <span className="text-xs md:text-sm font-bold px-2 py-1 rounded-full"
                                                              style={{ 
                                                                  background: voters.length > 0 
                                                                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                                                                      : 'rgba(100, 116, 139, 0.5)',
                                                                  color: '#ffffff'
                                                              }}>
                                                            {voters.length} vote{voters.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    {voters.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {voters.map((v) => (
                                                                <span key={v.socketId} 
                                                                      className="text-xs md:text-sm px-2 py-1 rounded-md font-medium"
                                                                      style={{ 
                                                                          background: 'rgba(100, 116, 139, 0.6)',
                                                                          color: '#e2e8f0'
                                                                      }}>
                                                                    {v.username}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}