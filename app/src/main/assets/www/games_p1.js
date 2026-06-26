/**
 * BiteGamez Arcade Game Bundle - Part 1 (Games 1 to 7)
 */

window.GameCollection = window.GameCollection || {};

// ==========================================
// GAME 1: SUDOKU
// ==========================================
window.GameCollection["sudoku"] = {
    name: "Sudoku Match",
    icon: "grid_on",
    color: "#a855f7", // Purple theme
    hasScore: false,
    hasTimer: true,
    hasLevel: true,
    saveGameState() {
        try {
            const timeElapsed = typeof this.sdk.getTimerValue === "function" ? this.sdk.getTimerValue() : 0;
            const state = {
                level: this.level,
                board: this.board,
                solution: this.solution,
                initialMask: this.initialMask,
                notesMatrix: this.notesMatrix,
                undoStack: this.undoStack,
                timeElapsed: timeElapsed
            };
            localStorage.setItem("game_state_sudoku", JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save sudoku state", e);
        }
    },
    clearGameState() {
        localStorage.removeItem("game_state_sudoku");
    },
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.selectedCell = null;
        this.notesMode = false;
        this.level = "medium"; // default
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="width: 100%; max-width: 360px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
                <div class="level-select-row" style="display: flex; gap: 6px; justify-content: center; margin-bottom: 4px;">
                    <button class="level-btn" data-level="easy" style="flex:1; padding: 6px; border-radius: 8px; border:1px solid var(--border-color); font-size:12px; font-weight:700; background:rgba(255,255,255,0.05); color:var(--text-primary);">Easy</button>
                    <button class="level-btn" data-level="medium" style="flex:1; padding: 6px; border-radius: 8px; border:1px solid var(--border-color); font-size:12px; font-weight:700; background:rgba(255,255,255,0.05); color:var(--text-primary);">Medium</button>
                    <button class="level-btn" data-level="hard" style="flex:1; padding: 6px; border-radius: 8px; border:1px solid var(--border-color); font-size:12px; font-weight:700; background:rgba(255,255,255,0.05); color:var(--text-primary);">Hard</button>
                    <button class="level-btn" data-level="expert" style="flex:1; padding: 6px; border-radius: 8px; border:1px solid var(--border-color); font-size:12px; font-weight:700; background:rgba(255,255,255,0.05); color:var(--text-primary);">Expert</button>
                </div>
                <div id="sudoku-grid-container" style="width:100%; aspect-ratio:1;"></div>
                <div class="sudoku-controls" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; gap:8px;">
                    <button id="btn-sudoku-notes" class="arcade-button" style="flex:1; padding:10px; font-size:13px;">✏️ Notes: Off</button>
                    <button id="btn-sudoku-hint" class="arcade-button primary" style="flex:1; padding:10px; font-size:13px;">💡 Hint</button>
                </div>
                <div class="numpad-grid" style="display: grid; grid-template-columns: repeat(9, 1fr); gap: 4px; margin-top: 4px;">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="numpad-btn" data-val="${n}" style="aspect-ratio:1; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-card); color:var(--text-primary); font-size:16px; font-weight:800; display:flex; align-items:center; justify-content:center; cursor:pointer;">${n}</button>`).join('')}
                </div>
            </div>
        `;
        
        this.setupEvents();
        
        const saved = localStorage.getItem("game_state_sudoku");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.level = state.level || "medium";
                this.board = state.board;
                this.solution = state.solution;
                this.initialMask = state.initialMask;
                this.notesMatrix = state.notesMatrix;
                this.undoStack = state.undoStack || [];
                const savedTime = state.timeElapsed || 0;
                
                this.container.querySelectorAll(".level-btn").forEach(b => {
                    if (b.getAttribute("data-level") === this.level) b.classList.add("active");
                    else b.classList.remove("active");
                });
                
                this.renderGrid();
                this.sdk.startTimer(savedTime);
                return;
            } catch (e) {
                console.error("Failed to load saved sudoku state", e);
            }
        }
        
        this.container.querySelectorAll(".level-btn").forEach(b => {
            if (b.getAttribute("data-level") === "medium") b.classList.add("active");
            else b.classList.remove("active");
        });
        this.generatePuzzle();
    },
    setupEvents() {
        // Level selection
        this.container.querySelectorAll(".level-btn").forEach(btn => {
            btn.onclick = (e) => {
                this.container.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                this.level = e.target.getAttribute("data-level");
                this.sdk.sound.playSelect();
                this.generatePuzzle();
            };
        });

        // Notes and Hint button
        const notesBtn = this.container.querySelector("#btn-sudoku-notes");
        notesBtn.onclick = () => {
            this.notesMode = !this.notesMode;
            notesBtn.innerHTML = `✏️ Notes: ${this.notesMode ? 'On' : 'Off'}`;
            notesBtn.style.borderColor = this.notesMode ? 'var(--accent)' : 'var(--border-color)';
            this.sdk.sound.playTap();
        };

        this.container.querySelector("#btn-sudoku-hint").onclick = () => {
            this.giveHint();
        };

        // Numpad clicks
        this.container.querySelectorAll(".numpad-btn").forEach(btn => {
            btn.onclick = (e) => {
                const num = parseInt(btn.getAttribute("data-val"));
                this.handleNumberInput(num);
            };
        });
    },
    generatePuzzle() {
        // Base seed layout
        this.solution = [
            [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7],
            [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6],
            [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]
        ];
        
        // Randomly shuffle rows & columns within 3x3 blocks to make generated board unique
        this.shuffleBoard();
        
        // Make standard holes based on selected user difficulty level
        const holesMap = { easy: 30, medium: 42, hard: 54, expert: 64 };
        const hCount = holesMap[this.level] || 40;
        
        this.board = this.solution.map(row => [...row]);
        this.notesMatrix = Array(9).fill(null).map(() => Array(9).fill(null).map(() => []));
        this.undoStack = [];
        
        let holesPlaced = 0;
        while(holesPlaced < hCount) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if(this.board[r][c] !== 0) {
                this.board[r][c] = 0;
                holesPlaced++;
            }
        }
        
        this.initialMask = this.board.map(row => row.map(v => v !== 0));
        this.renderGrid();
        this.sdk.startTimer();
        this.saveGameState();
    },
    shuffleBoard() {
        // Simple swap logic to keep correct math properties while creating high permutation count
        for (let block = 0; block < 3; block++) {
            const r1 = block * 3 + Math.floor(Math.random() * 3);
            const r2 = block * 3 + Math.floor(Math.random() * 3);
            const tempRow = this.solution[r1];
            this.solution[r1] = this.solution[r2];
            this.solution[r2] = tempRow;
        }
    },
    renderGrid() {
        const gridBox = this.container.querySelector("#sudoku-grid-container");
        gridBox.innerHTML = "";
        
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.height = "100%";
        table.style.borderCollapse = "collapse";
        table.style.border = "3px solid var(--text-primary)";
        
        for (let r = 0; r < 9; r++) {
            const tr = document.createElement("tr");
            if (r % 3 === 2 && r !== 8) {
                tr.style.borderBottom = "3px solid var(--text-primary)";
            } else {
                tr.style.borderBottom = "1px solid var(--border-color)";
            }
            
            for (let c = 0; c < 9; c++) {
                const td = document.createElement("td");
                td.style.width = "11.11%";
                td.style.aspectRatio = "1";
                td.style.textAlign = "center";
                td.style.fontWeight = "bold";
                td.style.fontSize = "16px";
                td.style.position = "relative";
                td.style.cursor = "pointer";
                
                if (c % 3 === 2 && c !== 8) {
                    td.style.borderRight = "3px solid var(--text-primary)";
                } else {
                    td.style.borderRight = "1px solid var(--border-color)";
                }
                
                const val = this.board[r][c];
                const isInitial = this.initialMask[r][c];
                
                if (isInitial) {
                    td.innerText = val;
                    td.style.color = "var(--text-secondary)";
                    td.style.background = "rgba(255,255,255,0.02)";
                } else if (val !== 0) {
                    td.innerText = val;
                    // Check if error
                    if (val !== this.solution[r][c]) {
                        td.style.color = "var(--accent-red)";
                    } else {
                        td.style.color = "var(--accent-cyan)";
                    }
                } else {
                    // Show note marks
                    const notesList = this.notesMatrix[r][c];
                    if (notesList.length > 0) {
                        td.innerHTML = `
                            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1px; width:100%; height:100%; font-size:8px; color:var(--text-secondary); opacity:0.8; padding:2px;">
                                ${[1,2,3,4,5,6,7,8,9].map(n => `<div>${notesList.includes(n) ? n : ''}</div>`).join('')}
                            </div>
                        `;
                    }
                }
                
                td.onclick = () => {
                    this.selectCell(r, c, td);
                };
                
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        gridBox.appendChild(table);
    },
    selectCell(r, c, el) {
        this.container.querySelectorAll("td").forEach(td => {
            td.style.backgroundColor = "";
        });
        this.selectedCell = { r, c };
        el.style.backgroundColor = "rgba(34, 197, 94, 0.2)"; // glow accent
        this.sdk.sound.playTap();
    },
    saveToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            board: this.board.map(row => [...row]),
            notesMatrix: this.notesMatrix.map(row => row.map(cell => [...cell]))
        }));
        if (this.undoStack.length > 25) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.board = prevState.board;
            this.notesMatrix = prevState.notesMatrix;
            this.renderGrid();
            this.sdk.sound.playTap();
            return true;
        }
        return false;
    },
    handleNumberInput(num) {
        if (!this.selectedCell) return;
        const { r, c } = this.selectedCell;
        if (this.initialMask[r][c]) return; // static field
        
        this.saveToHistory();
        
        if (this.notesMode) {
            const list = this.notesMatrix[r][c];
            const idx = list.indexOf(num);
            if (idx > -1) list.splice(idx, 1);
            else list.push(num);
            this.board[r][c] = 0; // Clear value if writing notes
        } else {
            this.board[r][c] = num;
            this.notesMatrix[r][c] = []; // Clear notes
        }
        
        this.sdk.sound.playTap();
        this.renderGrid();
        
        // Re-select that cell
        const rows = this.container.querySelectorAll("tr");
        const cell = rows[r].cells[c];
        cell.style.backgroundColor = "rgba(34, 197, 94, 0.2)";
        
        this.checkWinState();
    },
    giveHint() {
        if (!this.selectedCell) return;
        const { r, c } = this.selectedCell;
        if (this.initialMask[r][c]) return;
        
        this.saveToHistory();
        
        this.board[r][c] = this.solution[r][c];
        this.notesMatrix[r][c] = [];
        this.sdk.sound.playMerge();
        this.renderGrid();
        this.checkWinState();
    },
    checkWinState() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] !== this.solution[r][c]) {
                    this.saveGameState();
                    return; // match missing
                }
            }
        }
        // Win!
        this.clearGameState();
        this.sdk.gameOver({ score: 100, isBest: true });
    },
    start() {},
    pause() {},
    destroy() {}
};

// ==========================================
// GAME 2: 2048
// ==========================================
window.GameCollection["2048"] = {
    name: "Arcade 2048",
    icon: "calculate",
    color: "#f97316", // Orange
    hasScore: true,
    hasTimer: false,
    saveGameState() {
        if (this.isGameOver) return;
        try {
            const state = {
                board: this.board,
                score: this.score,
                history: this.history
            };
            localStorage.setItem("game_state_2048", JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save 2048 state", e);
        }
    },
    clearGameState() {
        localStorage.removeItem("game_state_2048");
    },
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.board = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.history = []; // stack of {board, score} for undo capacity
        this.isGameOver = false;
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; gap:16px; width:100%;">
                <div class="grid-2048" id="grid-2048"></div>
                <div style="display:flex; gap:12px; width:100%; max-width:320px;">
                    <button id="btn-2048-undo" class="arcade-button" style="flex:1;">↩️ Undo</button>
                    <button id="btn-2048-restart" class="arcade-button" style="flex:1;">🔄 Restart</button>
                </div>
            </div>
        `;
        
        this.gridBox = this.container.querySelector("#grid-2048");
        this.container.querySelector("#btn-2048-undo").onclick = () => this.handleUndo();
        this.container.querySelector("#btn-2048-restart").onclick = () => this.restartGame();
        
        this.setupTouchInput();
        
        const saved = localStorage.getItem("game_state_2048");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.board = state.board || Array(4).fill(null).map(() => Array(4).fill(0));
                this.score = state.score || 0;
                this.history = state.history || [];
                this.sdk.updateHUD(this.score);
                this.renderBoard();
            } catch (e) {
                this.restartGame();
            }
        } else {
            this.restartGame();
        }
    },
    setupTouchInput() {
        let touchStart = null;
        this.gridBox.ontouchstart = (e) => {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };
        this.gridBox.ontouchend = (e) => {
            if (!touchStart) return;
            const dx = e.changedTouches[0].clientX - touchStart.x;
            const dy = e.changedTouches[0].clientY - touchStart.y;
            
            if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) this.move("right");
                    else this.move("left");
                } else {
                    if (dy > 0) this.move("down");
                    else this.move("up");
                }
            }
            touchStart = null;
        };
        
        // PC keyboard arrow options standard mapping
        this.keyHandler = (e) => {
            if (e.key === "ArrowUp") this.move("up");
            if (e.key === "ArrowDown") this.move("down");
            if (e.key === "ArrowLeft") this.move("left");
            if (e.key === "ArrowRight") this.move("right");
        };
        window.addEventListener("keydown", this.keyHandler);
    },
    restartGame() {
        this.board = Array(4).fill(null).map(() => Array(4).fill(0));
        this.score = 0;
        this.history = [];
        this.isGameOver = false;
        this.sdk.updateHUD(this.score);
        this.addTile();
        this.addTile();
        this.renderBoard();
        this.saveGameState();
    },
    addTile() {
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    },
    saveToHistory() {
        this.history.push({
            board: this.board.map(row => [...row]),
            score: this.score
        });
        if (this.history.length > 25) this.history.shift(); // generous stack size
    },
    undo() {
        if (this.history.length === 0) return false;
        this.handleUndo();
        return true;
    },
    handleUndo() {
        if (this.history.length === 0) return;
        const last = this.history.pop();
        this.board = last.board;
        this.score = last.score;
        this.sdk.updateHUD(this.score);
        this.sdk.sound.playTap();
        this.renderBoard();
        this.saveGameState();
    },
    renderBoard() {
        this.gridBox.innerHTML = "";
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const cell = document.createElement("div");
                cell.className = "cell-2048";
                const val = this.board[r][c];
                if (val > 0) {
                    cell.innerText = val;
                    cell.style.color = val <= 4 ? "var(--bg-app)" : "white";
                    
                    // Progressive classic 2048 background colors
                    const hueMap = {
                        2: "#e2e8f0", 4: "#cbd5e1", 8: "#f97316", 16: "#ea580c",
                        32: "#f43f5e", 64: "#e11d48", 128: "#eab308", 256: "#ca8a04",
                        512: "#22c55e", 1024: "#06b6d4", 2048: "#ec4899"
                    };
                    cell.style.backgroundColor = hueMap[val] || "#a855f7";
                }
                this.gridBox.appendChild(cell);
            }
        }
    },
    move(dir) {
        this.saveToHistory();
        let boardChanged = false;
        
        const rotate = (times) => {
            for (let t = 0; t < times; t++) {
                const temp = Array(4).fill(null).map(() => Array(4).fill(0));
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) temp[c][3 - r] = this.board[r][c];
                }
                this.board = temp;
            }
        };
        
        // Pivot board to slide left, process slides, pivot back!
        const rotMap = { left: 0, down: 1, right: 2, up: 3 };
        const rots = rotMap[dir];
        
        rotate(rots);
        
        // Process standard merge and compression leftward
        for (let r = 0; r < 4; r++) {
            let row = this.board[r].filter(v => v !== 0);
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c+1]) {
                    row[c] *= 2;
                    this.score += row[c];
                    row.splice(c+1, 1);
                    boardChanged = true;
                    this.sdk.sound.playMerge();
                }
            }
            while(row.length < 4) row.push(0);
            if (row.join(",") !== this.board[r].join(",")) boardChanged = true;
            this.board[r] = row;
        }
        
        // Standard rotate back
        rotate((4 - rots) % 4);
        
        if (boardChanged) {
            this.addTile();
            this.sdk.updateHUD(this.score);
            this.sdk.sound.playTap();
            this.renderBoard();
            this.saveGameState();
            this.checkGameOver();
        } else {
            this.history.pop(); // discard redundant step
        }
    },
    checkGameOver() {
        // Find if empty space available
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.board[r][c] === 0) return;
                if (r < 3 && this.board[r][c] === this.board[r+1][c]) return;
                if (c < 3 && this.board[r][c] === this.board[r][c+1]) return;
            }
        }
        // No moves remaining!
        this.isGameOver = true;
        this.clearGameState();
        this.sdk.gameOver({ score: this.score });
    },
    start() {},
    pause() {},
    destroy() {
        this.saveGameState();
        window.removeEventListener("keydown", this.keyHandler);
    }
};

// ==========================================
// GAME 3: FLAPPY BIRD STYLE
// ==========================================
window.GameCollection["flappy"] = {
    name: "Flappy Bird",
    icon: "flight_takeoff",
    color: "#06b6d4", // Cyan
    hasScore: true,
    hasTimer: false,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="flappy-canvas" class="arcade-canvas" width="360" height="480"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#flappy-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.bird = { x: 100, y: 240, vy: 0, r: 12, jump: -6.5, g: 0.35 };
        this.pipes = [];
        this.frameCount = 0;
        this.score = 0;
        this.isRunning = false;
        
        this.setupEvents();
        this.spawnPipe();
        this.renderStartPrompt();
    },
    setupEvents() {
        const handler = () => {
            if (!this.isRunning) {
                this.isRunning = true;
                this.loop();
            }
            this.bird.vy = this.bird.jump;
            this.sdk.sound.playJump();
        };
        this.canvas.onclick = handler;
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            handler();
        };
    },
    spawnPipe() {
        const gap = 155;
        const topH = 50 + Math.random() * 190;
        const hasCookie = Math.random() < 0.04; // 4% chance of easter cookie
        this.pipes.push({
            x: 360,
            top: topH,
            bottom: topH + gap,
            width: 52,
            passed: false,
            hasCookie: hasCookie,
            cookieY: topH + gap / 2,
            cookieCollected: false
        });
    },
    renderStartPrompt() {
        this.ctx.fillStyle = "#1e293b";
        this.ctx.fillRect(0, 0, 360, 480);
        
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 20px system-ui";
        this.ctx.textAlign = "center";
        this.ctx.fillText("TAP SCREEN TO JUMP & START", 180, 240);
        
        // Draw elegant yellow bird avatar
        this.ctx.fillStyle = "#fbbf24";
        this.ctx.beginPath();
        this.ctx.arc(180, 180, 16, 0, Math.PI * 2);
        this.ctx.fill();
    },
    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    update() {
        this.frameCount++;
        
        // Gravity physics update
        this.bird.vy += this.bird.g;
        this.bird.y += this.bird.vy;
        
        // Bottom boundary checks
        if (this.bird.y > 480 - this.bird.r || this.bird.y < 0) {
            this.crash();
        }
        
        // Pipe updates
        if (this.frameCount % 90 === 0) {
            this.spawnPipe();
        }
        
        this.pipes.forEach(pipe => {
            pipe.x -= 2.2; // scroll speed
            
            // Check collision with bounding circles
            if (pipe.x < this.bird.x + this.bird.r && pipe.x + pipe.width > this.bird.x - this.bird.r) {
                if (this.bird.y - this.bird.r < pipe.top || this.bird.y + this.bird.r > pipe.bottom) {
                    this.crash();
                }
            }
            // Add score
            if (!pipe.passed && pipe.x + pipe.width < 100) {
                pipe.passed = true;
                this.score++;
                
                if (pipe.hasCookie && !pipe.cookieCollected) {
                    pipe.cookieCollected = true;
                    this.score += 5; // bonus scores
                    window.triggerEasterEgg(500, "FLAPPY COOKIE FLIGHT");
                }
                
                this.sdk.updateHUD(this.score);
                this.sdk.sound.playMerge();
            }
        });
        
        // Clean off-screen pipes
        this.pipes = this.pipes.filter(p => p.x > -p.width);
    },
    draw() {
        this.ctx.clearRect(0,0,360,480);
        
        // Sky blue background
        this.ctx.fillStyle = "#0284c7";
        this.ctx.fillRect(0,0,360,480);
        
        // Green Pipe drawing
        this.pipes.forEach(pipe => {
            this.ctx.fillStyle = "#22c55e";
            this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
            this.ctx.fillRect(pipe.x, pipe.bottom, pipe.width, 480 - pipe.bottom);
            
            // Shadows and borders
            this.ctx.strokeStyle = "#15803d";
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
            this.ctx.strokeRect(pipe.x, pipe.bottom, pipe.width, 480 - pipe.bottom);
            
            // Draw floating cookie if present & not collected
            if (pipe.hasCookie && !pipe.cookieCollected) {
                this.ctx.fillStyle = "white";
                this.ctx.font = "22px system-ui";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText("🍪", pipe.x + pipe.width / 2, pipe.cookieY);
            }
        });
        
        // Bird rendering
        this.ctx.fillStyle = "#fbbf24";
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = "#f97316"; // beak
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.r - 2, this.bird.y - 4);
        this.ctx.lineTo(this.bird.x + this.bird.r + 8, this.bird.y);
        this.ctx.lineTo(this.bird.x + this.bird.r - 2, this.bird.y + 4);
        this.ctx.fill();
    },
    crash() {
        this.isRunning = false;
        this.sdk.sound.playHit();
        this.sdk.sound.playLose();
        cancelAnimationFrame(this.animationId);
        this.sdk.gameOver({ score: this.score });
    },
    start() {
        if (this.isRunning) this.loop();
    },
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    },
    destroy() {
        this.pause();
    }
};

// ==========================================
// GAME 4: SPACESHIP SHOOTER
// ==========================================
window.GameCollection["spaceship"] = {
    name: "Cosmo Blitz",
    icon: "rocket",
    color: "#06b6d4",
    hasScore: true,
    hasLives: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="shooter-canvas" class="arcade-canvas" width="360" height="480" style="touch-action:none;"></canvas>
            <div style="margin-top: 8px; font-size: 11px; text-align: center; opacity: 0.8; font-weight: bold; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 6px; border-radius: 8px; width: 100%; box-sizing: border-box;">
                👉 SWIPE/DRAG left & right horizontally to steer your spaceship
            </div>
        `;
        
        this.canvas = this.container.querySelector("#shooter-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.player = { x: 180, y: 400, size: 24, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.score = 0;
        this.lives = 5;
        this.level = 1;
        this.scoreForNextBoss = 40;
        this.bossActive = false;
        this.boss = null;
        this.isRunning = true;
        
        this.setupEvents();
        this.loop();
    },
    setupEvents() {
        let isDragging = false;
        let lastX = 0;
        
        const dragStart = (clientX) => {
            isDragging = true;
            lastX = clientX;
        };
        
        const dragMove = (clientX) => {
            if (!isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            // Calculate delta in canvas scale
            const canvasWidthRatio = 360 / rect.width;
            const deltaX = (clientX - lastX) * canvasWidthRatio * 1.35; // sensitivity boost to feel super responsive
            this.player.x = Math.max(20, Math.min(340, this.player.x + deltaX));
            lastX = clientX;
        };
        
        const dragEnd = () => {
            isDragging = false;
        };
        
        this.canvas.onmousedown = (e) => {
            dragStart(e.clientX);
        };
        this.canvas.onmousemove = (e) => {
            dragMove(e.clientX);
        };
        window.addEventListener("mouseup", dragEnd);
        
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                dragStart(e.touches[0].clientX);
            }
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                dragMove(e.touches[0].clientX);
            }
        };
        this.canvas.ontouchend = dragEnd;
        
        // Save the event listener reference so it can be cleaned up on destroy
        this._dragCleanup = () => {
            window.removeEventListener("mouseup", dragEnd);
        };
    },
    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    update() {
        // Auto Shoot - Made easier with more satisfying rapid fires
        if (Math.random() < 0.25) {
            // Shoots dual/triple shots to defeat enemies quickly!
            this.bullets.push({ x: this.player.x - 8, y: this.player.y - 12, speed: 8.5 });
            this.bullets.push({ x: this.player.x, y: this.player.y - 16, speed: 9.5 });
            this.bullets.push({ x: this.player.x + 8, y: this.player.y - 12, speed: 8.5 });
            this.sdk.sound.playTap();
        }
        
        // Spawn Enemies - Made slower and easier to defeat, but progressive with time
        if (!this.bossActive && Math.random() < 0.02 + (this.level * 0.005)) {
            // HP: dynamically scale with levels up to max HP of 3
            const hpVal = Math.min(3, 1 + Math.floor(Math.random() * (this.level * 0.5)));
            this.enemies.push({
                x: 20 + Math.random() * 320,
                y: -10,
                hp: hpVal,
                size: 14 + Math.random() * 8,
                speed: 1.0 + Math.random() * 1.2 + Math.min(1.5, this.level * 0.15) // progressive speed increase
            });
        }
        
        // Check Boss Trigger - Use clear and sequential score gates
        if (!this.bossActive && this.score >= this.scoreForNextBoss) {
            this.bossActive = true;
            this.boss = { x: 180, y: 60, hp: 12 + 6 * this.level, maxHp: 12 + 6 * this.level, size: 40, dir: 1 }; // Higher HP boss based on level
        }
        
        // Update bullets
        this.bullets.forEach((bullet, idx) => {
            bullet.y -= bullet.speed;
        });
        this.bullets = this.bullets.filter(b => b.y > 0);
        
        // Update enemies
        this.enemies.forEach((enemy, eIdx) => {
            enemy.y += enemy.speed;
            
            // Check collision with player ship
            const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (dist < enemy.size + this.player.size / 2) {
                this.hitPlayer();
                this.enemies.splice(eIdx, 1);
            }
        });
        
        // Bullet colliding enemies using off-loop filtered destruction
        const bulletsToRemove = new Set();
        const enemiesToRemove = new Set();
        
        this.bullets.forEach((bullet, bIdx) => {
            this.enemies.forEach((enemy, eIdx) => {
                const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                if (dist < enemy.size) {
                    enemy.hp--;
                    bulletsToRemove.add(bIdx);
                    if (enemy.hp <= 0) {
                        enemiesToRemove.add(eIdx);
                        this.score += 5;
                        this.sdk.updateHUD(this.score, this.lives);
                        this.sdk.sound.playHit();
                    }
                }
            });
            
            // Bullet hit boss
            if (this.bossActive && this.boss) {
                const dist = Math.hypot(bullet.x - this.boss.x, bullet.y - this.boss.y);
                if (dist < this.boss.size) {
                    this.boss.hp--;
                    bulletsToRemove.add(bIdx);
                    this.sdk.sound.playHit();
                    
                    if (this.boss.hp <= 0) {
                        this.score += 50 * this.level;
                        this.level++;
                        this.bossActive = false;
                        this.boss = null;
                        this.sdk.sound.playWin();
                        // Schedule next boss after user earns an additional score delta
                        this.scoreForNextBoss = this.score + 50 + (this.level * 20);
                    }
                }
            }
        });
        
        this.bullets = this.bullets.filter((b, idx) => !bulletsToRemove.has(idx));
        this.enemies = this.enemies.filter((e, idx) => !enemiesToRemove.has(idx)).filter(e => e.y < 500);
        
        // Boss update
        if (this.bossActive && this.boss) {
            this.boss.x += this.boss.dir * 2;
            if (this.boss.x > 320 || this.boss.x < 40) this.boss.dir *= -1;
            
            // Boss attacks
            if (Math.random() < 0.05) {
                this.enemies.push({
                    x: this.boss.x,
                    y: this.boss.y + 20,
                    hp: 1,
                    size: 10,
                    speed: 4
                });
            }
        }
    },
    hitPlayer() {
        this.lives--;
        this.sdk.updateHUD(this.score, this.lives);
        this.sdk.sound.playHit();
        if (this.lives <= 0) {
            this.isRunning = false;
            this.sdk.gameOver({ score: this.score });
        }
    },
    draw() {
        this.ctx.fillStyle = "#090d16";
        this.ctx.fillRect(0, 0, 360, 480);
        
        // Drawing beautiful galaxy background stars
        this.ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(i * 123 + Date.now() / 1000) + 1) * 180;
            const y = (Math.cos(i * 321 + Date.now() / 1000) + 1) * 240;
            this.ctx.fillRect(x, y, 1.5, 1.5);
        }
        
        // Drawing Player - Replaced CSS variables with solid hex values for Canvas Context compatibility
        this.ctx.fillStyle = "#06b6d4";
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y - 12);
        this.ctx.lineTo(this.player.x - 16, this.player.y + 12);
        this.ctx.lineTo(this.player.x + 16, this.player.y + 12);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Bullets drawing - Replaced CSS variables with solid hex values
        this.ctx.fillStyle = "#ec4899";
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
        });
        
        // Enemies drawing - Replaced CSS variables with solid hex values
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = "#ef4444";
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Boss Drawing HP bar
        if (this.bossActive && this.boss) {
            this.ctx.fillStyle = "#9333ea";
            this.ctx.beginPath();
            this.ctx.arc(this.boss.x, this.boss.y, this.boss.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw HP overlay bar
            this.ctx.fillStyle = "#22c55e";
            const percent = this.boss.hp / this.boss.maxHp;
            this.ctx.fillRect(20, 10, 320 * percent, 8);
        }
    },
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.loop();
        }
    },
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    },
    destroy() {
        this.pause();
        if (this._dragCleanup) this._dragCleanup();
    }
};

// ==========================================
// GAME 5: WHACK-A-MOLE
// ==========================================
window.GameCollection["whack"] = {
    name: "Whack-A-Mole",
    icon: "gavel",
    color: "#f59e0b", // Yellow-Gold
    hasScore: true,
    hasTimer: true,
    hasLives: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.duration = 45; // Start with 45 seconds of gameplay
        this.lives = 3;
        this.activeMoleIdx = -1;
        this.activeItemType = "mole";
        this.combo = 1;
        this.lastHeartSpawnTime = Date.now();
        
        // Setup floating transition styles
        const style = document.createElement("style");
        style.id = "whack-style-overlay";
        style.innerHTML = `
            @keyframes float-up {
                0% { transform: translateY(0) scale(0.8); opacity: 1; }
                100% { transform: translateY(-35px) scale(1.2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px;">
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; width:100%; max-width:320px; aspect-ratio:1;">
                    ${[0,1,2,3,4,5,6,7,8].map(idx => `
                        <div class="mole-hole" data-idx="${idx}" style="background-color:#451a03; border-radius:18px; border:3px solid #7c2d12; aspect-ratio:1; display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; overflow:hidden;">
                            <div class="mole hidden" style="width:75%; height:75%; background:#d97706; border-radius:50% 50% 0 0; position:absolute; bottom:0; transition:bottom 0.15s ease-out; display:flex; align-items:center; justify-content:center; font-size:24px; pointer-events:none;">🐹</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.setupEvents();
        this.startGame();
    },
    flashHoleText(hole, text, color) {
        const floatText = document.createElement("div");
        floatText.innerText = text;
        floatText.style.position = "absolute";
        floatText.style.color = color;
        floatText.style.fontWeight = "900";
        floatText.style.fontSize = "18px";
        floatText.style.zIndex = "10";
        floatText.style.top = "15px";
        floatText.style.animation = "float-up 0.6s ease-out forwards";
        hole.appendChild(floatText);
        setTimeout(() => floatText.remove(), 600);
    },
    setupEvents() {
        let lastHitTime = 0;
        this.container.querySelectorAll(".mole-hole").forEach(hole => {
            const handleHit = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                const now = Date.now();
                if (now - lastHitTime < 60) return; // Debounce
                
                const idx = parseInt(hole.getAttribute("data-idx"));
                if (idx === this.activeMoleIdx && this.activeMoleIdx !== -1) {
                    lastHitTime = now;
                    
                    if (this.activeItemType === "bomb") {
                        this.lives--;
                        this.combo = 1;
                        this.sdk.updateHUD(this.score, this.lives);
                        this.sdk.sound.playLose();
                        this.flashHoleText(hole, "-1 ❤️", "#ef4444");
                        if (this.lives <= 0) {
                            this.endGame();
                            return;
                        }
                    } else if (this.activeItemType === "easter_cookie") {
                        window.triggerEasterEgg(500, "GOLDEN BITE");
                        this.flashHoleText(hole, "+500 🍪", "#fbbf24");
                    } else if (this.activeItemType === "clock") {
                        this.duration += 30;
                        this.sdk.sound.playMerge();
                        this.flashHoleText(hole, "+30s ⏰", "#3b82f6");
                    } else if (this.activeItemType === "winged_heart") {
                        if (this.lives < 3) {
                            this.lives++;
                            this.sdk.updateHUD(this.score, this.lives);
                        }
                        this.sdk.sound.playWin();
                        this.flashHoleText(hole, "+1 ❤️ 🪽", "#ec4899");
                    } else {
                        // Regular mole
                        this.score += 10 * this.combo;
                        this.combo++;
                        this.sdk.updateHUD(this.score, this.lives);
                        this.sdk.sound.playHit();
                        this.flashHoleText(hole, `+${10 * (this.combo - 1)}`, "#f59e0b");
                    }
                    
                    this.hideMole();
                    this.spawnMole();
                } else {
                    if (now - lastHitTime > 400) {
                        this.combo = 1; // broken combo
                        this.sdk.sound.playTap();
                    }
                }
            };
            hole.onclick = handleHit;
            hole.ontouchstart = handleHit;
        });
    },
    startGame() {
        this.score = 0;
        this.duration = 45;
        this.lives = 3;
        this.combo = 1;
        this.lastHeartSpawnTime = Date.now();
        this.sdk.updateHUD(this.score, this.lives);
        
        // Manage custom timer countdown inside Whack-A-Mole directly
        const updateTimerDisplay = () => {
             const min = String(Math.floor(this.duration / 60)).padStart(2, "0");
             const sec = String(this.duration % 60).padStart(2, "0");
             const timerDisplay = document.getElementById("hud-val-timer");
             if (timerDisplay) {
                 timerDisplay.innerText = `${min}:${sec}`;
             }
        };
        
        updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.duration--;
            updateTimerDisplay();
            if (this.duration <= 0) {
                this.endGame();
            }
        }, 1000);
        
        this.spawnMole();
    },
    spawnMole() {
        this.hideMole();
        const rand = Math.floor(Math.random() * 9);
        this.activeMoleIdx = rand;
        
        // Determine spawned type
        let type = "mole";
        const elapsedSinceHeart = Date.now() - this.lastHeartSpawnTime;
        if (elapsedSinceHeart > 180000) {
            type = "winged_heart";
        } else if (elapsedSinceHeart > 120000 && Math.random() < 0.35) {
            type = "winged_heart";
        } else if (Math.random() < 0.02) {
            type = "easter_cookie";
        } else {
            const r = Math.random();
            if (this.duration < 20) {
                if (r < 0.25) type = "clock";
                else if (r < 0.40) type = "bomb";
                else type = "mole";
            } else if (this.duration > 65) {
                if (r < 0.03) type = "clock";
                else if (r < 0.25) type = "bomb";
                else type = "mole";
            } else {
                if (r < 0.12) type = "clock";
                else if (r < 0.32) type = "bomb";
                else type = "mole";
            }
        }
        
        this.activeItemType = type;
        if (type === "winged_heart") {
            this.lastHeartSpawnTime = Date.now();
        }
        
        // Set styling & graphics based on type
        let emoji = "🐹";
        let bgColor = "#d97706";
        if (type === "bomb") {
            emoji = "💣";
            bgColor = "#ef4444";
        } else if (type === "clock") {
            emoji = "⏰";
            bgColor = "#3b82f6";
        } else if (type === "winged_heart") {
            emoji = "🪽❤️";
            bgColor = "#ec4899";
        } else if (type === "easter_cookie") {
            emoji = "🍪";
            bgColor = "#fbbf24";
        }
        
        const moleHoles = this.container.querySelectorAll(".mole-hole");
        if (moleHoles[rand]) {
            const mole = moleHoles[rand].querySelector(".mole");
            if (mole) {
                mole.innerText = emoji;
                mole.style.background = bgColor;
                mole.classList.remove("hidden");
                mole.style.bottom = "0px";
            }
        }
        
        const delay = Math.max(450, 1000 - this.score * 3);
        this.moleTimer = setTimeout(() => {
            this.spawnMole();
        }, delay);
    },
    hideMole() {
        clearTimeout(this.moleTimer);
        const activeIdx = this.activeMoleIdx;
        if (activeIdx !== -1) {
            const moleHoles = this.container.querySelectorAll(".mole-hole");
            if (moleHoles[activeIdx]) {
                const mole = moleHoles[activeIdx].querySelector(".mole");
                if (mole) {
                    mole.classList.add("hidden");
                }
            }
        }
        this.activeMoleIdx = -1;
    },
    endGame() {
        this.destroy();
        this.sdk.gameOver({ score: this.score });
    },
    start() {},
    pause() {},
    destroy() {
        clearInterval(this.timerInterval);
        clearTimeout(this.moleTimer);
        const style = document.getElementById("whack-style-overlay");
        if (style) style.remove();
    }
};

// ==========================================
// GAME 6: TETRIS
// ==========================================
window.GameCollection["tetris"] = {
    name: "Tetris",
    icon: "widgets",
    color: "#e11d48", // Red theme
    hasScore: true,
    hasLevel: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <div class="tetris-wrapper" style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:340px; align-items:center; padding:8px;">
                <canvas id="tetris-canvas" class="arcade-canvas" width="200" height="400" style="width:200px; height:400px;"></canvas>
                <div class="tetris-controls" style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; width:100%;">
                    <button class="t-btn arcade-button" data-cmd="left" style="font-size:18px;">⬅️</button>
                    <button class="t-btn arcade-button" data-cmd="rot" style="font-size:18px;">🔄</button>
                    <button class="t-btn arcade-button" data-cmd="right" style="font-size:18px;">➡️</button>
                    <button class="t-btn arcade-button" data-cmd="drop" style="font-size:18px;">⬇️</button>
                    <button class="t-btn arcade-button" data-cmd="hold" style="font-size:18px;">🔀</button>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector("#tetris-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.grid = Array(20).fill(null).map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.holdPiece = null;
        this.heldThisTurn = false;
        this.isRunning = true;
        this.undoStack = [];
        
        // Shapes configs
        this.shapes = {
            I: [[1,1,1,1]],
            O: [[2,2],[2,2]],
            T: [[0,3,0],[3,3,3]],
            S: [[0,4,4],[4,4,0]],
            Z: [[5,5,0],[0,5,5]],
            J: [[6,0,0],[6,6,6]],
            L: [[0,0,7],[7,7,7]]
        };
        this.colors = ["", "#00f0f0", "#f0f000", "#a000f0", "#00f000", "#f00000", "#0000f0", "#f0a000"];
        
        this.spawnPiece();
        this.setupEvents();
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropInterval = 900; // ms
        
        this.ticker = (time) => {
            const dt = time - this.lastTime;
            this.lastTime = time;
            this.dropCounter += dt;
            if (this.dropCounter > this.dropInterval) {
                this.moveDown();
            }
            this.draw();
            if (this.isRunning) this.animationId = requestAnimationFrame(this.ticker);
        };
        this.animationId = requestAnimationFrame(this.ticker);
    },
    setupEvents() {
        this.container.querySelectorAll(".t-btn").forEach(btn => {
            btn.onclick = () => {
                const cmd = btn.getAttribute("data-cmd");
                if (cmd === "left") this.moveDir(-1);
                if (cmd === "right") this.moveDir(1);
                if (cmd === "rot") this.rotate();
                if (cmd === "drop") this.moveDown();
                if (cmd === "hold") this.handleHold();
                this.sdk.sound.playTap();
            };
        });
        
        this.keyHandler = (e) => {
            if (e.key === "ArrowLeft") this.moveDir(-1);
            if (e.key === "ArrowRight") this.moveDir(1);
            if (e.key === "ArrowUp") this.rotate();
            if (e.key === "ArrowDown") this.moveDown();
            if (e.key === "Shift") this.handleHold();
        };
        window.addEventListener("keydown", this.keyHandler);
    },
    spawnPiece() {
        const keys = Object.keys(this.shapes);
        const key = keys[Math.floor(Math.random() * keys.length)];
        this.currentPiece = {
            matrix: this.shapes[key],
            pos: { x: 3, y: 0 }
        };
        this.heldThisTurn = false;
        
        // Spawn collision equals Game Over
        if (this.checkCollision()) {
            this.isRunning = false;
            this.sdk.sound.playLose();
            this.sdk.gameOver({ score: this.score });
        }
    },
    saveStateToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            grid: this.grid.map(row => [...row]),
            score: this.score,
            level: this.level,
            linesCleared: this.linesCleared,
            holdPiece: this.holdPiece ? this.holdPiece.map(row => [...row]) : null,
            heldThisTurn: this.heldThisTurn
        }));
        if (this.undoStack.length > 25) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.grid = prevState.grid;
            this.score = prevState.score;
            this.level = prevState.level;
            this.linesCleared = prevState.linesCleared;
            this.holdPiece = prevState.holdPiece;
            this.heldThisTurn = prevState.heldThisTurn;
            
            // Re-spawn a random valid starting piece safely
            const keys = Object.keys(this.shapes);
            const key = keys[Math.floor(Math.random() * keys.length)];
            this.currentPiece = {
                matrix: this.shapes[key],
                pos: { x: 3, y: 0 }
            };
            
            // Re-sync UI score
            this.sdk.updateHUD(this.score, null, this.level);
            
            // Re-enable and restart if it was gameover-ed
            if (!this.isRunning) {
                this.isRunning = true;
                window.Arcade.hideModals();
                this.lastTime = performance.now();
                this.animationId = requestAnimationFrame(this.ticker);
            }
            
            this.sdk.sound.playTap();
            this.draw();
            return true;
        }
        return false;
    },
    moveDir(dir) {
        this.currentPiece.pos.x += dir;
        if (this.checkCollision()) {
            this.currentPiece.pos.x -= dir;
        }
    },
    moveDown() {
        this.currentPiece.pos.y++;
        this.dropCounter = 0;
        if (this.checkCollision()) {
            this.currentPiece.pos.y--;
            this.saveStateToHistory();
            this.mergeGrid();
            this.clearLines();
            this.spawnPiece();
        }
    },
    rotate() {
        const matrix = this.currentPiece.matrix;
        const nextMatrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
        const prevMatrix = this.currentPiece.matrix;
        this.currentPiece.matrix = nextMatrix;
        if (this.checkCollision()) {
            this.currentPiece.matrix = prevMatrix;
        }
    },
    handleHold() {
        if (this.heldThisTurn) return;
        const temp = this.currentPiece.matrix;
        if (this.holdPiece) {
            this.currentPiece.matrix = this.holdPiece;
            this.currentPiece.pos = { x: 3, y: 0 };
        } else {
            this.spawnPiece();
        }
        this.holdPiece = temp;
        this.heldThisTurn = true;
    },
    checkCollision() {
        const m = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        for (let r = 0; r < m.length; r++) {
            for (let c = 0; c < m[r].length; c++) {
                if (m[r][c] !== 0) {
                    const gx = pos.x + c;
                    const gy = pos.y + r;
                    if (gx < 0 || gx >= 10 || gy >= 20 || (gy >= 0 && this.grid[gy][gx] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    mergeGrid() {
        const m = this.currentPiece.matrix;
        const pos = this.currentPiece.pos;
        for (let r = 0; r < m.length; r++) {
            for (let c = 0; c < m[r].length; c++) {
                if (m[r][c] !== 0) {
                    const gx = pos.x + c;
                    const gy = pos.y + r;
                    if (gy >= 0) this.grid[gy][gx] = m[r][c];
                }
            }
        }
    },
    clearLines() {
        let linesCount = 0;
        for (let r = 20 - 1; r >= 0; r--) {
            if (this.grid[r].every(v => v !== 0)) {
                this.grid.splice(r, 1);
                this.grid.unshift(Array(10).fill(0));
                linesCount++;
                r++; // shift loop back
            }
        }
        if (linesCount > 0) {
            const scoreMultiplier = [0, 40, 100, 300, 1200];
            this.score += scoreMultiplier[linesCount] * this.level;
            this.linesCleared += linesCount;
            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.dropInterval = Math.max(100, 900 - this.level * 80);
            
            this.sdk.updateHUD(this.score, null, this.level);
            this.sdk.sound.playMerge();
        }
    },
    draw() {
        this.ctx.fillStyle = "#1e293b";
        this.ctx.fillRect(0, 0, 200, 400);
        
        // Draw grid board
        const cellS = 20;
        for (let r = 0; r < 20; r++) {
            for (let c = 0; c < 10; c++) {
                const blockVal = this.grid[r][c];
                if (blockVal > 0) {
                    this.ctx.fillStyle = this.colors[blockVal];
                    this.ctx.fillRect(c * cellS, r * cellS, cellS - 1, cellS - 1);
                }
            }
        }
        
        // Draw current active puzzle structure piece
        this.currentPiece.matrix.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val !== 0) {
                    this.ctx.fillStyle = this.colors[val];
                    this.ctx.fillRect((this.currentPiece.pos.x + c) * cellS, (this.currentPiece.pos.y + r) * cellS, cellS - 1, cellS - 1);
                }
            });
        });
    },
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animationId = requestAnimationFrame(this.ticker);
        }
    },
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    },
    destroy() {
        this.pause();
        window.removeEventListener("keydown", this.keyHandler);
    }
};

// ==========================================
// GAME 7: MERGE FRUITS
// ==========================================
window.GameCollection["mergefruits"] = {
    name: "Fruit Merge",
    icon: "hive",
    color: "#22c55e",
    hasScore: true,
    hasTimer: false,
    saveGameState() {
        if (this.isGameOver) return;
        try {
            const state = {
                fruits: this.fruits,
                score: this.score,
                activeFruit: this.activeFruit
            };
            localStorage.setItem("game_state_mergefruits", JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save mergefruits state", e);
        }
    },
    clearGameState() {
        localStorage.removeItem("game_state_mergefruits");
    },
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="merge-canvas" class="arcade-canvas" width="320" height="480"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#merge-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.score = 0;
        this.fruits = [];
        this.spawnY = 50;
        this.dropDelay = 1200; // ms
        this.lastDropTime = 0;
        this.activeFruit = null;
        this.isRunning = true;
        this.isGameOver = false;
        
        // Fruits schema definitions: size growth
        this.fruitTypes = [
            { name: "Cherry", r: 12, color: "#ef4444", emoji: "🍒" },
            { name: "Grape", r: 18, color: "#a855f7", emoji: "🍇" },
            { name: "Strawberry", r: 24, color: "#ec4899", emoji: "🍓" },
            { name: "Lemon", r: 32, color: "#eab308", emoji: "🍋" },
            { name: "Orange", r: 40, color: "#f97316", emoji: "🍊" },
            { name: "GreenApple", r: 48, color: "#22c55e", emoji: "🍏" },
            { name: "Peach", r: 58, color: "#fda4af", emoji: "🍑" },
            { name: "Melon", r: 70, color: "#4ade80", emoji: "🍈" },
            { name: "Watermelon", r: 84, color: "#15803d", emoji: "🍉" }
        ];
        
        this.setupEvents();
        
        const saved = localStorage.getItem("game_state_mergefruits");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.fruits = state.fruits || [];
                this.score = state.score || 0;
                this.activeFruit = state.activeFruit;
                this.sdk.updateHUD(this.score);
                if (!this.activeFruit) {
                    this.spawnFruit(130);
                }
            } catch (e) {
                this.score = 0;
                this.fruits = [];
                this.spawnFruit(130);
            }
        } else {
            this.spawnFruit(130);
        }
        
        this.loop();
    },
    setupEvents() {
        const actionHandler = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (clientX - rect.left) * (320 / rect.width);
            if (this.activeFruit) {
                this.activeFruit.x = Math.max(this.activeFruit.r, Math.min(320 - this.activeFruit.r, x));
            }
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            actionHandler(e.touches[0].clientX);
        };
        this.canvas.onmousemove = (e) => {
            actionHandler(e.clientX);
        };
        
        this.canvas.onclick = () => {
            if (this.activeFruit && Date.now() - this.lastDropTime > 600) {
                this.activeFruit.physics = true;
                this.fruits.push(this.activeFruit);
                this.activeFruit = null;
                this.lastDropTime = Date.now();
                this.sdk.sound.playTap();
                
                setTimeout(() => {
                    if (this.isRunning) {
                        this.spawnFruit(160);
                        this.saveGameState();
                    }
                }, 500);
            }
        };
    },
    spawnFruit(x) {
        const randType = Math.floor(Math.random() * 3); // Spawns top 3 smallest
        this.activeFruit = {
            x: x,
            y: this.spawnY,
            typeIdx: randType,
            r: this.fruitTypes[randType].r,
            physics: false,
            vy: 0,
            vx: 0
        };
    },
    loop() {
        if (!this.isRunning) return;
        this.updatePhysics();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    updatePhysics() {
        this.fruits.forEach((f, idx) => {
            // Apply standard gravity drop
            f.vy += 0.35;
            f.y += f.vy;
            f.x += f.vx;
            
            // Wall bounce constraints
            if (f.x < f.r) {
                f.x = f.r;
                f.vx *= -0.2;
            }
            if (f.x > 320 - f.r) {
                f.x = 320 - f.r;
                f.vx *= -0.2;
            }
            
            // Floor collision
            if (f.y > 480 - f.r) {
                f.y = 480 - f.r;
                f.vy = 0;
                f.vx *= 0.85; // drag floor friction
            }
            
            // Ball overlapping collision checks
            for (let j = idx + 1; j < this.fruits.length; j++) {
                const f2 = this.fruits[j];
                const dx = f2.x - f.x;
                const dy = f2.y - f.y;
                const dist = Math.hypot(dx, dy);
                const minDist = f.r + f2.r;
                
                if (dist < minDist) {
                    // Check if same type -> Merge!
                    if (f.typeIdx === f2.typeIdx) {
                        this.mergeFruits(idx, j);
                        return;
                    }
                    
                    // Standard vector impact overlap solving
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    
                    // Reposition
                    f.x -= nx * overlap * 0.5;
                    f.y -= ny * overlap * 0.5;
                    f2.x += nx * overlap * 0.5;
                    f2.y += ny * overlap * 0.5;
                    
                    // Speed deflection
                    f.vx = -nx * 1.5;
                    f.vy = -ny * 1.5;
                    f2.vx = nx * 1.5;
                    f2.vy = ny * 1.5;
                }
            }
        });
        
        // Check standard overflow boundary (top threshold)
        const overflow = this.fruits.some(f => f.y < 110 && f.vy <= 0);
        if (overflow && Date.now() - this.lastDropTime > 3000) {
            this.isRunning = false;
            this.isGameOver = true;
            this.clearGameState();
            this.sdk.sound.playLose();
            this.sdk.gameOver({ score: this.score });
        }
    },
    mergeFruits(i, j) {
        const f1 = this.fruits[i];
        const f2 = this.fruits[j];
        
        // Midpoint of target merge
        const mx = (f1.x + f2.x) / 2;
        const my = (f1.y + f2.y) / 2;
        const nextIdx = f1.typeIdx + 1;
        
        // Clear items
        this.fruits.splice(Math.max(i, j), 1);
        this.fruits.splice(Math.min(i, j), 1);
        
        this.score += (nextIdx) * 10;
        this.sdk.updateHUD(this.score);
        this.sdk.sound.playMerge();
        
        // If not watermelon maxed size, spawn larger fruit
        if (nextIdx < this.fruitTypes.length) {
            const merged = {
                x: mx,
                y: my,
                typeIdx: nextIdx,
                r: this.fruitTypes[nextIdx].r,
                physics: true,
                vx: 0,
                vy: 0
            };
            this.fruits.push(merged);
        }
        this.saveGameState();
    },
    draw() {
        this.ctx.fillStyle = "#111827";
        this.ctx.fillRect(0, 0, 320, 480);
        
        // Red warning border line
        this.ctx.strokeStyle = "#b91c1c";
        this.ctx.lineWidth = 1;
        this.ctx.dashed = true;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 110);
        this.ctx.lineTo(320, 110);
        this.ctx.stroke();
        
        // Drawing fruits list
        this.fruits.forEach(f => {
            const data = this.fruitTypes[f.typeIdx];
            this.ctx.fillStyle = data.color;
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
            this.ctx.stroke();
            
            // Draw nice emoji label inside circle
            this.ctx.font = `${f.r + 2}px Arial`;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(data.emoji, f.x, f.y + 2);
        });
        
        // Drawing Active Droppable Fruit preview
        if (this.activeFruit) {
            const data = this.fruitTypes[this.activeFruit.typeIdx];
            this.ctx.fillStyle = data.color;
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.arc(this.activeFruit.x, this.activeFruit.y, this.activeFruit.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
            
            // Guide line
            this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.activeFruit.x, this.activeFruit.y);
            this.ctx.lineTo(this.activeFruit.x, 480);
            this.ctx.stroke();
        }
    },
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.loop();
        }
    },
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        this.saveGameState();
    },
    destroy() {
        this.pause();
    }
};
