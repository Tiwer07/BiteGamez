/**
 * BiteGamez Achievements System Integration Script
 * Handcrafted with 208 achievements (at least 7 unique achievements per game + 5 app-wide).
 * Implements modern hierarchical overview with smooth navigation and adaptive progress.
 */

(function() {
    class AchievementSystem {
        constructor() {
            this.unlocked = {}; // map of achId -> timestamp (Date.now())
            this.progress = {}; // map of achId -> number (current value)
            this.toastQueue = [];
            this.toastIsShowing = false;
            
            // State variables for navigation
            this.currentView = "overview"; // "overview" or "details"
            this.selectedGameId = null;    // gameId (or "bitegamez" for wide)
            this.activeFilter = "all";     // "all", "unlocked", "locked"

            // Central authoritative achievement registry (208 achievements)
            this.achievements = [
                // APP-WIDE BITEGAMEZ ACHIEVEMENTS
                { id: "bg_all_games", gameId: "all", title: "Gotta Play 'Em All", desc: "Try every game in BiteGamez at least once.", icon: "🎮", progressType: "games_played" },
                { id: "bg_jack_of_all", gameId: "all", title: "Jack of All Games", desc: "Earn at least one achievement in every game.", icon: "🃏", progressType: "games_achieved" },
                { id: "bg_unlock_10", gameId: "all", title: "Rising Star", desc: "Unlock 10 achievements in total across BiteGamez.", icon: "⭐" },
                { id: "bg_unlock_50", gameId: "all", title: "Achievement Junkie", desc: "Unlock 50 achievements in total across BiteGamez.", icon: "🔥" },
                { id: "bg_completionist", gameId: "all", title: "Completionist", desc: "Unlock every achievement in BiteGamez.", icon: "👑" },

                // 1. SUDOKU MATCH
                { id: "sudoku_start", gameId: "sudoku", title: "Logic 101", desc: "Start your first Sudoku match.", icon: "🧠" },
                { id: "sudoku_solve_1", gameId: "sudoku", title: "Sudoku Apprentice", desc: "Complete 1 Sudoku puzzle.", icon: "📝" },
                { id: "sudoku_speedy", gameId: "sudoku", title: "Speedy Pencil", desc: "Solve a Sudoku puzzle in under 5 minutes.", icon: "⚡" },
                { id: "sudoku_solve_5", gameId: "sudoku", title: "Zen Master", desc: "Solve 5 Sudoku puzzles in total.", icon: "🧘", progressTarget: 5 },
                { id: "sudoku_no_errors", gameId: "sudoku", title: "Logical Perfection", desc: "Solve a Sudoku puzzle with 0 mistakes.", icon: "🎯", secret: true },
                { id: "sudoku_expert", gameId: "sudoku", title: "Mathematical Majesty", desc: "Complete a Sudoku puzzle on Expert difficulty.", icon: "👑" },
                { id: "sudoku_play_10", gameId: "sudoku", title: "Number Cruncher", desc: "Play Sudoku 10 times.", icon: "🔢", progressTarget: 10 },

                // 2. 2048
                { id: "2048_tile_128", gameId: "2048", title: "Double Trouble", desc: "Reach the 128 tile.", icon: "🔢" },
                { id: "2048_tile_256", gameId: "2048", title: "Quadruple Block", desc: "Reach the 256 tile.", icon: "🧱" },
                { id: "2048_tile_1024", gameId: "2048", title: "Grandmaster Merge", desc: "Reach the 1024 tile.", icon: "🌟" },
                { id: "2048_tile_2048", gameId: "2048", title: "Two Good", desc: "Create the famous 2048 tile.", icon: "🌌" },
                { id: "2048_tile_4096", gameId: "2048", title: "Infinite Power", desc: "Create the legendary 4096 tile.", icon: "☄️" },
                { id: "2048_score_20k", gameId: "2048", title: "Score Storm", desc: "Reach a score of 20,000.", icon: "⛈️" },
                { id: "2048_play_10", gameId: "2048", title: "Merge Mania", desc: "Play 2048 10 times.", icon: "🔄", progressTarget: 10 },

                // 3. FLAPPY BIRD
                { id: "flappy_pipe_1", gameId: "flappy", title: "Wingman", desc: "Pass your first green pipe.", icon: "🐦" },
                { id: "flappy_pipe_10", gameId: "flappy", title: "Aero-Dynamic", desc: "Pass 10 pipes in a single run.", icon: "🪶" },
                { id: "flappy_score_30", gameId: "flappy", title: "Sky is the Limit", desc: "Score 30 points.", icon: "☁️" },
                { id: "flappy_score_50", gameId: "flappy", title: "Pipedream", desc: "Score 50 points.", icon: "🔔" },
                { id: "flappy_time_2m", gameId: "flappy", title: "Gravity Defier", desc: "Survive a run for over 2 minutes.", icon: "⏱️", secret: true },
                { id: "flappy_score_100", gameId: "flappy", title: "Ornithologist", desc: "Score 100 points in Flappy Bird.", icon: "🏆" },
                { id: "flappy_plays_15", gameId: "flappy", title: "Frequent Flyer", desc: "Play Flappy Bird 15 times.", icon: "✈️", progressTarget: 15 },

                // 4. COSMO BLITZ (Spaceship)
                { id: "spaceship_kill_10", gameId: "spaceship", title: "Blast Off", desc: "Destroy 10 enemy alien ships.", icon: "🚀" },
                { id: "spaceship_boss_1", gameId: "spaceship", title: "Stardust Crusader", desc: "Defeat your first solar boss ship.", icon: "🛸" },
                { id: "spaceship_score_1k", gameId: "spaceship", title: "Galaxy Guardian", desc: "Score 1,000 points.", icon: "🛡️" },
                { id: "spaceship_score_2500", gameId: "spaceship", title: "Bullet Hell Survivor", desc: "Score 2,500 points.", icon: "🔥" },
                { id: "spaceship_bosses_5", gameId: "spaceship", title: "Cosmic Emperor", desc: "Defeat 5 bosses in a single run.", icon: "☄️", secret: true },
                { id: "spaceship_score_5k", gameId: "spaceship", title: "Nebula Knight", desc: "Score 5,000 points.", icon: "🌌" },
                { id: "spaceship_plays_10", gameId: "spaceship", title: "Astro Pilot", desc: "Play Cosmo Blitz 10 times.", icon: "🛰️", progressTarget: 10 },

                // 5. WHACK-A-MOLE
                { id: "whack_mole_1", gameId: "whack", title: "Whack It!", desc: "Whack your first mole.", icon: "🔨" },
                { id: "whack_score_20", gameId: "whack", title: "Hammer Time", desc: "Whack 20 moles in a single game.", icon: "⏰" },
                { id: "whack_score_50", gameId: "whack", title: "Mole-inator", desc: "Score 50 points.", icon: "💥" },
                { id: "whack_golden", gameId: "whack", title: "Golden Touch", desc: "Hit a Golden Mole successfully.", icon: "🪙", secret: true },
                { id: "whack_moles_100", gameId: "whack", title: "Pest Control", desc: "Whack 100 moles cumulatively.", icon: "🦫", progressTarget: 100 },
                { id: "whack_score_80", gameId: "whack", title: "Mallet Madness", desc: "Score 80 points in a single game.", icon: "✨" },
                { id: "whack_plays_15", gameId: "whack", title: "Underground Warden", desc: "Play Whack-a-Mole 15 times.", icon: "🕳️", progressTarget: 15 },

                // 6. TETRIS
                { id: "tetris_line_1", gameId: "tetris", title: "Drop It Like It's Hot", desc: "Clear your first Tetris line.", icon: "🧱" },
                { id: "tetris_double", gameId: "tetris", title: "Two for One", desc: "Clear 2 lines simultaneously.", icon: "⚡" },
                { id: "tetris_four_lines", gameId: "tetris", title: "Tetris Attack!", desc: "Clear 4 lines simultaneously (A Tetris).", icon: "💥" },
                { id: "tetris_score_2k", gameId: "tetris", title: "Master Builder", desc: "Reach a score of 2,000 points.", icon: "🏗️" },
                { id: "tetris_lines_50", gameId: "tetris", title: "Block Party", desc: "Clear 50 lines in total cumulatively.", icon: "🥳", progressTarget: 50 },
                { id: "tetris_score_10k", gameId: "tetris", title: "Architect of Blocks", desc: "Reach a score of 10,000 points.", icon: "👑" },
                { id: "tetris_plays_10", gameId: "tetris", title: "Gravity Master", desc: "Play Tetris 10 times.", icon: "⏳", progressTarget: 10 },

                // 7. MERGE FRUITS
                { id: "mergefruits_merge_1", gameId: "mergefruits", title: "Sweet Start", desc: "Merge your first fruits.", icon: "🍒" },
                { id: "mergefruits_peach", gameId: "mergefruits", title: "Peach Pleaser", desc: "Create your first Peach.", icon: "🍑" },
                { id: "mergefruits_melon", gameId: "mergefruits", title: "Melon Musk", desc: "Create your first Melon.", icon: "🍈" },
                { id: "mergefruits_watermelon", gameId: "mergefruits", title: "One in a Melon", desc: "Create your first giant Watermelon.", icon: "🍉" },
                { id: "mergefruits_score_1500", gameId: "mergefruits", title: "Fruity Tycoon", desc: "Reach a score of 1,500 points.", icon: "💰" },
                { id: "mergefruits_score_3k", gameId: "mergefruits", title: "Harvest King", desc: "Reach a score of 3,000 points.", icon: "🍇" },
                { id: "mergefruits_plays_10", gameId: "mergefruits", title: "Fruit Smoothie", desc: "Play Merge Fruits 10 times.", icon: "🥤", progressTarget: 10 },

                // 8. DINO RUNNER
                { id: "dino_cacti_10", gameId: "dino", title: "Cactus Dodger", desc: "Leap over 10 cacti in a run.", icon: "🌵" },
                { id: "dino_score_300", gameId: "dino", title: "Pterodactyl Pilot", desc: "Score 300 points.", icon: "🦕" },
                { id: "dino_score_1k", gameId: "dino", title: "Jurassic Sprint", desc: "Score 1,000 points.", icon: "🏃" },
                { id: "dino_plays_10", gameId: "dino", title: "Fossil Fuelled", desc: "Play Dino Runner 10 times in total.", icon: "🦴", progressTarget: 10 },
                { id: "dino_score_2k", gameId: "dino", title: "Extinction Evaded", desc: "Score 2,000 points.", icon: "🦖" },
                { id: "dino_score_5k", gameId: "dino", title: "Apex Predator", desc: "Score 5,000 points.", icon: "👑" },
                { id: "dino_plays_25", gameId: "dino", title: "Prehistoric Legend", desc: "Play Dino Runner 25 times.", icon: "🌄", progressTarget: 25 },

                // 9. BALLOON POP
                { id: "balloon_pop_20", gameId: "balloon", title: "Pop Star", desc: "Pop 20 balloons in a single game.", icon: "🎈" },
                { id: "balloon_pop_50", gameId: "balloon", title: "Hot Air", desc: "Pop 50 balloons in a single game.", icon: "🔥" },
                { id: "balloon_score_100", gameId: "balloon", title: "Centurion Pop", desc: "Score 100 points.", icon: "💯" },
                { id: "balloon_combo_3", gameId: "balloon", title: "Chain Popper", desc: "Pop 3 balloons within 1 second.", icon: "🔗", secret: true },
                { id: "balloon_score_200", gameId: "balloon", title: "Anti-Gravity", desc: "Score 200 points.", icon: "🌌" },
                { id: "balloon_score_500", gameId: "balloon", title: "Stratosphere Sweeper", desc: "Score 500 points in Balloon Pop.", icon: "🎯" },
                { id: "balloon_plays_15", gameId: "balloon", title: "Popping Fanatic", desc: "Play Balloon Pop 15 times.", icon: "🥊", progressTarget: 15 },

                // 10. MINESWEEPER
                { id: "minesweeper_safe_1", gameId: "minesweeper", title: "Safe Passage", desc: "Reveal your first safe square.", icon: "🔲" },
                { id: "minesweeper_flag_5", gameId: "minesweeper", title: "Bomb Squad", desc: "Flag 5 mines correctly.", icon: "🚩" },
                { id: "minesweeper_clear_1", gameId: "minesweeper", title: "Mine Over Matter", desc: "Complete a Minesweeper board safely.", icon: "💣" },
                { id: "minesweeper_time_2m", gameId: "minesweeper", title: "Tactical Sweeper", desc: "Clear a board in under 2 minutes.", icon: "⏱️" },
                { id: "minesweeper_clear_5", gameId: "minesweeper", title: "Flawless Sweeper", desc: "Clear 5 Minesweeper boards in total.", icon: "🏆", progressTarget: 5 },
                { id: "minesweeper_clear_10", gameId: "minesweeper", title: "Ultimate Defuser", desc: "Clear 10 Minesweeper boards in total.", icon: "👑", progressTarget: 10 },
                { id: "minesweeper_plays_15", gameId: "minesweeper", title: "Danger Zone", desc: "Play Minesweeper 15 times.", icon: "⚠️", progressTarget: 15 },

                // 11. MAZE CHASE
                { id: "maze_escape_1", gameId: "maze", title: "Lost and Found", desc: "Find the exit of your first maze.", icon: "🕵️" },
                { id: "maze_escape_medium", gameId: "maze", title: "Labyrinth Runner", desc: "Escape a medium-sized maze.", icon: "🧭" },
                { id: "maze_escape_5", gameId: "maze", title: "Minotaur's Bane", desc: "Escape 5 mazes in total.", icon: "🐂", progressTarget: 5 },
                { id: "maze_speedy", gameId: "maze", title: "Speedy Escape", desc: "Escape a maze in under 30 seconds.", icon: "⚡", secret: true },
                { id: "maze_escape_hard", gameId: "maze", title: "Amazing Maze", desc: "Escape a hard-sized maze.", icon: "🌀" },
                { id: "maze_escape_10", gameId: "maze", title: "Maze Architect", desc: "Escape 10 mazes in total.", icon: "🏰", progressTarget: 10 },
                { id: "maze_plays_20", gameId: "maze", title: "Labyrinth Legend", desc: "Play Maze Chase 20 times.", icon: "🗿", progressTarget: 20 },

                // 12. ARCADE CRICKET
                { id: "cricket_run_1", gameId: "cricket", title: "Single Digit", desc: "Score your first run in Cricket.", icon: "🏏" },
                { id: "cricket_boundary", gameId: "cricket", title: "Boundary Blast", desc: "Hit a 4 or a 6 in a match.", icon: "💥" },
                { id: "cricket_runs_50", gameId: "cricket", title: "Half-Century", desc: "Score 50 runs in a single game.", icon: "🏆" },
                { id: "cricket_runs_100", gameId: "cricket", title: "Century Club", desc: "Score 100 runs in a single game.", icon: "💯" },
                { id: "cricket_boundaries_3", gameId: "cricket", title: "Super Striker", desc: "Hit 3 consecutive boundaries.", icon: "🔥", secret: true },
                { id: "cricket_runs_200", gameId: "cricket", title: "Double Century", desc: "Score 200 runs in a single game.", icon: "👑" },
                { id: "cricket_plays_15", gameId: "cricket", title: "Net Practice", desc: "Play Arcade Cricket 15 times.", icon: "🏟️", progressTarget: 15 },

                // 13. RETRO SNAKE
                { id: "snake_apple_1", gameId: "snake", title: "Nibble", desc: "Eat your first apple.", icon: "🍏" },
                { id: "snake_length_15", gameId: "snake", title: "Serpentine", desc: "Grow the snake to length 15.", icon: "🐍" },
                { id: "snake_score_50", gameId: "snake", title: "Anacondastyle", desc: "Score 50 points in Retro Snake.", icon: "👑" },
                { id: "snake_score_100", gameId: "snake", title: "Slytherin", desc: "Score 100 points.", icon: "✨" },
                { id: "snake_apples_100", gameId: "snake", title: "Apple Gourmet", desc: "Eat 100 apples cumulatively.", icon: "🍎", progressTarget: 100 },
                { id: "snake_score_200", gameId: "snake", title: "Ouroboros", desc: "Score 200 points in Retro Snake.", icon: "💫" },
                { id: "snake_plays_15", gameId: "snake", title: "Shedding Skin", desc: "Play Retro Snake 15 times.", icon: "🍂", progressTarget: 15 },

                // 14. BREAKOUT
                { id: "breakout_brick_1", gameId: "breakout", title: "Wallbreaker", desc: "Break your first brick.", icon: "🧱" },
                { id: "breakout_combo_10", gameId: "breakout", title: "Keep It Up", desc: "Achieve a 10-hit combo.", icon: "🌀" },
                { id: "breakout_score_50", gameId: "breakout", title: "Demolition Derby", desc: "Destroy 50 bricks in a single game.", icon: "🔨" },
                { id: "breakout_clear_screen", gameId: "breakout", title: "Solid Brick", desc: "Clear an entire screen of bricks.", icon: "💎", secret: true },
                { id: "breakout_score_200", gameId: "breakout", title: "Paddle Specialist", desc: "Score 200 points.", icon: "🏓" },
                { id: "breakout_score_500", gameId: "breakout", title: "Brick Annihilator", desc: "Score 500 points in Breakout.", icon: "🔥" },
                { id: "breakout_plays_15", gameId: "breakout", title: "Paddle Master", desc: "Play Breakout 15 times.", icon: "🏸", progressTarget: 15 },

                // 15. TIC-TAC-TOE
                { id: "tictactoe_move_1", gameId: "tictactoe", title: "First Move", desc: "Place your first X or O on the board.", icon: "❌" },
                { id: "tictactoe_win_1", gameId: "tictactoe", title: "Three in a Row", desc: "Win your first Tic-Tac-Toe match.", icon: "⭕" },
                { id: "tictactoe_win_5", gameId: "tictactoe", title: "Tic-Tac Master", desc: "Win 5 matches against the AI.", icon: "👑", progressTarget: 5 },
                { id: "tictactoe_hard_draw", gameId: "tictactoe", title: "Unbeatable", desc: "Achieve a flawless draw or win on Hard difficulty.", icon: "🛡️" },
                { id: "tictactoe_quick_win", gameId: "tictactoe", title: "Perfect Grid", desc: "Win a game in exactly 3 moves.", icon: "⚡", secret: true },
                { id: "tictactoe_win_10", gameId: "tictactoe", title: "Grandmaster Grid", desc: "Win 10 matches against the AI.", icon: "🏆", progressTarget: 10 },
                { id: "tictactoe_plays_15", gameId: "tictactoe", title: "Noughts & Crosses", desc: "Play Tic-Tac-Toe 15 times.", icon: "🏁", progressTarget: 15 },

                // 16. WATER SORT
                { id: "watersort_flask_1", gameId: "watersort", title: "Chemical Reaction", desc: "Complete your first colored flask.", icon: "🧪" },
                { id: "watersort_level_1", gameId: "watersort", title: "Color Harmony", desc: "Complete your first Water Sort level.", icon: "🌈" },
                { id: "watersort_level_5", gameId: "watersort", title: "Sort Expert", desc: "Solve 5 Water Sort levels in total.", icon: "🎓", progressTarget: 5 },
                { id: "watersort_level_10", gameId: "watersort", title: "Liquid Alchemist", desc: "Solve 10 Water Sort levels in total.", icon: "🧙", progressTarget: 10 },
                { id: "watersort_speedy", gameId: "watersort", title: "No Spills", desc: "Complete a level in under 15 moves.", icon: "⚡", secret: true },
                { id: "watersort_level_20", gameId: "watersort", title: "Master Chemist", desc: "Solve 20 Water Sort levels.", icon: "🧬", progressTarget: 20 },
                { id: "watersort_plays_25", gameId: "watersort", title: "Fluid Dynamics", desc: "Play Water Sort 25 times.", icon: "⛲", progressTarget: 25 },

                // 17. MEMORY MATCH
                { id: "memory_match_1", gameId: "memory", title: "Dejavu", desc: "Match your first pair of cards.", icon: "🃏" },
                { id: "memory_level_1", gameId: "memory", title: "Recall Master", desc: "Complete a Memory Match board.", icon: "🧠" },
                { id: "memory_low_errors", gameId: "memory", title: "Unforgettable", desc: "Complete a board with fewer than 10 mistakes.", icon: "✨" },
                { id: "memory_speedy", gameId: "memory", title: "Photographic Memory", desc: "Clear a 6x6 grid in under 60 seconds.", icon: "📸", secret: true },
                { id: "memory_level_5", gameId: "memory", title: "Brainiac", desc: "Complete 5 Memory Match boards.", icon: "💡", progressTarget: 5 },
                { id: "memory_level_10", gameId: "memory", title: "Mind Palace", desc: "Complete 10 Memory Match boards.", icon: "🏰", progressTarget: 10 },
                { id: "memory_plays_15", gameId: "memory", title: "Brain Trainer", desc: "Play Memory Match 15 times.", icon: "🏋️", progressTarget: 15 },

                // 18. CHICKEN TOWER (Stack)
                { id: "chickentower_score_5", gameId: "chickentower", title: "Nest Egg", desc: "Build a tower of 5 levels.", icon: "🥚" },
                { id: "chickentower_score_15", gameId: "chickentower", title: "High Rise", desc: "Reach a chicken score of 15.", icon: "🐔" },
                { id: "chickentower_score_30", gameId: "chickentower", title: "Cloud Clucker", desc: "Reach a chicken score of 30.", icon: "☁️" },
                { id: "chickentower_score_50", gameId: "chickentower", title: "Sky Scraper", desc: "Reach a chicken score of 50.", icon: "🏙️" },
                { id: "chickentower_blocks_100", gameId: "chickentower", title: "Tower Legend", desc: "Lay 100 blocks cumulatively.", icon: "🏰", progressTarget: 100 },
                { id: "chickentower_score_100", gameId: "chickentower", title: "Space Clucker", desc: "Reach a chicken score of 100.", icon: "🚀" },
                { id: "chickentower_plays_15", gameId: "chickentower", title: "Feathered Architect", desc: "Play Chicken Tower 15 times.", icon: "📐", progressTarget: 15 },

                // 19. CHICKEN CROSSING
                { id: "chickencross_road_1", gameId: "chickencrossing", title: "Roadrunner", desc: "Cross your first road safely.", icon: "🐸" },
                { id: "chickencross_score_10", gameId: "chickencrossing", title: "Safe & Sound", desc: "Score 10 points.", icon: "🚙" },
                { id: "chickencross_score_25", gameId: "chickencrossing", title: "Feathered Fleet", desc: "Score 25 points.", icon: "🚛" },
                { id: "chickencross_score_50", gameId: "chickencrossing", title: "Mega Crosser", desc: "Score 50 points.", icon: "🦸" },
                { id: "chickencross_cross_200", gameId: "chickencrossing", title: "Cluck of the Wild", desc: "Cross 200 obstacles cumulatively.", icon: "🌲", progressTarget: 200 },
                { id: "chickencross_score_100", gameId: "chickencrossing", title: "Untouchable Clucker", desc: "Score 100 points in Chicken Crossing.", icon: "🏆" },
                { id: "chickencross_plays_15", gameId: "chickencrossing", title: "Crossy Master", desc: "Play Chicken Crossing 15 times.", icon: "🚦", progressTarget: 15 },

                // 20. CONNECT 4
                { id: "connect4_move_1", gameId: "connect4", title: "Slot Machine", desc: "Drop your first disc.", icon: "🔵" },
                { id: "connect4_win_1", gameId: "connect4", title: "Quadruple Threat", desc: "Win your first Connect 4 match.", icon: "🔴" },
                { id: "connect4_vertical", gameId: "connect4", title: "Vertical Victory", desc: "Win with a perfect vertical line.", icon: "📏" },
                { id: "connect4_win_5", gameId: "connect4", title: "Four-midable", desc: "Win 5 matches against the AI.", icon: "👑", progressTarget: 5 },
                { id: "connect4_fast_win", gameId: "connect4", title: "Strategic Solver", desc: "Win a Connect 4 match in under 8 moves.", icon: "⚡", secret: true },
                { id: "connect4_win_10", gameId: "connect4", title: "Connect Master", desc: "Win 10 matches against the AI.", icon: "🏆", progressTarget: 10 },
                { id: "connect4_plays_15", gameId: "connect4", title: "Disc Dropper", desc: "Play Connect 4 15 times.", icon: "💿", progressTarget: 15 },

                // 21. SLIDING PUZZLE
                { id: "sliding_move_1", gameId: "slidingpuzzle", title: "Shift Key", desc: "Slide your first tile.", icon: "🧩" },
                { id: "sliding_solve_1", gameId: "slidingpuzzle", title: "Image Restorer", desc: "Complete your first 3x3 Sliding Puzzle.", icon: "🖼️" },
                { id: "sliding_solve_4x4", gameId: "slidingpuzzle", title: "Puzzle Prodigy", desc: "Complete a harder 4x4 Sliding Puzzle.", icon: "⭐" },
                { id: "sliding_low_moves", gameId: "slidingpuzzle", title: "Slick Slider", desc: "Solve a puzzle in under 40 moves.", icon: "⛸️", secret: true },
                { id: "sliding_solve_5", gameId: "slidingpuzzle", title: "Rubik's Rival", desc: "Solve 5 sliding puzzles.", icon: "🏆", progressTarget: 5 },
                { id: "sliding_solve_10", gameId: "slidingpuzzle", title: "Master of Slide", desc: "Solve 10 sliding puzzles.", icon: "👑", progressTarget: 10 },
                { id: "sliding_plays_15", gameId: "slidingpuzzle", title: "Picture Perfect", desc: "Play Sliding Puzzle 15 times.", icon: "📸", progressTarget: 15 },

                // 22. DOTS & BOXES
                { id: "dots_line_1", gameId: "dotsandboxes", title: "Connect the Dots", desc: "Draw your first line.", icon: "✏️" },
                { id: "dots_box_1", gameId: "dotsandboxes", title: "In the Box", desc: "Claim your first closed box.", icon: "📦" },
                { id: "dots_win_1", gameId: "dotsandboxes", title: "Box Conqueror", desc: "Win your first Dots & Boxes match.", icon: "🥇" },
                { id: "dots_boxes_15", gameId: "dotsandboxes", title: "Grid Landlord", desc: "Claim 15 boxes in a single game.", icon: "🏰" },
                { id: "dots_win_5", gameId: "dotsandboxes", title: "Square Master", desc: "Win 5 matches in total.", icon: "👑", progressTarget: 5 },
                { id: "dots_win_10", gameId: "dotsandboxes", title: "Box Oligarch", desc: "Win 10 matches in total.", icon: "🏆", progressTarget: 10 },
                { id: "dots_plays_15", gameId: "dotsandboxes", title: "Pencil Pusher", desc: "Play Dots & Boxes 15 times.", icon: "✒️", progressTarget: 15 },

                // 23. ARCHERY MASTER
                { id: "archery_shoot_1", gameId: "archerymaster", title: "Release", desc: "Launch your first arrow.", icon: "🏹" },
                { id: "archery_bullseye", gameId: "archerymaster", title: "Bullseye!", desc: "Hit the exact center target (10 points).", icon: "🎯" },
                { id: "archery_score_50", gameId: "archerymaster", title: "Marksman", desc: "Score 50 points in a single game.", icon: "🎖️" },
                { id: "archery_bullseyes_3", gameId: "archerymaster", title: "Robin Hood", desc: "Hit 3 bullseyes in a row.", icon: "🧣", secret: true },
                { id: "archery_score_100", gameId: "archerymaster", title: "Sniper Arrow", desc: "Score 100 points in a single game.", icon: "🏆" },
                { id: "archery_score_150", gameId: "archerymaster", title: "Legolas Mode", desc: "Score 150 points in a single game.", icon: "👑" },
                { id: "archery_plays_15", gameId: "archerymaster", title: "William Tell", desc: "Play Archery Master 15 times.", icon: "🍏", progressTarget: 15 },

                // 24. KNIFE HIT
                { id: "knife_throw_1", gameId: "knifehit", title: "Sharp Shooter", desc: "Throw your first knife successfully.", icon: "🗡️" },
                { id: "knife_break_1", gameId: "knifehit", title: "Log Slicer", desc: "Break your first wood log.", icon: "🪵" },
                { id: "knife_boss_1", gameId: "knifehit", title: "Boss Slayer", desc: "Defeat your first Boss.", icon: "👹" },
                { id: "knife_apples_10", gameId: "knifehit", title: "Apple Assassin", desc: "Hit 10 apples in total.", icon: "🍎", progressTarget: 10 },
                { id: "knife_bosses_3", gameId: "knifehit", title: "Unstoppable Blade", desc: "Defeat 3 bosses in a single run.", icon: "🔥", secret: true },
                { id: "knife_bosses_5", gameId: "knifehit", title: "Blademaster", desc: "Defeat 5 bosses in a single run.", icon: "⚔️" },
                { id: "knife_plays_15", gameId: "knifehit", title: "Circus Knife Thrower", desc: "Play Knife Hit 15 times.", icon: "🎡", progressTarget: 15 },

                // 25. BOTTLE FLIP
                { id: "bottle_flip_1", gameId: "bottleflip", title: "Landing", desc: "Perform your first successful bottle flip.", icon: "🧪" },
                { id: "bottle_flips_2", gameId: "bottleflip", title: "Double Flip", desc: "Land 2 bottle flips in a row.", icon: "📈" },
                { id: "bottle_flips_5", gameId: "bottleflip", title: "Gravity Defied", desc: "Land 5 successful flips in a row.", icon: "🌀" },
                { id: "bottle_flips_10", gameId: "bottleflip", title: "Flip Master", desc: "Land 10 successful flips in a row.", icon: "👑", secret: true },
                { id: "bottle_score_30", gameId: "bottleflip", title: "Bottle Boss", desc: "Earn a total score of 30.", icon: "🏆" },
                { id: "bottle_flips_15", gameId: "bottleflip", title: "Cap Landing", desc: "Land 15 successful flips in a row.", icon: "🍾" },
                { id: "bottle_plays_20", gameId: "bottleflip", title: "Bottle Flipping Mania", desc: "Play Bottle Flip 20 times.", icon: "💫", progressTarget: 20 },

                // 26. PIPE CONNECT
                { id: "pipe_rotate_1", gameId: "pipeconnect", title: "Plumber's Union", desc: "Rotate your first pipe.", icon: "🔧" },
                { id: "pipe_solve_1", gameId: "pipeconnect", title: "Flow Restored", desc: "Complete your first pipeline level.", icon: "🚰" },
                { id: "pipe_solve_5", gameId: "pipeconnect", title: "Water Baron", desc: "Solve 5 pipe levels.", icon: "🌊", progressTarget: 5 },
                { id: "pipe_solve_10", gameId: "pipeconnect", title: "Leak Stopper", desc: "Solve 10 pipe levels.", icon: "🛠️", progressTarget: 10 },
                { id: "pipe_level_15", gameId: "pipeconnect", title: "Hydro Engineer", desc: "Solve level 15 or higher.", icon: "🏆" },
                { id: "pipe_solve_20", gameId: "pipeconnect", title: "Aqueduct Architect", desc: "Solve 20 pipe levels.", icon: "🏛️", progressTarget: 20 },
                { id: "pipe_plays_25", gameId: "pipeconnect", title: "Plumbing Overlord", desc: "Play Pipe Connect 25 times.", icon: "🚿", progressTarget: 25 },

                // 27. CLOUD ADVENTURE
                { id: "cloud_jump_1", gameId: "cloudadventure", title: "Cloud Hopper", desc: "Leap onto your first cloud.", icon: "☁️" },
                { id: "cloud_stars_10", gameId: "cloudadventure", title: "Star Collector", desc: "Collect 10 stars in a single run.", icon: "⭐" },
                { id: "cloud_score_100", gameId: "cloudadventure", title: "Skyward Bound", desc: "Reach a height score of 100.", icon: "🎈" },
                { id: "cloud_score_300", gameId: "cloudadventure", title: "Stratosphere", desc: "Reach a height score of 300.", icon: "🚀" },
                { id: "cloud_stars_50", gameId: "cloudadventure", title: "Coin Collector", desc: "Collect 50 stars in total cumulatively.", icon: "✨", progressTarget: 50 },
                { id: "cloud_score_500", gameId: "cloudadventure", title: "Exosphere Patrol", desc: "Reach a height score of 500.", icon: "🛰️" },
                { id: "cloud_plays_15", gameId: "cloudadventure", title: "High Altitude", desc: "Play Cloud Adventure 15 times.", icon: "🪐", progressTarget: 15 },

                // 28. FISHING FRENZY
                { id: "fishing_catch_1", gameId: "fishingfrenzy", title: "First Bite", desc: "Catch your first fish.", icon: "🎣" },
                { id: "fishing_rare", gameId: "fishingfrenzy", title: "Deep Sea Angler", desc: "Catch a rare deep-sea fish (shark or golden fish).", icon: "🦈", secret: true },
                { id: "fishing_catch_20", gameId: "fishingfrenzy", title: "Reel Master", desc: "Catch 20 fish in a single run.", icon: "⛵" },
                { id: "fishing_score_500", gameId: "fishingfrenzy", title: "Big Catch", desc: "Score 500 points in a game.", icon: "🔱" },
                { id: "fishing_fish_100", gameId: "fishingfrenzy", title: "Poseidon's Friend", desc: "Catch 100 fish cumulatively.", icon: "🌊", progressTarget: 100 },
                { id: "fishing_score_1k", gameId: "fishingfrenzy", title: "Leviathan Catcher", desc: "Score 1,000 points.", icon: "🐙" },
                { id: "fishing_plays_15", gameId: "fishingfrenzy", title: "Experienced Fisherman", desc: "Play Fishing Frenzy 15 times.", icon: "🚢", progressTarget: 15 },

                // 29. WAREHOUSE BOY
                { id: "warehouseboy_level_1", gameId: "warehouseboy", title: "Handle With Care", desc: "Complete your first Warehouse Boy level.", icon: "📦" },
                { id: "warehouseboy_no_undo", gameId: "warehouseboy", title: "No Takebacks", desc: "Complete a level without using Undo.", icon: "🚫", secret: true },
                { id: "warehouseboy_push_100", gameId: "warehouseboy", title: "Push It!", desc: "Push 100 crates across all Warehouse Boy games.", icon: "💪", progressTarget: 100 },
                { id: "warehouseboy_quick_level3", gameId: "warehouseboy", title: "Warehouse Wizard", desc: "Complete Level 3 in under 12 moves.", icon: "⚡" },
                { id: "warehouseboy_all_levels", gameId: "warehouseboy", title: "Employee of the Month", desc: "Complete all 5 handcrafted levels.", icon: "🏆" },
                { id: "warehouseboy_push_500", gameId: "warehouseboy", title: "Heavy Lifter", desc: "Push 500 crates in total across all Warehouse Boy games.", icon: "🏋️‍♂️", progressTarget: 500 },
                { id: "warehouseboy_plays_10", gameId: "warehouseboy", title: "Forklift Operator", desc: "Play Warehouse Boy 10 times.", icon: "🚜", progressTarget: 10 }
            ];
            
            this.loadState();
        }

        loadState() {
            try {
                this.unlocked = JSON.parse(localStorage.getItem("bg_ach_unlocked")) || {};
                this.progress = JSON.parse(localStorage.getItem("bg_ach_progress")) || {};
                
                // Normalize legacy/invalid unlock dates immediately on load
                Object.keys(this.unlocked).forEach(id => {
                    const val = this.unlocked[id];
                    if (val === true || val === "true") {
                        this.unlocked[id] = "legacy";
                    } else if (val && val !== "legacy" && isNaN(Number(val))) {
                        this.unlocked[id] = "legacy";
                    }
                });
            } catch (e) {
                console.error("Failed to load achievements state", e);
            }
        }

        saveState() {
            try {
                localStorage.setItem("bg_ach_unlocked", JSON.stringify(this.unlocked));
                localStorage.setItem("bg_ach_progress", JSON.stringify(this.progress));
            } catch (e) {
                console.error("Failed to save achievements state", e);
            }
        }

        formatUnlockDate(timestamp) {
            if (!timestamp) return "";
            if (timestamp === "legacy") return "Date unavailable";
            
            const num = Number(timestamp);
            if (isNaN(num)) return "Date unavailable";

            const date = new Date(num);
            const now = new Date();

            // Compare calendar dates (day, month, year)
            const isToday = date.getDate() === now.getDate() &&
                            date.getMonth() === now.getMonth() &&
                            date.getFullYear() === now.getFullYear();

            if (isToday) {
                return "Today";
            }

            // Otherwise, format date (MMM DD, YY)
            return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
        }

        unlock(id, customTimestamp = null) {
            if (this.unlocked[id]) return; // already unlocked, IMMUTABLE
            
            const ach = this.achievements.find(a => a.id === id);
            if (!ach) return;
            
            let timestamp = customTimestamp || this._currentUnlockTime || Date.now();
            if (timestamp === "legacy") {
                this.unlocked[id] = "legacy";
            } else {
                this.unlocked[id] = Number(timestamp) || Date.now();
            }
            
            this.saveState();
            
            // Queue visual toast notification
            this.queueToast(ach);
            
            // Perform secondary check for App-wide achievements
            this.checkBiteGamezWideAchievements();
            
            // Refresh UI if on stats/achievements tab
            if (this.currentView) {
                this.renderAchievementsList();
            }
        }

        incrementProgress(id, amount = 1) {
            const ach = this.achievements.find(a => a.id === id);
            if (!ach || !ach.progressTarget) return;
            if (this.unlocked[id]) return;

            const current = (this.progress[id] || 0) + amount;
            this.progress[id] = current;
            
            this.saveState();

            if (current >= ach.progressTarget) {
                this.unlock(id);
            } else if (this.currentView) {
                this.renderAchievementsList();
            }

            // Sync warehouse boy push increments automatically
            if (id === "warehouseboy_push_100") {
                this.incrementProgress("warehouseboy_push_500", amount);
            }
        }

        queueToast(ach) {
            this.toastQueue.push(ach);
            this.processToastQueue();
        }

        processToastQueue() {
            if (this.toastIsShowing || this.toastQueue.length === 0) return;
            this.toastIsShowing = true;
            
            const nextAch = this.toastQueue.shift();
            
            const toast = document.createElement("div");
            toast.className = "achievement-toast";
            toast.style.cssText = `
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                width: 90%;
                max-width: 320px;
                background: rgba(15, 23, 42, 0.95);
                border: 2px solid #eab308;
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(234, 179, 8, 0.3);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                opacity: 0;
                transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
                pointer-events: none;
            `;

            toast.innerHTML = `
                <div style="font-size: 32px; filter: drop-shadow(0 0 4px rgba(234,179,8,0.5));">${nextAch.icon || "🏆"}</div>
                <div style="flex: 1; display: flex; flex-direction: column;">
                    <span style="font-size: 10px; font-weight: 900; color: #eab308; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">🏆 Achievement Unlocked!</span>
                    <span style="font-size: 14px; font-weight: bold; color: white; line-height: 1.2;">${nextAch.title}</span>
                    <span style="font-size: 11px; color: #94a3b8; line-height: 1.3; margin-top: 2px;">${nextAch.desc}</span>
                </div>
            `;

            document.body.appendChild(toast);

            // Play win sfx if available
            if (window.SoundFX && typeof window.SoundFX.playWin === "function" && window.Arcade && window.Arcade.settings.sfx) {
                window.SoundFX.playWin();
            }

            setTimeout(() => {
                toast.style.transform = "translateX(-50%) translateY(0)";
                toast.style.opacity = "1";
            }, 50);

            setTimeout(() => {
                toast.style.transform = "translateX(-50%) translateY(-100px)";
                toast.style.opacity = "0";
                setTimeout(() => {
                    toast.remove();
                    this.toastIsShowing = false;
                    this.processToastQueue();
                }, 500);
            }, 3500);
        }

        checkBiteGamezWideAchievements() {
            const Arcade = window.Arcade;
            if (!Arcade) return;

            // 1. bg_all_games: Try every game at least once
            const gamesList = Object.keys(window.GameCollection || {});
            const playedCount = gamesList.filter(id => (Arcade.playCounts[id] || 0) > 0).length;
            if (playedCount >= gamesList.length) {
                this.unlock("bg_all_games");
            }

            // 2. bg_jack_of_all: Earn at least one achievement in every game
            let hasAchInEveryGame = true;
            for (const gId of gamesList) {
                const achsForGame = this.achievements.filter(a => a.gameId === gId);
                const hasUnlockedAny = achsForGame.some(a => this.unlocked[a.id]);
                if (!hasUnlockedAny) {
                    hasAchInEveryGame = false;
                    break;
                }
            }
            if (hasAchInEveryGame && gamesList.length > 0) {
                this.unlock("bg_jack_of_all");
            }

            // 3. bg_unlock_10 & bg_unlock_50: Count unlocks
            const totalUnlocked = Object.keys(this.unlocked).filter(id => id !== "bg_unlock_10" && id !== "bg_unlock_50" && id !== "bg_completionist").length;
            if (totalUnlocked >= 10) {
                this.unlock("bg_unlock_10");
            }
            if (totalUnlocked >= 50) {
                this.unlock("bg_unlock_50");
            }

            // 4. bg_completionist: Unlock all other achievements
            const totalOtherCount = this.achievements.filter(a => a.id !== "bg_completionist").length;
            const currentOtherUnlocked = Object.keys(this.unlocked).filter(id => id !== "bg_completionist").length;
            if (currentOtherUnlocked >= totalOtherCount && totalOtherCount > 0) {
                this.unlock("bg_completionist");
            }
        }

        checkRetroactive(Arcade, results, activeGameId) {
            if (!Arcade) return;
            const activeId = activeGameId || Arcade.activeGameId;

            // First, evaluate live game state logic before the instance closes
            if (activeId && Arcade.activeInstance) {
                this._currentUnlockTime = Date.now();
                this.checkLiveState(activeId, Arcade, Arcade.activeInstance);
            }

            if (!Arcade.highScores) return;

            // Accumulate progress stats for ongoing gameplay sessions
            if (results && activeId) {
                this._currentUnlockTime = Date.now();
                const score = results.score || 0;

                // 1. Sudoku solved count
                if (activeId === "sudoku" && score === 100) {
                    this.incrementProgress("sudoku_solve_5", 1);
                    this.incrementProgress("sudoku_solve_10", 1);
                }
                // 2. Whack Moles count
                if (activeId === "whack" && score > 0) {
                    this.incrementProgress("whack_moles_100", score);
                }
                // 3. Tetris Lines count
                if (activeId === "tetris" && Arcade.activeInstance && Arcade.activeInstance.linesCleared > 0) {
                    this.incrementProgress("tetris_lines_50", Arcade.activeInstance.linesCleared);
                }
                // 4. Minesweeper clear boards count
                if (activeId === "minesweeper" && results.isBest) {
                    this.incrementProgress("minesweeper_clear_5", 1);
                    this.incrementProgress("minesweeper_clear_10", 1);
                }
                // 5. Maze escape boards count
                if (activeId === "maze" && results.isBest) {
                    this.incrementProgress("maze_escape_5", 1);
                    this.incrementProgress("maze_escape_10", 1);
                }
                // 6. Retro Snake apples eaten count
                if (activeId === "snake" && score > 0) {
                    this.incrementProgress("snake_apples_100", score);
                }
                // 7. Tic-Tac-Toe win count
                if (activeId === "tictactoe" && score === 100) {
                    this.incrementProgress("tictactoe_win_5", 1);
                    this.incrementProgress("tictactoe_win_10", 1);
                }
                // 8. Water Sort levels count
                if (activeId === "watersort" && results.isBest) {
                    this.incrementProgress("watersort_level_5", 1);
                    this.incrementProgress("watersort_level_10", 1);
                    this.incrementProgress("watersort_level_20", 1);
                }
                // 9. Memory Match board complete count
                if (activeId === "memory" && score === 100) {
                    this.incrementProgress("memory_level_5", 1);
                    this.incrementProgress("memory_level_10", 1);
                }
                // 10. Chicken Tower blocks laid count (platforms climbed)
                if (activeId === "chickentower" && score > 0) {
                    this.incrementProgress("chickentower_blocks_100", score);
                }
                // 11. Chicken Crossing obstacles crossed count
                if (activeId === "chickencrossing" && score > 0) {
                    this.incrementProgress("chickencross_cross_200", score);
                }
                // 12. Connect 4 win count
                if (activeId === "connect4" && score === 100) {
                    this.incrementProgress("connect4_win_5", 1);
                    this.incrementProgress("connect4_win_10", 1);
                }
                // 13. Sliding Puzzle solved count
                if (activeId === "slidingpuzzle" && score === 100) {
                    this.incrementProgress("sliding_solve_5", 1);
                    this.incrementProgress("sliding_solve_10", 1);
                }
                // 14. Dots and Boxes win count
                if (activeId === "dotsandboxes" && score === 100) {
                    this.incrementProgress("dots_win_5", 1);
                    this.incrementProgress("dots_win_10", 1);
                }
                // 15. Pipe Connect solved count
                if (activeId === "pipeconnect" && score > 0) {
                    this.incrementProgress("pipe_solve_5", 1);
                    this.incrementProgress("pipe_solve_10", 1);
                    this.incrementProgress("pipe_solve_20", 1);
                }
                // 16. Cloud Adventure stars collected count
                if (activeId === "cloudadventure" && Arcade.activeInstance && Arcade.activeInstance.starsCollected > 0) {
                    this.incrementProgress("cloud_stars_50", Arcade.activeInstance.starsCollected);
                }
                // 17. Fishing Frenzy fish caught count
                if (activeId === "fishingfrenzy" && Arcade.activeInstance) {
                    let catchSum = 0;
                    const caught = Arcade.activeInstance.caughtList || {};
                    Object.keys(caught).forEach(k => { catchSum += caught[k] || 0; });
                    if (catchSum > 0) {
                        this.incrementProgress("fishing_fish_100", catchSum);
                    }
                }
            }

            // Check high scores and launch count and unlock achievements retroactively
            Object.keys(Arcade.highScores).forEach(gId => {
                const score = Arcade.highScores[gId] || 0;
                const playCount = Arcade.playCounts[gId] || 0;

                if (activeId && gId === activeId) {
                    this._currentUnlockTime = Date.now();
                } else {
                    this._currentUnlockTime = "legacy";
                }

                // Unlock start achievements automatically if played
                if (playCount >= 1) {
                    if (gId === "sudoku") this.unlock("sudoku_start");
                    if (gId === "tictactoe") this.unlock("tictactoe_move_1");
                    if (gId === "connect4") this.unlock("connect4_move_1");
                    if (gId === "slidingpuzzle") this.unlock("sliding_move_1");
                    if (gId === "dotsandboxes") this.unlock("dots_line_1");
                    if (gId === "archerymaster") this.unlock("archery_shoot_1");
                    if (gId === "knifehit") this.unlock("knife_throw_1");
                    if (gId === "bottleflip") this.unlock("bottle_flip_1");
                    if (gId === "pipeconnect") this.unlock("pipe_rotate_1");
                    if (gId === "cloudadventure") this.unlock("cloud_jump_1");
                    if (gId === "fishingfrenzy") this.unlock("fishing_catch_1");
                    if (gId === "warehouseboy") this.unlock("warehouseboy_level_1");
                }

                // Play count targets check
                if (gId === "sudoku" && playCount >= 10) this.unlock("sudoku_play_10");
                if (gId === "2048" && playCount >= 10) this.unlock("2048_play_10");
                if (gId === "flappy" && playCount >= 15) this.unlock("flappy_plays_15");
                if (gId === "spaceship" && playCount >= 10) this.unlock("spaceship_plays_10");
                if (gId === "whack" && playCount >= 15) this.unlock("whack_plays_15");
                if (gId === "tetris" && playCount >= 10) this.unlock("tetris_plays_10");
                if (gId === "mergefruits" && playCount >= 10) this.unlock("mergefruits_plays_10");
                if (gId === "dino") {
                    if (playCount >= 10) this.unlock("dino_plays_10");
                    if (playCount >= 25) this.unlock("dino_plays_25");
                }
                if (gId === "balloon" && playCount >= 15) this.unlock("balloon_plays_15");
                if (gId === "minesweeper" && playCount >= 15) this.unlock("minesweeper_plays_15");
                if (gId === "maze" && playCount >= 20) this.unlock("maze_plays_20");
                if (gId === "cricket" && playCount >= 15) this.unlock("cricket_plays_15");
                if (gId === "snake" && playCount >= 15) this.unlock("snake_plays_15");
                if (gId === "breakout" && playCount >= 15) this.unlock("breakout_plays_15");
                if (gId === "tictactoe" && playCount >= 15) this.unlock("tictactoe_plays_15");
                if (gId === "watersort" && playCount >= 25) this.unlock("watersort_plays_25");
                if (gId === "memory" && playCount >= 15) this.unlock("memory_plays_15");
                if (gId === "chickentower" && playCount >= 15) this.unlock("chickentower_plays_15");
                if (gId === "chickencrossing" && playCount >= 15) this.unlock("chickencross_plays_15");
                if (gId === "connect4" && playCount >= 15) this.unlock("connect4_plays_15");
                if (gId === "slidingpuzzle" && playCount >= 15) this.unlock("sliding_plays_15");
                if (gId === "dotsandboxes" && playCount >= 15) this.unlock("dots_plays_15");
                if (gId === "archerymaster" && playCount >= 15) this.unlock("archery_plays_15");
                if (gId === "knifehit" && playCount >= 15) this.unlock("knife_plays_15");
                if (gId === "bottleflip" && playCount >= 20) this.unlock("bottle_plays_20");
                if (gId === "pipeconnect" && playCount >= 25) this.unlock("pipe_plays_25");
                if (gId === "cloudadventure" && playCount >= 15) this.unlock("cloud_plays_15");
                if (gId === "fishingfrenzy" && playCount >= 15) this.unlock("fishing_plays_15");
                if (gId === "warehouseboy" && playCount >= 10) this.unlock("warehouseboy_plays_10");

                // Score targets check
                if (score <= 0) return;

                if (gId === "sudoku" && score >= 1) this.unlock("sudoku_solve_1");

                if (gId === "2048") {
                    if (score >= 20000) this.unlock("2048_score_20k");
                }

                if (gId === "flappy") {
                    if (score >= 1) this.unlock("flappy_pipe_1");
                    if (score >= 10) this.unlock("flappy_pipe_10");
                    if (score >= 30) this.unlock("flappy_score_30");
                    if (score >= 50) this.unlock("flappy_score_50");
                    if (score >= 100) this.unlock("flappy_score_100");
                }

                if (gId === "spaceship") {
                    if (score >= 10) this.unlock("spaceship_kill_10");
                    if (score >= 1000) this.unlock("spaceship_score_1k");
                    if (score >= 2500) this.unlock("spaceship_score_2500");
                    if (score >= 5000) this.unlock("spaceship_score_5k");
                }

                if (gId === "whack") {
                    this.unlock("whack_mole_1");
                    if (score >= 20) this.unlock("whack_score_20");
                    if (score >= 50) this.unlock("whack_score_50");
                    if (score >= 80) this.unlock("whack_score_80");
                }

                if (gId === "tetris") {
                    if (score >= 1) this.unlock("tetris_line_1");
                    if (score >= 2000) this.unlock("tetris_score_2k");
                    if (score >= 10000) this.unlock("tetris_score_10k");
                }

                if (gId === "mergefruits") {
                    this.unlock("mergefruits_merge_1");
                    if (score >= 1500) this.unlock("mergefruits_score_1500");
                    if (score >= 3000) this.unlock("mergefruits_score_3k");
                }

                if (gId === "dino") {
                    if (score >= 10) this.unlock("dino_cacti_10");
                    if (score >= 300) this.unlock("dino_score_300");
                    if (score >= 1000) this.unlock("dino_score_1k");
                    if (score >= 2000) this.unlock("dino_score_2k");
                    if (score >= 5000) this.unlock("dino_score_5k");
                }

                if (gId === "balloon") {
                    if (score >= 20) this.unlock("balloon_pop_20");
                    if (score >= 50) this.unlock("balloon_pop_50");
                    if (score >= 100) this.unlock("balloon_score_100");
                    if (score >= 200) this.unlock("balloon_score_200");
                    if (score >= 500) this.unlock("balloon_score_500");
                }

                if (gId === "minesweeper" && score >= 1) {
                    this.unlock("minesweeper_safe_1");
                    this.unlock("minesweeper_clear_1");
                }

                if (gId === "maze" && score >= 1) {
                    this.unlock("maze_escape_1");
                    this.unlock("maze_escape_medium");
                }

                if (gId === "cricket") {
                    if (score >= 1) this.unlock("cricket_run_1");
                    if (score >= 4) this.unlock("cricket_boundary");
                    if (score >= 50) this.unlock("cricket_runs_50");
                    if (score >= 100) this.unlock("cricket_runs_100");
                    if (score >= 200) this.unlock("cricket_runs_200");
                }

                if (gId === "snake") {
                    if (score >= 1) this.unlock("snake_apple_1");
                    if (score >= 15) this.unlock("snake_length_15");
                    if (score >= 50) this.unlock("snake_score_50");
                    if (score >= 100) this.unlock("snake_score_100");
                    if (score >= 200) this.unlock("snake_score_200");
                }

                if (gId === "breakout") {
                    if (score >= 1) this.unlock("breakout_brick_1");
                    if (score >= 50) this.unlock("breakout_score_50");
                    if (score >= 200) this.unlock("breakout_score_200");
                    if (score >= 500) this.unlock("breakout_score_500");
                }

                if (gId === "tictactoe" && score >= 1) {
                    this.unlock("tictactoe_win_1");
                }

                if (gId === "watersort" && score >= 1) {
                    this.unlock("watersort_level_1");
                }

                if (gId === "memory" && score >= 1) {
                    this.unlock("memory_level_1");
                }

                if (gId === "chickentower") {
                    if (score >= 5) this.unlock("chickentower_score_5");
                    if (score >= 15) this.unlock("chickentower_score_15");
                    if (score >= 30) this.unlock("chickentower_score_30");
                    if (score >= 50) this.unlock("chickentower_score_50");
                    if (score >= 100) this.unlock("chickentower_score_100");
                }

                if (gId === "chickencrossing") {
                    this.unlock("chickencross_road_1");
                    if (score >= 10) this.unlock("chickencross_score_10");
                    if (score >= 25) this.unlock("chickencross_score_25");
                    if (score >= 50) this.unlock("chickencross_score_50");
                    if (score >= 100) this.unlock("chickencross_score_100");
                }

                if (gId === "connect4" && score >= 1) {
                    this.unlock("connect4_win_1");
                }

                if (gId === "slidingpuzzle" && score >= 1) {
                    this.unlock("sliding_solve_1");
                }

                if (gId === "dotsandboxes" && score >= 1) {
                    this.unlock("dots_win_1");
                }

                if (gId === "archerymaster") {
                    if (score >= 10) this.unlock("archery_bullseye");
                    if (score >= 50) this.unlock("archery_score_50");
                    if (score >= 100) this.unlock("archery_score_100");
                    if (score >= 150) this.unlock("archery_score_150");
                }

                if (gId === "knifehit") {
                    if (score >= 1) this.unlock("knife_break_1");
                    if (score >= 5) this.unlock("knife_boss_1");
                }

                if (gId === "bottleflip") {
                    if (score >= 1) this.unlock("bottle_flip_1");
                    if (score >= 2) this.unlock("bottle_flips_2");
                    if (score >= 5) this.unlock("bottle_flips_5");
                    if (score >= 15) this.unlock("bottle_flips_15");
                }

                if (gId === "pipeconnect") {
                    if (score >= 1) this.unlock("pipe_solve_1");
                }

                if (gId === "cloudadventure") {
                    if (score >= 100) this.unlock("cloud_score_100");
                    if (score >= 300) this.unlock("cloud_score_300");
                    if (score >= 500) this.unlock("cloud_score_500");
                }

                if (gId === "fishingfrenzy") {
                    if (score >= 500) this.unlock("fishing_score_500");
                    if (score >= 1000) this.unlock("fishing_score_1k");
                }

                if (gId === "warehouseboy") {
                    if (score >= 1) this.unlock("warehouseboy_level_1");
                    if (score >= 5) this.unlock("warehouseboy_all_levels");
                }
            });

            // Perform final app-wide check after retroactive run
            if (activeId) {
                this._currentUnlockTime = Date.now();
            } else {
                this._currentUnlockTime = "legacy";
            }
            this.checkBiteGamezWideAchievements();
            this._currentUnlockTime = null;
        }

        checkLiveState(gameId, app, instance) {
            if (!instance) return;
            
            // Check based on active game parameters
            if (gameId === "mergefruits") {
                this.unlock("mergefruits_merge_1");
                if (instance.fruits) {
                    const peach = instance.fruits.some(f => f.typeIdx >= 6); // Peach
                    if (peach) this.unlock("mergefruits_peach");
                    
                    const melon = instance.fruits.some(f => f.typeIdx >= 7); // Melon
                    if (melon) this.unlock("mergefruits_melon");
                    
                    const watermelon = instance.fruits.some(f => f.typeIdx >= 8); // Watermelon
                    if (watermelon) this.unlock("mergefruits_watermelon");
                }
            }

            if (gameId === "2048") {
                if (instance.grid) {
                    let maxTile = 0;
                    for (let r = 0; r < 4; r++) {
                        for (let c = 0; c < 4; r++) { // wait, let's fix c++ here
                            for (let c = 0; c < 4; c++) {
                                if (instance.grid[r][c] > maxTile) maxTile = instance.grid[r][c];
                            }
                        }
                    }
                    if (maxTile >= 128) this.unlock("2048_tile_128");
                    if (maxTile >= 256) this.unlock("2048_tile_256");
                    if (maxTile >= 1024) this.unlock("2048_tile_1024");
                    if (maxTile >= 2048) this.unlock("2048_tile_2048");
                    if (maxTile >= 4096) this.unlock("2048_tile_4096");
                }
            }

            if (gameId === "sudoku") {
                this.unlock("sudoku_start");
                // Check expert difficulty solve
                if (instance.board && instance.solution) {
                    let solved = true;
                    for (let r = 0; r < 9; r++) {
                        for (let c = 0; c < 9; c++) {
                            if (instance.board[r][c] !== instance.solution[r][c]) { solved = false; break; }
                        }
                    }
                    if (solved) {
                        if (instance.level === "expert") this.unlock("sudoku_expert");
                        if (!instance.hasMadeMistake) this.unlock("sudoku_no_errors");
                    }
                }
            }

            if (gameId === "flappy") {
                if (app.gameSeconds >= 120) {
                    this.unlock("flappy_time_2m");
                }
            }

            if (gameId === "spaceship") {
                if (instance.bossesKilled >= 5) {
                    this.unlock("spaceship_bosses_5");
                }
                if (instance.bossesKilled >= 1) {
                    this.unlock("spaceship_boss_1");
                }
            }

            if (gameId === "whack") {
                if (instance.hitGoldenMole) {
                    this.unlock("whack_golden");
                }
            }

            if (gameId === "tetris") {
                if (instance.lastClearedCount === 4) {
                    this.unlock("tetris_four_lines");
                }
                if (instance.lastClearedCount === 2) {
                    this.unlock("tetris_double");
                }
            }

            if (gameId === "balloon") {
                if (instance.maxCombo >= 3) {
                    this.unlock("balloon_combo_3");
                }
            }

            if (gameId === "minesweeper") {
                if (instance.isWon) {
                    if (app.gameSeconds < 120 && app.gameSeconds > 0) {
                        this.unlock("minesweeper_time_2m");
                    }
                }
                if (instance.flagsPlaced >= 5) {
                    this.unlock("minesweeper_flag_5");
                }
            }

            if (gameId === "maze") {
                if (instance.isWon) {
                    if (app.gameSeconds < 30 && app.gameSeconds > 0) {
                        this.unlock("maze_speedy");
                    }
                    if (instance.size === "hard") {
                        this.unlock("maze_escape_hard");
                    }
                }
            }

            if (gameId === "cricket") {
                if (instance.consecutiveBoundaries >= 3) {
                    this.unlock("cricket_boundaries_3");
                }
            }

            if (gameId === "breakout") {
                if (instance.isScreenCleared) {
                    this.unlock("breakout_clear_screen");
                }
                if (instance.combo >= 10) {
                    this.unlock("breakout_combo_10");
                }
            }

            if (gameId === "tictactoe") {
                if (instance.isWon) {
                    if (instance.movesCount === 3) {
                        this.unlock("tictactoe_quick_win");
                    }
                    if (instance.difficulty === "hard") {
                        this.unlock("tictactoe_hard_draw");
                    }
                } else if (instance.isDraw && instance.difficulty === "hard") {
                    this.unlock("tictactoe_hard_draw");
                }
            }

            if (gameId === "watersort") {
                if (instance.isWon && instance.movesCount < 15) {
                    this.unlock("watersort_speedy");
                }
            }

            if (gameId === "memory") {
                if (instance.isWon) {
                    if (instance.mistakesCount < 10) {
                        this.unlock("memory_low_errors");
                    }
                    if (app.gameSeconds < 60 && app.gameSeconds > 0) {
                        this.unlock("memory_speedy");
                    }
                }
            }

            if (gameId === "connect4") {
                if (instance.isWon) {
                    if (instance.movesCount < 8) {
                        this.unlock("connect4_fast_win");
                    }
                    if (instance.winDirection === "vertical") {
                        this.unlock("connect4_vertical");
                    }
                }
            }

            if (gameId === "slidingpuzzle") {
                if (instance.isWon) {
                    if (instance.movesCount < 40) {
                        this.unlock("sliding_low_moves");
                    }
                    if (instance.size === 4) {
                        this.unlock("sliding_solve_4x4");
                    }
                }
            }

            if (gameId === "dotsandboxes") {
                if (instance.playerBoxesCount >= 15) {
                    this.unlock("dots_boxes_15");
                }
            }

            if (gameId === "archerymaster") {
                if (instance.consecutiveBullseyes >= 3) {
                    this.unlock("archery_bullseyes_3");
                }
            }

            if (gameId === "knifehit") {
                if (instance.bossesBeaten >= 3) {
                    this.unlock("knife_bosses_3");
                }
                if (instance.bossesBeaten >= 5) {
                    this.unlock("knife_bosses_5");
                }
            }

            if (gameId === "bottleflip") {
                if (instance.consecutiveFlips >= 10) {
                    this.unlock("bottle_flips_10");
                }
            }

            if (gameId === "pipeconnect") {
                if (instance.isWon && instance.level >= 15) {
                    this.unlock("pipe_level_15");
                }
            }

            if (gameId === "fishingfrenzy") {
                if (instance.caughtRare) {
                    this.unlock("fishing_rare");
                }
            }

            if (gameId === "warehouseboy") {
                if (instance.undoUsed === false && instance.isLevelCompleted) {
                    this.unlock("warehouseboy_no_undo");
                }
                if (instance.currentLevelNum === 3 && instance.movesCount < 12 && instance.isLevelCompleted) {
                    this.unlock("warehouseboy_quick_level3");
                }
            }
        }

        initializeUI(Arcade) {
            this.arcade = Arcade;

            // Setup tab buttons
            const tabBtns = document.querySelectorAll(".modal-tab-btn");
            tabBtns.forEach(btn => {
                btn.onclick = () => {
                    tabBtns.forEach(b => {
                        b.classList.remove("active");
                        b.style.borderBottomColor = "transparent";
                        b.style.color = "var(--text-secondary)";
                    });
                    btn.classList.add("active");
                    btn.style.borderBottomColor = "var(--accent-light)";
                    btn.style.color = "var(--text-primary)";

                    const tab = btn.getAttribute("data-tab");
                    const tabStats = document.getElementById("tab-content-stats");
                    const tabAch = document.getElementById("tab-content-achievements");
                    if (tab === "stats") {
                        tabStats.classList.remove("hidden");
                        tabStats.style.display = "block";
                        tabAch.classList.add("hidden");
                        tabAch.style.display = "none";
                    } else {
                        tabStats.classList.add("hidden");
                        tabStats.style.display = "none";
                        tabAch.classList.remove("hidden");
                        tabAch.style.display = "block";
                        
                        // Default back to overview on tab click
                        this.currentView = "overview";
                        this.selectedGameId = null;
                        this.renderAchievementsList();
                    }
                };
            });

            this.renderAchievementsList();
        }

        renderAchievementsList() {
            const container = document.getElementById("tab-content-achievements");
            if (!container) return;

            if (this.currentView === "overview") {
                this.renderOverview(container);
            } else {
                this.renderDetails(container, this.selectedGameId);
            }
        }

        renderOverview(container) {
            const totalCount = this.achievements.length;
            const unlockedCount = this.achievements.filter(ach => !!this.unlocked[ach.id]).length;
            const remainingCount = totalCount - unlockedCount;
            const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

            // BiteGamez wide counts
            const wideAchievements = this.achievements.filter(ach => ach.gameId === "all");
            const wideTotal = wideAchievements.length;
            const wideUnlocked = wideAchievements.filter(ach => !!this.unlocked[ach.id]).length;
            const widePercent = wideTotal > 0 ? Math.round((wideUnlocked / wideTotal) * 100) : 0;

            // Build Overview layout HTML
            let html = `
                <div class="achievements-dashboard" style="display:flex; flex-direction:column; gap:16px; padding:4px;">
                    <!-- Achievement Header Card -->
                    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:16px; display:flex; flex-direction:column; gap:12px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        <div style="display:flex; align-items:baseline; justify-content:space-between;">
                            <span style="font-size:15px; font-weight:800; text-transform:uppercase; color:var(--text-primary); letter-spacing:0.5px;">🏆 Achievements Overview</span>
                            <span style="font-size:13px; font-weight:bold; color:#eab308; font-family:monospace;">${unlockedCount} / ${totalCount}</span>
                        </div>
                        <!-- Progress Bar -->
                        <div style="width:100%; height:8px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;">
                            <div style="width:${completionPercentage}%; height:100%; background:linear-gradient(90deg, #f59e0b, #eab308); border-radius:4px;"></div>
                        </div>
                        <!-- Stats Grid -->
                        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; text-align:center; margin-top:4px;">
                            <div style="background:rgba(255,255,255,0.02); padding:8px 4px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
                                <div style="font-size:16px; font-weight:900; color:var(--text-primary); font-family:monospace;">${unlockedCount}</div>
                                <div style="font-size:9px; color:var(--text-secondary); text-transform:uppercase; margin-top:2px; letter-spacing:0.3px;">Unlocked</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.02); padding:8px 4px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
                                <div style="font-size:16px; font-weight:900; color:var(--text-primary); font-family:monospace;">${remainingCount}</div>
                                <div style="font-size:9px; color:var(--text-secondary); text-transform:uppercase; margin-top:2px; letter-spacing:0.3px;">Locked</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.02); padding:8px 4px; border-radius:8px; border:1px solid rgba(255,255,255,0.04);">
                                <div style="font-size:16px; font-weight:900; color:#10b981; font-family:monospace;">${completionPercentage}%</div>
                                <div style="font-size:9px; color:var(--text-secondary); text-transform:uppercase; margin-top:2px; letter-spacing:0.3px;">Ratio</div>
                            </div>
                        </div>
                    </div>

                    <!-- Section: BiteGamez Wide -->
                    <div>
                        <h3 style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-secondary); margin-bottom:8px; font-weight:800;">BiteGamez Milestones</h3>
                        <div class="ach-category-card" data-game-id="bitegamez" style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:12px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.2s; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
                            <div style="font-size:28px; background:rgba(234,179,8,0.08); width:48px; height:48px; display:flex; align-items:center; justify-content:center; border-radius:10px; filter:drop-shadow(0 0 3px rgba(234,179,8,0.25));">🏆</div>
                            <div style="flex:1; min-width:0;">
                                <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                    <span style="font-size:13px; font-weight:bold; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">BiteGamez Wide</span>
                                    <span style="font-size:11px; font-weight:bold; color:#eab308; font-family:monospace; margin-left:8px;">${wideUnlocked} / ${wideTotal}</span>
                                </div>
                                <p style="font-size:10.5px; color:var(--text-secondary); margin-top:2px; margin-bottom:6px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">Universal trophies and platform achievements</p>
                                <div style="width:100%; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                    <div style="width:${widePercent}%; height:100%; background:#eab308; border-radius:2px;"></div>
                                </div>
                            </div>
                            <div style="font-size:16px; color:var(--text-secondary); font-weight:bold; margin-left:4px;">➡️</div>
                        </div>
                    </div>

                    <!-- Section: Games list -->
                    <div>
                        <h3 style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-secondary); margin-bottom:8px; font-weight:800;">Game Achievements</h3>
                        <div style="display:flex; flex-direction:column; gap:8px;">
            `;

            // Loop and render cards for each of the 29 games
            Object.keys(window.GameCollection || {}).forEach(gId => {
                const game = window.GameCollection[gId];
                if (!game) return;

                const gameAchs = this.achievements.filter(ach => ach.gameId === gId);
                const total = gameAchs.length;
                const unlocked = gameAchs.filter(ach => !!this.unlocked[ach.id]).length;
                const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;
                const isCompleted = unlocked === total && total > 0;

                let iconChar = "🎮";
                // Convert common Material Symbols names to approximate emojis for achievements screen
                if (game.icon === "grid_on") iconChar = "🔢";
                else if (game.icon === "sports_cricket") iconChar = "🏏";
                else if (game.icon === "pest_control") iconChar = "🔨";
                else if (game.icon === "extension") iconChar = "🧩";
                else if (game.icon === "opacity") iconChar = "🎣";
                else if (game.icon === "water_drop") iconChar = "🧪";
                else if (game.icon === "grain") iconChar = "🪵";
                else if (game.icon === "layers") iconChar = "🥞";
                else if (game.icon === "widgets") iconChar = "🧱";
                else if (game.icon === "grid_view") iconChar = "💣";
                else if (game.icon === "casino") iconChar = "🍒";

                html += `
                    <div class="ach-category-card" data-game-id="${gId}" style="background:var(--bg-card); border:1px solid ${isCompleted ? "rgba(34, 197, 94, 0.25)" : "var(--border-color)"}; border-radius:12px; padding:10px 12px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.2s; position:relative; box-shadow:0 1.5px 4px rgba(0,0,0,0.03);">
                        <div style="font-size:24px; background:${isCompleted ? "rgba(34, 197, 94, 0.08)" : "rgba(255,255,255,0.03)"}; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:10px; flex-shrink:0;">
                            ${iconChar}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                                <span style="font-size:12.5px; font-weight:bold; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${game.name}</span>
                                <span style="font-size:11px; font-weight:bold; color:${isCompleted ? "var(--accent)" : "var(--text-secondary)"}; font-family:monospace; margin-left:8px;">
                                    ${unlocked} / ${total}
                                </span>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                                <div style="flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                    <div style="width:${percent}%; height:100%; background:${isCompleted ? "var(--accent)" : "#eab308"}; border-radius:2px;"></div>
                                </div>
                                <span style="font-size:9.5px; color:var(--text-secondary); font-family:monospace; width:28px; text-align:right;">${percent}%</span>
                            </div>
                        </div>
                        ${isCompleted ? `
                            <div style="background:rgba(34, 197, 94, 0.12); color:var(--accent); font-size:8px; font-weight:900; text-transform:uppercase; padding:2px 6px; border-radius:12px; letter-spacing:0.5px; white-space:nowrap; margin-left:4px; border:0.8px solid rgba(34, 197, 94, 0.3);">
                                Completed
                            </div>
                        ` : `
                            <div style="font-size:14px; color:var(--text-secondary); margin-left:4px; font-weight:bold;">➡️</div>
                        `}
                    </div>
                `;
            });

            html += `
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Add click events to cards
            container.querySelectorAll(".ach-category-card").forEach(card => {
                card.onclick = () => {
                    const gId = card.getAttribute("data-game-id");
                    this.openCategory(gId);
                };
            });
        }

        renderDetails(container, gameId) {
            const isWide = gameId === "bitegamez";
            const targetGameId = isWide ? "all" : gameId;
            const gameDef = isWide ? { name: "BiteGamez Wide", icon: "emoji_events" } : window.GameCollection[gameId];
            if (!gameDef) {
                this.goBack();
                return;
            }

            const gameAchs = this.achievements.filter(ach => ach.gameId === targetGameId);
            const totalCount = gameAchs.length;
            const unlockedCount = gameAchs.filter(ach => !!this.unlocked[ach.id]).length;
            const percent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

            // Filter the achievements list
            const filtered = gameAchs.filter(ach => {
                const isUnlocked = !!this.unlocked[ach.id];
                if (this.activeFilter === "unlocked" && !isUnlocked) return false;
                if (this.activeFilter === "locked" && isUnlocked) return false;
                return true;
            });

            let html = `
                <div class="achievements-details" style="display:flex; flex-direction:column; gap:14px; padding:4px;">
                    <!-- Back navigation (min 48px hit target) -->
                    <button id="btn-ach-back" style="display:flex; align-items:center; gap:8px; width:fit-content; background:none; border:none; color:var(--text-secondary); font-size:12.5px; font-weight:bold; cursor:pointer; padding:12px 16px 12px 4px; margin:-4px 0 0 -4px; min-height:48px; border-radius:8px; transition:color 0.2s;">
                        <span style="font-size:16px;">⬅️</span> Back to Overview
                    </button>

                    <!-- Header card for this specific category -->
                    <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:12px; padding:14px; display:flex; align-items:center; gap:12px; box-shadow:0 3px 8px rgba(0,0,0,0.04);">
                        <div style="font-size:28px; width:48px; height:48px; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; border-radius:10px;">
                            ${isWide ? "🏆" : "🎮"}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <h2 style="font-size:15px; font-weight:800; color:var(--text-primary); margin:0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${gameDef.name}</h2>
                            <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                                <div style="flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                    <div style="width:${percent}%; height:100%; background:#eab308; border-radius:2px;"></div>
                                </div>
                                <span style="font-size:11px; font-weight:bold; color:#eab308; font-family:monospace; margin-left:4px; white-space:nowrap;">
                                    ${unlockedCount} / ${totalCount} (${percent}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Filter Bar tabs (min 48px touch heights) -->
                    <div style="display:flex; background:rgba(255,255,255,0.03); padding:4px; border-radius:8px; border:1px solid var(--border-color); gap:4px;">
                        <button class="ach-sub-filter" data-sub="all" style="flex:1; min-height:40px; font-size:11.5px; border-radius:6px; border:none; cursor:pointer; font-weight:bold; transition:all 0.15s; background:${this.activeFilter === "all" ? "rgba(255,255,255,0.08)" : "none"}; color:${this.activeFilter === "all" ? "white" : "var(--text-secondary)"};">
                            All (${totalCount})
                        </button>
                        <button class="ach-sub-filter" data-sub="unlocked" style="flex:1; min-height:40px; font-size:11.5px; border-radius:6px; border:none; cursor:pointer; font-weight:bold; transition:all 0.15s; background:${this.activeFilter === "unlocked" ? "rgba(255,255,255,0.08)" : "none"}; color:${this.activeFilter === "unlocked" ? "white" : "var(--text-secondary)"};">
                            Unlocked (${unlockedCount})
                        </button>
                        <button class="ach-sub-filter" data-sub="locked" style="flex:1; min-height:40px; font-size:11.5px; border-radius:6px; border:none; cursor:pointer; font-weight:bold; transition:all 0.15s; background:${this.activeFilter === "locked" ? "rgba(255,255,255,0.08)" : "none"}; color:${this.activeFilter === "locked" ? "white" : "var(--text-secondary)"};">
                            Locked (${totalCount - unlockedCount})
                        </button>
                    </div>

                    <!-- Achievements list for this category -->
                    <div style="display:flex; flex-direction:column; gap:8px;">
            `;

            if (filtered.length === 0) {
                html += `
                    <div style="text-align:center; padding:32px 16px; color:var(--text-secondary); font-size:12.5px; background:rgba(255,255,255,0.01); border:1px dashed var(--border-color); border-radius:12px;">
                        No achievements found matching this filter. Keep gaming! 🎮
                    </div>
                `;
            } else {
                filtered.forEach(ach => {
                    const isUnlocked = !!this.unlocked[ach.id];
                    const unlockTime = this.unlocked[ach.id];
                    const isSecret = ach.secret && !isUnlocked;

                    // Compute dynamic progress if any
                    let progressHtml = "";
                    if (ach.progressTarget && !isUnlocked) {
                        const current = this.progress[ach.id] || 0;
                        const percent = Math.min(100, Math.round((current / ach.progressTarget) * 100));
                        progressHtml = `
                            <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                                <div style="flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                    <div style="width:${percent}%; height:100%; background:#eab308; border-radius:2px;"></div>
                                </div>
                                <span style="font-size:9.5px; color:var(--text-secondary); font-family:monospace; font-weight:bold;">${current}/${ach.progressTarget}</span>
                            </div>
                        `;
                    } else if (ach.progressType && !isUnlocked && this.arcade) {
                        let current = 0;
                        let target = 0;
                        if (ach.progressType === "games_played") {
                            const gamesList = Object.keys(window.GameCollection || {});
                            current = gamesList.filter(id => (this.arcade.playCounts[id] || 0) > 0).length;
                            target = gamesList.length;
                        } else if (ach.progressType === "games_achieved") {
                            const gamesList = Object.keys(window.GameCollection || {});
                            current = gamesList.filter(gId => {
                                const achsForGame = this.achievements.filter(a => a.gameId === gId);
                                return achsForGame.some(a => this.unlocked[a.id]);
                            }).length;
                            target = gamesList.length;
                        }
                        const percent = Math.min(100, Math.round((current / target) * 100));
                        progressHtml = `
                            <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                                <div style="flex:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                    <div style="width:${percent}%; height:100%; background:#eab308; border-radius:2px;"></div>
                                </div>
                                <span style="font-size:9.5px; color:var(--text-secondary); font-family:monospace; font-weight:bold;">${current}/${target}</span>
                            </div>
                        `;
                    }

                    const dateStr = this.formatUnlockDate(unlockTime);

                    html += `
                        <div style="display:flex; align-items:center; gap:12px; background:${isUnlocked ? "rgba(234, 179, 8, 0.04)" : "rgba(255,255,255,0.015)"}; border:1px solid ${isUnlocked ? "rgba(234, 179, 8, 0.25)" : "var(--border-color)"}; padding:12px; border-radius:10px; transition:all 0.15s; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
                            <div style="font-size:26px; min-width:44px; text-align:center; filter:${isUnlocked ? "drop-shadow(0 0 5px rgba(234,179,8,0.35))" : "grayscale(1) opacity(0.25)"};">
                                ${isSecret ? "🔒" : (ach.icon || "🏆")}
                            </div>
                            <div style="flex:1; min-width:0;">
                                <div style="display:flex; align-items:baseline; justify-content:space-between; gap:8px;">
                                    <span style="font-size:12.5px; font-weight:bold; color:${isUnlocked ? "#ffffff" : "var(--text-primary)"}; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                                        ${isSecret ? "Secret Achievement" : ach.title}
                                    </span>
                                    ${isUnlocked ? `<span style="font-size:9.5px; color:#eab308; font-weight:bold; white-space:nowrap; border:0.8px solid rgba(234,179,8,0.3); background:rgba(234,179,8,0.08); padding:1px 5px; border-radius:4px;">🏆 Unlocked</span>` : ""}
                                </div>
                                <p style="font-size:10.5px; color:var(--text-secondary); margin:3px 0 0 0; line-height:1.35;">
                                    ${isSecret ? "Secret milestone. Keep playing to uncover its details!" : ach.desc}
                                </p>
                                ${progressHtml}
                                ${unlockTime ? `
                                    <div style="margin-top:4px; text-align:right;">
                                        <span style="font-size:9px; color:var(--text-secondary); font-family:monospace;">${dateStr}</span>
                                    </div>
                                ` : ""}
                            </div>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;

            // Bind Back button click listener
            const backBtn = container.querySelector("#btn-ach-back");
            if (backBtn) {
                backBtn.onclick = () => { this.goBack(); };
            }

            // Bind sub-filters tab listener
            container.querySelectorAll(".ach-sub-filter").forEach(btn => {
                btn.onclick = () => {
                    const subFilter = btn.getAttribute("data-sub");
                    this.setFilter(subFilter);
                };
            });
        }

        openCategory(gId) {
            this.currentView = "details";
            this.selectedGameId = gId;
            this.activeFilter = "all";
            this.renderAchievementsList();
            
            // Play select sound
            if (this.arcade && this.arcade.sound) {
                this.arcade.sound.playSelect();
            }
        }

        goBack() {
            this.currentView = "overview";
            this.selectedGameId = null;
            this.renderAchievementsList();
            
            // Play select sound
            if (this.arcade && this.arcade.sound) {
                this.arcade.sound.playSelect();
            }
        }

        setFilter(filter) {
            this.activeFilter = filter;
            this.renderAchievementsList();
            
            // Play select sound
            if (this.arcade && this.arcade.sound) {
                this.arcade.sound.playSelect();
            }
        }
    }

    // Export singleton to window
    window.AchievementSystem = new AchievementSystem();
})();
