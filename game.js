const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load assets
const wallTexture = new Image();
wallTexture.src = "assets/brick.png";

const monsterTexture = new Image();
monsterTexture.src = "assets/monster1.png";

// Player settings
let player = {
    x: 150,
    y: 150,
    angle: 0,
    speed: 2
};

// Map layout (1 = wall, 0 = empty space)
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
];

const tileSize = 64;
const fov = Math.PI / 4;
const numRays = 100;

// Monster position
let monster = {
    x: 300,
    y: 200
};

// Controls
let keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// Game loop
function update() {
    if (keys["ArrowUp"]) {
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) * player.speed;
    }
    if (keys["ArrowDown"]) {
        player.x -= Math.cos(player.angle) * player.speed;
        player.y -= Math.sin(player.angle) * player.speed;
    }
    if (keys["ArrowLeft"]) player.angle -= 0.05;
    if (keys["ArrowRight"]) player.angle += 0.05;
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render walls using raycasting
    for (let i = 0; i < numRays; i++) {
        let rayAngle = player.angle - fov / 2 + (i / numRays) * fov;
        let rayX = player.x;
        let rayY = player.y;

        let hitWall = false;
        while (!hitWall) {
            rayX += Math.cos(rayAngle) * 4;
            rayY += Math.sin(rayAngle) * 4;
            
            let mapX = Math.floor(rayX / tileSize);
            let mapY = Math.floor(rayY / tileSize);
            
            if (mapX < 0 || mapY < 0 || mapX >= map[0].length || mapY >= map.length || map[mapY][mapX] === 1) {
                hitWall = true;
            }
        }

        let distance = Math.sqrt((rayX - player.x) ** 2 + (rayY - player.y) ** 2);
        let wallHeight = Math.min(30000 / distance, canvas.height);
        
        ctx.drawImage(wallTexture, i * (canvas.width / numRays), (canvas.height - wallHeight) / 2, canvas.width / numRays, wallHeight);
    }

    // Draw monster
    let dx = monster.x - player.x;
    let dy = monster.y - player.y;
    let monsterDist = Math.sqrt(dx * dx + dy * dy);
    
    if (monsterDist < 500) {
        let monsterSize = 10000 / monsterDist;
        let monsterX = canvas.width / 2 + (dx * 10) - monsterSize / 2;
        let monsterY = canvas.height / 2 - monsterSize / 2;
        ctx.drawImage(monsterTexture, monsterX, monsterY, monsterSize, monsterSize);
    }
}

// Main loop
function gameLoop() {
    update();
    drawScene();
    requestAnimationFrame(gameLoop);
}

// Start game when textures load
wallTexture.onload = () => {
    monsterTexture.onload = () => {
        gameLoop();
    };
};
