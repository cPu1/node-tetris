var tetrisBoard = require('./board'),
	GameoverError = tetrisBoard.GameoverError,
	assert = require('assert');


var LEFT = 'a'.charCodeAt();
var RIGHT = 'd'.charCodeAt();
var ROTATE_LEFT = 'w'.charCodeAt();
var ROTATE_RIGHT = 's'.charCodeAt();


process.stdin.setRawMode(true); //as opposed to cooked mode

var board = tetrisBoard({boardSize: 20, out: process.stdout});

process.stdin.on('data', function (key) {
	key = key[0];
	try {
			switch(key) {
				case LEFT:
					board.handleLeftMove();
					break;
				case RIGHT:
					board.handleRightMove();
					break;
				case ROTATE_LEFT:
					board.handleLeftRotate();
					break;
				case ROTATE_RIGHT:
					board.handleRightRotate();
					break;
				default:
					board.out.write('\nInvalid key: ' + String.fromCharCode(key) + '. Exiting...');
					this.end();
					break;
			}
	} catch (err) {
			if(err instanceof assert.AssertionError) {
				try {
					board.handleInvalidMove(err.message);
				} catch (err) {
					if(err instanceof GameoverError) {
						board.out.write('\n' + err.message);
						this.end();
					} else {
						throw err;
					}
				}
			} else {
				throw err; //notify of any potential bugs
			}
	}
});

board.startGame();