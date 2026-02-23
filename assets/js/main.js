/* ═══════════════════════════════════════════════════════════════
   DataFlocks — main.js
   Pure vanilla JS — no frameworks, no CDNs
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility ────────────────────────────────────────────────── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ─── DOM Ready ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollProgress();
    initBackToTop();
    initTypewriter();
    initHeroCanvas();
    initServicesCanvas();
    initServicesTilt();
    initServicesMouseGlow();
    initSwiperCarousel();
    initTimeline();
    initBentoCounters();
    initCtaCanvas();
    initCtaRipple();
});

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════════ */
function initNavbar() {
    const navbar = $('#navbar');
    const hamburger = $('#hamburger');
    const navLinks = $('#nav-links');
    const mobileLinks = $$('.nav-links a');

    // Scroll class
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        updateActiveLink();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    // Close on link click
    mobileLinks.forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // Active link via IntersectionObserver
    const sections = $$('section[id]');
    function updateActiveLink() {
        let current = '';
        sections.forEach(sec => {
            const top = sec.getBoundingClientRect().top;
            if (top <= 120) current = sec.id;
        });
        $$('.nav-links a[href^="#"]').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
    }
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL PROGRESS
═══════════════════════════════════════════════════════════════ */
function initScrollProgress() {
    const bar = $('#scroll-progress');
    window.addEventListener('scroll', () => {
        const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
        bar.style.width = clamp(pct, 0, 100) + '%';
    }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════════════════════════ */
function initBackToTop() {
    const btn = $('#back-top');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════════════ */
function initTypewriter() {
    const el = $('#typewriter');
    const cursor = $('.cursor');
    if (!el) return;

    const phrases = [
        'Unified Flocks',
        'Actionable Insights',
        'Trusted Decisions',
        'Scalable Pipelines',
        'Strategic Assets',
    ];

    let pi = 0, ci = 0, deleting = false, firstCycle = true;

    function tick() {
        const phrase = phrases[pi];
        if (!deleting) {
            ci++;
            el.textContent = phrase.slice(0, ci);
            if (ci === phrase.length) {
                // Finished typing
                if (firstCycle) {
                    // First phrase: blink cursor then hide it, then start cycling
                    firstCycle = false;
                    if (cursor) cursor.style.animation = 'blink 1s step-end infinite';
                    setTimeout(() => {
                        if (cursor) cursor.style.opacity = '0';
                        deleting = true;
                        setTimeout(tick, 1800);
                    }, 2500);
                    return;
                }
                deleting = true;
                setTimeout(tick, 1800);
                return;
            }
            setTimeout(tick, 75);
        } else {
            ci--;
            el.textContent = phrase.slice(0, ci);
            if (ci === 0) {
                deleting = false;
                pi = (pi + 1) % phrases.length;
                // Show cursor briefly while typing next phrase
                if (cursor) cursor.style.opacity = '1';
                setTimeout(() => {
                    tick();
                    // Hide cursor again after typing completes (handled in typing branch)
                }, 350);
                return;
            }
            setTimeout(tick, 38);
        }
    }

    // Start immediately — show first character right away
    setTimeout(tick, 300);
}

/* ═══════════════════════════════════════════════════════════════
   HERO CANVAS — Particle system
═══════════════════════════════════════════════════════════════ */
function initHeroCanvas() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    class Particle {
        constructor() { this.reset(true); }
        reset(init = false) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + 10;
            this.r = Math.random() * 2 + .5;
            this.vy = -(Math.random() * .6 + .2);
            this.vx = (Math.random() - .5) * .3;
            this.alpha = 0;
            this.maxAlpha = Math.random() * .5 + .1;
            this.life = 0;
            this.maxLife = Math.random() * 300 + 200;
            this.color = Math.random() > .5 ? '124,58,237' : '6,182,212';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            const t = this.life / this.maxLife;
            this.alpha = t < .1 ? t * 10 * this.maxAlpha
                : t > .8 ? (1 - t) * 5 * this.maxAlpha
                    : this.maxAlpha;
            if (this.life >= this.maxLife) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
            ctx.fill();
        }
    }

    // Data flow lines
    class Line {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.len = Math.random() * 60 + 20;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * .5 + .2;
            this.alpha = Math.random() * .12 + .03;
            this.color = Math.random() > .5 ? '124,58,237' : '6,182,212';
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.x < -100 || this.x > W + 100 || this.y < -100 || this.y > H + 100) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + Math.cos(this.angle) * this.len, this.y + Math.sin(this.angle) * this.len);
            ctx.strokeStyle = `rgba(${this.color},${this.alpha})`;
            ctx.lineWidth = .8;
            ctx.stroke();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < 80; i++) particles.push(new Particle());
        for (let i = 0; i < 25; i++) particles.push(new Line());
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); loop(); });
    init();
    loop();
}

/* ═══════════════════════════════════════════════════════════════
   SERVICES CANVAS — Interactive data-flow particles
═══════════════════════════════════════════════════════════════ */
function initServicesCanvas() {
    const canvas = $('#services-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], animId;
    let mouseX = -9999, mouseY = -9999;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    class Node {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - .5) * .4;
            this.vy = (Math.random() - .5) * .4;
            this.r = Math.random() * 3 + 1;
            this.alpha = Math.random() * .4 + .1;
            this.color = Math.random() > .5 ? '124,58,237' : '6,182,212';
        }
        update() {
            // Mouse repulsion
            const dx = this.x - mouseX, dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * .8;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
            this.vx *= .98; this.vy *= .98;
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0) this.x = W;
            if (this.x > W) this.x = 0;
            if (this.y < 0) this.y = H;
            if (this.y > H) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
            ctx.fill();
        }
    }

    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 120) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(124,58,237,${(1 - d / 120) * .12})`;
                    ctx.lineWidth = .8;
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        resize();
        nodes = [];
        for (let i = 0; i < 60; i++) nodes.push(new Node());
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        nodes.forEach(n => { n.update(); n.draw(); });
        animId = requestAnimationFrame(loop);
    }

    const section = $('#services');
    section.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    section.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); loop(); });
    init();
    loop();
}

/* ═══════════════════════════════════════════════════════════════
   SERVICES MOUSE GLOW
═══════════════════════════════════════════════════════════════ */
function initServicesMouseGlow() {
    const section = $('#services');
    const glow = $('#services-glow');
    if (!section || !glow) return;

    section.addEventListener('mousemove', e => {
        const rect = section.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
        glow.style.opacity = '1';
    });
    section.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

/* ═══════════════════════════════════════════════════════════════
   3D CARD TILT
═══════════════════════════════════════════════════════════════ */
function initServicesTilt() {
    $$('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const rx = clamp((e.clientY - cy) / (rect.height / 2) * -6, -6, 6);
            const ry = clamp((e.clientX - cx) / (rect.width / 2) * 6, -6, 6);
            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   INDUSTRIES SWIPER CAROUSEL
   Infinite loop, continuous autoplay, pause on hover,
   multiple cards visible, fully responsive, touch-enabled.
═══════════════════════════════════════════════════════════════ */
function initSwiperCarousel() {
    if (typeof Swiper === 'undefined') {
        console.error('Swiper not loaded');
        return;
    }

    const swiper = new Swiper('.industries-swiper', {
        // Core settings
        loop: true,
        loopAdditionalSlides: 8, // Important: Duplicate enough slides for smooth loop
        speed: 8000, // Slow speed for continuous feel (8 seconds per slide)
        spaceBetween: 24,

        // Continuous autoplay
        autoplay: {
            delay: 1, // Minimal delay between transitions
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false,
            waitForTransition: true
        },

        // Make it feel continuous
        allowTouchMove: true,
        grabCursor: true,

        // Responsive breakpoints
        slidesPerView: 1,
        breakpoints: {
            480: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 24,
            },
            1100: {
                slidesPerView: 4,
                spaceBetween: 28,
            },
        },

        // Prevent edge gaps
        centeredSlides: false,
        watchSlidesProgress: true,

        // Smooth transitions
        effect: 'slide',
        fadeEffect: {
            crossFade: false
        },

        // Performance
        updateOnWindowResize: true,
        resizeObserver: true,

        // Accessibility
        a11y: {
            prevSlideMessage: 'Previous industry',
            nextSlideMessage: 'Next industry',
        },
    });
}

/* ═══════════════════════════════════════════════════════════════
   TIMELINE — Animated connector line-fill on scroll
   Each .timeline-step gets .visible when it enters the viewport.
   CSS uses .visible to grow .tl-line-fill from height:0 to 100%.
═══════════════════════════════════════════════════════════════ */
function initTimeline() {
    const steps = $$('.timeline-step');
    if (!steps.length) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '0px 0px -60px 0px'
    });

    steps.forEach(step => io.observe(step));
}

/* ═══════════════════════════════════════════════════════════════
   BENTO COUNTERS — Animate bento stat numbers 0 → target
   Reads data-count + data-suffix from HTML.
   One-shot: fires once when card is visible, then unobserves.
═══════════════════════════════════════════════════════════════ */
function initBentoCounters() {
    const counters = $$('.bento-stat-num[data-count]');
    if (!counters.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            io.unobserve(el);

            if (reduced) {
                el.textContent = target + suffix;
                return;
            }

            const duration = 1200;
            const start = performance.now();
            function tick(now) {
                const t = Math.min((now - start) / duration, 1);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    counters.forEach(el => io.observe(el));
}


/* ═══════════════════════════════════════════════════════════════
   CTA CANVAS — Diagonal data particles
═══════════════════════════════════════════════════════════════ */
function initCtaCanvas() {
    const canvas = $('#cta-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [], animId;

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    class Pt {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 2 + .5;
            this.speed = Math.random() * .8 + .3;
            this.alpha = Math.random() * .3 + .05;
            this.color = ['124,58,237', '6,182,212', '244,114,182'][Math.floor(Math.random() * 3)];
        }
        update() {
            this.x += this.speed * .7;
            this.y -= this.speed * .5;
            if (this.x > W + 10 || this.y < -10) this.reset();
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        pts = [];
        for (let i = 0; i < 50; i++) pts.push(new Pt());
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); loop(); });
    init();
    loop();
}

/* ═══════════════════════════════════════════════════════════════
   CTA BUTTON RIPPLE
═══════════════════════════════════════════════════════════════ */
function initCtaRipple() {
    const btn = $('#cta-btn');
    if (!btn) return;

    btn.addEventListener('click', e => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,.25);
      border-radius:50%;
      transform:scale(0);
      animation:ripple-anim .6s ease-out forwards;
      pointer-events:none;
    `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });

    // Inject ripple keyframes once
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `@keyframes ripple-anim{to{transform:scale(1);opacity:0}}`;
        document.head.appendChild(style);
    }
}

/* ═══════════════════════════════════════════════════════════════
   TYPING TEXT ANIMATION - Fixed version with stable height
═══════════════════════════════════════════════════════════════ */
function initTypewriter() {
    console.log('Initializing typewriter...');

    const typewriterElement = document.getElementById('typewriter-text');
    const cursorElement = document.querySelector('.typewriter-cursor');
    const wrapper = document.querySelector('.typewriter-wrapper');

    console.log('Typewriter element found:', typewriterElement);

    if (!typewriterElement) {
        console.error('Typewriter element not found!');
        return;
    }

    const phrases = [
        'Unified Flocks',
        'Insights',
        'Decisions',
        'Pipelines'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId = null;

    // Set a minimum height based on the longest phrase
    const longestPhrase = phrases.reduce((a, b) => a.length > b.length ? a : b);

    // Create a hidden span to measure height
    const measureSpan = document.createElement('span');
    measureSpan.style.cssText = `
        position: absolute;
        visibility: hidden;
        height: auto;
        width: auto;
        white-space: nowrap;
        font-size: ${window.getComputedStyle(typewriterElement).fontSize};
        font-weight: ${window.getComputedStyle(typewriterElement).fontWeight};
        line-height: ${window.getComputedStyle(typewriterElement).lineHeight};
    `;
    measureSpan.textContent = longestPhrase;
    document.body.appendChild(measureSpan);

    // Set wrapper min-height to the height of the longest phrase
    const longestHeight = measureSpan.offsetHeight;
    if (wrapper) {
        wrapper.style.minHeight = longestHeight + 'px';
    }

    document.body.removeChild(measureSpan);

    // Clear any existing content
    typewriterElement.textContent = '';

    function type() {
        // Clear any pending timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            // Deleting text
            typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;

            // When deletion is complete
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                timeoutId = setTimeout(type, 500);
                return;
            }
        } else {
            // Typing text
            typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;

            // When typing is complete
            if (charIndex === currentPhrase.length) {
                timeoutId = setTimeout(() => {
                    isDeleting = true;
                    type();
                }, 2000);
                return;
            }
        }

        // Continue typing/deleting
        const speed = isDeleting ? 40 : 100;
        timeoutId = setTimeout(type, speed);
    }

    // Start the animation
    timeoutId = setTimeout(type, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('DOM loaded, starting typewriter');
        initTypewriter();
    });
} else {
    console.log('DOM already loaded, starting typewriter');
    initTypewriter();
}

// Re-calculate on window resize
window.addEventListener('resize', function () {
    // Debounce the resize event
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function () {
        // Restart typewriter to recalculate height
        const wrapper = document.querySelector('.typewriter-wrapper');
        if (wrapper) {
            wrapper.style.minHeight = 'auto';
        }
        initTypewriter();
    }, 250);
});