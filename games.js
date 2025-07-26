document.addEventListener('DOMContentLoaded', () => {
    // --- GENERAL UI LOGIC ---
    function showPlatform(platform) {
        document.querySelectorAll('.game-menu').forEach(menu => menu.classList.remove('active'));
        document.querySelector(`#${platform}-menu`).classList.add('active');

        document.querySelectorAll('.platform-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.platform-btn[onclick="showPlatform('${platform}')"]`).classList.add('active');
        
        const firstGameId = document.querySelector(`#${platform}-menu .game-btn`).getAttribute('onclick').match(/'([^']+)'/)[1];
        showGame(firstGameId);
    }

    function showGame(gameName) {
        stopAllGames();
        document.querySelectorAll('.game-container').forEach(container => container.classList.remove('active'));
        document.querySelector(`#${gameName}-game`).classList.add('active');

        document.querySelectorAll('.game-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.game-btn[onclick="showGame('${gameName}')"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
    
    function stopAllGames() {
        if(window.snakeInterval) clearInterval(window.snakeInterval);
        if(window.pongInterval) clearInterval(window.pongInterval);
        if(window.tetrisInterval) clearInterval(window.tetrisInterval);
        if(window.breakoutInterval) clearInterval(window.breakoutInterval);
        if(window.tapInterval) { clearInterval(window.tapInterval); clearInterval(window.tapTimerInterval); }
        if(window.touchSnakeInterval) clearInterval(window.touchSnakeInterval);
        if(window.memoryGameTimeout) clearTimeout(window.memoryGameTimeout);
        if(window.touchPongInterval) clearInterval(window.touchPongInterval);
    }
    
    function showGameOver(gameId, scoreText, restartFnName) {
        const gameContainer = document.getElementById(`${gameId}-game`);
        const existingOverlay = gameContainer.querySelector('.game-over');
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement('div');
        overlay.className = 'game-over';
        overlay.innerHTML = `
            <h3>Game Over!</h3>
            <p>${scoreText}</p>
            <button class="restart-btn" onclick="${restartFnName}()">Play Again</button>
        `;
        
        gameContainer.style.position = 'relative';
        gameContainer.appendChild(overlay);

        const startBtn = gameContainer.querySelector('.start-btn');
        const pauseBtn = gameContainer.querySelector('.pause-btn');
        if (startBtn) startBtn.textContent = 'Restart Game';
        if (pauseBtn) pauseBtn.disabled = true;
    }

    // --- PC GAMES (WITH MOBILE ENHANCEMENTS) ---

    // 🐍 SNAKE (PC)
    const snakeCanvas = document.getElementById('snake-canvas');
    const snakeCtx = snakeCanvas.getContext('2d');
    const GRID_SIZE = 20;
    const TILE_COUNT = snakeCanvas.width / GRID_SIZE;
    const SNAKE_SPEED = 150;
    let snake, snakeDirection, snakeFood, snakeScore, snakeGameRunning, snakeGamePaused;
    window.snakeInterval = null;

    function initSnakeState() {
        snake = [{ x: 10, y: 10 }];
        snakeDirection = { x: 1, y: 0 };
        snakeScore = 0;
        snakeGameRunning = false;
        snakeGamePaused = false;
        generateSnakeFood();
        updateSnakeScore();
        drawSnake();
    }
    function drawSnake() {
        snakeCtx.fillStyle = 'black';
        snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
        snake.forEach((part, index) => {
            snakeCtx.fillStyle = index === 0 ? '#4CAF50' : '#45a049';
            snakeCtx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
        });
        snakeCtx.fillStyle = '#ff4444';
        snakeCtx.fillRect(snakeFood.x * GRID_SIZE, snakeFood.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
    function generateSnakeFood() {
        snakeFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        if (snake.some(seg => seg.x === snakeFood.x && seg.y === snakeFood.y)) generateSnakeFood();
    }
    function moveSnake() {
        if (!snakeGameRunning || snakeGamePaused) return;
        const head = { x: snake[0].x + snakeDirection.x, y: snake[0].y + snakeDirection.y };
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT || snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            gameOverSnake();
            return;
        }
        snake.unshift(head);
        if (head.x === snakeFood.x && head.y === snakeFood.y) {
            snakeScore += 10;
            updateSnakeScore();
            generateSnakeFood();
        } else {
            snake.pop();
        }
        drawSnake();
    }
    function updateSnakeScore() { document.getElementById('snake-score').textContent = snakeScore; }
    function gameOverSnake() {
        snakeGameRunning = false;
        clearInterval(window.snakeInterval);
        showGameOver('snake', `Final Score: ${snakeScore}`, 'restartSnake');
    }
    function changeSnakeDirection(key) {
        if (!snakeGameRunning || snakeGamePaused) return;
        if ((key === 'ArrowUp' || key === 'w') && snakeDirection.y === 0) snakeDirection = { x: 0, y: -1 };
        else if ((key === 'ArrowDown' || key === 's') && snakeDirection.y === 0) snakeDirection = { x: 0, y: 1 };
        else if ((key === 'ArrowLeft' || key === 'a') && snakeDirection.x === 0) snakeDirection = { x: -1, y: 0 };
        else if ((key === 'ArrowRight' || key === 'd') && snakeDirection.x === 0) snakeDirection = { x: 1, y: 0 };
    }
    document.addEventListener('keydown', (e) => { if(document.getElementById('snake-game').classList.contains('active')) changeSnakeDirection(e.key); });
    document.querySelector('#snake-game #up-btn').addEventListener('click', () => changeSnakeDirection('ArrowUp'));
    document.querySelector('#snake-game #down-btn').addEventListener('click', () => changeSnakeDirection('ArrowDown'));
    document.querySelector('#snake-game #left-btn').addEventListener('click', () => changeSnakeDirection('ArrowLeft'));
    document.querySelector('#snake-game #right-btn').addEventListener('click', () => changeSnakeDirection('ArrowRight'));
    window.startSnake = () => restartSnake();
    window.restartSnake = () => {
        clearInterval(window.snakeInterval);
        initSnakeState();
        snakeGameRunning = true;
        window.snakeInterval = setInterval(moveSnake, SNAKE_SPEED);
        const gameContainer = document.getElementById('snake-game');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        gameContainer.querySelector('.start-btn').textContent = 'Restart Game';
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Pause';
    };
    window.pauseSnake = () => {
        if (!snakeGameRunning) return;
        snakeGamePaused = !snakeGamePaused;
        document.querySelector('#snake-game .pause-btn').textContent = snakeGamePaused ? 'Resume' : 'Pause';
    };
    initSnakeState();

    // 🏓 PONG (PC)
    const pongCanvas = document.getElementById('pong-canvas');
    const pongCtx = pongCanvas.getContext('2d');
    let ball, player, ai, pongGameRunning, pongGamePaused;
    window.pongInterval = null;
    function initPongState() {
        ball = { x: pongCanvas.width / 2, y: pongCanvas.height / 2, radius: 10, dx: 5, dy: 5 };
        player = { x: 10, y: pongCanvas.height / 2 - 50, width: 15, height: 100, score: 0, dy: 0 };
        ai = { x: pongCanvas.width - 25, y: pongCanvas.height / 2 - 50, width: 15, height: 100, score: 0 };
        pongGameRunning = false;
        pongGamePaused = false;
        updatePongScore();
        drawPong();
    }
    function drawPong() {
        pongCtx.fillStyle = 'black';
        pongCtx.fillRect(0, 0, pongCanvas.width, pongCanvas.height);
        pongCtx.fillStyle = 'white';
        pongCtx.fillRect(player.x, player.y, player.width, player.height);
        pongCtx.fillRect(ai.x, ai.y, ai.width, ai.height);
        pongCtx.beginPath();
        pongCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        pongCtx.fill();
    }
    function movePong() {
        if (!pongGameRunning || pongGamePaused) return;
        player.y += player.dy;
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > pongCanvas.height) player.y = pongCanvas.height - player.height;
        ball.x += ball.dx;
        ball.y += ball.dy;
        if (ball.y + ball.radius > pongCanvas.height || ball.y - ball.radius < 0) ball.dy *= -1;
        if ((ball.x - ball.radius < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height && ball.dx < 0) || (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + ai.height && ball.dx > 0)) {
            ball.dx *= -1.05;
        }
        if (ball.x + ball.radius < 0) { ai.score++; resetBall(); }
        else if (ball.x - ball.radius > pongCanvas.width) { player.score++; resetBall(); }
        ai.y += (ball.y - (ai.y + ai.height / 2)) * 0.1;
        updatePongScore();
        drawPong();
    }
    function resetBall() {
        ball.x = pongCanvas.width / 2;
        ball.y = pongCanvas.height / 2;
        ball.dx = (ball.dx > 0 ? -1 : 1) * 5;
        ball.dy = (Math.random() > 0.5 ? 1 : -1) * 5;
    }
    function updatePongScore() {
        document.getElementById('pong-player-score').textContent = player.score;
        document.getElementById('pong-ai-score').textContent = ai.score;
    }
    document.addEventListener('keydown', e => {
        if(document.getElementById('pong-game').classList.contains('active')) {
            if (e.key === 'w' || e.key === 'ArrowUp') player.dy = -8;
            if (e.key === 's' || e.key === 'ArrowDown') player.dy = 8;
        }
    });
    document.addEventListener('keyup', e => {
        if(document.getElementById('pong-game').classList.contains('active')) {
            if ((e.key === 'w' || e.key === 'ArrowUp') || (e.key === 's' || e.key === 'ArrowDown')) player.dy = 0;
        }
    });
    window.startPong = () => restartPong();
    window.restartPong = () => {
        clearInterval(window.pongInterval);
        initPongState();
        pongGameRunning = true;
        window.pongInterval = setInterval(movePong, 1000 / 60);
        const gameContainer = document.getElementById('pong-game');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        gameContainer.querySelector('.start-btn').textContent = 'Restart Game';
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Pause';
    };
    window.pausePong = () => {
        if (!pongGameRunning) return;
        pongGamePaused = !pongGamePaused;
        document.querySelector('#pong-game .pause-btn').textContent = pongGamePaused ? 'Resume' : 'Pause';
    };
    initPongState();

    // 🧩 TETRIS (PC) - Enhanced with Touch Controls
    const tetrisCanvas = document.getElementById('tetris-canvas');
    const tetrisCtx = tetrisCanvas.getContext('2d');
    const T_BLOCK_SIZE = 30;
    const T_COLS = tetrisCanvas.width / T_BLOCK_SIZE;
    const T_ROWS = tetrisCanvas.height / T_BLOCK_SIZE;
    let grid, currentPiece, tetrisScore, tetrisGameRunning, tetrisGamePaused;
    window.tetrisInterval = null;
    const PIECES = [ [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]] ];
    const COLORS = ['cyan', 'yellow', 'purple', 'lime', 'red', 'blue', 'orange'];
    function initTetrisState() {
        grid = Array.from({ length: T_ROWS }, () => Array(T_COLS).fill(0));
        tetrisScore = 0;
        tetrisGameRunning = false;
        tetrisGamePaused = false;
        spawnPiece();
        updateTetrisScore();
        drawTetris();
    }
    function spawnPiece() {
        const index = Math.floor(Math.random() * PIECES.length);
        const matrix = PIECES[index];
        currentPiece = { matrix: matrix, color: COLORS[index], x: Math.floor(T_COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 };
        if (collision()) gameOverTetris();
    }
    function collision() {
        for (let y = 0; y < currentPiece.matrix.length; y++) {
            for (let x = 0; x < currentPiece.matrix[y].length; x++) {
                if (currentPiece.matrix[y][x] && 
                   ((grid[y + currentPiece.y] && grid[y + currentPiece.y][x + currentPiece.x]) !== 0 ||
                    y + currentPiece.y >= T_ROWS ||
                    x + currentPiece.x < 0 ||
                    x + currentPiece.x >= T_COLS)) {
                    return true;
                }
            }
        }
        return false;
    }
    function drawTetris() {
        tetrisCtx.fillStyle = 'black';
        tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
        for(let y = 0; y < T_ROWS; y++) {
            for(let x = 0; x < T_COLS; x++) {
                if (grid[y][x]) {
                    tetrisCtx.fillStyle = grid[y][x];
                    tetrisCtx.fillRect(x * T_BLOCK_SIZE, y * T_BLOCK_SIZE, T_BLOCK_SIZE-1, T_BLOCK_SIZE-1);
                }
            }
        }
        tetrisCtx.fillStyle = currentPiece.color;
        currentPiece.matrix.forEach((row, y) => row.forEach((value, x) => {
            if (value) tetrisCtx.fillRect((currentPiece.x + x) * T_BLOCK_SIZE, (currentPiece.y + y) * T_BLOCK_SIZE, T_BLOCK_SIZE-1, T_BLOCK_SIZE-1);
        }));
    }
    function movePieceDown() {
        if (!tetrisGameRunning || tetrisGamePaused) return;
        currentPiece.y++;
        if (collision()) {
            currentPiece.y--;
            lockPiece();
            spawnPiece();
        }
        drawTetris();
    }
    function lockPiece() {
        currentPiece.matrix.forEach((row, y) => row.forEach((value, x) => {
            if (value) {
                if (currentPiece.y + y < 0) { // Game over condition
                    gameOverTetris();
                    return;
                }
                grid[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            }
        }));
        clearLines();
    }
    function clearLines() {
        let linesCleared = 0;
        for (let y = T_ROWS - 1; y >= 0; y--) {
            if (grid[y].every(cell => cell !== 0)) {
                linesCleared++;
                grid.splice(y, 1);
                grid.unshift(Array(T_COLS).fill(0));
                y++;
            }
        }
        if (linesCleared > 0) { tetrisScore += linesCleared * 10 * linesCleared; updateTetrisScore(); }
    }
    function updateTetrisScore() { document.getElementById('tetris-score').textContent = tetrisScore; }
    function gameOverTetris() {
        tetrisGameRunning = false;
        clearInterval(window.tetrisInterval);
        showGameOver('tetris', `Final Score: ${tetrisScore}`, 'restartTetris');
    }
    function handleTetrisInput(key) {
        if (!tetrisGameRunning || tetrisGamePaused) return;
        if (key === 'ArrowLeft') { currentPiece.x--; if(collision()) currentPiece.x++; }
        else if (key === 'ArrowRight') { currentPiece.x++; if(collision()) currentPiece.x--; }
        else if (key === 'ArrowDown') movePieceDown();
        else if (key === 'ArrowUp' || key === ' ') {
            const rotated = currentPiece.matrix[0].map((_, colIndex) => currentPiece.matrix.map(row => row[colIndex]).reverse());
            const prevMatrix = currentPiece.matrix;
            currentPiece.matrix = rotated;
            if (collision()) currentPiece.matrix = prevMatrix;
        }
        drawTetris();
    }
    document.addEventListener('keydown', (e) => { if(document.getElementById('tetris-game').classList.contains('active')) handleTetrisInput(e.key); });
    let touchStartX = 0, touchStartY = 0;
    tetrisCanvas.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; e.preventDefault(); });
    tetrisCanvas.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX; const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX; const dy = touchEndY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) handleTetrisInput(dx > 40 ? 'ArrowRight' : (dx < -40 ? 'ArrowLeft' : null));
        else { if (dy > 40) handleTetrisInput('ArrowDown'); else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) handleTetrisInput(' '); }
    });
    window.startTetris = () => restartTetris();
    window.restartTetris = () => {
        clearInterval(window.tetrisInterval);
        initTetrisState();
        tetrisGameRunning = true;
        window.tetrisInterval = setInterval(movePieceDown, 500);
        const gameContainer = document.getElementById('tetris-game');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        gameContainer.querySelector('.start-btn').textContent = 'Restart Game';
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Pause';
    };
    window.pauseTetris = () => {
        if (!tetrisGameRunning) return;
        tetrisGamePaused = !tetrisGamePaused;
        document.querySelector('#tetris-game .pause-btn').textContent = tetrisGamePaused ? 'Resume' : 'Pause';
    };
    initTetrisState();

    // 🧱 BREAKOUT (PC) - Enhanced with Touch Controls
    const breakoutCanvas = document.getElementById('breakout-canvas');
    const breakoutCtx = breakoutCanvas.getContext('2d');
    let b_ball, b_paddle, bricks, breakoutScore, breakoutGameRunning, breakoutGamePaused;
    window.breakoutInterval = null;
    const BRICK_ROW_COUNT = 5, BRICK_COLUMN_COUNT = 9, BRICK_WIDTH = 50, BRICK_HEIGHT = 20, BRICK_PADDING = 5, BRICK_OFFSET_TOP = 30, BRICK_OFFSET_LEFT = 30;
    function initBreakoutState() {
        breakoutScore = 0;
        b_ball = { x: breakoutCanvas.width / 2, y: breakoutCanvas.height - 50, radius: 8, dx: 0, dy: 0 };
        b_paddle = { x: breakoutCanvas.width / 2 - 50, y: breakoutCanvas.height - 20, width: 100, height: 10 };
        breakoutGameRunning = false; breakoutGamePaused = false;
        createBricks(); updateBreakoutScore(); drawBreakout();
    }
    function createBricks() {
        bricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    function drawBreakout() {
        breakoutCtx.fillStyle = 'black';
        breakoutCtx.fillRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);
        breakoutCtx.fillStyle = '#667eea';
        breakoutCtx.fillRect(b_paddle.x, b_paddle.y, b_paddle.width, b_paddle.height);
        breakoutCtx.beginPath();
        breakoutCtx.arc(b_ball.x, b_ball.y, b_ball.radius, 0, Math.PI * 2);
        breakoutCtx.fillStyle = 'white';
        breakoutCtx.fill();
        breakoutCtx.closePath();
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    bricks[c][r].x = brickX; bricks[c][r].y = brickY;
                    breakoutCtx.fillStyle = '#764ba2';
                    breakoutCtx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                }
            }
        }
    }
    function moveBreakout() {
        if (!breakoutGameRunning || breakoutGamePaused || (b_ball.dx === 0 && b_ball.dy === 0)) return;
        b_ball.x += b_ball.dx; b_ball.y += b_ball.dy;
        if (b_ball.x + b_ball.radius > breakoutCanvas.width || b_ball.x - b_ball.radius < 0) b_ball.dx *= -1;
        if (b_ball.y - b_ball.radius < 0) b_ball.dy *= -1;
        if (b_ball.y + b_ball.radius > b_paddle.y && b_ball.x > b_paddle.x && b_ball.x < b_paddle.x + b_paddle.width) b_ball.dy *= -1;
        else if (b_ball.y + b_ball.radius > breakoutCanvas.height) gameOverBreakout();
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const b = bricks[c][r];
                if (b.status === 1 && b_ball.x > b.x && b_ball.x < b.x + BRICK_WIDTH && b_ball.y > b.y && b_ball.y < b.y + BRICK_HEIGHT) {
                    b.status = 0; b_ball.dy *= -1; breakoutScore += 10; updateBreakoutScore();
                }
            }
        }
        drawBreakout();
    }
    function updateBreakoutScore() { document.getElementById('breakout-score').textContent = breakoutScore; }
    function gameOverBreakout() {
        breakoutGameRunning = false; clearInterval(window.breakoutInterval);
        showGameOver('breakout', `Final Score: ${breakoutScore}`, 'restartBreakout');
    }
    function movePaddle(clientX) {
        const relativeX = clientX - breakoutCanvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < breakoutCanvas.width) {
            b_paddle.x = relativeX - b_paddle.width / 2;
            if (b_paddle.x < 0) b_paddle.x = 0;
            if (b_paddle.x + b_paddle.width > breakoutCanvas.width) b_paddle.x = breakoutCanvas.width - b_paddle.width;
            if (!breakoutGameRunning) drawBreakout();
        }
    }
    function launchBall() {
        if (breakoutGameRunning && b_ball.dx === 0 && b_ball.dy === 0) {
            b_ball.dx = 4; b_ball.dy = -4;
        }
    }
    breakoutCanvas.addEventListener('mousemove', e => movePaddle(e.clientX));
    breakoutCanvas.addEventListener('touchmove', e => { e.preventDefault(); movePaddle(e.touches[0].clientX); });
    breakoutCanvas.addEventListener('click', launchBall);
    breakoutCanvas.addEventListener('touchstart', e => { e.preventDefault(); launchBall(); });
    window.startBreakout = () => restartBreakout();
    window.restartBreakout = () => {
        clearInterval(window.breakoutInterval); initBreakoutState(); breakoutGameRunning = true;
        window.breakoutInterval = setInterval(moveBreakout, 1000 / 60);
        const gameContainer = document.getElementById('breakout-game');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        gameContainer.querySelector('.start-btn').textContent = 'Restart Game';
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Pause';
    };
    window.pauseBreakout = () => {
        if (!breakoutGameRunning) return;
        breakoutGamePaused = !breakoutGamePaused;
        document.querySelector('#breakout-game .pause-btn').textContent = breakoutGamePaused ? 'Resume' : 'Pause';
    };
    initBreakoutState();

    // --- MOBILE GAMES ---

    // ⭕ TIC TAC TOE (MOBILE)
    let ttt_board, ttt_currentPlayer, ttt_gameActive;
    const winPatterns = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6] ];
    const ttt_cells = document.querySelectorAll('.tic-cell');
    function startTicTacToe() {
        ttt_board = ['', '', '', '', '', '', '', '', ''];
        ttt_currentPlayer = 'X'; ttt_gameActive = true;
        updateCurrentPlayerDisplay();
        const existingOverlay = document.querySelector('#tic-tac-toe-game .game-over');
        if(existingOverlay) existingOverlay.remove();
        document.querySelectorAll('.tic-cell').forEach(cell => {
            cell.textContent = ''; cell.className = 'tic-cell';
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
            newCell.addEventListener('click', cellClick);
        });
    }
    function cellClick(e) {
        const index = e.target.getAttribute('data-index');
        if (ttt_board[index] !== '' || !ttt_gameActive) return;
        ttt_board[index] = ttt_currentPlayer;
        e.target.textContent = ttt_currentPlayer;
        e.target.classList.add(ttt_currentPlayer.toLowerCase());
        if (checkWin()) endTicTacToe(`${ttt_currentPlayer} Wins!`);
        else if (ttt_board.every(cell => cell !== '')) endTicTacToe('Draw!');
        else { ttt_currentPlayer = ttt_currentPlayer === 'X' ? 'O' : 'X'; updateCurrentPlayerDisplay(); }
    }
    function updateCurrentPlayerDisplay() { document.getElementById('tic-tac-current-player').textContent = ttt_currentPlayer; }
    function checkWin() { return winPatterns.some(p => p.every(i => ttt_board[i] === ttt_currentPlayer)); }
    function endTicTacToe(message) {
        ttt_gameActive = false;
        showGameOver('tic-tac-toe', message, 'startTicTacToe');
    }
    window.startTicTacToe = startTicTacToe;
    window.resetTicTacToe = startTicTacToe;
    startTicTacToe();

    // 👆 TAP GAME (MOBILE)
    const tapCanvas = document.getElementById('tap-canvas');
    const tapCtx = tapCanvas.getContext('2d');
    let targets, tapScore, tapGameRunning, tapTimeLeft;
    const TAP_GAME_DURATION = 30;
    window.tapInterval = null; window.tapTimerInterval = null;
    function initTapGameState() {
        targets = []; tapScore = 0; tapGameRunning = false; tapTimeLeft = TAP_GAME_DURATION;
        updateTapScore(); drawTapGame();
    }
    function drawTapGame() {
        tapCtx.fillStyle = 'black';
        tapCtx.fillRect(0, 0, tapCanvas.width, tapCanvas.height);
        targets.forEach(target => {
            tapCtx.beginPath(); tapCtx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            tapCtx.fillStyle = 'cyan'; tapCtx.fill();
        });
        tapCtx.fillStyle = 'white'; tapCtx.font = '20px Arial';
        tapCtx.fillText(`Time: ${tapTimeLeft}`, 10, 30);
    }
    function updateTapGame() {
        if (!tapGameRunning) return;
        if (Math.random() < 0.05) spawnTarget();
        targets.forEach((target, index) => { target.lifetime--; if (target.lifetime <= 0) targets.splice(index, 1); });
        drawTapGame();
    }
    function spawnTarget() {
        targets.push({ x: Math.random()*(tapCanvas.width-60)+30, y: Math.random()*(tapCanvas.height-60)+30, radius: 20+Math.random()*10, lifetime: 100 });
    }
    function handleTap(e) {
        if (!tapGameRunning) return;
        const rect = tapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        for (let i = targets.length - 1; i >= 0; i--) {
            const target = targets[i];
            const dist = Math.hypot(x - target.x, y - target.y);
            if (dist < target.radius) { tapScore += 10; updateTapScore(); targets.splice(i, 1); break; }
        }
    }
    function updateTapScore() { document.getElementById('tap-score').textContent = tapScore; }
    function gameTimer() {
        if (!tapGameRunning) return;
        tapTimeLeft--;
        if (tapTimeLeft <= 0) gameOverTapGame();
    }
    function gameOverTapGame() {
        tapGameRunning = false;
        clearInterval(window.tapInterval); clearInterval(window.tapTimerInterval);
        showGameOver('tap', `Final Score: ${tapScore}`, 'startTapGame');
    }
    tapCanvas.addEventListener('click', handleTap);
    window.startTapGame = () => {
        if (tapGameRunning) {
            restartTapGame();
            return;
        }
        restartTapGame();
    };
    function restartTapGame() {
        clearInterval(window.tapInterval); clearInterval(window.tapTimerInterval);
        const gameContainer = document.getElementById('tap-game');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        initTapGameState();
        tapGameRunning = true;
        window.tapInterval = setInterval(updateTapGame, 1000 / 60);
        window.tapTimerInterval = setInterval(gameTimer, 1000);
        gameContainer.querySelector('.pause-btn').disabled = false;
    }
    window.pauseTapGame = () => { 
        tapGameRunning = false;
        document.querySelector('#tap-game .pause-btn').disabled = true;
    };
    initTapGameState();

    // 🐍 TOUCH SNAKE (MOBILE)
    const touchSnakeCanvas = document.getElementById('touch-snake-canvas');
    const touchSnakeCtx = touchSnakeCanvas.getContext('2d');
    const TS_GRID_SIZE = 25;
    const TS_TILE_COUNT = touchSnakeCanvas.width / TS_GRID_SIZE;
    const TS_SPEED = 180;
    let ts_snake, ts_direction, ts_food, ts_score, ts_gameRunning, ts_gamePaused;
    window.touchSnakeInterval = null;
    function initTouchSnakeState() {
        ts_snake = [{ x: 7, y: 7 }]; ts_direction = { x: 1, y: 0 };
        ts_score = 0; ts_gameRunning = false; ts_gamePaused = false;
        generateTouchSnakeFood(); updateTouchSnakeScore(); drawTouchSnake();
    }
    function drawTouchSnake() {
        touchSnakeCtx.fillStyle = 'black';
        touchSnakeCtx.fillRect(0, 0, touchSnakeCanvas.width, touchSnakeCanvas.height);
        ts_snake.forEach((part, index) => {
            touchSnakeCtx.fillStyle = index === 0 ? '#4CAF50' : '#45a049';
            touchSnakeCtx.fillRect(part.x * TS_GRID_SIZE, part.y * TS_GRID_SIZE, TS_GRID_SIZE - 2, TS_GRID_SIZE - 2);
        });
        touchSnakeCtx.fillStyle = '#ff4444';
        touchSnakeCtx.beginPath();
        touchSnakeCtx.arc(ts_food.x * TS_GRID_SIZE + TS_GRID_SIZE / 2, ts_food.y * TS_GRID_SIZE + TS_GRID_SIZE / 2, TS_GRID_SIZE / 2.5, 0, 2 * Math.PI);
        touchSnakeCtx.fill();
    }
    function generateTouchSnakeFood() {
        ts_food = { x: Math.floor(Math.random() * TS_TILE_COUNT), y: Math.floor(Math.random() * TS_TILE_COUNT) };
        if (ts_snake.some(seg => seg.x === ts_food.x && seg.y === ts_food.y)) generateTouchSnakeFood();
    }
    function moveTouchSnake() {
        if (!ts_gameRunning || ts_gamePaused) return;
        const head = { x: ts_snake[0].x + ts_direction.x, y: ts_snake[0].y + ts_direction.y };
        if (head.x < 0 || head.x >= TS_TILE_COUNT || head.y < 0 || head.y >= TS_TILE_COUNT || ts_snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            gameOverTouchSnake(); return;
        }
        ts_snake.unshift(head);
        if (head.x === ts_food.x && head.y === ts_food.y) { ts_score += 10; updateTouchSnakeScore(); generateTouchSnakeFood(); }
        else { ts_snake.pop(); }
        drawTouchSnake();
    }
    function updateTouchSnakeScore() { document.getElementById('touch-snake-score').textContent = ts_score; }
    function gameOverTouchSnake() {
        ts_gameRunning = false; clearInterval(window.touchSnakeInterval);
        showGameOver('swipe-snake', `Final Score: ${ts_score}`, 'restartTouchSnake');
    }
    function changeTouchSnakeDirection(dir) {
        if (!ts_gameRunning || ts_gamePaused) return;
        if (dir === 'U' && ts_direction.y === 0) ts_direction = { x: 0, y: -1 };
        else if (dir === 'D' && ts_direction.y === 0) ts_direction = { x: 0, y: 1 };
        else if (dir === 'L' && ts_direction.x === 0) ts_direction = { x: -1, y: 0 };
        else if (dir === 'R' && ts_direction.x === 0) ts_direction = { x: 1, y: 0 };
    }
    let ts_touchStartX = 0, ts_touchStartY = 0;
    touchSnakeCanvas.addEventListener('touchstart', e => { ts_touchStartX = e.touches[0].clientX; ts_touchStartY = e.touches[0].clientY; e.preventDefault(); });
    touchSnakeCanvas.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - ts_touchStartX; const dy = e.changedTouches[0].clientY - ts_touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) changeTouchSnakeDirection(dx > 40 ? 'R' : (dx < -40 ? 'L' : null));
        else changeTouchSnakeDirection(dy > 40 ? 'D' : (dy < -40 ? 'U' : null));
    });
    document.querySelector('#swipe-snake #up-btn').addEventListener('click', () => changeTouchSnakeDirection('U'));
    document.querySelector('#swipe-snake #down-btn').addEventListener('click', () => changeTouchSnakeDirection('D'));
    document.querySelector('#swipe-snake #left-btn').addEventListener('click', () => changeTouchSnakeDirection('L'));
    document.querySelector('#swipe-snake #right-btn').addEventListener('click', () => changeTouchSnakeDirection('R'));
    window.startTouchSnake = () => restartTouchSnake();
    window.restartTouchSnake = () => {
        clearInterval(window.touchSnakeInterval); initTouchSnakeState(); ts_gameRunning = true;
        window.touchSnakeInterval = setInterval(moveTouchSnake, TS_SPEED);
        const gameContainer = document.getElementById('swipe-snake');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        gameContainer.querySelector('.start-btn').textContent = 'Restart Game';
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Pause';
    };
    window.pauseTouchSnake = () => {
        if (!ts_gameRunning) return; ts_gamePaused = !ts_gamePaused;
        document.querySelector('#swipe-snake .pause-btn').textContent = ts_gamePaused ? 'Resume' : 'Pause';
    };
    initTouchSnakeState();
    
    // 🧠 MEMORY GAME
    const memoryGrid = document.getElementById('memory-grid');
    let memorySequence, playerSequence, memoryLevel, canPlayerClick;
    window.memoryGameTimeout = null;
    function initMemoryGame() {
        memoryGrid.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const card = document.createElement('div');
            card.className = 'memory-card'; card.dataset.index = i;
            card.addEventListener('click', handleMemoryCardClick);
            memoryGrid.appendChild(card);
        }
        memorySequence = []; playerSequence = []; memoryLevel = 0; canPlayerClick = false;
        document.getElementById('memory-score').textContent = 0;
    }
    function nextMemoryLevel() {
        memoryLevel++; document.getElementById('memory-score').textContent = memoryLevel -1;
        playerSequence = []; canPlayerClick = false;
        memorySequence.push(Math.floor(Math.random() * 16));
        playSequence();
    }
    function playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= memorySequence.length) { clearInterval(interval); canPlayerClick = true; return; }
            const cardIndex = memorySequence[i];
            const card = memoryGrid.children[cardIndex];
            card.classList.add('active');
            setTimeout(() => card.classList.remove('active'), 400);
            i++;
        }, 600);
    }
    function handleMemoryCardClick(e) {
        if (!canPlayerClick) return;
        const index = parseInt(e.target.dataset.index);
        playerSequence.push(index);
        e.target.classList.add('active');
        setTimeout(() => e.target.classList.remove('active'), 200);
        if (playerSequence[playerSequence.length - 1] !== memorySequence[playerSequence.length - 1]) {
            gameOverMemory(); return;
        }
        if (playerSequence.length === memorySequence.length) {
            canPlayerClick = false;
            window.memoryGameTimeout = setTimeout(nextMemoryLevel, 1000);
        }
    }
    function gameOverMemory() {
        canPlayerClick = false;
        showGameOver('memory', `You reached level ${memoryLevel}!`, 'startMemoryGame');
    }
    window.startMemoryGame = () => {
        const gameContainer = document.getElementById('memory-game');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        initMemoryGame();
        nextMemoryLevel();
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Reset';
    };
    window.pauseMemoryGame = () => { clearTimeout(window.memoryGameTimeout); initMemoryGame(); };
    initMemoryGame();

    // 🏓 TOUCH PONG (MOBILE)
    const touchPongCanvas = document.getElementById('touch-pong-canvas');
    const touchPongCtx = touchPongCanvas.getContext('2d');
    let tp_ball, tp_player, tp_ai, tp_gameRunning, tp_gamePaused;
    window.touchPongInterval = null;
    function initTouchPongState() {
        tp_ball = { x: touchPongCanvas.width / 2, y: touchPongCanvas.height / 2, radius: 8, dx: 4, dy: -4 };
        tp_player = { x: touchPongCanvas.width / 2 - 40, y: touchPongCanvas.height - 30, width: 80, height: 12, score: 0 };
        tp_ai = { x: touchPongCanvas.width / 2 - 40, y: 20, width: 80, height: 12, score: 0 };
        tp_gameRunning = false; tp_gamePaused = false;
        updateTouchPongScore(); drawTouchPong();
    }
    function drawTouchPong() {
        touchPongCtx.fillStyle = 'black';
        touchPongCtx.fillRect(0, 0, touchPongCanvas.width, touchPongCanvas.height);
        touchPongCtx.fillStyle = 'white';
        touchPongCtx.fillRect(tp_player.x, tp_player.y, tp_player.width, tp_player.height);
        touchPongCtx.fillRect(tp_ai.x, tp_ai.y, tp_ai.width, tp_ai.height);
        touchPongCtx.beginPath();
        touchPongCtx.arc(tp_ball.x, tp_ball.y, tp_ball.radius, 0, Math.PI * 2);
        touchPongCtx.fill();
    }
    function moveTouchPong() {
        if (!tp_gameRunning || tp_gamePaused) return;
        tp_ball.x += tp_ball.dx; tp_ball.y += tp_ball.dy;
        if (tp_ball.x + tp_ball.radius > touchPongCanvas.width || tp_ball.x - tp_ball.radius < 0) tp_ball.dx *= -1;
        if (tp_ball.y - tp_ball.radius < tp_ai.y + tp_ai.height && tp_ball.x > tp_ai.x && tp_ball.x < tp_ai.x + tp_ai.width && tp_ball.dy < 0) tp_ball.dy *= -1;
        if (tp_ball.y + tp_ball.radius > tp_player.y && tp_ball.x > tp_player.x && tp_ball.x < tp_player.x + tp_player.width && tp_ball.dy > 0) tp_ball.dy *= -1;
        if (tp_ball.y > touchPongCanvas.height) { tp_ai.score++; resetTouchPongBall(); } 
        else if (tp_ball.y < 0) { tp_player.score++; resetTouchPongBall(); }
        tp_ai.x += (tp_ball.x - (tp_ai.x + tp_ai.width / 2)) * 0.1;
        updateTouchPongScore(); drawTouchPong();
    }
    function resetTouchPongBall() { tp_ball.x = touchPongCanvas.width / 2; tp_ball.y = touchPongCanvas.height / 2; }
    function updateTouchPongScore() {
        document.getElementById('touch-pong-score').textContent = tp_player.score;
        document.getElementById('touch-ai-score').textContent = tp_ai.score;
    }
    function moveTouchPongPaddle(e) {
        const touch = e.touches[0];
        const relativeX = touch.clientX - touchPongCanvas.getBoundingClientRect().left;
        tp_player.x = relativeX - tp_player.width / 2;
        if (tp_player.x < 0) tp_player.x = 0;
        if (tp_player.x + tp_player.width > touchPongCanvas.width) tp_player.x = touchPongCanvas.width - tp_player.width;
        if(!tp_gameRunning) drawTouchPong();
        e.preventDefault();
    }
    touchPongCanvas.addEventListener('touchmove', moveTouchPongPaddle);
    touchPongCanvas.addEventListener('touchstart', moveTouchPongPaddle);
    window.startTouchPong = () => restartTouchPong();
    window.restartTouchPong = () => {
        clearInterval(window.touchPongInterval); initTouchPongState(); tp_gameRunning = true;
        window.touchPongInterval = setInterval(moveTouchPong, 1000 / 60);
        const gameContainer = document.getElementById('touch-pong');
        const overlay = gameContainer.querySelector('.game-over');
        if (overlay) overlay.remove();
        gameContainer.querySelector('.start-btn').textContent = 'Restart Game';
        gameContainer.querySelector('.pause-btn').disabled = false;
        gameContainer.querySelector('.pause-btn').textContent = 'Pause';
    };
    window.pauseTouchPong = () => {
        if (!tp_gameRunning) return; tp_gamePaused = !tp_gamePaused;
        document.querySelector('#touch-pong .pause-btn').textContent = tp_gamePaused ? 'Resume' : 'Pause';
    };
    initTouchPongState();
    
    // --- GLOBAL FUNCTION EXPOSURE ---
    window.showPlatform = showPlatform;
    window.showGame = showGame;
});