var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var utils 	= require('./utils.js');
var config  = require('./config.json');


var users = [];
var sockets = {};

app.use(express.static(__dirname + '/../client'));

http.listen(config.port, function() {
	console.log("Server is now running");
});

io.on('connection', function (socket) {
	var type = socket.handshake.query.type;
	
	if (type !== 'player') 
		return;
	
	var currentPlayer = {
		id: socket.id,
		type: type,
	};
	
	socket.on('respawn', function(player) {
		if (utils.findIndex(users, currentPlayer.id) > -1) {
			users.splice(utils.findIndex(users, currentPlayer.id), 1);
			console.log('[INFO] User ' + player.name + ' respawned!');
		}
		socket.emit('welcome', currentPlayer);
	});
	
	socket.on('suicide', function() {
		console.log('[INFO] Player requesting force respawn');
		socket.emit('forceRespawn');
	});
	
	socket.on('returnwelcome', function(player) {

		console.log('[INFO] Player ' + player.name + ' connecting!');
		
		//Check for reasons not to allow connection
		if (utils.findIndex(users, currentPlayer.id) > -1) {
			console.log('[INFO] Player ID already exists, disconnecting player');
			socket.disconnect();
		} else if (!utils.validNickname(player.name)) {
			console.log('[INFO] Player ' + player.name  + ' has invalid username, disconnecting player');
			socket.disconnect();
		}
		
		console.log('[INFO] Player ' + player.name + ' connected successfully!');
		sockets[player.id] = socket;
		
		users.push(currentPlayer);
		console.log('Total Players: ' + users.length);
		
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