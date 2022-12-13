const process = require('process');
const http = require('http');
const url = require('url');
const fs = require('fs');
const reload = require('livereload');
const express = require('express');
const path = require('path');
const app = express();

app.use(function (req, res) {
    let q = url.parse(req.url, true);
    let filename = '.' + q.pathname;

    if (filename=='.') {
        filename = './index.html';//Default to index.html
    }
    if (filename=='.rss' || filename == './rss') {
    	filename += '.xml';//Make rss feed look clean
    }
    if (filename.lastIndexOf('/') >= filename.length - 1) {
        filename += 'index.html';//Only a directory? Default to index.html of that directory
    }
    if (filename.lastIndexOf('.') < filename.lastIndexOf('/')) {
        filename += '.html';//No file ending? Default to .html
    }

    let ext = path.parse(filename).ext;
    // maps file extension to MIME typere
    let MIME_TYPE = {
        '.ico': 'image/png',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.xml': 'application/rss+xml',
        '.php': 'text/x-php'
    };
    
    let exists = false;
    
    try {
    	fs.accessSync(filename);
    	exists = true;
    } catch (err) {
    }
    
    if (!exists) {
        filename = '404.html';
    }

    fs.readFile(filename, function(err, data) {
      if (err || filename.indexOf('_') != -1) {
      		res.writeHead(404, {'Content-Type': 'text/html'});
      } else {
	      res.writeHead(200, {'Content-Type': MIME_TYPE[ext] || 'text/plain'});
	      res.write(data);
      }
      return res.end();
    });
});

app.use(express.static(__dirname, { dotfiles: 'allow' }));

app.listen(8001);

const server = http.createServer(app);

//const wss = new WebSocketServer({server: server});

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

//SOCKETS
const io = require('socket.io')(server);
const password = 'Like I\'d Leave This In the Source Code on GitHub lol';
var SOCKET_LIST = {};
var players = {};
var coins = [];
var dash = [];
var ammo = [];
var bullets = [];
const variance = 10;
var banlist = [];
var kick;

io.sockets.on('connection', function(socket){
    if (Object.keys(SOCKET_LIST).length == 0) {coins = [];coins.push({x:Math.random()*390,y:Math.random()*390});dash=[];bullets=[];ammo=[];}//Reset the board when the first player joins
    if (Object.keys(SOCKET_LIST).length >= 40) socket.disconnect('Too many players');
    let socketId = Math.random()*100000000000000000;
    SOCKET_LIST[socketId] = socket;

    players[socketId] = {id:socketId, score:0, x:0, y:0, name:'anonymous', dash:0, ammo:0, vertical:0, horizontal:0, moveInstance:0, color:'black'};

    //inform client of player's id
    socket.emit('setPlayerId', socketId);
    
    function closeSocket() {
        if (socketId==kick) {socket.emit('kick');socket.disconnect('kick');kick=0;}
    }

    socket.on('up', function() {
        players[socketId]['vertical'] = -1;
        if (kick) closeSocket();
    });
    socket.on('down', function() {
        players[socketId]['vertical'] = 1;
        if (kick) closeSocket();
    });
    socket.on('left', function() {
        players[socketId]['horizontal'] = -1;
        if (kick) closeSocket();
    });
    socket.on('right', function() {
        players[socketId]['horizontal'] = 1;
        if (kick) closeSocket();
    });

    socket.on('setColor', function(color) {
        if (color.length < 15 && color != 'green' && color != 'lightblue' && color != 'gold')
            players[socketId]['color'] = color;
        socket.emit('returnPlayers', players);
    });

    socket.on('touchingCoin',function(i){
        if (coins[i] && Math.abs(coins[i]['x']-players[socketId]['x']) < variance && Math.abs(coins[i]['y']-players[socketId]['y']) < variance) {
            coins.splice(i,1);
            players[socketId]['score'] = players[socketId]['score'] + 1;
            for(let i in SOCKET_LIST){
                SOCKET_LIST[i].emit('returnCoins', coins);
                SOCKET_LIST[i].emit('returnPlayers', players);
            }
        }
    });

    socket.on('touchingDash',function(i){
        if (dash[i] && Math.abs(dash[i]['x']-players[socketId]['x']) < variance && Math.abs(dash[i]['y']-players[socketId]['y']) < variance) {
            dash.splice(i,1);
            players[socketId]['dash'] = -1;
            for(let i in SOCKET_LIST){
                SOCKET_LIST[i].emit('returnDash', dash);
                SOCKET_LIST[i].emit('returnPlayers', players);
            }
        }
    });
    socket.on('touchingAmmo',function(i){
        if (ammo[i] && Math.abs(ammo[i]['x']-players[socketId]['x']) < variance && Math.abs(ammo[i]['y']-players[socketId]['y']) < variance) {
            ammo.splice(i,1);
            players[socketId]['ammo'] += 1;
            for(let i in SOCKET_LIST){
                SOCKET_LIST[i].emit('returnAmmo', ammo);
                SOCKET_LIST[i].emit('returnPlayers', players);
            }
        }
    });

    socket.on('dash', function() {
        if (players[socketId]['dash'] == -1)
            players[socketId]['dash'] = 10;
        socket.emit('returnPlayers', players);
    });
    
    socket.on('disconnect',function(){
        delete players[socketId];
        delete SOCKET_LIST[socketId];
        for(let i in SOCKET_LIST){
            SOCKET_LIST[i].emit('returnPlayers', players);
        }
    });

    socket.on('getPlayers',function(instance) {
        socket.emit('returnPlayers',players);
        for (let i in players) {
            if (players[i]['moveInstance']==instance) {
                socket.disconnect('already here'); 
                return;
            }
        }
        for (let i in banlist) {
            if (banlist[i]==instance)
            	socket.disconnect('ban');
            	return;
        }
        players[socketId]['moveInstance'] = instance;
    });

    socket.on('rename',function(name){
        if (name.length > 10)
            name = name.substring(0,10);
        players[socketId]['name'] = name;
        socket.emit('returnPlayers', players);
    });

    socket.on('instanceCheck', function(instance) {
        for (let i in players) {
            if (players[i]['moveInstance']==instance)
                socket.disconnect('already connected');
        }
    });
    socket.on('shoot', function(bh,bv) {
        if (players[socketId].ammo > 0) {
            if (bh > 1) bh %= 1;
            if (bv > 1) bv %= 1;
            if (bh < -1) bh = -1 * ((-1 * bh) % 1);
            if (bv < -1) bv = -1 * ((-1 * bv) % 1);
            bullets.push({x:players[socketId].x+10*bh,y:players[socketId].y+10*bv,h:bh,v:bv});
            players[socketId].ammo -= 1;
            for(let i in SOCKET_LIST){
                SOCKET_LIST[i].emit('returnAmmo', ammo);
                SOCKET_LIST[i].emit('returnPlayers', players);
                SOCKET_LIST[i].emit('returnBullets', bullets);
            }
        }
    });
    
    socket.on('ban',function(name,pwd) {
    	for (let i in players)
    	    if (players[i]['name'].trim()==name.trim() && pwd==password) {
                kick = i;
                banlist.push(players[i]['moveInstance']);
    	    }
    });
    
    socket.on('kick',function(name,pwd) {
    	for (let i in players)
    	    if (players[i]['name'].trim()==name.trim() && pwd==password) {
                kick = i;
    	    }
    });
    
    socket.on('banlist',function(pwd) {
    	if (pwd==password)
    	    socket.emit('banlist',banlist);
    });
    
    socket.on('pardon',function(instance,pwd) {
    	if (pwd==password)
    	    for (let i in banlist)
    	        if (banlist[i] == instance)
    	            banlist.splice(i,1);
    });
});

function tick() {
    if (Math.random() > 0.99 - (0.0075 * Object.keys(players).length) && coins.length < 50) {
        coins.push({x:Math.random()*390,y:Math.random()*390});
    }
    if (Math.random() > 1 - (0.001 * Object.keys(players).length) && dash.length < 1) {
        dash.push({x:Math.random()*390,y:Math.random()*390});
    }
    if (Math.random() > 1 - (0.001 * Object.keys(players).length) && ammo.length < 2) {
        ammo.push({x:Math.random()*390,y:Math.random()*390});
    }
    for(let i in SOCKET_LIST){
        if (players[i]['dash'] > 0) {
            players[i]['vertical']*=2;
            players[i]['horizontal']*=2;
            players[i]['dash']-=0.016;//1/2 frame
        }
        players[i]['x'] += players[i]['horizontal'];
        players[i]['y'] += players[i]['vertical'];
        if (players[i]['dash'] < 0 && players[i]['dash'] != -1)
            players[i]['dash'] = 0;
        if (players[i]['x'] < 0)
            players[i]['x'] = 0;
        else if (players[i]['x'] > 390)
            players[i]['x'] = 390;
        if (players[i]['y'] < 0)
            players[i]['y'] = 0;
        else if (players[i]['y'] > 390)
            players[i]['y'] = 390;
        players[i]['horizontal'] = 0;
        players[i]['vertical'] = 0;
    }
    //Iterate bullets and check for collisions
    for (let i in bullets) {
        bullets[i].x += bullets[i].h;
        bullets[i].y += bullets[i].v;
        let used = false;
        for (let s in SOCKET_LIST) {
            if (Math.abs(players[s].x + 5 - bullets[i].x) < 6 && Math.abs(players[s].y + 5 - bullets[i].y) < 6) {
                //kill that playa
                SOCKET_LIST[s].emit('die');
                players[s].score -= 10;
                players[s].x = 0;
                players[s].y = 0;
                players[s].dash = 0;
                used = true;
                break;
            }
        }
        if (used || bullets[i].x < 0 || bullets[i].x > 400 || bullets[i].y < 0 || bullets[i].y > 400) {
            bullets.splice(i,1);
        }
    }

    //Push stats to players
    for(let i in SOCKET_LIST){
        SOCKET_LIST[i].emit('returnDash', dash);
        SOCKET_LIST[i].emit('returnCoins', coins);
        SOCKET_LIST[i].emit('returnPlayers', players);
        SOCKET_LIST[i].emit('returnBullets', bullets);
        SOCKET_LIST[i].emit('returnAmmo', ammo);
    }
}

const ticker = setInterval(tick,32);

server.listen(8443, '127.0.0.1');
console.log('Server running on localhost:8443');
