/**
 * BiteGamez Arcade Game Bundle - Part 2 (Games 8 to 14)
 */

window.GameCollection = window.GameCollection || {};

// ==========================================
// GAME 8: DINO RUNNER
// ==========================================
window.GameCollection["dino"] = {
    name: "Dino Runner",
    icon: "directions_run",
    color: "#22c55e",
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="dino-canvas" class="arcade-canvas" width="340" height="240"></canvas>
            <div style="display:flex; gap:16px; width:100%; max-width:320px; justify-content:center; padding:8px;">
                <button id="btn-dino-jump" class="arcade-button primary" style="flex:1; padding:12px;"><span class="material-symbols-rounded">arrow_upward</span> JUMP</button>
                <button id="btn-dino-duck" class="arcade-button" style="flex:1; padding:12px;"><span class="material-symbols-rounded">arrow_downward</span> DUCK</button>
            </div>
        `;
        
        this.canvas = this.container.querySelector("#dino-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.dino = { x: 30, y: 205, w: 10, h: 15, vy: 0, g: 0.5, jumpPower: -8.8, isJumping: false, isDucking: false };
        this.obstacles = [];
        this.score = 0;
        this.gameSpeed = 3.5;
        this.isRunning = true;
        
        this.setupEvents();
        this.loop();
    },
    setupEvents() {
        const jump = () => {
            if (!this.dino.isJumping) {
                this.dino.vy = this.dino.jumpPower;
                this.dino.isJumping = true;
                this.dino.isDucking = false;
                this.sdk.sound.playJump();
            }
        };
        const duck = (isDuck) => {
            this.dino.isDucking = isDuck;
            if (isDuck) {
                this.dino.h = 8;
                this.dino.y = 212;
            } else {
                this.dino.h = 15;
                this.dino.y = 205;
            }
        };
        
        this.container.querySelector("#btn-dino-jump").onclick = jump;
        
        const duckBtn = this.container.querySelector("#btn-dino-duck");
        duckBtn.ontouchstart = (e) => { e.preventDefault(); duck(true); };
        duckBtn.ontouchend = (e) => { e.preventDefault(); duck(false); };
        duckBtn.onmousedown = () => duck(true);
        duckBtn.onmouseup = () => duck(false);
        
        this.keyHandler = (e) => {
            if (e.key === "ArrowUp") jump();
            if (e.key === "ArrowDown") duck(true);
        };
        this.keyUpHandler = (e) => {
            if (e.key === "ArrowDown") duck(false);
        };
        window.addEventListener("keydown", this.keyHandler);
        window.addEventListener("keyup", this.keyUpHandler);
    },
    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    update() {
        this.score++;
        if (this.score % 150 === 0) {
            this.gameSpeed += 0.4;
            this.sdk.sound.playMerge();
        }
        this.sdk.updateHUD(this.score);
        
        // Dino physics mechanics
        if (this.dino.isJumping) {
            this.dino.vy += this.dino.g;
            this.dino.y += this.dino.vy;
            if (this.dino.y >= (this.dino.isDucking ? 212 : 205)) {
                this.dino.y = this.dino.isDucking ? 212 : 205;
                this.dino.vy = 0;
                this.dino.isJumping = false;
            }
        }
        
        // Obstacles spawner with safe spacing constraint (increased spacing as requested)
        let canSpawn = true;
        if (this.obstacles.length > 0) {
            const rightmost = this.obstacles[this.obstacles.length - 1];
            // Safe distance increases dynamically with speed to keep jumps possible/fair
            const minSpacing = Math.max(220, this.gameSpeed * 48);
            if (340 - rightmost.x < minSpacing) {
                canSpawn = false;
            }
        }
        
        // Halved size of cactus and birds
        if (canSpawn && Math.random() < 0.015) {
            const isBird = Math.random() < 0.25;
            this.obstacles.push({
                x: 340,
                y: isBird ? 172 : 205,
                w: isBird ? 9 : 6,
                h: isBird ? 6 : 15,
                isBird: isBird
            });
        }
        
        // Move & Collide checks
        this.obstacles.forEach((obs, idx) => {
            obs.x -= this.gameSpeed;
            
            // Overlapping check
            if (obs.x < this.dino.x + this.dino.w && obs.x + obs.w > this.dino.x) {
                if (this.dino.y + this.dino.h > obs.y && this.dino.y < obs.y + obs.h) {
                    this.crash();
                }
            }
        });
        
        this.obstacles = this.obstacles.filter(o => o.x > -30);
    },
    crash() {
        this.isRunning = false;
        this.sdk.sound.playHit();
        this.sdk.sound.playLose();
        this.sdk.gameOver({ score: this.score });
    },
    draw() {
        this.ctx.fillStyle = "#1e293b";
        this.ctx.fillRect(0,0,340,240);
        
        // Draw baseline ground
        this.ctx.fillStyle = "rgba(255,255,255,0.1)";
        this.ctx.fillRect(0, 220, 340, 2);
        
        // Dino character - Replaced CSS variables with solid hex colors for Canvas
        this.ctx.fillStyle = "#22c55e";
        this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.w, this.dino.h);
        
        // Eye of dino - scaled down eye
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(this.dino.x + 6, this.dino.y + 2, 2, 2);
        
        // Drawing obstacles - Replaced CSS variables with solid hex colors
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = obs.isBird ? "#ec4899" : "#ef4444";
            this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        });
    },
    start() {},
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    },
    destroy() {
        this.pause();
        window.removeEventListener("keydown", this.keyHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
    }
};

// ==========================================
// GAME 9: BALLOON POP
// ==========================================
window.GameCollection["balloon"] = {
    name: "Balloon Pop",
    icon: "filter_vintage",
    color: "#ec4899", // Pink
    hasScore: true,
    hasTimer: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="balloon-canvas" class="arcade-canvas" width="340" height="420"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#balloon-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.balloons = [];
        this.particles = [];
        this.score = 0;
        this.duration = 30; // seconds
        this.isRunning = true;
        
        this.setupEvents();
        this.sdk.updateHUD(this.score);
        this.sdk.startTimer();
        
        this.timerInterval = setInterval(() => {
            this.duration--;
            if (this.duration <= 0) {
                this.endGame();
            }
        }, 1000);
        
        this.loop();
    },
    setupEvents() {
        const tapHandler = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const tx = (clientX - rect.left) * (340 / rect.width);
            const ty = (clientY - rect.top) * (420 / rect.height);
            
            const balloonsToPop = [];
            this.balloons.forEach((b, idx) => {
                const dist = Math.hypot(b.x - tx, b.y - ty);
                if (dist < b.r + 10) {
                    balloonsToPop.push(idx);
                }
            });
            // Pop from highest index to lowest so splice doesn't affect earlier indices
            balloonsToPop.sort((a, b) => b - a).forEach(idx => {
                this.popBalloon(idx, tx, ty);
            });
        };
        this.canvas.onclick = (e) => tapHandler(e.clientX, e.clientY);
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            tapHandler(e.touches[0].clientX, e.touches[0].clientY);
        };
    },
    popBalloon(idx, tx, ty) {
        const b = this.balloons[idx];
        this.balloons.splice(idx, 1);
        
        if (b.isCookie) {
            window.triggerEasterEgg(500, "BALLOON COOKIE BURST");
        } else {
            this.score += 10;
            this.sdk.updateHUD(this.score);
            this.sdk.sound.playTap();
        }
        
        // Spawn particle pops
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: tx, y: ty,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                r: 3 + Math.random() * 3,
                life: 30,
                color: b.color
            });
        }
    },
    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    update() {
        if (Math.random() < 0.04) {
            const colors = ["#ef4444", "#3b82f6", "#10b981", "#a855f7", "#ec4899", "#f59e0b"];
            const isEgg = Math.random() < 0.03;
            this.balloons.push({
                x: 20 + Math.random() * 300,
                y: 430,
                r: 18 + Math.random() * 8,
                speed: 1.5 + Math.random() * 2.5,
                color: isEgg ? "#d97706" : colors[Math.floor(Math.random() * colors.length)],
                isCookie: isEgg
            });
        }
        
        // Move balloons up
        this.balloons.forEach(b => {
            b.y -= b.speed;
        });
        this.balloons = this.balloons.filter(b => b.y > -40);
        
        // Update particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    },
    endGame() {
        this.isRunning = false;
        this.destroy();
        this.sdk.gameOver({ score: this.score });
    },
    draw() {
        this.ctx.fillStyle = "#0f172a";
        this.ctx.fillRect(0,0,340,420);
        
        // Draw balloons
        this.balloons.forEach(b => {
            if (b.isCookie) {
                this.ctx.font = "24px sans-serif";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText("🍪", b.x, b.y);
            } else {
                this.ctx.fillStyle = b.color;
                this.ctx.beginPath();
                this.ctx.ellipse(b.x, b.y, b.r * 0.8, b.r, 0, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw small string line
            this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
            this.ctx.beginPath();
            this.ctx.moveTo(b.x, b.y + b.r);
            this.ctx.lineTo(b.x + Math.sin(b.y / 15) * 5, b.y + b.r + 15);
            this.ctx.stroke();
        });
        
        // Draw popping splash particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / 30;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });
    },
    pause() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
    },
    destroy() {
        this.pause();
        clearInterval(this.timerInterval);
    }
};

// ==========================================
// GAME 10: MINESWEEPER
// ==========================================
window.GameCollection["minesweeper"] = {
    name: "Minesweeper",
    icon: "brightness_low",
    color: "#fbbf24", // Yellow
    hasScore: true,
    hasTimer: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.rows = 8;
        this.cols = 8;
        this.mines = 10;
        this.firstClick = true;
        this.flagMode = false;
        this.undoStack = [];
        this.isRunning = true;
        
        this.container.innerHTML = `
            <div class="game-wrapper flex-col" style="padding:12px; display:flex; flex-direction:column; align-items:center; gap:10px; width:100%;">
                <div style="display:flex; justify-content:space-between; width:100%; max-width:320px; font-size:13px; font-weight:700;">
                    <div id="mines-count" style="display:flex; align-items:center; gap:4px;"> Bomber <span id="val-mines">${this.mines}</span></div>
                    <button id="btn-mine-flag" class="arcade-button" style="padding:4px 10px; width:auto; font-size:12px; border-radius:10px;">🚩 Flag: Off</button>
                </div>
                <div id="mines-grid" class="minesweeper-grid" style="grid-template-columns: repeat(${this.cols}, 1fr); width:100%; max-width:320px; aspect-ratio:1;"></div>
            </div>
        `;
        
        this.gridContainer = this.container.querySelector("#mines-grid");
        this.setupEvents();
        this.generateBoard();
        this.sdk.startTimer();
    },
    saveStateToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            grid: this.grid.map(row => row.map(cell => ({...cell}))),
            firstClick: this.firstClick
        }));
        if (this.undoStack.length > 25) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.grid = prevState.grid;
            this.firstClick = prevState.firstClick;
            this.isRunning = true;
            
            // Clean gameover dialogs
            window.Arcade.hideModals();
            
            this.sdk.sound.playTap();
            this.renderBoard();
            this.checkWinState();
            return true;
        }
        return false;
    },
    setupEvents() {
        const flagBtn = this.container.querySelector("#btn-mine-flag");
        flagBtn.onclick = () => {
            if (!this.isRunning) return;
            this.flagMode = !this.flagMode;
            flagBtn.innerHTML = `🚩 Flag: ${this.flagMode ? 'On' : 'Off'}`;
            flagBtn.style.borderColor = this.flagMode ? 'var(--accent-pink)' : 'var(--border-color)';
            this.sdk.sound.playTap();
        };
    },
    calculateAndSetScore() {
        if (!this.grid) return;
        let correctFlags = 0;
        let correctReveals = 0;
        this.grid.forEach(row => row.forEach(cell => {
            if (cell.flagged && cell.mine) {
                correctFlags++;
            }
            if (cell.revealed && !cell.mine) {
                correctReveals++;
            }
        }));
        this.score = (correctFlags * 10) + (correctReveals * 5);
        this.sdk.updateHUD(this.score);
    },
    generateBoard() {
        if (this.grid) {
            this.calculateAndSetScore();
        }
        this.score = 0;
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null).map(() => ({
            mine: false, revealed: false, flagged: false, count: 0
        })));
        this.firstClick = true;
        this.renderBoard();
        this.sdk.updateHUD(this.score);
    },
    placeMines(skipR, skipC) {
        let placed = 0;
        while (placed < this.mines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            
            // Skip target location for first-click safety checks
            if (!this.grid[r][c].mine && (Math.abs(r - skipR) > 1 || Math.abs(c - skipC) > 1)) {
                this.grid[r][c].mine = true;
                placed++;
            }
        }
        
        // Calc neighbor mine counts
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c].mine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc].mine) {
                            count++;
                        }
                    }
                }
                this.grid[r][c].count = count;
            }
        }
        
        // Hide a secret easter cookie on one of the non-mine safe tiles
        const safeCells = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.grid[r][c].mine) {
                    safeCells.push(this.grid[r][c]);
                }
            }
        }
        if (safeCells.length > 0) {
            const luckyCell = safeCells[Math.floor(Math.random() * safeCells.length)];
            luckyCell.easterCookie = true;
        }
    },
    updateMineCount() {
        let flaggedCount = 0;
        this.grid.forEach(row => row.forEach(cl => {
            if (cl.flagged) flaggedCount++;
        }));
        const valMines = this.container.querySelector("#val-mines");
        if (valMines) {
            valMines.innerText = Math.max(0, this.mines - flaggedCount);
        }
    },
    renderBoard() {
        this.gridContainer.innerHTML = "";
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                const box = document.createElement("div");
                box.className = "minesweeper-cell";
                if (cell.revealed) {
                    box.classList.add("revealed");
                    if (cell.mine) {
                        box.innerHTML = `<span style="font-size:20px; color:var(--accent-red);">💣</span>`;
                    } else if (cell.easterCookie) {
                        box.innerHTML = `<span style="font-size:20px;">🍪</span>`;
                    } else if (cell.count > 0) {
                        box.innerText = cell.count;
                        // Color indices
                        const colorMap = ["", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#a855f7", "#ec4899"];
                        box.style.color = colorMap[cell.count] || "#ffffff";
                    }
                } else if (cell.flagged) {
                    box.innerHTML = `<span style="font-size:18px; color:var(--accent-pink);">🚩</span>`;
                }
                
                box.onclick = () => this.handleCellClick(r, c);
                this.gridContainer.appendChild(box);
            }
        }
        this.updateMineCount();
    },
    handleCellClick(r, c) {
        if (!this.isRunning) return;
        const cell = this.grid[r][c];
        if (cell.revealed) return;
        
        if (this.flagMode) {
            this.saveStateToHistory();
            cell.flagged = !cell.flagged;
            this.sdk.sound.playFlag();
            this.renderBoard();
            this.calculateAndSetScore();
            return;
        }
        
        if (cell.flagged) return;
        
        this.saveStateToHistory();
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(r, c);
        }
        
        if (cell.mine) {
            this.isRunning = false;
            this.grid.forEach(row => row.forEach(cl => { if (cl.mine) cl.revealed = true; }));
            this.renderBoard();
            this.sdk.sound.playHit();
            this.sdk.sound.playLose();
            this.calculateAndSetScore();
            this.sdk.gameOver({ score: this.score }); // reveal failure gameover
        } else {
            this.revealCell(r, c);
            this.sdk.sound.playTap();
            this.renderBoard();
            this.calculateAndSetScore();
            this.checkWinState();
        }
    },
    revealCell(r, c) {
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
        const cell = this.grid[r][c];
        if (cell.revealed || cell.flagged || cell.mine) return;
        
        cell.revealed = true;
        if (cell.easterCookie) {
            cell.easterCookie = false;
            setTimeout(() => {
                window.triggerEasterEgg(500, "MINER'S LUCKY COOKIE");
            }, 50);
        }
        if (cell.count === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    this.revealCell(r + dr, c + dc);
                }
            }
        }
    },
    checkWinState() {
        let cellsLeft = 0;
        this.grid.forEach(row => row.forEach(cl => {
            if (!cl.revealed && !cl.mine) cellsLeft++;
        }));
        if (cellsLeft === 0) {
            this.isRunning = false;
            this.calculateAndSetScore();
            this.sdk.gameOver({ score: this.score, isBest: true });
        }
    },
    start() {
        this.isRunning = true;
    },
    pause() {
        this.isRunning = false;
        this.calculateAndSetScore();
    },
    destroy() {
        this.isRunning = false;
        this.calculateAndSetScore();
    }
};

// ==========================================
// GAME 12: MAZE CHASE GAME
// ==========================================
window.GameCollection["maze"] = {
    name: "Pac Man Lite",
    icon: "explore",
    color: "#e11d48",
    hasScore: true,
    hasLives: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        
        this.container.innerHTML = `
            <canvas id="maze-canvas" class="arcade-canvas" width="340" height="340" style="touch-action:none;"></canvas>
            <div style="margin-top: 10px; font-size: 11px; text-align: center; opacity: 0.8; font-weight: bold; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px;">
                👉 SWIPE anywhere on the canvas to move Pac-Man
            </div>
        `;
        
        this.canvas = this.container.querySelector("#maze-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.grid = [
            [1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,0,1,0,1,0,1,1,0,1],
            [1,0,1,0,0,0,0,1,0,1],
            [1,1,1,0,1,1,0,1,0,1],
            [1,0,0,0,0,1,0,0,0,1],
            [1,0,1,1,0,1,1,1,0,1],
            [1,0,1,0,0,0,1,0,0,1],
            [1,0,0,0,1,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.player = { x: 1, y: 1 };
        this.ghosts = [
            { x: 8, y: 8, dirX: -1, dirY: 0, color: "#ef4444" },
            { x: 8, y: 1, dirX: 0, dirY: 1, color: "#06b6d4" }
        ];
        
        this.score = 0;
        this.lives = 3;
        this.foods = [];
        this.isRunning = true;
        
        // Spawn pellets dynamically in empty corridors
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (this.grid[r][c] === 0) this.foods.push({ r, c });
            }
        }
        
        this.setupEvents();
        this.loop();
    },
    setupEvents() {
        const go = (dx, dy) => {
            const nx = this.player.x + dx;
            const ny = this.player.y + dy;
            if (this.grid[ny][nx] === 0) {
                this.player.x = nx;
                this.player.y = ny;
                this.sdk.sound.playTap();
                this.checkFoodEat();
            }
        };
        
        let swipeStartX = 0;
        let swipeStartY = 0;
        
        const onSwipeStart = (clientX, clientY) => {
            swipeStartX = clientX;
            swipeStartY = clientY;
        };
        
        const onSwipeEnd = (clientX, clientY) => {
            const dx = clientX - swipeStartX;
            const dy = clientY - swipeStartY;
            const dist = Math.hypot(dx, dy);
            if (dist < 18) return; // ignore static taps or minor micro-jitters
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) go(1, 0); // Right
                else go(-1, 0); // Left
            } else {
                if (dy > 0) go(0, 1); // Down
                else go(0, -1); // Up
            }
        };
        
        this.canvas.addEventListener("mousedown", (e) => onSwipeStart(e.clientX, e.clientY));
        this.canvas.addEventListener("mouseup", (e) => onSwipeEnd(e.clientX, e.clientY));
        
        this.canvas.addEventListener("touchstart", (e) => {
            if (e.touches.length > 0) {
                onSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        
        this.canvas.addEventListener("touchend", (e) => {
            if (e.changedTouches.length > 0) {
                onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        }, { passive: true });
        
        this.keyHandler = (e) => {
            if (e.key === "ArrowUp") go(0, -1);
            if (e.key === "ArrowDown") go(0, 1);
            if (e.key === "ArrowLeft") go(-1, 0);
            if (e.key === "ArrowRight") go(1, 0);
        };
        window.addEventListener("keydown", this.keyHandler);
    },
    checkFoodEat() {
        const idx = this.foods.findIndex(f => f.r === this.player.y && f.c === this.player.x);
        if (idx > -1) {
            this.foods.splice(idx, 1);
            this.score += 10;
            this.sdk.updateHUD(this.score, this.lives);
            this.sdk.sound.playMerge();
            
            if (this.foods.length === 0) {
                this.sdk.sound.playWin();
                this.sdk.gameOver({ score: this.score, isBest: true });
            }
        }
    },
    loop() {
        if (!this.isRunning) return;
        this.updateGhosts();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    updateGhosts() {
        // Slow speed updates
        if (Math.random() < 0.05) {
            this.ghosts.forEach(gh => {
                // Determine autonomous directions shifts
                const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
                const validDirs = dirs.filter(d => this.grid[gh.y + d.y][gh.x + d.x] === 0);
                if (validDirs.length > 0) {
                    const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
                    gh.x += chosen.x;
                    gh.y += chosen.y;
                }
                
                // Collision check
                if (gh.x === this.player.x && gh.y === this.player.y) {
                    this.hitPlayer();
                }
            });
        }
    },
    hitPlayer() {
        this.lives--;
        this.sdk.updateHUD(this.score, this.lives);
        this.sdk.sound.playHit();
        this.player = { x: 1, y: 1 }; // Reset pilot position
        if (this.lives <= 0) {
            this.isRunning = false;
            this.sdk.gameOver({ score: this.score });
        }
    },
    draw() {
        const cellS = 34;
        this.ctx.fillStyle = "#0c101b";
        this.ctx.fillRect(0,0,340,340);
        
        // Draw corridors vs barriers
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 10; c++) {
                if (this.grid[r][c] === 1) {
                    this.ctx.fillStyle = "#3b82f6";
                    this.ctx.fillRect(c * cellS, r * cellS, cellS - 1, cellS - 1);
                }
            }
        }
        
        // Draw pellets food
        this.ctx.fillStyle = "#fdba74";
        this.foods.forEach(f => {
            this.ctx.beginPath();
            this.ctx.arc(f.c * cellS + cellS/2, f.r * cellS + cellS/2, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw pilot
        this.ctx.fillStyle = "#facc15";
        this.ctx.beginPath();
        this.ctx.arc(this.player.x * cellS + cellS/2, this.player.y * cellS + cellS/2, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw ghosts
        this.ghosts.forEach(gh => {
            this.ctx.fillStyle = gh.color;
            this.ctx.beginPath();
            this.ctx.arc(gh.x * cellS + cellS/2, gh.y * cellS + cellS/2, 11, 0, Math.PI * 2);
            this.ctx.fill();
        });
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
// GAME 13: CRICKET GAME
// ==========================================
window.GameCollection["cricket"] = {
    name: "Arcade Cricket",
    icon: "sports_cricket",
    color: "#f59e0b",
    hasScore: true,
    hasLives: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.wickets = 3; // live counters
        
        this.container.innerHTML = `
            <canvas id="cricket-canvas" class="arcade-canvas" width="340" height="260"></canvas>
            <div style="display:flex; justify-content:center; width:100%; margin-top:8px;">
                <button id="btn-cricket-swing" class="action-big-btn">SWING</button>
            </div>
        `;
        
        this.canvas = this.container.querySelector("#cricket-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.ball = { x: 170, y: 20, r: 8, speed: 4, active: false };
        this.swingArea = { y: 200, h: 40 };
        this.isRunning = true;
        this.isSwinging = false;
        this.swingFrame = 0;
        
        this.setupEvents();
        this.throwBall();
        this.loop();
    },
    setupEvents() {
        const swing = () => {
            if (!this.ball.active) return;
            this.isSwinging = true;
            this.swingFrame = 0;
            
            // Check timing hits bounding swing indicators
            if (this.ball.y > this.swingArea.y && this.ball.y < this.swingArea.y + this.swingArea.h) {
                // Safe hits! Determine scores based on accuracy limits
                const diff = Math.abs(this.ball.y - 220); // ideal coordinate match center
                let runs = 1;
                if (diff < 5) runs = 6;
                else if (diff < 12) runs = 4;
                else if (diff < 20) runs = 2;
                
                this.score += runs;
                this.sdk.updateHUD(this.score, this.wickets);
                this.sdk.sound.playMerge();
                this.flashSuccessText(`+${runs} runs!`);
            } else {
                this.failSwipe();
            }
            this.ball.active = false;
            setTimeout(() => this.throwBall(), 1000);
        };
        this.container.querySelector("#btn-cricket-swing").onclick = swing;
    },
    throwBall() {
        this.ball.x = 170;
        this.ball.y = 20;
        // Randomize speed slightly between 3.3 and 5.5
        this.ball.speed = 3.3 + Math.random() * 2.2;
        this.ball.active = true;
    },
    failSwipe() {
        this.wickets--;
        this.sdk.updateHUD(this.score, this.wickets);
        this.sdk.sound.playHit();
        this.flashSuccessText("OUT!");
        if (this.wickets <= 0) {
            this.isRunning = false;
            this.sdk.gameOver({ score: this.score });
        }
    },
    flashSuccessText(txt) {
        this.flashText = txt;
        setTimeout(() => { if (this.flashText === txt) this.flashText = null; }, 800);
    },
    loop() {
        if (!this.isRunning) return;
        this.updateBall();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    },
    updateBall() {
        if (this.ball.active) {
            this.ball.y += this.ball.speed;
            if (this.ball.y > 260) {
                this.ball.active = false;
                this.failSwipe();
                setTimeout(() => this.throwBall(), 1000);
            }
        }
    },
    draw() {
        // Aesthetic lawn patterns (Google Doodle style)
        this.ctx.fillStyle = "#16a34a"; // green field
        this.ctx.fillRect(0,0,340,260);
        this.ctx.fillStyle = "#15803d"; // dark lawn stripes
        for (let i = 0; i < 340; i += 40) {
            this.ctx.fillRect(i, 0, 20, 260);
        }
        
        // Bowler snail at top
        this.ctx.font = "28px Arial";
        this.ctx.fillText("🐌", 155, 36);
        
        // Draw elegant white batting crease line
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(90, 220, 160, 3);
        
        // Draw perfect target ring around sweet spot (220)
        this.ctx.strokeStyle = "rgba(253, 224, 71, 0.4)";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(170, 220, 24, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Batter wickets rods behind grasshopper
        this.ctx.fillStyle = "#facc15";
        this.ctx.fillRect(190, 210, 3, 24);
        this.ctx.fillRect(196, 210, 3, 24);
        this.ctx.fillRect(202, 210, 3, 24);
        this.ctx.fillStyle = "#eab308";
        this.ctx.fillRect(188, 207, 18, 3);
        
        // Rhythm timing ring helper
        if (this.ball.active) {
            const dist = Math.abs(this.ball.y - 220);
            if (this.ball.y < 220) {
                // Shrinking circle indicator matching the ball
                this.ctx.strokeStyle = "rgb(253, 224, 71)";
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(170, 220, 8 + dist * 0.45, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // Flashing SWING indicator cue
        if (this.ball.active && this.ball.y > 195 && this.ball.y < 235) {
            this.ctx.fillStyle = "#facc15";
            this.ctx.font = "bold 13px system-ui";
            this.ctx.textAlign = "center";
            this.ctx.fillText("🔥 SWING NOW! 🔥", 170, 175);
            
            // Highly visible glowing indicator ring
            this.ctx.strokeStyle = "#eab308";
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.arc(170, 220, 24, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Active red leather ball
        if (this.ball.active) {
            this.ctx.fillStyle = "#ef4444";
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Grasshopper & Bat Swing anim
        this.ctx.save();
        this.ctx.translate(145, 220);
        let angle = 0.5; // rest angle
        if (this.isSwinging) {
            this.swingFrame++;
            angle = -1.4 + (this.swingFrame * 0.16); // Swing animation rotation
            if (this.swingFrame > 15) {
                this.isSwinging = false;
            }
        }
        this.ctx.rotate(angle);
        this.ctx.font = "32px Arial";
        this.ctx.fillText("🏏", -12, 12);
        this.ctx.restore();
        
        // Grasshopper batsman
        this.ctx.font = "30px Arial";
        this.ctx.fillText("🦗", 130, 235);
        
        // Overlay flash triggers score displays
        if (this.flashText) {
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "bold 26px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.flashText, 170, 120);
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
// GAME 14: SNAKE
// ==========================================
window.GameCollection["snake"] = {
    name: "Retro Snake",
    icon: "star",
    color: "#10b981",
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.gridSize = 20;
        this.gridCount = 15;
        this.snake = [{x: 7, y: 7}];
        this.food = { x: 3, y: 3 };
        this.isCookieFood = false;
        this.dir = { x: 0, y: 0 }; // Default static to prevent starting movement crash
        this.score = 0;
        this.speed = 150; // loop interval
        this.isRunning = true;
        this.undoStack = [];
        
        this.container.innerHTML = `
            <canvas id="snake-canvas" class="arcade-canvas" width="300" height="300" style="touch-action:none;"></canvas>
            <div style="margin-top: 10px; font-size: 11px; text-align: center; opacity: 0.8; font-weight: bold; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; max-width: 300px; margin-left: auto; margin-right: auto;">
                👉 SWIPE anywhere on the canvas to turn the snake
            </div>
        `;
        
        this.canvas = this.container.querySelector("#snake-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.setupEvents();
        this.spawnFood();
        this.draw(); // Pre-draw static position for instant visibility!
        this.startGameLoop();
    },
    saveStateToHistory() {
        if (!this.undoStack) this.undoStack = [];
        this.undoStack.push(JSON.stringify({
            snake: this.snake.map(segment => ({...segment})),
            food: {...this.food},
            dir: {...this.dir},
            score: this.score
        }));
        if (this.undoStack.length > 80) this.undoStack.shift();
    },
    undo() {
        if (this.undoStack && this.undoStack.length > 0) {
            const prevState = JSON.parse(this.undoStack.pop());
            this.snake = prevState.snake;
            this.food = prevState.food;
            this.dir = prevState.dir;
            this.score = prevState.score;
            
            this.sdk.updateHUD(this.score);
            
            // If crashed (not running), restart loop gracefully
            if (!this.isRunning) {
                this.isRunning = true;
                window.Arcade.hideModals();
                this.startGameLoop();
            }
            
            this.sdk.sound.playTap();
            this.draw();
            return true;
        }
        return false;
    },
    setupEvents() {
        const turn = (x, y) => {
            // block reverse turns (180 degree turns)
            if (this.dir.x === 0 && this.dir.y === 0) {
                this.dir = { x, y };
                this.sdk.sound.playTap();
            } else if (!(this.dir.x === -x && this.dir.y === -y)) {
                this.dir = { x, y };
                this.sdk.sound.playTap();
            }
        };
        
        let swipeStartX = 0;
        let swipeStartY = 0;
        
        const onSwipeStart = (clientX, clientY) => {
            swipeStartX = clientX;
            swipeStartY = clientY;
        };
        
        const onSwipeEnd = (clientX, clientY) => {
            const dx = clientX - swipeStartX;
            const dy = clientY - swipeStartY;
            const dist = Math.hypot(dx, dy);
            if (dist < 18) return; // ignore short static taps
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) turn(1, 0); // Right
                else turn(-1, 0); // Left
            } else {
                if (dy > 0) turn(0, 1); // Down
                else turn(0, -1); // Up
            }
        };
        
        this.canvas.addEventListener("mousedown", (e) => onSwipeStart(e.clientX, e.clientY));
        this.canvas.addEventListener("mouseup", (e) => onSwipeEnd(e.clientX, e.clientY));
        
        this.canvas.addEventListener("touchstart", (e) => {
            if (e.touches.length > 0) {
                onSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        
        this.canvas.addEventListener("touchend", (e) => {
            if (e.changedTouches.length > 0) {
                onSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        }, { passive: true });
        
        this.keyHandler = (e) => {
            if (e.key === "ArrowUp") turn(0, -1);
            if (e.key === "ArrowDown") turn(0, 1);
            if (e.key === "ArrowLeft") turn(-1, 0);
            if (e.key === "ArrowRight") turn(1, 0);
        };
        window.addEventListener("keydown", this.keyHandler);
    },
    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * this.gridCount),
            y: Math.floor(Math.random() * this.gridCount)
        };
        // 5% chance to spawn an easter cookie!
        this.isCookieFood = Math.random() < 0.05;
    },
    startGameLoop() {
        this.intervalId = setInterval(() => {
            if (!this.isRunning) return;
            this.move();
            this.draw();
        }, this.speed);
    },
    move() {
        if (this.dir.x === 0 && this.dir.y === 0) return; // Wait for initial direction
        this.saveStateToHistory();
        const head = this.snake[0];
        const nextHead = {
            x: head.x + this.dir.x,
            y: head.y + this.dir.y
        };
        
        // Wall boundaries wrappers check
        if (nextHead.x < 0 || nextHead.x >= this.gridCount || nextHead.y < 0 || nextHead.y >= this.gridCount) {
            this.crash();
            return;
        }
        
        // Tail collision checks
        if (this.snake.some(segment => segment.x === nextHead.x && segment.y === nextHead.y)) {
            this.crash();
            return;
        }
        
        this.snake.unshift(nextHead);
        
        // Check food feeds
        if (nextHead.x === this.food.x && nextHead.y === this.food.y) {
            if (this.isCookieFood) {
                window.triggerEasterEgg(500, "SNAKE COOKIE MASTER");
                this.isCookieFood = false;
            } else {
                this.score += 10;
                this.sdk.updateHUD(this.score);
                this.sdk.sound.playMerge();
            }
            this.spawnFood();
        } else {
            this.snake.pop(); // remove tail node
        }
    },
    crash() {
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.sdk.sound.playLose();
        this.sdk.gameOver({ score: this.score });
    },
    draw() {
        this.ctx.fillStyle = "#1e293b";
        this.ctx.fillRect(0,0,300,300);
        
        // Draw fruit apple
        if (this.isCookieFood) {
            this.ctx.font = "16px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText("🍪", this.food.x * this.gridSize + this.gridSize/2, this.food.y * this.gridSize + this.gridSize/2);
        } else {
            this.ctx.fillStyle = "#ef4444";
            this.ctx.fillRect(this.food.x * this.gridSize + 2, this.food.y * this.gridSize + 2, this.gridSize - 4, this.gridSize - 4);
        }
        
        // Draw full snake structures - Replaced CSS variables with solid hex colors
        this.snake.forEach((segment, idx) => {
            this.ctx.fillStyle = idx === 0 ? "#10b981" : "#22c55e"; // clear green head and bodies
            this.ctx.fillRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
        });
    },
    pause() {
        this.isRunning = false;
    },
    destroy() {
        clearInterval(this.intervalId);
        window.removeEventListener("keydown", this.keyHandler);
    }
};
