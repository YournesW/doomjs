const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 64;
const NUM_RAYS = 120;
const MOVE_SPEED = 2;
const ROTATE_SPEED = 0.05;
const SHOOT_DELAY = 500;
let lastShot = 0;

const levels = [
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 2, 1],
        [1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ]
];
let currentLevel = 0;

const player = { x: 150, y: 150, angle: 0, health: 100 };
const enemies = [{ x: 300, y: 200, health: 50 }];
const wallTexture = new Image(); wallTexture.src = "assets/brick.png";
const monsterTexture = new Image(); monsterTexture.src = "assets/monster1.png";
const gunTexture = new Image(); gunTexture.src = "assets/gun.png";
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

function castRays() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < NUM_RAYS; i++) {
        let rayAngle = player.angle - Math.PI / 4 + (i / NUM_RAYS) * (Math.PI / 2);
        let rayX = player.x, rayY = player.y, hitWall = false, distance = 0;
        while (!hitWall) {
            rayX += Math.cos(rayAngle) * 4;
            rayY += Math.sin(rayAngle) * 4;
            let mapX = Math.floor(rayX / TILE_SIZE), mapY = Math.floor(rayY / TILE_SIZE);
            if (mapX < 0 || mapY < 0 || mapX >= levels[currentLevel][0].length || mapY >= levels[currentLevel].length || levels[currentLevel][mapY][mapX] === 1) {
                hitWall = true; distance = Math.sqrt((rayX - player.x) ** 2 + (rayY - player.y) ** 2);
            }
        }
        let wallHeight = Math.min(5000 / (distance * Math.cos(rayAngle - player.angle)), canvas.height);
        ctx.drawImage(wallTexture, i * (canvas.width / NUM_RAYS), (canvas.height - wallHeight) / 2, canvas.width / NUM_RAYS, wallHeight);
    }
}

function drawEnemies() {
    for (let enemy of enemies) {
        let dx = enemy.x - player.x, dy = enemy.y - player.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 700) {
            let size = 12000 / dist;
            ctx.drawImage(monsterTexture, canvas.width / 2 + (dx * 10) - size / 2, canvas.height / 2 - size / 2, size, size);
        }
    }
}

function shoot() {
    if (Date.now() - lastShot > SHOOT_DELAY) {
        lastShot = Date.now();
        enemies.forEach((enemy, index) => {
            if (Math.abs(enemy.x - player.x) < 100 && Math.abs(enemy.y - player.y) < 100) {
                enemy.health -= 25;
                if (enemy.health <= 0) enemies.splice(index, 1);
            }
        });
    }
}

window.addEventListener("click", shoot);
function checkLevelExit() {
    let mapX = Math.floor(player.x / TILE_SIZE);
    let mapY = Math.floor(player.y / TILE_SIZE);
    if (levels[currentLevel][mapY][mapX] === 2) {
        currentLevel = (currentLevel + 1) % levels.length;
        player.x = 150; player.y = 150;
    }
}

function gameLoop() {
    updatePlayer();
    castRays();
    drawEnemies();
    checkLevelExit();
    requestAnimationFrame(gameLoop);
}

gameLoop();
