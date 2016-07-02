var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var utils 	= require('./utils.js');

var config  = require('./config.json');

var users = [];
var sockets = {};

app.use(express.static(__dirname + '/../client'));

io.on('connection', function (socket) {
	var type = socket.handshake.query.type;
	
	console.log('Connection...', type);
	
	if (type === 'player') {
	
	}
	
	var currentPlayer = {
		id: socket.id,
		type: type,
	};
	
	socket.on('respawn', function() {
		if (utils.findIndex(users, currentPlayer.id) > -1)
			users.splice(utils.findIndex(users, currentPlayer.id), 1);
		
		socket.emit('welcome', currentPlayer);
		console.log('[INFO] User ' + currentPlayer.name + ' respawned!');
	});
	
	socket.on('returnwelcome', function(player) {

		console.log('[INFO] Player ' + player.name + ' connecting!');
		
		console.log('[INFO] Player ' + player.name + ' connected!');
		sockets[player.id] = socket;
		
		users.push(currentPlayer);
		
		//io.emit('playerJoin', { name: currentPlayer.name });
		socket.emit('gameSetup', {
			gameWidth: config.gameWidth,
			gameHeight: config.gameHeight
		});
	});
	
	socket.on('windowResized', function (data) {
        currentPlayer.screenWidth = data.screenWidth;
        currentPlayer.screenHeight = data.screenHeight;
	});
});

function tickPlayer(currentPlayer) {
	movePlayer(currentPlayer);
}

function movePlayer(currentPlayer) {
	
}

function moveloop() {
	for (var i = 0; i < users.length; i++) {
		tickPlayer(users[i]);
	}
}

function gameloop() {
	
}

setInterval(moveloop, 1000/60);
setInterval(gameloop, 1000);

var serverPort = process.env.PORT || config.port;
http.listen(serverPort, function() {
  console.log("Server is listening on port " + serverPort);
});