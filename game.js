const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game settings
const gravity = 0.8;
const jumpPower = -15;
let gameSpeed = 6; // Speed of the game

// Background settings
let backgroundX = 0;
let backgroundSpeed = 2;

// The player object
let player = {
  x: 100,
  y: canvas.height - 150,
  width: 50,
  height: 50,
  velocityY: 0,
  mode: 'cube', // Modes: 'cube', 'ship', 'wave'
  isJumping: false,
  isFalling: false
};

// Score and level variables
let score = 0;
let level = 1;

// Obstacles
let obstacles = [];

// Portal system for switching modes
let portals = [
  { x: canvas.width / 2, y: canvas.height - 100, width: 40, height: 40, mode: 'ship' },
  { x: canvas.width / 2 + 200, y: canvas.height - 100, width: 40, height: 40, mode: 'wave' }
];

// Game state
let isGameOver = false;
let isSpacePressed = false;
let isMouseDown = false;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    isSpacePressed = true;
  }
  if (e.code === "KeyR" && isGameOver) {
    resetGame();  // Restart the game when "R" is pressed
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    isSpacePressed = false;
  }
});

document.addEventListener("mousedown", () => {
  isMouseDown = true;
});

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// Draw the background
function drawBackground() {
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(backgroundX, 0, canvas.width, canvas.height); // Draw background

  // Scroll the background
  backgroundX -= backgroundSpeed;
  if (backgroundX <= -canvas.width) {
    backgroundX = 0; // Loop background
  }
}

// Draw the player in different modes
function drawPlayer() {
  ctx.fillStyle = '#ff4f4f'; // Default color (cube)
  if (player.mode === 'ship') {
    ctx.fillStyle = '#4f87ff';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.width, player.y - player.height);
    ctx.lineTo(player.x + 2 * player.width, player.y);
    ctx.closePath();
    ctx.fill();
  } else if (player.mode === 'wave') {
    ctx.fillStyle = '#f8f8f8';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

// Apply gravity and jumping logic
function handleGravity() {
  if (player.isJumping || player.isFalling) {
    player.velocityY += gravity;
  }
  player.y += player.velocityY;

  if (player.y >= canvas.height - 150) {
    player.y = canvas.height - 150;
    player.velocityY = 0;
    player.isJumping = false;
    player.isFalling = false;
  }
}

// Handle the player's jumping
function handleJumping() {
  if ((isSpacePressed || isMouseDown) && !player.isJumping && player.y === canvas.height - 150) {
    player.isJumping = true;
    player.velocityY = jumpPower;
  }
}

// Handle mode-switching portals
function handlePortals() {
  portals.forEach(portal => {
    if (player.x + player.width > portal.x && player.x < portal.x + portal.width &&
        player.y + player.height > portal.y && player.y < portal.y + portal.height) {
      player.mode = portal.mode;
      player.x = portal.x + portal.width + 20; // Move player to the next position
    }
  });
}

// Create obstacles and update their positions
function createObstacles() {
  if (Math.random() < 0.02) {
    let obstacleHeight = Math.random() * 100 + 50;
    obstacles.push({ x: canvas.width, y: canvas.height - obstacleHeight, width: 50, height: obstacleHeight });
  }

  obstacles.forEach(obstacle => {
    obstacle.x -= gameSpeed;
    if (obstacle.x + obstacle.width < 0) {
      obstacles.shift(); // Remove off-screen obstacles
    }
  });
}

// Draw obstacles on the screen
function drawObstacles() {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = '#ff3d3d';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

// Check for collision between player and obstacles
function checkCollision() {
  obstacles.forEach(obstacle => {
    if (player.x + player.width > obstacle.x && player.x < obstacle.x + obstacle.width &&
        player.y + player.height > obstacle.y) {
      gameOver();
    }
  });
}

// Update score and level
function updateScore() {
  score++;
  if (score % 100 === 0) {
    level++;
    gameSpeed += 1; // Increase game speed with each level
  }
  document.getElementById("score").innerText = "Score: " + score;
}

// Reset the game to initial state
function resetGame() {
  player.y = canvas.height - 150;
  player.velocityY = 0;
  player.mode = 'cube';
  score = 0;
  level = 1;
  gameSpeed = 6;
  obstacles = [];
  isGameOver = false;
}

// Handle game over logic
function gameOver() {
  isGameOver = true;
  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 150, canvas.height / 2);
  ctx.font = "30px Arial";
  ctx.fillText("Press R to Restart", canvas.width / 2 - 100, canvas.height / 2 + 50);
}

// Main game loop
function update() {
  if (isGameOver) {
    return; // Stop the game loop when it's over
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  drawBackground(); // Draw background first
  handleGravity();
  handleJumping();
  handlePortals();
  createObstacles();
  drawObstacles();
  drawPlayer();
  updateScore();
  checkCollision();

  requestAnimationFrame(update);
}

update();
