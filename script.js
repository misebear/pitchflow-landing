// ===========================
// PitchFlow 랜딩 페이지 스크립트
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParticles();
    initPitchCanvas();
    initScrollAnimations();
    initScoreCircle();
    initMetricBars();
    initPitchIndicator();
    initNoteAnimation();
});

// 네비게이션 스크롤 효과
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileMenu = document.getElementById('mobileMenu');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// 배경 파티클 효과
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        particle.style.width = (2 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = 0.1 + Math.random() * 0.3;
        container.appendChild(particle);
    }
}

// 피치 시각화 캔버스
function initPitchCanvas() {
    const canvas = document.getElementById('pitchCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
        const w = canvas.width / 2;
        const h = canvas.height / 2;

        ctx.clearRect(0, 0, w, h);

        // 배경 그리드
        ctx.strokeStyle = 'rgba(74, 60, 49, 0.04)';
        ctx.lineWidth = 1;
        for (let y = 0; y < h; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // 피치 파형 그리기
        const colors = [
            { r: 217, g: 138, b: 138, a: 0.5 },
            { r: 194, g: 112, b: 112, a: 0.35 },
            { r: 232, g: 168, b: 124, a: 0.25 }
        ];

        colors.forEach((color, i) => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            ctx.lineWidth = 2;

            for (let x = 0; x < w; x++) {
                const freq = 0.02 + i * 0.005;
                const amp = 15 + i * 8;
                const phase = time * 0.02 + i * 1.5;
                const y = h / 2 + Math.sin(x * freq + phase) * amp
                    + Math.sin(x * freq * 2.3 + phase * 1.5) * (amp * 0.3)
                    + Math.sin(x * freq * 0.7 + phase * 0.8) * (amp * 0.5);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // 글로우 효과
            ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a * 0.3})`;
            ctx.lineWidth = 6;
            ctx.stroke();
        });

        time++;
        requestAnimationFrame(draw);
    }
    draw();
}

// 스크롤 애니메이션
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.feature-card, .coaching-card, .metric, .section-header, .vh-content, .vh-visual, .cta-content'
    );

    elements.forEach(el => el.classList.add('animate-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
}

// 성대 건강 점수 원형 애니메이션
function initScoreCircle() {
    const scoreFill = document.getElementById('scoreFill');
    const scoreValue = document.getElementById('scoreValue');
    if (!scoreFill || !scoreValue) return;

    // SVG 그라디언트 추가
    const svg = scoreFill.closest('svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'scoreGradient');
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#6c5ce7"/>
        <stop offset="50%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#ec4899"/>
    `;
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);

    const targetScore = 92;
    const circumference = 2 * Math.PI * 85; // r=85
    const offset = circumference - (targetScore / 100) * circumference;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scoreFill.style.strokeDashoffset = offset;
                animateCounter(scoreValue, 0, targetScore, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(scoreFill.closest('.health-score-circle'));
}

// 카운터 애니메이션
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(start + (end - start) * eased);
        element.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// 메트릭 바 애니메이션
function initMetricBars() {
    const fills = document.querySelectorAll('.metric-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.5 });

    fills.forEach(fill => {
        const width = fill.style.width;
        fill.dataset.width = width;
        fill.style.width = '0%';
        observer.observe(fill);
    });
}

// 피치 인디케이터 애니메이션
function initPitchIndicator() {
    const indicator = document.getElementById('pitchIndicator');
    if (!indicator) return;

    let position = 50;
    let target = 50;

    function animate() {
        // 랜덤으로 타겟 위치 변경 (45~55% 범위 — 좋은 음정 유지)
        if (Math.random() < 0.05) {
            target = 40 + Math.random() * 20;
        }
        position += (target - position) * 0.08;
        indicator.style.left = position + '%';
        requestAnimationFrame(animate);
    }
    animate();
}

// 노트 표시 애니메이션
function initNoteAnimation() {
    const noteEl = document.getElementById('currentNote');
    if (!noteEl) return;

    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    let currentIndex = 5; // A4에서 시작

    setInterval(() => {
        if (Math.random() < 0.3) {
            currentIndex = Math.max(0, Math.min(notes.length - 1,
                currentIndex + Math.round((Math.random() - 0.5) * 2)
            ));
            noteEl.textContent = notes[currentIndex];
        }
    }, 1500);
}
