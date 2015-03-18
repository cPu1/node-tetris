var pieces = [
	[[1,1,1,1]],
	[[1,0], [1,0], [1,1]],
	[[0,1], [0,1], [1,1]],
	[[0,1], [1,1], [1,0]],
	[[1,1], [1,1]]
];

var Piece = {
	create: function (structure) {
		var newPiece = Object.create(piece);
		newPiece.structure = structure;
		return newPiece;
	}
};

/**
* An immutable piece: rotations do not modify the piece but return a piece with a new structure
*/
var piece = {
	rotateRight: function () {
		var structure = this.structure,
			rowCount = this.colCount,
			colCount = this.rowCount,
			transpose = [];

		for(var i = 0; i < rowCount; i ++) {
			transpose[i] = [];
			for(var j = 0; j < colCount; j ++) {
				transpose[i][j] = structure[colCount - j - 1][i];
			}
		}

		return Piece.create(transpose);
	},

	rotateLeft: function () {
		var structure = this.structure,
			rowCount = this.colCount,
			colCount = this.rowCount,
			transpose = [];

		for(var i = 0; i < rowCount; i ++) {
			transpose[i] = [];
			for(var j = 0; j < colCount; j ++) {
				transpose[i][j] = structure[j][rowCount - i - 1];
			}
		}
		return Piece.create(transpose);
	},

	getStructure: function () {
		return this.structure;
	},

	get rowCount() {
		return this.structure.length;
	},
	get colCount() {
		return this.structure[0].length;
	}
};

Piece.pieces = pieces.map(Piece.create);

var SQUARE_PIECE = Piece.pieces[Piece.pieces.length - 1]; //special case

//save iteration
SQUARE_PIECE.rotateRight = SQUARE_PIECE.rotateLeft = function () {
	return this;
};
module.exports = Piece;
