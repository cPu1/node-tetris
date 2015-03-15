var assert = require('assert'),
	Piece = require('./piece');

var MOVE_PERMUTATIONS = ['rotatePieceLeft', 'rotatePieceRight',
			'rotatePieceLeft', 'rotatePieceRight'];


function Tetris (options) {
	options = options || {};
	this.boardSize = options.boardSize || 20; //assume a square board 20x20
	this.board = options.initialBoard || initialBoard(this.boardSize); //allow resuming a game with an existing state
	this.pieceOnBoard = {piece: 1, x: 0, y: 0};
}

//move current piece left
Tetris.prototype.movePieceLeft = function () {
	var pieceOnBoard = this.pieceOnBoard,
		updatedBoard;
	assert(pieceOnBoard.x !== 0, 'Invalid move: x = -1');

	pieceOnBoard.x --;
	try {
		return this.updateBoard();
	} catch (err) {
		pieceOnBoard.x ++; //restore state
		throw err;
	}
};

Tetris.prototype.movePieceRight = function () {
	var pieceOnBoard = this.pieceOnBoard,
		updatedBoard;
	assert(pieceOnBoard.x !== this.boardSize - 1, 'Invalid move: x = ' + this.boardSize + 1);
	
	pieceOnBoard.x ++;
	try {
		return this.updateBoard();
	} catch(err) {
		pieceOnBoard.x --; //restore state
		throw err;
	}
};

Tetris.prototype.rotatePieceRight = function () {
	var pieceOnBoard = this.pieceOnBoard,
		transformedPiece = pieceOnBoard.piece.rotateRight();

	return this.updateBoard(transformedPiece);
};

Tetris.prototype.rotatePieceLeft = function () {
	var pieceOnBoard = this.pieceOnBoard,
		transformedPiece = pieceOnBoard.piece.rotateLeft();

	return this.updateBoard(transformedPiece);
};

/**
* Very inefficient... a bad example of code reuse
**/
Tetris.prototype.allowsValidMove = function () {
	var movePermutations = MOVE_PERMUTATIONS;

	process.stdout.write('Pieceon board ' + this.pieceOnBoard.x)
	if(this.pieceOnBoard.x !== 0) {
		movePermutations = movePermutations.concat(['movePieceLeft', 'movePieceRight']);
	}
	if(this.pieceOnBoard.x + this.pieceOnBoard.piece.rows !== this.boardSize) {
		//movePermutations = movePermutations.concat(['movePieceRight', 'movePieceLeft']);
	}
	var l = movePermutations.filter(function (moveMethod) {
		var moveInvalid = false;
		try {
			process.stdout.write('Invoking ' + moveMethod);
			this[moveMethod]();
			this.pieceOnBoard.y --; //restore y position if this move was successful
		} catch (err) {
			process.stdout.write('Error invoking ' + moveMethod);
			moveInvalid = true;
		}
		return moveInvalid;
	}, this).length;

	process.stdout.write('LLL ' + l + ' ' + movePermutations.length);
	return true;

};


/**
* Move piece one row downwards, validate move and update board state
* private...
**/
Tetris.prototype.updateBoard = function (transformedPiece) {
	var pieceOnBoard = this.pieceOnBoard,
		piece = transformedPiece || pieceOnBoard.piece,
		pieceStructure = piece.getStructure(),
		pieceX = pieceOnBoard.x,
		pieceY = pieceOnBoard.y + 1, //move one row downwards
		board = this.board;

	var rows = piece.rowCount,
		cols = piece.colCount,
		pieceHasLanded = false,
		i,j;

	console.log(rows, cols, pieceX, pieceY, this.board, pieceStructure, pieceY + cols -1)
	assert(this.boardSize > pieceX + cols - 1, 'Invalid move: x = ' + (pieceX + cols));
	assert(this.boardSize > pieceY + rows - 1, 'Invalid move: y = ' + [pieceY, cols].join());

	for(i = 0; i < rows; i ++) {
		for(j = 0; j < cols; j ++) {
			// assert(!(board[pieceY + j + 1] && board[pieceY + j + 1][pieceX + i + 1] === 1 && pieceStructure[i][j] === 1), 
			// 	'Collision at ' + [pieceX, pieceY].join() + ' ' + pieceStructure);

			assert(!(board[pieceY + i] && board[pieceY + i][pieceX + j] === 1 && pieceStructure[i][j] === 1), 
				'Collision at ' + [pieceX, pieceY].join() + ' ' + pieceStructure);
			if(!pieceHasLanded) { //last row
				pieceHasLanded = pieceY + rows === this.boardSize || (pieceStructure[i][j] === 1 && board[pieceY + rows][pieceX + j] === 1); //
			}
		}
	}


	//TODO handle bug... do not land on empty space
	if(pieceHasLanded) {
		//update board
		
		for(i = 0; i < rows; i ++) {
			for(j = 0; j < cols; j ++) {
				console.log('Piece landed', pieceY, pieceX, board.length, pieceStructure, rows, cols, i , j)
				if(pieceStructure[i][j] === 1) {
					board[pieceY + i][pieceX + j] = 1;
					console.log('Updating board', pieceY, pieceX + i, board[pieceY][pieceX + i])
				}
			}
		}
		console.log('Updated board', board)
		this.pieceOnBoard = this.getRandomPiece();//put new random piece on board
	} else {
		pieceOnBoard.y ++;
	}

	pieceOnBoard.piece = piece; //update transformed piece

	return board;
};

/**
* Remove current piece from board and generate a new piece at a random X position
**/
Tetris.prototype.generateRandomPiece = function () {
	var randomX = Math.floor(Math.random() * this.boardSize);
	this.pieceOnBoard = this.getRandomPiece(randomX);
};

Tetris.prototype.play = function () {
	this.pieceOnBoard = this.getRandomPiece();
};

Tetris.prototype.getRandomPiece = function getRandomPiece(x) {
	var pieces = Piece.pieces.length,
		randomIndex = Math.floor(Math.random() * pieces);

	var piece = Piece.pieces[randomIndex];

	console.log('Piece on board', piece.getStructure());

	return {piece: piece, x: x || Math.floor(this.boardSize / 2), y: 0};
};

//@return an array with holes
function initialBoard (boardSize) {
	return Array.apply(null, Array(boardSize)).map(function (row) {
		return Array.apply(null, Array(boardSize)).map(function () {
			return 0;
		});
	});
}


module.exports = Tetris;

