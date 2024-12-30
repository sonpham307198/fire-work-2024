jQuery(document).ready(function () {
    window.requestAnimFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
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
            r /= 255; g /= 255; b /= 255;
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
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        }

        function r(min, max) {
            return Math.random() * (max - min) + min;
        }

        function w(x1, y1, x2, y2) {
            let dx = x1 - x2, dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function Firework(sx, sy, tx, ty) {
            this.x = sx; this.y = sy;
            this.sx = sx; this.sy = sy;
            this.tx = tx; this.ty = ty;
            this.distanceToTarget = w(sx, sy, tx, ty);
            this.distanceTraveled = 0;
            this.coordinates = Array.from({ length: 3 }, () => [sx, sy]);
            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 1.5;
            this.acceleration = 1.03;
            this.brightness = r(60, 70);
            this.targetRadius = 1.5;
        }

        Firework.prototype.update = function (index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.targetRadius < 8 ? this.targetRadius += 0.3 : this.targetRadius = 1;
            this.speed *= this.acceleration;
            let vx = Math.cos(this.angle) * this.speed;
            let vy = Math.sin(this.angle) * this.speed;
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
            ctx.beginPath();
            ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
            ctx.stroke();
        };

        function createParticles(x, y) {
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle(x, y));
            }
        }

        function Particle(x, y) {
            this.x = x; this.y = y;
            this.coordinates = Array.from({ length: 5 }, () => [x, y]);
            this.angle = r(0, Math.PI * 2);
            this.speed = r(1, 10);
            this.friction = 0.93;
            this.gravity = 1;
            this.hue = r(hue - 15, hue + 15);
            this.brightness = r(30, 80);
            this.alpha = 2;
            this.decay = r(0.015, 0.07);
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
            requestAnimFrame(loop);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            for (let i = fireworks.length; i--; ) {
                fireworks[i].draw();
                fireworks[i].update(i);
            }
            for (let i = particles.length; i--; ) {
                particles[i].draw();
                particles[i].update(i);
            }
        }

        let ctx = canvas.getContext('2d');
        let fireworks = [];
        let particles = [];
        let hue = hexToHSL('#ff0000').h;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        loop();

        canvas.addEventListener('mousedown', function (e) {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, e.pageX, e.pageY));
        });
    }

    let canvas = document.createElement('canvas');
    canvas.id = 'fireworks-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    fireworksPlugin(canvas);
});
