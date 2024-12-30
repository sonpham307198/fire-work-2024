jQuery(document).ready(function () {
    // Tạo container để chứa hiệu ứng pháo hoa
    let fireworkContainer = document.createElement('div');
    fireworkContainer.id = 'firework-container';
    fireworkContainer.style.position = 'fixed';
    fireworkContainer.style.top = '0';
    fireworkContainer.style.left = '0';
    fireworkContainer.style.width = '100vw';
    fireworkContainer.style.height = '100vh';
    fireworkContainer.style.pointerEvents = 'none'; // Cho phép click xuyên qua
    fireworkContainer.style.overflow = 'hidden'; // Giữ pháo hoa trong màn hình
    fireworkContainer.style.zIndex = '999999';
    document.body.appendChild(fireworkContainer);

    // Tạo thẻ canvas cho hiệu ứng pháo hoa
    let canvas = document.createElement('canvas');
    canvas.id = 'firework-canvas';
    canvas.style.position = 'absolute';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // Cho phép click xuyên qua
    fireworkContainer.appendChild(canvas);

    // Hàm khởi tạo hiệu ứng pháo hoa
    function initFireworks(canvasId) {
        let canvas = document.getElementById(canvasId);
        let ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        let colors = ['#ff0044', '#44ff44', '#0044ff', '#ffff44', '#ff44ff', '#44ffff'];

        // Tạo pháo hoa
        function createFirework(x, y) {
            for (let i = 0; i < 100; i++) {
                let angle = Math.random() * 2 * Math.PI;
                let speed = Math.random() * 5 + 2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: Math.random() * 0.03 + 0.02,
                });
            }
        }

        // Vẽ pháo hoa
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = particles.filter(p => p.alpha > 0);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.alpha})`;
                ctx.fill();
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;
            });
            requestAnimationFrame(render);
        }

        // Chuyển đổi màu HEX sang RGB
        function hexToRgb(hex) {
            let bigint = parseInt(hex.replace('#', ''), 16);
            let r = (bigint >> 16) & 255;
            let g = (bigint >> 8) & 255;
            let b = bigint & 255;
            return `${r},${g},${b}`;
        }

        // Xử lý sự kiện click
        canvas.addEventListener('click', (e) => {
            createFirework(e.clientX, e.clientY);
        });

        render();
    }

    // Khởi chạy hiệu ứng
    initFireworks('firework-canvas');
});
