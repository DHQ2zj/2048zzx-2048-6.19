document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best');
    const newGameButton = document.getElementById('new-game');
    const tryAgainButton = document.getElementById('try-again');
    const gameMessage = document.querySelector('.game-message');
    const gameMessageText = document.querySelector('.game-message p');
    
    // 添加方向按钮元素
    const btnUp = document.getElementById('btn-up');
    const btnRight = document.getElementById('btn-right');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let won = false;
    let size = 4;
    
    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        grid = [];
        score = 0;
        gameOver = false;
        won = false;
        scoreDisplay.textContent = '0';
        bestScoreDisplay.textContent = bestScore;
        
        // 清空网格
        gridContainer.innerHTML = '';
        
        // 创建网格单元格
        for (let i = 0; i < size; i++) {
            grid[i] = [];
            for (let j = 0; j < size; j++) {
                const gridCell = document.createElement('div');
                gridCell.className = 'grid-cell';
                gridContainer.appendChild(gridCell);
                grid[i][j] = 0;
            }
        }
        
        // 初始添加两个数字
        addRandomTile();
        addRandomTile();
        
        // 隐藏游戏消息
        gameMessage.style.display = 'none';
        gameMessage.classList.remove('game-over', 'game-won');
    }
    
    // 添加随机数字到格子
    function addRandomTile() {
        if (isFull()) return;
        
        let emptyCells = [];
        // 找出所有空格子
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        
        // 随机选一个空格子
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const cell = emptyCells[randomIndex];
            const value = Math.random() < 0.9 ? 2 : 4; // 90%概率是2，10%概率是4
            grid[cell.x][cell.y] = value;
            
            // 创建方块元素
            const tile = document.createElement('div');
            tile.className = `tile tile-${value} tile-new`;
            tile.textContent = value;
            // 定位到对应的网格位置
            const gridCell = gridContainer.children[cell.x * size + cell.y];
            gridCell.appendChild(tile);
        }
    }
    
    // 判断网格是否已满
    function isFull() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 更新分数
    function updateScore(value) {
        score += value;
        scoreDisplay.textContent = score;
        
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore;
            localStorage.setItem('bestScore', bestScore);
        }
    }
    
    // 检查游戏是否结束
    function checkGameStatus() {
        // 检查是否赢了
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 2048 && !won) {
                    won = true;
                    gameMessage.classList.add('game-won');
                    gameMessageText.textContent = '恭喜你赢了！';
                    gameMessage.style.display = 'flex';
                    return;
                }
            }
        }
        
        // 检查是否还有可移动的方块
        if (!canMove()) {
            gameOver = true;
            gameMessage.classList.add('game-over');
            gameMessageText.textContent = '游戏结束！';
            gameMessage.style.display = 'flex';
        }
    }
    
    // 判断是否还能移动
    function canMove() {
        // 检查是否有空格子
        if (!isFull()) return true;
        
        // 检查相邻的格子是否有相同的值
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const value = grid[i][j];
                
                // 检查右边相邻格子
                if (j < size - 1 && grid[i][j + 1] === value) return true;
                
                // 检查下边相邻格子
                if (i < size - 1 && grid[i + 1][j] === value) return true;
            }
        }
        
        return false;
    }
    
    // 移动并合并方块
    function moveTiles(direction) {
        if (gameOver) return false;
        
        let moved = false;
        
        // 根据方向处理数据
        switch (direction) {
            case 'up':
                moved = moveUp();
                break;
            case 'right':
                moved = moveRight();
                break;
            case 'down':
                moved = moveDown();
                break;
            case 'left':
                moved = moveLeft();
                break;
        }
        
        // 如果有移动，添加新的方块
        if (moved) {
            // 清除旧的方块元素
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.innerHTML = '';
            });
            
            // 重新渲染方块
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (grid[i][j] !== 0) {
                        const tile = document.createElement('div');
                        tile.className = `tile tile-${grid[i][j]}`;
                        if (grid[i][j] > 2048) {
                            tile.classList.add('tile-super');
                        }
                        tile.textContent = grid[i][j];
                        const gridCell = gridContainer.children[i * size + j];
                        gridCell.appendChild(tile);
                    }
                }
            }
            
            // 添加新方块
            setTimeout(addRandomTile, 150);
            
            // 检查游戏状态
            setTimeout(checkGameStatus, 200);
        }
        
        return moved;
    }
    
    // 向上移动
    function moveUp() {
        let moved = false;
        
        for (let j = 0; j < size; j++) {
            // 从上往下依次处理每一行
            for (let i = 1; i < size; i++) {
                if (grid[i][j] !== 0) {
                    let row = i;
                    while (row > 0) {
                        // 如果上面的格子为空，则移动
                        if (grid[row - 1][j] === 0) {
                            grid[row - 1][j] = grid[row][j];
                            grid[row][j] = 0;
                            row--;
                            moved = true;
                        }
                        // 如果上面的格子和当前格子相等，则合并
                        else if (grid[row - 1][j] === grid[row][j]) {
                            grid[row - 1][j] *= 2;
                            grid[row][j] = 0;
                            updateScore(grid[row - 1][j]);
                            moved = true;
                            break;
                        }
                        // 如果上面的格子和当前格子不等，则停止移动
                        else {
                            break;
                        }
                    }
                }
            }
        }
        
        return moved;
    }
    
    // 向右移动
    function moveRight() {
        let moved = false;
        
        for (let i = 0; i < size; i++) {
            // 从右往左依次处理每一列
            for (let j = size - 2; j >= 0; j--) {
                if (grid[i][j] !== 0) {
                    let col = j;
                    while (col < size - 1) {
                        // 如果右边的格子为空，则移动
                        if (grid[i][col + 1] === 0) {
                            grid[i][col + 1] = grid[i][col];
                            grid[i][col] = 0;
                            col++;
                            moved = true;
                        }
                        // 如果右边的格子和当前格子相等，则合并
                        else if (grid[i][col + 1] === grid[i][col]) {
                            grid[i][col + 1] *= 2;
                            grid[i][col] = 0;
                            updateScore(grid[i][col + 1]);
                            moved = true;
                            break;
                        }
                        // 如果右边的格子和当前格子不等，则停止移动
                        else {
                            break;
                        }
                    }
                }
            }
        }
        
        return moved;
    }
    
    // 向下移动
    function moveDown() {
        let moved = false;
        
        for (let j = 0; j < size; j++) {
            // 从下往上依次处理每一行
            for (let i = size - 2; i >= 0; i--) {
                if (grid[i][j] !== 0) {
                    let row = i;
                    while (row < size - 1) {
                        // 如果下面的格子为空，则移动
                        if (grid[row + 1][j] === 0) {
                            grid[row + 1][j] = grid[row][j];
                            grid[row][j] = 0;
                            row++;
                            moved = true;
                        }
                        // 如果下面的格子和当前格子相等，则合并
                        else if (grid[row + 1][j] === grid[row][j]) {
                            grid[row + 1][j] *= 2;
                            grid[row][j] = 0;
                            updateScore(grid[row + 1][j]);
                            moved = true;
                            break;
                        }
                        // 如果下面的格子和当前格子不等，则停止移动
                        else {
                            break;
                        }
                    }
                }
            }
        }
        
        return moved;
    }
    
    // 向左移动
    function moveLeft() {
        let moved = false;
        
        for (let i = 0; i < size; i++) {
            // 从左往右依次处理每一列
            for (let j = 1; j < size; j++) {
                if (grid[i][j] !== 0) {
                    let col = j;
                    while (col > 0) {
                        // 如果左边的格子为空，则移动
                        if (grid[i][col - 1] === 0) {
                            grid[i][col - 1] = grid[i][col];
                            grid[i][col] = 0;
                            col--;
                            moved = true;
                        }
                        // 如果左边的格子和当前格子相等，则合并
                        else if (grid[i][col - 1] === grid[i][col]) {
                            grid[i][col - 1] *= 2;
                            grid[i][col] = 0;
                            updateScore(grid[i][col - 1]);
                            moved = true;
                            break;
                        }
                        // 如果左边的格子和当前格子不等，则停止移动
                        else {
                            break;
                        }
                    }
                }
            }
        }
        
        return moved;
    }
    
    // 监听键盘事件
    function handleKeyPress(e) {
        if (gameOver) return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                moveTiles('up');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                moveTiles('right');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                moveTiles('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                moveTiles('left');
                break;
        }
    }
    
    // 监听触摸事件
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        if (gameOver) return;
        
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        
        const xDiff = touchEndX - touchStartX;
        const yDiff = touchEndY - touchStartY;
        
        // 判断是水平方向还是垂直方向的滑动
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            // 水平方向
            if (xDiff > 50) {
                // 向右滑动
                moveTiles('right');
            } else if (xDiff < -50) {
                // 向左滑动
                moveTiles('left');
            }
        } else {
            // 垂直方向
            if (yDiff > 50) {
                // 向下滑动
                moveTiles('down');
            } else if (yDiff < -50) {
                // 向上滑动
                moveTiles('up');
            }
        }
    }
    
    // 初始化事件监听
    document.addEventListener('keydown', handleKeyPress);
    gridContainer.addEventListener('touchstart', handleTouchStart);
    gridContainer.addEventListener('touchend', handleTouchEnd);
    
    // 新游戏按钮
    newGameButton.addEventListener('click', initGame);
    tryAgainButton.addEventListener('click', initGame);
    
    // 添加方向按钮的事件监听器
    btnUp.addEventListener('click', () => moveTiles('up'));
    btnRight.addEventListener('click', () => moveTiles('right'));
    btnDown.addEventListener('click', () => moveTiles('down'));
    btnLeft.addEventListener('click', () => moveTiles('left'));
    
    // 初始化游戏
    initGame();
}); 