// Tự động nhúng file CSS khi chạy file JS
(function() {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "https://sonpham307198.github.io/fire-work-2024/firework.css"; // Thay bằng đường dẫn tới file CSS của bạn
    document.head.appendChild(link);
})();

document.addEventListener("DOMContentLoaded", function () {
    function fireworksPlugin(n) {
        function hexToHSL(hex) {
            hex = hex.replace(/^#/, '');
            let bigint = parseInt(hex, 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            r /= 255, g /= 255, b /= 255;
            let max = Math.max(r, g, b),
                min = Math.min(r, g, b);
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

        function r(n, t) {
            return Math.random() * (t - n) + n;
        }

        function w(n, t, i, r) {
            var u = n - i,
                f = t - r;
            return Math.sqrt(Math.pow(u, 2) + Math.pow(f, 2));
        }

        function h(n, t, i, u) {
            this.x = n;
            this.y = t;
            this.sx = n;
            this.sy = t;
            this.tx = i;
            this.ty = u;
            this.distanceToTarget = w(n, t, i, u);
            this.distanceTraveled = 0;
            this.coordinates = [];
            this.coordinateCount = 3;
            while (this.coordinateCount--) this.coordinates.push([this.x, this.y]);
            this.angle = Math.atan2(u - t, i - n);
            this.speed = 1.5;
            this.acceleration = 1.03;
            this.brightness = r(60, 70);
            this.targetRadius = 1.5;
        }

        function a(n, t) {
            this.x = n;
            this.y = t;
            this.coordinates = [];
            this.coordinateCount = 5;
            while (this.coordinateCount--) this.coordinates.push([this.x, this.y]);
            this.angle = r(0, Math.PI * 2);
            this.speed = r(1, 10);
            this.friction = 0.93;
            this.gravity = 1;
            this.hue = r(v - 15);
            this.brightness = r(30, 80);
            this.alpha = 2;
            this.decay = r(0.015, 0.07);
        }

        function g(n, t) {
            for (var i = 80; i--;) o.push(new a(n, t));
        }

        function b() {
            var n, i;
            requestAnimFrame(b);
            t.globalCompositeOperation = "destination-out";
            t.fillStyle = "rgba(0, 0, 0, 0.5)";
            t.fillRect(0, 0, f, e);
            t.globalCompositeOperation = "lighter";
            for (n = u.length; n--;) u[n].draw(), u[n].update(n);
            for (i = o.length; i--;) o[i].draw(), o[i].update(i);
            if (l >= d) {
                if (!s) {
                    u.push(new h(f / 2, e, r(0, f), r(0, e / 2)));
                    l = 0;
                }
            } else l++;
            if (c >= k) {
                if (s) {
                    u.push(new h(f / 2, e, y, p));
                    c = 0;
                }
            } else c++;
        }

        var i = n, t = i.getContext("2d"), f = window.innerWidth, e = window.innerHeight, u = [], o = [], v = hexToHSL("#ff0000").h, k = 10, c = 0, d = 15, l = 0, s = false, y, p;

        if (matchMedia('only screen and (max-width: 550px)').matches) {
            d = 50;
        }

        i.width = f;
        i.height = e;

        h.prototype.update = function (n) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.targetRadius < 8 ? this.targetRadius += 0.3 : this.targetRadius = 1;
            this.speed *= this.acceleration;
            var t = Math.cos(this.angle) * this.speed,
                i = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = w(this.sx, this.sy, this.x + t, this.y + i);
            if (this.distanceTraveled >= this.distanceToTarget) {
                g(this.tx, this.ty);
                u.splice(n, 1);
            } else {
                this.x += t;
                this.y += i;
            }
        };

        h.prototype.draw = function () {
            t.beginPath();
            t.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            t.lineTo(this.x, this.y);
            t.strokeStyle = "hsl(" + v + ", 100%, " + this.brightness + "%)";
            t.stroke();
            t.beginPath();
            t.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
            t.stroke();
        };

        a.prototype.update = function (n) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            if (this.alpha <= this.decay) o.splice(n, 1);
        };

        a.prototype.draw = function () {
            t.beginPath();
            t.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            t.lineTo(this.x, this.y);
            t.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
            t.stroke();
        };

        i.addEventListener("mousemove", function (n) {
            y = n.pageX - i.offsetLeft;
            p = n.pageY - i.offsetTop;
        });

        i.addEventListener("mousedown", function (n) {
            n.preventDefault();
            s = true;
        });

        i.addEventListener("mouseup", function (n) {
            n.preventDefault();
            s = false;
        });

        window.requestAnimFrame = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (n) {
                window.setTimeout(n, 1000 / 60);
            };
        }();

        window.onload = b;
    }

    const canvas = document.getElementById("fire-work");
    fireworksPlugin(canvas);
});
