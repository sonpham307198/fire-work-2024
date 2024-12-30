jQuery(document).ready(function () {
    // Thêm canvas vào container
    const container = document.getElementById('fireworks-container');
    const canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    container.appendChild(canvas);

    // Xử lý hiệu ứng pháo hoa
    (function fireworksPlugin(canvas) {
        const ctx = canvas.getContext('2d');
        const fireworks = [];
        const particles = [];
        let hue = 120;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        function r(min, max) {
            return Math.random() * (max - min) + min;
        }

        function w(x1, y1, x2, y2) {
            const dx = x1 - x2;
            const dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function createParticles(x, y) {
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle(x, y));
            }
        }

        function Firework(sx, sy, tx, ty) {
            this.x = sx;
            this.y = sy;
            this.sx = sx;
            this.sy = sy;
            this.tx = tx;
            this.ty = ty;
            this.distanceToTarget = w(sx, sy, tx, ty);
            this.distanceTraveled = 0;
            this.coordinates = Array.from({ length: 3 }, () => [sx, sy]);
            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 2;
            this.acceleration = 1.05;
            this.brightness = r(50, 70);
        }

        Firework.prototype.update = function (index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.acceleration;
            const vx = Math.cos(this.angle) * this.speed;
            const vy = Math.sin(this.angle) * this.speed;

            this.distanceTraveled = w(this.sx, this.sy, this.x + vx, this.y + vy);

            if (this.distanceTraveled >= this.distanceToTarget) {
                createParticles(this.tx, this.ty);
                fireworks.splice(index, 1);
            } else {
                this.x += vx;
                this.y += vy;
            }
        };

        Firework.prototype.draw = function () {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
            ctx.stroke();
        };

        function Particle(x, y) {
            this.x = x;
            this.y = y;
            this.coordinates = Array.from({ length: 5 }, () => [x, y]);
            this.angle = r(0, Math.PI * 2);
            this.speed = r(1, 10);
            this.friction = 0.95;
            this.gravity = 1;
            this.hue = r(hue - 20, hue + 20);
            this.brightness = r(50, 80);
            this.alpha = 1;
            this.decay = r(0.01, 0.03);
        }

        Particle.prototype.update = function (index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);

            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;

            if (this.alpha <= this.decay) {
                particles.splice(index, 1);
            }
        };

        Particle.prototype.draw = function () {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.stroke();
        };

        function loop() {
            requestAnimationFrame(loop);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';

            fireworks.forEach((firework, index) => {
                firework.draw();
                firework.update(index);
            });

            particles.forEach((particle, index) => {
                particle.draw();
                particle.update(index);
            });
        }

        canvas.addEventListener('mousedown', (e) => {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, e.pageX, e.pageY));
        });

        loop();
    })(canvas);
    
    let cssId1 = 'myCss1';
    if (!document.getElementById(cssId1)) {
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        link.id = cssId1;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://sonpham307198.github.io/fire-work-2024/1.css';
        link.media = 'all';
        head.appendChild(link);
    }
});
