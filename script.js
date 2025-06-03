// Gameboard Module
const Gameboard = (() => {
    let board = Array(9).fill(null);

    const getBoard = () => [...board];

    const updateBoard = (index, marker) => {
        if (index < 0 || index > 8 || board[index] !== null) return false;
        board[index] = marker;
        return true;
    };

    const resetBoard = () => {
        board = Array(9).fill(null);
    };

    return { getBoard, updateBoard, resetBoard };
})();

// Player Factory
const Player = (name, marker) => {
    return { name, marker };
};

// Display Controller Module
const DisplayController = (() => {
    const statusDisplay = document.getElementById('status-display');
    const cells = document.querySelectorAll('.cell');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart-game');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');

    const updateBoard = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = 'cell' + (board[index] ? ` ${board[index].toLowerCase()}` : '');
        });
    };

    const setStatus = (message) => {
        statusDisplay.textContent = message;
    };

    const enableBoard = () => {
        cells.forEach(cell => {
            cell.style.cursor = 'pointer';
            cell.classList.remove('disabled');
        });
    };

    const disableBoard = () => {
        cells.forEach(cell => {
            cell.style.cursor = 'not-allowed';
            cell.classList.add('disabled');
        });
    };

    const bindEvents = () => {
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = cell.getAttribute('data-index');
                GameController.makeMove(parseInt(index));
            });
        });

        startButton.addEventListener('click', () => {
            GameController.initialize(player1Input.value, player2Input.value);
        });

        restartButton.addEventListener('click', () => {
            GameController.initialize(player1Input.value, player2Input.value);
        });
    };

    return {
        updateBoard,
        setStatus,
        enableBoard,
        disableBoard,
        bindEvents
    };
})();

// Game Controller Module
const GameController = (() => {
    let player1;
    let player2;
    let currentPlayer;
    let gameActive = false;

    const initialize = (p1Name = "Player 1", p2Name = "Player 2") => {
        player1 = Player(p1Name, "X");
        player2 = Player(p2Name, "O");
        currentPlayer = player1;
        gameActive = true;
        Gameboard.resetBoard();
        DisplayController.updateBoard();
        DisplayController.enableBoard();
        DisplayController.setStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const checkWin = () => {
        const board = Gameboard.getBoard();
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return board[a] && 
                   board[a] === board[b] && 
                   board[a] === board[c];
        });
    };

    const checkTie = () => {
        return Gameboard.getBoard().every(cell => cell !== null);
    };

    const makeMove = (position) => {
        if (!gameActive) {
            DisplayController.setStatus("Game hasn't started! Click Start Game.");
            return;
        }

        if (Gameboard.updateBoard(position, currentPlayer.marker)) {
            DisplayController.updateBoard();

            if (checkWin()) {
                DisplayController.setStatus(`${currentPlayer.name} wins!`);
                gameActive = false;
                DisplayController.disableBoard();
                return;
            }

            if (checkTie()) {
                DisplayController.setStatus("Game ends in a tie!");
                gameActive = false;
                DisplayController.disableBoard();
                return;
            }

            switchPlayer();
            DisplayController.setStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
        }
    };

    return {
        initialize,
        makeMove
    };
})();

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    DisplayController.bindEvents();
    DisplayController.disableBoard();
});

// Print instructions when the script loads
console.log("Welcome to Tic Tac Toe!");
console.log("To start a new game, type: GameController.initialize('Player1', 'Player2')");
console.log("To make a move, type: GameController.makeMove(position) where position is 0-8");
console.log("Board positions are numbered like this:");
console.log("\n 0 | 1 | 2 \n---+---+---\n 3 | 4 | 5 \n---+---+---\n 6 | 7 | 8 \n");
