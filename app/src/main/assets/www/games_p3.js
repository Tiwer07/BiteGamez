/**
 * BiteGamez Arcade Game Bundle - Part 3 (Games 15 to 20)
 */

window.GameCollection = window.GameCollection || {};

// ==========================================
// GAME 15: BREAKOUT
// ==========================================
window.GameCollection["breakout"] = {
    name: "Classic Breakout",
    icon: "layers",
    color: "#6366f1", // Indigo
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="breakout-canvas" class="arcade-canvas" width="340" height="380"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#breakout-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.paddle = { x: 130, y: 350, w: 75, h: 10, speed: 6 };
        this.ball = { x: 170, y: 220, r: 6, vx: 2, vy: -3 };
        this.bricks = [];
        this.score = 0;
        this.isRunning = true;
        this.undoStack = [];
        this.fallingCookies = [];
        
        const cols = 6;
        const rows = 4;
        const bW = 46;
        const bH = 16;
        const gap = 6;
        
        // Spawn bricks list
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                this.bricks.push({
                    x: 18 + c * (bW + gap),
                    y: 40 + r * (bH + gap),
                    w: bW, h: bH,
                    val: 1,
                    color: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"][r],
                    hasEasterCookie: (idx === 14)
                });
            }
        }
        
        this.saveStateToHistory();
        this.setupEvents();
        this.loop();
    },
    saveStateToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            paddle: {...this.paddle},
            ball: {...this.ball},
            bricks: this.bricks.map(br => ({...br})),
            score: this.score
        }));
        if (this.undoStack.length > 25) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.paddle = prevState.paddle;
            this.ball = prevState.ball;
            this.bricks = prevState.bricks;
            this.score = prevState.score;
            
            this.sdk.updateHUD(this.score);
            
            // Re-enable and restart loop if gameover-ed
            if (!this.isRunning) {
                this.isRunning = true;
                window.Arcade.hideModals();
                this.loop();
            }
            
            this.sdk.sound.playTap();
            this.draw();
            return true;
        }
        return false;
    },
    setupEvents() {
        const moveHandler = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            const px = (clientX - rect.left) * (340 / rect.width);
            this.paddle.x = Math.max(5, Math.min(340 - this.paddle.w - 5, px - this.paddle.w/2));
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            moveHandler(e.touches[0].clientX);
        };
        this.canvas.onmousemove = (e) => {
            moveHandler(e.clientX);
        };
    },
    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    update() {
        // Ball fly physics
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Horizontal wall bounds bounce
        if (this.ball.x < this.ball.r || this.ball.x > 340 - this.ball.r) {
            this.ball.vx *= -1;
            this.sdk.sound.playTap();
        }
        // Top ceiling bounce
        if (this.ball.y < this.ball.r) {
            this.ball.vy *= -1;
            this.sdk.sound.playTap();
        }
        
        // Bottom drain loss gameover
        if (this.ball.y > 380 - this.ball.r) {
            this.isRunning = false;
            this.sdk.sound.playHit();
            this.sdk.sound.playLose();
            this.sdk.gameOver({ score: this.score });
            return;
        }
        
        // Paddle deflections
        if (this.ball.y + this.ball.r > this.paddle.y && this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.w) {
            this.ball.vy *= -1;
            
            // Adjust deflection tilt based on hit coordinate offset
            const offset = (this.ball.x - (this.paddle.x + this.paddle.w/2)) / (this.paddle.w/2);
            this.ball.vx = offset * 3.5;
            this.sdk.sound.playTap();
        }
        
        // Bricks impact breaking collision checks
        this.bricks.forEach((br, idx) => {
            if (br.val <= 0) return;
            
            if (this.ball.x + this.ball.r > br.x && this.ball.x - this.ball.r < br.x + br.w) {
                if (this.ball.y + this.ball.r > br.y && this.ball.y - this.ball.r < br.y + br.h) {
                    this.saveStateToHistory();
                    br.val = 0; // shatter
                    this.ball.vy *= -1;
                    
                    this.score += 15;
                    this.sdk.updateHUD(this.score);
                    this.sdk.sound.playMerge();
                    
                    if (br.hasEasterCookie) {
                        this.fallingCookies.push({
                            x: br.x + br.w/2,
                            y: br.y + br.h,
                            r: 8,
                            vy: 2
                        });
                    }
                    
                    this.checkWinState();
                }
            }
        });

        // Falling cookies physics
        if (this.fallingCookies) {
            for (let i = this.fallingCookies.length - 1; i >= 0; i--) {
                const cookie = this.fallingCookies[i];
                cookie.y += cookie.vy;
                
                // check collision with paddle
                if (cookie.y + cookie.r > this.paddle.y && cookie.y - cookie.r < this.paddle.y + this.paddle.h &&
                    cookie.x + cookie.r > this.paddle.x && cookie.x - cookie.r < this.paddle.x + this.paddle.w) {
                    
                    this.fallingCookies.splice(i, 1);
                    window.triggerEasterEgg(500, "BREAKOUT COOKIE BLAST");
                } else if (cookie.y > 380) {
                    this.fallingCookies.splice(i, 1);
                }
            }
        }
    },
    checkWinState() {
        if (this.bricks.every(br => br.val <= 0)) {
            this.isRunning = false;
            this.sdk.sound.playWin();
            this.sdk.gameOver({ score: this.score, isBest: true });
        }
    },
    draw() {
        this.ctx.fillStyle = "#0f172a";
        this.ctx.fillRect(0,0,340,380);
        
        // Draw Paddle - Replaced CSS variables with solid hex colors for Canvas Context compatibility
        this.ctx.fillStyle = "#22c55e";
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
        
        // Draw Ball - Replaced CSS variables with solid hex colors
        this.ctx.fillStyle = "#ec4899";
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw bricks
        this.bricks.forEach(br => {
            if (br.val > 0) {
                this.ctx.fillStyle = br.color;
                this.ctx.fillRect(br.x, br.y, br.w, br.h);
            }
        });

        // Draw falling cookies
        if (this.fallingCookies) {
            this.fallingCookies.forEach(cookie => {
                this.ctx.font = "16px sans-serif";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText("🍪", cookie.x, cookie.y);
            });
        }
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
// GAME 16: TIC-TAC-TOE
// ==========================================
window.GameCollection["tictactoe"] = {
    name: "Tic Tac Toe",
    icon: "close",
    color: "#ec4899",
    hasScore: false,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.boardScale = 3; // default grids length
        this.playerTurn = "X";
        this.undoStack = [];
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px;">
                <div class="grid-select-row" style="display:flex; gap:6px; margin-bottom:4px; justify-content:center; width:100%; max-width:320px;">
                    <button class="scale-btn active" data-scale="3" style="flex:1; padding:6px; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.05); color:var(--text-primary); font-size:12px; font-weight:700;">3x3</button>
                    <button class="scale-btn" data-scale="4" style="flex:1; padding:6px; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.05); color:var(--text-primary); font-size:12px; font-weight:700;">4x4</button>
                    <button class="scale-btn" data-scale="5" style="flex:1; padding:6px; border-radius:8px; border:1px solid var(--border-color); background:rgba(255,255,255,0.05); color:var(--text-primary); font-size:12px; font-weight:700;">5x5</button>
                </div>
                <div id="toe-grid" class="tic-tac-grid" style="grid-template-columns: repeat(${this.boardScale}, 1fr); width:100%; max-width:300px; aspect-ratio:1;"></div>
                <p id="txt-toe-turn" style="font-size:15px; font-weight:800; color:var(--accent-pink);">Player X's Turn</p>
            </div>
        `;
        
        this.setupEvents();
        this.restartGame();
    },
    saveStateToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            board: [...this.board],
            playerTurn: this.playerTurn
        }));
        if (this.undoStack.length > 25) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.board = prevState.board;
            this.playerTurn = prevState.playerTurn;
            
            // Re-render
            window.Arcade.hideModals();
            this.sdk.sound.playTap();
            this.renderBoardGrid();
            this.container.querySelector("#txt-toe-turn").innerText = `Player ${this.playerTurn}'s Turn`;
            return true;
        }
        return false;
    },
    setupEvents() {
        this.container.querySelectorAll(".scale-btn").forEach(btn => {
            btn.onclick = () => {
                this.container.querySelectorAll(".scale-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.boardScale = parseInt(btn.getAttribute("data-scale"));
                this.sdk.sound.playSelect();
                
                const gridDiv = this.container.querySelector("#toe-grid");
                gridDiv.style.gridTemplateColumns = `repeat(${this.boardScale}, 1fr)`;
                
                this.restartGame();
            };
        });
        
        const turnText = this.container.querySelector("#txt-toe-turn");
        if (turnText) {
            turnText.style.cursor = "pointer";
            this.eggClicks = 0;
            turnText.onclick = () => {
                this.eggClicks = (this.eggClicks || 0) + 1;
                if (this.eggClicks >= 5) {
                    this.eggClicks = 0;
                    window.triggerEasterEgg(500, "TIC-TAC-COOKIE");
                    this.board = this.board.map(v => v === "" ? "🍪" : v);
                    this.renderBoardGrid();
                } else {
                    this.sdk.sound.playTap();
                }
            };
        }
    },
    restartGame() {
        this.board = Array(this.boardScale * this.boardScale).fill("");
        this.playerTurn = "X";
        this.undoStack = [];
        this.renderBoardGrid();
    },
    renderBoardGrid() {
        const gridDiv = this.container.querySelector("#toe-grid");
        gridDiv.innerHTML = "";
        
        this.board.forEach((val, idx) => {
            const cell = document.createElement("div");
            cell.className = "tic-cell";
            cell.innerText = val;
            cell.style.color = val === "X" ? "var(--accent)" : "var(--accent-pink)";
            
            cell.onclick = () => {
                if (this.board[idx] === "" && this.boardScale > 0) {
                    this.saveStateToHistory();
                    this.board[idx] = this.playerTurn;
                    this.sdk.sound.playTap();
                    this.renderBoardGrid();
                    
                    const winner = this.checkWinState();
                    if (winner) {
                        this.sdk.sound.playWin();
                        this.sdk.gameOver({ score: 100, isBest: true, title: `PLAYER ${winner} WINS!` });
                    } else if (this.board.every(v => v !== "")) {
                        this.sdk.sound.playLose();
                        this.sdk.gameOver({ score: 0, title: "IT'S A DRAW!" });
                    } else {
                        this.playerTurn = this.playerTurn === "X" ? "O" : "X";
                        this.container.querySelector("#txt-toe-turn").innerText = `Player ${this.playerTurn}'s Turn`;
                    }
                }
            };
            gridDiv.appendChild(cell);
        });
    },
    checkWinState() {
        const scale = this.boardScale;
        let targetLength = 3; // default for 3x3
        if (scale === 4) targetLength = 3;
        if (scale === 5) targetLength = 4;

        // Try horizontals
        for (let r = 0; r < scale; r++) {
            for (let c = 0; c <= scale - targetLength; c++) {
                const val = this.board[r * scale + c];
                if (val !== "") {
                    let win = true;
                    for (let i = 1; i < targetLength; i++) {
                        if (this.board[r * scale + c + i] !== val) {
                            win = false;
                            break;
                            }
                        }
                    if (win) return val;
                }
            }
        }

        // Try verticals
        for (let r = 0; r <= scale - targetLength; r++) {
            for (let c = 0; c < scale; c++) {
                const val = this.board[r * scale + c];
                if (val !== "") {
                    let win = true;
                    for (let i = 1; i < targetLength; i++) {
                        if (this.board[(r + i) * scale + c] !== val) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return val;
                }
            }
        }

        // Try diagonals down-right
        for (let r = 0; r <= scale - targetLength; r++) {
            for (let c = 0; c <= scale - targetLength; c++) {
                const val = this.board[r * scale + c];
                if (val !== "") {
                    let win = true;
                    for (let i = 1; i < targetLength; i++) {
                        if (this.board[(r + i) * scale + (c + i)] !== val) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return val;
                }
            }
        }

        // Try diagonals down-left
        for (let r = 0; r <= scale - targetLength; r++) {
            for (let c = targetLength - 1; c < scale; c++) {
                const val = this.board[r * scale + c];
                if (val !== "") {
                    let win = true;
                    for (let i = 1; i < targetLength; i++) {
                        if (this.board[(r + i) * scale + (c - i)] !== val) {
                            win = false;
                            break;
                        }
                    }
                    if (win) return val;
                }
            }
        }

        return null;
    },
    start() {},
    pause() {},
    destroy() {}
};

// ==========================================
// GAME 17: WATER SORT PUZZLE
// ==========================================
window.GameCollection["watersort"] = {
    name: "Water Sort",
    icon: "opacity",
    color: "#06b6d4",
    hasScore: false,
    hasTimer: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.selectedTube = null;
        this.moves = 0;
        this.undoStack = [];
        this.currentLevel = 1;
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:320px; font-size:12px; font-weight:700;">
                    <div id="sort-moves" style="display:flex; align-items:center; gap:6px;">
                        <span>Level:</span>
                        <select id="sel-sort-level" style="background:#1e293b; color:white; border:1px solid #475569; border-radius:6px; padding:2px 4px; cursor:pointer; font-size:11px;">
                            <option value="1">Easy (Level 1)</option>
                            <option value="2">Medium (Level 2)</option>
                            <option value="3">Hard (Level 3)</option>
                        </select>
                        <span style="margin-left:6px;">Moves: <span id="val-moves">0</span></span>
                    </div>
                    <button id="btn-sort-restart" class="arcade-button" style="width:auto; padding:4px 10px; border-radius:10px;">🔄 Restart</button>
                </div>
                <div id="sort-tubes-container" style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center; min-height:160px; padding:10px; width:100%; max-width:320px;"></div>
                <p style="font-size:11px; text-align:center; color:var(--text-secondary);">Sort fluids so each vial contains only one unified color stack.</p>
            </div>
        `;
        
        this.colors = ["#ef4444", "#3b82f6", "#10b981", "#eab308", "#a855f7"]; // Red, Blue, Green, Yellow, Purple stacks
        this.generatePuzzleBoard();
        this.setupEvents();
        this.sdk.startTimer();
    },
    saveStateToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            tubes: this.tubes.map(stack => [...stack]),
            moves: this.moves,
            selectedTube: this.selectedTube
        }));
        if (this.undoStack.length > 30) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.tubes = prevState.tubes;
            this.moves = prevState.moves;
            this.selectedTube = prevState.selectedTube;
            
            window.Arcade.hideModals();
            this.sdk.sound.playTap();
            this.renderTubes();
            this.container.querySelector("#val-moves").innerText = this.moves;
            return true;
        }
        return false;
    },
    generatePuzzleBoard() {
        const lvl = this.currentLevel || 1;
        if (lvl === 1) {
            // Level 1: 4 active color tubes + 3 empty helper beakers (7 tubes total) -> extremely easy & playable!
            this.tubes = [
                ["#ef4444", "#3b82f6", "#10b981", "#ef4444"],
                ["#3b82f6", "#10b981", "#eab308", "#10b981"],
                ["#ef4444", "#3b82f6", "#eab308", "#ef4444"],
                ["#3b82f6", "#eab308", "#eab308", "#10b981"],
                [], [], [] // 3 empty assist beakers
            ];
        } else if (lvl === 2) {
            // Level 2: 4 active color tubes + 2 empty helper beakers (6 tubes total) -> moderately easy
            this.tubes = [
                ["#ef4444", "#10b981", "#ef4444", "#3b82f6"],
                ["#3b82f6", "#eab308", "#10b981", "#eab308"],
                ["#ef4444", "#3b82f6", "#eab308", "#10b981"],
                ["#10b981", "#ef4444", "#3b82f6", "#eab308"],
                [], [] // 2 empty assist beakers
            ];
        } else {
            // Level 3: 5 active color tubes (#a855f7 purple added) + 2 empty helper beakers (7 tubes total) -> nice challenge!
            this.tubes = [
                ["#ef4444", "#3b82f6", "#10b981", "#a855f7"],
                ["#3b82f6", "#10b981", "#eab308", "#ef4444"],
                ["#ef4444", "#a855f7", "#eab308", "#10b981"],
                ["#3b82f6", "#eab308", "#a855f7", "#3b82f6"],
                ["#a855f7", "#ef4444", "#10b981", "#eab308"],
                [], [] // 2 empty assist beakers
            ];
        }
        
        this.moves = 0;
        this.selectedTube = null;
        this.renderTubes();
        if (this.container.querySelector("#val-moves")) {
            this.container.querySelector("#val-moves").innerText = "0";
        }
    },
    setupEvents() {
        this.container.querySelector("#btn-sort-restart").onclick = () => {
            this.generatePuzzleBoard();
            this.sdk.sound.playSelect();
        };
        const lvlSelect = this.container.querySelector("#sel-sort-level");
        if (lvlSelect) {
            lvlSelect.value = this.currentLevel || 1;
            lvlSelect.onchange = (e) => {
                this.currentLevel = parseInt(e.target.value);
                this.generatePuzzleBoard();
                this.sdk.sound.playSelect();
            };
        }
        
        const movesLabel = this.container.querySelector("#sort-moves");
        if (movesLabel) {
            this.eggClicks = 0;
            movesLabel.onclick = (e) => {
                if (e.target.tagName !== "SELECT") {
                    this.eggClicks++;
                    if (this.eggClicks >= 5) {
                        this.eggClicks = 0;
                        window.triggerEasterEgg(500, "VIBRANT WATER SPLASH COOKIE");
                    } else {
                        this.sdk.sound.playTap();
                    }
                }
            };
        }
    },
    renderTubes() {
        const tubesBox = this.container.querySelector("#sort-tubes-container");
        tubesBox.innerHTML = "";
        
        this.tubes.forEach((stack, idx) => {
            const tube = document.createElement("div");
            tube.style.width = "30px";
            tube.style.height = "120px";
            tube.style.border = "3px solid var(--border-color)";
            tube.style.borderRadius = "0 0 16px 16px";
            tube.style.position = "relative";
            tube.style.display = "flex";
            tube.style.flexDirection = "column";
            tube.style.justifyContent = "end";
            tube.style.overflow = "hidden";
            tube.style.cursor = "pointer";
            tube.style.backgroundColor = "rgba(0,0,0,0.15)";
            
            if (this.selectedTube === idx) {
                tube.style.borderColor = "var(--accent)";
                tube.style.boxShadow = "var(--shadow-glow)";
            }
            
            // Draw multi liquids stack segments
            stack.forEach((color, cIdx) => {
                const water = document.createElement("div");
                water.style.height = "25%";
                water.style.backgroundColor = color;
                water.style.borderTop = "1px solid rgba(255,255,255,0.15)";
                tube.appendChild(water);
            });
            
            tube.onclick = () => {
                this.handleTubePourClick(idx);
            };
            tubesBox.appendChild(tube);
        });
    },
    handleTubePourClick(idx) {
        if (this.selectedTube === null) {
            if (this.tubes[idx].length > 0) {
                this.selectedTube = idx;
                this.sdk.sound.playTap();
                this.renderTubes();
            }
        } else {
            const srcIdx = this.selectedTube;
            
            // Pour sorting logic checks
            if (srcIdx !== idx) {
                const src = this.tubes[srcIdx];
                const dest = this.tubes[idx];
                
                if (dest.length < 4) {
                    const fluidColor = src[0]; // grab topmost fluid color index
                    if (dest.length === 0 || dest[0] === fluidColor) {
                        // Count contiguous layers of the same color at the source top
                        let pourCount = 0;
                        while (pourCount < src.length && src[pourCount] === fluidColor) {
                            pourCount++;
                        }
                        const availableSpace = 4 - dest.length;
                        const actualMoveCount = Math.min(pourCount, availableSpace);
                        
                        if (actualMoveCount > 0) {
                            this.saveStateToHistory();
                            for (let i = 0; i < actualMoveCount; i++) {
                                dest.unshift(src.shift());
                            }
                            this.moves++;
                            this.container.querySelector("#val-moves").innerText = this.moves;
                            this.sdk.sound.playMerge();
                        }
                    }
                }
            }
            this.selectedTube = null;
            this.renderTubes();
            this.checkWinState();
        }
    },
    checkWinState() {
        const isSolved = this.tubes.every(stack => {
            if (stack.length === 0) return true;
            if (stack.length === 4) {
                const testColor = stack[0];
                return stack.every(col => col === testColor);
            }
            return false;
        });
        
        if (isSolved) {
            this.sdk.sound.playWin();
            this.sdk.gameOver({ score: 100, isBest: true });
        }
    },
    start() {},
    pause() {},
    destroy() {}
};

// ==========================================
// GAME 18: MEMORY MATCH CARDS
// ==========================================
window.GameCollection["memory"] = {
    name: "Memory Match",
    icon: "photo_library",
    color: "#1d4ed8",
    hasScore: false,
    hasTimer: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.matches = 0;
        this.flippedCardsIdxs = [];
        this.freezeClicks = false;
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px;">
                <div id="memory-grid-container" class="memory-grid" style="grid-template-columns: repeat(4, 1fr); width:100%; max-width:320px; aspect-ratio:1;"></div>
            </div>
        `;
        
        this.gridDiv = this.container.querySelector("#memory-grid-container");
        this.buildDeckBoard();
        this.sdk.startTimer();
    },
    buildDeckBoard() {
        let pool = ["🎈", "🍕", "🏀", "🚀", "🎸", "🐱", "🍟", "🎨"];
        // 35% chance to include a cookie match set
        if (Math.random() < 0.35) {
            pool[Math.floor(Math.random() * pool.length)] = "🍪";
        }
        const pairs = [...pool, ...pool]; // 16 cards list
        
        // Shuffle pairs list
        pairs.sort(() => Math.random() - 0.5);
        this.cards = pairs.map(symbol => ({ symbol, flipped: false, matched: false }));
        this.renderMemoryBoard();
    },
    renderMemoryBoard() {
        this.gridDiv.innerHTML = "";
        this.cards.forEach((card, idx) => {
            const cardEl = document.createElement("div");
            cardEl.className = `memory-card ${card.flipped || card.matched ? 'flipped' : ''}`;
            cardEl.style.aspectRatio = "1";
            cardEl.style.fontSize = "26px";
            cardEl.style.backgroundColor = "var(--bg-card)";
            cardEl.style.borderRadius = "14px";
            cardEl.style.border = "2px solid var(--border-color)";
            cardEl.style.display = "flex";
            cardEl.style.alignItems = "center";
            cardEl.style.justifyContent = "center";
            cardEl.style.cursor = "pointer";
            
            if (card.flipped || card.matched) {
                cardEl.innerText = card.symbol;
                cardEl.style.borderColor = card.matched ? "var(--accent)" : "var(--accent-pink)";
            } else {
                cardEl.innerText = "❓";
            }
            
            cardEl.onclick = () => {
                this.handleCardClick(idx);
            };
            this.gridDiv.appendChild(cardEl);
        });
    },
    handleCardClick(idx) {
        if (this.freezeClicks || this.cards[idx].flipped || this.cards[idx].matched) return;
        
        this.cards[idx].flipped = true;
        this.flippedCardsIdxs.push(idx);
        this.sdk.sound.playTap();
        this.renderMemoryBoard();
        
        if (this.flippedCardsIdxs.length === 2) {
            this.freezeClicks = true;
            this.checkMatchSequence();
        }
    },
    checkMatchSequence() {
        const [i1, i2] = this.flippedCardsIdxs;
        if (this.cards[i1].symbol === this.cards[i2].symbol) {
            this.cards[i1].matched = true;
            this.cards[i2].matched = true;
            this.matches++;
            this.sdk.sound.playMerge();
            
            if (this.cards[i1].symbol === "🍪") {
                window.triggerEasterEgg(500, "COOKIE MEMORY MASTERY");
            }
            
            this.flippedCardsIdxs = [];
            this.freezeClicks = false;
            this.renderMemoryBoard();
            this.checkWinState();
        } else {
            setTimeout(() => {
                this.cards[i1].flipped = false;
                this.cards[i2].flipped = false;
                this.flippedCardsIdxs = [];
                this.freezeClicks = false;
                this.renderMemoryBoard();
            }, 1000);
        }
    },
    checkWinState() {
        if (this.matches === 8) {
            this.sdk.sound.playWin();
            this.sdk.gameOver({ score: 100, isBest: true });
        }
    },
    start() {},
    pause() {},
    destroy() {}
};

// ==========================================
// GAME 19: CHICKEN TOWER JUMP
// ==========================================
window.GameCollection["chickentower"] = {
    name: "Stack",
    icon: "layers",
    color: "#22c55e",
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="tower-canvas" class="arcade-canvas" width="340" height="380"></canvas>
            <div style="display:flex; gap:16px; width:100%; max-width:320px; justify-content:center; padding:8px;">
                <button id="btn-tower-left" class="arcade-button" style="flex:1; padding:10px;"><span class="material-symbols-rounded">arrow_back</span> LEFT</button>
                <button id="btn-tower-right" class="arcade-button" style="flex:1; padding:10px;">RIGHT <span class="material-symbols-rounded">arrow_forward</span></button>
            </div>
        `;
        
        this.canvas = this.container.querySelector("#tower-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.chicken = { x: 160, y: 320, w: 20, h: 20, vy: 0, vx: 0, maxSpeed: 4.5 };
        this.platforms = [];
        this.score = 0;
        this.cameraY = 0;
        this.isRunning = true;
        
        // Spawn base steps platforms
        this.platforms.push({ x: 140, y: 350, w: 60, h: 8 });
        for (let i = 0; i < 8; i++) {
            this.platforms.push({
                x: 20 + Math.random() * 240,
                y: 300 - i * 50,
                w: 50, h: 8
            });
        }
        
        this.setupEvents();
        this.loop();
    },
    setupEvents() {
        this.container.querySelector("#btn-tower-left").onclick = () => { this.chicken.vx = -this.chicken.maxSpeed; this.sdk.sound.playTap(); };
        this.container.querySelector("#btn-tower-right").onclick = () => { this.chicken.vx = this.chicken.maxSpeed; this.sdk.sound.playTap(); };
        
        this.keyHandler = (e) => {
            if (e.key === "ArrowLeft") this.chicken.vx = -this.chicken.maxSpeed;
            if (e.key === "ArrowRight") this.chicken.vx = this.chicken.maxSpeed;
        };
        window.addEventListener("keydown", this.keyHandler);
    },
    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    update() {
        // Gravity climb velocity
        this.chicken.vy += 0.22;
        this.chicken.y += this.chicken.vy;
        this.chicken.x += this.chicken.vx;
        this.chicken.vx *= 0.85; // slide decay
        
        // Wrap screen
        if (this.chicken.x < -10) this.chicken.x = 340;
        if (this.chicken.x > 340) this.chicken.x = -10;
        
        // Camera shifts upwards
        if (this.chicken.y < 200) {
            const diff = 200 - this.chicken.y;
            this.chicken.y = 200;
            this.score += Math.floor(diff);
            this.sdk.updateHUD(this.score);
            
            this.platforms.forEach(p => {
                p.y += diff;
            });
        }
        
        // Platforms land check (only when falling!)
        if (this.chicken.vy > 0) {
            this.platforms.forEach(p => {
                if (this.chicken.x + this.chicken.w > p.x && this.chicken.x < p.x + p.w) {
                    if (this.chicken.y + this.chicken.h >= p.y && this.chicken.y + this.chicken.h <= p.y + 12) {
                        this.chicken.vy = -7.5; // bounce rocket jump!
                        this.sdk.sound.playJump();
                    }
                }
            });
        }
        
        // Check falling loss
        if (this.chicken.y > 380) {
            this.isRunning = false;
            this.sdk.sound.playHit();
            this.sdk.sound.playLose();
            this.sdk.gameOver({ score: this.score });
        }
        
        // Recycle bottom platform sets
        this.platforms.forEach(p => {
            if (p.y > 400) {
                p.y = -20;
                p.x = 20 + Math.random() * 240;
            }
        });
    },
    draw() {
        this.ctx.fillStyle = "#1e1b4b"; // deep twilight blue
        this.ctx.fillRect(0,0,340,380);
        
        // Draw platforms
        this.ctx.fillStyle = "#fdba74";
        this.platforms.forEach(p => {
            this.ctx.fillRect(p.x, p.y, p.w, p.h);
        });
        
        // Draw Chicken avatar cell block - Replaced CSS variable with solid pink color
        this.ctx.fillStyle = "#ec4899";
        this.ctx.fillRect(this.chicken.x, this.chicken.y, this.chicken.w, this.chicken.h);
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
// GAME 20: CHICKEN CROSSING
// ==========================================
window.GameCollection["chickencrossing"] = {
    name: "Animal Crossing",
    icon: "directions_car",
    color: "#f59e0b",
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="cross-canvas" class="arcade-canvas" width="340" height="340"></canvas>
            <div class="dpad-container" style="margin-top:8px;">
                <button id="btn-cross-up" class="dpad-btn d-up"><span class="material-symbols-rounded">arrow_upward</span></button>
                <button id="btn-cross-left" class="dpad-btn d-left"><span class="material-symbols-rounded">arrow_back</span></button>
                <button id="btn-cross-right" class="dpad-btn d-right"><span class="material-symbols-rounded">arrow_forward</span></button>
                <button id="btn-cross-down" class="dpad-btn d-down"><span class="material-symbols-rounded">arrow_downward</span></button>
            </div>
        `;
        
        this.canvas = this.container.querySelector("#cross-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.player = { x: 170, y: 300, r: 8, vy: 0 };
        this.cars = [];
        this.score = 0;
        this.lanes = [
            { y: 80, speed: -2, color: "#ef4444" },
            { y: 130, speed: 2.5, color: "#3b82f6" },
            { y: 180, speed: -1.7, color: "#eab308" },
            { y: 230, speed: 2.2, color: "#ec4899" }
        ];
        this.isRunning = true;
        
        this.setupEvents();
        this.loop();
    },
    setupEvents() {
        const go = (dx, dy) => {
            this.player.x = Math.max(10, Math.min(330, this.player.x + dx));
            this.player.y = Math.max(10, Math.min(330, this.player.y + dy));
            this.sdk.sound.playTap();
            
            // Score advances on peak forward Y coordinate
            if (this.player.y < 280 && this.score === 0) {
                this.score += 25;
                this.sdk.updateHUD(this.score);
            }
            if (this.player.y < 100) {
                this.score += 100;
                this.sdk.sound.playMerge();
                this.player.y = 300; // warp back home after win
                this.sdk.updateHUD(this.score);
            }
        };
        
        this.container.querySelector("#btn-cross-up").onclick = () => go(0, -30);
        this.container.querySelector("#btn-cross-down").onclick = () => go(0, 30);
        this.container.querySelector("#btn-cross-left").onclick = () => go(-30, 0);
        this.container.querySelector("#btn-cross-right").onclick = () => go(30, 0);
        
        this.keyHandler = (e) => {
            if (e.key === "ArrowUp") go(0, -30);
            if (e.key === "ArrowDown") go(0, 30);
            if (e.key === "ArrowLeft") go(-30, 0);
            if (e.key === "ArrowRight") go(30, 0);
        };
        window.addEventListener("keydown", this.keyHandler);
    },
    loop() {
        if (!this.isRunning) return;
        this.updateCarsData();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    updateCarsData() {
        // Spawn traffic cars
        if (Math.random() < 0.05) {
            const lIdx = Math.floor(Math.random() * this.lanes.length);
            const ln = this.lanes[lIdx];
            this.cars.push({
                x: ln.speed > 0 ? -40 : 380,
                y: ln.y - 12,
                w: 32, h: 20,
                speed: ln.speed,
                color: ln.color
            });
        }
        
        // Move cars & collapse checks
        this.cars.forEach(car => {
            car.x += car.speed;
            
            // Check bounding collisions with player chick
            if (this.player.x + this.player.r > car.x && this.player.x - this.player.r < car.x + car.w) {
                if (this.player.y + this.player.r > car.y && this.player.y - this.player.r < car.y + car.h) {
                    this.crash();
                }
            }
        });
        this.cars = this.cars.filter(c => c.x > -60 && c.x < 400);
    },
    crash() {
        this.isRunning = false;
        this.sdk.sound.playHit();
        this.sdk.sound.playLose();
        this.sdk.gameOver({ score: this.score });
    },
    draw() {
        this.ctx.fillStyle = "#34d399"; // grass crossing pads
        this.ctx.fillRect(0,0,340,340);
        
        // Highways lane boxes
        this.ctx.fillStyle = "#1e293b";
        this.ctx.fillRect(0, 60, 340, 200);
        
        // Lane separations dividers
        this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
        this.ctx.lineWidth = 2;
        this.ctx.dashed = true;
        this.lanes.forEach(ln => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, ln.y + 10);
            this.ctx.lineTo(340, ln.y + 10);
            this.ctx.stroke();
        });
        
        // Draw traffic cars
        this.cars.forEach(car => {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.w, car.h);
        });
        
        // Draw player chick - Replaced CSS variable with solid pink color
        this.ctx.fillStyle = "#ec4899";
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
        this.ctx.fill();
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
// GAME 21: CONNECT 4
// ==========================================
window.GameCollection["connect4"] = {
    name: "Connect 4",
    icon: "grid_view",
    color: "#2563eb", // Royal blue
    hasScore: false,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.board = Array(6).fill(null).map(() => Array(7).fill(null));
        this.currentPlayer = "R"; // "R" (Red) or "Y" (Yellow)
        this.isGameOver = false;
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px; max-width:340px; margin:0 auto; box-sizing:border-box;">
                <h3 id="c4-turn-indicator" style="font-size:18px; font-weight:800; color:#ef4444; margin:0; text-align:center;">Player 1's Turn (Red)</h3>
                
                <!-- Board grid container with classic Connect 4 frame style -->
                <div style="background:#1e3a8a; border:6px solid #2563eb; border-radius:16px; padding:8px; box-shadow:0 10px 25px rgba(0,0,0,0.3); width:100%; aspect-ratio:7/6; display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; box-sizing:border-box; user-select:none; -webkit-user-select:none;">
                    ${Array(42).fill(0).map((_, i) => {
                        const r = Math.floor(i / 7);
                        const c = i % 7;
                        return `
                            <div class="c4-cell" data-row="${r}" data-col="${c}" style="aspect-ratio:1; background:var(--bg-app); border-radius:50%; box-shadow:inset 0 4px 6px rgba(0,0,0,0.25); cursor:pointer; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;"></div>
                        `;
                    }).join("")}
                </div>
                
                <button id="btn-c4-reset" class="arcade-button" style="padding:10px 20px; font-weight:bold; font-size:14px; border-radius:12px; display:flex; align-items:center; gap:8px; margin-top:8px;">
                    <span class="material-symbols-rounded">restart_alt</span> Restart Game
                </button>
            </div>
        `;
        
        this.setupEvents();
        this.resetGame();
    },
    setupEvents() {
        this.container.querySelectorAll(".c4-cell").forEach(cell => {
            cell.onclick = (e) => {
                if (this.isGameOver) return;
                const col = parseInt(cell.getAttribute("data-col"));
                this.dropPiece(col);
            };
        });
        
        const resetBtn = this.container.querySelector("#btn-c4-reset");
        if (resetBtn) {
            resetBtn.onclick = () => {
                this.sdk.sound.playTap();
                this.resetGame();
            };
        }
    },
    resetGame() {
        this.board = Array(6).fill(null).map(() => Array(7).fill(null));
        this.currentPlayer = "R";
        this.isGameOver = false;
        
        // Style cells representing empty
        const cells = this.container.querySelectorAll(".c4-cell");
        cells.forEach(cell => {
            cell.innerHTML = "";
            cell.style.background = "var(--bg-app)";
            cell.style.border = "none";
            cell.style.boxShadow = "inset 0 4px 6px rgba(0,0,0,0.25)";
        });
        
        this.updateHeader();
    },
    updateHeader() {
        const turnEl = this.container.querySelector("#c4-turn-indicator");
        if (turnEl) {
            if (this.isGameOver) {
                const winner = this.getWinnerName();
                if (winner === "Draw") {
                    turnEl.innerText = "🤝 It's a Draw!";
                    turnEl.style.color = "var(--text-secondary)";
                } else {
                    turnEl.innerText = `🎉 ${winner} Wins!`;
                    turnEl.style.color = this.currentPlayer === "R" ? "#ef4444" : "#f59e0b";
                }
            } else {
                turnEl.innerText = this.currentPlayer === "R" ? "🔴 Player 1's Turn (Red)" : "🟡 Player 2's Turn (Yellow)";
                turnEl.style.color = this.currentPlayer === "R" ? "#ef4444" : "#f59e0b";
            }
        }
    },
    getWinnerName() {
        const res = this.checkWinner();
        if (res === null) return "Draw";
        return res.winner === "R" ? "Player 1 (Red)" : "Player 2 (Yellow)";
    },
    dropPiece(col) {
        // Find the lowest empty row in this column
        let targetRow = -1;
        for (let r = 5; r >= 0; r--) {
            if (this.board[r][col] === null) {
                targetRow = r;
                break;
            }
        }
        
        // Column full
        if (targetRow === -1) {
            this.sdk.sound.playTap(); // play error tap
            return;
        }
        
        // 5% Easter egg chance in Connect 4!
        const isCookieEgg = Math.random() < 0.05;
        
        const pieceVal = isCookieEgg ? "COOKIE" : this.currentPlayer;
        this.board[targetRow][col] = pieceVal;
        
        // Update visual cell
        const cell = this.container.querySelector(`.c4-cell[data-row="${targetRow}"][data-col="${col}"]`);
        if (cell) {
            this.sdk.sound.playTap(); // play tick sound
            
            // Render piece style
            if (isCookieEgg) {
                cell.innerHTML = `<span style="font-size:24px;">🍪</span>`;
                cell.style.background = "#fbbf24";
                window.triggerEasterEgg(500, "CONNECT 4 COOKIE SHOWER");
            } else {
                const innerPiece = document.createElement("div");
                innerPiece.style.width = "85%";
                innerPiece.style.height = "85%";
                innerPiece.style.borderRadius = "50%";
                innerPiece.style.background = this.currentPlayer === "R" ? "radial-gradient(circle, #ef4444 40%, #991b1b)" : "radial-gradient(circle, #f59e0b 40%, #92400e)";
                innerPiece.style.boxShadow = "inset 0 -4px 6px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)";
                innerPiece.style.transform = "translateY(-150px)";
                innerPiece.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                cell.appendChild(innerPiece);
                
                // Force reflow and animate fall
                innerPiece.offsetHeight;
                innerPiece.style.transform = "translateY(0)";
            }
        }
        
        // Check win or draw
        const winInfo = this.checkWinner();
        if (winInfo) {
            this.isGameOver = true;
            this.sdk.sound.playWin();
            
            // Highlight winning cells
            winInfo.cells.forEach(([wr, wc]) => {
                const wCell = this.container.querySelector(`.c4-cell[data-row="${wr}"][data-col="${wc}"]`);
                if (wCell) {
                    wCell.style.border = "4px solid #10b981";
                    wCell.style.boxShadow = "0 0 15px #10b981";
                }
            });
            
            this.updateHeader();
            return;
        }
        
        if (this.isBoardFull()) {
            this.isGameOver = true;
            this.sdk.sound.playLose();
            this.updateHeader();
            return;
        }
        
        // Switch turn
        this.currentPlayer = this.currentPlayer === "R" ? "Y" : "R";
        this.updateHeader();
    },
    isBoardFull() {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 7; c++) {
                if (this.board[r][c] === null) return false;
            }
        }
        return true;
    },
    checkWinner() {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 7; c++) {
                const p = this.board[r][c];
                if (p) {
                    // Check right
                    if (c + 3 < 7 &&
                        this.getCorePiece(this.board[r][c+1]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r][c+2]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r][c+3]) === this.getCorePiece(p)) {
                        return { winner: p, cells: [[r, c], [r, c+1], [r, c+2], [r, c+3]] };
                    }
                    // Check down
                    if (r + 3 < 6 &&
                        this.getCorePiece(this.board[r+1][c]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r+2][c]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r+3][c]) === this.getCorePiece(p)) {
                        return { winner: p, cells: [[r, c], [r+1, c], [r+2, c], [r+3, c]] };
                    }
                    // Check diagonal down-right
                    if (r + 3 < 6 && c + 3 < 7 &&
                        this.getCorePiece(this.board[r+1][c+1]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r+2][c+2]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r+3][c+3]) === this.getCorePiece(p)) {
                        return { winner: p, cells: [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]] };
                    }
                    // Check diagonal up-right
                    if (r - 3 >= 0 && c + 3 < 7 &&
                        this.getCorePiece(this.board[r-1][c+1]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r-2][c+2]) === this.getCorePiece(p) &&
                        this.getCorePiece(this.board[r-3][c+3]) === this.getCorePiece(p)) {
                        return { winner: p, cells: [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]] };
                    }
                }
            }
        }
        return null;
    },
    getCorePiece(p) {
        if (p === "COOKIE") return this.currentPlayer; // cookie acts as the active player's color
        return p;
    },
    pause() {},
    destroy() {}
};

// ==========================================
// GAME 22: SLIDING PUZZLE
// ==========================================
window.GameCollection["slidingpuzzle"] = {
    name: "Sliding Puzzle",
    icon: "extension",
    color: "#3b82f6",
    hasScore: false,
    saveGameState() {
        if (this.isSolved) return;
        try {
            const state = {
                size: this.size,
                board: this.board,
                moves: this.moves,
                timeElapsed: this.timeElapsed,
                isSolved: this.isSolved
            };
            localStorage.setItem("game_state_slidingpuzzle", JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save slidingpuzzle state", e);
        }
    },
    clearGameState() {
        localStorage.removeItem("game_state_slidingpuzzle");
    },
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.size = 3; // 3x3 default
        this.board = [];
        this.moves = 0;
        this.timeElapsed = 0;
        this.timerInterval = null;
        this.isSolved = false;
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px; max-width:340px; margin:0 auto; box-sizing:border-box; user-select:none; -webkit-user-select:none;">
                
                <!-- Board scale modes -->
                <div class="grid-select-row" style="display:flex; gap:6px; justify-content:center; width:100%; max-width:320px;">
                    <button class="puzzle-scale-btn" data-size="3" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-primary); font-size:13px; font-weight:700; cursor:pointer;">3x3</button>
                    <button class="puzzle-scale-btn" data-size="4" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-primary); font-size:13px; font-weight:700; cursor:pointer;">4x4</button>
                    <button class="puzzle-scale-btn" data-size="5" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-primary); font-size:13px; font-weight:700; cursor:pointer;">5x5</button>
                </div>
                
                <!-- HUD statistics info -->
                <div style="display:flex; justify-content:space-between; width:100%; max-width:300px; padding:6px 12px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-color); font-size:13px;">
                    <div>Moves: <span id="puzzle-moves" style="font-weight:900; color:var(--text-primary);">0</span></div>
                    <div>Time: <span id="puzzle-timer" style="font-weight:900; color:var(--text-primary);">00:00</span></div>
                </div>
                
                <!-- Best Records readout panel -->
                <div id="puzzle-bests" style="font-size:11px; color:var(--text-secondary); text-align:center; width:100%; height:16px;">
                    Best Moves: -- | Best Time: --
                </div>
                
                <!-- Sliding puzzle grid frame -->
                <div id="puzzle-grid" style="display:grid; gap:6px; background-color:var(--border-color); padding:8px; border-radius:16px; width:100%; max-width:300px; aspect-ratio:1; box-sizing:border-box;"></div>
                
                <div style="display:flex; gap:8px; width:100%; max-width:300px;">
                    <button id="btn-puzzle-shuffle" class="arcade-button" style="flex:1; padding:10px; font-weight:bold; font-size:13px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:6px;">
                        <span class="material-symbols-rounded">shuffle</span> Shuffle
                    </button>
                </div>
            </div>
        `;
        
        this.setupEvents();
        
        const saved = localStorage.getItem("game_state_slidingpuzzle");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.size = state.size || 3;
                this.board = state.board || [];
                this.moves = state.moves || 0;
                this.timeElapsed = state.timeElapsed || 0;
                this.isSolved = state.isSolved || false;
                
                this.container.querySelectorAll(".puzzle-scale-btn").forEach(btn => {
                    const btnSize = parseInt(btn.getAttribute("data-size"));
                    if (btnSize === this.size) btn.classList.add("active");
                    else btn.classList.remove("active");
                });
                
                const mEl = this.container.querySelector("#puzzle-moves");
                if (mEl) mEl.innerText = this.moves;
                
                const min = String(Math.floor(this.timeElapsed / 60)).padStart(2, "0");
                const sec = String(this.timeElapsed % 60).padStart(2, "0");
                const timerEl = this.container.querySelector("#puzzle-timer");
                if (timerEl) timerEl.innerText = `${min}:${sec}`;
                
                this.setMode(this.size, true);
                return;
            } catch (e) {
                console.error("Failed to load saved slidingpuzzle state", e);
            }
        }
        
        this.setMode(3);
    },
    setupEvents() {
        this.container.querySelectorAll(".puzzle-scale-btn").forEach(btn => {
            btn.onclick = () => {
                this.sdk.sound.playTap();
                const size = parseInt(btn.getAttribute("data-size"));
                this.setMode(size);
            };
        });
        
        const shuffleBtn = this.container.querySelector("#btn-puzzle-shuffle");
        if (shuffleBtn) {
            shuffleBtn.onclick = () => {
                this.sdk.sound.playTap();
                this.shuffle();
            };
        }
        
        // Add click listener on empty stats to activate secret cookie
        const movesLabel = this.container.querySelector("#puzzle-moves");
        if (movesLabel) {
            this.eggClicks = 0;
            movesLabel.onclick = () => {
                this.eggClicks = (this.eggClicks || 0) + 1;
                if (this.eggClicks >= 5) {
                    this.eggClicks = 0;
                    window.triggerEasterEgg(500, "PUZZLE MASTER COOKIE");
                } else {
                    this.sdk.sound.playTap();
                }
            };
        }
    },
    setMode(size, avoidShuffle = false) {
        this.size = size;
        
        // Toggle selected state buttons in scale
        this.container.querySelectorAll(".puzzle-scale-btn").forEach(btn => {
            const btnSize = parseInt(btn.getAttribute("data-size"));
            if (btnSize === size) {
                btn.style.background = "var(--accent)";
                btn.style.color = "white";
                btn.style.borderColor = "var(--accent)";
            } else {
                btn.style.background = "var(--bg-card)";
                btn.style.color = "var(--text-primary)";
                btn.style.borderColor = "var(--border-color)";
            }
        });
        
        // Set dynamic grid template columns
        const grid = this.container.querySelector("#puzzle-grid");
        if (grid) {
            grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        }
        
        this.loadPB();
        if (!avoidShuffle) {
            this.shuffle();
        } else {
            this.renderGrid();
            this.startTimer();
        }
    },
    loadPB() {
        const bestMoves = localStorage.getItem(`bg_puzzle_moves_${this.size}`);
        const bestTime = localStorage.getItem(`bg_puzzle_time_${this.size}`);
        
        const bEl = this.container.querySelector("#puzzle-bests");
        if (bEl) {
            if (bestMoves && bestTime) {
                const min = String(Math.floor(bestTime / 60)).padStart(2, "0");
                const sec = String(bestTime % 60).padStart(2, "0");
                bEl.innerText = `🏆 Personal Record: ${bestMoves} moves | Time: ${min}:${sec}`;
            } else {
                bEl.innerText = `🏆 Personal Record: None yet!`;
            }
        }
    },
    savePB() {
        const prevMoves = localStorage.getItem(`bg_puzzle_moves_${this.size}`);
        const prevTime = localStorage.getItem(`bg_puzzle_time_${this.size}`);
        
        let newPB = false;
        
        if (!prevMoves || this.moves < parseInt(prevMoves)) {
            localStorage.setItem(`bg_puzzle_moves_${this.size}`, this.moves);
            newPB = true;
        }
        if (!prevTime || this.timeElapsed < parseInt(prevTime)) {
            localStorage.setItem(`bg_puzzle_time_${this.size}`, this.timeElapsed);
            newPB = true;
        }
        
        this.loadPB();
        if (newPB) {
            window.triggerEasterEgg(500, "NEW SLIDING RECORD!");
        }
    },
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isSolved) return;
            this.timeElapsed++;
            const min = String(Math.floor(this.timeElapsed / 60)).padStart(2, "0");
            const sec = String(this.timeElapsed % 60).padStart(2, "0");
            const timerEl = this.container.querySelector("#puzzle-timer");
            if (timerEl) {
                timerEl.innerText = `${min}:${sec}`;
            }
            this.saveGameState();
        }, 1000);
    },
    shuffle() {
        this.moves = 0;
        this.timeElapsed = 0;
        this.isSolved = false;
        this.startTimer();
        
        const movesEl = this.container.querySelector("#puzzle-moves");
        if (movesEl) movesEl.innerText = "0";
        
        // Initialize sequentially solved board list [1, 2, ..., null]
        this.board = [];
        const maxVal = this.size * this.size;
        for (let i = 1; i < maxVal; i++) {
            this.board.push(i);
        }
        this.board.push(null);
        
        // Walk random moves to make sure it remains solvable
        let emptyIdx = maxVal - 1;
        const stepsCount = this.size === 3 ? 120 : (this.size === 4 ? 200 : 350);
        
        for (let step = 0; step < stepsCount; step++) {
            const r = Math.floor(emptyIdx / this.size);
            const c = emptyIdx % this.size;
            const options = [];
            
            if (r > 0) options.push(emptyIdx - this.size); // up
            if (r < this.size - 1) options.push(emptyIdx + this.size); // down
            if (c > 0) options.push(emptyIdx - 1); // left
            if (c < this.size - 1) options.push(emptyIdx + 1); // right
            
            const randIdx = options[Math.floor(Math.random() * options.length)];
            // Swap values
            this.board[emptyIdx] = this.board[randIdx];
            this.board[randIdx] = null;
            emptyIdx = randIdx;
        }
        
        this.renderGrid();
    },
    renderGrid() {
        const grid = this.container.querySelector("#puzzle-grid");
        if (!grid) return;
        
        grid.innerHTML = "";
        
        this.board.forEach((val, idx) => {
            const cell = document.createElement("div");
            cell.style.aspectRatio = "1";
            cell.style.display = "flex";
            cell.style.alignItems = "center";
            cell.style.justifyContent = "center";
            cell.style.fontSize = this.size === 3 ? "24px" : (this.size === 4 ? "20px" : "16px");
            cell.style.fontWeight = "900";
            cell.style.borderRadius = "12px";
            cell.style.cursor = val === null ? "default" : "pointer";
            cell.style.userSelect = "none";
            cell.style.boxSizing = "border-box";
            
            if (val === null) {
                // Empty tile
                cell.style.background = "transparent";
            } else {
                // Normal solid cell
                cell.style.background = "var(--bg-card)";
                cell.style.color = "var(--text-primary)";
                cell.style.border = "1px solid var(--border-color)";
                cell.style.boxShadow = "0 3px 6px rgba(0,0,0,0.15)";
                cell.innerText = val;
                
                let startX = 0, startY = 0;
                
                const onDragStart = (x, y) => {
                    startX = x;
                    startY = y;
                };
                
                const onDragEnd = (endX, endY) => {
                    if (this.isSolved) return;
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist < 18) {
                        // Clean fallback for quick click-taps
                        this.slideTile(idx);
                        return;
                    }
                    
                    // Detect swipe direction
                    let swipeDir = "";
                    if (Math.abs(dx) > Math.abs(dy)) {
                        swipeDir = dx > 0 ? "right" : "left";
                    } else {
                        swipeDir = dy > 0 ? "down" : "up";
                    }
                    
                    const r = Math.floor(idx / this.size);
                    const c = idx % this.size;
                    const emptyIdx = this.board.indexOf(null);
                    const er = Math.floor(emptyIdx / this.size);
                    const ec = emptyIdx % this.size;
                    
                    let validSwipe = false;
                    if (swipeDir === "right" && r === er && ec === c + 1) validSwipe = true;
                    if (swipeDir === "left" && r === er && ec === c - 1) validSwipe = true;
                    if (swipeDir === "down" && c === ec && er === r + 1) validSwipe = true;
                    if (swipeDir === "up" && c === ec && er === r - 1) validSwipe = true;
                    
                    if (validSwipe) {
                        this.slideTile(idx);
                    }
                };
                
                cell.addEventListener("mousedown", (e) => {
                    onDragStart(e.clientX, e.clientY);
                });
                
                cell.addEventListener("mouseup", (e) => {
                    onDragEnd(e.clientX, e.clientY);
                });
                
                cell.addEventListener("touchstart", (e) => {
                    if (e.touches.length > 0) {
                        onDragStart(e.touches[0].clientX, e.touches[0].clientY);
                    }
                }, { passive: true });
                
                cell.addEventListener("touchend", (e) => {
                    if (e.changedTouches.length > 0) {
                        onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                    }
                }, { passive: true });
            }
            grid.appendChild(cell);
        });
    },
    slideTile(idx) {
        const r = Math.floor(idx / this.size);
        const c = idx % this.size;
        
        // Find empty slot INDEX
        const emptyIdx = this.board.indexOf(null);
        const er = Math.floor(emptyIdx / this.size);
        const ec = emptyIdx % this.size;
        
        // Adjacent checks
        const dist = Math.abs(r - er) + Math.abs(c - ec);
        if (dist === 1) {
            // Swap!
            this.board[emptyIdx] = this.board[idx];
            this.board[idx] = null;
            
            this.moves++;
            const movesEl = this.container.querySelector("#puzzle-moves");
            if (movesEl) movesEl.innerText = this.moves;
            
            this.sdk.sound.playTap();
            this.renderGrid();
            this.saveGameState();
            this.checkSolution();
        }
    },
    checkSolution() {
        const maxVal = this.size * this.size;
        for (let i = 0; i < maxVal - 1; i++) {
            if (this.board[i] !== i + 1) return;
        }
        
        // Solved successfully!
        this.isSolved = true;
        this.clearGameState();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.sdk.sound.playWin();
        
        // Congratulate banner overlay
        const grid = this.container.querySelector("#puzzle-grid");
        if (grid) {
            grid.style.position = "relative";
            const banner = document.createElement("div");
            banner.style.position = "absolute";
            banner.style.inset = "0";
            banner.style.background = "rgba(16, 185, 129, 0.95)";
            banner.style.color = "white";
            banner.style.borderRadius = "16px";
            banner.style.display = "flex";
            banner.style.flexDirection = "column";
            banner.style.alignItems = "center";
            banner.style.justifyContent = "center";
            banner.style.fontWeight = "900";
            banner.style.fontSize = "22px";
            banner.style.gap = "8px";
            banner.style.zIndex = "10";
            banner.innerHTML = `
                <span>🎉 Victory!</span>
                <span style="font-size:14px; font-weight:400;">Solved in ${this.moves} moves!</span>
            `;
            grid.appendChild(banner);
        }
        
        this.savePB();
    },
    pause() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    },
    destroy() {
        this.pause();
    }
};

// ==========================================
// GAME 23: DOTS AND BOXES
// ==========================================
window.GameCollection["dotsandboxes"] = {
    name: "Dots and Boxes",
    icon: "grid_on",
    color: "#eab308",
    hasScore: false,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.p1Score = 0;
        this.p2Score = 0;
        this.currentPlayer = 1; // Player 1 (🔴) vs 2 (🔵)
        this.isGameOver = false;
        
        // lines state
        this.hLines = {}; // key: "r_c" -> player (1 or 2)
        this.vLines = {}; // key: "r_c" -> player (1 or 2)
        this.claimedBoxes = {}; // key: "r_c" -> player (1 or 2)
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:16px; display:flex; flex-direction:column; align-items:center; width:100%; gap:12px; max-width:340px; margin:0 auto; box-sizing:border-box;">
                
                <!-- Scoreboards and Turn indicators -->
                <div style="display:flex; justify-content:space-between; width:100%; max-width:300px; padding:10px 14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-color); font-size:13px; text-align:center;">
                    <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
                        <span style="font-size:11px; color:#ef4444; font-weight:800;">PLAYER 1</span>
                        <span style="font-size:18px; font-weight:900; color:#ef4444;" id="db-p1-score">0</span>
                    </div>
                    <div style="width:2px; background:var(--border-color); margin:0 8px;"></div>
                    <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
                        <span style="font-size:11px; color:#3b82f6; font-weight:800;">PLAYER 2</span>
                        <span style="font-size:18px; font-weight:900; color:#3b82f6;" id="db-p2-score">0</span>
                    </div>
                </div>
                
                <h3 id="db-turn-indicator" style="font-size:16px; font-weight:800; color:#ef4444; margin:0; text-align:center;">🔴 Player 1's Turn</h3>
                
                <!-- Interactive grid container -->
                <div id="db-board-container" style="position:relative; width:280px; height:280px; background:var(--bg-card); border-radius:16px; border:1.5px solid var(--border-color); box-shadow:0 8px 20px rgba(0,0,0,0.25); box-sizing:border-box; overflow:hidden; margin:8px auto; user-select:none; -webkit-user-select:none;"></div>
                
                <button id="btn-db-reset" class="arcade-button" style="padding:10px 20px; font-weight:bold; font-size:14px; border-radius:12px; display:flex; align-items:center; gap:8px;">
                    <span class="material-symbols-rounded">restart_alt</span> Restart
                </button>
            </div>
        `;
        
        this.renderBoard();
        this.resetGame();
    },
    resetGame() {
        this.p1Score = 0;
        this.p2Score = 0;
        this.currentPlayer = 1;
        this.isGameOver = false;
        this.hLines = {};
        this.vLines = {};
        this.claimedBoxes = {};
        
        const p1El = this.container.querySelector("#db-p1-score");
        const p2El = this.container.querySelector("#db-p2-score");
        if (p1El) p1El.innerText = "0";
        if (p2El) p2El.innerText = "0";
        
        this.updateHeader();
        
        // Reset all line indicators and boxes
        this.container.querySelectorAll(".db-line-active").forEach(line => {
            line.style.background = "var(--border-color)";
            line.classList.remove("db-line-active");
        });
        
        this.container.querySelectorAll(".db-box").forEach(box => {
            box.style.background = "transparent";
            box.innerHTML = "";
        });
    },
    updateHeader() {
        const turnEl = this.container.querySelector("#db-turn-indicator");
        if (turnEl) {
            if (this.isGameOver) {
                if (this.p1Score > this.p2Score) {
                    turnEl.innerText = "🎉 Player 1 (Red) Wins!";
                    turnEl.style.color = "#ef4444";
                } else if (this.p2Score > this.p1Score) {
                    turnEl.innerText = "🎉 Player 2 (Blue) Wins!";
                    turnEl.style.color = "#3b82f6";
                } else {
                    turnEl.innerText = "🤝 It's a Tie Draw!";
                    turnEl.style.color = "var(--text-secondary)";
                }
            } else {
                turnEl.innerText = this.currentPlayer === 1 ? "🔴 Player 1's Turn (Red)" : "🔵 Player 2's Turn (Blue)";
                turnEl.style.color = this.currentPlayer === 1 ? "#ef4444" : "#3b82f6";
            }
        }
    },
    renderBoard() {
        const board = this.container.querySelector("#db-board-container");
        if (!board) return;
        
        board.innerHTML = "";
        
        const S = 70; // spaces between dots (resulting in 3x3=9 squares within 4x4 dots grid)
        const Ox = 35; // offset center
        const Oy = 35;
        
        // 1. Render Boxes (background layer)
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const box = document.createElement("div");
                box.className = "db-box";
                box.id = `box_${r}_${c}`;
                box.style.position = "absolute";
                box.style.left = `${Ox + c * S + 4}px`;
                box.style.top = `${Oy + r * S + 4}px`;
                box.style.width = `${S - 8}px`;
                box.style.height = `${S - 8}px`;
                box.style.borderRadius = "8px";
                box.style.display = "flex";
                box.style.alignItems = "center";
                box.style.justifyContent = "center";
                box.style.fontSize = "16px";
                box.style.fontWeight = "900";
                box.style.transition = "background 0.3s ease-out";
                board.appendChild(box);
            }
        }
        
        // 2. Render clickable lines (mid layer for easy tap selection targets)
        // Horizontal lines: 4 rows of 3 segments
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                const lineTap = document.createElement("div");
                lineTap.style.position = "absolute";
                lineTap.style.left = `${Ox + c * S + 4}px`;
                lineTap.style.top = `${Oy + r * S - 12}px`;
                lineTap.style.width = `${S - 8}px`;
                lineTap.style.height = "24px";
                lineTap.style.cursor = "pointer";
                lineTap.style.display = "flex";
                lineTap.style.alignItems = "center";
                lineTap.style.justifyContent = "center";
                lineTap.style.zIndex = "10";
                
                const lineVis = document.createElement("div");
                lineVis.id = `hl_${r}_${c}`;
                lineVis.style.width = "100%";
                lineVis.style.height = "4px";
                lineVis.style.background = "var(--border-color)";
                lineVis.style.borderRadius = "2px";
                lineVis.style.transition = "background 0.25s, box-shadow 0.25s";
                lineTap.appendChild(lineVis);
                
                lineTap.onclick = () => {
                    if (this.isGameOver) return;
                    this.claimLine("h", r, c, lineVis);
                };
                
                board.appendChild(lineTap);
            }
        }
        
        // Vertical lines: 3 rows of 4 segments
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
                const lineTap = document.createElement("div");
                lineTap.style.position = "absolute";
                lineTap.style.left = `${Ox + c * S - 12}px`;
                lineTap.style.top = `${Oy + r * S + 4}px`;
                lineTap.style.width = "24px";
                lineTap.style.height = `${S - 8}px`;
                lineTap.style.cursor = "pointer";
                lineTap.style.display = "flex";
                lineTap.style.alignItems = "center";
                lineTap.style.justifyContent = "center";
                lineTap.style.zIndex = "10";
                
                const lineVis = document.createElement("div");
                lineVis.id = `vl_${r}_${c}`;
                lineVis.style.width = "4px";
                lineVis.style.height = "100%";
                lineVis.style.background = "var(--border-color)";
                lineVis.style.borderRadius = "2px";
                lineVis.style.transition = "background 0.25s, box-shadow 0.25s";
                lineTap.appendChild(lineVis);
                
                lineTap.onclick = () => {
                    if (this.isGameOver) return;
                    this.claimLine("v", r, c, lineVis);
                };
                
                board.appendChild(lineTap);
            }
        }
        
        // 3. Render Dot pins (top layer design aesthetics)
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const dot = document.createElement("div");
                dot.style.position = "absolute";
                dot.style.left = `${Ox + c * S - 4}px`;
                dot.style.top = `${Oy + r * S - 4}px`;
                dot.style.width = "10px";
                dot.style.height = "10px";
                dot.style.borderRadius = "50%";
                dot.style.background = "var(--text-secondary)";
                dot.style.border = "1.5px solid var(--bg-card)";
                dot.style.boxShadow = "0 1.5px 3px rgba(0,0,0,0.25)";
                dot.style.zIndex = "12";
                board.appendChild(dot);
            }
        }
        
        // Click on board to trigger Easter Egg!
        board.onclick = (e) => {
            if (e.target === board) {
                this.sdk.sound.playTap();
                this.easterGridClicks = (this.easterGridClicks || 0) + 1;
                if (this.easterGridClicks >= 6) {
                    this.easterGridClicks = 0;
                    window.triggerEasterEgg(500, "DOTS & BOXES COOKIE MADNESS");
                }
            }
        };
        
        // Reset action button click
        const rBtn = this.container.querySelector("#btn-db-reset");
        if (rBtn) {
            rBtn.onclick = () => {
                this.sdk.sound.playTap();
                this.resetGame();
            };
        }
    },
    claimLine(type, r, c, element) {
        const key = `${r}_${c}`;
        const map = type === "h" ? this.hLines : this.vLines;
        
        // Line already taken
        if (map[key]) return;
        
        // Mark taken
        map[key] = this.currentPlayer;
        element.style.background = this.currentPlayer === 1 ? "#ef4444" : "#3b82f6";
        element.style.boxShadow = this.currentPlayer === 1 ? "0 0 8px rgba(239, 68, 68, 0.7)" : "0 0 8px rgba(59, 130, 246, 0.7)";
        element.classList.add("db-line-active");
        
        this.sdk.sound.playTap();
        
        // Check completions
        let boxEarned = false;
        
        if (type === "h") {
            // Check top box (r-1, c) and bottom box (r, c)
            if (r > 0 && this.checkBoxComplete(r - 1, c)) {
                this.claimBox(r - 1, c);
                boxEarned = true;
            }
            if (r < 3 && this.checkBoxComplete(r, c)) {
                this.claimBox(r, c);
                boxEarned = true;
            }
        } else {
            // Check left box (r, c-1) and right box (r, c)
            if (c > 0 && this.checkBoxComplete(r, c - 1)) {
                this.claimBox(r, c - 1);
                boxEarned = true;
            }
            if (c < 3 && this.checkBoxComplete(r, c)) {
                this.claimBox(r, c);
                boxEarned = true;
            }
        }
        
        // Check game over
        if (this.isBoardComplete()) {
            this.isGameOver = true;
            this.sdk.sound.playWin();
            this.updateHeader();
            return;
        }
        
        // Turn cycle orchestration
        if (!boxEarned) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        } else {
            this.sdk.sound.playMerge(); // highlight celebratory match sounds
        }
        this.updateHeader();
    },
    checkBoxComplete(br, bc) {
        const top = this.hLines[`${br}_${bc}`];
        const bottom = this.hLines[`${br+1}_${bc}`];
        const left = this.vLines[`${br}_${bc}`];
        const right = this.vLines[`${br}_${bc+1}`];
        
        return (top && bottom && left && right);
    },
    claimBox(br, bc) {
        if (this.claimedBoxes[`${br}_${bc}`]) return; // already claimed
        
        this.claimedBoxes[`${br}_${bc}`] = this.currentPlayer;
        
        if (this.currentPlayer === 1) {
            this.p1Score++;
            const p1 = this.container.querySelector("#db-p1-score");
            if (p1) p1.innerText = this.p1Score;
        } else {
            this.p2Score++;
            const p2 = this.container.querySelector("#db-p2-score");
            if (p2) p2.innerText = this.p2Score;
        }
        
        const bCell = this.container.querySelector(`#box_${br}_${bc}`);
        if (bCell) {
            bCell.style.background = this.currentPlayer === 1 ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)";
            bCell.innerHTML = `<span style="font-size:20px; color:${this.currentPlayer === 1 ? '#ef4444' : '#3b82f6'};">${this.currentPlayer === 1 ? '🔴' : '🔵'}</span>`;
        }
    },
    isBoardComplete() {
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (!this.claimedBoxes[`${r}_${c}`]) return false;
            }
        }
        return true;
    },
    pause() {},
    destroy() {}
};
