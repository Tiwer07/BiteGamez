/**
 * BiteGamez Main Arcade Client Orchestration Script
 */

class ArcadeApp {
    constructor() {
        this.activeGameId = null;
        this.activeInstance = null;
        this.gameTimer = null;
        this.gameSeconds = 0;
        this.sessionStartTime = null;
        
        // Base state variables
        this.favorites = [];
        this.recentlyPlayed = [];
        this.highScores = {};
        this.globalStats = { totalPlayed: 0, totalSeconds: 0 };
        
        this.settings = { sfx: true, music: true, theme: "system" };
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.settings.theme === "system") {
                    this.applyThemeStyle();
                }
            });
        }
        
        this.playCounts = {};
        this.lastPlayedTimes = {};
        this.currentSort = "default";
        
        this.sound = window.SoundFX;
    }

    getEmojiForIcon(icon, gameId) {
        const mapping = {
            "grid_on": "🔢",          // Sudoku
            "calculate": "🧠",        // 2048
            "flight_takeoff": "🐦",   // Flappy Bird
            "rocket": "🚀",           // Cosmo Blitz
            "gavel": "🔨",            // Whack-A-Mole
            "widgets": "🧱",          // Tetris
            "hive": "🍉",             // Merge Fruits
            "directions_run": "🦖",   // Dino Runner
            "filter_vintage": "🎈",   // Balloon Pop
            "brightness_low": "💣",   // Minesweeper
            "poker_chip": "🃏",       // Solitaire
            "explore": "🕵️",          // Maze Chase
            "sports_cricket": "🏏",   // Arcade Cricket
            "star": "🐍",             // Retro Snake
            "layers": "🧱",           // Breakout
            "close": "❌",            // Tic-Tac-Toe
            "opacity": "🧪",          // Water Sort
            "photo_library": "🃏",    // Memory Match
            "directions_car": "🚗"    // Chicken Cross
        };
        
        if (gameId === "breakout") return "🏓";
        if (gameId === "chickenjump") return "🧱";
        if (gameId === "chickentower") return "🧱";
        if (gameId === "chickencrossing") return "🐸";
        if (gameId === "connect4") return "🔵";
        if (gameId === "slidingpuzzle") return "🧩";
        if (gameId === "dotsandboxes") return "✏️";
        if (gameId === "tictactoe") return "❌";
        if (gameId === "mergefruits") return "🍉";
        if (gameId === "snake") return "🐍";
        if (gameId === "archerymaster") return "🎯";
        if (gameId === "knifehit") return "🗡️";
        if (gameId === "bottleflip") return "🧪";
        if (gameId === "pipeconnect") return "🔧";
        if (gameId === "cloudadventure") return "🎈";
        if (gameId === "fishingfrenzy") return "🎣";
        if (gameId === "warehouseboy") return "📦";
        
        return mapping[icon] || "🎮";
    }

    getGameCategory(id) {
        const game = window.GameCollection[id];
        if (game && game.category) return game.category;
        
        const puzzleIds = ["sudoku", "2048", "minesweeper", "maze", "watersort", "slidingpuzzle", "dotsandboxes"];
        if (puzzleIds.includes(id)) return "Puzzle";
        
        const casualIds = ["tictactoe", "memory", "mergefruits"];
        if (casualIds.includes(id)) return "Casual";
        
        const skillIds = ["cricket"];
        if (skillIds.includes(id)) return "Skill";
        
        // Everything else is Arcade
        return "Arcade";
    }

    init() {
        this.loadState();
        this.applyThemeStyle();
        this.sound.resumeContext();
        
        this.renderAllGrids();
        this.setupMainEvents();
        this.setupDialogEvents();
        
        // Initialize and Retroactive check for Achievements
        if (window.AchievementSystem) {
            window.AchievementSystem.initializeUI(this);
            window.AchievementSystem.checkRetroactive(this);
        }
        
        const totalCount = Object.keys(window.GameCollection || {}).length;
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            searchInput.placeholder = `Search ${totalCount} Games...`;
        }
        
        // Pre-start looping background music on gesture
        document.body.addEventListener("click", () => {
            this.sound.resumeContext();
            if (this.settings.music) this.sound.startMusic();
        }, { once: true });
    }

    /* Local Data Management */
    loadState() {
        try {
            this.favorites = JSON.parse(localStorage.getItem("bg_favorites")) || [];
            this.recentlyPlayed = JSON.parse(localStorage.getItem("bg_recent")) || [];
            this.highScores = JSON.parse(localStorage.getItem("bg_highscores")) || {};
            this.globalStats = JSON.parse(localStorage.getItem("bg_globalstats")) || { totalPlayed: 0, totalSeconds: 0 };
            
            const savedSettings = JSON.parse(localStorage.getItem("bg_settings"));
            if (savedSettings) this.settings = savedSettings;

            this.playCounts = JSON.parse(localStorage.getItem("bg_playcounts")) || {};
            this.lastPlayedTimes = JSON.parse(localStorage.getItem("bg_lastplayed")) || {};
            this.currentSort = localStorage.getItem("bg_currentsort") || "default";
        } catch (e) {
            console.error("Local Storage not fully supported on this web view.", e);
        }
    }

    saveState() {
        try {
            localStorage.setItem("bg_favorites", JSON.stringify(this.favorites));
            localStorage.setItem("bg_recent", JSON.stringify(this.recentlyPlayed));
            localStorage.setItem("bg_highscores", JSON.stringify(this.highScores));
            localStorage.setItem("bg_globalstats", JSON.stringify(this.globalStats));
            localStorage.setItem("bg_settings", JSON.stringify(this.settings));
            localStorage.setItem("bg_playcounts", JSON.stringify(this.playCounts));
            localStorage.setItem("bg_lastplayed", JSON.stringify(this.lastPlayedTimes));
            localStorage.setItem("bg_currentsort", this.currentSort);
        } catch (e) {
            console.error(e);
        }
    }

    applyThemeStyle() {
        let isDark = true;
        const currentTheme = this.settings.theme || (this.settings.dark ? "dark" : (this.settings.dark === false ? "light" : "system"));
        
        if (currentTheme === "system") {
            isDark = !window.matchMedia || window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDark = (currentTheme === "dark");
        }

        if (isDark) {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
        }
    }

    /* Visual Dynamic Renderings */
    renderAllGrids(searchQuery = "") {
        const libGrid = document.getElementById("library-grid");
        const favGrid = document.getElementById("favorites-list");
        const favSection = document.getElementById("favorites-section");
        
        libGrid.innerHTML = "";
        favGrid.innerHTML = "";
        
        const query = searchQuery.trim().toLowerCase();
        let favCount = 0;
        
        let gamesList = Object.keys(window.GameCollection || {});
        
        const sortVal = this.currentSort || "default";
        if (sortVal === "recent") {
            gamesList.sort((a, b) => {
                const timeA = this.lastPlayedTimes[a] || 0;
                const timeB = this.lastPlayedTimes[b] || 0;
                if (timeA !== timeB) {
                    return timeB - timeA; // Descending order: most recent first
                }
                // Fallback to name
                const nameA = (window.GameCollection[a]?.name || "").toLowerCase();
                const nameB = (window.GameCollection[b]?.name || "").toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (sortVal === "most_played") {
            gamesList.sort((a, b) => {
                const countA = this.playCounts[a] || 0;
                const countB = this.playCounts[b] || 0;
                if (countA !== countB) {
                    return countB - countA; // Descending order: most played first
                }
                // Fallback to name
                const nameA = (window.GameCollection[a]?.name || "").toLowerCase();
                const nameB = (window.GameCollection[b]?.name || "").toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (sortVal === "alpha_az") {
            gamesList.sort((a, b) => {
                const nameA = (window.GameCollection[a]?.name || "").toLowerCase();
                const nameB = (window.GameCollection[b]?.name || "").toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (sortVal === "alpha_za") {
            gamesList.sort((a, b) => {
                const nameA = (window.GameCollection[a]?.name || "").toLowerCase();
                const nameB = (window.GameCollection[b]?.name || "").toLowerCase();
                return nameB.localeCompare(nameA);
            });
        }
        
        gamesList.forEach(id => {
            const game = window.GameCollection[id];
            const category = this.getGameCategory(id) || "";
            const matchName = game.name.toLowerCase().includes(query);
            const matchCategory = category.toLowerCase().includes(query);
            if (query && !matchName && !matchCategory) return;
            
            const best = this.highScores[id] || 0;
            const isFav = this.favorites.includes(id);
            
            const cardHTML = `
                <div class="game-card" data-id="${id}" style="border-top: 4px solid ${game.color};">
                    <button class="favorite-pin ${isFav ? 'is-favorite' : ''}" data-id="${id}">
                        ⭐
                    </button>
                    <div class="game-card-icon" style="background: linear-gradient(135deg, ${game.color} 0%, #1e1b4b 100%); display: flex; align-items: center; justify-content: center; font-size: 38px;">
                        ${this.getEmojiForIcon(game.icon, id)}
                    </div>
                    <span class="game-card-title">${game.name}</span>
                    <span class="game-card-score">${best > 0 ? 'Best: ' + (best > 100000 && id === "sudoku" ? (Math.floor(best/60) + "m " + (best % 60) + "s") : best) : 'No Record'}</span>
                    <button class="game-card-btn" style="background-color: ${game.color};">PLAY</button>
                </div>
            `;
            
            // Append elements
            libGrid.insertAdjacentHTML("beforeend", cardHTML);
            if (isFav) {
                favGrid.insertAdjacentHTML("beforeend", cardHTML);
                favCount++;
            }
        });
        
        // Show/hide favorite panel
        if (favCount > 0 && !query) {
            favSection.classList.remove("hidden");
        } else {
            favSection.classList.add("hidden");
        }
        
        // Setup card action clicks
        this.setupCardActions();
        this.renderRecentPlayed();
    }

    renderRecentPlayed() {
        const recentSec = document.getElementById("recent-section");
        const recentGrid = document.getElementById("recent-list");
        recentGrid.innerHTML = "";
        
        if (this.recentlyPlayed.length > 0) {
            recentSec.classList.remove("hidden");
            this.recentlyPlayed.forEach(id => {
                const game = window.GameCollection[id];
                if (!game) return;
                
                const cardHTML = `
                    <div class="recent-card" data-id="${id}">
                        <div class="recent-card-icon" style="background-color: ${game.color}; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            ${this.getEmojiForIcon(game.icon, id)}
                        </div>
                        <span class="recent-card-title">${game.name}</span>
                    </div>
                `;
                recentGrid.insertAdjacentHTML("beforeend", cardHTML);
            });
            
            recentGrid.querySelectorAll(".recent-card").forEach(card => {
                card.onclick = () => {
                    this.launchGame(card.getAttribute("data-id"));
                };
            });
        } else {
            recentSec.classList.add("hidden");
        }
    }

    setupCardActions() {
        document.querySelectorAll(".game-card").forEach(card => {
            const id = card.getAttribute("data-id");
            
            // Favorite pin clicks
            const pin = card.querySelector(".favorite-pin");
            pin.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(id);
            };
            
            // Full card clicks -> launch game
            card.onclick = () => {
                this.launchGame(id);
            };
        });
    }

    toggleFavorite(id) {
        this.sound.playSelect();
        const idx = this.favorites.indexOf(id);
        if (idx > -1) {
            this.favorites.splice(idx, 1);
        } else {
            this.favorites.push(id);
        }
        this.saveState();
        this.renderAllGrids(document.getElementById("search-input").value);
    }

    /* App Event Handlers */
    setupMainEvents() {
        // Search filter interactions
        const searchInput = document.getElementById("search-input");
        const clearBtn = document.getElementById("btn-clear-search");
        
        searchInput.oninput = (e) => {
            const val = e.target.value;
            if (val) clearBtn.classList.remove("hidden");
            else clearBtn.classList.add("hidden");
            this.renderAllGrids(val);
        };
        
        clearBtn.onclick = () => {
            searchInput.value = "";
            clearBtn.classList.add("hidden");
            this.renderAllGrids();
            this.sound.playTap();
        };
        
        // Settings Button trigger
        document.getElementById("btn-settings").onclick = () => {
            this.showModal("settings");
        };
        
        // Stats Button trigger
        document.getElementById("btn-stats").onclick = () => {
            this.showStatsModal();
        };

        // Library sorting selector interactions
        const sortSelect = document.getElementById("library-sort-select");
        if (sortSelect) {
            sortSelect.value = this.currentSort || "default";
            sortSelect.onchange = (e) => {
                this.currentSort = e.target.value;
                this.saveState();
                this.renderAllGrids(searchInput.value);
                this.sound.playTap();
            };
        }
    }

    setupDialogEvents() {
        // Close modals universal triggers
        document.querySelectorAll(".btn-close-modal").forEach(btn => {
            btn.onclick = () => this.hideModals();
        });
        
        // Settings sliders/switches updates
        const sfxToggle = document.getElementById("setting-sfx");
        sfxToggle.checked = this.settings.sfx;
        sfxToggle.onchange = (e) => {
            this.settings.sfx = e.target.checked;
            this.sound.toggleSFX(this.settings.sfx);
            this.saveState();
        };
        
        const musicToggle = document.getElementById("setting-music");
        musicToggle.checked = this.settings.music;
        musicToggle.onchange = (e) => {
            this.settings.music = e.target.checked;
            this.sound.toggleMusic(this.settings.music);
            this.saveState();
        };
        
        const themeSelect = document.getElementById("setting-theme-select");
        if (themeSelect) {
            themeSelect.value = this.settings.theme || (this.settings.dark ? "dark" : (this.settings.dark === false ? "light" : "system"));
            themeSelect.onchange = (e) => {
                this.settings.theme = e.target.value;
                this.applyThemeStyle();
                this.saveState();
            };
        }
        
        // Reset button
        document.getElementById("btn-reset-data").onclick = () => {
            this.showResetConfirmationModal();
        };
        
        // HUD Pause button Trigger
        document.getElementById("btn-hud-pause").onclick = () => {
            this.pauseGame();
        };

        // Universal Undo actions bindings
        const executeUndoneMove = () => {
            if (this.activeInstance && typeof this.activeInstance.undo === "function") {
                const undone = this.activeInstance.undo();
                if (undone) {
                    this.hideModals();
                    this.resumeGame();
                }
            }
        };

        const btnHudUndo = document.getElementById("btn-hud-undo");
        if (btnHudUndo) {
            btnHudUndo.onclick = (e) => {
                e.stopPropagation();
                executeUndoneMove();
            };
        }

        const btnPauseUndo = document.getElementById("btn-pause-undo");
        if (btnPauseUndo) {
            btnPauseUndo.onclick = (e) => {
                e.stopPropagation();
                executeUndoneMove();
            };
        }
        
        // Pause Dialog controllers
        document.getElementById("btn-pause-resume").onclick = () => {
            this.resumeGame();
        };
        document.getElementById("btn-pause-restart").onclick = () => {
            this.showModal("confirm-restart");
        };
        document.getElementById("btn-pause-settings").onclick = () => {
            this.showModal("settings");
        };
        document.getElementById("btn-pause-menu").onclick = () => {
            this.showModal("confirm-exit");
        };
        
        // Confirm Exits buttons
        document.getElementById("btn-exit-cancel").onclick = () => {
            this.showModal("pause");
        };
        document.getElementById("btn-exit-confirm").onclick = () => {
            this.terminateGameSession();
        };
        
        // Confirm Restart buttons
        document.getElementById("btn-restart-cancel").onclick = () => {
            this.showModal("pause");
        };
        document.getElementById("btn-restart-confirm").onclick = () => {
            this.restartGameSession();
        };
        
        // GameOver Dialog buttons
        document.getElementById("btn-gameover-replay").onclick = () => {
            this.restartGameSession();
        };
        document.getElementById("btn-gameover-menu").onclick = () => {
            this.terminateGameSession();
        };

        // Help / Instructions actions
        const btnHudHelp = document.getElementById("btn-hud-help");
        if (btnHudHelp) {
            btnHudHelp.onclick = (e) => {
                e.stopPropagation();
                if (this.activeGameId) {
                    this._cameFromPauseMenu = false;
                    this.showHelpInstructions(this.activeGameId);
                }
            };
        }

        const btnPauseInst = document.getElementById("btn-pause-instructions");
        if (btnPauseInst) {
            btnPauseInst.onclick = (e) => {
                e.stopPropagation();
                if (this.activeGameId) {
                    this._cameFromPauseMenu = true;
                    this.showHelpInstructions(this.activeGameId);
                }
            };
        }
    }

    /* Modal dialog routing controller */
    showModal(modalId) {
        document.getElementById("modal-container").classList.remove("hidden");
        document.querySelectorAll(".modal-card").forEach(el => el.classList.add("hidden"));
        document.getElementById(`modal-${modalId}`).classList.remove("hidden");
        this.sound.playTap();
    }

    showInstructionsModal(id, onStart) {
        const game = window.GameCollection[id];
        const inst = (window.GameInstructions && window.GameInstructions[id]) || {
            objective: "Play and earn the highest score possible!",
            controls: "Tap or swipe to control.",
            win: "Survive and maximize your personal best record.",
            gameover: "Standard system rules or loss of lives."
        };
        
        document.getElementById("instruction-game-icon").innerText = this.getEmojiForIcon(game.icon, id);
        document.getElementById("instruction-game-title").innerText = (game.name || "Game").toUpperCase() + " RULES";
        
        document.getElementById("instruction-val-objective").innerText = inst.objective;
        document.getElementById("instruction-val-controls").innerText = inst.controls;
        document.getElementById("instruction-val-win").innerText = inst.win;
        document.getElementById("instruction-val-gameover").innerText = inst.gameover;
        
        // Show checkbox since it is first launch
        document.getElementById("instruction-checkbox-container").style.display = "flex";
        document.getElementById("chk-instructions-skip").checked = false;
        
        const startBtn = document.getElementById("btn-instructions-start");
        startBtn.innerText = "🎮 START GAME";
        startBtn.onclick = () => {
            const skip = document.getElementById("chk-instructions-skip").checked;
            if (skip) {
                localStorage.setItem(`bg_skip_instructions_${id}`, "true");
            }
            this.hideModals();
            if (onStart) onStart();
        };
        
        this.showModal("instructions");
    }

    showHelpInstructions(id) {
        this.pauseActiveGame();
        
        const game = window.GameCollection[id];
        const inst = (window.GameInstructions && window.GameInstructions[id]) || {
            objective: "Play and earn the highest score possible!",
            controls: "Tap or swipe to control.",
            win: "Survive and maximize your personal best record.",
            gameover: "Standard system rules or loss of lives."
        };
        
        document.getElementById("instruction-game-icon").innerText = this.getEmojiForIcon(game.icon, id);
        document.getElementById("instruction-game-title").innerText = (game.name || "Game").toUpperCase() + " RULES";
        
        document.getElementById("instruction-val-objective").innerText = inst.objective;
        document.getElementById("instruction-val-controls").innerText = inst.controls;
        document.getElementById("instruction-val-win").innerText = inst.win;
        document.getElementById("instruction-val-gameover").innerText = inst.gameover;
        
        // Hide checkbox for in-game overlay help
        document.getElementById("instruction-checkbox-container").style.display = "none";
        
        const startBtn = document.getElementById("btn-instructions-start");
        startBtn.innerText = "↩️ BACK TO GAME";
        startBtn.onclick = () => {
            this.hideModals();
            this.resumeActiveGame();
        };
        
        this.showModal("instructions");
    }

    pauseActiveGame() {
        this.stopClock();
        if (this.activeInstance && typeof this.activeInstance.pause === "function") {
            try {
                this.activeInstance.pause();
            } catch (e) {
                console.warn("Pause failed", e);
            }
        }
    }

    resumeActiveGame() {
        if (this._cameFromPauseMenu) {
            this._cameFromPauseMenu = false;
            this.showModal("pause");
        } else {
            this.resumeGame();
        }
    }

    showResetConfirmationModal() {
        this.showModal("confirm-reset");
        
        const confirmBtn = document.getElementById("btn-reset-confirm");
        const cancelBtn = document.getElementById("btn-reset-cancel");
        
        // Reset to disabled state with countdown
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.5";
        confirmBtn.style.cursor = "not-allowed";
        
        let secondsLeft = 5;
        confirmBtn.innerHTML = `<span>🗑️</span> Delete (${secondsLeft}s)`;
        
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
        }
        
        this.resetInterval = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft > 0) {
                confirmBtn.innerHTML = `<span>🗑️</span> Delete (${secondsLeft}s)`;
            } else {
                clearInterval(this.resetInterval);
                this.resetInterval = null;
                confirmBtn.innerHTML = `<span>🗑️</span> Delete Now`;
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = "1";
                confirmBtn.style.cursor = "pointer";
            }
        }, 1000);
        
        cancelBtn.onclick = () => {
            if (this.resetInterval) {
                clearInterval(this.resetInterval);
                this.resetInterval = null;
            }
            this.hideModals();
        };
        
        confirmBtn.onclick = () => {
            if (confirmBtn.disabled) return;
            
            if (this.resetInterval) {
                clearInterval(this.resetInterval);
                this.resetInterval = null;
            }
            
            localStorage.clear();
            this.favorites = [];
            this.recentlyPlayed = [];
            this.highScores = {};
            this.globalStats = { totalPlayed: 0, totalSeconds: 0 };
            this.settings = { sfx: true, music: true, theme: "system" };
            this.playCounts = {};
            this.lastPlayedTimes = {};
            this.currentSort = "default";
            this.saveState();
            this.applyThemeStyle();
            
            const sfxToggle = document.getElementById("setting-sfx");
            const musicToggle = document.getElementById("setting-music");
            const themeSelect = document.getElementById("setting-theme-select");
            
            if (sfxToggle) sfxToggle.checked = true;
            if (musicToggle) musicToggle.checked = true;
            if (themeSelect) themeSelect.value = "system";
            
            const sortSelect = document.getElementById("library-sort-select");
            if (sortSelect) sortSelect.value = "default";
            
            this.renderAllGrids();
            this.hideModals();
            this.sound.playHit();
        };
    }

    hideModals() {
        if (this.resetInterval) {
            clearInterval(this.resetInterval);
            this.resetInterval = null;
        }
        document.getElementById("modal-container").classList.add("hidden");
        this.sound.playTap();
    }

    showStatsModal() {
        document.getElementById("stat-total-played").innerText = this.globalStats.totalPlayed;
        
        const minVal = Math.round(this.globalStats.totalSeconds / 60);
        document.getElementById("stat-total-time").innerText = `${minVal}m`;
        
        const bodyTable = document.getElementById("stats-table-body");
        bodyTable.innerHTML = "";
        
        Object.keys(window.GameCollection || {}).forEach(id => {
            const game = window.GameCollection[id];
            const record = this.highScores[id] || "No Record";
            
            bodyTable.insertAdjacentHTML("beforeend", `
                <tr>
                    <td style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:18px;">${this.getEmojiForIcon(game.icon, id)}</span>
                        ${game.name}
                    </td>
                    <td class="text-right">${record}</td>
                </tr>
            `);
        });
        
        this.showModal("statistics");
    }

    /* Active Game Lifecycles */
    launchGame(id) {
        this.sound.playSelect();
        this.activeGameId = id;
        this.sessionStartTime = Date.now();
        
        // Track recently played queue limits
        this.recentlyPlayed = this.recentlyPlayed.filter(gId => gId !== id);
        this.recentlyPlayed.unshift(id);
        if (this.recentlyPlayed.length > 5) this.recentlyPlayed.pop();
        
        // Update sorting stats
        this.playCounts[id] = (this.playCounts[id] || 0) + 1;
        this.lastPlayedTimes[id] = Date.now();
        
        this.saveState();
        
        // Screen toggle transitions
        document.getElementById("home-screen").classList.remove("active");
        document.getElementById("game-screen").classList.add("active");
        
        // Check if instruction needs to be displayed first
        const skipInstructions = localStorage.getItem(`bg_skip_instructions_${id}`) === "true";
        if (!skipInstructions) {
            this.showInstructionsModal(id, () => {
                this.realLaunchGame(id);
            });
        } else {
            this.realLaunchGame(id);
        }
    }

    realLaunchGame(id) {
        // Reset dynamic HUD elements variables
        this.setupCustomHUD(id);
        
        // Launch dynamic sandbox instantiation
        const gameDef = window.GameCollection[id];
        const arena = document.getElementById("game-arena");
        arena.innerHTML = "";
        
        const sdk = this.createGameSDKInstance(id);
        this.activeInstance = gameDef;
        gameDef.init(arena, sdk);
    }

    setupCustomHUD(id) {
        const game = window.GameCollection[id];
        this.currentScore = 0; // Track score dynamically for mid-game exit saving
        
        // Reset values
        document.getElementById("hud-val-score").innerText = "0";
        document.getElementById("hud-val-best").innerText = this.highScores[id] || "0";
        document.getElementById("hud-val-lives").innerText = "❤️ ❤️ ❤️";
        document.getElementById("hud-val-level").innerText = "1";
        document.getElementById("hud-val-timer").innerText = "00:00";
        
        // Check structural layouts elements
        const hudScore = document.getElementById("hud-stat-score");
        const hudBest = document.getElementById("hud-stat-best");
        const hudLives = document.getElementById("hud-stat-lives");
        const hudLevel = document.getElementById("hud-stat-level");
        const hudTimer = document.getElementById("hud-stat-timer");
        
        hudScore.className = game.hasScore !== false ? "hud-stat-item" : "hud-stat-item hidden";
        hudBest.className = game.hasScore !== false ? "hud-stat-item" : "hud-stat-item hidden";
        hudLives.className = game.hasLives ? "hud-stat-item" : "hud-stat-item hidden";
        hudLevel.className = game.hasLevel ? "hud-stat-item" : "hud-stat-item hidden";
        hudTimer.className = game.hasTimer ? "hud-stat-item" : "hud-stat-item hidden";

        // Toggle Undo capability buttons
        const UNDO_SUPPORTED_GAMES = ["sudoku", "2048", "snake", "tetris", "watersort", "breakout", "tictactoe", "minesweeper", "warehouseboy"];
        const supportsUndo = UNDO_SUPPORTED_GAMES.includes(id);
        
        const btnHudUndo = document.getElementById("btn-hud-undo");
        if (btnHudUndo) {
            btnHudUndo.style.display = supportsUndo ? "inline-flex" : "none";
        }
        
        const btnPauseUndo = document.getElementById("btn-pause-undo");
        if (btnPauseUndo) {
            btnPauseUndo.style.display = supportsUndo ? "block" : "none";
        }
    }

    createGameSDKInstance(id) {
        return {
            sound: this.sound,
            updateHUD: (score, lives = null, level = null) => {
                if (score !== null) {
                    this.currentScore = parseInt(score) || 0;
                    document.getElementById("hud-val-score").innerText = score;
                }
                if (lives !== null) {
                    const heartString = Array(Math.max(0, lives)).fill("❤️").join(" ");
                    document.getElementById("hud-val-lives").innerText = heartString || "💔";
                }
                if (level !== null) {
                    document.getElementById("hud-val-level").innerText = level;
                }
            },
            startTimer: (startTime = 0) => {
                this.stopClock();
                this.gameSeconds = startTime;
                const setTimerUi = (secs) => {
                    const min = String(Math.floor(secs / 60)).padStart(2, "0");
                    const sec = String(secs % 60).padStart(2, "0");
                    document.getElementById("hud-val-timer").innerText = `${min}:${sec}`;
                };
                setTimerUi(this.gameSeconds);
                this.gameTimer = setInterval(() => {
                    this.gameSeconds++;
                    setTimerUi(this.gameSeconds);
                    if (this.activeGameId === "sudoku" && this.activeInstance && typeof this.activeInstance.saveGameState === "function") {
                        this.activeInstance.saveGameState();
                    }
                }, 1000);
            },
            getTimerValue: () => {
                return this.gameSeconds;
            },
            gameOver: (results) => {
                this.triggerGameOverFlow(results);
            }
        };
    }

    stopClock() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    pauseGame() {
        this.stopClock();
        if (this.activeInstance && this.activeInstance.pause) {
            this.activeInstance.pause();
        }
        this.showModal("pause");
    }

    resumeGame() {
        this.hideModals();
        
        // Re-start ticking timer if active game holds it
        const game = window.GameCollection[this.activeGameId];
        if (game.hasTimer && !this.gameTimer) {
            this.gameTimer = setInterval(() => {
                this.gameSeconds++;
                const min = String(Math.floor(this.gameSeconds / 60)).padStart(2, "0");
                const sec = String(this.gameSeconds % 60).padStart(2, "0");
                document.getElementById("hud-val-timer").innerText = `${min}:${sec}`;
            }, 1000);
        }
        
        if (this.activeInstance && this.activeInstance.start) {
            this.activeInstance.start();
        }
    }

    restartGameSession() {
        if (this.activeInstance && typeof this.activeInstance.destroy === "function") {
            try {
                this.activeInstance.destroy();
            } catch (e) {
                console.error("Error destroying instance: ", e);
            }
        }
        this.hideModals();
        this.stopClock();
        this.launchGame(this.activeGameId);
    }

    terminateGameSession() {
        this.stopClock();
        
        // Check for new high score before exiting mid-game
        const id = this.activeGameId;
        if (id && window.GameCollection[id] && window.GameCollection[id].hasScore !== false) {
            const currentScore = this.currentScore || 0;
            const previousBest = this.highScores[id] || 0;
            if (currentScore > previousBest) {
                this.highScores[id] = currentScore;
                this.saveState();
            }
        }
        
        if (window.AchievementSystem) {
            window.AchievementSystem.checkRetroactive(this, null, id);
        }
        
        if (this.activeInstance && this.activeInstance.destroy) {
            this.activeInstance.destroy();
        }
        this.activeInstance = null;
        this.activeGameId = null;
        this.currentScore = 0;
        
        // Return main screen
        this.hideModals();
        document.getElementById("game-screen").classList.remove("active");
        document.getElementById("home-screen").classList.add("active");
        
        this.renderAllGrids();
        this.sound.playSelect();
    }

    triggerGameOverFlow(results) {
        this.stopClock();
        const id = this.activeGameId;
        const score = results.score || 0;
        
        const previousBest = this.highScores[id] || 0;
        let isNewPB = false;
        
        if (score > previousBest) {
            this.highScores[id] = score;
            isNewPB = previousBest > 0; // Highlight if they broke a real non-zero benchmark
            this.saveState();
        }
        
        if (window.AchievementSystem) {
            window.AchievementSystem.checkRetroactive(this, results, id);
        }
        
        // Global tracking accumulation metrics
        const sessionDiffSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);
        this.globalStats.totalPlayed++;
        this.globalStats.totalSeconds += sessionDiffSeconds;
        this.saveState();
        
        // Set GameOver header dynamically
        const titleEl = document.getElementById("gameover-title");
        if (titleEl) {
            titleEl.innerText = results.title || "GAME OVER";
        }
        
        // Open Gameover Popup
        document.getElementById("gameover-val-score").innerText = score;
        document.getElementById("gameover-val-best").innerText = this.highScores[id];
        document.getElementById("gameover-val-time").innerText = `${sessionDiffSeconds}s`;
        
        const badge = document.getElementById("gameover-pb-badge");
        if (isNewPB) {
            badge.classList.remove("hidden");
            document.getElementById("gameover-prev-best").innerText = previousBest;
        } else {
            badge.classList.add("hidden");
        }
        
        this.showModal("gameover");
    }
}

// Initiate Host Singletons
window.onload = () => {
    const Arcade = new ArcadeApp();
    window.Arcade = Arcade;
    Arcade.init();
};

window.burstEmoji = (emoji, x, y) => {
    const count = 10;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.innerText = emoji;
        p.className = "emoji-particle";
        p.style.left = `${x || window.innerWidth / 2}px`;
        p.style.top = `${y || window.innerHeight / 2}px`;
        p.style.fontSize = `${14 + Math.random() * 16}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 120;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 40; // extra lift
        const rot = `${Math.random() * 360}deg`;
        
        p.style.setProperty("--tx", `${tx}px`);
        p.style.setProperty("--ty", `${ty}px`);
        p.style.setProperty("--rot", rot);
        
        document.body.appendChild(p);
        
        setTimeout(() => p.remove(), 800);
    }
};

window.triggerEasterEgg = (points = 500, label = "GOLDEN BITE!") => {
    if (window.Arcade) {
        window.Arcade.sound.playWin();
        
        // Show flash message
        const toast = document.createElement("div");
        toast.innerText = `🍪 ${label} +${points} PTS 🍪`;
        toast.style.position = "fixed";
        toast.style.top = "20%";
        toast.style.left = "50%";
        toast.style.transform = "translate(-50%, -50%) scale(0.5)";
        toast.style.background = "rgba(17, 24, 39, 0.95)";
        toast.style.border = "4px solid #f59e0b";
        toast.style.padding = "16px 24px";
        toast.style.borderRadius = "20px";
        toast.style.color = "#fbbf24";
        toast.style.fontSize = "18px";
        toast.style.fontWeight = "900";
        toast.style.zIndex = "99999";
        toast.style.textAlign = "center";
        toast.style.boxShadow = "0 0 35px #f59e0b";
        toast.style.textShadow = "0 0 10px rgba(245, 158, 11, 0.5)";
        toast.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s";
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = "translate(-50%, -50%) scale(1)";
        }, 50);
        
        // Spawn cookie bursts
        let count = 0;
        let interval = setInterval(() => {
            window.burstEmoji("🍪", window.innerWidth / 2 + (Math.random() * 100 - 50), window.innerHeight / 2 + (Math.random() * 100 - 50));
            window.burstEmoji("✨", window.innerWidth / 2 + (Math.random() * 100 - 50), window.innerHeight / 2 + (Math.random() * 100 - 50));
            count++;
            if (count > 6) {
                clearInterval(interval);
            }
        }, 150);
        
        setTimeout(() => {
            clearInterval(interval);
            toast.style.opacity = "0";
            toast.style.transform = "translate(-50%, -50%) scale(0.8)";
            setTimeout(() => toast.remove(), 400);
        }, 2200);
        
        // Give points back to active score
        const inst = window.Arcade.activeInstance;
        if (inst && inst.score !== undefined) {
            inst.score += points;
            window.Arcade.currentScore = inst.score;
            window.Arcade.sound.playMerge();
            const hudScore = document.getElementById("hud-val-score");
            if (hudScore) {
                hudScore.innerText = inst.score;
            }
        }
    }
};
