const socket = io();

// =========================
// AUDIO
// =========================
function stopAllSounds(){

    cowboyMusic.pause();
    cowboyMusic.currentTime = 0;

    fireSound.pause();
    fireSound.currentTime = 0;

}

const beepSound = new Audio("beep.mp3");

const cowboyMusic = new Audio("cowboy.mp3");

const shotSound = new Audio("shot.mp3");

const fireSound = new Audio("fire.mp3");

const winSound = new Audio("win.mp3");

cowboyMusic.loop = true;

// =========================
// UI ELEMENT
// =========================

const statusText =
document.getElementById("status");

const winnerText =
document.getElementById("winner");

const shotsText =
document.getElementById("shots");

const p1Text =
document.getElementById("p1");

const p2Text =
document.getElementById("p2");

const startBtn =
document.getElementById("startBtn");

// =========================
// SAFE PLAY SOUND
// =========================

function playSound(sound){

    sound.currentTime = 0;

    sound.play().catch(() => {});

}

// =========================
// PLAYER CONNECT
// =========================

socket.on("playerConnected", (data) => {

    if(data.player === 1){

        p1Text.innerText =
            "Player 1 : Connected";

    }

    if(data.player === 2){

        p2Text.innerText =
            "Player 2 : Connected";

    }

});

// =========================
// PLAYER STATUS
// =========================

socket.on("playerStatus", (data) => {

    if(data.p1){

        p1Text.innerText =
            "Player 1 : Connected";

    }

    if(data.p2){

        p2Text.innerText =
            "Player 2 : Connected";

    }

});

// =========================
// COUNTDOWN
// =========================

socket.on("countdown", (data) => {

    playSound(beepSound);

    statusText.innerText =
        data.count;

});

// =========================
// READY
// =========================

socket.on("ready", () => {

    statusText.innerText =
`GET READY
Focus your eyes on your enemy...`;

    shotsText.innerText = "";

    winnerText.innerText = "";

    startBtn.style.display = "none";

    cowboyMusic.currentTime = 0;

    cowboyMusic.play().catch(() => {});

});

// =========================
// FIRE
// =========================

socket.on("draw", () => {

    cowboyMusic.pause();

    cowboyMusic.currentTime = 0;

    playSound(fireSound);

    statusText.innerText =
        "FIRE!!";

});

// =========================
// SHOT
// =========================

socket.on("shot", (data) => {

    playSound(shotSound);

    shotsText.innerText =
        `${data.player} FIRED!`;

});

// =========================
// WINNER
// =========================

socket.on("winner", (data) => {
    
    stopAllSounds();

    playSound(winSound);

    winnerText.innerText =
`${data.winner} WIN
${data.time}`;

    startBtn.style.display =
        "inline-block";

    startBtn.innerText =
        "PLAY AGAIN";

});

// =========================
// START BUTTON
// =========================

startBtn.onclick = () => {

    startBtn.style.display =
        "none";

    socket.emit("playAgain");

};
