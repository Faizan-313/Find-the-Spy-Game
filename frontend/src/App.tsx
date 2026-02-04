import { useEffect, useState } from 'react'
import useSocket from './socket/useSocket'
import JoinRoom from './components/JoinRoom'
import CreateRoom from './components/CreateRoom'
import Header from './components/Header'
import RoomView from './components/RoomView'
import type { Room } from './types'

export default function App() {
  const socketRef = useSocket()
  const [room, setRoom] = useState<Room | null>(null)
  const [roleInfo, setRoleInfo] = useState<{ role: string; word: string } | null>(null)
  const [resultData, setResultData] = useState<any>(null)

  const [toasts, setToasts] = useState<Array<{id:number; message:string}>>([])

  const showToast = (message: string) => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const onRoom = (r: Room) => setRoom(r)
    const onRole = (data: { role: string; word: string }) => setRoleInfo(data)
    const onVoteUpdated = (data: any) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              players: prev.players.map((p) =>
                p.socketId === data.socketId ? { ...p, vote: data.vote } : p
              ),
            }
          : prev
      )
    }
    const onResults = (data: any) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              results: data?.voteCounts ?? prev.results,
              players: data?.players ?? prev.players,
              phase: "RESULT"
            }
          : prev
      )
      setResultData(data)
    }
    const onError = (err: { message?: string } | string) => {
      const msg = typeof err === 'string' ? err : err?.message ?? 'Error'
      showToast(msg)
    }
    const onRoomDeleted = () => {
      setRoom(null)
      showToast('Room closed')
    }

    socket.on('room-updated', onRoom)
    socket.on('role-assigned', onRole)
    socket.on('vote-updated', onVoteUpdated)
    socket.on('results', onResults)
    socket.on('room-error', onError)
    socket.on('room-deleted', onRoomDeleted)

    return () => {
      socket.off('room-updated', onRoom)
      socket.off('role-assigned', onRole)
      socket.off('vote-updated', onVoteUpdated)
      socket.off('results', onResults)
      socket.off('room-error', onError)
      socket.off('room-deleted', onRoomDeleted)
    }
  }, [socketRef])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container">
        {!room && (
          <div className="grid md:grid-cols-2 gap-6">
            <CreateRoom socketRef={socketRef} />
            <JoinRoom socketRef={socketRef} />
          </div>
        )}

        {room && socketRef.current && (
          <RoomView socketRef={socketRef} room={room} roleInfo={roleInfo} resultData={resultData} />
        )}
      </main>

      <div className="fixed right-6 bottom-6 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="bg-black/70 px-4 py-2 rounded text-sm">{t.message}</div>
        ))}
      </div>
    </div>
  )
}
