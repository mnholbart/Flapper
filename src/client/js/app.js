var io = require('socket.io-client');
var global = require('./globals');
var Canvas = require('./canvas');

var playerNameInput = document.getElementById('playerNameInput');


window.canvas = new Canvas();
var c = window.canvas.cv;
var bg = c.getContext('2d');

var socket;

var KEY_ENTER = 13;

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
	
	document.getElementById('startMenuWrapper').style.display = 'none';
	//document.getElementById('startMenuWrapper').style.maxHeight = '0px';
    //document.getElementById('gameAreaWrapper').style.opacity = 1;
	document.getElementById('gameAreaWrapper').style.display = 'block';
	
	if (!socket) {
		socket = io({query:"type=" + type});
		SetupSocket(socket);
	}
	
	if (!global.animLoopHandle)
		animloop();
	
	socket.emit('respawn');
	global.socket = socket;
}

// check if nick is valid alphanumeric characters (and underscores)
function validNick() {
    var regex = /^\w*$/;
    console.log('Regex Test', regex.exec(playerNameInput.value));
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {
    'use strict';

    var btn = document.getElementById('startButton'),
        nickErrorText = document.querySelector('#startMenu .input-error');

    btn.onclick = function () {

        // check if the nick is valid
        if (validNick()) {
            startGame('player');
        } else {
            nickErrorText.style.display = 'inline';
        }
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;

        if (key === KEY_ENTER) {
            if (validNick()) {
                startGame();
            } else {
                nickErrorText.style.display = 'inline';
            }
        }
    });
};

function SetupSocket(socket) {
	//Handle connection
	socket.on('welcome', function(playerSettings) {
		player = playerSettings;
		player.name = global.playerName;
        player.screenWidth = global.screenWidth;
		player.screenHeight = global.screenHeight;
		global.player = player;
		
		socket.emit('returnwelcome', player);
	});
	
	socket.on('gameSetup', function(data) {
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        resize();
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
  handleLogic();
  handleGraphics();
}

function handleLogic() {
	
}

function handleGraphics() {
	bg.fillStyle = '#10ff00';
	bg.fillRect(0, 0, global.screenWidth, global.screenHeight);
}

window.addEventListener('resize', function() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    c.width = screenWidth;
    c.height = screenHeight;
}, true);


function resize() {
    player.screenWidth = c.width = global.screenWidth = global.playerType == 'player' ? window.innerWidth : global.gameWidth;
    player.screenHeight = c.height = global.screenHeight = global.playerType == 'player' ? window.innerHeight : global.gameHeight;
    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}