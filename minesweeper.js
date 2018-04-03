// Try changing these constants
var ROWS = 11; // number of rows
var COLS = 12;
var NUM_MINES = 23;
var EXPLOSION_LIFE = 8;

NUM_MINES = Math.min(NUM_MINES, ROWS * COLS);

var table = document.getElementById("grid");
var face = document.getElementById("face");
var flagCounter = document.getElementById("flagCounter");
var mineCounter = document.getElementById("mineCounter");
mineCounter.textContent = NUM_MINES;
// text colour of numbers on revealed tiles
var numberColor = [
  "#DDD",
  "blue",
  "#080",
  "red",
  "#007",
  "#700",
  "#077",
  "#707",
  "#000"
];

var firstClick = true; //prevents picking mine first
var gameInProgress = true; // you can reveal tiles when true
/** these ints to check win condition **/
var squaresRevealed = 0; // number of tiles uncovered
var minesFlagged = 0; //
var flagsPlaced = 0; // won't win if placed more flags than mines

// an object to store the grid
class Game {
  constructor(rows, cols) {
    // create a 2D array to hold the hidden mines and numbers
    this.mineGrid = new Array(ROWS);
    for (var i = 0; i < ROWS; i++) {
      this.mineGrid[i] = new Array(COLS);
      for (var j = 0; j < COLS; j++) {
        this.mineGrid[i][j] = 0;
      }
    }
  }
}
var g = new Game(ROWS, COLS);

// create the table and the array that holds each td
var gridElements = new Array(ROWS);
for (var i = 0; i < ROWS; i++) {
  // add rows to the HTML table and gridElements array
  gridElements[i] = new Array(COLS);
  var tRow = document.createElement("tr");
  table.appendChild(tRow);
  for (var j = 0; j < COLS; j++) {
    var square = document.createElement("td");
    square.textContent = " ";
    // this class just makes the pointer appear
    square.className = "mayClick";

    /* !!!: must create a different context
    using a closure to preserve the i,j values.
    Otherwise it doesn't work. */
    (function(i, j) {
      square.addEventListener("mousedown", function(event) {
        clickSquare(i, j, event.button);
      });
    })(i, j);
    gridElements[i][j] = square;
    tRow.appendChild(square);
  }
}

// resets the grids and generates again
function reset() {
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      gridElements[i][j].textContent = " ";
      gridElements[i][j].className = "mayClick";
      gridElements[i][j].style.backgroundColor = "";
      gridElements[i][j].style.color = "";
      g.mineGrid[i][j] = 0;
    }
  }
  face.textContent = ":|";
  mineCounter.textContent = NUM_MINES;
  minesFlagged = 0;
  flagsPlaced = 0;
  updateFlags();
  squaresRevealed = 0;
  //mines are generated after first click
  firstClick = true;
  gameInProgress = true;
}

// this determines which squares will contain mines
// this happens after the first square is clicked
function genMines(mineGrid, rows, cols, firstx, firsty) {
  // make array containing a number for each index in the grid
  var minePos = new Array(rows * cols);
  for (var i = 0; i < rows * cols; i++) {
    minePos[i] = i;
  }
  // randomise minePos (Fisher-Yates)
  for (var i = minePos.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = minePos[j];
    minePos[j] = minePos[i];
    minePos[i] = temp;
  }
  console.log(minePos);
  // this function to increment neighbours
  function incre(x, y, xoff, yoff) {
    if (x + xoff >= 0 && x + xoff < rows) {
      if (y + yoff >= 0 && y + yoff < cols) {
        if (mineGrid[x + xoff][y + yoff] != "*") {
          mineGrid[x + xoff][y + yoff] += 1;
        }
      }
    }
  }
  // then get the required number of mines from minePos
  var i = 0;
  for (var limit = NUM_MINES; i < limit; i++) {
    var row = Math.floor(minePos[i] / cols);
    var col = minePos[i] % cols;
    if (row === firstx && col === firsty) {
      if (NUM_MINES < rows * cols) {
        //skip placing mine on starting square
        limit++;
        continue;
      }
    }
    mineGrid[row][col] = "*";
    // and update the 8 squares around the mine
    incre(row, col, -1, -1);
    incre(row, col, -1, 0);
    incre(row, col, -1, 1);
    incre(row, col, 1, -1);
    incre(row, col, 1, 0);
    incre(row, col, 1, 1);
    incre(row, col, 0, -1);
    incre(row, col, 0, 1);
  }
  // for testing purposes, print the grid
  for (var i = 0; i < ROWS; i++) {
    console.log(g.mineGrid[i]);
  }
}

// this function uses some global vars...
function clickSquare(row, col, button) {
  if (!gameInProgress) {
    return;
  }
  if (firstClick == true) {
    // generate field on the first click or flag
    genMines(g.mineGrid, ROWS, COLS, row, col);
    firstClick = false;
  }
  if (button == 2) {
    //console.log("right click"); //toggle flag
    if (gridElements[row][col].textContent === " ") {
      gridElements[row][col].textContent = "F";
      flagsPlaced++;
      updateFlags();
      if (g.mineGrid[row][col] === "*") {
        minesFlagged++;
        // check if won
        if (minesFlagged === NUM_MINES && flagsPlaced === minesFlagged) {
          victory();
        }
      }
    } else if (gridElements[row][col].textContent == "F") {
      gridElements[row][col].textContent = " ";
      flagsPlaced--;
      updateFlags();
      if (g.mineGrid[row][col] === "*") {
        minesFlagged--;
      }
    }
    return;
  }
  // Left click. Check if in bounds and unclicked
  if (0 <= row && row < ROWS && 0 <= col && col < COLS) {
    if (gridElements[row][col].textContent == " ") {
      //console.log("clicked",row,col);
      var revealed = g.mineGrid[row][col];
      gridElements[row][col].textContent = revealed;
      //remove the "mayClick" class
      gridElements[row][col].className = "";
      //change the text colour to match the number
      if (revealed < 9) {
        gridElements[row][col].style.color = numberColor[revealed];
        gridElements[row][col].style.backgroundColor = "#CCC";

        squaresRevealed++;
        if (squaresRevealed === ROWS * COLS - NUM_MINES) {
          victory(); // revealed all non-mines
        }
      } else if (revealed == "*") {
        // picked a mine
        gameOver(row, col);
      }
      // if 0, needs to auto-click surrounding squares
      // recursion can exceed maximum call stack size for large grids
      if (g.mineGrid[row][col] === 0) {
        clickSquare(row + 1, col - 1);
        clickSquare(row + 1, col);
        clickSquare(row + 1, col + 1);
        clickSquare(row - 1, col - 1);
        clickSquare(row - 1, col);
        clickSquare(row - 1, col + 1);
        clickSquare(row, col + 1);
        clickSquare(row, col - 1);
      }
    }
  }
}

function updateFlags() {
  flagCounter.textContent = flagsPlaced;
}

// there are two ways to win
function victory() {
  gameInProgress = false;
  face.textContent = ":)";
  console.log("win");
  alert("You win!");
}

/* highlights incorrect flags
* shows mine locations
*/

function gameOver(r, c) {
  gridElements[r][c].style.backgroundColor = "red";
  gameInProgress = false;
  face.textContent = ";(";
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      //remove mayClick class
      gridElements[i][j].className = "";
      if (g.mineGrid[i][j] === "*") {
        if (gridElements[i][j].textContent !== "F") {
          // reveal unflagged & unclicked mine
          gridElements[i][j].textContent = "*";
        }
      } else if (gridElements[i][j].textContent === "F") {
        // tile flagged incorrectly. Highlight red.
        gridElements[i][j].style.backgroundColor = "red";
      }
    }
  }
  // make an explosion animation
  explode(r, c, EXPLOSION_LIFE);
  function explode(x, y, life) {
    if (life <= 0 || gameInProgress) {
      return;
    }
    if (0 <= x && x < ROWS && 0 <= y && y < COLS) {
      if (gridElements[x][y].className !== "fire") {
        gridElements[x][y].className = "fire";
        setTimeout(function() {
          explode(x - 1, y, life - 1);
          explode(x + 1, y, life - 1);
          explode(x, y - 1, life - 1);
          explode(x, y + 1, life - 1);
          if (life % 2) {
            explode(x - 1, y - 1, life - 1);
            explode(x + 1, y + 1, life - 1);
            explode(x + 1, y - 1, life - 1);
            explode(x - 1, y + 1, life - 1);
          }
        }, 151);
        setTimeout(function() {
          gridElements[x][y].className = "";
        }, 401);
      }
    }
  }
}

//setTimeout(function () { MethodToCall(); }, 1000);

/* Other things to add:
* change recursion to iteration
*/

/* Prevent right-click opening the context menu
Source: http://stackoverflow.com/questions/4909167/how-to-add-a-custom-right-click-menu-to-a-webpage */
if (document.addEventListener) {
  // IE >= 9; other browsers
  document.addEventListener(
    "contextmenu",
    function(e) {
      //alert("You've tried to open context menu");
      //here you draw your own menu
      e.preventDefault();
    },
    false
  );
} else {
  // IE < 9
  document.attachEvent("oncontextmenu", function() {
    //alert("You've tried to open context menu");
    window.event.returnValue = false;
  });
}

/* Other notes
The "mouse" event didn't detect right-clicks in my browser, but "mousedown" does.


*/
