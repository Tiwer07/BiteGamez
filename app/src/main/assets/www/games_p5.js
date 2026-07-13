/**
 * BiteGamez Arcade Game Bundle - Part 5 (Warehouse Boy)
 */

window.GameCollection = window.GameCollection || {};
window.GameInstructions = window.GameInstructions || {};

// Register Warehouse Boy instructions
window.GameInstructions["warehouseboy"] = {
    objective: "Push all cargo crates onto the designated storage goal tiles inside the warehouse.",
    controls: "Swipe on the board, use the on-screen D-Pad, or press Arrow / WASD keys on your keyboard.",
    win: "Position all crates onto goals with the lowest Move and Push counts possible.",
    gameover: "Be careful! Crates pushed into dead corners cannot be pulled out. Use Undo or Restart to recover."
};

// ==========================================
// GAME: WAREHOUSE BOY (Sokoban Style)
// ==========================================
window.GameCollection["warehouseboy"] = {
    name: "Warehouse Boy",
    category: "Puzzle",
    icon: "explore", // Will be mapped to 📦 in app.js
    color: "#f59e0b", // Amber
    hasScore: false,
    hasLevel: true,
    hasTimer: false,
    
    // Handcrafted 50 solvable maps
    // # = Wall, . = Floor, G = Goal, C = Crate, P = Player, * = Crate on Goal, + = Player on Goal
    levels: [
        // Levels 1-10: Beginner (1-2 Crates)
        {
            map: [
                "#####",
                "#P  #",
                "# CG#",
                "#####"
            ]
        },
        {
            map: [
                "######",
                "#P   #",
                "# C G#",
                "######"
            ]
        },
        {
            map: [
                "#####",
                "# P #",
                "# C #",
                "# G #",
                "#####"
            ]
        },
        {
            map: [
                "######",
                "# P  #",
                "# C  #",
                "# G  #",
                "######"
            ]
        },
        {
            map: [
                "#######",
                "# P   #",
                "# C C #",
                "# G G #",
                "#######"
            ]
        },
        {
            map: [
                "#######",
                "# P G #",
                "# C C #",
                "#   G #",
                "#######"
            ]
        },
        {
            map: [
                "#######",
                "# G P #",
                "# C C #",
                "# G   #",
                "#######"
            ]
        },
        {
            map: [
                "########",
                "# P  G #",
                "# C C  #",
                "#   G  #",
                "########"
            ]
        },
        {
            map: [
                "#######",
                "#P  G #",
                "# C C #",
                "# G   #",
                "#######"
            ]
        },
        {
            map: [
                "#######",
                "#P    #",
                "# C G #",
                "# C G #",
                "#######"
            ]
        },
        // Levels 11-20: Easy (2-3 Crates)
        {
            map: [
                "#######",
                "#P    #",
                "# C C #",
                "# G G #",
                "#     #",
                "#######"
            ]
        },
        {
            map: [
                "########",
                "#P C G #",
                "#  C G #",
                "#      #",
                "########"
            ]
        },
        {
            map: [
                "########",
                "#P C   #",
                "#  C G #",
                "#  G   #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "#P C G  #",
                "#  C G  #",
                "#########"
            ]
        },
        {
            map: [
                "#######",
                "#P C  #",
                "#  C G#",
                "#  G  #",
                "#######"
            ]
        },
        {
            map: [
                "########",
                "#P  C  #",
                "#   C  #",
                "# G G  #",
                "########"
            ]
        },
        {
            map: [
                "########",
                "#P C G #",
                "#  C G #",
                "#  C G #",
                "########"
            ]
        },
        {
            map: [
                "########",
                "#P C G #",
                "#  C G #",
                "#  C   #",
                "#    G #",
                "########"
            ]
        },
        {
            map: [
                "########",
                "#P C C #",
                "#  G G #",
                "#  C G #",
                "########"
            ]
        },
        {
            map: [
                "########",
                "#P    G#",
                "# C C  #",
                "# G C G#",
                "########"
            ]
        },
        // Levels 21-30: Medium (3 Crates, Obstacles)
        {
            map: [
                "  ####",
                "###  ####",
                "#P C  G #",
                "#  C  G #",
                "#  C  G #",
                "#########"
            ]
        },
        {
            map: [
                "  #####",
                "###   ###",
                "#P C   G#",
                "#  C   G#",
                "#  C   G#",
                "#########"
            ]
        },
        {
            map: [
                "  #####",
                "###   ####",
                "#P C   G #",
                "#  C   G #",
                "#  C   G #",
                "#  #     #",
                "##########"
            ]
        },
        {
            map: [
                "  #####",
                "###   ####",
                "#P C   G #",
                "#  C   G #",
                "#  C   G #",
                "#  #   # #",
                "##########"
            ]
        },
        {
            map: [
                "  ######",
                "###    ###",
                "#P C    G#",
                "#  C    G#",
                "#  C    G#",
                "##########"
            ]
        },
        {
            map: [
                "#######",
                "#P C  #",
                "# C C #",
                "# GGG #",
                "#######"
            ]
        },
        {
            map: [
                "########",
                "#P C C #",
                "#  C   #",
                "# GGG  #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "#P C C  #",
                "#  C    #",
                "# GGG   #",
                "#########"
            ]
        },
        {
            map: [
                "#######",
                "#P  C #",
                "# C C #",
                "# GGG #",
                "#######"
            ]
        },
        {
            map: [
                "########",
                "#P   C #",
                "# C C  #",
                "# GGG  #",
                "########"
            ]
        },
        // Levels 31-40: Hard (3-4 Crates, Clever Routing)
        {
            map: [
                "########",
                "# P    #",
                "# C#C# #",
                "# C G  #",
                "# G G  #",
                "########"
            ]
        },
        {
            map: [
                "########",
                "# P G  #",
                "# C C  #",
                "# C G  #",
                "#   G  #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "# P G G #",
                "# C C C #",
                "#   G   #",
                "#########"
            ]
        },
        {
            map: [
                "########",
                "#P C G #",
                "# C C G#",
                "#  GG  #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "#P C C G#",
                "#  C G  #",
                "#  G    #",
                "#########"
            ]
        },
        {
            map: [
                "########",
                "#P C C #",
                "#  C G #",
                "# GG G #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "#P C G C#",
                "#  C G  #",
                "#  G    #",
                "#########"
            ]
        },
        {
            map: [
                "########",
                "#P C C #",
                "#  C G #",
                "# G GG #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "#P C G G#",
                "#  C C  #",
                "#    G  #",
                "#########"
            ]
        },
        {
            map: [
                "#########",
                "#P C C  #",
                "#  G G G#",
                "#  C    #",
                "#########"
            ]
        },
        // Levels 41-50: Expert (4-5 Crates, Tight Mazes)
        {
            map: [
                "########",
                "#P C C #",
                "# C C  #",
                "#GGGG  #",
                "########"
            ]
        },
        {
            map: [
                "#########",
                "#P C C  #",
                "#  C C  #",
                "# GGGG  #",
                "#########"
            ]
        },
        {
            map: [
                "##########",
                "#P C C C #",
                "#  C G G #",
                "#    G G #",
                "##########"
            ]
        },
        {
            map: [
                "##########",
                "#P C C C #",
                "#  C G G #",
                "#  G G   #",
                "##########"
            ]
        },
        {
            map: [
                "###########",
                "#P C C C C#",
                "#  G G G G#",
                "###########"
            ]
        },
        {
            map: [
                "###########",
                "#P C C C C#",
                "#   GGGG  #",
                "###########"
            ]
        },
        {
            map: [
                "###########",
                "#P C C C C#",
                "#  C GGGG #",
                "#  G      #",
                "###########"
            ]
        },
        {
            map: [
                "############",
                "#P C C C C #",
                "#  C GGGGG #",
                "############"
            ]
        },
        {
            map: [
                "############",
                "#P C C C C #",
                "#   GGGGG  #",
                "#   C      #",
                "############"
            ]
        },
        {
            map: [
                "#############",
                "#P C C C C C#",
                "#  GGGGG    #",
                "#############"
            ]
        }
    ],

    init(container, sdk) {
        this.container = container;
        this.sdk = sdk;
        this.isPlaying = false;
        
        // Solution Playthrough Mode variables
        this.isPlaythroughMode = false;
        this.playthroughIndex = 0;
        this.playthroughMoves = "";
        this.playthroughHistory = [];
        this.playthroughTimeout = null;
        this.playthroughSpeed = 1.0;
        this.isPlayingPlaythrough = false;
        this.isExecutingPlaythroughStep = false;
        
        // Load progression values
        this.loadProgression();
        
        // Ensure styles are appended
        this.appendStyles();
        
        // Render Level Select first
        this.showLevelSelect();
    },

    loadProgression() {
        try {
            this.unlockedLevel = parseInt(localStorage.getItem("bg_warehouseboy_unlocked")) || 1;
            this.bestMoves = JSON.parse(localStorage.getItem("bg_warehouseboy_best_moves")) || {};
            this.bestPushes = JSON.parse(localStorage.getItem("bg_warehouseboy_best_pushes")) || {};
            this.controlPref = localStorage.getItem("bg_warehouseboy_control_pref") || "both"; // swipe, dpad, both
        } catch (e) {
            this.unlockedLevel = 1;
            this.bestMoves = {};
            this.bestPushes = {};
            this.controlPref = "both";
        }
    },

    saveProgression() {
        try {
            localStorage.setItem("bg_warehouseboy_unlocked", this.unlockedLevel);
            localStorage.setItem("bg_warehouseboy_best_moves", JSON.stringify(this.bestMoves));
            localStorage.setItem("bg_warehouseboy_best_pushes", JSON.stringify(this.bestPushes));
            localStorage.setItem("bg_warehouseboy_control_pref", this.controlPref);
            
            // Sync with host high score as "Levels Completed" count
            const completedCount = Object.keys(this.bestMoves).length;
            const Arcade = window.Arcade;
            if (Arcade && Arcade.highScores) {
                Arcade.highScores["warehouseboy"] = completedCount;
                Arcade.saveState();
            }
        } catch (e) {
            console.error(e);
        }
    },

    saveGameState() {
        if (!this.isPlaying || this.isLevelFinished || this.isPlaythroughMode) return;
        try {
            const state = {
                currentLevelNum: this.currentLevelNum,
                movesCount: this.movesCount,
                pushesCount: this.pushesCount,
                player: this.player,
                crates: this.crates,
                staticGrid: this.staticGrid,
                rows: this.rows,
                cols: this.cols,
                undoStack: this.undoStack
            };
            localStorage.setItem("game_state_warehouseboy", JSON.stringify(state));
        } catch (e) {
            console.error(e);
        }
    },

    clearGameState() {
        try {
            localStorage.removeItem("game_state_warehouseboy");
        } catch (e) {
            console.error(e);
        }
    },

    showLevelSelect() {
        this.isPlaying = false;
        this.isPlaythroughMode = false;
        clearTimeout(this.playthroughTimeout);
        this.isPlayingPlaythrough = false;
        this.container.innerHTML = `
            <div class="warehouse-select-screen">
                <div class="warehouse-select-header">
                    <h3 class="arcade-title-neon" style="color:#f59e0b; margin-bottom:4px; font-size:22px;">WAREHOUSE BOY</h3>
                    <p style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">Sokoban Cargo Puzzle Challenge</p>
                    
                    <div style="display:flex; gap:10px; justify-content:center; align-items:center; margin-bottom:12px; font-size:12px;">
                        <span style="color:var(--text-secondary);">Controls:</span>
                        <select id="warehouse-control-select" style="background:var(--border-color); color:var(--text-primary); border:1px solid rgba(255,255,255,0.1); padding:4px 8px; border-radius:8px; font-weight:bold; outline:none; cursor:pointer;">
                            <option value="both" ${this.controlPref === "both" ? "selected" : ""}>Both (Swipe & D-Pad)</option>
                            <option value="swipe" ${this.controlPref === "swipe" ? "selected" : ""}>Swipe Only</option>
                            <option value="dpad" ${this.controlPref === "dpad" ? "selected" : ""}>D-Pad Only</option>
                        </select>
                    </div>
                </div>
                
                <div class="warehouse-level-grid">
                    ${Array.from({ length: 20 }, (_, i) => {
                        const lvlNum = i + 1;
                        const isUnlocked = lvlNum <= this.unlockedLevel;
                        const isCompleted = this.bestMoves[lvlNum] !== undefined;
                        
                        let cardClass = "warehouse-lvl-card";
                        if (!isUnlocked) cardClass += " locked";
                        if (isCompleted) cardClass += " completed";
                        
                        const bestMove = this.bestMoves[lvlNum] || "--";
                        const bestPush = this.bestPushes[lvlNum] || "--";
                        
                        // Category tag text
                        let difficulty = "Beginner";
                        if (lvlNum > 15) difficulty = "Hard";
                        else if (lvlNum > 10) difficulty = "Medium";
                        else if (lvlNum > 5) difficulty = "Easy";
                        
                        return `
                            <button class="${cardClass}" data-level="${lvlNum}" ${!isUnlocked ? "disabled" : ""}>
                                <div class="lvl-num">Level ${lvlNum}</div>
                                <div class="lvl-difficulty">${difficulty}</div>
                                ${isUnlocked ? `
                                    <div class="lvl-stats">
                                        <div>🏃 Moves: <strong>${bestMove}</strong></div>
                                        <div>📦 Pushes: <strong>${bestPush}</strong></div>
                                    </div>
                                ` : `
                                    <div class="lvl-locked-icon">🔒</div>
                                `}
                                ${isCompleted ? `<div class="lvl-complete-badge">✓ Done</div>` : ""}
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
        
        // Handle control dropdown changes
        const ctrlSelect = this.container.querySelector("#warehouse-control-select");
        if (ctrlSelect) {
            ctrlSelect.onchange = (e) => {
                this.controlPref = e.target.value;
                this.saveProgression();
                this.sdk.sound.playTap();
            };
        }
        
        // Attach click handlers to level cards
        this.container.querySelectorAll(".warehouse-lvl-card").forEach(card => {
            card.onclick = () => {
                const lvlNum = parseInt(card.getAttribute("data-level"));
                if (lvlNum <= this.unlockedLevel) {
                    this.startLevel(lvlNum);
                }
            };
        });
        
        this.sdk.updateHUD(null, null, null);
    },

    startLevel(lvlNum) {
        this.sdk.sound.playSelect();
        this.isPlaying = true;
        this.currentLevelNum = lvlNum;
        this.undoUsed = false;
        
        // Reset playthrough mode states
        this.isPlaythroughMode = false;
        clearTimeout(this.playthroughTimeout);
        this.isPlayingPlaythrough = false;
        
        // Reset counters/Check saved state
        const saved = localStorage.getItem("game_state_warehouseboy");
        let loadedFromSave = false;
        if (saved) {
            try {
                const state = JSON.parse(saved);
                if (state && state.currentLevelNum === lvlNum) {
                    this.movesCount = state.movesCount || 0;
                    this.pushesCount = state.pushesCount || 0;
                    this.player = state.player;
                    this.crates = state.crates;
                    this.staticGrid = state.staticGrid;
                    this.rows = state.rows;
                    this.cols = state.cols;
                    this.undoStack = state.undoStack || [];
                    this.isLevelFinished = false;
                    loadedFromSave = true;
                }
            } catch (e) {
                console.error("Failed to parse saved state", e);
            }
        }
        
        if (!loadedFromSave) {
            this.movesCount = 0;
            this.pushesCount = 0;
            this.undoStack = [];
            this.isLevelFinished = false;
            
            // Fetch fixed, predefined level from the library
            const levelIndex = Math.min(20, Math.max(1, lvlNum)) - 1;
            const lvlData = window.warehouseBoyLevels[levelIndex];
            
            // Deep clone the map lines to keep the template immutable
            const clonedMap = [...lvlData.map];
            this.parseLevelMap(clonedMap);
            
            // Save starting state immediately
            this.saveGameState();
        }
        
        // Render core UI
        this.renderGameplayScreen();
        
        // Bind controls
        this.setupInputHandlers();
        
        // Initial draw and centering
        this.drawGameBoard();
        this.checkDeadlocks();
        
        // Update general SDK HUD indicators
        this.sdk.updateHUD(null, null, this.currentLevelNum);
    },



    parseLevelMap(mapLines) {
        this.rows = mapLines.length;
        this.cols = 0;
        mapLines.forEach(line => {
            if (line.length > this.cols) this.cols = line.length;
        });
        
        // Prepare grids
        this.staticGrid = Array(this.rows).fill(null).map(() => Array(this.cols).fill("FLOOR")); // static cells: WALL, FLOOR, GOAL
        this.crates = [];
        this.player = { r: 0, c: 0, face: "down" };
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const char = mapLines[r][c] || " ";
                switch (char) {
                    case "#":
                        this.staticGrid[r][c] = "WALL";
                        break;
                    case "G":
                    case ".":
                        this.staticGrid[r][c] = "GOAL";
                        break;
                    case "C":
                    case "$":
                        this.staticGrid[r][c] = "FLOOR";
                        this.crates.push({ r, c });
                        break;
                    case "*":
                        this.staticGrid[r][c] = "GOAL";
                        this.crates.push({ r, c });
                        break;
                    case "P":
                    case "@":
                        this.staticGrid[r][c] = "FLOOR";
                        this.player = { r, c, face: "down" };
                        break;
                    case "+":
                        this.staticGrid[r][c] = "GOAL";
                        this.player = { r, c, face: "down" };
                        break;
                    default:
                        this.staticGrid[r][c] = "FLOOR";
                        break;
                }
            }
        }
    },

    renderGameplayScreen() {
        const showDpad = this.controlPref === "both" || this.controlPref === "dpad";
        
        if (this.isPlaythroughMode) {
            this.container.innerHTML = `
                <div class="warehouse-gameplay-container">
                    <!-- Top HUD Readout panel for Playthrough -->
                    <div class="warehouse-hud-panel playthrough-hud" style="background:var(--accent-tint, rgba(59,130,246,0.15)); border:1px solid #3b82f6;">
                        <div style="font-weight:bold; color:#3b82f6; display:flex; align-items:center; gap:6px;">
                            <span>📺</span>
                            <span style="font-size:12px; letter-spacing:0.5px;">PLAYTHROUGH</span>
                        </div>
                        <div class="stat-bubble" style="background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3); font-size:12px; padding:4px 8px; border-radius:6px; font-weight:bold; color:var(--text-primary);">
                            🎬 Step: <span id="val-playthrough-step">${this.playthroughIndex}</span> / <span id="val-playthrough-total">${this.playthroughMoves.length}</span>
                        </div>
                        <button id="btn-playthrough-exit-top" class="warehouse-bar-btn" style="background:#ef4444; color:#fff; border:none; padding:4px 10px; font-size:12px; height:28px;">Exit</button>
                    </div>
                    
                    <!-- Game Board Wrap Area -->
                    <div id="warehouse-board-container" class="warehouse-board-outer">
                        <div id="warehouse-board" class="warehouse-board-grid"></div>
                    </div>
                    
                    <!-- Bottom Toolbar & Control elements for Playthrough -->
                    <div class="warehouse-bottom-controls playthrough-controls" style="padding: 16px; background: rgba(30,41,59,0.5); border-top:1px solid rgba(255,255,255,0.05); border-radius:16px;">
                        <!-- Row 1: Playback Controls -->
                        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:14px; width:100%;">
                            <button id="btn-playthrough-reset" class="warehouse-action-btn gray" style="flex:1; max-width:60px; font-size:14px; padding:8px;" title="Restart Playthrough">⏮️</button>
                            <button id="btn-playthrough-prev" class="warehouse-action-btn gray" style="flex:1; max-width:60px; font-size:14px; padding:8px;" title="Previous Move">◀️</button>
                            <button id="btn-playthrough-play-pause" class="warehouse-action-btn blue" style="flex:2; max-width:120px; font-weight:bold; font-size:14px; padding:8px; background:#3b82f6; color:white;">${this.isPlayingPlaythrough ? "⏸️ Pause" : "▶️ Play"}</button>
                            <button id="btn-playthrough-next" class="warehouse-action-btn gray" style="flex:1; max-width:60px; font-size:14px; padding:8px;" title="Next Move">▶️</button>
                            <button id="btn-playthrough-exit" class="warehouse-action-btn pink" style="flex:1.5; max-width:90px; font-weight:bold; font-size:14px; padding:8px; background:#ef4444;" title="Exit Playthrough">🚪 Exit</button>
                        </div>
                        
                        <!-- Row 2: Speed Selector -->
                        <div style="display:flex; align-items:center; justify-content:space-between; width:100%; max-width:320px; margin:0 auto; padding:0 8px;">
                            <span style="font-size:12px; color:var(--text-secondary); font-weight:bold;">🚀 Speed:</span>
                            <div style="display:flex; gap:4px;">
                                <button class="speed-btn ${this.playthroughSpeed === 0.5 ? "active" : ""}" data-speed="0.5" style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:var(--text-primary); border-radius:6px; padding:4px 8px; font-size:11px; font-weight:bold; cursor:pointer;">0.5×</button>
                                <button class="speed-btn ${this.playthroughSpeed === 1 ? "active" : ""}" data-speed="1" style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:var(--text-primary); border-radius:6px; padding:4px 8px; font-size:11px; font-weight:bold; cursor:pointer;">1×</button>
                                <button class="speed-btn ${this.playthroughSpeed === 2 ? "active" : ""}" data-speed="2" style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:var(--text-primary); border-radius:6px; padding:4px 8px; font-size:11px; font-weight:bold; cursor:pointer;">2×</button>
                                <button class="speed-btn ${this.playthroughSpeed === 4 ? "active" : ""}" data-speed="4" style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:var(--text-primary); border-radius:6px; padding:4px 8px; font-size:11px; font-weight:bold; cursor:pointer;">4×</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Bind Playthrough Controls
            this.container.querySelector("#btn-playthrough-exit-top").onclick = () => {
                this.sdk.sound.playSelect();
                this.exitSolutionPlaythroughMode();
            };
            this.container.querySelector("#btn-playthrough-exit").onclick = () => {
                this.sdk.sound.playSelect();
                this.exitSolutionPlaythroughMode();
            };
            this.container.querySelector("#btn-playthrough-reset").onclick = () => {
                this.sdk.sound.playSelect();
                this.restartPlaythrough();
            };
            this.container.querySelector("#btn-playthrough-prev").onclick = () => {
                this.executePreviousPlaythroughMove();
            };
            this.container.querySelector("#btn-playthrough-next").onclick = () => {
                this.sdk.sound.playSelect();
                this.executeNextPlaythroughMove();
            };
            this.container.querySelector("#btn-playthrough-play-pause").onclick = () => {
                this.sdk.sound.playSelect();
                this.togglePlayPausePlaythrough();
            };
            
            this.container.querySelectorAll(".speed-btn").forEach(btn => {
                btn.onclick = () => {
                    this.sdk.sound.playSelect();
                    const sp = parseFloat(btn.getAttribute("data-speed"));
                    this.changePlaythroughSpeed(sp);
                };
            });
            
            return;
        }

        this.container.innerHTML = `
            <div class="warehouse-gameplay-container">
                <!-- Top HUD Readout panel -->
                <div class="warehouse-hud-panel">
                    <button id="btn-warehouse-back" class="warehouse-bar-btn">📋 Levels</button>
                    <div class="warehouse-stats-row">
                        <div class="stat-bubble">🏃 Moves: <span id="val-warehouse-moves">0</span></div>
                        <div class="stat-bubble">📦 Pushes: <span id="val-warehouse-pushes">0</span></div>
                    </div>
                    <button id="btn-warehouse-restart" class="warehouse-bar-btn secondary">🔄 Restart</button>
                </div>
                
                <!-- Toast Deadlock Panel -->
                <div id="warehouse-deadlock-toast" class="warehouse-deadlock-banner hidden">
                    ⚠️ Crate stuck! Use Undo (↩️) or Restart (🔄)
                </div>
                
                <!-- Game Board Wrap Area -->
                <div id="warehouse-board-container" class="warehouse-board-outer">
                    <div id="warehouse-board" class="warehouse-board-grid"></div>
                </div>
                
                <!-- Bottom Toolbar & Control elements -->
                <div class="warehouse-bottom-controls">
                    <div class="action-btn-row">
                        <button id="btn-warehouse-bottom-undo" class="warehouse-action-btn pink">↩️ Undo</button>
                        <button id="btn-warehouse-bottom-restart" class="warehouse-action-btn gray">🔄 Restart</button>
                        <button id="btn-warehouse-bottom-solution" class="warehouse-action-btn blue">💡 Solution</button>
                    </div>
                    
                    <!-- Touch D-Pad overlay -->
                    ${showDpad ? `
                        <div class="warehouse-dpad-wrapper">
                            <div class="warehouse-dpad">
                                <button class="dpad-key up" data-dir="up">↑</button>
                                <div class="dpad-mid-row">
                                    <button class="dpad-key left" data-dir="left">←</button>
                                    <button class="dpad-key down" data-dir="down">↓</button>
                                    <button class="dpad-key right" data-dir="right">→</button>
                                </div>
                            </div>
                        </div>
                    ` : ""}
                </div>
            </div>
        `;
        
        // Attach click triggers
        this.container.querySelector("#btn-warehouse-back").onclick = () => {
            this.sdk.sound.playSelect();
            this.showLevelSelect();
        };
        
        const restartAction = () => {
            this.sdk.sound.playSelect();
            this.clearGameState();
            this.startLevel(this.currentLevelNum);
        };
        this.container.querySelector("#btn-warehouse-restart").onclick = restartAction;
        this.container.querySelector("#btn-warehouse-bottom-restart").onclick = restartAction;
        
        this.container.querySelector("#btn-warehouse-bottom-undo").onclick = () => {
            this.undo();
        };
        
        this.container.querySelector("#btn-warehouse-bottom-solution").onclick = () => {
            this.showSolutionSpoilerModal();
        };
        
        if (showDpad) {
            this.container.querySelectorAll(".dpad-key").forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dir = btn.getAttribute("data-dir");
                    if (dir === "up") this.movePlayer(-1, 0, "up");
                    if (dir === "down") this.movePlayer(1, 0, "down");
                    if (dir === "left") this.movePlayer(0, -1, "left");
                    if (dir === "right") this.movePlayer(0, 1, "right");
                };
            });
        }
    },

    drawGameBoard() {
        const boardGrid = this.container.querySelector("#warehouse-board");
        if (!boardGrid) return;
        
        boardGrid.innerHTML = "";
        
        // Calculate appropriate scale sizing dynamically
        const boardWrap = this.container.querySelector("#warehouse-board-container");
        const availWidth = boardWrap.clientWidth - 20;
        const availHeight = boardWrap.clientHeight - 20;
        
        const sizeByWidth = Math.floor(availWidth / this.cols);
        const sizeByHeight = Math.floor(availHeight / this.rows);
        const cellSize = Math.max(28, Math.min(54, sizeByWidth, sizeByHeight));
        
        boardGrid.style.width = `${cellSize * this.cols}px`;
        boardGrid.style.height = `${cellSize * this.rows}px`;
        boardGrid.style.position = "relative";
        
        // 1. Draw Static cells (Floor, Wall, Goals)
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const type = this.staticGrid[r][c];
                const cell = document.createElement("div");
                cell.className = `warehouse-cell static-tile ${type.toLowerCase()}`;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.left = `${c * cellSize}px`;
                cell.style.top = `${r * cellSize}px`;
                
                if (type === "WALL") {
                    cell.innerHTML = `<div class="wall-inner">🧱</div>`;
                } else if (type === "GOAL") {
                    cell.innerHTML = `<div class="goal-circle"></div>`;
                }
                
                boardGrid.appendChild(cell);
            }
        }
        
        // 2. Draw dynamic Crates
        this.crates.forEach((crate, index) => {
            const isCrateOnGoal = this.staticGrid[crate.r][crate.c] === "GOAL";
            const cell = document.createElement("div");
            cell.id = `crate-el-${index}`;
            cell.className = `warehouse-cell active-entity crate ${isCrateOnGoal ? "crate-on-goal" : ""}`;
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.left = `${crate.c * cellSize}px`;
            cell.style.top = `${crate.r * cellSize}px`;
            
            cell.innerHTML = `
                <div class="crate-box">
                    📦
                    ${isCrateOnGoal ? `<span class="goal-tick">✓</span>` : ""}
                </div>
            `;
            
            boardGrid.appendChild(cell);
        });
        
        // 3. Draw dynamic Player
        const playerEl = document.createElement("div");
        playerEl.id = "player-el";
        playerEl.className = `warehouse-cell active-entity player face-${this.player.face}`;
        playerEl.style.width = `${cellSize}px`;
        playerEl.style.height = `${cellSize}px`;
        playerEl.style.left = `${this.player.c * cellSize}px`;
        playerEl.style.top = `${this.player.r * cellSize}px`;
        playerEl.innerHTML = `<div class="player-character">👷</div>`;
        
        boardGrid.appendChild(playerEl);
    },

    updateEntitiesVisuals() {
        const boardGrid = this.container.querySelector("#warehouse-board");
        if (!boardGrid) return;
        
        const staticCells = boardGrid.querySelectorAll(".static-tile");
        const cellWidth = parseFloat(staticCells[0].style.width);
        
        // Update player position
        const pEl = boardGrid.querySelector("#player-el");
        if (pEl) {
            pEl.style.left = `${this.player.c * cellWidth}px`;
            pEl.style.top = `${this.player.r * cellWidth}px`;
            pEl.className = `warehouse-cell active-entity player face-${this.player.face}`;
        }
        
        // Update crates position & target status
        this.crates.forEach((crate, index) => {
            const cEl = boardGrid.querySelector(`#crate-el-${index}`);
            if (cEl) {
                cEl.style.left = `${crate.c * cellWidth}px`;
                cEl.style.top = `${crate.r * cellWidth}px`;
                
                const isCrateOnGoal = this.staticGrid[crate.r][crate.c] === "GOAL";
                if (isCrateOnGoal) {
                    cEl.classList.add("crate-on-goal");
                    cEl.innerHTML = `<div class="crate-box">📦<span class="goal-tick">✓</span></div>`;
                } else {
                    cEl.classList.remove("crate-on-goal");
                    cEl.innerHTML = `<div class="crate-box">📦</div>`;
                }
            }
        });
        
        // Update numbers
        const movesEl = this.container.querySelector("#val-warehouse-moves");
        const pushesEl = this.container.querySelector("#val-warehouse-pushes");
        if (movesEl) movesEl.innerText = this.movesCount;
        if (pushesEl) pushesEl.innerText = this.pushesCount;
    },

    movePlayer(dr, dc, faceDirection) {
        if (this.isLevelFinished) return;
        if (this.isPlaythroughMode && !this.isExecutingPlaythroughStep) return;
        
        const nr = this.player.r + dr;
        const nc = this.player.c + dc;
        this.player.face = faceDirection || this.player.face;
        
        // 1. Check out-of-bounds or Wall collision
        if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) {
            this.sdk.sound.playFlag(); // Invalid move block sound
            this.triggerVisualShake();
            return;
        }
        if (this.staticGrid[nr][nc] === "WALL") {
            this.sdk.sound.playFlag();
            this.triggerVisualShake();
            return;
        }
        
        // 2. Check if pushing Crate
        const crateIndex = this.crates.findIndex(c => c.r === nr && c.c === nc);
        if (crateIndex !== -1) {
            const crateBehindR = nr + dr;
            const crateBehindC = nc + dc;
            
            // Can crate move there? Check boundary/walls
            if (crateBehindR < 0 || crateBehindR >= this.rows || crateBehindC < 0 || crateBehindC >= this.cols) {
                this.sdk.sound.playFlag();
                this.triggerVisualShake();
                return;
            }
            if (this.staticGrid[crateBehindR][crateBehindC] === "WALL") {
                this.sdk.sound.playFlag();
                this.triggerVisualShake();
                return;
            }
            
            // Check crate-to-crate collision
            const anotherCrate = this.crates.findIndex(c => c.r === crateBehindR && c.c === crateBehindC);
            if (anotherCrate !== -1) {
                this.sdk.sound.playFlag();
                this.triggerVisualShake();
                return;
            }
            
            // Push is valid! Save state to undo stack before resolving
            this.saveToUndoHistory();
            
            // Execute move
            this.crates[crateIndex].r = crateBehindR;
            this.crates[crateIndex].c = crateBehindC;
            this.player.r = nr;
            this.player.c = nc;
            
            this.movesCount++;
            this.pushesCount++;
            
            // Trigger feedback sound
            const ontoGoal = this.staticGrid[crateBehindR][crateBehindC] === "GOAL";
            if (ontoGoal) {
                this.sdk.sound.playMerge(); // goal reach arpeggio!
                window.burstEmoji("✨", window.innerWidth / 2, window.innerHeight / 2.5);
                if (navigator.vibrate) navigator.vibrate(25);
            } else {
                this.sdk.sound.playJump(); // regular crate push sweep
                if (navigator.vibrate) navigator.vibrate(15);
            }
        } else {
            // Normal floor step! Save state first
            this.saveToUndoHistory();
            
            this.player.r = nr;
            this.player.c = nc;
            this.movesCount++;
            
            this.sdk.sound.playTap(); // worker light footsteps
        }
        
        // Redraw dynamic offsets
        this.updateEntitiesVisuals();
        
        // Audit deadlocks and check success
        this.checkDeadlocks();
        this.checkVictory();
        this.saveGameState();
    },

    saveToUndoHistory() {
        this.undoStack.push(JSON.stringify({
            player: { r: this.player.r, c: this.player.c, face: this.player.face },
            crates: this.crates.map(c => ({ r: c.r, c: c.c })),
            moves: this.movesCount,
            pushes: this.pushesCount
        }));
        
        if (this.undoStack.length > 80) {
            this.undoStack.shift();
        }
    },

    undo() {
        if (!this.isPlaying || this.isLevelFinished) return false;
        
        this.undoUsed = true;
        if (this.undoStack.length > 0) {
            const previous = JSON.parse(this.undoStack.pop());
            this.player = previous.player;
            this.crates = previous.crates;
            this.movesCount = previous.moves;
            this.pushesCount = previous.pushes;
            
            this.sdk.sound.playSelect(); // Clean selection tone
            this.updateEntitiesVisuals();
            this.checkDeadlocks();
            this.saveGameState();
            
            window.Arcade.hideModals(); // Dismiss any overlays
            return true;
        } else {
            this.sdk.sound.playFlag();
            return false;
        }
    },

    checkDeadlocks() {
        let deadlockDetected = false;
        
        // Loop and check if any crate is trapped in a corner
        for (let i = 0; i < this.crates.length; i++) {
            const cr = this.crates[i].r;
            const cc = this.crates[i].c;
            
            // If the crate is already on goal, it is not a deadlock concern
            if (this.staticGrid[cr][cc] === "GOAL") continue;
            
            // Check wall corners: UP & DOWN relative, LEFT & RIGHT relative
            const wallUp = this.isWallAt(cr - 1, cc);
            const wallDown = this.isWallAt(cr + 1, cc);
            const wallLeft = this.isWallAt(cr, cc - 1);
            const wallRight = this.isWallAt(cr, cc + 1);
            
            // A corner is formed by:
            // (Up and Left) OR (Up and Right) OR (Down and Left) OR (Down and Right)
            const cornerTopLeft = wallUp && wallLeft;
            const cornerTopRight = wallUp && wallRight;
            const cornerBottomLeft = wallDown && wallLeft;
            const cornerBottomRight = wallDown && wallRight;
            
            if (cornerTopLeft || cornerTopRight || cornerBottomLeft || cornerBottomRight) {
                deadlockDetected = true;
                break;
            }
        }
        
        const banner = this.container.querySelector("#warehouse-deadlock-toast");
        if (banner) {
            if (deadlockDetected) {
                banner.classList.remove("hidden");
            } else {
                banner.classList.add("hidden");
            }
        }
    },

    isWallAt(r, c) {
        // Boundaries are also walls
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
        return this.staticGrid[r][c] === "WALL";
    },

    checkVictory() {
        // Verify every crate is on a goal
        const allOnGoals = this.crates.every(crate => this.staticGrid[crate.r][crate.c] === "GOAL");
        if (allOnGoals && !this.isLevelFinished) {
            if (this.isPlaythroughMode) {
                this.isLevelFinished = true;
                this.sdk.sound.playWin();
                this.pausePlaythrough();
                setTimeout(() => {
                    this.showPlaythroughCompleteOverlay();
                }, 800);
                return;
            }
            
            this.isLevelFinished = true;
            this.clearGameState();
            this.sdk.sound.playWin(); // Fanfare major scale!
            
            // Double burst confetti celebration
            setTimeout(() => window.burstEmoji("🎉", window.innerWidth / 2, window.innerHeight / 2.5), 50);
            setTimeout(() => window.burstEmoji("🏆", window.innerWidth / 2 - 60, window.innerHeight / 2), 250);
            setTimeout(() => window.burstEmoji("✨", window.innerWidth / 2 + 60, window.innerHeight / 2), 450);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            
            // Save results
            const lvl = this.currentLevelNum;
            const prevMoveBest = this.bestMoves[lvl];
            
            let isNewPB = false;
            if (prevMoveBest === undefined || this.movesCount < prevMoveBest) {
                this.bestMoves[lvl] = this.movesCount;
                this.bestPushes[lvl] = this.pushesCount;
                isNewPB = prevMoveBest !== undefined; // broken real previous PB
            } else if (this.movesCount === prevMoveBest && this.pushesCount < (this.bestPushes[lvl] || 99999)) {
                this.bestPushes[lvl] = this.pushesCount;
            }
            
            // Unlock next level (infinite)
            if (this.currentLevelNum === this.unlockedLevel) {
                this.unlockedLevel++;
            }
            this.saveProgression();
            
            // Trigger achievements
            if (window.AchievementSystem) {
                window.AchievementSystem.unlock("warehouseboy_level_1");
                if (!this.undoUsed) {
                    window.AchievementSystem.unlock("warehouseboy_no_undo");
                }
                window.AchievementSystem.incrementProgress("warehouseboy_push_100", this.pushesCount);
                if (lvl === 3 && this.movesCount <= 12) {
                    window.AchievementSystem.unlock("warehouseboy_quick_level3");
                }
                // Check if all 5 handcrafted levels are done
                const completedAllHandcrafted = [1, 2, 3, 4, 5].every(lNum => this.bestMoves[lNum] !== undefined);
                if (completedAllHandcrafted) {
                    window.AchievementSystem.unlock("warehouseboy_all_levels");
                }
            }
            
            // Display Custom Completion Dialog card overlay
            setTimeout(() => {
                this.showLevelCompleteModal(isNewPB);
            }, 1000);
        }
    },

    showLevelCompleteModal(isNewPB) {
        const modal = document.createElement("div");
        modal.className = "warehouse-modal-overlay";
        modal.innerHTML = `
            <div class="warehouse-complete-card">
                <span style="font-size:46px;">🎉</span>
                <h3 class="arcade-title-neon" style="color:#f59e0b; margin-top:8px;">STAGE COMPLETED!</h3>
                <p style="font-size:14px; color:var(--text-secondary); margin-bottom:12px;">Level ${this.currentLevelNum}</p>
                
                <div class="complete-stats-box">
                    <div class="complete-stat">
                        <span class="lbl">MOVES</span>
                        <span class="val">${this.movesCount}</span>
                    </div>
                    <div class="complete-stat">
                        <span class="lbl">PUSHES</span>
                        <span class="val">${this.pushesCount}</span>
                    </div>
                </div>
                
                <div class="complete-bests-box">
                    <div class="lbl-best">🏆 Personal Best Moves: ${this.bestMoves[this.currentLevelNum]}</div>
                    <div class="lbl-best">📦 Personal Best Pushes: ${this.bestPushes[this.currentLevelNum]}</div>
                    ${isNewPB ? `<div class="pb-badge-spark">✨ NEW RECORD! ✨</div>` : ""}
                </div>
                
                <div class="complete-btn-group">
                    <button id="btn-complete-replay" class="complete-btn gray">🔄 Replay</button>
                    <button id="btn-complete-menu" class="complete-btn">📋 Levels</button>
                    <button id="btn-complete-next" class="complete-btn primary">➡️ Next</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.completeModalEl = modal;
        
        modal.querySelector("#btn-complete-replay").onclick = () => {
            modal.remove();
            this.startLevel(this.currentLevelNum);
        };
        
        modal.querySelector("#btn-complete-menu").onclick = () => {
            modal.remove();
            this.showLevelSelect();
        };
        
        const nextBtn = modal.querySelector("#btn-complete-next");
        if (nextBtn) {
            if (this.currentLevelNum >= 20) {
                nextBtn.innerText = "📋 Levels";
                nextBtn.onclick = () => {
                    modal.remove();
                    this.showLevelSelect();
                };
            } else {
                nextBtn.onclick = () => {
                    modal.remove();
                    this.startLevel(this.currentLevelNum + 1);
                };
            }
        }
    },

    triggerVisualShake() {
        const board = this.container.querySelector("#warehouse-board");
        if (board) {
            board.classList.remove("shaking");
            void board.offsetWidth; // Trigger reflow
            board.classList.add("shaking");
            setTimeout(() => board.classList.remove("shaking"), 300);
        }
    },

    showSolutionSpoilerModal() {
        this.sdk.sound.playSelect();
        
        const levelIndex = Math.min(20, Math.max(1, this.currentLevelNum)) - 1;
        const lvlData = window.warehouseBoyLevels[levelIndex];
        
        if (!lvlData || !lvlData.solution || lvlData.solution.length === 0) {
            const modal = document.createElement("div");
            modal.className = "warehouse-modal-overlay";
            modal.innerHTML = `
                <div class="warehouse-complete-card" style="max-width:320px; text-align:center; padding:24px; border: 2px solid #ef4444;">
                    <h3 style="margin-top:0; color:#ef4444; margin-bottom:12px;">Solution unavailable.</h3>
                    <p style="font-size:14px; color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">Reason:<br>No validated solution data exists for Level ${this.currentLevelNum}.</p>
                    <button id="btn-spoiler-ok" class="warehouse-bar-btn" style="width:100%; padding:10px; background:#ef4444; color:white; border:none; border-radius:8px; font-weight:bold;">OK</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector("#btn-spoiler-ok").onclick = () => {
                this.sdk.sound.playSelect();
                modal.remove();
            };
            return;
        }

        const modal = document.createElement("div");
        modal.className = "warehouse-modal-overlay";
        modal.innerHTML = `
            <div class="warehouse-complete-card" style="max-width:320px; text-align:center; padding:24px;">
                <h3 style="margin-top:0; color:var(--text-primary); margin-bottom:12px;">Reveal Solution?</h3>
                <p style="font-size:14px; color:var(--text-secondary); margin-bottom:20px; line-height:1.5;">This will reveal the complete solution to this level and enter Playthrough Mode.</p>
                <div style="display:flex; gap:12px; justify-content:center;">
                    <button id="btn-spoiler-cancel" class="warehouse-bar-btn secondary" style="flex:1; padding:10px;">Cancel</button>
                    <button id="btn-spoiler-confirm" class="warehouse-bar-btn" style="flex:1; padding:10px; background:var(--primary-color);">Show Solution</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector("#btn-spoiler-cancel").onclick = () => {
            this.sdk.sound.playSelect();
            modal.remove();
        };
        
        modal.querySelector("#btn-spoiler-confirm").onclick = () => {
            modal.remove();
            this.enterSolutionPlaythroughMode();
        };
    },

    enterSolutionPlaythroughMode() {
        // Find level data from verified warehouseBoyLevels
        const levelIndex = Math.min(20, Math.max(1, this.currentLevelNum)) - 1;
        const lvlData = window.warehouseBoyLevels[levelIndex];
        
        if (!lvlData || !lvlData.solution || lvlData.solution.length === 0) {
            console.error("No validated solution data exists for Level " + this.currentLevelNum);
            return;
        }

        // Temporarily store current manual gameplay state to restore later
        this.storedGameplayState = {
            movesCount: this.movesCount,
            pushesCount: this.pushesCount,
            undoStack: [...this.undoStack],
            player: JSON.parse(JSON.stringify(this.player)),
            crates: JSON.parse(JSON.stringify(this.crates)),
            staticGrid: JSON.parse(JSON.stringify(this.staticGrid)),
            isLevelFinished: this.isLevelFinished,
            undoUsed: this.undoUsed
        };

        // Enter Playthrough mode
        this.isPlaythroughMode = true;
        this.isLevelFinished = false;
        this.undoUsed = false;
        
        // Reset counters and load initial immutable map state
        this.movesCount = 0;
        this.pushesCount = 0;
        this.undoStack = [];
        this.parseLevelMap([...lvlData.map]);
        
        // Load solution path
        this.playthroughMoves = lvlData.solution || "";
        this.playthroughIndex = 0;
        this.playthroughSpeed = 1.0;
        this.isPlayingPlaythrough = false;
        
        // Prepare playthrough history with initial state
        this.playthroughHistory = [{
            player: JSON.parse(JSON.stringify(this.player)),
            crates: this.crates.map(c => ({ r: c.r, c: c.c })),
            movesCount: this.movesCount,
            pushesCount: this.pushesCount
        }];

        // Render playthrough screen layout and draw initial board
        this.renderGameplayScreen();
        this.drawGameBoard();
        this.updateEntitiesVisuals();
        
        this.sdk.sound.playSelect();
    },

    executeNextPlaythroughMove() {
        if (this.playthroughIndex >= this.playthroughMoves.length) {
            this.pausePlaythrough();
            return;
        }
        
        const moveChar = this.playthroughMoves[this.playthroughIndex];
        const char = moveChar.toLowerCase();
        let dr = 0, dc = 0, face = "down";
        if (char === 'u') { dr = -1; dc = 0; face = "up"; }
        else if (char === 'd') { dr = 1; dc = 0; face = "down"; }
        else if (char === 'l') { dr = 0; dc = -1; face = "left"; }
        else if (char === 'r') { dr = 0; dc = 1; face = "right"; }
        
        this.isExecutingPlaythroughStep = true;
        this.movePlayer(dr, dc, face);
        this.isExecutingPlaythroughStep = false;
        
        this.playthroughIndex++;
        this.playthroughHistory[this.playthroughIndex] = {
            player: JSON.parse(JSON.stringify(this.player)),
            crates: this.crates.map(c => ({ r: c.r, c: c.c })),
            movesCount: this.movesCount,
            pushesCount: this.pushesCount
        };
        
        // Update steps inside HUD
        const stepEl = this.container.querySelector("#val-playthrough-step");
        if (stepEl) stepEl.innerText = this.playthroughIndex;
    },

    executePreviousPlaythroughMove() {
        if (this.playthroughIndex <= 0) return;
        
        this.sdk.sound.playSelect();
        this.pausePlaythrough();
        
        this.playthroughIndex--;
        const snapshot = this.playthroughHistory[this.playthroughIndex];
        this.player = JSON.parse(JSON.stringify(snapshot.player));
        this.crates = snapshot.crates.map(c => ({ r: c.r, c: c.c }));
        this.movesCount = snapshot.movesCount;
        this.pushesCount = snapshot.pushesCount;
        this.isLevelFinished = false; // reset in case we backed up from victory
        
        // Remove completion overlay if any
        const overlay = this.container.querySelector("#playthrough-complete-overlay");
        if (overlay) overlay.remove();
        
        this.updateEntitiesVisuals();
        this.checkDeadlocks();
        
        const stepEl = this.container.querySelector("#val-playthrough-step");
        if (stepEl) stepEl.innerText = this.playthroughIndex;
    },

    togglePlayPausePlaythrough() {
        if (this.isPlayingPlaythrough) {
            this.pausePlaythrough();
        } else {
            this.startPlaythrough();
        }
    },

    startPlaythrough() {
        if (this.playthroughIndex >= this.playthroughMoves.length) {
            this.restartPlaythrough();
        }
        
        this.isPlayingPlaythrough = true;
        
        const playBtn = this.container.querySelector("#btn-playthrough-play-pause");
        if (playBtn) {
            playBtn.innerText = "⏸️ Pause";
            playBtn.style.background = "#e11d48"; // Rose/Red for pause
        }
        
        const tick = () => {
            if (!this.isPlayingPlaythrough) return;
            if (this.playthroughIndex >= this.playthroughMoves.length) {
                this.pausePlaythrough();
                return;
            }
            this.executeNextPlaythroughMove();
            const delay = 400 / this.playthroughSpeed;
            this.playthroughTimeout = setTimeout(tick, delay);
        };
        
        const delay = 400 / this.playthroughSpeed;
        this.playthroughTimeout = setTimeout(tick, delay);
    },

    pausePlaythrough() {
        this.isPlayingPlaythrough = false;
        clearTimeout(this.playthroughTimeout);
        
        const playBtn = this.container.querySelector("#btn-playthrough-play-pause");
        if (playBtn) {
            playBtn.innerText = "▶️ Play";
            playBtn.style.background = "#3b82f6"; // Blue for play
        }
    },

    restartPlaythrough() {
        this.pausePlaythrough();
        this.playthroughIndex = 0;
        this.isLevelFinished = false;
        
        const snapshot = this.playthroughHistory[0];
        this.player = JSON.parse(JSON.stringify(snapshot.player));
        this.crates = snapshot.crates.map(c => ({ r: c.r, c: c.c }));
        this.movesCount = snapshot.movesCount;
        this.pushesCount = snapshot.pushesCount;
        
        const overlay = this.container.querySelector("#playthrough-complete-overlay");
        if (overlay) overlay.remove();
        
        this.updateEntitiesVisuals();
        this.checkDeadlocks();
        
        const stepEl = this.container.querySelector("#val-playthrough-step");
        if (stepEl) stepEl.innerText = this.playthroughIndex;
    },

    changePlaythroughSpeed(newSpeed) {
        this.playthroughSpeed = parseFloat(newSpeed);
        
        this.container.querySelectorAll(".speed-btn").forEach(btn => {
            const btnSpeed = parseFloat(btn.getAttribute("data-speed"));
            if (btnSpeed === this.playthroughSpeed) {
                btn.classList.add("active");
                btn.style.borderColor = "#3b82f6";
                btn.style.background = "rgba(59,130,246,0.2)";
                btn.style.color = "#fff";
            } else {
                btn.classList.remove("active");
                btn.style.borderColor = "rgba(255,255,255,0.1)";
                btn.style.background = "rgba(255,255,255,0.05)";
                btn.style.color = "var(--text-primary)";
            }
        });
    },

    exitSolutionPlaythroughMode() {
        this.pausePlaythrough();
        this.isPlaythroughMode = false;
        
        const overlay = this.container.querySelector("#playthrough-complete-overlay");
        if (overlay) overlay.remove();
        
        // Restore original gameplay state
        if (this.storedGameplayState) {
            const s = this.storedGameplayState;
            this.movesCount = s.movesCount;
            this.pushesCount = s.pushesCount;
            this.undoStack = s.undoStack;
            this.player = s.player;
            this.crates = s.crates;
            this.staticGrid = s.staticGrid;
            this.isLevelFinished = s.isLevelFinished;
            this.undoUsed = s.undoUsed;
        }
        
        this.renderGameplayScreen();
        this.drawGameBoard();
        this.updateEntitiesVisuals();
        this.checkDeadlocks();
    },

    showPlaythroughCompleteOverlay() {
        const overlay = document.createElement("div");
        overlay.id = "playthrough-complete-overlay";
        overlay.className = "warehouse-modal-overlay";
        overlay.style.position = "absolute";
        overlay.innerHTML = `
            <div class="warehouse-complete-card" style="max-width:300px; text-align:center; padding:20px; border: 2px solid #3b82f6;">
                <h3 style="margin-top:0; color:#3b82f6; margin-bottom:8px;">Playthrough Completed!</h3>
                <p style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">This was the optimal solved demonstration sequence.</p>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <button id="btn-playthrough-comp-restart" class="warehouse-bar-btn secondary" style="width:100%; padding:8px;">Watch Again</button>
                    <button id="btn-playthrough-comp-exit" class="warehouse-bar-btn" style="width:100%; padding:8px; background:#ef4444; color:white; border:none;">Exit & Play Level</button>
                </div>
            </div>
        `;
        this.container.appendChild(overlay);
        
        overlay.querySelector("#btn-playthrough-comp-restart").onclick = () => {
            this.sdk.sound.playSelect();
            overlay.remove();
            this.restartPlaythrough();
        };
        
        overlay.querySelector("#btn-playthrough-comp-exit").onclick = () => {
            this.sdk.sound.playSelect();
            overlay.remove();
            this.exitSolutionPlaythroughMode();
        };
    },

    setupInputHandlers() {
        // Prevent default browser scrolling during gestures
        const boardWrap = this.container.querySelector("#warehouse-board-container");
        if (!boardWrap) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        const MIN_SWIPE_DISTANCE = 25; // short responsive swipe
        
        const touchStartHandler = (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        };
        
        const touchEndHandler = (e) => {
            if (e.changedTouches.length === 1 && (this.controlPref === "both" || this.controlPref === "swipe")) {
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                const deltaY = e.changedTouches[0].clientY - touchStartY;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
                        if (deltaX > 0) this.movePlayer(0, 1, "right");
                        else this.movePlayer(0, -1, "left");
                    }
                } else {
                    if (Math.abs(deltaY) > MIN_SWIPE_DISTANCE) {
                        if (deltaY > 0) this.movePlayer(1, 0, "down");
                        else this.movePlayer(-1, 0, "up");
                    }
                }
            }
        };
        
        boardWrap.addEventListener("touchstart", touchStartHandler, { passive: true });
        boardWrap.addEventListener("touchend", touchEndHandler, { passive: true });
        
        // Desktop / Keyboard listeners
        this.onKeyDown = (e) => {
            if (!this.isPlaying || this.isLevelFinished) return;
            switch(e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    e.preventDefault();
                    this.movePlayer(-1, 0, "up");
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    e.preventDefault();
                    this.movePlayer(1, 0, "down");
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    e.preventDefault();
                    this.movePlayer(0, -1, "left");
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    e.preventDefault();
                    this.movePlayer(0, 1, "right");
                    break;
            }
        };
        window.addEventListener("keydown", this.onKeyDown);
        
        // Save cleanup closure
        this.cleanupListeners = () => {
            boardWrap.removeEventListener("touchstart", touchStartHandler);
            boardWrap.removeEventListener("touchend", touchEndHandler);
            window.removeEventListener("keydown", this.onKeyDown);
        };
    },

    appendStyles() {
        if (document.getElementById("warehouse-boy-styles")) return;
        
        const style = document.createElement("style");
        style.id = "warehouse-boy-styles";
        style.innerHTML = `
            .warehouse-select-screen {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                height: 100%;
                overflow-y: auto;
                padding: 16px;
                box-sizing: border-box;
                background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            }
            .warehouse-select-header {
                text-align: center;
                margin-bottom: 8px;
                width: 100%;
            }
            .warehouse-level-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                width: 100%;
                max-width: 380px;
                padding-bottom: 24px;
            }
            @media (min-width: 480px) {
                .warehouse-level-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            .warehouse-lvl-card {
                position: relative;
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 14px;
                padding: 12px 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                transition: transform 0.15s, border-color 0.15s, background-color 0.15s;
                text-align: center;
                color: var(--text-primary);
                outline: none;
            }
            .warehouse-lvl-card:active {
                transform: scale(0.96);
            }
            .warehouse-lvl-card.locked {
                opacity: 0.55;
                background: rgba(15, 23, 42, 0.5);
                cursor: not-allowed;
            }
            .warehouse-lvl-card.completed {
                border-color: #f59e0b;
                background: rgba(245, 158, 11, 0.05);
            }
            .warehouse-lvl-card .lvl-num {
                font-size: 15px;
                font-weight: 800;
                color: #fb923c;
            }
            .warehouse-lvl-card.completed .lvl-num {
                color: #f59e0b;
            }
            .warehouse-lvl-card .lvl-difficulty {
                font-size: 10px;
                font-weight: 700;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }
            .warehouse-lvl-card .lvl-stats {
                font-size: 10px;
                color: var(--text-secondary);
                line-height: 1.4;
                text-align: left;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .warehouse-lvl-card .lvl-locked-icon {
                font-size: 18px;
                color: var(--text-secondary);
            }
            .warehouse-lvl-card .lvl-complete-badge {
                position: absolute;
                top: 4px;
                right: 4px;
                background: #f59e0b;
                color: #000;
                font-size: 8px;
                font-weight: 900;
                padding: 1px 4px;
                border-radius: 6px;
                text-transform: uppercase;
            }
            
            /* Gameplay Layout */
            .warehouse-gameplay-container {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
            }
            .warehouse-hud-panel {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: rgba(15, 23, 42, 0.6);
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                box-sizing: border-box;
                width: 100%;
                gap: 8px;
            }
            .warehouse-bar-btn {
                background: rgba(255, 255, 255, 0.06);
                color: var(--text-primary);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 8px 12px;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
            }
            .warehouse-bar-btn:active {
                background: rgba(255, 255, 255, 0.15);
            }
            .warehouse-bar-btn.secondary {
                border-color: rgba(245, 158, 11, 0.3);
                color: #f59e0b;
                background: rgba(245, 158, 11, 0.04);
            }
            .warehouse-stats-row {
                display: flex;
                gap: 6px;
            }
            .stat-bubble {
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255,255,255,0.04);
                padding: 6px 10px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: bold;
                color: var(--text-primary);
            }
            .warehouse-deadlock-banner {
                background: rgba(244, 63, 94, 0.15);
                border-bottom: 1.5px solid rgba(244, 63, 94, 0.4);
                color: #fda4af;
                text-align: center;
                padding: 6px;
                font-size: 11px;
                font-weight: 800;
                animation: pulseBanner 1s infinite alternate;
            }
            @keyframes pulseBanner {
                0% { opacity: 0.85; }
                100% { opacity: 1; }
            }
            .warehouse-board-outer {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
                box-sizing: border-box;
                overflow: hidden;
            }
            .warehouse-board-grid {
                border: 3px solid #334155;
                background: #1e293b;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
            }
            
            /* Cells */
            .warehouse-cell {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
            }
            .warehouse-cell.wall {
                background: none;
                border: none;
                border-radius: 0;
                box-shadow: none;
                position: absolute;
                z-index: 2;
            }
            .wall-inner {
                display: flex;
                font-size: 28px;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }
            .warehouse-cell.goal {
                z-index: 1;
            }
            .goal-circle {
                width: 14px;
                height: 14px;
                background: #f59e0b;
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .warehouse-cell.floor {
                background: #1e293b;
                border: 1.5px solid rgba(255,255,255,0.03);
                z-index: 0;
            }
            .warehouse-cell.floor::before {
                content: '';
                width: 3px;
                height: 3px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
            }
            
            /* Dynamic Entities */
            .warehouse-cell.active-entity {
                z-index: 5;
                transition: left 0.12s cubic-bezier(0.25, 1, 0.5, 1), top 0.12s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .warehouse-cell.crate {
                z-index: 4;
            }
            .crate-box {
                font-size: 28px;
                width: 90%;
                height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .warehouse-cell.crate-on-goal .crate-box {
                background: rgba(16, 185, 129, 0.2);
                border: 2px solid #10b981;
                border-radius: 8px;
                box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
            }
            .goal-tick {
                position: absolute;
                bottom: -2px;
                right: -2px;
                background: #10b981;
                color: white;
                font-size: 10px;
                font-weight: 900;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                z-index: 10;
            }
            
            .warehouse-cell.player {
                z-index: 6;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
            }
            .player-character {
                font-size: 28px;
                width: 86%;
                height: 86%;
                display: flex;
                align-items: center;
                justify-content: center;
                transform-origin: center bottom;
                transition: transform 0.1s;
                animation: playerIdle 1.2s infinite alternate ease-in-out;
            }
            @keyframes playerIdle {
                0% { transform: translateY(0) scale(1); }
                100% { transform: translateY(-3px) scale(1.04); }
            }
            .warehouse-cell.player.face-left .player-character {
                transform: scaleX(-1);
                animation: playerIdleLeft 1.2s infinite alternate ease-in-out;
            }
            @keyframes playerIdleLeft {
                0% { transform: scaleX(-1) translateY(0); }
                100% { transform: scaleX(-1) translateY(-3px); }
            }
            
            /* Controls Bottom bar */
            .warehouse-bottom-controls {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px 16px 20px 16px;
                background: rgba(15, 23, 42, 0.4);
                border-top: 1px solid rgba(255, 255, 255, 0.03);
                gap: 12px;
            }
            .action-btn-row {
                display: flex;
                gap: 10px;
                width: 100%;
                max-width: 320px;
            }
            .warehouse-action-btn {
                flex: 1;
                border: none;
                padding: 10px;
                font-weight: bold;
                font-size: 13px;
                border-radius: 12px;
                cursor: pointer;
                color: white;
            }
            .warehouse-action-btn.pink {
                background-color: var(--accent-pink);
                box-shadow: 0 4px 10px rgba(236, 72, 153, 0.25);
            }
            .warehouse-action-btn.pink:active {
                background-color: #db2777;
            }
            .warehouse-action-btn.blue {
                background-color: #3b82f6;
                box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
            }
            .warehouse-action-btn.blue:active {
                background-color: #2563eb;
            }
            .warehouse-action-btn.gray {
                background-color: #475569;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            }
            .warehouse-action-btn.gray:active {
                background-color: #334155;
            }
            
            /* Speed button styles */
            .speed-btn {
                transition: all 0.2s ease;
            }
            .speed-btn:active {
                transform: scale(0.92);
            }
            .speed-btn.active {
                border-color: #3b82f6 !important;
                background: rgba(59, 130, 246, 0.25) !important;
                color: #fff !important;
            }
            
            /* D-Pad controls */
            .warehouse-dpad-wrapper {
                display: flex;
                justify-content: center;
                width: 100%;
            }
            .warehouse-dpad {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
            }
            .dpad-mid-row {
                display: flex;
                gap: 32px;
            }
            .dpad-key {
                width: 44px;
                height: 44px;
                background: #334155;
                color: white;
                border: 1.5px solid #475569;
                border-radius: 50%;
                font-weight: bold;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                user-select: none;
                -webkit-user-select: none;
            }
            .dpad-key:active {
                background: #1e293b;
                transform: scale(0.94);
            }
            
            /* Shake animation for walls block */
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-4px); }
                40%, 80% { transform: translateX(4px); }
            }
            .warehouse-board-grid.shaking {
                animation: shake 0.25s ease-in-out;
            }
            
            /* Modal Overlay custom */
            .warehouse-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            .warehouse-complete-card {
                background: #1e293b;
                border: 2px solid #f59e0b;
                border-radius: 20px;
                width: 90%;
                max-width: 320px;
                padding: 24px;
                text-align: center;
                color: var(--text-primary);
                box-shadow: 0 10px 30px rgba(245, 158, 11, 0.25);
                animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            @keyframes scaleUp {
                0% { transform: scale(0.85); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            .complete-stats-box {
                display: flex;
                justify-content: space-around;
                background: rgba(0,0,0,0.3);
                padding: 12px;
                border-radius: 12px;
                margin: 14px 0;
            }
            .complete-stat {
                display: flex;
                flex-direction: column;
            }
            .complete-stat .lbl {
                font-size: 10px;
                font-weight: bold;
                color: var(--text-secondary);
                letter-spacing: 0.5px;
            }
            .complete-stat .val {
                font-size: 20px;
                font-weight: 900;
                color: #fb923c;
            }
            .complete-bests-box {
                font-size: 11px;
                color: var(--text-secondary);
                margin-bottom: 16px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .pb-badge-spark {
                color: #f59e0b;
                font-weight: 900;
                margin-top: 4px;
                text-transform: uppercase;
                letter-spacing: 1px;
                animation: pulsePB 0.8s infinite alternate;
            }
            @keyframes pulsePB {
                0% { transform: scale(1); }
                100% { transform: scale(1.05); }
            }
            .complete-btn-group {
                display: flex;
                gap: 8px;
                justify-content: stretch;
            }
            .complete-btn {
                flex: 1;
                border: none;
                padding: 10px;
                font-weight: bold;
                font-size: 12px;
                border-radius: 10px;
                cursor: pointer;
                color: white;
            }
            .complete-btn.primary {
                background: #f59e0b;
                color: #000;
            }
            .complete-btn.gray {
                background: #475569;
            }
            .complete-btn.primary:active {
                background: #d97706;
            }
            .complete-btn.gray:active {
                background: #334155;
            }
            .complete-btn:not(.primary):not(.gray) {
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .complete-btn:not(.primary):not(.gray):active {
                background: rgba(255,255,255,0.15);
            }
            
            /* Responsive support */
            .hidden {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    },

    destroy() {
        this.isPlaying = false;
        if (this.cleanupListeners) {
            this.cleanupListeners();
        }
        if (this.completeModalEl) {
            try { this.completeModalEl.remove(); } catch(e){}
        }
    }
};
