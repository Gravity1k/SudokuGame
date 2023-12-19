var numSelected = null;
var tileSelected = null;
var solution = null;
var errors = 0;

// Add difficulty levels
var difficultyLevels = {
    easy: 0.4,
    medium: 0.56,
    hard: 0.7
};

window.onload = function () {
    setGame(difficultyLevels.medium);
};

function selectNumber() {
    if (numSelected !== null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
}

function checkForWin() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.getElementById(r + "-" + c);
            if (tile.innerText === "" || parseInt(tile.innerText) !== solution[r][c]) {
                return false;
            }
        }
    }
    return true;
}

function showWinPopup() {
    // Display the modal and overlay
    document.getElementById('winModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function hideWinPopup() {
    // Hide the modal and overlay
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function selectTile() {
    if (numSelected !== null) {
        if (this.innerText !== "") {
            return;
        }

        let coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if (solution[r][c] == numSelected.innerText) {
            this.innerText = numSelected.innerText;

            // Check for win after setting the number
            if (checkForWin()) {
                showWinPopup();
            }
        } else {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }

        numSelected.classList.remove("number-selected");
        numSelected = null;
    }
}


function generateSudokuBoard(difficulty) {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));
    solution = null;  // Declare solution variable
    // Helper function to check if a number can be placed in a given position
    function canPlaceNumber(row, col, num) {
        // Check in the row and column
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }

        // Check in the 3x3 grid
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[startRow + i][startCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Helper function to solve the Sudoku recursively
    function solveSudoku() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let row = (startRow + i) % 9;
                let col = (startCol + j) % 9;

                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (canPlaceNumber(row, col, num)) {
                            board[row][col] = num;
                            if (solveSudoku()) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Start solving from a random position to introduce randomness
    let startRow = Math.floor(Math.random() * 9);
    let startCol = Math.floor(Math.random() * 9);
    let startNum = Math.floor(Math.random() * 9) + 1;

    // Try different numbers until you find one that fits
    while (!canPlaceNumber(startRow, startCol, startNum)) {
        startNum = (startNum % 9) + 1; // Move to the next number (1-9)
    }

    board[startRow][startCol] = startNum;

    // Generate a solved Sudoku board
    if (!solveSudoku()) {
        // If solving fails, generate a new board
        return generateSudokuBoard(difficulty);
    }

    // Remove numbers based on difficulty
    solution = JSON.parse(JSON.stringify(board)); // Deep copy
    for (let i = 0; i < 81; i++) {
        let row = Math.floor(i / 9);
        let col = i % 9;
        if (Math.random() > 1 - difficulty) {
            board[row][col] = 0;
        }
    }
    console.log("Solution array:", solution);
    return { solution, board };
}

// Move setGame outside generateSudokuBoard
function setGame(difficulty) {
    if (typeof difficulty === 'string') {
        difficulty = difficultyLevels[difficulty];
    }
    // Clear the existing digits
    document.getElementById("digits").innerHTML = "";

    // Digits 1-9 with drag-and-drop functionality
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    errors = 0;
    document.getElementById("errors").innerText = errors;

    // Clear the existing board
    document.getElementById("board").innerHTML = "";

    // Generate a new Sudoku board based on the difficulty level
    var { solution, board } = generateSudokuBoard(difficulty);

    // Board 9x9
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if (board[r][c] !== 0) {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
    document.getElementById('winModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    
}
