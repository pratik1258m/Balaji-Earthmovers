/**
 * Balaji Earthmovers — Core Application Logic (Mumbai excavation contractor site)
 *
 * What this file does:
 * - Live Mumbai clock (IST, UTC+5:30) in the header
 * - Header scroll transition + IntersectionObserver entrance reveals
 * - Animated number counters for hero / crew / featured-project stats
 * - Scroll-spy navigation and smooth in-page anchor scrolling
 * - "The Craft" 3-phase sticky slider (buttons, scroll progress, keyboard)
 * - Owned-plant fleet detail modal: click AND keyboard (Enter / Space) activation
 *   on each .fleet-card, close via backdrop, close button or Escape
 * - Track-record ledger filter (completed vs ongoing project rows)
 * - FAQ <details> accordion — one open at a time, native without JS
 * - Estimate form: light validation + toast feedback (no invented promises)
 * - Mobile drawer with aria-expanded sync
 * - Footer copyright year
 *
 * Every company figure shown here (unit counts, models, volumes, durations,
 * crew sizes, contact details) comes from the firm's own brochure — nothing is
 * invented. Machine performance specs are deliberately omitted because the
 * brochure does not state them.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initHeaderScroll();
    initScrollReveal();
    initAnimatedCounters();
    initNavigation();
    initCraftSlider();
    initBeaconStow();
    initFleetModals();
    initGalleryLightbox();
    initProjectTabs();
    initFaq();
    initEstimateForm();
    initMobileMenu();
    initFooterYear();
    initVideoReel();
});

/* ==========================================================================
   1. Live Mumbai Time Clock (IST UTC+5:30)
   ========================================================================== */
function initLiveClock() {
    const clockEl = document.getElementById('clockDisplay');
    if (!clockEl) return;

    function updateClock() {
        try {
            const now = new Date();
            const timeFormatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            clockEl.textContent = `${timeFormatter.format(now)} IST`;
        } catch (e) {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const istDate = new Date(utc + (3600000 * 5.5));
            const pad = (n) => String(n).padStart(2, '0');
            clockEl.textContent = `${pad(istDate.getHours())}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())} IST`;
        }
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. Header Scroll Reactive State
   ========================================================================== */
function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    let lastScrollY = window.scrollY;

    function onScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollY = window.scrollY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ==========================================================================
   3. Scroll-Driven Entrance Reveals (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

    if (!revealElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Apply slight stagger if multiple elements appear together
                setTimeout(() => {
                    entry.target.classList.add('is-revealed');
                }, 60);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   4. Dynamic Animated Number Counters on Scroll
   ========================================================================== */
function initAnimatedCounters() {
    const counterElements = document.querySelectorAll('.count-up');
    if (!counterElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function formatNumber(val, format) {
        if (format === 'indian') {
            return Math.floor(val).toLocaleString('en-IN');
        }
        return val;
    }

    function startCountUp(el) {
        if (el.dataset.counted === 'true') return;
        el.dataset.counted = 'true';

        const target = parseFloat(el.getAttribute('data-target')) || 0;
        const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') ?? '';
        const format = el.getAttribute('data-format') || '';

        if (prefersReducedMotion) {
            const finalVal = decimals > 0 ? target.toFixed(decimals) : (format === 'indian' ? formatNumber(target, 'indian') : target);
            el.textContent = `${finalVal}${suffix}`;
            return;
        }

        const duration = 1600; // 1.6 seconds smooth count
        const startTime = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentVal = (target * easedProgress);

            let displayVal;
            if (decimals > 0) {
                displayVal = currentVal.toFixed(decimals);
            } else if (format === 'indian') {
                displayVal = formatNumber(currentVal, 'indian');
            } else {
                displayVal = Math.floor(currentVal);
            }

            el.textContent = `${displayVal}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                const finalVal = decimals > 0 ? target.toFixed(decimals) : (format === 'indian' ? formatNumber(target, 'indian') : target);
                el.textContent = `${finalVal}${suffix}`;
            }
        }

        requestAnimationFrame(updateCount);
    }

    // Set initial text to 0
    counterElements.forEach(el => {
        el.textContent = `0${el.getAttribute('data-suffix') || ''}`;
    });

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCountUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '30px 0px 30px 0px' });

    counterElements.forEach(el => {
        counterObserver.observe(el);

        // Immediate check: elements already visible in viewport trigger smoothly
        const rect = el.getBoundingClientRect();
        const inViewport = rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
        if (inViewport) {
            setTimeout(() => {
                startCountUp(el);
                counterObserver.unobserve(el);
            }, 500);
        }
    });
}

/* ==========================================================================
   5. Shared Mobile Drawer State (used by nav + menu toggle)
   ========================================================================== */
function setMobileDrawer(open) {
    const drawer = document.getElementById('mobileNavDrawer');
    const btn = document.getElementById('mobileMenuBtn');
    if (!drawer) return;

    drawer.classList.toggle('open', Boolean(open));
    if (btn) btn.setAttribute('aria-expanded', String(Boolean(open)));
}

/* ==========================================================================
   6. Navigation & Scroll Spy
   ========================================================================== */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
                setMobileDrawer(false);
            }
        });
    });
}

/* ==========================================================================
   7. The Craft: 3-Phase Interactive Slider
   ========================================================================== */
function initCraftSlider() {
    const craftSec = document.getElementById('craft');
    const panels = document.querySelectorAll('.craft-panel');
    const phaseBtns = document.querySelectorAll('.phase-btn');
    const prevBtn = document.getElementById('craftPrevBtn');
    const nextBtn = document.getElementById('craftNextBtn');
    const progressFill = document.getElementById('craftProgressFill');
    if (!craftSec || panels.length === 0) return;

    const totalPhases = panels.length;
    let currentPhase = 0;
    let animatingUntil = 0;
    let wheelAccum = 0;
    let wheelIdleTimer = null;

    /* One wheel gesture moves exactly one step. Deltas accumulate until a step
       fires, then the accumulator is dropped and stays dropped for the whole
       flight, so trackpad momentum cannot chain into a second jump. */
    const WHEEL_STEP = 55;
    const WHEEL_IDLE = 170;
    const STEP_FLIGHT = 900;

    function runway() {
        return craftSec.offsetHeight - window.innerHeight;
    }

    /* 0..1 through the pinned band, or null when the sticky viewport does not
       cover the window. The 1px slack matters: fractional device-pixel scrolling
       leaves rect.top a hair above 0 at the start of the band, and a strict
       check silently disengages the snapping there. The reduced-motion layout
       un-pins the section, so this returns null and nothing is hijacked. */
    function bandProgress() {
        const r = runway();
        if (r <= 50) return null;
        const rect = craftSec.getBoundingClientRect();
        if (rect.top > 1 || rect.bottom < window.innerHeight - 1) return null;
        return Math.min(1, Math.max(0, -rect.top / r));
    }

    function updateProgress(progress) {
        if (!progressFill) return;
        const pct = Math.max(15, Math.min(100, progress * 85 + 15));
        progressFill.style.width = `${pct}%`;
    }

    function setActivePhase(index) {
        if (index < 0) index = 0;
        if (index >= totalPhases) index = totalPhases - 1;
        currentPhase = index;

        panels.forEach((p, idx) => {
            const isActive = idx === currentPhase;
            p.classList.toggle('active', isActive);
            p.setAttribute('aria-hidden', String(!isActive));
        });

        phaseBtns.forEach((btn, idx) => {
            const isActive = idx === currentPhase;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', String(isActive));
        });

        if (prevBtn) {
            prevBtn.style.opacity = currentPhase === 0 ? '0.35' : '1';
            prevBtn.style.cursor = currentPhase === 0 ? 'default' : 'pointer';
        }
        if (nextBtn) {
            nextBtn.style.opacity = currentPhase === totalPhases - 1 ? '0.35' : '1';
            nextBtn.style.cursor = currentPhase === totalPhases - 1 ? 'default' : 'pointer';
        }
    }

    function phaseTop(index) {
        const rect = craftSec.getBoundingClientRect();
        const fraction = totalPhases > 1 ? index / (totalPhases - 1) : 0;
        return rect.top + window.pageYOffset + fraction * runway();
    }

    function goToPhase(index) {
        if (index < 0) index = 0;
        if (index >= totalPhases) index = totalPhases - 1;

        setActivePhase(index);
        wheelAccum = 0;

        if (runway() <= 50) {
            updateProgress(totalPhases > 1 ? index / (totalPhases - 1) : 0);
            return;
        }

        animatingUntil = Date.now() + STEP_FLIGHT;
        window.scrollTo({ top: phaseTop(index), behavior: 'smooth' });
    }

    /* Nearest-boundary phase for the current scroll position. Skipped while a
       programmatic flight is in progress so the panel does not flicker back
       halfway through a step. */
    function syncPhase() {
        const r = runway();
        if (r <= 50) return;
        const scrolled = -craftSec.getBoundingClientRect().top;
        if (scrolled < 0) {
            if (currentPhase !== 0) setActivePhase(0);
            return;
        }
        if (scrolled > r) {
            if (currentPhase !== totalPhases - 1) setActivePhase(totalPhases - 1);
            return;
        }
        if (Date.now() < animatingUntil) return;

        const targetPhase = Math.round(scrolled / r * (totalPhases - 1));
        if (targetPhase !== currentPhase) setActivePhase(targetPhase);
    }

    // Scroll listener linking sticky runway progress to phases
    function handleScroll() {
        const r = runway();
        if (r <= 50) return;

        // The bar mirrors real scroll position, even mid-flight.
        const scrolled = -craftSec.getBoundingClientRect().top;
        updateProgress(Math.min(1, Math.max(0, scrolled / r)));
        syncPhase();
    }

    function handleWheel(e) {
        if (e.ctrlKey || e.deltaY === 0) return;

        if (bandProgress() === null) return;

        // Still flying between boundaries: swallow the rest of the gesture.
        if (Date.now() < animatingUntil) {
            e.preventDefault();
            wheelAccum = 0;
            return;
        }

        // Re-derive from the real position: a scrollbar drag or a resize during
        // the flight can leave currentPhase behind the page.
        syncPhase();

        // At an edge and moving outward the user is leaving the section.
        // Never trap them — let the page carry that scroll.
        const exiting = (e.deltaY < 0 && currentPhase === 0)
            || (e.deltaY > 0 && currentPhase === totalPhases - 1);
        if (exiting) {
            wheelAccum = 0;
            return;
        }

        if (Math.sign(e.deltaY) !== Math.sign(wheelAccum)) wheelAccum = 0;
        wheelAccum += e.deltaY;

        clearTimeout(wheelIdleTimer);
        wheelIdleTimer = setTimeout(() => { wheelAccum = 0; }, WHEEL_IDLE);

        e.preventDefault();
        if (Math.abs(wheelAccum) < WHEEL_STEP) return;

        const direction = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0;
        goToPhase(currentPhase + direction);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Direct button controls — synchronized with scroll position
    phaseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const phaseIdx = parseInt(btn.getAttribute('data-phase'), 10);
            goToPhase(phaseIdx);
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPhase > 0) {
                goToPhase(currentPhase - 1);
            } else {
                goToPhase(totalPhases - 1);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPhase < totalPhases - 1) {
                goToPhase(currentPhase + 1);
            } else {
                goToPhase(0);
            }
        });
    }

    // Touch swipe gesture support for mobile/tablets
    let touchStartX = 0;
    let touchEndX = 0;

    craftSec.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    craftSec.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
            if (diffX < 0) {
                goToPhase((currentPhase + 1) % totalPhases);
            } else {
                goToPhase(currentPhase > 0 ? currentPhase - 1 : totalPhases - 1);
            }
        }
    }, { passive: true });

    // Keyboard Left/Right navigation only when section is in viewport
    window.addEventListener('keydown', (e) => {
        const rect = craftSec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToPhase((currentPhase + 1) % totalPhases);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPhase(currentPhase > 0 ? currentPhase - 1 : totalPhases - 1);
            }
        }
    });

    // Initialize first phase and initial check
    setActivePhase(0);
    handleScroll();
}

/* ==========================================================================
   7b. Call Beacon — stands down while the pinned craft band owns the corner
   ========================================================================== */
function initBeaconStow() {
    const beacon = document.getElementById('floatingContactBeacon');
    const craft = document.getElementById('craft');
    if (!beacon || !craft) return;

    function sync() {
        const controls = craft.querySelector('.craft-controls');
        // If craft controls (PREV/NEXT) are active, stow the floating beacon
        // while the craft section occupies the viewport so it never collides
        if (controls && getComputedStyle(controls).display !== 'none') {
            const rect = craft.getBoundingClientRect();
            const overlapsCraft = rect.top <= window.innerHeight * 0.9 && rect.bottom >= 60;
            beacon.classList.toggle('stowed', overlapsCraft);
            if (overlapsCraft) beacon.setAttribute('aria-hidden', 'true');
            else beacon.removeAttribute('aria-hidden');
        } else {
            beacon.classList.remove('stowed');
            beacon.removeAttribute('aria-hidden');
        }
    }

    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
}

/* ==========================================================================
   8. Owned-Plant Fleet Detail Modal
   ========================================================================== */
/* Facts below are limited to what the company's own brochure states: unit counts,
   exact model names, on-site purpose, and documented project volumes.
   Manufacturer performance claims are deliberately omitted — the brochure does not
   publish any, so none are asserted here. */
const FLEET_DATA = {
    volvo: {
        title: 'Volvo EC 210 &amp; EC 290',
        category: 'CRAWLER EXCAVATOR',
        count: '3 UNITS OWNED',
        image: 'images/fleet-volvo-excavator.webp',
        objectPosition: 'center 20%',
        specs: [
            { label: 'UNITS OWNED', val: '3' },
            { label: 'EXACT MODELS', val: 'Volvo EC 210 &amp; Volvo EC 290' },
            { label: 'USED ON SITE FOR', val: 'Our heaviest diggers &mdash; deep basement cores and the hardest rock faces on a programme.' },
            { label: 'IN THE OWNED PLANT', val: 'One of six excavator lines &middot; 24 excavators, 81 units in total' }
        ]
    },
    hitachi: {
        title: 'Tata Hitachi EX 200',
        category: 'EXCAVATOR',
        count: '7 UNITS OWNED',
        image: 'images/fleet-hitachi.webp',
        specs: [
            { label: 'UNITS OWNED', val: '7 &mdash; our largest single machine group' },
            { label: 'EXACT MODELS', val: 'Tata Hitachi EX 200' },
            { label: 'USED ON SITE FOR', val: 'Everyday basement cuts, foundation pits and trenching on Mumbai sites.' },
            { label: 'IN THE OWNED PLANT', val: 'Part of the 24 owned excavators, run with our own operators' }
        ]
    },
    zaxis: {
        title: 'Zaxis 120 / 210 / 370',
        category: 'EXCAVATOR RANGE',
        count: '5 UNITS OWNED',
        image: 'images/site-before.webp',
        specs: [
            { label: 'UNITS OWNED', val: '5 across three classes' },
            { label: 'EXACT MODELS', val: 'Zaxis 120, Zaxis 210, Zaxis 370' },
            { label: 'USED ON SITE FOR', val: 'Sizing the machine to the space &mdash; 120 for tight compounds and boundary walls, 370 for opening up a rock face.' },
            { label: 'IN THE OWNED PLANT', val: 'Part of the 24 owned excavators, 81 units total' }
        ]
    },
    komatsu: {
        title: 'L&amp;T Komatsu PC-210',
        category: 'EXCAVATOR',
        count: '3 UNITS OWNED',
        image: 'images/fleet-komatsu-pc210.webp',
        objectPosition: 'center 30%',
        specs: [
            { label: 'UNITS OWNED', val: '3' },
            { label: 'EXACT MODELS', val: 'L&amp;T Komatsu PC-210' },
            { label: 'USED ON SITE FOR', val: 'Continuous rock duty and long shifts, where boom and arm life matter more than headline output.' },
            { label: 'IN THE OWNED PLANT', val: 'Part of the 24 owned excavators, all operated by our own crew' }
        ]
    },
    'tata-small': {
        title: 'Tata EX-70 &amp; TMX-20',
        category: 'COMPACT EXCAVATOR',
        count: '6 UNITS OWNED',
        image: 'images/site-dozer.webp',
        specs: [
            { label: 'UNITS OWNED', val: '6' },
            { label: 'EXACT MODELS', val: 'Tata EX-70 &times; 4 &middot; Tata TMX-20 &times; 2' },
            { label: 'USED ON SITE FOR', val: 'Trimming and patch work, utility trenches, access ramps and the jobs a 200-class machine is too big for.' },
            { label: 'IN THE OWNED PLANT', val: 'Completes the 24-unit excavator group out of 81 total units' }
        ]
    },
    breakers: {
        title: 'Hydraulic Rock Breakers',
        category: 'ROCK DEMOLITION',
        count: '24 UNITS OWNED',
        image: 'images/fleet-tata-hitachi-breaker.webp',
        objectPosition: 'center 40%',
        specs: [
            { label: 'UNITS OWNED', val: '24 hydraulic breaker attachments' },
            { label: 'EXACT MODELS', val: 'Breaker attachments matched to our own excavators' },
            { label: 'USED ON SITE FOR', val: 'Breaking basalt mechanically on urban sites where blasting is out of the question.' },
            { label: 'WORK REFERENCE', val: '1,50,000 cu.m basalt &mdash; Northern Heights, N Rose Developers, Dahisar (E)' },
            { label: 'ROCK ON OTHER LISTED WORKS', val: '1,15,000 cu.m &mdash; SVKM Bhidas Hall &middot; 69,500 cu.m &mdash; J. Kumar Metro &middot; 55,000 cu.m &mdash; Lake Riviera, Powai' }
        ]
    },
    tippers: {
        title: 'Hyva Tippers &amp; Dumpers',
        category: 'LOADING &amp; HAULAGE',
        count: '29 UNITS OWNED',
        image: 'images/fleet-hyva-tipper.webp',
        objectPosition: 'center 30%',
        specs: [
            { label: 'UNITS OWNED', val: '29 loading and haulage vehicles' },
            { label: 'EXACT MODELS', val: 'Hyva tippers &times; 26 &middot; Tata dumpers &times; 3' },
            { label: 'USED ON SITE FOR', val: 'Moving excavated soil and broken rock off plot &mdash; kept on the same contract so haulage never becomes the bottleneck.' },
            { label: 'WORK REFERENCE', val: '4,00,000 cu.m removed &mdash; Wadhwa Residency, L&amp;T ECC Division, Ghatkopar (E)' },
            { label: 'DISPOSAL ON METRO WORK', val: '1,04,500 cu.m soil hauled &mdash; J. Kumar Infra, Dahisar to Andheri' }
        ]
    },
    support: {
        title: 'JCB 3D &amp; Bolero Pickup',
        category: 'SUPPORT PLANT',
        count: '4 UNITS OWNED',
        image: 'images/mach-jcb.webp',
        specs: [
            { label: 'UNITS OWNED', val: '4' },
            { label: 'EXACT MODELS', val: 'JCB Backhoe Loader 3D &times; 2 &middot; Mahindra Bolero Pickup &times; 2' },
            { label: 'USED ON SITE FOR', val: 'Grading and loading with the backhoes; the pickups keep spares, fuel and crew moving between sites.' },
            { label: 'IN THE OWNED PLANT', val: 'Part of the 81 units, all owned and operated in-house' }
        ]
    }
};

function initFleetModals() {
    const fleetCards = document.querySelectorAll('.fleet-card');
    const modal = document.getElementById('fleetModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('modalCloseBtn');

    if (!modal || !modalBody) return;

    let activeCard = null;

    fleetCards.forEach(card => card.setAttribute('aria-expanded', 'false'));

    // Cards already declare role="button"; mirror the dialog state only where the
    // author shipped an aria-expanded hook, so we never invent a new widget pattern.
    function setCardExpanded(card, expanded) {
        if (card && card.hasAttribute('aria-expanded')) {
            card.setAttribute('aria-expanded', String(expanded));
        }
    }

    function openFleet(card) {
        const data = FLEET_DATA[card.getAttribute('data-fleet-id')];
        if (!data) return;

        const specsHtml = data.specs.map(s => `
                <div class="fleet-spec-row">
                    <span class="fleet-spec-label">${s.label}</span>
                    <span class="fleet-spec-val">${s.val}</span>
                </div>
            `).join('');

        modalBody.innerHTML = `
                <div class="fleet-modal-header" style="margin-bottom: 18px;">
                    <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.18em; color: var(--c-blaze-ink); background: rgba(255, 94, 20, 0.12); padding: 4px 10px; display:inline-block; margin-bottom: 8px; border-radius: 4px;">${data.category}</span>
                    <h3 style="font-family: var(--font-display); font-size: clamp(24px, 4vw, 32px); font-weight: 800; color: #0F172A; margin: 4px 0 6px 0; line-height: 1.2;">${data.title}</h3>
                    <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #64748B;">${data.count}</div>
                </div>
                <div class="fleet-modal-img-container" style="position:relative; width:100%; height: clamp(240px, 38vh, 340px); overflow:hidden; margin-bottom: 20px; border: 1.5px solid #FED7AA; border-radius: 6px; background: #0F172A;">
                    <img id="fleetModalImg" src="${data.image}" alt="${data.title}" data-position="${data.objectPosition || 'center center'}" style="width:100%; height:100%; object-fit:cover; object-position:${data.objectPosition || 'center center'}; display:block; transition: object-fit 0.25s ease;">
                    <button type="button" class="btn-fit-toggle" onclick="toggleFleetImgFit(this)" title="Toggle full uncropped view" style="position:absolute; right:10px; bottom:10px; background:rgba(15,23,42,0.85); border:1px solid rgba(254,215,170,0.6); color:#FED7AA; font-family:var(--font-mono); font-size:10.5px; font-weight:700; padding:5px 11px; border-radius:4px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; backdrop-filter:blur(6px); z-index:3;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                        <span id="fitToggleLabel">SHOW FULL PHOTO</span>
                    </button>
                </div>
                <div style="margin-bottom: 24px;">
                    ${specsHtml}
                </div>
                <div style="display:flex; justify-content:flex-end;">
                    <a href="#estimate" class="btn-estimate-header" onclick="document.getElementById('fleetModal').classList.remove('open'); document.body.classList.remove('modal-open');" style="display:inline-flex; width:auto; text-decoration:none; border-radius: 4px;">
                        <span>INQUIRE AVAILABILITY</span>
                        <span class="arrow">&rarr;</span>
                    </a>
                </div>
            `;

        activeCard = card;
        setCardExpanded(activeCard, true);
        modal.classList.add('open');
        document.body.classList.add('modal-open');
        const card$ = modal.querySelector('.modal-card');
        if (card$) card$.scrollTop = 0;
        // Focus after the dialog has been laid out, or the browser drops it.
        if (closeBtn) requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
    }

    function closeFleetModal() {
        if (!modal.classList.contains('open')) return;
        modal.classList.remove('open');
        document.body.classList.remove('modal-open');
        setCardExpanded(activeCard, false);
        if (activeCard) activeCard.focus({ preventScroll: true });
        activeCard = null;
    }

    fleetCards.forEach(card => {
        card.addEventListener('click', () => openFleet(card));

        // tabindex="0" + role="button": activate with Enter or Space.
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // keep Space from scrolling the page
                openFleet(card);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeFleetModal);
    }

    // The injected "INQUIRE AVAILABILITY" link jumps to the estimate form.
    modalBody.addEventListener('click', (e) => {
        if (e.target.closest('a[href="#estimate"]')) closeFleetModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeFleetModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeFleetModal();
    });
}

/* ==========================================================================
   9. Track Record Filter Tabs (Completed vs Ongoing)
   ========================================================================== */
function initProjectTabs() {
    const tabCompleted = document.getElementById('tabCompleted');
    const tabOngoing = document.getElementById('tabOngoing');
    const projectRows = document.querySelectorAll('.project-row');
    const featuredCard = document.getElementById('featuredProjectCard');

    if (!tabCompleted || !tabOngoing) return;

    function setFilter(status) {
        const showCompleted = status === 'completed';

        [tabCompleted, tabOngoing].forEach(tab => {
            const isActive = tab === (showCompleted ? tabCompleted : tabOngoing);
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        // Featured card documents a completed work (Northern Heights).
        if (featuredCard) {
            if (showCompleted) {
                featuredCard.style.display = 'flex';
                featuredCard.style.animation = 'heroItemFadeUp 0.5s ease forwards';
            } else {
                featuredCard.style.display = 'none';
            }
        }

        // Stagger index counts only the rows being revealed, so the last row of a
        // long list is not delayed by the hidden rows of the other group.
        let visibleIndex = 0;
        projectRows.forEach(row => {
            if (row.getAttribute('data-status') === status) {
                row.style.display = 'grid';
                row.style.animation = `heroItemFadeUp 0.4s ease ${visibleIndex * 0.05}s forwards`;
                visibleIndex += 1;
            } else {
                row.style.display = 'none';
                row.style.animation = 'none';
            }
        });
    }

    tabCompleted.addEventListener('click', () => setFilter('completed'));
    tabOngoing.addEventListener('click', () => setFilter('ongoing'));
}

/* ==========================================================================
   10. FAQ Accordion (<details> — one open at a time)
   ========================================================================== */
function initFaq() {
    const list = document.getElementById('faqList');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('details.faq-item'));
    if (!items.length) return;

    items.forEach(item => {
        const summary = item.querySelector('summary');
        // Seed state from markup: the first item ships open, and we only collapse
        // the others when an item is opened by the user, so the initial state holds.
        if (summary) summary.setAttribute('aria-expanded', String(item.open));

        item.addEventListener('toggle', () => {
            if (summary) summary.setAttribute('aria-expanded', String(item.open));
            if (!item.open) return; // native toggle to closed — nothing else to do

            items.forEach(other => {
                if (other === item || !other.open) return;
                other.open = false; // fires its own toggle, syncing its aria-expanded
            });
        });
    });
}

/* ==========================================================================
   11. Estimate Form Validation & Toast
   ========================================================================== */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initEstimateForm() {
    const form = document.getElementById('estimateForm');
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');

    if (!form) return;

    let toastTimer = null;

    const fullName = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const workType = document.getElementById('projectType');

    function showToast(message) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
    }

    function valueOf(field) {
        return field ? field.value.trim() : '';
    }

    function fail(message, field) {
        showToast(message);
        if (field && typeof field.focus === 'function') field.focus();
    }

    form.addEventListener('submit', (e) => {
        // The form is novalidate, so validation happens here instead.
        e.preventDefault();

        const name = valueOf(fullName);
        const tel = valueOf(phone);
        const mail = valueOf(email);

        if (!name) return fail('Please tell us your name.', fullName);
        if (!tel) return fail('Please add a phone number so the desk can call you back.', phone);
        if (!mail) return fail('Please add an email address for the written estimate.', email);
        if (!EMAIL_PATTERN.test(mail)) return fail('That email address looks incomplete — please check it.', email);

        const work = valueOf(workType);
        const greeting = work ? `Thanks ${name} — your enquiry about ${work} is noted.` : `Thanks ${name} — your enquiry is noted.`;
        // No turnaround promise: the brochure only states office hours.
        showToast(`${greeting} The desk is open Monday to Saturday, 9:00 AM to 7:00 PM.`);

        form.reset();
    });
}

/* ==========================================================================
   12. Mobile Menu Toggle
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const drawer = document.getElementById('mobileNavDrawer');

    if (!menuBtn || !drawer) return;

    // Ensure the aria state matches the markup on load.
    setMobileDrawer(drawer.classList.contains('open'));

    menuBtn.addEventListener('click', () => {
        setMobileDrawer(!drawer.classList.contains('open'));
    });

    drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMobileDrawer(false));
    });

    // The drawer only exists below 768px in CSS — drop it once the viewport grows past that.
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    const closeIfDesktop = (mq) => {
        if (mq.matches) setMobileDrawer(false);
    };

    if (typeof desktopQuery.addEventListener === 'function') {
        desktopQuery.addEventListener('change', closeIfDesktop);
    } else if (typeof desktopQuery.addListener === 'function') {
        desktopQuery.addListener(closeIfDesktop);
    }
    closeIfDesktop(desktopQuery);
}

/* ==========================================================================
   13. Footer Copyright Year
   ========================================================================== */
function initFooterYear() {
    const yearEl = document.getElementById('footerYear');
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
}

/* ==========================================================================
   14. Gallery Image Lightbox Popup Modal
   ========================================================================== */
function initGalleryLightbox() {
    const modal = document.getElementById('galleryLightboxModal');
    if (!modal) return;

    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    if (galleryItems.length === 0) return;

    const imgEl = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const captionEl = document.getElementById('lightboxCaption');
    const counterEl = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxCloseBtn');
    const prevBtn = document.getElementById('lightboxPrevBtn');
    const nextBtn = document.getElementById('lightboxNextBtn');
    const dotsContainer = document.getElementById('lightboxDots');
    const stage = modal.querySelector('.lightbox-stage');

    let currentIndex = 0;
    let lastActiveElement = null;

    // Collect data from each gallery item
    const photos = Array.from(galleryItems).map((item) => {
        const img = item.querySelector('img');
        const figcaption = item.querySelector('figcaption');
        return {
            src: img ? img.getAttribute('src') : '',
            alt: img ? img.getAttribute('alt') : '',
            title: figcaption ? figcaption.textContent.trim() : (img ? img.getAttribute('alt') : '')
        };
    });

    // Create thumbnail dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        photos.forEach((photo, idx) => {
            const dot = document.createElement('button');
            dot.className = 'lightbox-dot chamfer-sm' + (idx === 0 ? ' active' : '');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `View photo ${idx + 1}: ${photo.title}`);
            dot.addEventListener('click', () => {
                goToPhoto(idx);
            });
            dotsContainer.appendChild(dot);
        });
    }

    function renderPhoto(index) {
        const photo = photos[index];
        if (!photo) return;

        if (imgEl) {
            imgEl.classList.add('animating');
            imgEl.src = photo.src;
            imgEl.alt = photo.alt;
            setTimeout(() => {
                imgEl.classList.remove('animating');
            }, 100);
        }

        if (titleEl) {
            titleEl.textContent = photo.title;
        }

        if (captionEl) {
            captionEl.textContent = photo.alt;
        }

        if (counterEl) {
            const formattedCurrent = String(index + 1).padStart(2, '0');
            const formattedTotal = String(photos.length).padStart(2, '0');
            counterEl.textContent = `${formattedCurrent} / ${formattedTotal}`;
        }

        // Update dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.lightbox-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === index);
                dot.setAttribute('aria-selected', idx === index ? 'true' : 'false');
            });
        }
    }

    function openLightbox(index) {
        currentIndex = index;
        lastActiveElement = document.activeElement;
        renderPhoto(currentIndex);
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        if (closeBtn) {
            requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
        }
    }

    function closeLightbox() {
        if (!modal.classList.contains('open')) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
            lastActiveElement.focus({ preventScroll: true });
        }
        lastActiveElement = null;
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        renderPhoto(currentIndex);
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % photos.length;
        renderPhoto(currentIndex);
    }

    function goToPhoto(index) {
        currentIndex = index;
        renderPhoto(currentIndex);
    }

    // Attach click and keyboard triggers to each gallery item
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', showPrev);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', showNext);
    }

    // Close on backdrop click (click outside card)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLightbox();
        }
    });

    // Keyboard navigation (Esc, ArrowLeft, ArrowRight)
    window.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('open')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            showPrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            showNext();
        }
    });

    // Touch swipe support on mobile devices
    if (stage) {
        let touchStartX = 0;
        let touchStartY = 0;

        stage.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;

                // Only consider horizontal swipe if horizontal movement is larger than vertical
                if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        showPrev();
                    } else {
                        showNext();
                    }
                }
            }
        }, { passive: true });
    }
}



/* ==========================================================================
   15. On-Site Action Video Reel
   ========================================================================== */
const VIDEO_REEL_DATA = [
    {
        src: 'video/basement-excavation-panoramic.mp4',
        poster: 'images/fleet-tata-hitachi-breaker.webp',
        tag: 'DEEP BASEMENT EXCAVATION',
        desc: 'Panoramic view of multi-level basement excavation with secant pile shoring, Tata Hitachi excavators and rock breakers working below grade.'
    },
    {
        src: 'video/komatsu-loading-hyva.mp4',
        poster: 'images/fleet-komatsu-pc210.webp',
        tag: 'BULK EXCAVATION & LOADING',
        desc: 'Komatsu PC 210 LC excavating earth and rock, loading Tata Hyva tipper trucks for off-site disposal on an active Mumbai project.'
    },
    {
        src: 'video/hitachi-ex70-loading.mp4',
        poster: 'images/gallery-muck-haulage.webp',
        tag: 'COMPACT EXCAVATION & HAULING',
        desc: 'Tata Hitachi EX 70 crawler excavator with dozer blade excavating and loading muck directly into a Tata tipper for rapid removal.'
    },
    {
        src: 'video/volvo-rock-breaking.mp4',
        poster: 'images/fleet-volvo-excavator.webp',
        tag: 'HARD ROCK BREAKING',
        desc: 'Volvo crawler excavator on upper ramp while hydraulic rock breakers hammer basalt in a deep shored basement pit.'
    },
    {
        src: 'video/jcb-piling-support.mp4',
        poster: 'images/gallery-komatsu-loading.webp',
        tag: 'BACKHOE & PILING SUPPORT',
        desc: 'JCB Backhoe Loader digging and levelling alongside a crawler piling rig with Mahindra pickup support vehicle on site.'
    },
    {
        src: 'video/site-supervision-operations.mp4',
        poster: 'images/fleet-hyva-tipper.webp',
        tag: 'SITE SUPERVISION & OPS',
        desc: 'Tata Hitachi excavator working in a rock excavation pit with site engineers and supervisors overseeing ongoing operations.'
    }
];

function initVideoReel() {
    const tabContainer = document.getElementById('videoReelTabs');
    const video = document.getElementById('reelVideo');
    const overlay = document.getElementById('videoReelOverlay');
    const playBtn = document.getElementById('videoPlayBtn');
    const tagEl = document.getElementById('videoReelTag');
    const descEl = document.getElementById('videoReelDesc');

    if (!tabContainer || !video) return;

    const tabs = tabContainer.querySelectorAll('.video-tab-btn');
    let currentIdx = 0;

    function playActiveVideo() {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (overlay) overlay.classList.add('hidden');
            }).catch(() => {
                // Autoplay/play prevented or aborted
            });
        }
    }

    function loadVideo(idx, autoPlay = false) {
        if (idx < 0 || idx >= VIDEO_REEL_DATA.length) return;
        const data = VIDEO_REEL_DATA[idx];
        currentIdx = idx;

        video.pause();
        video.src = data.src;
        video.poster = data.poster;
        video.load();

        if (tagEl) tagEl.textContent = data.tag;
        if (descEl) descEl.textContent = data.desc;

        tabs.forEach((tab, i) => {
            const isActive = i === idx;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        if (autoPlay) {
            playActiveVideo();
        } else {
            if (overlay) overlay.classList.remove('hidden');
        }
    }

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => loadVideo(i, false));
    });

    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playActiveVideo();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            playActiveVideo();
        });
    }

    video.addEventListener('play', () => {
        if (overlay) overlay.classList.add('hidden');
    });

    video.addEventListener('pause', () => {
        if ((video.ended || video.paused) && overlay && !video.dataset.scrollPaused) {
            overlay.classList.remove('hidden');
        }
    });

    video.addEventListener('ended', () => {
        if (overlay) overlay.classList.remove('hidden');
    });

    // Auto-pause video when scrolled out of view to eliminate GPU/CPU lag
    if ('IntersectionObserver' in window) {
        const reelObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
                    if (!video.paused) {
                        video.dataset.scrollPaused = 'true';
                        video.pause();
                    }
                } else if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                    if (video.dataset.scrollPaused === 'true') {
                        delete video.dataset.scrollPaused;
                        // Keep paused with clean UI unless user chooses to resume
                        if (overlay) overlay.classList.remove('hidden');
                    }
                }
            });
        }, {
            threshold: [0, 0.2, 0.5]
        });

        reelObserver.observe(video);
    }
}


window.toggleFleetImgFit = function(btn) {
    const img = document.getElementById('fleetModalImg');
    const label = document.getElementById('fitToggleLabel');
    if (!img || !label) return;
    const isContained = img.style.objectFit === 'contain';
    if (isContained) {
        img.style.objectFit = 'cover';
        img.style.objectPosition = img.getAttribute('data-position') || 'center center';
        label.textContent = 'SHOW FULL PHOTO';
    } else {
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center center';
        label.textContent = 'FOCUS MACHINE';
    }
};
