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
            <div className="container">
                <div className="mb-4 flex justify-center">
                    <button
                        onClick={() => socketRef.current?.emit("end-room", { roomId: room.roomId })}
                        className="absolute top-6 right-6 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm"
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
        <div className="container">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            {roleInfo && (
            <div className="mb-4 p-3 bg-slate-700 rounded text-sm">
                <div className="font-medium">
                Role: {roleInfo.role.toUpperCase()}
                </div>
                <div className="text-xs opacity-80">Word: {roleInfo.word}</div>
            </div>
            )}
            <div className="flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium">Room: {room.roomId}</h2>
                    <button
                        onClick={copyRoomId}
                        className="text-xs px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 transition"
                    >
                        {copied ? "✓ Copied" : "Copy"}
                    </button>
                </div>
                <p className="text-sm opacity-80">
                Host: {hostPlayer ? hostPlayer.username : "Unknown"}
                </p>
            </div>
            <div className="space-x-2">
                {isHost && room.phase === "LOBBY" && (
                <button
                    onClick={startGame}
                    className="bg-emerald-500 px-4 py-2 rounded text-slate-900 font-semibold"
                >
                    Start
                </button>
                )}
                {isHost && room.phase === "DISCUSSION" && (
                <button
                    onClick={startVoting}
                    className="bg-amber-500 px-4 py-2 rounded text-slate-900 font-semibold"
                >
                    Start Voting
                </button>
                )}
                {isHost && room.phase === "VOTING" && (
                <button
                    onClick={reveal}
                    disabled={!allVoted}
                    className={`px-4 py-2 rounded font-semibold ${allVoted ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                >
                    Reveal
                </button>
                )}
                {isHost && (
                <button
                    onClick={endRoom}
                    className="ml-2 bg-red-600 px-3 py-2 rounded text-white text-sm"
                >
                    End Game
                </button>
                )}
            </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 className="text-sm font-semibold mb-2">Players</h3>
                <ul className="space-y-2">
                {room.players.map((p: Player) => {
                    const voteCount = getVoteCount(p.username);
                    return (
                    <li
                    key={p.socketId}
                    className={`flex items-center justify-between p-3 rounded ${
                        p.vote ? 'bg-emerald-900/40 border border-emerald-600' : 'bg-slate-700'
                    }`}
                    >
                    <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                            {p.username}
                            {room.phase === "VOTING" && voteCount > 0 && (
                                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{voteCount}</span>
                            )}
                            {p.vote && room.phase !== "RESULT" ? (
                                <span className="text-xs text-emerald-300">(✓ Voted)</span>
                            ) : null}
                            {p.vote && room.phase === "RESULT" ? (
                                <span className="text-xs text-amber-300">→ {p.vote}</span>
                            ) : null}
                        </div>
                        <div className="text-xs opacity-75">Score: {p.score}</div>
                    </div>
                    <div className="text-xs opacity-80">
                        {room.spyId === p.socketId ? "👁 Spy?" : ""}
                    </div>
                    </li>
                    );
                })}
                </ul>
                
                {room.phase === "VOTING" && isHost && notVotedYet.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-900/40 rounded border border-orange-600">
                        <div className="font-semibold text-sm mb-2">⏳ Not Voted Yet ({notVotedYet.length}):</div>
                        <ul className="space-y-1">
                            {notVotedYet.map((p) => (
                                <li key={p.socketId} className="text-sm flex items-center gap-2">
                                    <span className="text-orange-400">•</span>
                                    {p.username}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-sm font-semibold mb-2">Actions</h3>
                <div className="bg-slate-700 p-4 rounded space-y-3">
                {room.phase === "DISCUSSION" && (
                    <div className="text-sm">
                    Discuss secretly. The spy has a different word.
                    </div>
                )}

                {room.phase === "VOTING" && (
                    <div className="space-y-2">
                    <label className="text-xs font-medium block">Vote for who is the spy:</label>
                    <select
                        className="w-full p-2 rounded bg-slate-800"
                        value={voteTarget}
                        onChange={(e) => setVoteTarget(e.target.value)}
                        disabled={hasVoted}
                    >
                        <option value="">Select player</option>
                        {otherPlayers.map((p) => (
                        <option key={p.socketId} value={p.username}>
                            {p.username}
                        </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                        onClick={castVote}
                        disabled={!voteTarget || hasVoted}
                        className={`flex-1 py-2 rounded font-semibold ${!voteTarget || hasVoted ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-amber-500 text-slate-900'}`}
                        >
                        {hasVoted ? "Vote Submitted" : "Vote"}
                        </button>
                    </div>
                    </div>
                )}

                {room.phase === "RESULT" && (
                    <div className="space-y-3">
                        <div className="text-sm font-medium mb-2">Vote Breakdown (Among Us style):</div>
                        {room.players.map((suspect) => {
                            const voters = room.players.filter((p) => p.vote === suspect.username);
                            return (
                                <div key={suspect.socketId} className="p-2 bg-slate-600 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">{suspect.username}</span>
                                        <span className="text-xs font-semibold">{voters.length} vote{voters.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    {voters.length > 0 && (
                                        <div className="text-xs opacity-75 flex flex-wrap gap-1">
                                            {voters.map((v) => (
                                                <span key={v.socketId} className="bg-slate-500 px-1.5 py-0.5 rounded">{v.username}</span>
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
    );
}
