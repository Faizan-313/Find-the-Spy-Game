import React, { useState } from 'react'
import { Socket } from 'socket.io-client'
import { Player, Room } from '../types'

interface Props {
  socketRef: React.RefObject<Socket | null>
  room: Room
}

export default function RoomView({ socketRef, room }: Props) {
  const [voteTarget, setVoteTarget] = useState<string>('')

  const isHost = socketRef.current?.id === room.hostId

  const startGame = () => {
    socketRef.current?.emit('start-game', { roomId: room.roomId })
  }

  const submitVote = () => {
    socketRef.current?.emit('cast-vote', { roomId: room.roomId, candidateUserName: voteTarget })
  }

  const reveal = () => {
    socketRef.current?.emit('reveal_results', { roomId: room.roomId })
  }

  return (
    <div className="container">
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Room: {room.roomId}</h2>
            <p className="text-sm opacity-80">Host: {room.hostId === socketRef.current?.id ? 'You' : room.hostId}</p>
          </div>
          <div className="space-x-2">
            {isHost && room.phase === 'LOBBY' && (
              <button onClick={startGame} className="bg-emerald-500 px-4 py-2 rounded text-slate-900 font-semibold">Start</button>
            )}
            {isHost && room.phase === 'VOTING' && (
              <button onClick={reveal} className="bg-indigo-500 px-4 py-2 rounded text-white font-semibold">Reveal</button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Players</h3>
            <ul className="space-y-2">
              {room.players.map((p: Player) => (
                <li key={p.socketId} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                  <div>
                    <div className="font-medium">{p.username}</div>
                    <div className="text-xs opacity-75">Score: {p.score}</div>
                  </div>
                  <div className="text-xs opacity-80">{room.spyId === p.socketId ? 'Host/Spy?' : ''}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Actions</h3>
            <div className="bg-slate-700 p-4 rounded space-y-3">
              {room.phase === 'DISCUSSION' && (
                <div className="text-sm">Discuss secretly. The spy has a different word.</div>
              )}

              {room.phase === 'VOTING' && (
                <div className="space-y-2">
                  <select className="w-full p-2 rounded bg-slate-800" value={voteTarget} onChange={(e) => setVoteTarget(e.target.value)}>
                    <option value="">Select player</option>
                    {room.players.map((p) => (
                      <option key={p.socketId} value={p.username}>{p.username}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={submitVote} className="flex-1 bg-amber-500 py-2 rounded font-semibold text-slate-900">Vote</button>
                  </div>
                </div>
              )}

              {room.phase === 'RESULT' && (
                <div className="text-sm">Results shown. Start next round when ready.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
