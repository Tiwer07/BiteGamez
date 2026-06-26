# 🍪 BiteGamez Secret Easter Eggs Index

Welcome to the official documentation for the **BiteGamez** secret Easter Egg roster! These delightful, high-scoring surprises are baked directly into the various games across our application. 

Every easter egg rewards the player with a dramatic custom screen-wide falling cookie burst decoration and instantly adds a massive **+500 points** bonus directly to the active score.

---

## 🕹️ Roster of Interactive Sorcery

### 1. 🐹 Whack-A-Mole ("Golden Bite")
* **The Secret**: A rare, golden chocolate-chip cookie mole.
* **How to Trigger**: Play the game naturally. Moles have a randomized **2% chance** to spawn as a Cookie Emoji (🍪) rather than a regular emoji.
* **The Surprise**: Whacking this rare cookie mole instantly unleashes a gold-plated particle splash, triggers the global easter celebration, and grants you **+500 gold-medal points!**

---

### 2. 💣 Minesweeper ("Miner's Lucky Cookie")
* **The Secret**: A hidden treasure buried under the safe soil of the grid.
* **How to Trigger**: At the beginning of each minefield initialization, one non-mine safe grid square is secretly assigned as the lucky tile.
* **The Surprise**: Revealing this lucky block displays a tasty cookie emoji (🍪). The game safely clears the tile, pops a high-contrast toast celebration, and triggers the full screen cookie explosion, rewarding **+500 points** without risking a mine explosion!

---

### 3. ❌ Tic Tac Toe ("Tic-Tac-Cookie")
* **The Secret**: The top turn header acts as an interactive button.
* **How to Trigger**: While playing a match, tap/click the status label at the top of the screen (showing whose turn it is) **exactly 5 times**.
* **The Surprise**: The system plays an encouraging tap countdown, then turns **all empty board slots into cookies (🍪)**! It instantly fires up the celebratory easter egg storm and claims **+500 points** for the scoreboard.

---

### 4. 🧱 Classic Breakout ("Breakout Cookie Blast")
* **The Secret**: A secret item drop pre-baked inside a hidden brick.
* **How to Trigger**: Launch a Breakout match. A brick located near the middle (index 14) holds a hidden cookie power-up.
* **The Surprise**: When the bouncing neon pink ball shatters the lucky brick, a physical, rotating cookie (🍪) falls from the heavens. Guide your green paddle underneath to catch it before it slips into the bottom drain to gain **+500 points** in an instant!

---

### 5. 🐍 Retro Snake ("Snake Cookie Master")
* **The Secret**: A rare treat replacing the snake's daily apple.
* **How to Trigger**: Navigate and feed your snake. Each newly spawned food item has a random **5% chance** of spawning as an Easter Cookie (🍪) instead of a standard red apple.
* **The Surprise**: Directing your snake's head to devour the cookie instantly triggers a dazzling point burst, growing your snake and adding a grand **+500 points** premium value to your high score!

---

### 6. 🎈 Balloon Pop ("Balloon Cookie Burst")
* **The Secret**: A floating sweet prize rising past the screen.
* **How to Trigger**: Balloons float upwards from the bottom. Every spawned balloon has a **3% chance** to ascend as a glowing Cookie Icon (🍪).
* **The Surprise**: Tap or click the special cookie balloon before it exits the top boundary to pop it into a massive shower of glittering cookie sparks and gain a **+500 points** reward!

---

### 7. 🔵 Connect 4 ("Connect 4 Cookie Shower")
* **The Secret**: Drop a custom, high-value delicious cookie into the grid.
* **How to Trigger**: Play the Connect 4 board game naturally. Every piece dropped into any column has a random **5% chance** to turn into a falling chocolate cookie (🍪).
* **The Surprise**: The cookie rolls into place, counts as your valid piece/color, and launches a screensaver-worthy shower of falling cookies while instantly adding **+500 points** to the scoreboard!

---

### 8. 🧩 Sliding Puzzle ("Puzzle Master Cookie" & "New Record")
* **The Secret**: Statistics HUD triggers and personal best recordings.
* **How to Trigger**: 
  - **HUD Trigger**: Tap or click the central **"Moves" counter** label at the top of the board **exactly 5 times**.
  - **PB Record Trigger**: Solve any puzzle dimension (3x3, 4x4, 5x5) and beat your previous personal best score.
* **The Surprise**: Both secrets unleash a triumphant sound effect, a festive cookie burst, and add **+500 points** to celebrate your mental prowess!

---

### 9. ✏️ Dots and Boxes ("Dots & Boxes Cookie Madness")
* **The Secret**: Secret tap spots on the board background.
* **How to Trigger**: Tap/click anywhere on the **empty backing board container** (between the grids of dots) **exactly 6 times**.
* **The Surprise**: The board's borders glow neon gold, triggering the global cookie storm and adding a delicious **+500 points** bonus directly to the active score.

---

### 10. 🃏 Memory Match ("Cookie Memory Mastery")
* **The Secret**: Matching sweet tiles in the card deck.
* **How to Trigger**: Launch a Memory Match match. There is a **35% chance** that one of the matching card symbol pairs in the deck gets replaced by sweet Cookie Emojis (🍪).
* **The Surprise**: Flip and match both chocolate cookies to immediately trigger a glittering cookie storm and celebrate with a sweet **+500 points** bonus score!

---

### 11. 🧪 Water Sort ("Vibrant Water Splash Cookie")
* **The Secret**: Header level select triggers.
* **How to Trigger**: Tap/click the text of the **"Level:" title label** exactly **5 times** (without hitting the select dropdown menu itself).
* **The Surprise**: The vials bubble up with celebratory visual cues and rain down an instant **+500 points** cookie shower!

---

### 12. 🐦 Flappy Bird ("Flappy Cookie Flight")
* **The Secret**: Golden snack hovering inside obstacle pipe gaps.
* **How to Trigger**: Play Flappy Bird safely. Each newly spawned pipe obstacle has a **4% chance** of spawning a floating cookie (🍪) directly in the center of the gap.
* **The Surprise**: Flap your bird safely through the gap to automatically collect the cookie! You instantly get a huge **+5 points** active gameplay boost, a glorious cookie explosion, and a developer's favorite **+500 points** bonus score!

---

## 🛠️ Testing & Triggering (Developer Note)
The entire Easter Egg engine is integrated within `app.js` using the global helper:
```javascript
window.triggerEasterEgg(points, label);
```
This performs state verification, fires custom heavy visual transition physics, triggers confetti-like rising/sinking cookies on the document body, updates the high-contrast overlay, and synchronizes the active game's current score dynamically.
