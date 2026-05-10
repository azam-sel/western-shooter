window.onload = () => {

    // SOCKET
    const socket = io();

    const statusText =
    document.getElementById("status");

    const powerText =
    document.getElementById("power");

    const startBtn =
    document.getElementById("startBtn");

    // =========================
    // BUTTON
    // =========================

    startBtn.onclick = async () => {

        statusText.innerText =
        "Sensor Active";

        // iPhone permission
        if(
            typeof DeviceMotionEvent !==
            "undefined"
            &&
            typeof DeviceMotionEvent
            .requestPermission ===
            "function"
        ){

            try{

                const permission =
                await DeviceMotionEvent
                .requestPermission();

                if(permission !== "granted"){

                    statusText.innerText =
                    "Permission denied";

                    return;

                }

            }

            catch(err){

                console.log(err);

                return;

            }

        }

        // =====================
        // SENSOR
        // =====================

        window.addEventListener(

            "devicemotion",

            (event) => {

                let x = 0;
                let y = 0;
                let z = 0;

                if(event.acceleration){

                    x =
                    event.acceleration.x || 0;

                    y =
                    event.acceleration.y || 0;

                    z =
                    event.acceleration.z || 0;

                }

                else if(
                    event.accelerationIncludingGravity
                ){

                    x =
                    event
                    .accelerationIncludingGravity
                    .x || 0;

                    y =
                    event
                    .accelerationIncludingGravity
                    .y || 0;

                    z =
                    event
                    .accelerationIncludingGravity
                    .z || 0;

                }

                // POWER
                const power =
                Math.sqrt(
                    x*x +
                    y*y +
                    z*z
                );

                powerText.innerText =
                power.toFixed(2);

                // SEND
                socket.emit(
                    "sensorData",
                    {
                        power
                    }
                );

            }

        );

        startBtn.style.display =
        "none";

    };

};
