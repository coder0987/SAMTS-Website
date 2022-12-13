let ctx;
let barriers = [];
let distanceSinceLastBarrier = 100;
let players;
let startTime;
let livingPlayers = 0;
let currentSpeed = 1;
let previousFitness;
let roundNumber = 1;
let keys = {};

let timeout = 50 * 1000;
let distanceBetweenBarriers = 100;
let baseSpeed = 1;
let speedAdjustmentsPerBarrier = 0.1;
let maxSpeed = 5;
let barrierHeight = 60;
let populationSize = 50;
let aiWidth = 20;
let aiHeight = 20;
let mutationRate = 0.1;
let crazyMutationChance = 0.01;

let canvas;

function Barrier(x) {
  this.x = x;
}

function generateRandomAI() {
	//Inputs: distance to next barrier, current speed. Outputs: should jump
    //Size: 50x10
    const height = aiHeight;
    const width = aiWidth;
    const inputLength  = 2;
    const outputLength = 1;
    let entirety = [];
    entirety.push([]);
    for (let j=0; j<inputLength; j++) {
        entirety[0].push([]);
        for (let i=0; i<height; i++) {
  			//Each w/b combo corresponds to one input and one output
  			entirety[0][j].push({'w':(Math.random()*2)-1, 'b':(Math.random()*2)-1});
  		}
    }
    for (let e=1; e<width-1;e++) {
  	    entirety.push([]);
	    //For each column in the matrix
        for (let j=0; j<height;j++) {
            //For each row in the columns
            entirety[e].push([]);
            for (let k=0; k<height;k++) {
                //For each row in the previous column
                entirety[e][j].push({'w':(Math.random()*2)-1, 'b':(Math.random()*2)-1});
            }
  	    }
    }
    entirety.push([]);
    for (let j=0; j<outputLength; j++) {
    	entirety[width-1].push([]);
        for (let i=0; i<height; i++) {
  			//Each w/b combo corresponds to one output
  			entirety[width-1][j].push({'w':(Math.random()*2)-1, 'b':(Math.random()*2)-1});
  		}
    }
    return entirety;
}

function combineAndMutate(ai1, ai2) {
	let newAI = [];
    let tempMutationRate = mutationRate;
    if (Math.random() < crazyMutationChance) {
        tempMutationRate += 5;
    }
	for (let i in ai1) {
        newAI.push([]);
        for (let j in ai1[i]) {
            newAI[i].push([]);
            for ( let k in ai1[i][j]) {
                newAI[i][j].push({'w':(
                    (ai1[i][j][k].w + ai2[i][j][k].w)/2 + (Math.random()*tempMutationRate)-tempMutationRate/2
                ), 'b': (
                    (ai1[i][j][k].b + ai2[i][j][k].b)/2 + (Math.random()*tempMutationRate)-tempMutationRate/2
                )});
            }
        }
    }
    return newAI;
}

function evaluateAI(ai, inputs, outputNumber) {
	let currentRow = inputs;
	for (let i in ai) {
        let nextRow = [ai[i].length];
        for (let j in currentRow) {
            for (let k in nextRow) {
                nextRow[k] += currentRow[j] * ai[i][j][k].w + ai[i][j][k].b;
            }
        }
        currentRow = [].concat(nextRow);
    }
    return currentRow[outputNumber];
}

function AI(ai1, ai2, setAi) {
	if (ai1 == -1) {
  	    ai1 = generateRandomAI();
    }
    if (ai2 == -1) {
  	    ai2 = generateRandomAI();
    }
    if (setAi) {
        this.ai = setAi;
    } else {
        try {
            this.ai = combineAndMutate(ai1,ai2);
        } catch (e) {
            console.log(JSON.stringify(ai1,null,1) + '\n ' + JSON.stringify(ai2,null,1));
        }
    }
    this.shouldJump = () => {
        if (!barriers[0]) {
            return 0;
        }
  	    return evaluateAI(this.ai, [barriers[0].x, currentSpeed], 0);
    }
}

function Player(ai1, ai2, setAi) {
	ai1 = ai1 || -1;
    ai2 = ai2 || -1;
    this.y = 0;
    this.yVelocity = 0;
    this.alive = true;
    this.fitness = -1;
    if (setAi) {
        this.ai = setAi;
    } else {
        this.ai = new AI(ai1, ai2);
    }
}

function fillBackground() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 300, 400, 100);
}

function loadingScreen() {
  fillBackground();
  ctx.fillStyle = 'black';
  ctx.fillText('Loading...',160,200)
}

function drawBarriers() {
  ctx.fillStyle = 'red';
  for (let i in barriers) {
    ctx.fillRect(barriers[i].x, 300-barrierHeight, 20, barrierHeight);
  }
}

function drawPlayer() {
    let startPlayer = roundNumber != 1 ? 2 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
	for (let i=startPlayer; i<players.length; i++) {
        if (players[i].alive) {
            ctx.fillRect(20, 290 - players[i].y, 10, 10);
        }
    }
    if (roundNumber != 1) {
        if (players[1] && players[1].alive) {
            ctx.fillStyle = 'silver';
            ctx.fillRect(20, 290 - players[1].y, 10, 10);
        }
        if (players[0] && players[0].alive) {
            ctx.fillStyle = 'gold';
            ctx.fillRect(20, 290 - players[0].y, 10, 10);
        }
    }
}

function drawNotes() {
    ctx.font = "30px Roboto"
    ctx.fillStyle = 'black';
    ctx.fillText('Generation: ' + roundNumber, 10,30);
    ctx.fillText('Living Players: ' + livingPlayers, 10,60);
    ctx.fillText('Time left: ' + ((timeout + startTime - Date.now())/1000),10,90);
    if (roundNumber>1){ctx.fillText('Best Time: ' + Math.round(previousFitness/1000), 10,120);}
}

function drawScreen() {
  fillBackground();
  drawNotes();
  drawBarriers();
  drawPlayer();
}

function moveBarriers() {
  for (let i in barriers) {
    barriers[i].x-=currentSpeed;
    if (barriers[i].x < -20) {
      barriers.splice(i, 1);
    }
  }
}

function movePlayers() {
  for (let i in players) {
    if (players[i].alive) {
      if (players[i].y + players[i].yVelocity < 1) {
        players[i].y = 0;
        players[i].yVelocity = 0;
        let jumpVelocity = 10;
        try {
            jumpVelocity = players[i].ai.shouldJump()
        } catch (e) {
            console.log(JSON.stringify(players[i].ai));
        }
        if (jumpVelocity > 0) {
        	players[i].yVelocity = jumpVelocity;
        }
      } else {
        players[i].y += players[i].yVelocity;
        players[i].yVelocity -= 3.8 / 30;
      }
    }
  }
}

function moveBoard() {
  moveBarriers();
  movePlayers();
}

function generateBarriers() {
  if (distanceSinceLastBarrier > distanceBetweenBarriers) {
    barriers.push(new Barrier(400));
    currentSpeed += speedAdjustmentsPerBarrier;
    if (currentSpeed > maxSpeed) {currentSpeed = maxSpeed;}
    distanceSinceLastBarrier = 0;
  } else {
    distanceSinceLastBarrier++;
  }
}

function shouldEndRound() {
	if (Date.now() - startTime > timeout) {
        for (let i in players) {
            if (players[i].alive) {
                players[i].fitness = Date.now() - startTime;
            }
        }
  	    return true;
    }
    livingPlayers = 0;
    for (let i in players) {
  	    if (players[i].alive) {
    	    livingPlayers++;
        }
    }
    if (livingPlayers > 0) {return false;}
    return true;
}

function collisionCheck() {
  for (let i in players) {
    if (players[i].alive && ((players[i].y < barrierHeight-5 && barriers[0] && barriers[0].x < 30 && barriers[0].x > 0) || players[i].y > 300)) {
      players[i].alive = false;
      players[i].fitness = Date.now() - startTime;
    }
  }
}

function nextRound() {
  loadingScreen();
  barriers = [];
  //Get the best players from the previous round
        let best = 0;
        let secondBest = 1;
        if (players[secondBest].fitness > players[best].fitness) {
            let temp = best;
            best = secondBest;
            secondBest = temp;
        }
        for (let i in players) {
            if (players[i].fitness > players[secondBest].fitness && i != 0) {
                secondBest = i;
            }
            if (players[secondBest].fitness > players[best].fitness) {
                let temp = best;
                best = secondBest;
                secondBest = temp;
            }
        }

        let ai1 = new AI(0,0,JSON.parse(JSON.stringify(players[best].ai)).ai);
        let ai2 = new AI(0,0,JSON.parse(JSON.stringify(players[secondBest].ai)).ai);

        previousFitness = players[best].fitness;
        roundNumber++;
        currentSpeed = baseSpeed;
        distanceSinceLastBarrier = distanceBetweenBarriers;
        instantiatePlayers(populationSize, ai1, ai2);
        startTime = Date.now();
}

function roundHandler() {
	if (shouldEndRound()) {
      nextRound();
    }
}

let ticking = false;

function tick() {
  if (!ticking) {
    ticking = true;
    drawScreen();
    generateBarriers();
    moveBoard();
    collisionCheck();
    roundHandler();
    if (inFullscreen && keys.Escape) {exitFullscreen();}
    ticking = false;
  }
}

function instantiatePlayers(numPlayers, ai1, ai2) {
    players = [];
    let ai1Params = ai1 ? ai1.ai : -1;
    let ai2Params = ai2 ? ai2.ai : -1;
    if (ai1) {
        players[0] = new Player(1,1,ai1);
    } 
    if (ai2) {
        players[1] = new Player(1,1,ai2);
    }
    for (let i = (ai1 && ai2) ? 2 : 0; i < numPlayers; i++) {
        players[i] = new Player(ai1Params, ai2Params);
    }
}

window.onload = () => {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d');
  instantiatePlayers(populationSize);
  startTime = Date.now();
  tp()
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
  setInterval(tick, 1000 / 30);
}

function resetPopulation() {
  loadingScreen();
  barriers = [];
  instantiatePlayers(populationSize);
  startTime = Date.now();
  currentSpeed = baseSpeed;
  distanceSinceLastBarrier = distanceBetweenBarriers;
  roundNumber=1;
}

function endRound() {
    nextRound();
}

function tp() {
  document.getElementById('tp').innerHTML = 'Total Parameters: ' + ((aiHeight * aiHeight * (aiWidth-2) + aiHeight * 3) * populationSize) + ' (' + (aiHeight * aiHeight * (aiWidth-2) + aiHeight * 3) + ' per AI)';
}

let inFullscreen = false;
function fullscreen() {
    inFullscreen = true;
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    canvas.classList.add('fullscreen');
    ctx.scale(canvas.width/400,canvas.height/400);
}
function exitFullscreen() {
    inFullscreen = false;
    canvas.width = 400;
    canvas.height = 400;
    ctx.scale(1,1);
    canvas.classList.remove('fullscreen');
}
window.onresize = () => {
  if (inFullscreen) {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    ctx.scale(canvas.width/400,canvas.height/400);
  }
}
