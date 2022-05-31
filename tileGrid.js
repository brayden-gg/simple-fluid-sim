const Boundary = {
    X: "X",
    Y: "Y",
    BOTH: "both",
};

class TileGrid {
    constructor() {
        this.density = fill2d(N + 1, N + 1);
        this.vx = fill2d(N + 1, N + 1, 0);
        this.vy = fill2d(N + 1, N + 1, 0);
    }

    update() {
        this.diffusion(this.density, Boundary.BOTH);
        this.advection(this.density, Boundary.BOTH);

        this.diffusion(this.vx, Boundary.X);
        this.advection(this.vx, Boundary.X);

        this.diffusion(this.vy, Boundary.Y);
        this.advection(this.vy, Boundary.Y);
        this.removeDivergence();
    }

    show() {
        for (let i = 0; i < N + 1; i++) {
            for (let j = 0; j < N + 1; j++) {
                let x = map(i, 0, N + 1, 0, width);
                let y = map(j, 0, N + 1, 0, height);
                noStroke();
                fill(0, this.density[i][j] * 255, 0);
                rect(x, y, width / N, height / N);

                // let cx = x + width / N / 2;
                // let cy = y + height / N / 2;
                // let scl = 0.1;
                // stroke(255, 0, 0, 100);
                // line(cx - this.vx[i][j] * scl, cy - this.vy[i][j] * scl, cx + this.vx[i][j] * scl, cy + this.vy[i][j] * scl);
                // ellipse(cx + this.vx[i][j] * scl, cy + this.vy[i][j] * scl, 5, 5);
            }
        }
    }

    diffusion(param, component) {
        // use gauss-seidel to find next timestep of param
        let updated = fill2d(N + 1, N + 1);
        for (let iteration = 0; iteration < N_ITERS; iteration++) {
            let next = fill2d(N + 1, N + 1);
            for (let i = 1; i < N; i++) {
                for (let j = 1; j < N; j++) {
                    let avg = (updated[i + 1][j] + updated[i][j + 1] + updated[i - 1][j] + updated[i][j - 1]) / 4;
                    next[i][j] = (param[i][j] + K * avg) / (1 + K);
                }
            }
            updated = next;
        }

        copy2d(param, updated);
        this.setBoundary(param, component);
    }

    advection(param, component) {
        let updated = fill2d(N + 1, N + 1);
        for (let i = 1; i < N; i++) {
            for (let j = 1; j < N; j++) {
                let fx = i - this.vx[i][j] * dt;
                let fy = j - this.vy[i][j] * dt;
                let ix = floor(fx);
                let iy = floor(fy);
                let jx = fract(fx);
                let jy = fract(fy);

                let z1 = lerp(param[ix][iy], param[ix + 1][iy], jx);
                let z2 = lerp(param[ix][iy + 1], param[ix + 1][iy + 1], jx);
                updated[i][j] = lerp(z1, z2, jy);
            }
        }
        copy2d(param, updated);
        this.setBoundary(param, component);
    }

    removeDivergence() {
        let divs = fill2d(N + 1, N + 1);
        for (let i = 1; i < N; i++) {
            for (let j = 1; j < N; j++) {
                divs[i][j] = (this.vx[i + 1][j] - this.vx[i - 1][j] + this.vy[i][j - 1] - this.vy[i][j + 1]) / 2;
            }
        }
        this.setBoundary(divs, Boundary.BOTH);

        let p = fill2d(N + 1, N + 1); // calculate potential function
        for (let iteration = 0; iteration < N_ITERS; iteration++) {
            let next = fill2d(N + 1, N + 1);
            for (let i = 1; i < N; i++) {
                for (let j = 1; j < N; j++) {
                    next[i][j] = (p[i - 1][j] + p[i + 1][j] + p[i][j - 1] + p[i][j + 1] - divs[i][j]) / 4;
                }
            }
            this.setBoundary(next, Boundary.BOTH);
            p = next;
        }

        for (let i = 1; i < N; i++) {
            for (let j = 1; j < N; j++) {
                let gradX = (p[i + 1][j] - p[i - 1][j]) / 2;
                let gradY = (p[i][j + 1] - p[i][j - 1]) / 2;
                this.vx[i][j] -= gradX / N;
                this.vy[i][j] -= gradY / N;
            }
        }
        this.setBoundary(this.vx, Boundary.X);
        this.setBoundary(this.vy, Boundary.Y);
    }

    setBoundary(param, component) {
        for (let i = 0; i <= N; i++) {
            if (component == Boundary.X || component == Boundary.BOTH) {
                param[0][i] = 0;
                param[N][i] = 0;
            }

            if (component == Boundary.Y || component == Boundary.BOTH) {
                param[i][0] = 0;
                param[i][N] = 0;
            }
        }
    }
}
