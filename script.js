class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score')) || 0;
        this.gameOver = false;
        this.win = false;
        this.canMove = true;
        
        this.init();
    }
    
    init() {
        this.updateScore();
        this.updateBestScore();
        this.addEventListeners();
        this.addNewTile();
        this.addNewTile();
        this.render();
    }
    
    addEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
        document.getElementById('restart').addEventListener('click', () => this.resetGame());
        document.getElementById('continue').addEventListener('click', () => this.continuePlaying());
        document.getElementById('new-game-win').addEventListener('click', () => this.resetGame());
        
        // Touch events for mobile (optimized for iPhone)
        let startX, startY, startTime;
        const gridContainer = document.querySelector('.grid-container');
        
        // Prevent default touch behaviors
        gridContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: false });
        
        gridContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        gridContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            const duration = endTime - startTime;
            
            // Only trigger if swipe is long enough and quick enough
            if (duration < 300 && (Math.abs(diffX) > 30 || Math.abs(diffY) > 30)) {
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 30) {
                        this.move('left');
                    } else if (diffX < -30) {
                        this.move('right');
                    }
                } else {
                    if (diffY > 30) {
                        this.move('up');
                    } else if (diffY < -30) {
                        this.move('down');
                    }
                }
            }
            
            startX = startY = null;
        }, { passive: false });
    }
    
    handleKeyPress(e) {
        if (!this.canMove) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.move('right');
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.move('down');
                break;
        }
    }
    
    move(direction) {
        if (this.gameOver || !this.canMove) return;
        
        const oldGrid = JSON.stringify(this.grid);
        let moved = false;
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addNewTile();
            this.render();
            this.checkGameState();
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const newRow = [];
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] !== 0) {
                    newRow.push(this.grid[row][col]);
                }
            }
            
            // Merge adjacent tiles
            for (let i = 0; i < newRow.length - 1; i++) {
                if (newRow[i] === newRow[i + 1]) {
                    newRow[i] *= 2;
                    this.score += newRow[i];
                    newRow.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            // Fill with zeros
            while (newRow.length < 4) {
                newRow.push(0);
            }
            
            if (JSON.stringify(this.grid[row]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[row] = newRow;
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const newRow = [];
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] !== 0) {
                    newRow.push(this.grid[row][col]);
                }
            }
            
            // Merge adjacent tiles from right
            for (let i = newRow.length - 1; i > 0; i--) {
                if (newRow[i] === newRow[i - 1]) {
                    newRow[i] *= 2;
                    this.score += newRow[i];
                    newRow.splice(i - 1, 1);
                    moved = true;
                }
            }
            
            // Fill with zeros at the beginning
            while (newRow.length < 4) {
                newRow.unshift(0);
            }
            
            if (JSON.stringify(this.grid[row]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[row] = newRow;
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const newCol = [];
            for (let row = 0; row < 4; row++) {
                if (this.grid[row][col] !== 0) {
                    newCol.push(this.grid[row][col]);
                }
            }
            
            // Merge adjacent tiles
            for (let i = 0; i < newCol.length - 1; i++) {
                if (newCol[i] === newCol[i + 1]) {
                    newCol[i] *= 2;
                    this.score += newCol[i];
                    newCol.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            // Fill with zeros
            while (newCol.length < 4) {
                newCol.push(0);
            }
            
            // Update grid
            for (let row = 0; row < 4; row++) {
                if (this.grid[row][col] !== newCol[row]) {
                    moved = true;
                }
                this.grid[row][col] = newCol[row];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const newCol = [];
            for (let row = 0; row < 4; row++) {
                if (this.grid[row][col] !== 0) {
                    newCol.push(this.grid[row][col]);
                }
            }
            
            // Merge adjacent tiles from bottom
            for (let i = newCol.length - 1; i > 0; i--) {
                if (newCol[i] === newCol[i - 1]) {
                    newCol[i] *= 2;
                    this.score += newCol[i];
                    newCol.splice(i - 1, 1);
                    moved = true;
                }
            }
            
            // Fill with zeros at the top
            while (newCol.length < 4) {
                newCol.unshift(0);
            }
            
            // Update grid
            for (let row = 0; row < 4; row++) {
                if (this.grid[row][col] !== newCol[row]) {
                    moved = true;
                }
                this.grid[row][col] = newCol[row];
            }
        }
        return moved;
    }
    
    addNewTile() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    render() {
        const gridContainer = document.querySelector('.grid-container');
        const existingTiles = gridContainer.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = this.grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.textContent = value;
                    tile.dataset.value = value;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    
                    // Berechne die Position basierend auf Grid-Cell Position
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        const rect = cell.getBoundingClientRect();
                        const containerRect = gridContainer.getBoundingClientRect();
                        
                        // Berechne die exakte Position relativ zum Grid-Container
                        const left = rect.left - containerRect.left;
                        const top = rect.top - containerRect.top;
                        
                        tile.style.position = 'absolute';
                        tile.style.left = left + 'px';
                        tile.style.top = top + 'px';
                        tile.style.width = rect.width + 'px';
                        tile.style.height = rect.height + 'px';
                    }
                    
                    gridContainer.appendChild(tile);
                }
            }
        }
        
        this.updateScore();
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore);
            this.updateBestScore();
        }
    }
    
    updateBestScore() {
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    checkGameState() {
        // Check for win
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 2048 && !this.win) {
                    this.win = true;
                    this.showWin();
                    return;
                }
            }
        }
        
        // Check for game over
        if (!this.hasValidMoves()) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    hasValidMoves() {
        // Check for empty cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === 0) {
                    return true;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.grid[row][col];
                
                // Check right
                if (col < 3 && this.grid[row][col + 1] === current) {
                    return true;
                }
                
                // Check down
                if (row < 3 && this.grid[row + 1][col] === current) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    showGameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    showWin() {
        document.getElementById('win').classList.remove('hidden');
    }
    
    resetGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.win = false;
        this.canMove = true;
        
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('win').classList.add('hidden');
        
        this.updateScore();
        this.addNewTile();
        this.addNewTile();
        this.render();
    }
    
    continuePlaying() {
        document.getElementById('win').classList.add('hidden');
        this.canMove = true;
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
