let pressedKeys = {};
let gameStarted = false;
let answer = "";
let problem = "";
let correctAnswer = "";
let complexity = 10;
let points = 0;
let counter = 0;
window.onload = () => {
    window.onkeydown = function(e) {if(gameStarted)typeKey(e);}
}
function start() {
    document.getElementById('Buttons').hidden = true;
    document.getElementById('game').hidden = false;
    document.getElementById('numpad').hidden = false;
    gameStarted = true;
    createProblem();
}
function typeKey(keyEvent) {
    //Numbers 0-9 and decimals should always be added
    //Dashes may be added if no previous numbers are typed
    //Backspaces may be used if previous numbers are typed
    //Enter may be used to submit the problem
    if (answer == "answer")
        answer = "";
    switch (keyEvent.key) {
        case "-":
            if (answer.length===0) {
                answer = "-";
            }
            break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "0":
            answer += keyEvent.key;
            break;
        case ".":
            if (~answer.indexOf('.')) {
                answer += '.';
            }
        case "Backspace":
            if (answer.length >= 1) {
                answer = answer.substring(0,answer.length-1);
            }
            break;
        case "Enter":
            if (answer != "") submitAnswer();
    }
    if (answer == "")
        answer = "answer";
    document.getElementById("answer").innerHTML = answer;
}
function submitAnswer() {
    if (answer == correctAnswer) {
        document.getElementById("instructions").innerHTML = "CORRECT!";
        points++;
        document.getElementById("points").innerHTML = "Score: " + points;
        //TODO: Iterate complexity
        createProblem();
    } else {
        document.getElementById("instructions").innerHTML = "Incorrect :( Correct Answer: " + problem + ' = ' + correctAnswer;
        points = 0;
        document.getElementById("points").innerHTML = "Score: " + points;
        createProblem();
    }
}
function createProblem() {
    let a = Math.round(Math.random() * complexity);
    let b = Math.round(Math.random() * complexity);
    if (complexity >= 10 && Math.random() > 0.9) {
        if (Math.random() > 0.5) a = 0-a;
        if (Math.random() > 0.5) b = 0-b;
    } else if (complexity >= 20 && Math.random() > 0.9) {
        if (Math.random() > 0.5) a = 0-a;
        if (Math.random() > 0.5) b = 0-b;
    } else if (complexity >= 50 && Math.random() > 0.9) {
       if (Math.random() > 0.5) a = 0-a;
       if (Math.random() > 0.5) b = 0-b;
    }
    let x;
    if (Math.random() > 0.5 || (complexity >= 20 && Math.random() > 0.8)) {
        if (Math.random() > 0.9) {
        //Only allow "clean" division
            if (b!=0 && (a%b == 0 || a%b == .5 || a%b==.25)) {
                x = "÷";
                correctAnswer = a/b;
            } else {
                x = "+";
                correctAnswer = a+b;
            }
        } else {
            x = "x";
            correctAnswer = a*b;
        }
    } else {
        if (Math.random() > 0.5 && (complexity < 20 || Math.random() > 0.8)) {
            x = "+";
            correctAnswer = a+b;
        } else {
            x = "-";
            correctAnswer = a-b;
        }
    }
    problem = a + x + b;
    document.getElementById('problem').innerHTML = problem;
    answer = "answer";
    document.getElementById("answer").innerHTML = answer;
}