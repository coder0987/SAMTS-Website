let players;
let ctx;
let playerId;
let socket;
let pressedKeys = {};
let tempKeys = {};
let isOverCanvas = false;
let coins = [];
let dash = [];
let ammo = [];
let bullets = [];
let horizontal = 0;
let vertical = 0;
let bulletLoaded = false;
const bulletImg = new Image();
bulletImg.addEventListener('load', function() {bulletLoaded = true;});
bulletImg.src = './bullet.png';

function disconnected() {
    clearInterval(this.interval);
    ctx.fillStyle = 'red';
    ctx.fillRect(0,0,400,400);
    ctx.font = '24px arial';
    ctx.fillStyle = 'black';
    ctx.fillText('ERROR',50,200,300);
}

function disconnected(errorMessage) {
    clearInterval(this.interval);
    ctx.fillStyle = 'red';
    ctx.fillRect(0,0,400,400);
    ctx.font = '24px arial';
    ctx.fillStyle = 'black';
    ctx.fillText('ERROR: ' + errorMessage,50,200,300);
}

function getX() {
    return players[playerId]['x'];
}

function getY() {
    return players[playerId]['y'];
}

function drawPlayer(x,y,i) {
    ctx.fillStyle = players[i]['color'];
    ctx.fillRect(x, y, 10, 10);
    if (players[i]['score']>=1000) {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.moveTo(x,y+2);
        ctx.lineTo(x,y-3);
        ctx.lineTo(x+2,y-1);
        ctx.lineTo(x+5,y-5);
        ctx.lineTo(x+8,y-2);
        ctx.lineTo(x+10,y-3);
        ctx.lineTo(x+10,y+2);
        ctx.lineTo(x+5,y+1);
        ctx.closePath();
        ctx.fill();
    }
    if (i==playerId) {
    	ctx.fillStyle = 'green';
    	ctx.fillRect(x+4,y+4,2,2);
    }
}

function drawCoin(x,y,i) {
    ctx.fillStyle = 'gold';
    ctx.fillRect(x, y, 10, 10);
    if (Math.abs(x-getX()) < 10 && Math.abs(y-getY()) < 10) {
        socket.emit('touchingCoin',i);
    }
}

function drawDash(x,y,i) {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(x, y, 10, 10);
    if (Math.abs(x-getX()) < 10 && Math.abs(y-getY()) < 10) {
        socket.emit('touchingDash',i);
    }
}
function drawDashBar() {
    ctx.fillStyle = 'lightblue';
    if (players[playerId]['dash'] == -1) {
        ctx.fillRect(345,385,50,10);
    } else if (players[playerId]['dash'] > 0) {
    	ctx.fillStyle = 'rgba(0,0,255,0.3)';
    	ctx.fillRect(345,385,50,10);
    	ctx.fillStyle = 'lightblue';
    	ctx.fillRect(345,385,players[playerId]['dash']*5,10);
    }
}
function drawAmmo(x,y,i) {
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, 10, 10);
    if (Math.abs(x-getX()) < 10 && Math.abs(y-getY()) < 10) {
        socket.emit('touchingAmmo',i);
    }
}
function drawBullet(x,y) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, 2, 2);
}
function drawBulletBar() {
    if (bulletLoaded) {
        ctx.drawImage(bulletImg,0,375,20,20);
        ctx.fillStyle = 'black';
        ctx.fillText(players[playerId]['ammo'],20,390,10);
    }
}

function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) { 
        let j = i - 1; 
        while (j >= 0 && arr[j+1]['score'] < arr[j]['score']) {
            let temp = arr[j];
            arr[j] = arr[j+1];
            arr[j+1] = temp;
            j--;
        }
    }
}

function drawLeaderBoard() {
    let topTen = [];
    for (let i in players) {
        topTen.push(players[i]);
    }
    insertionSort(topTen);
    topTen.reverse();
    ctx.font = '24px arial';
    let j = 0;
    for (let i = 0; i < topTen.length && i < 10; i++) {
        ctx.fillStyle = topTen[i]['color'];
        ctx.fillText(topTen[i]['name'] + ': ' + topTen[i]['score'],300,(i+1)*24,90);
        j = i;
    }
    ctx.fillStyle = 'black';
    ctx.fillText('Players: ' + Object.keys(players).length + '/40',300,(j+2)*24,90);
    if (players[playerId]['score'] > 1000)
    	ctx.fillText('You Win!',10,24,100);
}

function drawBoard() {
    let width = 400;
    let height = 400;

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, width, height);

    for (let i in players) {
        drawPlayer(players[i]['x'],players[i]['y'],i);
    }
    for (let i in coins) {
        drawCoin(coins[i]['x'],coins[i]['y'],i);
    }
    for (let i in dash) {
        drawDash(dash[i]['x'],dash[i]['y'],i);
    }
    for (let i in ammo) {
        drawAmmo(ammo[i]['x'],ammo[i]['y'],i);
    }
    for (let i in bullets) {
        drawBullet(bullets[i]['x'],bullets[i]['y']);
    }
    drawLeaderBoard();
    drawDashBar();
    drawBulletBar();
}

function rename(name) {
    localStorage.setItem('defaultName',name);
    socket.emit('rename',name);
}
function setname(name) {
    socket.emit('rename',name);
}

function up() {
    socket.emit('up');
    vertical = 1;
}
function down() {
    socket.emit('down');
    vertical = -1;
}
function left() {
    socket.emit('left');
    horizontal = -1;
}
function right() {
    socket.emit('right');
    horizontal = 1;
}
function shoot() {
    if (players[playerId]['ammo'] < 1) return;
    if (vertical == 1) {
        socket.emit('shoot', 0,1);
    } else if (horizontal == 1) {
        socket.emit('shoot', 1,0);
    } else if (vertical == -1) {
        socket.emit('shoot', 0,-1);
    } else if (horizontal == -1) {
        socket.emit('shoot', -1,0);
    }
}
function shootTowards(x,y) {
    //welp time for some trig
    let h = x - getX();
    let v = y - getY();
    let largest = Math.abs(h) > Math.abs(v) ? Math.abs(h) : Math.abs(v);
    let sh = h / largest;
    let sv = v / largest;
    socket.emit('shoot', sh, sv);
}

function tick() {
    if (players[playerId]) {
        let moveUp      = pressedKeys[87] || pressedKeys[38];
        let moveDown    = pressedKeys[83] || pressedKeys[40];
        let moveRight   = pressedKeys[68] || pressedKeys[39];
        let moveLeft    = pressedKeys[65] || pressedKeys[37];
        let shootGun    = players[playerId]['ammo'] > 0 &&
                          pressedKeys[70] || pressedKeys[88];

        if (!isOverCanvas) {
            horizontal = 0;
            vertical = 0;
        }
        if (moveUp && !moveDown) {
            up();
        } else if (moveDown && !moveUp) {
            down();
        }
        if (moveRight && !moveLeft) {
            right();
        } else if (moveLeft  && !moveRight) {
            left();
        }
        if (shootGun) shoot();
        if (players[playerId]['dash'] == -1 && pressedKeys[32])
            socket.emit('dash');
        drawBoard();
        tempKeys = {...pressedKeys}
    }
}

window.onload = function onLoad() {
    let c = document.getElementById("move");
    ctx = c.getContext("2d");

    socket = io();
    playerId;
    players = {};

    if (localStorage.getItem('moveInstance'))
        socket.emit('instanceCheck',localStorage.getItem('moveInstance'));
    else
        localStorage.setItem('moveInstance',Math.random()*100000000000000000);

    if(localStorage.getItem('defaultName')) {
        rename(localStorage.getItem('defaultName'));
    }

    ctx.fillStyle = 'green';
    ctx.fillRect(0,0,400,400);
    
    window.onkeyup   = function(e) { pressedKeys[e.keyCode] = false;}
    window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }
    
    socket.emit('getPlayers', localStorage.getItem('moveInstance'));

    socket.on('returnPlayers',function(data) {
        players = data;
    });
    
    socket.on('setPlayerId',function(data){
        playerId = data;
    });

    socket.on('returnCoins',function(data){
        coins = data;
    });

    socket.on('returnDash',function(data){
        dash = data;
    });
    socket.on('returnAmmo',function(data){
        ammo = data;
    })
    socket.on('returnBullets',function(data){
        bullets = data;
    })

    socket.on('disconnect',function(data) {
        if (data)
            disconnected(data);
        else
            disconnected();
        console.log(data);
    });
    
    socket.on('ban',function() {
    	alert('YOU\'VE BEEN HIT BY THE BAN HAMMER');
    });
    socket.on('kick',function() {
    	alert('Probably don\'t do whatever you were doing');
    });
    socket.on('banlist',function(data) {
    	console.log(JSON.stringify(data));
    });

    const mouseEventFirer = setInterval(function() {
        if (isOverCanvas) {
            vertical = 0;
            horizontal = 0;
            moveByMouse(isOverCanvas);
        }
    },32);
    document.getElementById('move').addEventListener('mouseenter', (event) => {isOverCanvas = event;})
    document.getElementById('move').addEventListener('mouseleave', () => {isOverCanvas = false;})
    document.getElementById('move').addEventListener('mousemove', (event) => {isOverCanvas = event;});

    this.interval = setInterval(tick, 32);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

function moveByMouse(event) {
    // Compensate for IE<9's non-standard event model
    if (event===undefined)
        event= window.event;

    let target= 'target' in event? event.target : event.srcElement;
    console.log('click');
    if (target.tagName=='CANVAS') {
        let tp = getMousePos(document.getElementById('move'),event);
        if (tp.y - 5 > getY() + 2) down();
        if (tp.y - 5 < getY() - 2) up();
        if (tp.x - 5 < getX() - 2) left();
        if (tp.x - 5 > getX() + 2) right();
    }
}

document.onclick = function(event) {
    // Compensate for IE<9's non-standard event model
    if (event===undefined)
        event= window.event;

    let target= 'target' in event? event.target : event.srcElement;
    console.log('click');
    if (target.tagName=='CANVAS') {
        let tp = getMousePos(document.getElementById('move'),event);
        shootTowards(tp.x,tp.y);
    }
};
