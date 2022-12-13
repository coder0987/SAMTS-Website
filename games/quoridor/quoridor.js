let winner = -1;
let walls;
let ctx;
let menu;
let menuHover = [false,false];
let mouse = {'x':0,'y':0};
let playerCount;
let players;
let turn = -1;
let currentHover = {'x':-1,'y':-1,'r':-1};
const squareSize = 400/11.0;
let checking = false;

function generateBoard() {
    players = [];
    let playerColors = ['#D12F0A','#04AEA5','#28D015','#F76BD1'];
    if (playerCount == 2) {
        players = [{'x':4,'y':0,'walls':10,'color':playerColors[0]},{'x':4,'y':8,'walls':10,'color':playerColors[2]}];
    } else if (playerCount == 4) {
        players = [{'x':4,'y':0,'walls':5,'color':playerColors[0]},{'x':8,'y':4,'walls':5,'color':playerColors[1]}
            ,{'x':4,'y':8,'walls':5,'color':playerColors[2]},{'x':0,'y':4,'walls':5,'color':playerColors[3]}];
    }
    walls = [];//r (rotation 0=horizontal 1=vertical), x, y
}

function drawPlayers() {
    for (let i in players) {
        ctx.fillStyle = players[i]['color'];
        ctx.fillRect(squareSize*(players[i]['x']+1)+10,squareSize*(players[i]['y']+1)+10,squareSize-20,squareSize-20);
    }
}

function drawWalls() {
    ctx.fillStyle = 'black';
    for (let i in walls) {
        if (walls[i]['r']==0) {
            //Horizontal
            ctx.fillRect(squareSize*(walls[i]['x']+1)-5, squareSize*(walls[i]['y']+1)-5,
                squareSize*2+10,10);
        } else {
            //Vertical
            ctx.fillRect(squareSize*(walls[i]['x']+1)-5, squareSize*(walls[i]['y']+1)-5,
                10,squareSize*2+10);
        }
    }
    ctx.fillStyle = 'white';
    ctx.font = '24px arial';
    ctx.fillText(players[0]['walls'],200,25);
    if (playerCount > 2) {
        ctx.fillText(players[1]['walls'],380,200);
        ctx.fillText(players[2]['walls'],200,390);
        ctx.fillText(players[3]['walls'],20,200);
    } else {
        ctx.fillText(players[1]['walls'],200,390);
    }
}

function drawHover() {
    if (currentHover['x'] != -1 && currentHover['y'] != -1) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        if (currentHover['r'] == 2) {
            //Square selected
            ctx.fillStyle = 'rgba(0,255,0,0.2)';
            ctx.fillRect(squareSize*(currentHover['x']),squareSize*(currentHover['y']),squareSize,squareSize);
        } else if (currentHover['r'] == 1) {
            //Vertical wall
            ctx.fillRect(squareSize*(currentHover['x'])-5, squareSize*(currentHover['y'])-5,
                10,squareSize*2+10);
        } else if (currentHover['r'] == 0) {
            //Horizontal wall
            ctx.fillRect(squareSize*(currentHover['x'])-5, squareSize*(currentHover['y'])-5,
                squareSize*2+10,10);
        }
    }
}

function drawBoard() {
    let width = 400;
    let height = 400;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    if (playerCount == 2) {
        ctx.fillStyle = players[0]['color'];
        ctx.fillRect(0, 200, width, 200);
        ctx.fillStyle = players[1]['color'];
        ctx.fillRect(0, 0, width, 200);
    } else if (playerCount == 4) {
        ctx.fillStyle = players[0]['color'];
        ctx.fillRect(squareSize, height-squareSize, width-squareSize*2, squareSize);
        ctx.fillStyle = players[1]['color'];
        ctx.fillRect(0, squareSize, squareSize, height-squareSize*2);
        ctx.fillStyle = players[2]['color'];
        ctx.fillRect(squareSize, 0, width-squareSize*2, squareSize);
        ctx.fillStyle = players[3]['color'];
        ctx.fillRect(width-squareSize, squareSize, squareSize, height-squareSize*2);
    }

    let darkColor = '#654321';
    let lightColor = '#C4A484';

    //Checkered squares
    for (let y = 1; y < 10; y++) {
        for (let x = 1; x < 10; x++) {
            if ((x + y) % 2 == 0)
                ctx.fillStyle = lightColor;
            else
                ctx.fillStyle = darkColor;
            ctx.fillRect(x*squareSize,y*squareSize,squareSize,squareSize);
        }
    }
    drawPlayers();
    drawWalls();
    drawHover();
    if (~turn) {
        document.getElementById('turn').innerHTML = 'Player ' + (turn+1) + '\'s Turn';
        document.getElementById('turn').style.color = players[turn]['color'];
    } else {
        document.getElementById('turn').innerHTML = '';
    }
}

function tick() {
    if (!menu && turn >= 0) {
        hoverBoard();
        drawBoard();
    }
}
function vWallAtPlace(x,y,r,vWalls) {
    for (let i in vWalls) {
        if (vWalls[i]['r'] == r) {
            if (r == 0) {
                if ((vWalls[i]['x'] == x || vWalls[i]['x']+1 == x) && vWalls[i]['y'] == y)
                    return true;
            } else {
                if ((vWalls[i]['y'] == y || vWalls[i]['y']+1 == y) && vWalls[i]['x'] == x)
                    return true;
            }
        }
    }
    return false;
}
function wallAtPlace(x,y,r) {
    return vWallAtPlace(x,y,r,walls);
}

function playerAtPlace(x,y) {
    for (let i in players) {
        if (players[i]['x'] == x && players[i]['y'] == y)
            return true;
    }
    return false;
}

function vPlayerCanMoveTo(x,y,cx,cy,vWalls) {

    if (playerAtPlace(x,y))
        return false;//Cannot move onto players

    if (Math.abs(cy-y) + Math.abs(cx-x) >= 3) {
        return false;//Cannot move more than 2 spaces
    }

    //Standard move: horizontal
    if (Math.abs(cx-x)==1 && y==cy) {
        //walls
        if ((cx-x == -1 && !vWallAtPlace(x,y,1,vWalls)) || (cx-x == 1 && !vWallAtPlace(x+1,y,1,vWalls))) {
            return true;
        } else {
            return false;
        }
    }
    //Standard move: vertical
    if (Math.abs(cy-y)==1 && x==cx) {
        //walls
        if ((cy-y == -1 && !vWallAtPlace(x,y,0,vWalls)) || (cy-y == 1 && !vWallAtPlace(x,y+1,0,vWalls))) {
            return true;
        } else {
            return false;
        }
    }
    //Jump: up
    if (cy-y == 2 && x-cx == 0) {
        if (playerAtPlace(x,y+1) && !vWallAtPlace(x,y+1,0,vWalls) && !vWallAtPlace(x,y+2,0,vWalls)) {
            return true;
        } else {
            return false;
        }
    }

    //Jump: down
    if (cy-y == -2 && x-cx == 0) {
        if (playerAtPlace(x,y-1) && !vWallAtPlace(x,y,0,vWalls) && !vWallAtPlace(x,y-1,0,vWalls)) {
            return true;
        } else {
            return false;
        }
    }

    //Jump: left
    if (cx-x == 2 && y-cy == 0) {
        if (playerAtPlace(x+1,y) && !vWallAtPlace(x,y,1,vWalls) && !vWallAtPlace(x+1,y,1,vWalls)) {
            return true;
        } else {
            return false;
        }
    }

    //Jump: right
    if (cx-x == -2 && y-cy == 0) {
        if (playerAtPlace(x-1,y) && !vWallAtPlace(x-1,y,1,vWalls) && !vWallAtPlace(x-2,y,1,vWalls)) {
            return true;
        } else {
            return false;
        }
    }

    //IMPORTANT NOTE: WALLS ARE ON THE TOP-LEFT OF SQUARES

    //Up-left
    if (cx-x == 1 && cy-y == 1) {
        //Player above
        if (playerAtPlace(cx,cy-1) && !vWallAtPlace(cx,cy,0,vWalls) && !vWallAtPlace(cx,y,1,vWalls) && vWallAtPlace(cx,cy-1,0,vWalls)) {
            return true;
        }
        //Player left
        if (playerAtPlace(cx-1,cy) && !vWallAtPlace(cx,cy,1,vWalls) && !vWallAtPlace(x,y-1,0,vWalls) && vWallAtPlace(cx-1,cy,1,vWalls)) {
            return true;
        }
        return false;
    }

    //Up-right
    if (cx-x == -1 && cy-y == 1) {
        //Player above
        if (playerAtPlace(cx,cy-1) && !vWallAtPlace(cx,cy,0,vWalls) && !vWallAtPlace(cx+1,y,1,vWalls) && vWallAtPlace(cx,cy-1,0,vWalls)) {
            return true;
        }
        //Player right
        if (playerAtPlace(cx+1,cy) && !vWallAtPlace(cx+1,cy,1,vWalls) && !vWallAtPlace(x,y-1,0,vWalls) && vWallAtPlace(cx+2,cy,1,vWalls)) {
            return true;
        }
        return false;
    }

    //Down-left
    if (cx-x == 1 && cy-y == -1) {
        //Player down
        if (playerAtPlace(cx,cy+1) && !vWallAtPlace(cx,cy+1,0,vWalls) && !vWallAtPlace(cx,cy+1,1,vWalls) && vWallAtPlace(cx,cy+2,0,vWalls)) {
            return true;
        }
        //Player left
        if (playerAtPlace(cx-1,cy) && !vWallAtPlace(cx,cy,1,vWalls) && !vWallAtPlace(cx-1,cy+1,0,vWalls) && vWallAtPlace(cx-1,cy,1,vWalls)) {
            return true;
        }
        return false;
    }

    //Down-right
    if (cx-x == -1 && cy-y == -1) {
        //Player below
        if (playerAtPlace(cx,cy+1) && !vWallAtPlace(cx,cy+1,0,vWalls) && !vWallAtPlace(cx+1,cy+1,1,vWalls) && vWallAtPlace(cx,cy+2,0,vWalls)) {
            return true;
        }
        //Player right
        if (playerAtPlace(cx+1,cy) && !vWallAtPlace(cx+1,cy,1,vWalls) && !vWallAtPlace(cx+1,cy+1,0,vWalls) && vWallAtPlace(cx+2,cy,1,vWalls)) {
            return true;
        }
        return false;
    }

    //Default return (should never be used)
    console.log('Allowed by default');
    return true;
}

function playerCanMoveTo(x,y) {
    x -= 1;//Offset for the board
    y -= 1;

    let currentPlayer = players[turn];
    let cx = currentPlayer['x'];
    let cy = currentPlayer['y'];

    return vPlayerCanMoveTo(x,y,cx,cy,walls);
}

function correctEdgeIsTrue(matrix, p) {
    switch(p) {
        case 0:
            for (let i=0;i<9;i++)
                if (matrix[8][i]) return true;
            break;
        case 1:
            if (playerCount == 2) {
                for (let i=0;i<9;i++)
                    if (matrix[0][i]) return true;
            } else {
                for (let i=0;i<9;i++) {
                    if (matrix[i][0]) return true;
                }
            }
            break;
        case 2:
            for (let i=0;i<9;i++)
                if (matrix[0][i]) return true;
            break;
        case 3:
            for (let i=0;i<9;i++)
                if (matrix[i][8]) return true;
    }
    return false;
}

function redGreenMatrix(matrixString) {
    let i = 0;
    while (i+'true'.length < matrixString.length) {
        if (matrixString.substring(i,i+'true'.length)=='true') {
            let tempString = matrixString.substring(0,i);
            tempString += '\x1b[38;2;0;255;0m';
            let secondTemp = matrixString.substring(i,i+'true'.length);
            secondTemp += '\x1b[0m';
            let thirdTemp = matrixString.substring(i+'true'.length);
            i += '\x1b[38;2;0;255;0m'.length + '\x1b[0m'.length;
            matrixString = tempString + secondTemp + thirdTemp;
        }
        i++;
    }
    return matrixString;
}

function playerHasPathToEdge(x,y,r) {
    //Checks if every player can reach their destination edge if a wall is placed at x,y,r
    let tempWalls = [...walls];
    tempWalls.push({'x':x,'y':y,'r':r});

    let playerCounter = 0;

    for (let p = 0; p < playerCount; p++) {
        let tempBoard = [];
        let tempRow = [];
        for (let i=0;i<9;i++)
            tempRow.push(false);
        for (let i=0;i<9;i++)
            tempBoard.push([...tempRow]);

        tempBoard[players[p]['y']][players[p]['x']] = true;//The player can reach the space he/she is already on

        for (let i=0; i<72;i++) {//It should never take more than 72 iterations to discover if the player can reach his/her goal
            if (correctEdgeIsTrue(tempBoard,p)) {playerCounter++; break;}
            for (let r=0;r<9;r++) { //r is y
                for (let c=0;c<9;c++) {//c is x
                    if (tempBoard[r][c]) {
                        for (let y = -2; y<3; y++) {
                            for (let x = -2; x<3; x++) {
                                if (r+y >= 0 && r+y < 9 && c+x >= 0 && c+x < 9 &&
                                    !tempBoard[r+y][c+x] && vPlayerCanMoveTo(c+x,r+y,c,r,tempWalls)) {
                                    tempBoard[r+y][c+x] = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return playerCounter == playerCount;
}

function wallCanBePlacedAt(x,y,r) {
    x-=1;y-=1;
    if (wallAtPlace(x,y,r)) {
        return false;
    }
    if (r==1) {
        if (wallAtPlace(x,y+1,r)) return false;//Intersects with another wall of the same direction
        for (let i in walls) {
            if (walls[i]['r']==0 && walls[i]['x'] == x-1 && walls[i]['y'] == y+1)
                return false; //Wall goes through the center of another wall
        }
    } else {
        if (wallAtPlace(x+1,y,r)) return false;
        for (let i in walls) {
            if (walls[i]['r']==1 && walls[i]['x'] == x+1 && walls[i]['y'] == y-1)
                return false;
        }
    }

    if (x==0 && r == 1) return false;
    if (x==8 && r == 0) return false;
    if (y==0 && r == 0) return false;
    if (y==8 && r == 1) return false;
    if (x<0 || y<0) return false;
    if (x>8 || y>8) return false;

    if (!playerHasPathToEdge(x,y,r))
        return false;

    return true;
}

function hoverBoard() {
    let set = false;
    if (Math.floor(mouse['x'] / squareSize) <= 9
        && Math.floor(mouse['y'] / squareSize) <= 9
        && Math.floor(mouse['x'] / squareSize) > 0
        && Math.floor(mouse['y'] / squareSize) > 0) {

        if (playerCanMoveTo(Math.floor(mouse['x'] / squareSize),Math.floor(mouse['y'] / squareSize))) {
            currentHover['x'] = Math.floor(mouse['x'] / squareSize);
            currentHover['y'] = Math.floor(mouse['y'] / squareSize);
            currentHover['r'] = 2;
            set = true;
        }
        if (players[turn]['walls'] > 0) {
            if (mouse['x'] % squareSize < 5
                || mouse['x'] % squareSize > squareSize - 5
                && Math.floor(mouse['y'] / squareSize) < 9) {

                let tx = Math.floor(mouse['x'] / squareSize);
                let ty = Math.floor(mouse['y'] / squareSize);
                let tr = 1;
                if (mouse['x'] % squareSize > squareSize - 5) {
                    tx += 1;
                }
                if (checking) return;
                checking = true;
                if (wallCanBePlacedAt(tx,ty,tr)) {
                    currentHover['x'] = tx;
                    currentHover['y'] = ty;
                    currentHover['r'] = tr;
                    set = true;
                }
                checking = false;
            } else if (mouse['y'] % squareSize < 5
                || mouse['y'] % squareSize > squareSize - 5
                && Math.floor(mouse['x'] / squareSize) < 9) {

                let tx = Math.floor(mouse['x'] / squareSize);
                let ty = Math.floor(mouse['y'] / squareSize);
                let tr = 0;
                if (mouse['y'] % squareSize > squareSize - 5) {
                    ty += 1;
                }
                if (checking) return;
                checking = true;
                if (wallCanBePlacedAt(tx,ty,tr)) {
                    currentHover['x'] = tx;
                    currentHover['y'] = ty;
                    currentHover['r'] = tr;
                    set = true;
                }
                checking = false;
            }
        }
    }
    if (!set) {
        currentHover['x'] = -1;
        currentHover['y'] = -1;
        currentHover['r'] = -1;
    }
}

function twoP(hover) {
    if (hover)
        ctx.fillStyle = 'gray';
    else
        ctx.fillStyle = 'white';
    ctx.fillRect(100,100,200,75);

    ctx.fillStyle = 'black';
    ctx.fillText('2 Player',200,150,300);

    menuHover[0] = hover;
}

function fourP(hover) {
    if (hover)
        ctx.fillStyle = 'gray';
    else
        ctx.fillStyle = 'white';
    ctx.fillRect(100,225,200,75);

    ctx.fillStyle = 'black';
    ctx.fillText('4 Player',200,275,300);

    menuHover[1] = hover;
}

function openMenu() {
    menu = true;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 400, 400);

    //Title
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '48px arial';
    ctx.fillText('Quoridor', 200, 50,300);

    twoP(false);
    fourP(false);
}

function resetBoard() {
    this.interval = setInterval(tick,33);//30 FPS
    let c = document.getElementById("quoridor");
    ctx = c.getContext("2d");
    winner = -1;
    players = [];
    turn = -1;
    openMenu();
}

function startGame(numPlayers) {
    playerCount = numPlayers;
    generateBoard();
    turn = 0;
}

window.onload = function onLoad() {
    document.getElementById("quoridor").addEventListener('mousemove', e => {
        mouseMove(e);
    });
    resetBoard();
}

function playerWon(p) {
    clearInterval(this.interval);
    turn = -1;
    winner = p;
    ctx.fillStyle = players[p]['color'];
    ctx.fillRect(0,0,400,400);
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('Player ' + (p+1) + ' Wins!', 200, 200, 350);
    ctx.font = '24px Arial';
    ctx.fillText('click to restart', 200, 300, 250);
}

function winCheck() {
    if (players[0]['y'] == 8)
        playerWon(0);
    if ((playerCount==2 && players[1]['y']==0) || playerCount==4&&players[1]['x']==0)
        playerWon(1);
    if (playerCount==4) {
        if (players[2]['y']==0)
            playerWon(2);
        if (players[3]['x']==8)
            playerWon(3);
    }
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

document.onclick = function(event) {
    // Compensate for IE<9's non-standard event model
    if (event===undefined)
        event= window.event;

    let target= 'target' in event? event.target : event.srcElement;

    if (target.tagName=='CANVAS' && winner==-1) {
        //Click made
        if (~turn) {
            if (players[turn]['walls'] > 0 && (currentHover['r'] == 0 || currentHover['r'] == 1)) {
                players[turn]['walls'] -= 1;
                walls.push({'x':currentHover['x']-1,'y':currentHover['y']-1,'r':currentHover['r']});
                turn = (turn + 1) % playerCount;
            } else if (currentHover['r'] == 2) {
                players[turn]['x'] = currentHover['x']-1;
                players[turn]['y'] = currentHover['y']-1;
                winCheck();
                if (!~winner)
                    turn = (turn + 1) % playerCount;
            }
        } else if (menu) {
            if (menuHover[0]) {
                menu = false;
                startGame(2);
            } else if (menuHover[1]) {
                menu = false;
                startGame(4);
            }
        }

    } else if (target.tagName=='CANVAS') {
        resetBoard();
    }
};

function mouseMove(u) {
    let pos = getMousePos(document.getElementById('quoridor'),u);
    mouse['x'] = pos['x'];
    mouse['y'] = pos['y'];
    if (menu) {
        if (mouse['x'] > 100 && mouse['x'] < 275) {
            if (mouse['y'] > 100 && mouse['y'] < 175) {
                twoP(true);
            } else if (menuHover[0]) {
                twoP(false);
            }
            if (mouse['y'] > 225 && mouse['y'] < 300) {
                fourP(true);
            } else if (menuHover[1]) {
                fourP(false);
            }
        } else if (menuHover[0]) {
            twoP(false);
        } else if (menuHover[1]) {
            fourP(false);
        }
    }
}


//POWER COMMANDS (For debugging)
function sPL(p,x,y) {//Set Player Location (0 is top, continues clockwise)
    players[p]['x'] = x;
    players[p]['y'] = y;
}
function sWC(p,c) {//Set Wall Count
    players[p]['walls'] = c;
}
function setTurn(p) {
    turn = p;
}
function printCoords(p) {
    console.log('X: ' + players[p]['x'] + ', Y: ' + players[p]['y']);
}
function placeWall(x,y,r) {
    walls.push({'x':x,'y':y,'r':r});
}