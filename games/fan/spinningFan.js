let currentTime = Date.now();
let ticking = false;
let fanRotationRad = 0;
let speed;
let length;
let acceleration = 0;
let tangentialVelcity = 0;
let tangentialAcceleration = 0;
let centripetalAcceleration = 0;
let edgeSpeed = 0;
let ctx;

window.onload = function onLoad() {
    let c = document.getElementById("fan");
    ctx = c.getContext("2d");
    speed = document.getElementById('speed').value;
    length = document.getElementById('length').value;
    setInterval(spin, 1000/30);
}
function spin() {
    if (!ticking) {
        ticking = true;
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,w(),w());
        ctx.fillStyle = 'black';
        let timeSinceLastTick = Date.now() - currentTime;
        currentTime = Date.now();
        fanRotationRad = (fanRotationRad + speed * 2 * Math.PI * timeSinceLastTick / 1000) % (2 * Math.PI);
        if (acceleration > 0) {
            speed += acceleration * timeSinceLastTick;
        } else {
            speed = document.getElementById('speed').value;
        }
        if (isNaN(fanRotationRad)) {
            fanRotationRad = 0;
        }

        tangentialVelocity = length * speed * 2 * Math.PI;
        tangentialAcceleration = length * acceleration * 2 * Math.PI;
        centripetalAcceleration = tangentialVelocity * tangentialVelocity / length;
        edgeSpeed = Math.sqrt(Math.pow(centripetalAcceleration,2) + Math.pow(tangentialAcceleration,2));
        //Edge speed is in radians per second squared

        document.getElementById('tangentialVelocity').innerHTML = 'Tangential Velocity: ' + round(tangentialVelocity/Math.PI,4) + '𝜋';
        document.getElementById('tangentialAcceleration').innerHTML = 'Tangential Acceleration: ' + round(tangentialAcceleration/Math.PI,4) + '𝜋';
        document.getElementById('centripetalAcceleration').innerHTML = 'Centripetal Acceleration: ' + round(centripetalAcceleration/Math.PI/Math.PI,4) + '𝜋^2';
        document.getElementById('edgeSpeed').innerHTML = 'Edge Acceleration: ' + round(edgeSpeed/Math.PI/Math.PI,4) + '𝜋^2';
        document.getElementById('currentRotation').innerHTML = 'Current Rotation Degrees: ' + round(fanRotationRad/Math.PI*180,1);

        drawFan();
        ticking = false;
    }
}
function drawFan() {
    //Fan has 4 blades
    //200, 200 is the center
    let tempLength = length;
    while (Math.abs(tempLength) < w()/20) {
        tempLength *= 10;
    }
    while (Math.abs(tempLength) > w()/2) {
        tempLength /= 10;
    }
    let magnitude = tempLength / length;
    let unWeightedX1 =  length * Math.cos(fanRotationRad) * magnitude + w()/2;
    let unWeightedY1 =  length * Math.sin(fanRotationRad) * magnitude + w()/2;
    ctx.beginPath();
    ctx.moveTo(unWeightedX1, unWeightedY1);
    ctx.lineTo(w()-unWeightedX1, w()-unWeightedY1);
    ctx.moveTo(unWeightedY1, w()-unWeightedX1);
    ctx.lineTo(w()-unWeightedY1, unWeightedX1);
    ctx.lineWidth = 10;
    ctx.stroke();
}
function update() {
    acceleration = document.getElementById('acceleration').value;
    if (acceleration == 0) {
        speed = document.getElementById('speed').value;
        document.getElementById('speed').hidden = false;
        document.getElementById('speedLabel').hidden = false;
    } else {
        document.getElementById('speed').hidden = true;
        document.getElementById('speedLabel').hidden = true;
    }
    length = document.getElementById('length').value;
}
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}
function w() {
    return document.getElementById('fan').width;
}
