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

// AI Module
const AI = (() => {
    const difficulties = {
        easy: () => makeRandomMove(),
        medium: () => Math.random() < 0.5 ? findBestMove(2) : makeRandomMove(),
        hard: () => Math.random() < 0.8 ? findBestMove(4) : makeRandomMove(),
        impossible: () => findBestMove(Infinity)
    };

    function makeRandomMove() {
        const board = Gameboard.getBoard();
        const availableMoves = board.reduce((moves, cell, index) => {
            if (cell === null) moves.push(index);
            return moves;
        }, []);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    function findBestMove(depth) {
        const board = Gameboard.getBoard();
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = "O";
                let score = minimax(board, depth, false);
                board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    function minimax(board, depth, isMaximizing) {
        const scores = {
            O: 10,
            X: -10,
            tie: 0
        };

        const result = checkGameEnd(board);
        if (result || depth === 0) {
            return result ? scores[result] : evaluatePosition(board);
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = "O";
                    bestScore = Math.max(bestScore, minimax(board, depth - 1, false));
                    board[i] = null;
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = "X";
                    bestScore = Math.min(bestScore, minimax(board, depth - 1, true));
                    board[i] = null;
                }
            }
            return bestScore;
        }
    }

    function evaluatePosition(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        let score = 0;
        for (let line of lines) {
            const [a, b, c] = line;
            if (board[a] === "O") score++;
            if (board[b] === "O") score++;
            if (board[c] === "O") score++;
            if (board[a] === "X") score--;
            if (board[b] === "X") score--;
            if (board[c] === "X") score--;
        }
        return score;
    }

    function checkGameEnd(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let line of lines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return board.includes(null) ? null : "tie";
    }

    return {
        makeMove: (difficulty) => difficulties[difficulty]()
    };
})();

// Display Controller Module
const DisplayController = (() => {
    const statusDisplay = document.getElementById('status-display');
    const cells = document.querySelectorAll('.cell');
    const startButton = document.getElementById('start-game');
    const restartButton = document.getElementById('restart-game');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const vsHumanBtn = document.getElementById('vs-human');
    const vsAIBtn = document.getElementById('vs-ai');
    const aiSettings = document.querySelector('.ai-settings');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    
    let selectedDifficulty = 'medium';
    let isVsAI = false;

    const updateBoard = () => {
        const board = Gameboard.getBoard();
        cells.forEach((cell, index) => {
            cell.className = 'cell';
            if (board[index]) {
                cell.textContent = board[index];
                cell.classList.add(board[index].toLowerCase());
            } else {
                cell.textContent = '';
            }
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

    const highlightWinningCells = (winningPattern) => {
        winningPattern.forEach(index => {
            cells[index].classList.add('win');
        });
    };

    const clearHighlights = () => {
        cells.forEach(cell => {
            cell.classList.remove('win');
        });
    };

    const bindEvents = () => {
        vsHumanBtn.addEventListener('click', () => {
            isVsAI = false;
            vsHumanBtn.classList.add('active');
            vsAIBtn.classList.remove('active');
            aiSettings.style.display = 'none';
            player2Input.value = 'Player 2';
            player2Input.disabled = false;
        });

        vsAIBtn.addEventListener('click', () => {
            isVsAI = true;
            vsAIBtn.classList.add('active');
            vsHumanBtn.classList.remove('active');
            aiSettings.style.display = 'block';
            player2Input.value = 'AI';
            player2Input.disabled = true;
        });

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDifficulty = btn.dataset.difficulty;
            });
        });

        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.getAttribute('data-index'));
                GameController.makeMove(index);
            });
        });

        startButton.addEventListener('click', () => {
            clearHighlights();
            GameController.initialize(player1Input.value, player2Input.value, isVsAI, selectedDifficulty);
        });

        restartButton.addEventListener('click', () => {
            clearHighlights();
            GameController.initialize(player1Input.value, player2Input.value, isVsAI, selectedDifficulty);
        });
    };

    return {
        updateBoard,
        setStatus,
        enableBoard,
        disableBoard,
        bindEvents,
        highlightWinningCells,
        isVsAI: () => isVsAI,
        getSelectedDifficulty: () => selectedDifficulty
    };
})();

// Game Controller Module
const GameController = (() => {
    let player1;
    let player2;
    let currentPlayer;
    let gameActive = false;
    let isVsAI = false;
    let aiDifficulty = 'medium';

    const initialize = (p1Name = "Player 1", p2Name = "Player 2", vsAI = false, difficulty = 'medium') => {
        console.log('Initializing game:', { vsAI, difficulty }); // Debug log
        player1 = Player(p1Name || "Player 1", "X");
        player2 = Player(p2Name || "AI", "O");
        currentPlayer = player1;
        gameActive = true;
        isVsAI = vsAI;
        aiDifficulty = difficulty;
        Gameboard.resetBoard();
        DisplayController.updateBoard();
        DisplayController.enableBoard();
        DisplayController.setStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        console.log('Switched to:', currentPlayer.name); // Debug log
    };

    const getWinningPattern = () => {
        const board = Gameboard.getBoard();
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return pattern;
            }
        }
        return null;
    };

    const checkWin = () => {
        return getWinningPattern() !== null;
    };

    const checkTie = () => {
        return Gameboard.getBoard().every(cell => cell !== null);
    };

    const makeAIMove = () => {
        console.log('AI attempting to make move...'); // Debug log
        console.log('Current game state:', { 
            isVsAI, 
            aiDifficulty, 
            gameActive, 
            currentPlayer: currentPlayer.name,
            board: Gameboard.getBoard()
        });

        const aiMove = AI.makeMove(aiDifficulty);
        console.log('AI chose position:', aiMove); // Debug log

        if (aiMove !== null && aiMove !== undefined) {
            if (Gameboard.updateBoard(aiMove, currentPlayer.marker)) {
                console.log('AI move successful at position:', aiMove); // Debug log
                DisplayController.updateBoard();

                const winningPattern = getWinningPattern();
                if (winningPattern) {
                    DisplayController.highlightWinningCells(winningPattern);
                    DisplayController.setStatus(`🎉 ${currentPlayer.name} wins! 🎉`);
                    gameActive = false;
                    DisplayController.disableBoard();
                    return;
                }

                if (checkTie()) {
                    DisplayController.setStatus("🤝 Game ends in a tie! 🤝");
                    gameActive = false;
                    DisplayController.disableBoard();
                    return;
                }

                switchPlayer();
                DisplayController.setStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);
                DisplayController.enableBoard();
            } else {
                console.log('AI move failed - position already taken or invalid'); // Debug log
            }
        } else {
            console.log('AI returned null or undefined move'); // Debug log
        }
    };

    const makeMove = (position) => {
        console.log('Attempting move at position:', position); // Debug log
        console.log('Game state:', { 
            isVsAI, 
            currentPlayer: currentPlayer.name, 
            gameActive 
        });

        if (!gameActive) {
            DisplayController.setStatus("Game hasn't started! Click Start Game.");
            return;
        }

        // If it's AI's turn, ignore player clicks
        if (isVsAI && currentPlayer === player2) {
            console.log('Ignoring player click during AI turn'); // Debug log
            return;
        }

        if (Gameboard.updateBoard(position, currentPlayer.marker)) {
            console.log('Move successful, updating board'); // Debug log
            DisplayController.updateBoard();

            const winningPattern = getWinningPattern();
            if (winningPattern) {
                DisplayController.highlightWinningCells(winningPattern);
                DisplayController.setStatus(`🎉 ${currentPlayer.name} wins! 🎉`);
                gameActive = false;
                DisplayController.disableBoard();
                return;
            }

            if (checkTie()) {
                DisplayController.setStatus("🤝 Game ends in a tie! 🤝");
                gameActive = false;
                DisplayController.disableBoard();
                return;
            }

            switchPlayer();
            DisplayController.setStatus(`${currentPlayer.name}'s turn (${currentPlayer.marker})`);

            // If it's AI's turn, make AI move after a short delay
            if (isVsAI && currentPlayer === player2 && gameActive) {
                console.log('Preparing AI move...'); // Debug log
                DisplayController.disableBoard();
                setTimeout(makeAIMove, 500);
            }
        } else {
            console.log('Move failed - position already taken or invalid'); // Debug log
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
    // Set initial active difficulty button
    document.querySelector('[data-difficulty="medium"]').classList.add('active');
});

// Print instructions when the script loads
// console.log("Welcome to Tic Tac Toe!");
// console.log("To start a new game, type: GameController.initialize('Player1', 'Player2')");
// console.log("To make a move, type: GameController.makeMove(position) where position is 0-8");
// console.log("Board positions are numbered like this:");
// console.log("\n 0 | 1 | 2 \n---+---+---\n 3 | 4 | 5 \n---+---+---\n 6 | 7 | 8 \n");
