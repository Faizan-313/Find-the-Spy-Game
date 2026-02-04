import { useState } from 'react'
import { Socket } from 'socket.io-client'

interface JoinRoomProps {
    socketRef: React.RefObject<Socket | null>
}

function CreateRoom({ socketRef }: JoinRoomProps) {
    const [username, setUsername] = useState<string>("");

    const handleJoin = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!socketRef?.current) return;

        socketRef.current.emit("create-room", {
            username
        });
    };

    return (
        <div className="max-w-md mx-auto mt-6">
            <form onSubmit={handleJoin} className="bg-slate-800 p-6 rounded shadow">
                <h3 className="text-lg font-medium mb-3">Create Room</h3>
                <input
                    className="w-full p-2 mb-3 rounded bg-slate-700"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button className="w-full bg-emerald-500 py-2 rounded font-semibold text-slate-900" type="submit">Create Room</button>
            </form>
        </div>
    )
}

export default CreateRoom
