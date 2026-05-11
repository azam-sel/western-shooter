const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// =========================
// EXPRESS + SOCKET.IO
// =========================

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

app.use(express.static('public'));

const PORT = process.env.PORT || 7860;

httpServer.listen(PORT, "0.0.0.0", () => {

    console.log(`🌐 Server running on ${PORT}`);

});

// =========================
// GAME VARIABLES
// =========================

const SHOOT_THRESHOLD = 15;

let gameState = "waiting";

let drawTimeout = null;

let drawTime = 0;

// =========================
// PLAYER DATA
// =========================

const players = {

    player1: {
        id: null,
        shot: false,
        reaction: null
    },

    player2: {
        id: null,
        shot: false,
        reaction: null
    }

};

// =========================
// REGISTER PLAYER
// =========================

function registerPlayer(socketId){

    if(!players.player1.id){

        players.player1.id = socketId;

        console.log("🤠 Player 1 connected");

        io.emit("playerConnected", {
            player: 1
        });

    }

    else if(
        !players.player2.id
        &&
        socketId !== players.player1.id
    ){

        players.player2.id = socketId;

        console.log("🤠 Player 2 connected");

        io.emit("playerConnected", {
            player: 2
        });

    }

}

// =========================
// COUNTDOWN
// =========================

function startCountdown(){

    let count = 5;

    const interval = setInterval(() => {

        io.emit("countdown", {
            count
        });

        count--;

        if(count <= 0){

            clearInterval(interval);

            startGame();

        }

    }, 1000);

}

// =========================
// START GAME
// =========================

function startGame(){

    io.emit("ready");

    gameState = "waiting";

    players.player1.shot = false;
    players.player2.shot = false;

    players.player1.reaction = null;
    players.player2.reaction = null;

    const delay =
    Math.random() * 5000 + 3000;

    drawTimeout = setTimeout(() => {

        gameState = "draw";

        drawTime = Date.now();

        console.log("🔫 FIRE!");

        io.emit("draw");

    }, delay);

}

// =========================
// CHECK WINNER
// =========================

function checkWinner(){

    const p1 =
    players.player1.reaction;

    const p2 =
    players.player2.reaction;

    if(p1 !== null && p2 !== null){

        let winner = "";
        let time = "";

        if(p1 < p2){

            winner = "PLAYER 1";
            time = p1 + "ms";

        }

        else{

            winner = "PLAYER 2";
            time = p2 + "ms";

        }

        io.emit("winner", {

            winner,
            time

        });

        gameState = "finished";

    }

}

// =========================
// SOCKET CONNECTION
// =========================

io.on("connection", (socket) => {

    console.log("🌐 Connected:", socket.id);

    // register
    registerPlayer(socket.id);

    // status
    socket.emit("playerStatus", {

        p1: players.player1.id !== null,
        p2: players.player2.id !== null

    });

    // =====================
    // PLAY AGAIN
    // =====================

    socket.on("playAgain", () => {

        startCountdown();

    });

    // =====================
    // SENSOR DATA
    // =====================

    socket.on("sensorData", (data) => {

        const power = data.power || 0;

        if(power < SHOOT_THRESHOLD)
            return;

        let currentPlayer = null;
        let playerName = "";

        if(socket.id === players.player1.id){

            currentPlayer =
            players.player1;

            playerName =
            "PLAYER 1";

        }

        else if(
            socket.id === players.player2.id
        ){

            currentPlayer =
            players.player2;

            playerName =
            "PLAYER 2";

        }

        if(
            !currentPlayer
            ||
            currentPlayer.shot
        ) return;

        currentPlayer.shot = true;

        io.emit("shot", {
            player: playerName
        });

        // FALSE START
        if(gameState === "waiting"){

            clearTimeout(drawTimeout);

            let winner = "";

            if(
                currentPlayer ===
                players.player1
            ){

                winner = "PLAYER 2";

            }

            else{

                winner = "PLAYER 1";

            }

            io.emit("winner", {

                winner,

                time:
                `${playerName} FALSE START`

            });

            gameState = "finished";

        }

        // VALID SHOT
        else if(gameState === "draw"){

            currentPlayer.reaction =
            Date.now() - drawTime;

            checkWinner();

        }

    });

    // =====================
    // DISCONNECT
    // =====================

    socket.on("disconnect", () => {

        console.log("❌ Disconnect");

        if(
            socket.id === players.player1.id
        ){

            players.player1.id = null;

        }

        if(
            socket.id === players.player2.id
        ){

            players.player2.id = null;

        }

    });

});
