(function() {
    // Tự động tạo và thêm phần tử <canvas> vào DOM
    var canvas = document.createElement("canvas");
    canvas.id = "fire-work";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "999999";
    canvas.style.pointerEvents = "none"; // Không chặn các tương tác khác trên trang
    document.body.appendChild(canvas);

    // Animation frame polyfill
    window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    }();

    function fireworksPlugin(canvas) {
        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function calculateDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        class Firework {
            constructor(sx, sy, tx, ty, hue) {
                this.x = sx;
                this.y = sy;
                this.sx = sx;
                this.sy = sy;
                this.tx = tx;
                this.ty = ty;
                this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
                this.distanceTraveled = 0;
                this.coordinates = Array.from({ length: 3 }, () => [sx, sy]);
                this.angle = Math.atan2(ty - sy, tx - sx);
                this.speed = 1.5;
                this.acceleration = 1.03;
                this.brightness = random(60, 70);
                this.targetRadius = 1.5;
                this.hue = hue; // Gán màu ngẫu nhiên từ danh sách
            }

            update(index) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);
                this.targetRadius = this.targetRadius < 8 ? this.targetRadius + 0.3 : 1;
                this.speed *= this.acceleration;

                let vx = Math.cos(this.angle) * this.speed;
                let vy = Math.sin(this.angle) * this.speed;
                this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

                if (this.distanceTraveled >= this.distanceToTarget) {
                    createParticles(this.tx, this.ty, this.hue);
                    fireworks.splice(index, 1);
                } else {
                    this.x += vx;
                    this.y += vy;
                }
            }

            draw() {
                context.beginPath();
                context.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                context.lineTo(this.x, this.y);
                context.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
                context.stroke();
                context.beginPath();
                context.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
                context.stroke();
            }
        }

        class Particle {
            constructor(x, y, hue) {
                this.x = x;
                this.y = y;
                this.coordinates = Array.from({ length: 5 }, () => [x, y]);
                this.angle = random(0, Math.PI * 2);
                this.speed = random(1, 10);
                this.friction = 0.93;
                this.gravity = 1;
                this.hue = random(hue - 15, hue + 15);
                this.brightness = random(30, 80);
                this.alpha = 1;
                this.decay = random(0.015, 0.07);
            }

            update(index) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);
                this.speed *= this.friction;
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed + this.gravity;
                this.alpha -= this.decay;

                if (this.alpha <= this.decay) {
                    particles.splice(index, 1);
                }
            }

            draw() {
                context.beginPath();
                context.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                context.lineTo(this.x, this.y);
                context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
                context.stroke();
            }
        }

        function createParticles(x, y, hue) {
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle(x, y, hue));
            }
        }

        function loop() {
            if (!isRunning) return; // Dừng hiệu ứng nếu hết thời gian
            requestAnimFrame(loop);
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.globalCompositeOperation = 'lighter';

            fireworks.forEach((firework, index) => {
                firework.draw();
                firework.update(index);
            });

            particles.forEach((particle, index) => {
                particle.draw();
                particle.update(index);
            });

            if (tick >= timerTotal) {
                let tx = random(0, canvas.width);
                let ty = random(canvas.height * 0.2, canvas.height * 0.8); // Giới hạn chiều cao
                let hue = fireworkHues[Math.floor(Math.random() * fireworkHues.length)]; // Random màu
                fireworks.push(new Firework(canvas.width / 2, canvas.height, tx, ty, hue));
                tick = 0;
            } else {
                tick++;
            }
        }

        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const fireworks = [];
        const particles = [];
        const fireworkHues = [0, 50, 330]; // Đỏ, Vàng ánh kim, Hồng
        let timerTotal = 80;
        let tick = 0;
        let isRunning = true;

        // Tự động dừng pháo hoa sau 30 giây
        setTimeout(() => {
            isRunning = false;
        }, 30000);

        canvas.addEventListener('mousedown', (e) => {
            if (!isRunning) return;
            let tx = e.clientX;
            let ty = e.clientY;
            let hue = fireworkHues[Math.floor(Math.random() * fireworkHues.length)];
            fireworks.push(new Firework(canvas.width / 2, canvas.height, tx, ty, hue));
        });

        loop();
    }

    fireworksPlugin(canvas);
})();
