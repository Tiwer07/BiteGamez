/**
 * BiteGamez - 6 New Games Expansion Package
 * ARCHERY MASTER, KNIFE HIT, BOTTLE FLIP, PIPE CONNECT, CLOUD ADVENTURE, FISHING FRENZY
 */

// 1. ARCHERY MASTER (Category: Skill)
window.GameCollection["archerymaster"] = {
    name: "Archery Master",
    category: "Skill",
    icon: "sports_cricket", // fallbacks to Sports/Skill arrow-like icon
    color: "#f59e0b", // Amber
    hasScore: true,
    hasTimer: false,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.arrowsLeft = 10;
        this.mode = null; // 'target_practice' or 'endless'
        this.wind = 0; // horizontal wind force
        
        this.container.innerHTML = `
            <div id="archery-menu" class="arcade-menu" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 16px;">
                <h3 class="arcade-title-neon" style="color: #f59e0b; margin-bottom: 12px;">ARCHERY MASTER</h3>
                <p style="font-size: 13px; color: var(--text-secondary); text-align: center; max-width: 260px; margin-bottom: 12px;">Choose your game mode to pull back the string!</p>
                <button id="btn-mode-target" class="arcade-button primary" style="width: 220px;">🎯 Target Practice</button>
                <button id="btn-mode-endless" class="arcade-button" style="width: 220px; border: 1px solid #f59e0b; color: #f59e0b;">🌪️ Endless Challenge</button>
            </div>
            <div id="archery-gameplay" class="hidden" style="position: relative; width: 100%; height: 100%;">
                <div id="archery-wind-indicator" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; color: #38bdf8;"></div>
                <div id="archery-arrows-indicator" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: bold; color: #f43f5e;">🏹 Arrows: 10/10</div>
                <canvas id="archery-canvas" class="arcade-canvas" width="340" height="420" style="display: block; background: linear-gradient(to bottom, #0f172a 0%, #1e1b4b 100%);"></canvas>
            </div>
        `;
        
        container.querySelector("#btn-mode-target").onclick = () => this.startGame("target_practice");
        container.querySelector("#btn-mode-endless").onclick = () => this.startGame("endless");
    },
    startGame(mode) {
        this.sdk.sound.playSelect();
        this.mode = mode;
        this.score = 0;
        this.arrowsLeft = 10;
        this.wind = mode === 'endless' ? (Math.random() * 0.4 - 0.2) : 0;
        
        this.container.querySelector("#archery-menu").classList.add("hidden");
        this.container.querySelector("#archery-gameplay").classList.remove("hidden");
        
        this.canvas = this.container.querySelector("#archery-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.updateIndicators();
        
        // Bow and arrow physics setup
        this.bowX = 40;
        this.bowY = 215;
        this.target = { x: 300, y: 215, r: 40, vy: 0 };
        this.resetArrow();
        
        this.dragStart = null;
        this.dragCurrent = null;
        this.isDragging = false;
        
        this.setupEvents();
        this.sdk.updateHUD(this.score);
        
        this.isRunning = true;
        this.loop();
    },
    resetArrow() {
        this.arrow = {
            x: this.bowX,
            y: this.bowY,
            vx: 0,
            vy: 0,
            angle: 0,
            launched: false,
            trail: []
        };
        if (this.mode === 'endless') {
            this.wind = (Math.random() * 0.6 - 0.3); // update wind force
            // randomize target height
            this.target.y = 100 + Math.random() * 220;
            // moving target on higher skill score
            if (this.score >= 120) {
                this.target.vy = (Math.random() < 0.5 ? -1.2 : 1.2) * (1 + this.score / 500);
            } else {
                this.target.vy = 0;
            }
        } else {
            this.target.y = 120 + Math.random() * 180;
            this.target.vy = 0;
        }
        this.updateIndicators();
    },
    updateIndicators() {
        const windEl = this.container.querySelector("#archery-wind-indicator");
        const arrowsEl = this.container.querySelector("#archery-arrows-indicator");
        
        if (this.mode === 'endless') {
            const windVal = Math.abs(this.wind * 40).toFixed(1);
            const windDir = this.wind > 0 ? "▶" : "◀";
            windEl.innerHTML = `💨 Wind: ${windDir} ${windVal} m/s`;
            windEl.style.display = 'block';
        } else {
            windEl.style.display = 'none';
        }
        arrowsEl.innerHTML = `🏹 Arrows: ${this.arrowsLeft}/10`;
    },
    setupEvents() {
        const handleStart = (cx, cy) => {
            if (this.arrow.launched) return;
            const rect = this.canvas.getBoundingClientRect();
            const tx = (cx - rect.left) * (340 / rect.width);
            const ty = (cy - rect.top) * (420 / rect.height);
            
            // Check if tap is near the bow area
            if (Math.hypot(tx - this.bowX, ty - this.bowY) < 60) {
                this.dragStart = { x: tx, y: ty };
                this.dragCurrent = { x: tx, y: ty };
                this.isDragging = true;
                this.sdk.sound.playTap();
            }
        };
        
        const handleMove = (cx, cy) => {
            if (!this.isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            this.dragCurrent = {
                x: (cx - rect.left) * (340 / rect.width),
                y: (cy - rect.top) * (420 / rect.height)
            };
        };
        
        const handleEnd = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            // Calculate launch vectors based on drag offsets
            const dx = this.dragStart.x - this.dragCurrent.x;
            const dy = this.dragStart.y - this.dragCurrent.y;
            const dist = Math.min(100, Math.hypot(dx, dy));
            
            if (dist > 15) {
                // Launch!
                this.arrow.launched = true;
                const angle = Math.atan2(dy, dx);
                const power = (dist / 100) * 11 + 3;
                this.arrow.vx = Math.cos(angle) * power;
                this.arrow.vy = Math.sin(angle) * power;
                this.sdk.sound.playJump();
            } else {
                this.dragStart = null;
                this.dragCurrent = null;
            }
        };
        
        this.canvas.onmousedown = (e) => handleStart(e.clientX, e.clientY);
        this.canvas.onmousemove = (e) => handleMove(e.clientX, e.clientY);
        window.addEventListener("mouseup", handleEnd);
        
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        this.canvas.ontouchend = (e) => {
            e.preventDefault();
            handleEnd();
        };
        
        this._windowMouseUp = handleEnd; // capture references for clean destruction
    },
    loop() {
        if (!this.isRunning) return;
        this.ctx.clearRect(0, 0, 340, 420);
        
        // Update Target (moving in endless mode)
        if (this.target.vy !== 0) {
            this.target.y += this.target.vy;
            if (this.target.y - this.target.r < 40 || this.target.y + this.target.r > 380) {
                this.target.vy *= -1;
            }
        }
        
        // Draw Target
        const t = this.target;
        this.ctx.lineWidth = 1;
        // White outer ring
        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath(); this.ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); this.ctx.fill();
        // Blue ring
        this.ctx.fillStyle = "#3b82f6";
        this.ctx.beginPath(); this.ctx.arc(t.x, t.y, t.r * 0.75, 0, Math.PI * 2); this.ctx.fill();
        // Red ring
        this.ctx.fillStyle = "#f43f5e";
        this.ctx.beginPath(); this.ctx.arc(t.x, t.y, t.r * 0.45, 0, Math.PI * 2); this.ctx.fill();
        // Yellow center (bullseye)
        this.ctx.fillStyle = "#fbbf24";
        this.ctx.beginPath(); this.ctx.arc(t.x, t.y, t.r * 0.15, 0, Math.PI * 2); this.ctx.fill();
        
        // Update & Draw Arrow
        if (this.arrow.launched) {
            this.arrow.vy += 0.16; // gravity
            if (this.mode === 'endless') {
                this.arrow.vx += this.wind * 0.08; // moderate wind force acceleration
            }
            this.arrow.x += this.arrow.vx;
            this.arrow.y += this.arrow.vy;
            this.arrow.angle = Math.atan2(this.arrow.vy, this.arrow.vx);
            
            // Save trail
            this.arrow.trail.push({ x: this.arrow.x, y: this.arrow.y });
            if (this.arrow.trail.length > 8) this.arrow.trail.shift();
            
            // Draw trail
            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(226, 232, 240, 0.2)";
            this.ctx.lineWidth = 2;
            this.arrow.trail.forEach((p, idx) => {
                if (idx === 0) this.ctx.moveTo(p.x, p.y);
                else this.ctx.lineTo(p.x, p.y);
            });
            this.ctx.stroke();
            
            // Draw arrow spear
            this.ctx.save();
            this.ctx.translate(this.arrow.x, this.arrow.y);
            this.ctx.rotate(this.arrow.angle);
            
            this.ctx.strokeStyle = "#e2e8f0";
            this.ctx.lineWidth = 3;
            // Shaft
            this.ctx.beginPath(); this.ctx.moveTo(-20, 0); this.ctx.lineTo(10, 0); this.ctx.stroke();
            // Arrowhead
            this.ctx.fillStyle = "#fbbf24";
            this.ctx.beginPath(); this.ctx.moveTo(10, -4); this.ctx.lineTo(18, 0); this.ctx.lineTo(10, 4); this.ctx.closePath(); this.ctx.fill();
            // Fletching (feathers)
            this.ctx.fillStyle = "#f43f5e";
            this.ctx.beginPath(); this.ctx.moveTo(-20, -4); this.ctx.lineTo(-12, -4); this.ctx.lineTo(-16, 0); this.ctx.lineTo(-12, 4); this.ctx.lineTo(-20, 4); this.ctx.closePath(); this.ctx.fill();
            this.ctx.restore();
            
            // Collision Detection with Target
            if (this.arrow.x >= t.x - 8 && this.arrow.x <= t.x + 8) {
                const distY = Math.abs(this.arrow.y - t.y);
                if (distY <= t.r) {
                    this.arrow.launched = false; // hit target
                    this.calculatePoints(distY);
                }
            } else if (this.arrow.x > 360 || this.arrow.y > 430) {
                // Out of screen -> miss!
                this.arrowsLeft--;
                if (this.arrowsLeft <= 0) {
                    this.endGame();
                } else {
                    this.sdk.sound.playLose();
                    this.resetArrow();
                }
            }
        } else {
            // Draw Bow (unlaunched state)
            this.ctx.save();
            this.ctx.translate(this.bowX, this.bowY);
            
            let rotation = 0;
            let stretch = 0;
            if (this.isDragging && this.dragStart && this.dragCurrent) {
                const dx = this.dragStart.x - this.dragCurrent.x;
                const dy = this.dragStart.y - this.dragCurrent.y;
                rotation = Math.atan2(dy, dx);
                stretch = Math.min(40, Math.hypot(dx, dy));
            }
            this.ctx.rotate(rotation);
            
            // Bow string (stretched line)
            this.ctx.strokeStyle = "#94a3b8";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -40);
            this.ctx.lineTo(-stretch * 0.9, 0);
            this.ctx.lineTo(0, 40);
            this.ctx.stroke();
            
            // Wooden arc bow
            this.ctx.strokeStyle = "#854d0e"; // Brown wood
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 40, -Math.PI / 2, Math.PI / 2);
            this.ctx.stroke();
            
            // Aiming arrow resting on bow
            this.ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(-stretch, 0);
            this.ctx.lineTo(25 - stretch * 0.1, 0);
            this.ctx.stroke();
            // Arrow tip helper
            this.ctx.fillStyle = "#fbbf24";
            this.ctx.beginPath();
            this.ctx.moveTo(25 - stretch * 0.1, -3);
            this.ctx.lineTo(31 - stretch * 0.1, 0);
            this.ctx.lineTo(25 - stretch * 0.1, 3);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
        
        requestAnimationFrame(() => this.loop());
    },
    calculatePoints(distY) {
        let earned = 0;
        let label = "GOOD SHOT!";
        const r = this.target.r;
        
        if (distY <= r * 0.15) {
            earned = 100;
            label = "🎯 BULLSEYE!";
            this.sdk.sound.playWin();
            window.burstEmoji("🍪", this.arrow.x, this.arrow.y);
        } else if (distY <= r * 0.45) {
            earned = 50;
            label = "🔥 INNER RED!";
            this.sdk.sound.playMerge();
        } else if (distY <= r * 0.75) {
            earned = 20;
            label = "🎯 BLUE RING";
            this.sdk.sound.playTap();
        } else {
            earned = 10;
            label = "OUTER MATCH";
            this.sdk.sound.playTap();
        }
        
        this.score += earned;
        this.sdk.updateHUD(this.score);
        
        // Flash HUD label on target
        this.showFloatLabel(label, this.target.x - 30, this.target.y - 45);
        
        setTimeout(() => {
            if (this.isRunning) {
                this.resetArrow();
            }
        }, 800);
    },
    showFloatLabel(txt, x, y) {
        this.floatingText = { text: txt, x, y, opacity: 1, timer: 45 };
    },
    endGame() {
        this.isRunning = false;
        this.sdk.gameOver({
            score: this.score,
            title: "VALIANT ARCHER!",
            label: "ARCHER FINISHED"
        });
    },
    destroy() {
        this.isRunning = false;
        if (this._windowMouseUp) {
            window.removeEventListener("mouseup", this._windowMouseUp);
        }
    }
};

// 2. KNIFE HIT (Category: Arcade)
window.GameCollection["knifehit"] = {
    name: "Knife Hit",
    category: "Arcade",
    icon: "layers",
    color: "#e11d48", // Rose Red
    hasScore: true,
    hasLevel: true,
    saveGameState() {
        if (!this.isRunning) return;
        try {
            const state = {
                score: this.score,
                stage: this.stage,
                thrownKnives: this.thrownKnives,
                logAngle: this.log.angle,
                logSpeed: this.log.speed,
                knivesToThrow: this.knivesToThrow
            };
            localStorage.setItem("game_state_knifehit", JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save knifehit state", e);
        }
    },
    clearGameState() {
        localStorage.removeItem("game_state_knifehit");
    },
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.stage = 1;
        this.knivesToThrow = 8;
        this.isRunning = true;
        this.isLoopActive = false;
        
        this.container.innerHTML = `
            <div id="knife-indicator-bar" style="position: absolute; bottom: 80px; left: 16px; display: flex; flex-direction: column; gap: 4px; z-index: 10;">
                <!-- Dynamically filled with mini knives icons -->
            </div>
            <div id="boss-alert-banner" class="hidden" style="position: absolute; top: 70px; left: 50%; transform: translateX(-50%); background: radial-gradient(circle, #b91c1c 0%, #7f1d1d 100%); color: white; padding: 6px 20px; border-radius: 12px; font-size: 13px; font-weight: 900; letter-spacing: 1px; z-index: 20; border: 1px solid #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); text-align: center;">🛡️ BOSS CHALLENGE!</div>
            <canvas id="knife-canvas" class="arcade-canvas" width="340" height="420" style="display: block; background: linear-gradient(135deg, #090d16 0%, #111827 100%);"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#knife-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.log = {
            x: 170,
            y: 135,
            r: 58,
            angle: 0,
            speed: 0.035,
            bossName: ""
        };
        
        this.thrownKnives = []; // details of knives stuck in wood log { angle }
        this.flyingKnife = null; // any current traveling knife y segment
        
        const saved = localStorage.getItem("game_state_knifehit");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.score = state.score || 0;
                this.stage = state.stage || 1;
                this.thrownKnives = state.thrownKnives || [];
                this.log.angle = state.logAngle || 0;
                this.log.speed = state.logSpeed || 0.035;
                this.knivesToThrow = state.knivesToThrow !== undefined ? state.knivesToThrow : 8;
                
                const banner = this.container.querySelector("#boss-alert-banner");
                if (banner) {
                    banner.classList.add("hidden");
                }
                this.renderKnifeIndicator();
            } catch (e) {
                console.error("Failed to load saved knifehit state", e);
                this.setupStage();
            }
        } else {
            this.setupStage();
        }
        
        this.setupEvents();
        this.sdk.updateHUD(this.score, null, this.stage);
        
        this.isLoopActive = true;
        this.loop();
    },
    setupStage() {
        this.thrownKnives = [];
        this.flyingKnife = null;
        this.log.angle = 0;
        
        const banner = this.container.querySelector("#boss-alert-banner");
        if (banner) {
            banner.classList.add("hidden");
        }
        
        this.knivesToThrow = 8; // Reset knives to throw for this stage
        this.log.speed = 0.03 + (this.stage * 0.0035);
        this.log.bossName = "";
        
        // Randomly pre-place some knives/obstacles to make the level interesting (more knives on higher stages)
        const count = Math.random() < 0.3 ? 0 : (Math.random() < 0.75 ? 1 : (this.stage < 3 ? 1 : 2));
        for (let i = 0; i < count; i++) {
            // Keep them spread out reasonably
            this.thrownKnives.push({ angle: (i * Math.PI) + (Math.random() * 1.5) });
        }
        
        this.renderKnifeIndicator();
        this.saveGameState();
    },
    renderKnifeIndicator() {
        const bar = this.container.querySelector("#knife-indicator-bar");
        if (bar) {
            bar.innerHTML = `<div style="text-align:center; color:#fda4af; font-size:11px; font-weight:900; filter:drop-shadow(0px 2px 2px rgba(0,0,0,0.8)); margin-bottom:2px;">STG ${this.stage}</div>`;
            for (let i = 0; i < this.knivesToThrow; i++) {
                bar.insertAdjacentHTML("beforeend", `<span style="font-size: 16px; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.8)); opacity: 1;">🗡️</span>`);
            }
        }
    },
    setupEvents() {
        const handleTap = () => {
            if (!this.isRunning || this.flyingKnife || this.knivesToThrow <= 0) return;
            
            this.knivesToThrow--;
            this.renderKnifeIndicator();
            
            // Launch knife with high velocity for instantaneous response and zero delays
            this.flyingKnife = { x: 170, y: 360, speed: 38.5 };
            this.sdk.sound.playJump();
        };
        this.canvas.onmousedown = handleTap;
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            handleTap();
        };
    },
    loop() {
        if (!this.isRunning) {
            this.isLoopActive = false;
            return;
        }
        this.isLoopActive = true;
        this.ctx.clearRect(0, 0, 340, 420);
        
        // 1. Rotation logic (fluctuates, changes directions over stages!)
        let t = Date.now() / 1000;
        let activeSpeed = this.log.speed;
        if (this.stage >= 2) {
            // Direction shift oscillating sine wave
            activeSpeed = this.log.speed * Math.sin(t * (this.stage % 3 === 0 ? 1.8 : 0.9));
        }
        
        this.log.angle = (this.log.angle + activeSpeed + Math.PI * 2) % (Math.PI * 2);
        
        // Draw wood target log ring shadow
        this.ctx.fillStyle = "rgba(0,0,0,0.4)";
        this.ctx.beginPath(); this.ctx.arc(this.log.x, this.log.y + 6, this.log.r + 3, 0, Math.PI * 2); this.ctx.fill();
        
        // Draw Wooden Log / Ring
        const isBoss = false;
        this.ctx.save();
        this.ctx.translate(this.log.x, this.log.y);
        this.ctx.rotate(this.log.angle);
        
        // Main wheel
        this.ctx.fillStyle = isBoss ? "#422006" : "#713f12"; // dark brown vs medium brown
        this.ctx.beginPath(); this.ctx.arc(0, 0, this.log.r, 0, Math.PI * 2); this.ctx.fill();
        
        this.ctx.strokeStyle = isBoss ? "#b91c1c" : "#a16207"; // red outer border for bosses
        this.ctx.lineWidth = 6;
        this.ctx.stroke();
        
        // Inner rings
        this.ctx.strokeStyle = isBoss ? "#dc2626" : "#ca8a04";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath(); this.ctx.arc(0, 0, this.log.r * 0.7, 0, Math.PI * 2); this.ctx.stroke();
        this.ctx.beginPath(); this.ctx.arc(0, 0, this.log.r * 0.4, 0, Math.PI * 2); this.ctx.stroke();
        
        // Wood grain radiating lines
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(i * Math.PI / 4) * this.log.r, Math.sin(i * Math.PI / 4) * this.log.r);
            this.ctx.stroke();
        }
        
        // Draw Boss face features if boss
        if (isBoss) {
            this.ctx.fillStyle = "white";
            // eyes
            this.ctx.beginPath(); this.ctx.arc(-20, -10, 8, 0, Math.PI*2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(20, -10, 8, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "black";
            this.ctx.beginPath(); this.ctx.arc(-18, -10, 4, 0, Math.PI*2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(18, -10, 4, 0, Math.PI*2); this.ctx.fill();
            // Angry mouth
            this.ctx.strokeStyle = "#dc2626";
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(0, 15, 12, Math.PI, 0);
            this.ctx.stroke();
        } else {
            // Draw regular cute face
            this.ctx.fillStyle = "#fef08a";
            this.ctx.beginPath(); this.ctx.arc(-14, -8, 5, 0, Math.PI*2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(14, -8, 5, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "#1e293b";
            this.ctx.beginPath(); this.ctx.arc(-12, -8, 2.5, 0, Math.PI*2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(16, -8, 2.5, 0, Math.PI*2); this.ctx.fill();
            // Smile
            this.ctx.strokeStyle = "#1e293b";
            this.ctx.lineWidth = 3;
            this.ctx.beginPath(); this.ctx.arc(0, 6, 8, 0, Math.PI); this.ctx.stroke();
        }
        
        // Draw Stuck knives pointing outward (rotated with wheel)
        this.thrownKnives.forEach(k => {
            this.ctx.save();
            this.ctx.rotate(k.angle);
            
            // Draw stuck knife at bottom of rotated coordinates
            this.ctx.translate(0, this.log.r);
            
            // Blade
            this.ctx.fillStyle = "#cbd5e1"; // Steel gray
            this.ctx.beginPath();
            this.ctx.moveTo(-3, 0); this.ctx.lineTo(3, 0); this.ctx.lineTo(2, 34); this.ctx.lineTo(-2, 34);
            this.ctx.closePath(); this.ctx.fill();
            
            // Red guard band
            this.ctx.fillStyle = "#e11d48";
            this.ctx.fillRect(-5, 34, 10, 4);
            
            // Handle brown wood
            this.ctx.fillStyle = "#f59e0b";
            this.ctx.fillRect(-2.5, 38, 5, 12);
            
            this.ctx.restore();
        });
        
        this.ctx.restore();
        
        // 2. Flying Active Knife
        if (this.flyingKnife) {
            this.flyingKnife.y -= this.flyingKnife.speed;
            
            // Render active traveling knife
            const k = this.flyingKnife;
            this.ctx.save();
            this.ctx.translate(k.x, k.y);
            
            // Blade pointing up
            this.ctx.fillStyle = "#cbd5e1";
            this.ctx.beginPath();
            this.ctx.moveTo(-4, 0); this.ctx.lineTo(4, 0); this.ctx.lineTo(3, -34); this.ctx.lineTo(-3, -34);
            this.ctx.closePath(); this.ctx.fill();
            
            this.ctx.fillStyle = "#ef4444";
            this.ctx.fillRect(-6, 0, 12, 4);
            
            this.ctx.fillStyle = "#d97706";
            this.ctx.fillRect(-3, 4, 6, 12);
            this.ctx.restore();
            
            // Splash check with the wheel margin boundary
            if (this.flyingKnife.y <= this.log.y + this.log.r + 5) {
                this.handleKnifeImpact();
            }
        } else if (this.knivesToThrow > 0) {
            // Draw Next Ready Knife resting in bottom holster
            this.ctx.save();
            this.ctx.translate(170, 360);
            this.ctx.fillStyle = "#e2e8f0";
            this.ctx.beginPath();
            this.ctx.moveTo(-4, 0); this.ctx.lineTo(4, 0); this.ctx.lineTo(3, -34); this.ctx.lineTo(-3, -34);
            this.ctx.closePath(); this.ctx.fill();
            this.ctx.fillStyle = "#ef4444"; this.ctx.fillRect(-6, 0, 12, 4);
            this.ctx.fillStyle = "#d97706"; this.ctx.fillRect(-3, 4, 6, 12);
            this.ctx.restore();
        }
        
        requestAnimationFrame(() => this.loop());
    },
    handleKnifeImpact() {
        // Impact angles - wheel angle determines absolute current mapping
        // Bottom point on wheel coordinates is always an angle PI/2 (relative to coordinate systems log center)
        let impactAngle = (Math.PI / 2 - this.log.angle) % (Math.PI * 2);
        if (impactAngle < 0) impactAngle += Math.PI * 2;
        
        // Critical collision detection: check angular distance to every stuck/thrown knife
        let hitOthers = false;
        const MIN_ANGULAR_GAP = 0.22; // width of knife overlap radians (~12.6 degrees)
        
        for (let i = 0; i < this.thrownKnives.length; i++) {
            let diff = Math.abs(this.thrownKnives[i].angle - impactAngle);
            // circular wrap difference
            if (diff > Math.PI) diff = (Math.PI * 2) - diff;
            
            if (diff < MIN_ANGULAR_GAP) {
                hitOthers = true;
                break;
            }
        }
        
        if (hitOthers) {
            // Failed: wood metal clang and spill knife down!
            this.isRunning = false;
            this.clearGameState(); // Clear because game over
            this.sdk.sound.playLose();
            this.triggerFailAnimation();
        } else {
            // Succeeded! Stuck on board
            this.thrownKnives.push({ angle: impactAngle });
            this.flyingKnife = null;
            this.score += 15;
            this.sdk.sound.playTap();
            
            // Spark splash particle indicators
            window.burstEmoji("✨", 170, this.log.y + this.log.r + 5);
            
            // In infinite mode, completing the stage clears the board and moves to the next difficulty level!
            if (this.knivesToThrow === 0) {
                this.stage++;
                this.sdk.sound.playWin();
                window.burstEmoji("🔥", 170, 135);
                
                const banner = this.container.querySelector("#boss-alert-banner");
                if (banner) {
                    banner.classList.remove("hidden");
                    banner.innerText = `🔥 LEVEL UP! STAGE ${this.stage}`;
                    banner.style.background = "radial-gradient(circle, #059669 0%, #064e3b 100%)";
                    banner.style.borderColor = "#10b981";
                    banner.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
                    setTimeout(() => {
                        if (banner) {
                            banner.classList.add("hidden");
                        }
                    }, 1200);
                }
                
                // Clear state of board after a small delay to let player appreciate the hit
                this.isRunning = false; // pause physics during stage transition
                this.saveGameState(); // save state with new stage
                
                setTimeout(() => {
                    this.isRunning = true;
                    this.setupStage();
                    if (!this.isLoopActive) {
                        this.loop();
                    }
                }, 1200);
            } else {
                this.saveGameState(); // Autosave state on each successful stick!
            }
            
            this.sdk.updateHUD(this.score, null, this.stage);
        }
    },
    triggerFailAnimation() {
        this.sdk.gameOver({
            score: this.score,
            title: "GAME OVER",
            label: `STAGE ${this.stage}`
        });
    },
    destroy() {
        this.isRunning = false;
    }
};

// 3. BOTTLE FLIP (Category: Arcade)
window.GameCollection["bottleflip"] = {
    name: "Bottle Flip",
    category: "Arcade",
    icon: "opacity", // looks like water bottle droplet
    color: "#06b6d4", // Cyan
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.platforms = [];
        this.isRunning = true;
        
        this.container.innerHTML = `
            <div id="bottle-charge-ui" style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); text-align: center; color: white; display: none; z-index: 10;">
                <div style="font-size: 11px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 4px;">RELEASE TO FLIP!</div>
                <div id="bottle-charge-bar" style="width: 140px; height: 10px; background: rgba(0,0,0,0.4); border-radius: 5px; overflow: hidden; border: 1.5px solid white;">
                    <div id="bottle-charge-fill" style="width: 0%; height: 100%; background: #06b6d4; transition: width 0.05s;"></div>
                </div>
            </div>
            <canvas id="bottle-canvas" class="arcade-canvas" width="340" height="420" style="display: block; background: linear-gradient(to bottom, #020617 0%, #0f172a 100%);"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#bottle-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        // Stars/particles
        this.stars = Array.from({ length: 15 }, () => ({
            x: Math.random() * 340,
            y: Math.random() * 250,
            r: 1 + Math.random() * 1.5
        }));
        
        this.bottle = {
            x: 50,
            y: 330,
            vx: 0,
            vy: 0,
            w: 18,
            h: 38,
            angle: 0,
            scaleY: 1,
            isCharging: false,
            chargeDuration: 0,
            inAir: false
        };
        
        // Generate starting platforms
        this.platforms = [
            { x: 20, w: 70, y: 350, color: "#1e293b", extra: "" },
            { x: 180, w: 60, y: 330, color: "#334155", extra: "" }
        ];
        
        this.cameraOffset = 0;
        this.targetCameraOffset = 0;
        
        this.setupEvents();
        this.sdk.updateHUD(this.score);
        this.loop();
    },
    setupEvents() {
        const handleHold = () => {
            if (!this.isRunning || this.bottle.inAir) return;
            this.bottle.isCharging = true;
            this.bottle.chargeDuration = 0;
            this.bottle.chargeDir = 1;
            this.container.querySelector("#bottle-charge-ui").style.display = 'block';
            this.sdk.sound.playTap();
        };
        
        const handleRelease = () => {
            if (!this.bottle.isCharging) return;
            this.bottle.isCharging = false;
            this.container.querySelector("#bottle-charge-ui").style.display = 'none';
            
            // Calculate launch power
            const cap = Math.min(100, this.bottle.chargeDuration);
            const ratio = cap / 100;
            
            // Apply balanced power mapping where 0% ratio is a small hop, and 100% is a large standard jump
            const p = ratio * 3.9 + 2.36; // balanced launch scale
            
            this.bottle.vx = p * 0.85;
            this.bottle.vy = -p * 1.35;
            this.bottle.inAir = true;
            this.bottle.scaleY = 1; // restore squash
            
            this.sdk.sound.playJump();
        };
        
        this.canvas.onmousedown = handleHold;
        window.addEventListener("mouseup", handleRelease);
        
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            handleHold();
        };
        this.canvas.ontouchend = (e) => {
            e.preventDefault();
            handleRelease();
        };
        
        this._windowMouseUp = handleRelease; // destroy helper
    },
    loop() {
        if (!this.isRunning) return;
        this.ctx.clearRect(0, 0, 340, 420);

        // Ensure platforms are spawned well ahead of the camera or the bottle's horizontal position
        while (this.platforms.length > 0 && this.platforms[this.platforms.length - 1].x - Math.max(this.cameraOffset, this.bottle.x) < 550) {
            const lastP = this.platforms[this.platforms.length - 1];
            const gap = 110 + Math.random() * 80;
            const width = 45 + Math.random() * 30;
            // Limit vertical platform variance to a perfectly reachable 25px range up or down
            const height = Math.max(160, Math.min(365, lastP.y + (Math.random() * 50 - 25)));
            
            this.platforms.push({
                x: lastP.x + lastP.w + gap,
                w: width,
                y: height,
                color: ["#1e293b", "#334155", "#475569"][Math.floor(Math.random()*3)],
                extra: ""
            });
            
            // Keep platforms array slim
            if (this.platforms.length > 15) {
                this.platforms.shift();
            }
        }
        
        // Camera shift smoothing with auto-tracking support while bottle flies
        let desiredCameraOffset = this.targetCameraOffset;
        if (this.bottle.inAir && this.bottle.x - this.cameraOffset > 180) {
            desiredCameraOffset = Math.max(desiredCameraOffset, this.bottle.x - 180);
        }
        if (Math.abs(this.cameraOffset - desiredCameraOffset) > 0.5) {
            this.cameraOffset += (desiredCameraOffset - this.cameraOffset) * 0.12;
        }
        
        // Draw space stars backdrop
        this.ctx.fillStyle = "#94a3b8";
        this.stars.forEach(s => {
            // scroll stars gently with parallax
            let sx = (s.x - this.cameraOffset * 0.3) % 400;
            if (sx < 0) sx += 400;
            this.ctx.beginPath();
            this.ctx.arc(sx, s.y, s.r, 0, Math.PI*2);
            this.ctx.fill();
        });
        
        this.ctx.save();
        this.ctx.translate(-this.cameraOffset, 0);
        
        // Draw static platforms
        this.platforms.forEach(p => {
            // Draw dark base platform
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.w, 420 - p.y);
            
            // Glowing neon top rim
            this.ctx.strokeStyle = "#06b6d4";
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + 1, p.y);
            this.ctx.lineTo(p.x + p.w - 1, p.y);
            this.ctx.stroke();
        });
        
        // Physics update
        if (this.bottle.isCharging) {
            const dir = this.bottle.chargeDir || 1;
            this.bottle.chargeDuration += 2.5 * dir;
            if (this.bottle.chargeDuration >= 100) {
                this.bottle.chargeDuration = 100;
                this.bottle.chargeDir = -1;
            } else if (this.bottle.chargeDuration <= 0) {
                this.bottle.chargeDuration = 0;
                this.bottle.chargeDir = 1;
            }
            this.bottle.scaleY = 1 - (this.bottle.chargeDuration / 100) * 0.35; // squash down!
            this.container.querySelector("#bottle-charge-fill").style.width = `${this.bottle.chargeDuration}%`;
        }
        
        if (this.bottle.inAir) {
            this.bottle.vy += 0.32; // Gravity
            this.bottle.x += this.bottle.vx;
            this.bottle.y += this.bottle.vy;
            
            // Rotate full 360 flip
            this.bottle.angle += 0.16;
            
            // Check Landing
            this.platforms.forEach(p => {
                // If bottle y is crossing the top level of platform while descending
                if (this.bottle.vy > 0 &&
                    this.bottle.y >= p.y - (this.bottle.h / 2) &&
                    this.bottle.y <= p.y + 12 &&
                    this.bottle.x >= p.x - 4 &&
                    this.bottle.x <= p.x + p.w + 4) {
                    
                    // Safe!
                    this.bottle.y = p.y - (this.bottle.h / 2);
                    this.bottle.vx = 0;
                    this.bottle.vy = 0;
                    this.bottle.angle = 0;
                    this.bottle.inAir = false;
                    
                    // Regular landing
                    this.score += 10;
                    this.sdk.updateHUD(this.score);
                    this.sdk.sound.playTap();
                    
                    // Spark landing
                    window.burstEmoji("✨", this.bottle.x, p.y);
                    
                    this.advanceTrack(p);
                }
            });
            
            // Critical boundary test - fell down?
            if (this.bottle.y > 450) {
                this.isRunning = false;
                this.sdk.sound.playLose();
                this.triggerGameOver();
            }
        }
        
        // Draw Physical Water Bottle (with custom squash and rotation angles!)
        this.ctx.save();
        this.ctx.translate(this.bottle.x, this.bottle.y);
        this.ctx.rotate(this.bottle.angle);
        this.ctx.scale(1, this.bottle.scaleY);
        
        // Outer glow
        this.ctx.shadowColor = "#38bdf8";
        this.ctx.shadowBlur = 8;
        
        // Body bottle plastic translucent
        this.ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
        this.ctx.strokeStyle = "#38bdf8";
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.roundRect(-this.bottle.w / 2, -this.bottle.h / 2, this.bottle.w, this.bottle.h - 8, 4);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Water liquid wave inside
        this.ctx.fillStyle = "#0284c7";
        this.ctx.beginPath();
        this.ctx.roundRect(-this.bottle.w/2 + 1.5, 0, this.bottle.w - 3, this.bottle.h/2 - 8, 2);
        this.ctx.fill();
        
        // Bottle neck (skinny portion)
        this.ctx.fillStyle = "rgba(255,255,255,0.7)";
        this.ctx.fillRect(-this.bottle.w/4, -this.bottle.h/2, this.bottle.w/2, 2);
        
        // Red cap
        this.ctx.fillStyle = "#ef4444";
        this.ctx.fillRect(-this.bottle.w/3, -this.bottle.h/2 - 5, this.bottle.w * 0.65, 5);
        this.ctx.restore();
        
        this.ctx.restore();
        
        requestAnimationFrame(() => this.loop());
    },
    advanceTrack(matchingPlatform) {
        // Shift camera focal view so the landed platform becomes early left boundary (x ≈ 40)
        this.targetCameraOffset = matchingPlatform.x - 40;
    },
    triggerGameOver() {
        this.sdk.gameOver({
            score: this.score,
            title: "BOTTLE SHATTERED!",
            label: "BOTTLE OVER"
        });
    },
    destroy() {
        this.isRunning = false;
        if (this._windowMouseUp) {
            window.removeEventListener("mouseup", this._windowMouseUp);
        }
    }
};

// 4. PIPE CONNECT (Category: Puzzle)
window.GameCollection["pipeconnect"] = {
    name: "Pipe Connect",
    category: "Puzzle",
    icon: "opacity", // fallbacks to Water Sort colors/icons
    color: "#a855f7", // Purple
    hasScore: true,
    hasLevel: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.level = 1;
        this.score = 0;
        this.movesUsed = 0;
        this.maxMoves = 25; // Mode parameter (Limited moves)
        this.timerSeconds = 45; // Timed level option
        this.boardSize = 4; // 4x4 default
        this.levelType = "classic"; // classic, rotate, moves, timed, multiple
        
        this.container.innerHTML = `
            <div id="pipe-banner-top" style="position: absolute; top: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; font-size: 11px; z-index: 10;">
                <span id="pipe-type-label" style="background:#a855f7; color:white; padding:4px 10px; border-radius:10px; font-weight:bold; text-transform:uppercase;">CLASSIC CONNECT</span>
                <span id="pipe-info-label" style="background:rgba(0,0,0,0.5); color:white; padding:4px 10px; border-radius:10px; font-weight:bold;">Moves: 0/25</span>
            </div>
            <div id="pipe-grid-container" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding-top: 40px; box-sizing: border-box;">
                <!-- Filled dynamically with grids -->
            </div>
        `;
        
        this.setupLevel();
    },
    setupLevel() {
        this.movesUsed = 0;
        
        // Cycles level types
        const types = ["classic", "rotate", "moves", "timed", "multiple"];
        this.levelType = types[(this.level - 1) % types.length];
        this.boardSize = this.level >= 6 ? 5 : 4;
        
        // Update styling banner
        const typeLabel = this.container.querySelector("#pipe-type-label");
        const infoLabel = this.container.querySelector("#pipe-info-label");
        
        if (this.levelType === "classic") {
            typeLabel.innerText = "CLASSIC CONNECT";
            typeLabel.style.background = "#a855f7";
            infoLabel.innerText = "No pressure: connect the taps!";
        } else if (this.levelType === "rotate") {
            typeLabel.innerText = "ROTATE ONLY";
            typeLabel.style.background = "#ec4899";
            infoLabel.innerText = "Click to rotate!";
        } else if (this.levelType === "moves") {
            this.maxMoves = this.boardSize === 4 ? 15 : 20;
            typeLabel.innerText = "LIMIT MOVES 🤫";
            typeLabel.style.background = "#fbbf24";
            infoLabel.innerText = `Moves: 0/${this.maxMoves}`;
        } else if (this.levelType === "timed") {
            this.timerSeconds = 40;
            typeLabel.innerText = "TIMED RUSH ⏱️";
            typeLabel.style.background = "#f43f5e";
            infoLabel.innerText = `RUSH: ${this.timerSeconds}s`;
            
            this.startLevelTimer();
        } else if (this.levelType === "multiple") {
            typeLabel.innerText = "MULTI-COLOR 🌈";
            typeLabel.style.background = "#06b6d4";
            infoLabel.innerText = "Link Purple → Purple & Orange → Orange!";
        }
        
        // Prearrange source/destination edges fixed properties
        this.sourceA = { row: 0, col: 0, color: "purple" };
        this.destA = { row: this.boardSize - 1, col: this.boardSize - 1, color: "purple" };
        
        if (this.levelType === "multiple") {
            this.sourceB = { row: 0, col: this.boardSize - 1, color: "orange" };
            this.destB = { row: this.boardSize - 1, col: 0, color: "orange" };
        } else {
            this.sourceB = null;
            this.destB = null;
        }

        // SOLVABLE LEVEL GENERATOR
        function findRandomPath(boardSize, start, end, blockedSet = new Set()) {
            const visited = new Set(blockedSet);
            const path = [];
            
            function dfs(r, c) {
                if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) return false;
                const key = `${r},${c}`;
                if (visited.has(key)) return false;
                
                visited.add(key);
                path.push({ r, c });
                
                if (r === end.row && c === end.col) {
                    return true;
                }
                
                const dirs = [
                    { dr: -1, dc: 0 }, // top
                    { dr: 1, dc: 0 },  // bottom
                    { dr: 0, dc: -1 }, // left
                    { dr: 0, dc: 1 }   // right
                ];
                
                // Shuffle directions for organic randomized paths
                for (let i = dirs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    const temp = dirs[i];
                    dirs[i] = dirs[j];
                    dirs[j] = temp;
                }
                
                for (const dir of dirs) {
                    if (dfs(r + dir.dr, c + dir.dc)) {
                        return true;
                    }
                }
                
                visited.delete(key);
                path.pop();
                return false;
            }
            
            if (dfs(start.row, start.col)) {
                return path;
            }
            return null;
        }
        
        function getDirectionOf(c1, c2) {
            if (c2.r === c1.r - 1) return "top";
            if (c2.r === c1.r + 1) return "bottom";
            if (c2.c === c1.c - 1) return "left";
            if (c2.c === c1.c + 1) return "right";
            return null;
        }

        function validateLevelSolvability(g, bSize, startA, endA, startB, endB) {
            function getOpposite(dir) {
                if (dir === "top") return "bottom";
                if (dir === "bottom") return "top";
                if (dir === "left") return "right";
                if (dir === "right") return "left";
                return null;
            }

            function findSolution(start, end, blockedSet = new Set()) {
                const visited = new Set(blockedSet);
                const path = [];
                
                function dfs(r, c) {
                    if (r < 0 || r >= bSize || c < 0 || c >= bSize) return false;
                    const key = `${r},${c}`;
                    if (visited.has(key)) return false;
                    
                    if (path.length >= 1) {
                        const prev = path[path.length - 1];
                        if (path.length >= 2) {
                            const prevPrev = path[path.length - 2];
                            const dIn = getDirectionOf(prev, prevPrev);
                            const dOut = getDirectionOf(prev, { r, c });
                            if (!dIn || !dOut) return false;
                            
                            const isStraight = (dIn === getOpposite(dOut));
                            const tileType = g[prev.r][prev.c].type;
                            if (tileType === 1 && !isStraight) return false;
                            if (tileType === 2 && isStraight) return false;
                        }
                    }
                    
                    visited.add(key);
                    path.push({ r, c });
                    
                    if (r === end.row && c === end.col) {
                        return true;
                    }
                    
                    const dirs = [
                        { dr: -1, dc: 0 },
                        { dr: 1, dc: 0 },
                        { dr: 0, dc: -1 },
                        { dr: 0, dc: 1 }
                    ];
                    
                    for (const dir of dirs) {
                        if (dfs(r + dir.dr, c + dir.dc)) {
                            return true;
                        }
                    }
                    
                    visited.delete(key);
                    path.pop();
                    return false;
                }
                
                if (dfs(start.row, start.col)) {
                    return path;
                }
                return null;
            }

            const path1 = findSolution(startA, endA);
            if (!path1) return false;
            
            if (startB) {
                const blocked = new Set();
                path1.forEach(cell => blocked.add(`${cell.r},${cell.c}`));
                const path2 = findSolution(startB, endB, blocked);
                if (!path2) return false;
            }
            
            return true;
        }

        let boardGenerationSuccessful = false;
        let genAttempts = 0;
        let finalPathTiles = new Map();
        
        while (!boardGenerationSuccessful && genAttempts < 100) {
            genAttempts++;
            const pathTiles = new Map();
            
            function processPath(path) {
                if (!path) return;
                const len = path.length;
                for (let i = 0; i < len; i++) {
                    const cell = path[i];
                    
                    let n1;
                    if (i === 0) {
                        n1 = { r: cell.r - 1, c: cell.c };
                    } else {
                        n1 = path[i - 1];
                    }
                    
                    let n2;
                    if (i === len - 1) {
                        n2 = { r: cell.r + 1, c: cell.c };
                    } else {
                        n2 = path[i + 1];
                    }
                    
                    const d1 = getDirectionOf(cell, n1);
                    const d2 = getDirectionOf(cell, n2);
                    
                    if (!d1 || !d2) continue;
                    
                    const key = `${cell.r},${cell.c}`;
                    const isStraight = 
                        (d1 === "top" && d2 === "bottom") || 
                        (d1 === "bottom" && d2 === "top") || 
                        (d1 === "left" && d2 === "right") || 
                        (d1 === "right" && d2 === "left");
                        
                    pathTiles.set(key, {
                        type: isStraight ? 1 : 2
                    });
                }
            }

            let pathA = null;
            let pathB = null;
            let attempts = 0;
            
            while (attempts < 50) {
                attempts++;
                pathA = findRandomPath(this.boardSize, this.sourceA, this.destA);
                if (!pathA) continue;
                
                if (this.sourceB) {
                    const blocked = new Set();
                    pathA.forEach(cell => blocked.add(`${cell.r},${cell.c}`));
                    
                    pathB = findRandomPath(this.boardSize, this.sourceB, this.destB, blocked);
                    if (pathB) {
                        break;
                    }
                } else {
                    break;
                }
            }
            
            let currentLevelType = this.levelType;
            let currentSourceB = this.sourceB;
            let currentDestB = this.destB;
            
            if (currentSourceB && !pathB) {
                currentLevelType = "classic";
                currentSourceB = null;
                currentDestB = null;
            }
            
            processPath(pathA);
            processPath(pathB);
            
            // Generate actual pipe grid arrays with guaranteed solutions
            const tempGrid = [];
            for (let r = 0; r < this.boardSize; r++) {
                tempGrid[r] = [];
                for (let c = 0; c < this.boardSize; c++) {
                    const key = `${r},${c}`;
                    let type;
                    if (pathTiles.has(key)) {
                        type = pathTiles.get(key).type;
                    } else {
                        type = Math.random() < 0.45 ? 1 : 2;
                    }
                    
                    let currentRot = Math.floor(Math.random() * 4);
                    
                    tempGrid[r][c] = {
                        row: r,
                        col: c,
                        type: type,
                        rot: currentRot,
                        flowing: false,
                        flowingSecondary: false
                    };
                }
            }
            
            if (validateLevelSolvability(tempGrid, this.boardSize, this.sourceA, this.destA, currentSourceB, currentDestB)) {
                this.grid = tempGrid;
                this.levelType = currentLevelType;
                this.sourceB = currentSourceB;
                this.destB = currentDestB;
                finalPathTiles = pathTiles;
                
                if (this.levelType === "classic") {
                    if (typeLabel) {
                        typeLabel.innerText = "CLASSIC CONNECT";
                        typeLabel.style.background = "#a855f7";
                    }
                    if (infoLabel) {
                        infoLabel.innerText = "No pressure: connect the taps!";
                    }
                }
                
                boardGenerationSuccessful = true;
            }
        }
        
        // Ensure starting state is scrambled (not already solved)
        this.calculateFlows();
        let solved = this.grid[this.destA.row][this.destA.col].flowing === true && 
                     (!this.sourceB || this.grid[this.destB.row][this.destB.col].flowingSecondary === true);
        
        let scrambleCount = 0;
        while (solved && scrambleCount < 10) {
            scrambleCount++;
            finalPathTiles.forEach((val, key) => {
                const parts = key.split(",");
                const r = parseInt(parts[0], 10);
                const c = parseInt(parts[1], 10);
                this.grid[r][c].rot = (this.grid[r][c].rot + Math.floor(Math.random() * 3) + 1) % 4;
            });
            this.calculateFlows();
            solved = this.grid[this.destA.row][this.destA.col].flowing === true && 
                     (!this.sourceB || this.grid[this.destB.row][this.destB.col].flowingSecondary === true);
        }
        
        this.renderGrid();
        this.sdk.updateHUD(this.score, null, this.level);
    },
    startLevelTimer() {
        if (this.pipeTimer) clearInterval(this.pipeTimer);
        this.pipeTimer = setInterval(() => {
            if (this.levelType !== "timed") {
                clearInterval(this.pipeTimer);
                return;
            }
            this.timerSeconds--;
            const infoLabel = this.container.querySelector("#pipe-info-label");
            if (infoLabel) {
                infoLabel.innerText = `RUSH: ${this.timerSeconds}s`;
            }
            
            if (this.timerSeconds <= 0) {
                clearInterval(this.pipeTimer);
                this.triggerGameOver("Time Expired!");
            }
        }, 1000);
    },
    renderGrid() {
        const container = this.container.querySelector("#pipe-grid-container");
        container.innerHTML = "";
        
        const wrapper = document.createElement("div");
        wrapper.style.display = "grid";
        wrapper.style.gridTemplateColumns = `repeat(${this.boardSize}, 62px)`;
        wrapper.style.gap = "6px";
        wrapper.style.background = "rgba(15, 23, 42, 0.4)";
        wrapper.style.padding = "10px";
        wrapper.style.borderRadius = "16px";
        wrapper.style.border = "1.5px solid rgba(255, 255, 255, 0.1)";
        
        // Breadth-First-Search path trace flow directions checks
        this.calculateFlows();
        
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const tile = this.grid[r][c];
                const cell = document.createElement("div");
                cell.style.width = "62px";
                cell.style.height = "62px";
                cell.style.background = "var(--bg-card)";
                cell.style.border = "1px solid var(--border-color)";
                cell.style.borderRadius = "12px";
                cell.style.position = "relative";
                cell.style.overflow = "hidden";
                cell.style.cursor = "pointer";
                cell.style.display = "flex";
                cell.style.alignItems = "center";
                cell.style.justifyContent = "center";
                cell.style.transition = "transform 0.1s, box-shadow 0.2s";
                
                // Clicking tile rotates it!
                cell.onclick = () => {
                    tile.rot = (tile.rot + 1) % 4;
                    this.movesUsed++;
                    this.sdk.sound.playTap();
                    
                    // Update limit state
                    if (this.levelType === "moves") {
                        const left = this.maxMoves - this.movesUsed;
                        this.container.querySelector("#pipe-info-label").innerText = `Moves: ${this.movesUsed}/${this.maxMoves}`;
                        if (left < 0) {
                            this.triggerGameOver("Out of moves!");
                            return;
                        }
                    }
                    
                    this.renderGrid();
                    this.checkVictory();
                };
                
                // Add source/destination custom glow labels overlay
                const isSrcA = this.sourceA.row === r && this.sourceA.col === c;
                const isDstA = this.destA.row === r && this.destA.col === c;
                const isSrcB = this.sourceB && this.sourceB.row === r && this.sourceB.col === c;
                const isDstB = this.destB && this.destB.row === r && this.destB.col === c;
                
                // Render custom SVG inside the pipe slot to look stunning!
                const svgId = `pipe-svg-${r}-${c}`;
                const innerRGB = tile.flowing ? "#a855f7" : (tile.flowingSecondary ? "#f97316" : "#475569");
                const outerRGB = tile.flowing ? "rgba(168,85,247,0.4)" : (tile.flowingSecondary ? "rgba(249,115,22,0.4)" : "transparent");
                
                let pipeSVG = "";
                
                if (tile.type === 1) {
                    // Straight Pipe
                    pipeSVG = `
                        <svg viewBox="0 0 40 40" style="width: 100%; height: 100%; transform: rotate(${tile.rot * 90}deg); transition: transform 0.15s;">
                            <rect x="14" y="0" width="12" height="40" fill="${innerRGB}" rx="2" style="filter: drop-shadow(0 0 4px ${outerRGB});" />
                        </svg>
                    `;
                } else {
                    // Elbow L Pipe
                    pipeSVG = `
                        <svg viewBox="0 0 40 40" style="width: 100%; height: 100%; transform: rotate(${tile.rot * 90}deg); transition: transform 0.15s;">
                            <path d="M 14,0 L 26,0 L 26,14 L 40,14 L 40,26 L 14,26 Z" fill="${innerRGB}" style="filter: drop-shadow(0 0 4px ${outerRGB});" />
                        </svg>
                    `;
                }
                
                cell.innerHTML = pipeSVG;
                
                // Tags
                if (isSrcA) {
                    cell.innerHTML += `<div style="position:absolute; top:2px; left:2px; font-size:8px; background:#a855f7; color:white; font-weight:bold; padding:1px 3px; border-radius:4px; pointer-events:none;">TAP A</div>`;
                } else if (isDstA) {
                    cell.innerHTML += `<div style="position:absolute; bottom:2px; right:2px; font-size:8px; background:#a855f7; color:white; font-weight:bold; padding:1px 3px; border-radius:4px; pointer-events:none;">OUT A</div>`;
                } else if (isSrcB) {
                    cell.innerHTML += `<div style="position:absolute; top:2px; left:2px; font-size:8px; background:#f97316; color:white; font-weight:bold; padding:1px 3px; border-radius:4px; pointer-events:none;">TAP B</div>`;
                } else if (isDstB) {
                    cell.innerHTML += `<div style="position:absolute; bottom:2px; right:2px; font-size:8px; background:#f97316; color:white; font-weight:bold; padding:1px 3px; border-radius:4px; pointer-events:none;">OUT B</div>`;
                }
                
                wrapper.appendChild(cell);
            }
        }
        
        container.appendChild(wrapper);
    },
    getDirections(tile) {
        // Rotations shift boundaries clockwise:
        // Straight pipe type 1 pointing north-south opens (Top, Bottom) under rot=0
        // rot=1: Left, Right
        // rot=2: Top, Bottom
        // rot=3: Left, Right
        let dirs = [];
        if (tile.type === 1) {
            if (tile.rot % 2 === 0) {
                dirs = ["top", "bottom"];
            } else {
                dirs = ["left", "right"];
            }
        } else {
            // Elbow L pipe opens (Top, Right) under rot=0
            // rot=1: Right, Bottom
            // rot=2: Bottom, Left
            // rot=3: Left, Top
            if (tile.rot === 0) dirs = ["top", "right"];
            else if (tile.rot === 1) dirs = ["right", "bottom"];
            else if (tile.rot === 2) dirs = ["bottom", "left"];
            else if (tile.rot === 3) dirs = ["left", "top"];
        }
        return dirs;
    },
    calculateFlows() {
        // Reset flows
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                this.grid[r][c].flowing = false;
                this.grid[r][c].flowingSecondary = false;
            }
        }
        
        // Trace primary path (Purple line starting from 0,0)
        this.traceLine(this.sourceA.row, this.sourceA.col, "flowing");
        
        // Trace secondary (Orange line starting if multiple)
        if (this.sourceB) {
            this.traceLine(this.sourceB.row, this.sourceB.col, "flowingSecondary");
        }
    },
    traceLine(startR, startC, flowKey) {
        const visited = new Set();
        const queue = [[startR, startC]];
        visited.add(`${startR},${startC}`);
        
        while (queue.length > 0) {
            const [r, c] = queue.shift();
            const tile = this.grid[r][c];
            tile[flowKey] = true;
            
            const activeDirs = this.getDirections(tile);
            
            // Analyze neighbors
            const neighborsList = [
                { dir: "top", r: r - 1, c: c, opposite: "bottom" },
                { dir: "bottom", r: r + 1, c: c, opposite: "top" },
                { dir: "left", r: r, c: c - 1, opposite: "right" },
                { dir: "right", r: r, c: c + 1, opposite: "left" }
            ];
            
            neighborsList.forEach(n => {
                if (n.r >= 0 && n.r < this.boardSize && n.c >= 0 && n.c < this.boardSize) {
                    const key = `${n.r},${n.c}`;
                    if (!visited.has(key)) {
                        const neighbor = this.grid[n.r][n.c];
                        const neighborDirs = this.getDirections(neighbor);
                        
                        // Bridge check - does my open path connect into neighbor open path?
                        if (activeDirs.includes(n.dir) && neighborDirs.includes(n.opposite)) {
                            visited.add(key);
                            queue.push([n.r, n.c]);
                        }
                    }
                }
            });
        }
    },
    checkVictory() {
        const winA = this.grid[this.destA.row][this.destA.col].flowing === true;
        const winB = this.sourceB ? (this.grid[this.destB.row][this.destB.col].flowingSecondary === true) : true;
        
        if (winA && winB) {
            if (this.pipeTimer) {
                clearInterval(this.pipeTimer);
                this.pipeTimer = null;
            }
            // Win level!
            this.level++;
            this.score += 100;
            this.sdk.sound.playWin();
            window.burstEmoji("🍪", 170, 210);
            
            setTimeout(() => {
                this.setupLevel();
            }, 1000);
        }
    },
    triggerGameOver(msg) {
        if (this.pipeTimer) clearInterval(this.pipeTimer);
        this.sdk.gameOver({
            score: this.score,
            title: `STAGE BLOCKED: ${msg}`,
            label: "PIPE BLOCKED"
        });
    },
    destroy() {
        if (this.pipeTimer) clearInterval(this.pipeTimer);
    }
};

// 5. CLOUD ADVENTURE (Category: Arcade)
window.GameCollection["cloudadventure"] = {
    name: "Cloud Adventure",
    category: "Arcade",
    icon: "flight_takeoff", // cloud balloon style
    color: "#a855f7", // purple cloud vibe
    hasScore: true,
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.distance = 0;
        this.isRunning = true;
        
        this.container.innerHTML = `
            <div id="cloud-distance-tag" style="position: absolute; top: 12px; left: 12px; font-weight: bold; font-size: 11px; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 8px; color: #f8fafc; z-index: 10;">🎈 Elev: 0m</div>
            <canvas id="cloud-canvas" class="arcade-canvas" width="340" height="420" style="display: block; background: linear-gradient(to bottom, #bae6fd 0%, #38bdf8 60%, #0284c7 100%);"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#cloud-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.balloon = {
            x: 170,
            y: 280,
            r: 16,
            vx: 0,
            targetX: 170
        };
        
        this.obstacles = []; // { x, y, w, h, type, speedX }
        this.collectibles = []; // { x, y, r, type }
        this.particles = [];
        
        this.speedScale = 1.0;
        this.spawnTimer = 0;
        
        // Touch states mapping
        this.keys = {};
        this.setupEvents();
        this.sdk.updateHUD(this.score);
        this.loop();
    },
    setupEvents() {
        const handleTouch = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            const tx = (clientX - rect.left) * (340 / rect.width);
            this.balloon.targetX = tx;
        };
        this.canvas.onmousedown = (e) => handleTouch(e.clientX);
        this.canvas.onmousemove = (e) => {
            if (e.buttons === 1) handleTouch(e.clientX);
        };
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            handleTouch(e.touches[0].clientX);
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            handleTouch(e.touches[0].clientX);
        };
    },
    loop() {
        if (!this.isRunning) return;
        this.ctx.clearRect(0, 0, 340, 420);
        
        // 1. Update distance & game pacing intensity
        this.distance += 0.25;
        this.speedScale = 1.0 + (this.distance / 400);
        this.container.querySelector("#cloud-distance-tag").innerText = `🎈 Elev: ${Math.round(this.distance)}m`;
        
        // Horizontal movement ease towards target touch
        this.balloon.x += (this.balloon.targetX - this.balloon.x) * 0.15;
        this.balloon.x = Math.max(this.balloon.r + 10, Math.min(340 - this.balloon.r - 10, this.balloon.x));
        
        // 2. Spawn Obstacles periodically
        this.spawnTimer++;
        if (this.spawnTimer >= Math.max(25, 60 - this.distance/15)) {
            this.spawnTimer = 0;
            this.spawnElement();
        }
        
        // 3. Draw Background clouds floating down
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        
        // 4. Update & Draw Collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            c.y += 2.2 * this.speedScale;
            
            // Draw Star / Balloon collectible
            this.ctx.fillStyle = c.type === 'cookie' ? "#f59e0b" : "#fbbf24";
            this.ctx.save();
            this.ctx.translate(c.x, c.y);
            
            if (c.type === 'cookie') {
                // draw a rare cookie
                this.ctx.font = "18px systems-ui";
                this.ctx.fillText("🍪", -9, 4);
            } else {
                // standard bright little star
                this.ctx.font = "16px systems-ui";
                this.ctx.fillText("⭐", -8, 5);
            }
            this.ctx.restore();
            
            // Check Collision
            const dist = Math.hypot(c.x - this.balloon.x, c.y - this.balloon.y);
            if (dist < c.r + this.balloon.r) {
                this.collectibles.splice(i, 1);
                
                if (c.type === 'cookie') {
                    window.triggerEasterEgg(500, "CLOUD COOKIE POWER");
                } else {
                    this.score += 20;
                    this.sdk.updateHUD(this.score);
                    this.sdk.sound.playTap();
                }
                window.burstEmoji("✨", c.x, c.y);
            }
        }
        
        // 5. Update & Draw Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.y += o.speedY * this.speedScale;
            if (o.speedX) o.x += o.speedX;
            
            // Drawing obstacles elegantly based on type
            this.ctx.save();
            this.ctx.translate(o.x, o.y);
            
            if (o.type === 'bird') {
                // flapping wings draw
                this.ctx.fillStyle = "#475569";
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI*2);
                this.ctx.fill();
                let flap = Math.sin(Date.now() / 100) * 10;
                this.ctx.strokeStyle = "#475569";
                this.ctx.lineWidth = 2.5;
                this.ctx.beginPath();
                this.ctx.moveTo(-10, 0); this.ctx.lineTo(-4, flap);
                this.ctx.moveTo(10, 0); this.ctx.lineTo(4, flap);
                this.ctx.stroke();
            } else if (o.type === 'cloud') {
                // white puffy cloud (harmless scenery)
                this.ctx.fillStyle = "rgba(255,255,255,0.85)";
                this.ctx.beginPath();
                this.ctx.arc(-10, 0, 12, 0, Math.PI*2);
                this.ctx.arc(10, 0, 12, 0, Math.PI*2);
                this.ctx.arc(0, -10, 14, 0, Math.PI*2);
                this.ctx.fill();
            } else if (o.type === 'plane') {
                // speedy jet plane
                this.ctx.fillStyle = "#94a3b8";
                this.ctx.fillRect(-15, -4, 30, 8); // fusillage
                this.ctx.fillStyle = "#ef4444";
                this.ctx.fillRect(-3, -16, 6, 32); // wings
            } else if (o.type === 'storm') {
                // dark lightning cloud
                this.ctx.fillStyle = "#1e293b"; // Dark gray storm
                this.ctx.beginPath();
                this.ctx.arc(-10, 0, 13, 0, Math.PI*2);
                this.ctx.arc(10, 0, 13, 0, Math.PI*2);
                this.ctx.arc(0, -11, 15, 0, Math.PI*2);
                this.ctx.fill();
                // neon flashing yellow borders
                if (Math.random() < 0.3) {
                    this.ctx.strokeStyle = "#facc15";
                    this.ctx.lineWidth = 2.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 5); this.ctx.lineTo(-6, 20); this.ctx.lineTo(3, 20); this.ctx.lineTo(-2, 34);
                    this.ctx.stroke();
                }
            }
            this.ctx.restore();
            
            // Collision Detection
            if (o.type !== 'cloud') {
                const boxDistX = Math.abs(o.x - this.balloon.x);
                const boxDistY = Math.abs(o.y - this.balloon.y);
                const hit = boxDistX < (o.w / 2 + this.balloon.r - 2) && boxDistY < (o.h / 2 + this.balloon.r - 2);
                
                if (hit) {
                    this.isRunning = false;
                    this.sdk.sound.playLose();
                    this.triggerExplode();
                }
            }
            
            // Clean unneeded
            if (o.y > 450) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // 6. Draw Main Red Hot Air Balloon
        this.ctx.save();
        this.ctx.translate(this.balloon.x, this.balloon.y);
        
        // Draw physical glowing basket hanger ropes
        this.ctx.strokeStyle = "#475569";
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(-6, 12); this.ctx.lineTo(-4, 24);
        this.ctx.moveTo(6, 12); this.ctx.lineTo(4, 24);
        this.ctx.stroke();
        
        // Tiny wooden woven passenger basket
        this.ctx.fillStyle = "#d97706";
        this.ctx.fillRect(-6, 24, 12, 8);
        
        // Hot helium envelope balloon (beautiful teardrop shape)
        // Red and yellow stripes!
        this.ctx.fillStyle = "#ef4444";
        this.ctx.beginPath();
        this.ctx.arc(0, -1, 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = "#facc15";
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -16);
        this.ctx.bezierCurveTo(-5, -3, -5, 3, 0, 15);
        this.ctx.bezierCurveTo(5, 3, 5, -3, 5, -16);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        
        requestAnimationFrame(() => this.loop());
    },
    spawnElement() {
        const types = ['cloud', 'bird', 'plane', 'storm'];
        let choice = types[Math.floor(Math.random() * types.length)];
        
        // Plane only at higher altitude elevation
        if (choice === 'plane' && this.distance < 150) choice = 'cloud';
        
        let oW = 32, oH = 22, speedY = 3.2, speedX = 0;
        if (choice === 'cloud') { oW = 55; oH = 32; speedY = 2.4; }
        else if (choice === 'plane') { oW = 40; oH = 20; speedY = 1.5; speedX = Math.random() < 0.5 ? 2.5 : -2.5; }
        else if (choice === 'bird') { oW = 20; oH = 12; speedY = 3.5; speedX = (Math.random() * 2 - 1); }
        else if (choice === 'storm') { oW = 50; oH = 34; speedY = 2.8; }
        
        const spawnX = Math.max(oW/2 + 5, Math.min(340 - oW/2 - 5, Math.random() * 340));
        
        this.obstacles.push({
            x: spawnX,
            y: -40,
            w: oW,
            h: oH,
            type: choice,
            speedY: speedY,
            speedX: speedX
        });
        
        // Spawns occasional collectible gold stars
        if (Math.random() < 0.42) {
            this.collectibles.push({
                x: 30 + Math.random() * 280,
                y: -100,
                r: 10,
                type: Math.random() < 0.08 ? 'cookie' : 'star'
            });
        }
    },
    triggerExplode() {
        // Particle burst
        window.burstEmoji("🔥", this.balloon.x, this.balloon.y);
        this.sdk.gameOver({
            score: this.score,
            title: `CRASHED AFTER ${Math.round(this.distance)}m!`,
            label: "BALLOON OVER"
        });
    },
    destroy() {
        this.isRunning = false;
    }
};

// 6. FISHING FRENZY (Category: Casual)
window.GameCollection["fishingfrenzy"] = {
    name: "Fishing Frenzy",
    category: "Casual",
    icon: "opacity", // fishing water vibes
    color: "#3b82f6", // Blue sea
    hasScore: true,
    saveGameState() {
        if (!this.isRunning) return;
        try {
            const state = {
                score: this.score,
                caughtList: this.caughtList,
                largestFishWeight: this.largestFishWeight,
                fishes: this.fishes,
                boatX: this.boatX,
                hook: {
                    x: this.hook.x,
                    y: this.hook.y,
                    state: this.hook.state,
                    catchObj: this.hook.catchObj
                }
            };
            localStorage.setItem("game_state_fishingfrenzy", JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save fishingfrenzy state", e);
        }
    },
    clearGameState() {
        localStorage.removeItem("game_state_fishingfrenzy");
    },
    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.score = 0;
        this.caughtList = {}; // logs count caught goldfish, salmon, sharks
        this.isRunning = true;
        this.largestFishWeight = 0.0;
        
        this.container.innerHTML = `
            <div id="fishing-stats-panel" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.55); border-radius: 8px; color: white; padding: 4px 10px; font-size: 11px; z-index: 10;">
                🐠 Caught: 0 | Max Wt: 0.0 kg
            </div>
            <div id="fishing-toast" style="position: absolute; bottom: 84px; left: 50%; transform: translateX(-50%); background: rgba(17,24,39,0.95); border: 2.2px solid #3b82f6; padding: 8px 16px; border-radius: 16px; color: #fff; font-size: 12px; font-weight: bold; text-align: center; display: none; z-index: 20; max-width: 260px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);"></div>
            <canvas id="fishing-canvas" class="arcade-canvas" width="340" height="420" style="display: block; background: linear-gradient(to bottom, #7dd3fc 0%, #1e3a8a 12%, #172554 100%);"></canvas>
        `;
        
        this.canvas = this.container.querySelector("#fishing-canvas");
        this.ctx = this.canvas.getContext("2d");
        
        // Boat starting focal horizontal position
        this.boatX = 170;
        this.hook = {
            x: 170,
            y: 50,
            state: "idle", // idle, sinking, reeling
            maxDepth: 390,
            speed: 5.5,
            catchObj: null // currently hooked fish item details
        };
        
        this.fishes = [];
        
        const saved = localStorage.getItem("game_state_fishingfrenzy");
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.score = state.score || 0;
                this.caughtList = state.caughtList || {};
                this.largestFishWeight = state.largestFishWeight || 0.0;
                this.fishes = state.fishes || [];
                this.boatX = state.boatX || 170;
                
                const sh = state.hook || {};
                this.hook = {
                    x: sh.x || 170,
                    y: sh.y || 50,
                    state: sh.state || "idle",
                    maxDepth: 390,
                    speed: 5.5,
                    catchObj: sh.catchObj || null
                };
                
                const countValues = Object.values(this.caughtList).reduce((a, b) => a + b, 0);
                this.container.querySelector("#fishing-stats-panel").innerText = `🐠 Caught: ${countValues} | Max Wt: ${this.largestFishWeight.toFixed(1)} kg`;
            } catch (e) {
                console.error("Failed to load saved fishingfrenzy state", e);
                this.setupFish();
            }
        } else {
            this.setupFish();
        }
        
        this.setupEvents();
        this.sdk.updateHUD(this.score);
        this.loop();
    },
    setupFish() {
        const types = [
            { name: "Goldfish", emoji: "🐠", weightMin: 0.2, weightMax: 1.5, points: 15 },
            { name: "Salmon", emoji: "🐟", weightMin: 3.0, weightMax: 12.0, points: 40 },
            { name: "Marlin", emoji: "🐬", weightMin: 25.0, weightMax: 90.0, points: 80 },
            { name: "White Shark", emoji: "🦈", weightMin: 120.0, weightMax: 450.0, points: 150 },
            { name: "Cookie Dolphin", emoji: "🍪", weightMin: 30.0, weightMax: 50.0, points: 500 }
        ];
        
        this.fishes = Array.from({ length: 6 }, () => {
            const t = types[Math.floor(Math.random() * (types.length - 1))]; // exclude cookie dolphin from raw randomizer base spawn
            return {
                x: Math.random() * 320,
                y: 90 + Math.random() * 260,
                vx: (0.4 + Math.random() * 1.5) * (Math.random() < 0.5 ? 1 : -1),
                type: t
            };
        });
        
        // 4% chance to inject super rare Cookie fish on load
        if (Math.random() < 0.08) {
            this.fishes.push({
                x: 200,
                y: 320,
                vx: 1.2,
                type: types[4] // Cookie Dolphin!
            });
        }
    },
    spawnReplacementFish() {
        const types = [
            { name: "Goldfish", emoji: "🐠", weightMin: 0.2, weightMax: 1.5, points: 15 },
            { name: "Salmon", emoji: "🐟", weightMin: 3.0, weightMax: 12.0, points: 40 },
            { name: "Marlin", emoji: "🐬", weightMin: 25.0, weightMax: 90.0, points: 80 },
            { name: "White Shark", emoji: "🦈", weightMin: 120.0, weightMax: 450.0, points: 150 },
            { name: "Cookie Dolphin", emoji: "🍪", weightMin: 30.0, weightMax: 50.0, points: 500 }
        ];
        
        const rarityVal = Math.random();
        const t = (rarityVal < 0.08) ? types[4] : types[Math.floor(Math.random() * 4)];
        
        const spawnFromLeft = Math.random() < 0.5;
        this.fishes.push({
            x: spawnFromLeft ? -30 : 370,
            y: 90 + Math.random() * 260,
            vx: (0.4 + Math.random() * 1.5) * (spawnFromLeft ? 1 : -1),
            type: t
        });
    },
    setupEvents() {
        const handleAction = (clientX) => {
            if (!this.isRunning) return;
            const rect = this.canvas.getBoundingClientRect();
            const tx = (clientX - rect.left) * (340 / rect.width);
            this.boatX = Math.max(30, Math.min(310, tx));
            
            // Drop line on click if idle
            if (this.hook.state === "idle") {
                this.hook.state = "sinking";
                this.hook.x = this.boatX;
                this.sdk.sound.playTap();
                this.saveGameState();
            }
        };
        
        this.canvas.onmousedown = (e) => handleAction(e.clientX);
        this.canvas.onmousemove = (e) => {
            if (e.buttons === 1) {
                // update boat coordinate with sliding drag
                const rect = this.canvas.getBoundingClientRect();
                const tx = (e.clientX - rect.left) * (340 / rect.width);
                this.boatX = Math.max(30, Math.min(310, tx));
            }
        };
        
        this.canvas.ontouchstart = (e) => {
            e.preventDefault();
            handleAction(e.touches[0].clientX);
        };
        this.canvas.ontouchmove = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const tx = (e.touches[0].clientX - rect.left) * (340 / rect.width);
            this.boatX = Math.max(30, Math.min(310, tx));
        };
    },
    loop() {
        if (!this.isRunning) return;
        this.ctx.clearRect(0, 0, 340, 420);
        
        // 1. Draw Surface water sky boundary
        this.ctx.fillStyle = "#a5f3fc"; // Sky light cyan
        this.ctx.fillRect(0, 0, 340, 50);
        this.ctx.fillStyle = "#1e3a8a"; // sea floor line
        
        // Draw sea surface ripple sparkles
        this.ctx.fillStyle = "rgba(255,255,255,0.4)";
        for (let i = 0; i < 4; i++) {
            let offset = (Date.now() / 40 + i * 90) % 350;
            this.ctx.fillRect(offset, 48, 25, 2.5);
        }
        
        // 2. Draw Boat
        this.ctx.save();
        this.ctx.translate(this.boatX, 48);
        
        // cute rocking effect
        let rock = Math.sin(Date.now() / 240) * 0.04;
        this.ctx.rotate(rock);
        
        // Hull
        this.ctx.fillStyle = "#92400e"; // Brown wood
        this.ctx.beginPath();
        this.ctx.moveTo(-18, 0);
        this.ctx.lineTo(18, 0);
        this.ctx.lineTo(12, 10);
        this.ctx.lineTo(-12, 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Stick pole
        this.ctx.strokeStyle = "#cbd5e1";
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(24, -14);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // 3. Update & Draw Fishes
        this.fishes.forEach(f => {
            f.x += f.vx;
            // boundary loop around
            if (f.vx > 0 && f.x > 360) f.x = -30;
            else if (f.vx < 0 && f.x < -30) f.x = 350;
            
            // swim vertical sine sway
            f.y += Math.sin(Date.now() / 350 + f.x / 40) * 0.22;
            
            this.ctx.save();
            this.ctx.translate(f.x, f.y);
            // Flip emoji depending on velocity direction
            if (f.vx < 0) {
                this.ctx.scale(-1, 1);
            }
            this.ctx.font = f.type.name === "White Shark" ? "24px systems" : "18px systems";
            this.ctx.fillText(f.type.emoji, -8, 6);
            this.ctx.restore();
        });
        
        // 4. Update & Draw Hook Fishing Line
        if (this.hook.state === "sinking") {
            this.hook.y += this.hook.speed;
            if (this.hook.y >= this.hook.maxDepth) {
                this.hook.state = "reeling";
            }
            
            // Check Collision with any swimming fish
            this.fishes.forEach((f, idx) => {
                if (Math.hypot(f.x - this.hook.x, f.y - this.hook.y) < 22) {
                    // Captured!
                    this.hook.state = "reeling";
                    this.hook.catchObj = f.type;
                    this.fishes.splice(idx, 1); // remove from swimmer list
                    this.sdk.sound.playTap();
                }
            });
        } else if (this.hook.state === "reeling") {
            this.hook.y -= this.hook.speed * 1.25;
            
            // Pull captured fish up with hook coordinates
            if (this.hook.catchObj) {
                this.ctx.save();
                this.ctx.translate(this.hook.x, this.hook.y + 12);
                this.ctx.font = "18px systems";
                this.ctx.fillText(this.hook.catchObj.emoji, -8, 6);
                this.ctx.restore();
            }
            
            // Arrived back at surface boat!
            if (this.hook.y <= 48) {
                this.hook.y = 48;
                this.hook.state = "idle";
                
                if (this.hook.catchObj) {
                    this.handleFishLand(this.hook.catchObj);
                    this.hook.catchObj = null;
                }
            }
        } else {
            // idle, stays beneath the boat tip
            this.hook.x = this.boatX + 24; // offset near pole tip
            this.hook.y = 48;
        }
        
        // Draw the fishing cord line down to hook
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.boatX + rock * 2, 44);
        this.ctx.lineTo(this.hook.x, this.hook.y);
        this.ctx.stroke();
        
        // Small metal J hook tip icon
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#94a3b8";
        this.ctx.lineWidth = 1.6;
        this.ctx.arc(this.hook.x, this.hook.y, 4, 0, Math.PI);
        this.ctx.stroke();
        
        requestAnimationFrame(() => this.loop());
    },
    handleFishLand(f) {
        // Calculate random weight
        const wt = +(f.weightMin + Math.random() * (f.weightMax - f.weightMin)).toFixed(1);
        
        if (f.name === "Cookie Dolphin") {
            window.triggerEasterEgg(500, "LEGENDARY COOKIE FISH CAUGHT");
        } else {
            this.score += f.points;
            this.sdk.updateHUD(this.score);
            this.sdk.sound.playMerge();
        }
        
        // Update collection statistics logs
        this.caughtList[f.name] = (this.caughtList[f.name] || 0) + 1;
        if (wt > this.largestFishWeight) {
            this.largestFishWeight = wt;
        }
        
        // Render HUD summary tag label
        const countValues = Object.values(this.caughtList).reduce((a, b) => a + b, 0);
        this.container.querySelector("#fishing-stats-panel").innerText = `🐠 Caught: ${countValues} | Max Wt: ${this.largestFishWeight.toFixed(1)} kg`;
        
        // Show stylish toast success
        const toast = this.container.querySelector("#fishing-toast");
        toast.innerHTML = `<span style="font-size:18px;">🎉</span> Caught <strong>${f.name}</strong>!<br>Weight: ${wt} kg (+${f.points} PTS)`;
        toast.style.display = "block";
        
        // Particle feedback
        window.burstEmoji("✨", this.hook.x, 80);
        
        setTimeout(() => {
            toast.style.display = "none";
        }, 2500);
        
        // Re-spawn a new replacement fish deeper down
        setTimeout(() => {
            if (this.isRunning) {
                this.spawnReplacementFish();
                this.saveGameState();
            }
        }, 1500);
        this.saveGameState();
    },
    destroy() {
        this.isRunning = false;
    }
};
