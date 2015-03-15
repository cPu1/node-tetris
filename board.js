var BORDER_PLACEHOLDER = '*';
var PIECE_PLACEHOLDER = '*';
var EMPTY_PLACEHOLDER = ' ';
var ROW_SEPARATOR = '\n';

var Tetris = require('./tetris');

var board = {
	handleLeftMove: function () {
		this.tetris.movePieceLeft();
		this.render();
	},
	handleRightMove: function () {
		this.tetris.movePieceRight();
		this.render();
	},
	handleLeftRotate: function () {
		this.tetris.rotatePieceLeft();
		this.render();
	},
	handleRightRotate: function () {
		this.tetris.rotatePieceRight();
		this.render();
	},
	//Check if current piece can make a valid move only after an invalid move has been made
	handleInvalidMove: function (err) {
		this.out.write('\n' + err);
		if(!this.tetris.allowsValidMove()) {
			this.tetris.generateRandomPiece();
			if(this.tetris.allowsValidMove()) {
				this.render();
			} else {
				throw new GameoverError('Game over');
			}
		}
	},
	clear: function () {
		this.out.write('\033c');
	},
	render: function () {
		var tetris = this.tetris,
			board = tetris.board,
			piece = tetris.pieceOnBoard.piece.getStructure(),
			x = tetris.pieceOnBoard.x,
			y = tetris.pieceOnBoard.y,
			boardSize = tetris.boardSize,
			rows = piece.length,
			cols = piece[0].length,
			out = this.out,
			row, col;

		this.clear();

		for(row = 0; row < boardSize; row ++) {
			out.write(BORDER_PLACEHOLDER); //let the WritableStream implementation handle buffering instead of concatenating strings
			for(col = 0; col < boardSize; col ++) {
				if(board[row][col] === 1 || (row >= y && row < y + rows && col >= x && col < x + cols 
										&& piece[row - y] && piece[row - y][col - x] === 1)) {

					out.write(PIECE_PLACEHOLDER);
				} else {
					out.write(EMPTY_PLACEHOLDER);
				}
			}
			out.write(BORDER_PLACEHOLDER + ROW_SEPARATOR);
		}

		out.write(this.borderBottom);

	},

	startGame: function () {
		this.tetris.play();
		this.render();
	}
};


function GameoverError (message) {
    if(!(this instanceof GameoverError)) {
        return new GameoverError(message);
    }
    var err = this.err = Error.call(this, message);
    this.message = message;

    Object.defineProperty(this, 'stack', {
        get: function () {
            return err.stack; 
        }
    });

}
GameoverError.prototype = Object.create(Error.prototype, {constructor: GameoverError});

/**
* @param out any writable stream
**/
module.exports = function (options) {
	var newBoard = Object.create(board);
	newBoard.out = options.out;
	newBoard.tetris = new Tetris(options);
	newBoard.borderBottom = Array(newBoard.tetris.boardSize + 3).join(BORDER_PLACEHOLDER); //cache
	return newBoard;
};

module.exports.GameoverError = GameoverError;