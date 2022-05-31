let grid;
const N = 40;
const K = 0.7;
const dt = 1 / 60;
const N_ITERS = 20;
function setup() {
    createCanvas(600, 600);
    grid = new TileGrid();
}

function draw() {
    background(0);

    if (keyIsPressed) {
        let x = Math.round(constrain(map(mouseX, 0, width, 0, N), 1, N - 1));
        let y = Math.round(constrain(map(mouseY, 0, height, 0, N), 1, N - 1));

        grid.density[x][y] += 2;
    }

    grid.update();
    grid.show();
}

function fill2d(rows, cols, val) {
    val = val ?? 0;
    let arr = [];
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(cols).fill(val);
    }
    return arr;
}

function copy2d(target, data) {
    console.assert(target.length == data.length && target[0]?.length && target[0]?.length == data[0]?.length, "dimensions of target and data are equal");
    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[0].length; j++) {
            target[i][j] = data[i][j];
        }
    }
}

function mouseDragged(event) {
    for (let i = 1; i < N; i++) {
        for (let j = 1; j < N; j++) {
            let x = map(i, 0, N + 1, 0, width);
            let y = map(j, 0, N + 1, 0, height);
            if (Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2) < 50) {
                grid.vx[i][j] += event.movementX;
                grid.vy[i][j] += event.movementY;
            }
        }
    }
}
