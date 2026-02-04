import { useEffect, useState } from 'react'
import useSocket from './socket/useSocket'
import JoinRoom from './components/JoinRoom'
import CreateRoom from './components/CreateRoom'
import Header from './components/Header'
import RoomView from './components/RoomView'
import { Room } from './types'

export default function App() {
  const socketRef = useSocket()
  const [room, setRoom] = useState<Room | null>(null)
  const [roleInfo, setRoleInfo] = useState<{ role: string; word: string } | null>(null)

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const onRoom = (r: Room) => setRoom(r)
    const onRole = (data: { role: string; word: string }) => setRoleInfo(data)
    const onResults = (data: any) => setRoom((prev) => (prev ? { ...prev } : prev))

    socket.on('room-updated', onRoom)
    socket.on('role-assigned', onRole)
    socket.on('results', onResults)

    return () => {
      socket.off('room-updated', onRoom)
      socket.off('role-assigned', onRole)
      socket.off('results', onResults)
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
          <RoomView socketRef={socketRef} room={room} />
        )}
      </main>
    </div>
  )
}
