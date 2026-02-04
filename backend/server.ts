import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

import { Room, GamePhase, Player } from "./types/types";

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const rooms = new Map<string, Room>();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-room" , ({username})=>{
        console.log("room created",socket.id, username)
        if(!username){
            socket.emit("room-error", { message: "Username required" })
            return
        }
        const roomId = `${username}-${uuidv4().split("-")[0].toUpperCase()}`;
        const phase = GamePhase.LOBBY

        const player = {
            socketId: socket.id,
            username: username,
            score: 0,
            vote: ""
        }

        const room: Room = {
            roomId: roomId,
            hostId: socket.id,
            players: [player],
            phase: phase     
        }

        rooms.set(roomId, room);
        socket.join(roomId);
        io.to(roomId).emit("room-updated", room);
    })

    socket.on("join-room", ({ roomId, username }) => {
        if(!roomId || !username){
            socket.emit("room-error", { message: "All fields are required" })
            return
        }
        const room = rooms.get(roomId);

        //Room existence check
        if (!room) {
            socket.emit("room-error", { message: "Room does not exist" });
            return;
        }

        if (room.phase !== GamePhase.LOBBY) {
            socket.emit("room-error", { message: "Game already started" });
            return;
        }

        //Prevent duplicate joins (same socket)
        const alreadyJoined = room.players.some(
            (p) => p.socketId === socket.id
        );

        if (alreadyJoined) {
            socket.emit("room-error", { message: "Already joined room" });
            return;
        }

        //Create player
        const player: Player = {
            socketId: socket.id,
            username,
            score: 0,
            vote: ""
        };

        room.players.push(player);
        socket.join(roomId);

        //Notify everyone in room
        io.to(roomId).emit("room-updated", room);
    });


    socket.on("start-game", ({roomId})=>{
        if(!roomId){
            socket.emit("room-error", { message: "Something is missing" })
            return
        }
        const room = rooms.get(roomId);

        if(!room){
            socket.emit("room-error", { message: "Room does not exist" })
            return 
        }

        if (room.hostId !== socket.id) {
            socket.emit("room-error", { message: "Only Host Can Start The Game" });
            return;
        }

        if (room.phase !== GamePhase.LOBBY) {
            socket.emit("room-error", { message: "Game already started" });
            return;
        }

        const phase = GamePhase.DISCUSSION
        room.phase = phase

        const wordPairs: [string, string][] = [
            ["Apple", "Banana"],
            ["Beach", "Desert"],
            ["Piano", "Guitar"],
            ["Cat", "Dog"],
            ["Rocket", "Satellite"],
        ];

        // assign spy randomly
        const players = room.players;
        const spyIndex = Math.floor(Math.random() * players.length);
        const spy = players[spyIndex];
        room.spyId = spy.socketId;

        // choose words
        const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
        room.secretWord = pair[0];
        room.spyWord = pair[1];

        // clear previous votes
        room.players.forEach((p) => (p.vote = ""));

        // notify everyone of room update
        io.to(roomId).emit("room-updated", room);

        // send word + role to each player individually
        room.players.forEach((p) => {
            const role = p.socketId === room.spyId ? "spy" : "player";
            const word = role === "spy" ? room.spyWord : room.secretWord;
            io.to(p.socketId).emit("role-assigned", { role, word });
        });

    })

    socket.on("cast-vote", ({roomId, candidateUserName})=>{
        if(!roomId || !candidateUserName){
            socket.emit("room-error", { message: "Every filed required" })
            return
        }
        const room = rooms.get(roomId);

        if(!room){
            socket.emit("room-error", { message: "Room does not exist" })
            return
        }

        const p = room.players.find((a)=> a.socketId === socket.id)

        if (!p) {
            socket.emit("room-error", { message: "Please Enter In Room First" });
            return;
        }

        if (room.phase !== GamePhase.VOTING) {
            socket.emit("room-error", { message: "Can't Vote Now" });
            return;
        }

        p.vote = candidateUserName;

        io.to(roomId).emit("vote-updated", { socketId: socket.id, vote: p.vote });
    })

    socket.on("submit_vote", ({roomId})=>{
        if(!roomId){
            socket.emit("room-error", { message: "Something is missing" })
            return
        }
        const room = rooms.get(roomId);

        if(!room){
            socket.emit("room-error", { message: "Room does not exist" })
            return
        }

        if (room?.hostId !== socket.id) {
            socket.emit("room-error", { message: "Only Host Can Start The Game" });
            return;
        }

        if (room.phase !== GamePhase.DISCUSSION) {
            socket.emit("room-error", { message: "Can't do that" });
            return;
        }

        const phase = GamePhase.VOTING
        room.phase = phase

        // clear previous votes just in case
        room.players.forEach((p) => (p.vote = ""));

        io.to(roomId).emit("room-updated", room);
    })

    socket.on("reveal_results", ({roomId})=>{
        if(!roomId){
            socket.emit("room-error", { message: "Something is missing" })
            return
        }
        const room = rooms.get(roomId);
        
        if(!room){
            socket.emit("room-error", { message: "Room does not exist" })
            return
        }

        if (room?.hostId !== socket.id) {
            socket.emit("room-error", { message: "Only Host Can Start The Game" });
            return;
        }

        if (room.phase !== GamePhase.VOTING) {
            socket.emit("room-error", { message: "Can't do that" });
            return;
        }

        const phase = GamePhase.RESULT
        room.phase = phase

        // tally votes
        const voteCounts = new Map<string, number>();
        room.players.forEach((p) => {
            if (!p.vote) return;
            voteCounts.set(p.vote, (voteCounts.get(p.vote) || 0) + 1);
        });

        // determine highest voted username(s)
        let max = 0;
        for (const v of voteCounts.values()) if (v > max) max = v;
        const topVoted = Array.from(voteCounts.entries())
            .filter(([, count]) => count === max)
            .map(([username]) => username);

        const spyPlayer = room.players.find((p) => p.socketId === room.spyId) || null;
        const spyUsername = spyPlayer ? spyPlayer.username : null;
        const spyCaught = spyUsername ? topVoted.includes(spyUsername) : false;

        // scoring: if spy caught, players who voted spy get +1; otherwise spy gets +1
        if (spyCaught) {
            room.players.forEach((p) => {
                if (p.vote === spyUsername) p.score += 1;
            });
        } else {
            if (spyPlayer) spyPlayer.score += 1;
        }

        // save results summary
        room.results = Object.fromEntries(voteCounts.entries());

        //Notify everyone in room with updated room and results
        io.to(roomId).emit("room-updated", room);
        io.to(roomId).emit("results", {
            voteCounts: room.results,
            spyCaught,
            spyUsername,
            players: room.players,
        });
    })

    socket.on("end-room", ({roomId})=>{
        if(!roomId){
            socket.emit("room-error", { message: "Something is missing" })
        }
        const room = rooms.get(roomId);
        
        if(!room){
            socket.emit("room-error", { message: "Room does not exist" })
            return
        }

        if (room?.hostId !== socket.id) {
            socket.emit("room-error", { message: "Only Host Can End The Game" });
            return;
        }

        if (room.phase !== GamePhase.LOBBY) {
            socket.emit("room-error", { message: "Can't do that" });
            return;
        }

        const deleted = rooms.delete(roomId)
        if(deleted){
            io.to(roomId).emit("room-deleted")
            return
        }else{
            socket.emit("room-error", { message: "Something went wrong" })
            return
        }   
    })


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        for (const [roomId, room] of Array.from(rooms.entries())) {
            const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
            if (playerIndex === -1) continue;

            const wasHost = room.hostId === socket.id;

            // remove the player
            room.players.splice(playerIndex, 1);

            if (room.players.length === 0) {
                rooms.delete(roomId);
                io.to(roomId).emit("room-deleted");
                continue;
            }

            if (wasHost) {
                room.hostId = room.players[0].socketId;
            }

            io.to(roomId).emit("room-updated", room);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
