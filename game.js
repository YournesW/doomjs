// Enhanced Doom-like Game with Additional Features

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 64;
const NUM_RAYS = 160;
const MOVE_SPEED = 3;
const ROTATE_SPEED = 0.04;
const SHOOT_DELAY = 400;
const ENEMY_SPEED = 1.5;
const PICKUP_RADIUS = 50;
let lastShot = 0;
let score = 0;
let currentLevel = 0;
let ammo = 10;
let health = 100;

const levels = [
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 3, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

const player = { x: 150, y: 150, angle: 0, health: 100 };
const enemies = [
    { x: 300, y: 200, health: 50, speed: ENEMY_SPEED },
    { x: 500, y: 400, health: 50, speed: ENEMY_SPEED }
];
const pickups = [
    { x: 350, y: 250, type: 'ammo' },
    { x: 600, y: 350, type: 'health' }
];

const wallTexture = new Image(); wallTexture.src = "assets/brick.png";
const monsterTexture = new Image(); monsterTexture.src = "assets/monster1.png";
const gunTexture = new Image(); gunTexture.src = "assets/gun.png";
const ammoTexture = new Image(); ammoTexture.src = "assets/ammo.png";
const healthTexture = new Image(); healthTexture.src = "assets/health.png";

let keys = {};

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

function updatePlayer() {
    let newX = player.x, newY = player.y;
    if (keys["ArrowUp"]) { newX += Math.cos(player.angle) * MOVE_SPEED; newY += Math.sin(player.angle) * MOVE_SPEED; }
    if (keys["ArrowDown"]) { newX -= Math.cos(player.angle) * MOVE_SPEED; newY -= Math.sin(player.angle) * MOVE_SPEED; }
    if (keys["ArrowLeft"]) player.angle -= ROTATE_SPEED;
    if (keys["ArrowRight"]) player.angle += ROTATE_SPEED;
    if (levels[currentLevel][Math.floor(newY / TILE_SIZE)][Math.floor(newX / TILE_SIZE)] === 0) {
        player.x = newX;
        player.y = newY;
    }
}

function moveEnemies() {
    for (let enemy of enemies) {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 20) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
    }
}

function handlePickups() {
    for (let i = pickups.length - 1; i >= 0; i--) {
        let pickup = pickups[i];
        let dx = player.x - pickup.x;
        let dy = player.y - pickup.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PICKUP_RADIUS) {
            if (pickup.type === 'ammo') ammo += 5;
            if (pickup.type === 'health' && health < 100) health += 25;
            pickups.splice(i, 1);
        }
    }
}

function drawPickups() {
    for (let pickup of pickups) {
        let img = pickup.type === 'ammo' ? ammoTexture : healthTexture;
        ctx.drawImage(img, pickup.x - 16, pickup.y - 16, 32, 32);
    }
}

function shoot() {
    if (ammo > 0 && Date.now() - lastShot > SHOOT_DELAY) {
        lastShot = Date.now();
        ammo--;
        enemies.forEach((enemy, index) => {
            if (Math.abs(enemy.x - player.x) < 100 && Math.abs(enemy.y - player.y) < 100) {
                enemy.health -= 25;
                if (enemy.health <= 0) {
                    enemies.splice(index, 1);
                    score += 10;
                }
            }
        });
    }
}

window.addEventListener("click", shoot);

function gameLoop() {
    updatePlayer();
    moveEnemies();
    handlePickups();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPickups();
    requestAnimationFrame(gameLoop);
}

gameLoop();
