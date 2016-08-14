'use strict';
var gBoard = [];
var gLevel = {
	SIZE: 8,
	MinesCount: 5
};
var gState = {
	shownCount: 0,
	gameDone: false
};
var HIDDEN = '';
var BOMB = '&#9760';
var MARKED = '?';
var gTotalSecs = 0;
var gTimeInterval;

function init() {
	clearInterval(gTimeInterval);
	gTotalSecs = -1;
	gBoard = null;
	gState.shownCount = 0;
	gState.gameDone = false;
	setTime();
	buildBoard();
	setMines();
	renderBoard();
}

function newBoardSize(strNum) {
	var newSize = +strNum.value
	if (newSize &&
		newSize > 2 &&
		newSize * newSize >= gLevel.MinesCount) {
		gLevel.SIZE = newSize;
		init();
	}
}

function newMinesCount(strNum) {
	var newMinesCount = +strNum.value;
	if (newMinesCount && newMinesCount <= gLevel.SIZE * gLevel.SIZE) {
		gLevel.MinesCount = newMinesCount;
		init();
	}
}

function buildBoard() {
	gBoard = [];
	for (var i = 0; i < gLevel.SIZE; i++) {
		gBoard.push([]);
		for (var j = 0; j < gLevel.SIZE; j++) {
			gBoard[i][j] = {
				isShown: false,
				negsCount: 0,
				isBomb: false,
				isMarked: false
			};
		}
	}
}

function setMines() {
	var minesCount = 0;
	while (minesCount < gLevel.MinesCount) {
		var randRow = parseInt(Math.random() * gLevel.SIZE);
		var randColumn = parseInt(Math.random() * gLevel.SIZE);
		if (!gBoard[randRow][randColumn].isBomb) {
			minesCount++;
			gBoard[randRow][randColumn].isBomb = true;
			setNegsMinesCount(randRow, randColumn);
		}
	}
}

function setNegsMinesCount(bombRow, bombcolumn) {
	for (var i = bombRow - 1; i <= bombRow + 1; i++) {
		if (i < 0 || i >= gLevel.SIZE) continue;
		for (var j = bombcolumn - 1; j <= bombcolumn + 1; j++) {
			if (j < 0 || j >= gLevel.SIZE) continue;
			if (i === bombRow && j === bombcolumn) continue;
			gBoard[i][j].negsCount++;
		}
	}
}

function renderBoard(board) {
	var elContainer = document.querySelector('.table');
	var strHTML = '<table border="1"><tbody>';
	gBoard.forEach(function (column, i) {
		strHTML += '<tr>';
		column.forEach(function (cell, j) {
			var className = 'cell';
			var id = 'td' + i + '-' + j;
			var onClick = " onClick=cellClicked(this) oncontextmenu=rightClick(this)";

			var textInCell = HIDDEN;
			strHTML += '<td id ="' + id + '" class="' + className + '"' + onClick + '> ' + textInCell + ' </td>';
		});
		strHTML += '</tr>'
	});
	strHTML += '</tbody></table>';
	elContainer.innerHTML = strHTML;
}

function cellClicked(elCell) {
	if(gState.gameDone) return;
	if (!gTotalSecs) {
		clearInterval(gTimeInterval);
		gTimeInterval = setInterval(setTime, 1000);
	}

	var cellLocation = getCellFromElement(elCell);
	var myCell = gBoard[+(cellLocation[0])][+(cellLocation[1])];
	if (myCell.isMarked) return;
	if (myCell.isBomb) {
		elCell.innerHTML = BOMB;
		myCell.isShown = true;
		elCell.classList.add('clicked');
		alert('BOOM!! you died in ' + gTotalSecs + ' seconds');
		clearInterval(gTimeInterval);
		gState.gameDone = true;
	}
	else{
		elCell.innerHTML = myCell.negsCount;
		myCell.isShown = true;
		elCell.classList.add('clicked');
		gState.shownCount++;
		if (isGameEnded()) {
			alert('WOOHOO!! it took you ' + gTotalSecs + ' seconds');
			clearInterval(gTimeInterval);
			gState.gameDone = true;
		}
		if (myCell.negsCount === 0) showNegs(elCell);
	}
}

function rightClick(elCell) {
	if(gState.gameDone) return;
	var cellLocation = getCellFromElement(elCell);
	var row = +cellLocation[0];
	var column = +cellLocation[1];
	var myCell = gBoard[row][column];
	// if (myCell.isShown) return;
	if (!myCell.isShown) {
		if (!gBoard[row][column].isMarked) { 
			elCell.innerHTML = MARKED;
			gBoard[row][column].isMarked = true;
		} else {
			elCell.innerHTML = HIDDEN;
			gBoard[row][column].isMarked = false;
		}
	}
}

function showNegs(elCell) {

	var cellLocation = getCellFromElement(elCell);
	var row = +cellLocation[0];
	var column = +cellLocation[1];
	var myCell = gBoard[row][column];
	// if (myCell.negsCount || myCell.isMarked) return;
	for (var i = row - 1; i <= row + 1; i++) {
		if (i < 0 || i >= gLevel.SIZE) continue;
		for (var j = column - 1; j <= column + 1; j++) {
			if (j < 0 || j >= gLevel.SIZE) continue;
			if (i === row && j === column) continue;
			var cellId = '#td' + (i) + '-' + (j);
			if (gBoard[i][j].isShown) continue;
			gBoard[i][j].isShown = true;
			var elNewCell = document.querySelector(cellId);
			elNewCell.innerHTML = gBoard[i][j].negsCount;
			elNewCell.classList.add('clicked');

			gState.shownCount++;
			if (!gBoard[i][j].negsCount) {
				showNegs(elNewCell);
			}
		}
	}
}

function setTime() {
	gTotalSecs++;
	var minutesLabel = document.getElementById('minutes');
	var secondsLabel = document.getElementById('seconds');
	secondsLabel.innerHTML = pad(gTotalSecs % 60);
	minutesLabel.innerHTML = pad(parseInt(gTotalSecs / 60));
}

function isGameEnded() {
	if (gState.shownCount === ((gLevel.SIZE * gLevel.SIZE) - gLevel.MinesCount)) return true;
	return false;
}

function pad(val) {
	var valString = val + "";
	if (valString.length < 2) {
		return "0" + valString;
	} else {
		return valString;
	}
}

function getCellFromElement(elCell){
	return elCell.id.replace('td', '').split('-');
}