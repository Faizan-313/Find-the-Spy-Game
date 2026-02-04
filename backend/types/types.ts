export interface Player {
    socketId: string;
    username: string;
    score: number;
    vote: string;
}

export interface Room {
    roomId: string;
    hostId: string;
    players: Player[];
    phase: GamePhase;
    spyId?: string;
    secretWord?: string;
    spyWord?: string;
    results?: Record<string, number>;
}

export enum GamePhase {
    LOBBY = "LOBBY",
    DISCUSSION = "DISCUSSION",
    VOTING = "VOTING",
    RESULT = "RESULT",
}
