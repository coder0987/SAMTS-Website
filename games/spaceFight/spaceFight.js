let ctx;
let canvas;
let stars = [];
let timeBetweenTwinkle = 50;
let maxStarSize = 5;
let player1;
let player2;
let keys = {};
let bullets = [];
let powers = [];
let player1Wins = 0;
let player2Wins = 0;
let powerTimeOut = 5 * Math.round(1000/30);
let inFullscreen = false;
let fullscreenAlert = 0;


function Player() {
    this.y = h()/2;
    this.timeUntilReload = 0;
    this.powers = [];
}
function Bullet(p,x,s) {
    this.y = p.y + 5;
    this.x = x;
    if (x < w()/2) {
        this.d = 1 * s;
    } else {
        this.d = -1 * s;
    }
}

function drawBackground() {
    ctx.fillStyle = '#182030';
    ctx.fillRect(0,0,w(),h());
    ctx.fillStyle = '#ffffff';
    for (let i in stars) {
        ctx.fillRect(stars[i].x - stars[i].t/2,stars[i].y-stars[i].t/2,stars[i].t,stars[i].t);
    }
}

function twinkle() {
    for (let i in stars) {
        if (stars[i].time > timeBetweenTwinkle) {
            stars[i].time = 0;
            if (stars[i].t <= 1) {
                stars[i].t++;
            } else if (stars[i].t >= maxStarSize) {
                stars[i].t--;
            } else {
                stars[i].t = Math.round(stars[i].t + Math.random()*4-2);
            }
        } else {
            stars[i].time++;
        }
    }
}

function genPower() {
    if (powers.length > w()/40) {
        return;
    }
    if (Math.random() > 0.995) {
        powers.push({'x':Math.round(Math.random()*w()),'y':Math.round(Math.random()*h()),'type':'speed'});
    }
    if (Math.random() > 0.995) {
        powers.push({'x':Math.round(Math.random()*w()),'y':Math.round(Math.random()*h()),'type':'rapidFire'});
    }
    if (Math.random() > 0.995) {
        powers.push({'x':Math.round(Math.random()*w()),'y':Math.round(Math.random()*h()),'type':'speedBullet'});
    }
}

function makeStars() {
    stars = [];
    for (let i=0; i<w()/16 + h()/16; i++) {
        stars.push({'x':Math.round(Math.random()*w()),'y':Math.round(Math.random()*h()),'t':Math.round(Math.random()*5+1),'time':Math.round(Math.random()*50)});
    }
}

function drawPlayers() {
    ctx.fillStyle = 'grey';
    ctx.fillRect(20,player1.y,10,10);
    ctx.fillRect(w()-30,player2.y,10,10);
}
function drawBullets() {
    ctx.fillStyle = 'red';
    for (let i in bullets) {
        if (bullets[i]) {
            ctx.fillRect(bullets[i].x,bullets[i].y,6,2);
            if (bullets[i].x > w()-36 && bullets[i].x < w()-24 && bullets[i].y >= player2.y && bullets[i].y <= player2.y + 10) {
                endGame(1);
                break;
            }
            if (bullets[i].x > 14 && bullets[i].x < 24 && bullets[i].y >= player1.y && bullets[i].y <= player1.y + 10) {
                endGame(2);
                break;
            }
            for (let j in powers) {
                if (bullets[i].x >= powers[j].x - 6 && bullets[i].x < powers[j].x+14 && bullets[i].y >= powers[j].y && bullets[i].y <= powers[j].y + 12) {
                    if (bullets[i].d > 0) {
                        player1.powers[powers[j].type] = powerTimeOut;
                    } else {
                        player2.powers[powers[j].type] = powerTimeOut;
                    }
                    powers.splice(j,1);
                    bullets.splice(i,1);
                    break;
                }
            }
            if (bullets[i]) {
                for (let j in bullets) {
                    if (bullets[i] && bullets[j] && i!=j && bullets[i].d != bullets[j].d
                        && bullets[i].x >= bullets[j].x - 6 && bullets[i].x <= bullets[j].x
                        && bullets[i].y >= bullets[j].y - 2 && bullets[i].y <= bullets[j].y) {
                        if (i<j) {
                            bullets.splice(j,1);
                            bullets.splice(i,1);
                        } else {
                            bullets.splice(i,1);
                            bullets.splice(j,1);
                        }
                    }
                }
            }
        }
    }
}

function move() {
    if (keys.KeyW && player1.y > 0) {
        player1.y -= player1.powers['speed'] ? 2 : 1;
    }
    if (keys.KeyS && player1.y < h()-10) {
        player1.y += player1.powers['speed'] ? 2 : 1;
    }
    if (player1.y > h()-10) {
        player1.y = h()-10;
    }
    if (keys.KeyD && player1.timeUntilReload == 0) {
        bullets.push(new Bullet(player1,30, player1.powers['speedBullet'] ? 2 : 1));
        player1.timeUntilReload = Math.round(100 * 400 / h());
        if (player1.powers['rapidFire']) {
            player1.timeUntilReload = Math.round(5 * 400 / h());
        }
    } else if (player1.timeUntilReload > 0) {
        player1.timeUntilReload--;
    }
    if (keys.ArrowUp && player2.y > 0) {
        player2.y -= player2.powers['speed'] ? 2 : 1;
    }
    if (keys.ArrowDown && player2.y < h()-10) {
        player2.y += player2.powers['speed'] ? 2 : 1;
    }
    if (player2.y > h()-10) {
        player2.y = h()-10;
    }
    if (keys.ArrowLeft && player2.timeUntilReload == 0) {
        bullets.push(new Bullet(player2,w()-35, player2.powers['speedBullet'] ? 2 : 1));
        player2.timeUntilReload = Math.round(100 * 400 / h());
        if (player2.powers['rapidFire']) {
            player2.timeUntilReload = Math.round(5 * 400 / h());
        }
    } else if (player2.timeUntilReload > 0) {
        player2.timeUntilReload--;
    }
    for (let i in bullets) {
        bullets[i].x+=bullets[i].d*4*(w()/400);
        if (bullets[i].x > w() || bullets[i].x < 0) {
            bullets.splice(i,1);
        }
    }
}

function drawPowers() {
    for (let i in powers) {
        switch (powers[i].type) {
            case 'speed':
                ctx.fillStyle = 'orange';
                break;
            case 'rapidFire':
                ctx.fillStyle = 'purple';
                break;
            case 'speedBullet':
                ctx.fillStyle = 'green';
        }
        ctx.fillRect(powers[i].x,powers[i].y,10,10);
    }
}

function drawNotes() {
    ctx.fillStyle = 'black';
    ctx.font = '30px Roboto';
    ctx.fillText(player1Wins,10,30);
    ctx.fillText(player2Wins,w()-30,30);
    ctx.fillStyle = 'rgba(100,100,100,0.5)';
    ctx.fillRect(0,0,10,player1.timeUntilReload * (h()/(100 * 400 / h())));
    ctx.fillRect(w()-10,0,10,player2.timeUntilReload * (h()/(100 * 400 / h())));
    if (fullscreenAlert > 0) {
        ctx.fillStyle = 'grey';
        ctx.font = '60px Roboto';
        ctx.fillRect(20,10,w()-40,80);
        ctx.fillStyle = 'black';
        ctx.fillText('Press ESC to exit fullscreen',40,70);
        fullscreenAlert--;
    }
}

function drawScreen() {
    drawBackground();
    drawPowers();
    drawPlayers();
    drawBullets();
    drawNotes();
}

function tickPowers() {
    for (let i in player1.powers) {
        if (player1.powers[i] > 0) {
            player1.powers[i]--;
            switch (i) {
            case 'speed':
                ctx.fillStyle = 'orange';
                ctx.fillRect(10,h()-20,player1.powers[i]/3,10);
                break;
            case 'rapidFire':
                ctx.fillStyle = 'purple';
                ctx.fillRect(10,h()-40,player1.powers[i]/3,10);
                break;
            case 'speedBullet':
                ctx.fillStyle = 'green';
                ctx.fillRect(10,h()-60,player1.powers[i]/3,10);
            }
        }
    }
    for (let i in player2.powers) {
        if (player2.powers[i] > 0) {
            player2.powers[i]--;
            switch (i) {
            case 'speed':
                ctx.fillStyle = 'orange';
                ctx.fillRect(w()-player2.powers[i]/3-10,h()-20,player2.powers[i]/3,10);
                break;
            case 'rapidFire':
                ctx.fillStyle = 'purple';
                ctx.fillRect(w()-player2.powers[i]/3-10,h()-40,player2.powers[i]/3,10);
                break;
            case 'speedBullet':
                ctx.fillStyle = 'green';
                ctx.fillRect(w()-player2.powers[i]/3-10,h()-60,player2.powers[i]/3,10);
            }
        }
    }
}

let ticking = false;
function tick() {
    if (!ticking) {
        ticking = true;
        twinkle();
        genPower();
        move();
        drawScreen();
        tickPowers();
        if (inFullscreen && keys.Escape) {exitFullscreen();}
        ticking = false;
    }
}

function endGame(whoWon) {
    bullets = [];
    powers = [];
    player1 = new Player();
    player2 = new Player();
    if (whoWon == 1) {
        player1Wins++;
    } else if (whoWon==2) {
        player2Wins++;
    }
}

window.onload = () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    makeStars();
    drawBackground();
    player1 = new Player();
    player2 = new Player();
    window.addEventListener("keydown",
        function(e){
            keys[e.code] = true;
        },
    false);

    window.addEventListener('keyup',
        function(e){
            keys[e.code] = false;
        },
    false);
    setInterval(tick,1000/30);
}
function w() {
    return canvas.width;
}
function h() {
    return canvas.height;
}

function fullscreen() {
    inFullscreen = true;
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    canvas.classList.add('fullscreen');
    makeStars();
    fullscreenAlert = 5 * Math.round(1000/30);
}
function exitFullscreen() {
    inFullscreen = false;
    canvas.width = 400;
    canvas.height = 400;
    canvas.classList.remove('fullscreen');
    makeStars();
    fullscreenAlert = 0;
}
