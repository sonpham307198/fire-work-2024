// Tự động chèn CSS vào <head>
(function() {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://sonpham307198.github.io/fire-work-2024/firework.css"; // Đường dẫn tới file CSS
    document.head.appendChild(link);
})();

// Hiệu ứng pháo hoa
(function() {
    // Tự động tạo và thêm phần tử <canvas> vào DOM
    var canvas = document.createElement("canvas");
    canvas.id = "fire-work";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "99";
    canvas.style.pointerEvents = "none"; // Không chặn các tương tác khác trên trang
    document.body.appendChild(canvas);

    // Animation frame polyfill
    window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    }();

    function fireworksPlugin(canvas) {
        function hexToHSL(hex) {
            hex = hex.replace(/^#/, '');
            let bigint = parseInt(hex, 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function calculateDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        class Firework {
            constructor(sx, sy, tx, ty) {
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
                    createParticles(this.tx, this.ty);
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
                context.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
                context.stroke();
                context.beginPath();
                context.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
                context.stroke();
            }
        }

        class Particle {
            constructor(x, y) {
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

        function createParticles(x, y) {
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle(x, y));
            }
        }

        function loop() {
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
                fireworks.push(new Firework(canvas.width / 2, canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
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
        // Danh sách các màu HUE
        const fireworkHues = [0, 50, 330]; // Đỏ, Vàng ánh kim, Hồng
        let hue = fireworkHues[Math.floor(Math.random() * fireworkHues.length)];
        let timerTotal = 80;
        let tick = 0;

        canvas.addEventListener('mousedown', (e) => {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, e.clientX, e.clientY));
        });

        loop();
    }

    fireworksPlugin(canvas);
})();
