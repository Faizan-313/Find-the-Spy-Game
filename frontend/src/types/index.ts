export interface Player {
    socketId: string
    username: string
    score: number
    vote: string
}

export type GamePhase = 'LOBBY' | 'DISCUSSION' | 'VOTING' | 'RESULT'

export interface Room {
    roomId: string
    hostId: string
    players: Player[]
    phase: GamePhase
    spyId?: string
    secretWord?: string
    spyWord?: string
    results?: Record<string, number>
}
