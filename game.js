(function () {

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let serveDirection = 1;
    let gameState = "start";
    const maxScore = 5;

    let aiTargetY = canvas.height / 2;

    let playerScore = 0;
    let enemyScore = 0;

    const speedIncrease = 0.3;
    const aiSpeed = 4;
    const paddleSpeed = 6;

    const maxBallSpeed = 12;

    let upPressed = false;
    let downPressed = false;

    const paddle = {
        x: 10,
        y: canvas.height / 2 - 50,
        width: 10,
        height: 100
    };

    const enemy = {
        x: canvas.width - 20,
        y: canvas.height / 2 - 50,
        width: 10,
        height: 100
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 10,
        vx: 4,
        vy: 4
    };

    let touchUpActive = false;
    let touchDownActive = false;

    const liveScoreSpan = document.getElementById('liveScoreDisplay');
    const gameStatusText = document.getElementById('gameStatusText');

    function updateScoreUI() {
        liveScoreSpan.innerText = `${playerScore} : ${enemyScore}`;

        if (gameState === 'start') gameStatusText.innerText = '⚡ STAND BY';
        else if (gameState === 'play') gameStatusText.innerText = '⚡ BATTLE';
        else if (gameState === 'gameover') gameStatusText.innerText = '🏁 GAME OVER';
    }

    function restartGame() {

        playerScore = 0;
        enemyScore = 0;

        paddle.y = canvas.height / 2 - paddle.height / 2;
        enemy.y = canvas.height / 2 - enemy.height / 2;

        serveDirection = 1;
        resetBall();

        gameState = "play";

        updateScoreUI();
    }

    function drawNeonGrid() {

        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.strokeStyle = '#00ffff11';
            ctx.stroke();
        }

        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.strokeStyle = '#00ffff11';
            ctx.stroke();
        }

    }

    function drawCenterLine() {

        ctx.shadowColor = '#0ef';
        ctx.shadowBlur = 15;

        ctx.fillStyle = '#0ef';

        for (let i = 0; i < canvas.height; i += 30) {
            ctx.fillRect(canvas.width / 2 - 2, i, 4, 18);
        }

        ctx.shadowBlur = 0;

    }

    function drawPaddleCyber(x, y, w, h, type) {

        ctx.shadowBlur = 25;
        ctx.shadowColor = type === 'player' ? '#f0f' : '#ffaa00';

        const gradient = ctx.createLinearGradient(x, y, x + w, y + h);

        if (type === 'player') {
            gradient.addColorStop(0, '#ff22ff');
            gradient.addColorStop(1, '#aa00aa');
        } else {
            gradient.addColorStop(0, '#ffcc00');
            gradient.addColorStop(1, '#ff8800');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);

        ctx.shadowBlur = 0;

    }

    function drawBallCyber() {

        ctx.shadowBlur = 30;
        ctx.shadowColor = '#0ef';

        const grad = ctx.createRadialGradient(ball.x + 3, ball.y + 3, 2, ball.x + 6, ball.y + 6, 15);

        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#00ffff');
        grad.addColorStop(1, '#0066ff');

        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

    }

    function drawScoreCyber() {

        ctx.font = 'bold 48px "Orbitron", monospace';
        ctx.textAlign = 'center';

        ctx.shadowBlur = 30;
        ctx.shadowColor = '#0ef';

        ctx.fillStyle = '#00ffff';
        ctx.fillText(playerScore, canvas.width * 0.25, 85);

        ctx.fillStyle = '#ffaa00';
        ctx.fillText(enemyScore, canvas.width * 0.75, 85);

        ctx.shadowBlur = 0;

    }

    function drawStartScreenCyber() {

        ctx.shadowBlur = 30;
        ctx.shadowColor = '#0ef';

        ctx.fillStyle = '#00ffff';

        ctx.font = 'bold 56px "Orbitron"';
        ctx.textAlign = 'center';

        ctx.fillText('CYBER PONG', canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = '22px "Orbitron"';

        ctx.fillStyle = '#f0f';
        ctx.fillText('[ SPACE ] atau SENTUH MULAI', canvas.width / 2, canvas.height / 2 + 30);

        ctx.shadowBlur = 0;

    }

    function drawGameOverCyber() {

        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff00aa';

        ctx.fillStyle = '#ff66cc';

        ctx.font = 'bold 56px "Orbitron"';
        ctx.textAlign = 'center';

        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

        let winner = playerScore > enemyScore ? '👾 You WINS' : '🤖 AI WINS';

        ctx.font = '30px "Orbitron"';

        ctx.fillStyle = playerScore > enemyScore ? '#f0f' : '#ffaa00';

        ctx.fillText(winner, canvas.width / 2, canvas.height / 2 + 20);

        ctx.font = '20px "Orbitron"';

        ctx.fillStyle = '#0ef';

        ctx.fillText('SPACE / SENTUH MULAI', canvas.width / 2, canvas.height / 2 + 70);

        ctx.shadowBlur = 0;

    }

    function predictBall() {

        if (ball.vx > 0) {

            let time = (enemy.x - ball.x) / ball.vx;

            aiTargetY = ball.y + ball.vy * time;

            let error = (Math.random() - 0.5) * 130;

            aiTargetY += error;

            aiTargetY = Math.max(0, Math.min(canvas.height, aiTargetY));

        }

    }

    function updateEnemy() {

        predictBall();

        let move = (aiTargetY - (enemy.y + enemy.height / 2)) * 0.05;

        if (move > aiSpeed) move = aiSpeed;
        if (move < -aiSpeed) move = -aiSpeed;

        enemy.y += move;

        if (enemy.y < 0) enemy.y = 0;
        if (enemy.y + enemy.height > canvas.height)
            enemy.y = canvas.height - enemy.height;

    }

    function updatePaddle() {

        if (upPressed || touchUpActive) paddle.y -= paddleSpeed;
        if (downPressed || touchDownActive) paddle.y += paddleSpeed;

        if (paddle.y < 0) paddle.y = 0;
        if (paddle.y + paddle.height > canvas.height)
            paddle.y = canvas.height - paddle.height;

    }

    function collision(ball, paddle) {

        return (

            ball.x < paddle.x + paddle.width &&
            ball.x + ball.size > paddle.x &&
            ball.y < paddle.y + paddle.height &&
            ball.y + ball.size > paddle.y

        );

    }

    function resetBall() {

        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;

        ball.vx = 4 * serveDirection;
        ball.vy = (Math.random() - 0.5) * 6;

    }

    function limitBallSpeed() {

        ball.vx = Math.max(-maxBallSpeed, Math.min(maxBallSpeed, ball.vx));
        ball.vy = Math.max(-maxBallSpeed, Math.min(maxBallSpeed, ball.vy));

    }

    function updateBall() {

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
            ball.vy = -ball.vy;
        }

        if (collision(ball, paddle)) {

            let collidePoint = ball.y - (paddle.y + paddle.height / 2);
            collidePoint = collidePoint / (paddle.height / 2);

            let angle = collidePoint * Math.PI / 4;

            let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) + speedIncrease;

            ball.vx = Math.abs(speed * Math.cos(angle));
            ball.vy = speed * Math.sin(angle);

            limitBallSpeed();

        }

        if (collision(ball, enemy)) {

            let collidePoint = ball.y - (enemy.y + enemy.height / 2);
            collidePoint = collidePoint / (enemy.height / 2);

            let angle = collidePoint * Math.PI / 4;

            let speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) + speedIncrease;

            ball.vx = -speed * Math.cos(angle);
            ball.vy = speed * Math.sin(angle);

            limitBallSpeed();

        }

        if (playerScore >= maxScore || enemyScore >= maxScore) {

            gameState = "gameover";
            updateScoreUI();

        }

        if (ball.x < 0) {

            enemyScore++;

            serveDirection = 1;

            resetBall();
            updateScoreUI();

        }

        if (ball.x > canvas.width) {

            playerScore++;

            serveDirection = -1;

            resetBall();
            updateScoreUI();

        }

    }

    function gameLoop() {

        ctx.fillStyle = '#03050f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawNeonGrid();

        if (gameState === "start") {

            drawStartScreenCyber();

        }
        else if (gameState === "play") {

            updatePaddle();
            updateEnemy();
            updateBall();

            drawCenterLine();

            drawPaddleCyber(paddle.x, paddle.y, paddle.width, paddle.height, 'player');
            drawPaddleCyber(enemy.x, enemy.y, enemy.width, enemy.height, 'enemy');

            drawBallCyber();
            drawScoreCyber();

        }
        else if (gameState === "gameover") {

            drawGameOverCyber();
            drawScoreCyber();

        }

        requestAnimationFrame(gameLoop);

    }

    document.addEventListener("keydown", function (event) {

        if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.code === "Space") {
            event.preventDefault();
        }

        if (event.code === "Space") {

            if (gameState === "start") {

                gameState = "play";
                updateScoreUI();

            } else if (gameState === "gameover") {

                restartGame();

            }

        }

        if (event.key === "ArrowUp") upPressed = true;
        if (event.key === "ArrowDown") downPressed = true;

    });

    document.addEventListener("keyup", function (event) {

        if (event.key === "ArrowUp") upPressed = false;
        if (event.key === "ArrowDown") downPressed = false;

    });

    const touchUp = document.getElementById('touchUp');
    const touchDown = document.getElementById('touchDown');
    const touchSpace = document.getElementById('touchSpace');

    touchUp.addEventListener('touchstart', (e) => { e.preventDefault(); touchUpActive = true; });
    touchUp.addEventListener('touchend', (e) => { e.preventDefault(); touchUpActive = false; });

    touchDown.addEventListener('touchstart', (e) => { e.preventDefault(); touchDownActive = true; });
    touchDown.addEventListener('touchend', (e) => { e.preventDefault(); touchDownActive = false; });

    touchSpace.addEventListener('touchstart', (e) => {

        e.preventDefault();

        if (gameState === "start") {

            gameState = "play";
            updateScoreUI();

        }
        else if (gameState === "gameover") {

            restartGame();

        }

    });

    updateScoreUI();

    gameLoop();

})();