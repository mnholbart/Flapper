var io = require('socket.io-client');
var global = require('./globals');
var Canvas = require('./canvas');

var playerNameInput = document.getElementById('playerNameInput');


window.canvas = new Canvas();
var c = window.canvas.cv;
var bg = c.getContext('2d');

var socket;

var player = {
	id: -1,
	screenWidth: global.screenWidth,
	screenHeight: global.screenHeight,
};
global.player = player;

function startGame(type) {
    global.playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '');
	global.playerType = type;
	
	global.screenWidth = window.innerWidth;
	global.screenHeight = window.innerHeight;
	
	document.getElementById('startMenuWrapper').style.maxHeight = '0px'; //hide start menu
    document.getElementById('gameAreaWrapper').style.opacity = 1; //Once theres a game running in the background remove this and default the css to opacity 1
	
	if (!socket) {
		socket = io({query:"type=" + type});
		SetupSocket(socket);
	}
	
	if (!global.animLoopHandle)
		animloop();
	
	socket.emit('respawn', global.player);
	global.socket = socket;
}

// check if nick is valid alphanumeric characters (and underscores)
function validNick() {
	if (!playerNameInput.value)
		return false;
	
    var regex = /^\w*$/;
    //console.log('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {
    'use strict';

    var btn = document.getElementById('startButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');

    btn.onclick = function () {

        // check if the nick is valid
        if (validNick()) {
			nickErrorText.style.opacity = 0;
            startGame('player');
        } else {
            nickErrorText.style.opacity = 1;
        }
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
		
		if (global.gameStarted) { //probably need to just remove/readd the listener when game starts/ends
			return;
		}
		
        if (key === global.KEY_ENTER) {
            if (validNick()) {
				nickErrorText.style.opacity = 0;
                startGame('player');
            } else {
				nickErrorText.style.opacity = 1;
            }
        }
    });
};

function SetupSocket(socket) {
	
	socket.on('connect_failed', function () {
        socket.close();
        global.connected = false;
    });

    socket.on('disconnect', function () {
        socket.close();
        global.connected = false;
    });

	//Handle connection
	socket.on('welcome', function(playerSettings) {
		player = playerSettings;
		player.name = global.playerName;
        player.screenWidth = global.screenWidth;
		player.screenHeight = global.screenHeight;
		global.player = player;
		global.gameStarted = true;
		global.dead = false;
		
		socket.emit('returnwelcome', player);
	});
	
	socket.on('gameSetup', function(data) {
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        resize();
	});
	
	socket.on('kill', function() {
		global.gameStarted = false;
		global.dead = true;
		
		//Timer to remove death message and low respawning
		window.setTimeout(function() {
			document.getElementById('gameAreaWrapper').style.opacity = 0;
			document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
			global.died = false;
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle);
                global.animLoopHandle = undefined;
			}
		}, 2500);
	});
	
	socket.on('forceRespawn', function() {
		global.gameStarted = false;
		global.dead = true;
		socket.emit('respawn', global.player);
	});
}

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.msRequestAnimationFrame     ||
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function animloop(){
    global.animLoopHandle = window.requestAnimFrame(animloop);
    gameLoop();
}

function gameLoop() {
	if (global.dead)
		handleLogicDead();
	else if (global.gameStarted)
		handleLogicGame();
	else handleLogicDefault();
}

function handleLogicDead() {
	drawLogicDead();
}

function drawLogicDead() {
	bg.fillStyle = '#333333';
	bg.fillRect(0, 0, global.screenWidth, global.screenHeight);

	bg.textAlign = 'center';
	bg.fillStyle = '#FFFFFF';
	bg.font = 'bold 30px sans-serif';
	bg.fillText('You are dead', global.screenWidth / 2, global.screenHeight / 2);
}

function handleLogicGame() {
	drawLogicGame();
}

function drawLogicGame() {
	bg.fillStyle = '#00FF00';
	bg.fillRect(0, 0, global.screenWidth, global.screenHeight);
}

function handleLogicDefault() {
	drawLogicDefault();
}

function drawLogicDefault() {
	bg.fillStyle = '#B0171F';
	bg.fillRect(0, 0, global.screenWidth, global.screenHeight);
}

function handleGraphics() {
	bg.fillStyle = '#10ff00';
	bg.fillRect(0, 0, global.screenWidth, global.screenHeight);
}

window.addEventListener('resize', resize);

function resize() {
    player.screenWidth = c.width = global.screenWidth = global.playerType == 'player' ? window.innerWidth : global.gameWidth;
    player.screenHeight = c.height = global.screenHeight = global.playerType == 'player' ? window.innerHeight : global.gameHeight;
    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}