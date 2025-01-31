const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 64;
const MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

const FOV = Math.PI / 4;
const NUM_RAYS = 120;
const MOVE_SPEED = 2;
const ROTATE_SPEED = 0.05;

let player = {
    x: 150,
    y: 150,
    angle: 0
};

// Load assets
const wallTexture = new Image();
wallTexture.src = "assets/brick.png";

const monsterTexture = new Image();
monsterTexture.src = "assets/monster1.png";

let monster = { x: 300, y: 200 };

let keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// **Movement with Collision**
function updatePlayer() {
    let newX = player.x;
    let newY = player.y;

    if (keys["ArrowUp"]) {
        newX += Math.cos(player.angle) * MOVE_SPEED;
        newY += Math.sin(player.angle) * MOVE_SPEED;
    }
    if (keys["ArrowDown"]) {
        newX -= Math.cos(player.angle) * MOVE_SPEED;
        newY -= Math.sin(player.angle) * MOVE_SPEED;
    }
    if (keys["ArrowLeft"]) player.angle -= ROTATE_SPEED;
    if (keys["ArrowRight"]) player.angle += ROTATE_SPEED;

    let gridX = Math.floor(newX / TILE_SIZE);
    let gridY = Math.floor(newY / TILE_SIZE);

    if (MAP[gridY][gridX] === 0) {
        player.x = newX;
        player.y = newY;
    }
}

// **Raycasting Algorithm**
function castRays() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < NUM_RAYS; i++) {
        let rayAngle = player.angle - FOV / 2 + (i / NUM_RAYS) * FOV;
        let rayX = player.x;
        let rayY = player.y;
        let hitWall = false;
        let distance = 0;

        while (!hitWall) {
            rayX += Math.cos(rayAngle) * 4;
            rayY += Math.sin(rayAngle) * 4;
            let mapX = Math.floor(rayX / TILE_SIZE);
            let mapY = Math.floor(rayY / TILE_SIZE);

            if (mapX < 0 || mapY < 0 || mapX >= MAP[0].length || mapY >= MAP.length || MAP[mapY][mapX] === 1) {
                hitWall = true;
                distance = Math.sqrt((rayX - player.x) ** 2 + (rayY - player.y) ** 2);
            }
        }

        // Fix fisheye effect
        let correctedDistance = distance * Math.cos(rayAngle - player.angle);
        let wallHeight = Math.min(5000 / correctedDistance, canvas.height);

        ctx.drawImage(wallTexture, i * (canvas.width / NUM_RAYS), (canvas.height - wallHeight) / 2, canvas.width / NUM_RAYS, wallHeight);
    }
}

// **Render Monster**
function drawMonster() {
    let dx = monster.x - player.x;
    let dy = monster.y - player.y;
    let monsterDist = Math.sqrt(dx * dx + dy * dy);

    if (monsterDist < 700) {
        let size = 12000 / monsterDist;
        let screenX = canvas.width / 2 + (dx * 10) - size / 2;
        let screenY = canvas.height / 2 - size / 2;

        ctx.drawImage(monsterTexture, screenX, screenY, size, size);
    }
}

// **Game Loop**
function gameLoop() {
    updatePlayer();
    castRays();
    drawMonster();
    requestAnimationFrame(gameLoop);
}

// **Start Game After Textures Load**
wallTexture.onload = () => monsterTexture.onload = () => gameLoop();
