import React, { useState } from 'react'
import { Socket } from 'socket.io-client'

interface JoinRoomProps {
    socketRef: React.MutableRefObject<Socket | null>
}

function JoinRoom({ socketRef }: JoinRoomProps) {
    const [username, setUsername] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");

    const handleJoin = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!socketRef?.current) return;

        socketRef.current.emit("join-room", {
            username,
            roomId,
        });
    };

    return (
        <div className="max-w-md mx-auto mt-6">
            <form onSubmit={handleJoin} className="bg-slate-800 p-6 rounded shadow">
                <h3 className="text-lg font-medium mb-3">Join Room</h3>
                <input
                    className="w-full p-2 mb-3 rounded bg-slate-700"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className="w-full p-2 mb-3 rounded bg-slate-700"
                    type="text"
                    placeholder="Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                <button className="w-full bg-amber-400 py-2 rounded font-semibold text-slate-900" type="submit">Join Room</button>
            </form>
        </div>
    )
}

export default JoinRoom
