function endGame() {
    gameOver = true;
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, 400, 400);
    ctx.font = '48px arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Final score:',200,150,350);
    ctx.fillText(-frog[1],200,200,350);
    ctx.font = '40px arial';
    ctx.fillText(parseInt(timer) + ' seconds',200,250,350);
    ctx.fillText(parseInt(-frog[1]/timer*100)/100 + ' points per second',200,300,350);
    ctx.font = '24px arial';
    ctx.fillText('Press R to restart',100,390,200); 
    clearInterval(this.interval);
}

function drawBoard() {
    let width = 400;
    let height = 400;

    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, 0, width, height);

    let gameEnding = false;

    for (let i=roads.length-1; i>=0;i--) {
        if (roads[i][0] > 23) {
            roads.splice(i,1);//Delete old roads
        } else {
            ctx.fillStyle = 'gray';
            ctx.fillRect(0,roads[i][0]*20+visiFrog[1],400,20);
            ctx.fillStyle = 'red';
            for (let c=roads[i].length-1;c>=2;c--) {
                if (roads[i][c]<-20 || roads[i][c] > 420) {
                    roads[i].splice(c,1);
                    if (roads[i][1]>0&&Math.random()>0.9) {roads[i].push(-10);} else if (roads[i][1]<0&&Math.random()>0.9) {roads[i].push(410);}
                }
                ctx.fillRect(roads[i][c],roads[i][0]*20+2+visiFrog[1],20,16);
                if (roads[i][0]*20+visiFrog[1] < 16*20 && roads[i][0]*20+visiFrog[1] > 14*20 && roads[i][c] >= visiFrog[0]/10*9 && roads[i][c] <= visiFrog[0]/10*11) {
                    gameEnding = true;
                }
            }
        }
    }

    if (frog[0]*20 > visiFrog[0]) {
        visiFrog[0]+=2;
    } else if (frog[0]*20 < visiFrog[0]) {
        visiFrog[0]-=2;
    }
    if (0 > visiFrog[1]) {
        visiFrog[1]+=2;
    } else if (0 < visiFrog[1]) {
        visiFrog[1]-=2;
    }
    
    
    ctx.fillStyle = skinColor;
    ctx.fillRect(visiFrog[0],15*20,20,20);
    ctx.font = '24px arial';
    ctx.fillStyle = 'black';
    ctx.fillText(-frog[1] + '',350,20,50);
    ctx.fillText(parseInt(timer),20,20,50);
    if (tapping > 0) {
        ctx.fillStyle = 'rgba(0,255,0,0.1)';
        ctx.fillRect(300,0,100,400);
        ctx.fillRect(0,0,100,400);
        ctx.fillRect(0,300,400,100);
    }
    if (gameEnding) {
        endGame();
    }
}

function road() {
    //Creates a road
    if (Math.random() > 0.3) {
        roads.push([0,Math.random() > 0.5 ? -0.5-Math.random() : 0.5+Math.random(),(Math.random()*20)]);
        for (let c=Math.round(Math.random()*3); c<3;c++) {
            roads[roads.length-1].push(Math.random()*200);
        }
    }
}

function up() {frog[1] -= 1;visiFrog[1]-=20; for (let i=0;i<roads.length;i++) roads[i][0]++;}
function down() {frog[1] += 1;visiFrog[1]+=20; for (let i=0;i<roads.length;i++) roads[i][0]--;}
function left() {frog[0] -= 1;}
function right() {frog[0] += 1;}

function cars() {
    for (let i=0;i<roads.length;i++) {
        //Move cars along the road and spawn new cars
        for (let c=2;c<roads[i].length;c++) {
            roads[i][c]+=roads[i][1];
            if (roads[i][1]>0) {
                if (Math.random()>0.998 && roads.length < 50 && roads[i].length<20)
                    roads[i].push(-10);
            } else {
                if (Math.random()>0.998 && roads.length < 50 && roads[i].length<20)
                    roads[i].push(410);
            }
        }
        //Spawn cars on all roads that don't have cars
        if (roads[i].length==2) {
            if (roads[i][1]>0)
                roads[i].push(-10);
            else
                roads[i].push(410);
        }
    }
}

function tick() {
    if (!gameOver) {
        let moveUp      = (pressedKeys[87] || pressedKeys[38] || tapV === 0) && !(tempKeys[87] || tempKeys[38] || tapV === 1);
        let moveDown    = (pressedKeys[83] || pressedKeys[40] || tapV === 1) && !(tempKeys[83] || tempKeys[40] || tapV === 0);
        let moveRight   = (pressedKeys[68] || pressedKeys[39] || tapH === 0) && !(tempKeys[68] || tempKeys[39] || tapH === 1);
        let moveLeft    = (pressedKeys[65] || pressedKeys[37] || tapH === 1) && !(tempKeys[65] || tempKeys[37] || tapH === 0);
        if (moveUp && !moveDown) {
            up();
        } else if (moveDown && !moveUp && frog[1] - 3 < topY) {
            down();
        }
        if (moveRight && !moveLeft && frog[0] < 19) {
            right();
        } else if (moveLeft && !moveRight && frog[0] > 0) {
            left();
        }
        if (frog[1] < topY) {
            road();
            topY = frog[1];
        }
        if (pressedKeys[80]) {
            skinColor = 'pink';
        } else if (pressedKeys[71]) {
            skinColor = 'green';
        } else if (pressedKeys[66]) {
            skinColor = 'blue';
        } else if (pressedKeys[85]) {
            skinColor = 'purple';
        } else if (pressedKeys[69]) {
            skinColor = 'red';
        }

        cars();
        drawBoard();
        tempKeys = {...pressedKeys};
        tapH = -1;
        tapV = -1;
        timer += 0.016;
    }
}

function starterRoads() {
    roads = [];
    for (let i = 0; i < 15; i+=Math.round(Math.random()-0.4)+1)
        if (Math.random() > 0.3) {
            roads.push([i,Math.random() > 0.5 ? -0.5-Math.random() : 0.5+Math.random(),(Math.random()*20)]);
            for (let c=Math.round(Math.random()*3); c<3;c++) {
                roads[roads.length-1].push(Math.random()*200);
            }
        }
}

function resetBoard() {
    resetable = false;
    ctx.textAlign = 'center';
    frog = [10,0];
    visiFrog = [200,0];
    starterRoads();
    topY = frog[1];
    gameOver = false;
    pressedKeys = {'w':false};
    tempKeys = {};
    window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
    window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; if (resetable&&e.keyCode == 82) resetBoard(); tapping = -1; }
    timer = 0;
    drawBoard();
    clearInterval(this.interval);
    this.interval = setInterval(tick, 16);
    resetable = true;
}

window.onload = function onLoad() {
    let c = document.getElementById("frogger");
    ctx = c.getContext("2d");
    skinColor = 'green';
    tapH = -1;
    tapV = -1;
    tapping = -1;
    resetBoard();
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

document.onclick= function(event) {
    // Compensate for IE<9's non-standard event model
    if (event===undefined)
        event= window.event;
    
    let target= 'target' in event? event.target : event.srcElement;

    if (target.tagName=='CANVAS' && !gameOver) {
        //Move froggo
        let pos = getMousePos(document.getElementById("frogger"),event);
        if (pos.y > 300) {
            tapV = 1;
        } else if (pos.y < 200) {
            tapV = 0;
        }
         if (pos.x > 300) {
            tapH = 0;
        } else if (pos.x < 100) {
            tapH = 1;
        }

        tapping = 1;

    } else if (target.tagName=='CANVAS') {
        resetBoard();
    }
};