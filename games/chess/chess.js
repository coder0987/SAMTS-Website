function generateChessPieces() {
    board = [
        [
            'br','bn','bb','bq','bk','bb','bn','br'
        ],[
            'bp','bp','bp','bp','bp','bp','bp','bp'
        ],[
            ''  ,''  ,''  ,''  ,''  ,''  ,''  ,''
        ],[
            ''  ,''  ,''  ,''  ,''  ,''  ,''  ,''
        ],[
            ''  ,''  ,''  ,''  ,''  ,''  ,''  ,''
        ],[
            ''  ,''  ,''  ,''  ,''  ,''  ,''  ,''
        ],[
            'wp','wp','wp','wp','wp','wp','wp','wp'
        ],[
            'wr','wn','wb','wq','wk','wb','wn','wr'
        ]
    ]
}

function renderPiece(type, x, y) {
    if (type=='')
        return;
    ctx.font = '48px arial';
    let uni = 'ERROR';
    let darkPieceColor = 'black';
    let lightPieceColor = 'white';
    
    switch (type) {
        case 'wr':
            uni = '♖';
            ctx.fillStyle = lightPieceColor;
            break;
        case 'wn':
            uni = '♘';
            ctx.fillStyle = lightPieceColor;
            break;
        case 'wb':
            uni = '♗';
            ctx.fillStyle = lightPieceColor;
            break;
        case 'wq':
            uni = '♕';
            ctx.fillStyle = lightPieceColor;
            break;
        case 'wk':
            uni = '♔';
            ctx.fillStyle = lightPieceColor;
            break;
        case 'wp':
            uni = '♙';
            ctx.fillStyle = lightPieceColor;
            break;
        case 'br':
            uni = '♜';
            ctx.fillStyle = darkPieceColor;
            break;
        case 'bn':
            uni = '♞';
            ctx.fillStyle = darkPieceColor;
            break;
        case 'bb':
            uni = '♝';
            ctx.fillStyle = darkPieceColor;
            break;
        case 'bq':
            uni = '♛';
            ctx.fillStyle = darkPieceColor;
            break;
        case 'bk':
            uni = '♚';
            ctx.fillStyle = darkPieceColor;
            break;
        case 'bp':
            uni = '♟';
            ctx.fillStyle = darkPieceColor;
    }
    ctx.textAlign = 'center';
    ctx.fillText(uni, x*squareSize+0.5*squareSize, (y+0.9)*squareSize,squareSize);
}

function drawChessPieces() {
    for (let r=0;r<board.length;r++) {
        for (let c=0;c<board[r].length;c++)
            renderPiece(board[r][c], c, r);
    }
}

function highlight(x,y) {
    ctx.fillStyle = 'rgba(255,255,0,0.2)';
    ctx.fillRect(x*squareSize,y*squareSize,squareSize,squareSize);
}

function drawBoard() {
    let width = 400;
    let height = 400;

    ctx.fillStyle = 'green';//None of this should be showing once we're done
    ctx.fillRect(0, 0, width, height);

    darkColor = '#654321';
    lightColor = '#C4A484';

    squareSize = width/8.0;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if ((x + y) % 2 == 0)
                ctx.fillStyle = lightColor;
            else
                ctx.fillStyle = darkColor;
            ctx.fillRect(x*squareSize,y*squareSize,squareSize,squareSize);
        }
    }
    document.getElementById('logs').innerHTML = logs;
    logs = '';
    if (winner=='w') {
        ctx.fillStyle = 'white';
        ctx.fillText('White Wins',200,200,250);
        ctx.font = '32px arial';
        ctx.fillText('Click to play again',200,250,200);
    }
    if (winner=='b') {
        ctx.fillStyle = 'black';
        ctx.fillText('Black Wins',200,200,250);
        ctx.font = '32px arial';
        ctx.fillText('Click to play again',200,250,200);
    }
}

function determineMoves(x, y) {
    let piece = '';
    try {
        piece = board[y][x].substring(1);
    } catch (error) {
        return;
    }

    let ec = ' ';
    if (board[y][x].substring(0,1)=='b') {
        ec = 'w';
    } else if (board[y][x].substring(0,1)=='w') {
        ec = 'b';
    }

    let possibleMoves = [];
    switch (piece) {
        case 'k':
            possibleMoves = [
                [x+1,y+1],
                [x+1,y],
                [x+1,y-1],
                [x,y+1],
                [x,y-1],
                [x-1,y+1],
                [x-1,y],
                [x-1,y-1]
            ];
            if (castle[0]==0&&x==4&&y==7&&board[y][x-1]==''&&board[y][x-2]==''&&board[y][x-3]=='') {
                //Add additional can't-be-in-check later
                possibleMoves.push([x-2,y]);
            }
            if (castle[1]==0&&x==4&&y==7&&board[y][x+1]==''&&board[y][x+2]=='') {
                //Add additional can't-be-in-check later
                possibleMoves.push([x+2,y]);
            }
            if (castle[2]==0&&x==4&&y==0&&board[y][x-1]==''&&board[y][x-2]==''&&board[y][x-3]=='') {
                //Add additional can't-be-in-check later
                possibleMoves.push([x-2,y]);
            }
            if (castle[3]==0&&x==4&&y==0&&board[y][x+1]==''&&board[y][x+2]=='') {
                //Add additional can't-be-in-check later
                possibleMoves.push([x+2,y]);
            }
            break;
        case 'q':
            for (let r=y+1;r<8;r++) {
                //Up the board (actually down but shhhhh)
                if (board[r][x]==''||board[r][x].substring(0,1)==ec) {
                    possibleMoves.push([x,r]);
                }
                if (board[r][x]!='') {
                    break;
                }
            }
            for (let r=y-1;r>=0;r--) {
                //Down the board (actually up but shhhhh)
                if (board[r][x]==''||board[r][x].substring(0,1)==ec) {
                    possibleMoves.push([x,r]);
                }
                if (board[r][x]!='') {
                    break;
                }
            }
            for (let c=x+1;c<8;c++) {
                //Right
                if (board[y][c]==''||board[y][c].substring(0,1)==ec) {
                    possibleMoves.push([c,y]);
                }
                if (board[y][c]!='') {
                    break;
                }
            }
            for (let c=x-1;c>=0;c--) {
                //Left
                if (board[y][c]==''||board[y][c].substring(0,1)==ec) {
                    possibleMoves.push([c,y]);
                }
                if (board[y][c]!='') {
                    break;
                }
            }
            for (let d=1;d+y<8&&d+x<8;d++) {
                //Up-Right (down-right)
                let tx = x+d;
                let ty = y+d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            for (let d=1;d+y<8&&x-d>=0;d++) {
                //Up-Left (down-left)
                let tx = x-d;
                let ty = y+d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            for (let d=1;y-d>=0&&d+x<8;d++) {
                //Down-Right (up-right)
                let tx = x+d;
                let ty = y-d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            for (let d=1;y-d>=0&&x-d>=0;d++) {
                //Down-left (up-left)
                let tx = x-d;
                let ty = y-d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            break;
        case 'r':
            for (let r=y+1;r<8;r++) {
                //Up the board (actually down but shhhhh)
                if (board[r][x]==''||board[r][x].substring(0,1)==ec) {
                    possibleMoves.push([x,r]);
                }
                if (board[r][x]!='') {
                    break;
                }
            }
            for (let r=y-1;r>=0;r--) {
                //Down the board (actually up but shhhhh)
                if (board[r][x]==''||board[r][x].substring(0,1)==ec) {
                    possibleMoves.push([x,r]);
                }
                if (board[r][x]!='') {
                    break;
                }
            }
            for (let c=x+1;c<8;c++) {
                //Right
                if (board[y][c]==''||board[y][c].substring(0,1)==ec) {
                    possibleMoves.push([c,y]);
                }
                if (board[y][c]!='') {
                    break;
                }
            }
            for (let c=x-1;c>=0;c--) {
                //Left
                if (board[y][c]==''||board[y][c].substring(0,1)==ec) {
                    possibleMoves.push([c,y]);
                }
                if (board[y][c]!='') {
                    break;
                }
            }
            break;
        case 'b':
            for (let d=1;d+y<8&&d+x<8;d++) {
                //Up-Right (down-right)
                let tx = x+d;
                let ty = y+d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            for (let d=1;d+y<8&&x-d>=0;d++) {
                //Up-Left (down-left)
                let tx = x-d;
                let ty = y+d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            for (let d=1;y-d>=0&&d+x<8;d++) {
                //Down-Right (up-right)
                let tx = x+d;
                let ty = y-d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            for (let d=1;y-d>=0&&x-d>=0;d++) {
                //Down-left (up-left)
                let tx = x-d;
                let ty = y-d;
                if (board[ty][tx]==''||board[ty][tx].substring(0,1)==ec) {
                    possibleMoves.push([tx,ty]);
                }
                if (board[ty][tx]!='') {
                    break;
                }
            }
            break;
        case 'n':
            possibleMoves = [
                [x+2,y+1],[x+2,y-1],[x-2,y+1],[x-2,y-1],[x+1,y-2],[x+1,y+2],[x-1,y+2],[x-1,y-2]
            ];
            break;
        case 'p':
            if (board[y][x].substring(0,1)=='w') {
                //Can move down (up)
                if (board[y-1][x]=='') {
                    possibleMoves = [[x,y-1]];
                    if (y==6&&board[y-2][x]=='') {
                        possibleMoves.push([x,y-2]);
                    }
                }
                try {
                    if (board[y-1][x+1].substring(0,1)==ec) {
                        possibleMoves.push([x+1,y-1]);
                    }
                } catch (error) {}
                try {
                    if (board[y-1][x-1].substring(0,1)==ec) {
                        possibleMoves.push([x-1,y-1]);
                    }
                } catch (error) {}
                if (enPassant[0]!=-1) {
                    if (y==3&&(x==enPassant[0]+1||x==enPassant[0]-1)) {
                        possibleMoves.push([enPassant[0],y-1]);
                    }
                }
            } else {
                if (board[y+1][x]=='') {
                    possibleMoves = [[x,y+1]];
                    if (y==1&&board[y+2][x]=='') {
                        possibleMoves.push([x,y+2]);
                    }
                }
                try {
                    if (board[y+1][x+1].substring(0,1)==ec) {
                        possibleMoves.push([x+1,y+1]);
                    }
                } catch (error) {}
                try {
                    if (board[y+1][x-1].substring(0,1)==ec) {
                        possibleMoves.push([x-1,y+1]);
                    }
                } catch (error) {}
                if (enPassant[0]!=-1) {
                    if (y==4&&(x==enPassant[0]+1||x==enPassant[0]-1)) {
                        possibleMoves.push([enPassant[0],y+1]);
                    }
                }
            }
            break;
    }
    highlighted = [];
    for (let i=0;i<possibleMoves.length;i++) {
        if (possibleMoves[i][0] >= 0 && possibleMoves[i][0] <= 7 && possibleMoves[i][1] >= 0 && possibleMoves[i][1] <= 7) {
            if (board[y][x].substring(0,1)!=board[possibleMoves[i][1]][possibleMoves[i][0]].substring(0,1)) {
                highlight(possibleMoves[i][0],possibleMoves[i][1]);
                highlighted.push([possibleMoves[i][0],possibleMoves[i][1]]);
            }
        }
    }
    pieceToMove = [x,y];
    if (highlighted===[])
        highlighted = null;
}

function movePiece(x, y, fx, fy) {
    switch (board[fy][fx]) {
        case 'wk':
            if (fx==4&&x==6) {
                board[y][7] = '';
                board[y][5] = 'wr';
            }
            if (fx==4&&x==2) {
                board[y][0] = '';
                board[y][3] = 'wr';
            }
            castle[0] = 1;
            castle[1] = 1;
            break;
        case 'bk':
            if (fx==4&&x==6) {
                board[y][7] = '';
                board[y][5] = 'br';
            }
            if (fx==4&&x==2) {
                board[y][0] = '';
                board[y][3] = 'br';
            }
            castle[2] = 1;
            castle[3] = 1;
            break;
        case 'wr':
            if (fx==0&&fy==7)
                castle[0] = 1;
            else if (fx==7&&fy==7)
                castle[1] = 1;
            break;
        case 'br':
            if (fx==0&&fy==0)
                castle[2] = 1;
            else if (fx==7&&fy==0)
                castle[3] = 1;
            break;
        case 'wp':
            if (y==0) {
                board[fy][fx] = 'wq';
            }
        case 'bp':
            if (y==7) {
                board[fy][fx] = 'bq';
            }
            if (enPassant[0]==x&&(enPassant[1]==y+1||enPassant[1]==y-1)) {
                board[fy][x] = '';
            }
            if (Math.abs(fy-y)==2) {
                enPassant = [x,fy];
                break;
            }
        default:
            enPassant = [-1,-1];
    }
    
    if(board[y][x]=='wk') {
        winner = 'b';
    }
    if(board[y][x]=='bk') {
        winner = 'w';
    }
    board[y][x] = board[fy][fx];
    board[fy][fx] = '';
    if (whoGo=='w') {
        whoGo='b';
        document.getElementById('turn').innerHTML = 'Black\'s Turn';
    } else {
        whoGo='w';
        document.getElementById('turn').innerHTML = 'White\'s Turn';
    }
}

function select(x, y) {
    drawBoard();
    let clickedHighlight = false;
    if (highlighted!=null) {
        for (let i=0;i<highlighted.length;i++) {
            if (highlighted[i][0]==x&&highlighted[i][1]==y) {
                clickedHighlight = true;
                break;
            }
        }
    }
    highlighted = null;
    if (clickedHighlight)
        movePiece(x,y,pieceToMove[0],pieceToMove[1]);
    else 
        try {
            let selectedColor = board[y][x].substring(0,1);
            if (selectedColor==whoGo) {
                determineMoves(x,y);
            }
        } catch (error) {

        }
    if (winner!='') {
        drawBoard();
        return;
    }
    drawChessPieces();
}

function resetBoard() {
    let c = document.getElementById("chess");
    ctx = c.getContext("2d");
    whoGo = 'w';
    highlighted = null;
    castle = [0,0,0,0];
    enPassant = [-1,-1];
    logs = '';
    winner = '';
    generateChessPieces();
    drawBoard();
    drawChessPieces();
}

window.onload = function onLoad() {
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

document.onclick = function(event) {
    // Compensate for IE<9's non-standard event model
    if (event===undefined)
        event= window.event;
    
    let target= 'target' in event? event.target : event.srcElement;

    if (target.tagName=='CANVAS' && winner=='') {
        //Attempt to take turn
        //Call function based on which square was clicked
        let pos = getMousePos(document.getElementById('chess'),event);
        let x = Math.floor(8*pos.x/400);
        let y = Math.floor(8*pos.y/400);
        if (x < 0)
            x=0;
        if (y<0)
            y=0;
        select(x,y);
    } else if (target.tagName=='CANVAS') {
        resetBoard();
    }
};
