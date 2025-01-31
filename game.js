// Enhanced Doom-like Game with Proper Collision, AI Fixes, and 3D Rendering

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
    { x: 300, y: 200, health: 50, speed: ENEMY_SPEED, angle: 0 }
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

function isWall(x, y) {
    return levels[currentLevel][Math.floor(y / TILE_SIZE)][Math.floor(x / TILE_SIZE)] !== 0;
}

function updatePlayer() {
    let newX = player.x, newY = player.y;
    if (keys["ArrowUp"]) { newX += Math.cos(player.angle) * MOVE_SPEED; newY += Math.sin(player.angle) * MOVE_SPEED; }
    if (keys["ArrowDown"]) { newX -= Math.cos(player.angle) * MOVE_SPEED; newY -= Math.sin(player.angle) * MOVE_SPEED; }
    if (!isWall(newX, player.y)) player.x = newX;
    if (!isWall(player.x, newY)) player.y = newY;
    if (keys["ArrowLeft"]) player.angle -= ROTATE_SPEED;
    if (keys["ArrowRight"]) player.angle += ROTATE_SPEED;
}

function moveEnemies() {
    for (let enemy of enemies) {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        enemy.angle = Math.atan2(dy, dx);
        if (dist > 20) {
            let newX = enemy.x + Math.cos(enemy.angle) * enemy.speed;
            let newY = enemy.y + Math.sin(enemy.angle) * enemy.speed;
            if (!isWall(newX, newY)) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    }
}

function castRays() {
    for (let i = 0; i < NUM_RAYS; i++) {
        let rayAngle = player.angle - (Math.PI / 6) + (i * (Math.PI / 3) / NUM_RAYS);
        let x = player.x, y = player.y;
        while (!isWall(x, y)) {
            x += Math.cos(rayAngle);
            y += Math.sin(rayAngle);
        }
        let dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - (dist / 500)})`;
        ctx.fillRect(i * (canvas.width / NUM_RAYS), canvas.height / 2 - (500 / dist), canvas.width / NUM_RAYS, (1000 / dist));
    }
}

function shoot() {
    if (ammo > 0 && Date.now() - lastShot > SHOOT_DELAY) {
        lastShot = Date.now();
        ammo--;
        enemies.forEach((enemy, index) => {
            let dx = enemy.x - player.x;
            let dy = enemy.y - player.y;
            let angleToEnemy = Math.atan2(dy, dx);
            if (Math.abs(angleToEnemy - player.angle) < 0.3) {
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    castRays();
    requestAnimationFrame(gameLoop);
}

gameLoop();
