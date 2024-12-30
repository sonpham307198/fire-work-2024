// File: fireworks.js

(function() {
    function fireworksPlugin(canvas) {
        // Utility functions
        function hexToHSL(hex) {
            hex = hex.replace(/^#/, '');
            let bigint = parseInt(hex, 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            r /= 255;
            g /= 255;
            b /= 255;
            let max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
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
            const dx = x2 - x1;
            const dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        }

        class Firework {
            constructor(startX, startY, targetX, targetY) {
                this.x = startX;
                this.y = startY;
                this.sx = startX;
                this.sy = startY;
                this.tx = targetX;
                this.ty = targetY;
                this.distanceToTarget = calculateDistance(startX, startY, targetX, targetY);
                this.distanceTraveled = 0;
                this.coordinates = Array(3).fill([this.x, this.y]);
                this.angle = Math.atan2(targetY - startY, targetX - startX);
                this.speed = 1.5;
                this.acceleration = 1.03;
                this.brightness = random(60, 70);
                this.targetRadius = 1.5;
            }

            update(index, fireworks, particles) {
                this.coordinates.pop();
                this.coordinates.unshift([this.x, this.y]);

                if (this.targetRadius < 8) {
                    this.targetRadius += 0.3;
                } else {
                    this.targetRadius = 1;
                }

                this.speed *= this.acceleration;
                const vx = Math.cos(this.angle) * this.speed;
                const vy = Math.sin(this.angle) * this.speed;

                this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

                if (this.distanceTraveled >= this.distanceToTarget) {
                    createParticles(this.tx, this.ty, particles);
                    fireworks.splice(index, 1);
                } else {
                    this.x += vx;
                    this.y += vy;
                }
            }

            draw(ctx, hue) {
                ctx.beginPath();
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.coordinates = Array(5).fill([this.x, this.y]);
                this.angle = random(0, Math.PI * 2);
                this.speed = random(1, 10);
                this.friction = 0.93;
                this.gravity = 1;
                this.hue = random(hue - 15, hue + 15);
                this.brightness = random(50, 80);
                this.alpha = 1;
                this.decay = random(0.015, 0.03);
            }

            update(index, particles) {
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

            draw(ctx) {
                ctx.beginPath();
                ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
                ctx.stroke();
            }
        }

        function createParticles(x, y, particles) {
            const particleCount = 100;
            while (particleCount--) {
                particles.push(new Particle(x, y));
            }
        }

        function loop() {
            requestAnimationFrame(loop);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'lighter';

            let i = fireworks.length;
            while (i--) {
                fireworks[i].draw(ctx, hue);
                fireworks[i].update(i, fireworks, particles);
            }

            let j = particles.length;
            while (j--) {
                particles[j].draw(ctx);
                particles[j].update(j, particles);
            }

            if (timerTick >= timerTotal) {
                fireworks.push(new Firework(canvas.width / 2, canvas.height, random(0, canvas.width), random(0, canvas.height / 2)));
                timerTick = 0;
            } else {
                timerTick++;
            }
        }

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const fireworks = [];
        const particles = [];
        let hue = 120;
        let timerTick = 0;
        let timerTotal = 80;

        canvas.addEventListener('mousedown', function(e) {
            fireworks.push(new Firework(canvas.width / 2, canvas.height, e.clientX, e.clientY));
        });

        loop();
    }

    window.initFireworks = function(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            fireworksPlugin(canvas);
        }
    };
})();
