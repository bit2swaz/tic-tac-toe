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

// Game Controller Module
window.GameController = (() => {
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
        console.log("Game started! Current board:");
        printBoard();
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
            console.log("Game hasn't started! Call initialize() first.");
            return;
        }

        if (Gameboard.updateBoard(position, currentPlayer.marker)) {
            console.log(`${currentPlayer.name} placed ${currentPlayer.marker} at position ${position}`);
            printBoard();

            if (checkWin()) {
                console.log(`${currentPlayer.name} wins!`);
                gameActive = false;
                return;
            }

            if (checkTie()) {
                console.log("Game ends in a tie!");
                gameActive = false;
                return;
            }

            switchPlayer();
            console.log(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
        } else {
            console.log("Invalid move! Try again.");
        }
    };

    const printBoard = () => {
        const board = Gameboard.getBoard();
        console.log('\n' +
            ' ' + (board[0] || ' ') + ' | ' + (board[1] || ' ') + ' | ' + (board[2] || ' ') + '\n' +
            '---+---+---\n' +
            ' ' + (board[3] || ' ') + ' | ' + (board[4] || ' ') + ' | ' + (board[5] || ' ') + '\n' +
            '---+---+---\n' +
            ' ' + (board[6] || ' ') + ' | ' + (board[7] || ' ') + ' | ' + (board[8] || ' ') + '\n'
        );
    };

    const getCurrentPlayer = () => currentPlayer;

    return {
        initialize,
        makeMove,
        getCurrentPlayer
    };
})();

// Print instructions when the script loads
console.log("Welcome to Tic Tac Toe!");
console.log("To start a new game, type: GameController.initialize('Player1', 'Player2')");
console.log("To make a move, type: GameController.makeMove(position) where position is 0-8");
console.log("Board positions are numbered like this:");
console.log("\n 0 | 1 | 2 \n---+---+---\n 3 | 4 | 5 \n---+---+---\n 6 | 7 | 8 \n");
