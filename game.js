const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game settings
const gravity = 0.8;
const jumpPower = -15;
let gameSpeed = 6;

// Background settings
let backgroundX = 0;
let backgroundSpeed = 2;

// Player settings
let player = {
  x: 100,
  y: canvas.height - 150,
  width: 50,
  height: 50,
  velocityY: 0,
  isJumping: false,
  isFalling: false,
  rotation: 0,
  grounded: true,
};

// Ground settings
let groundHeight = 50;
let groundY = canvas.height - groundHeight;

// Obstacles (spikes)
let spikes = [];

// Portals
let portals = [
  { x: canvas.width / 2 + 200, y: canvas.height - 100, width: 40, height: 40, mode: 'ship' }
];

// Game state
let isGameOver = false;
let score = 0;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !player.isJumping) {
    player.isJumping = true;
    player.velocityY = jumpPower;
    player.grounded = false;
  }
  if (e.code === "KeyR" && isGameOver) {
    resetGame();  // Restart the game when "R" is pressed
  }
});

document.addEventListener("mousedown", () => {
  if (!player.isJumping) {
    player.isJumping = true;
    player.velocityY = jumpPower;
    player.grounded = false;
  }
});

document.addEventListener("mouseup", () => {});

function drawBackground() {
  ctx.fillStyle = "#222";
  ctx.fillRect(backgroundX, 0, canvas.width, canvas.height);

  backgroundX -= backgroundSpeed;
  if (backgroundX <= -canvas.width) {
    backgroundX = 0;
  }
}

function drawGround() {
  ctx.fillStyle = "#ff4f4f"; // Red ground
  ctx.fillRect(0, groundY, canvas.width, groundHeight);
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.rotate(player.rotation * Math.PI / 180);
  ctx.fillStyle = "#ff4f4f";
  ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
  ctx.restore();
}

function handleGravity() {
  if (player.isJumping || player.isFalling) {
    player.velocityY += gravity;
  }
  player.y += player.velocityY;

  if (player.y >= groundY - player.height) {
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    player.isFalling = false;
    player.rotation = 0;
    player.grounded = true;
  }
}

function createSpikes() {
  if (Math.random() < 0.02) {
    let spikeHeight = Math.random() * 100 + 50;
    let spikeWidth = 50;
    spikes.push({
      x: canvas.width,
      y: groundY - spikeHeight,
      width: spikeWidth,
      height: spikeHeight
    });
  }

  spikes.forEach((spike) => {
    spike.x -= gameSpeed;
    if (spike.x + spike.width < 0) {
      spikes.shift();
    }
  });
}

function drawSpikes() {
  spikes.forEach((spike) => {
    ctx.fillStyle = "#ff3d3d";
    ctx.fillRect(spike.x, spike.y, spike.width, spike.height);
  });
}

function checkCollision() {
  spikes.forEach((spike) => {
    if (player.x + player.width > spike.x && player.x < spike.x + spike.width &&
        player.y + player.height > spike.y) {
      gameOver();
    }
  });
}

function handlePortals() {
  portals.forEach(portal => {
    if (player.x + player.width > portal.x && player.x < portal.x + portal.width &&
        player.y + player.height > portal.y && player.y < portal.y + portal.height) {
      player.x = portal.x + portal.width + 20;
    }
  });
}

function updateScore() {
  score++;
  document.getElementById("score").innerText = "Score: " + score;
}

function resetGame() {
  player.y = canvas.height - 150;
  player.velocityY = 0;
  score = 0;
  gameSpeed = 6;
  spikes = [];
  isGameOver = false;
}

function gameOver() {
  isGameOver = true;
  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 150, canvas.height / 2);
  ctx.font = "30px Arial";
  ctx.fillText("Press R to Restart", canvas.width / 2 - 100, canvas.height / 2 + 50);
}

function update() {
  if (isGameOver) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawGround();
  handleGravity();
  createSpikes();
  drawSpikes();
  drawPlayer();
  handlePortals();
  updateScore();
  checkCollision();

  requestAnimationFrame(update);
}

update();
