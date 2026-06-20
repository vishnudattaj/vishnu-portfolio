// ============================================
// Terminal boot sequence in hero
// ============================================
const termBody = document.getElementById('termBody');

const termLines = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: 'vishnu_datta_jayanti' },
  { type: 'cmd', text: 'cat role.txt' },
  { type: 'out', text: 'CS @ Purdue, Honors College' },
  { type: 'cmd', text: 'cat focus.txt' },
  { type: 'out', text: 'ML research · applied ML · quant backtesting' },
  { type: 'cmd', text: 'status' },
  { type: 'out-green', text: '● available for research / internships' },
];

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildStaticTerminal() {
  termBody.innerHTML = termLines.map(line => {
    if (line.type === 'cmd') {
      return `<div><span class="prompt">$</span> <span class="out">${line.text}</span></div>`;
    } else if (line.type === 'out-green') {
      return `<div style="color:var(--green)">${line.text}</div>`;
    } else {
      return `<div class="dim">${line.text}</div>`;
    }
  }).join('');
}

async function typeTerminal() {
  if (prefersReduced) { buildStaticTerminal(); return; }

  for (const line of termLines) {
    const row = document.createElement('div');
    termBody.appendChild(row);

    if (line.type === 'cmd') {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      promptSpan.textContent = '$ ';
      row.appendChild(promptSpan);

      const textSpan = document.createElement('span');
      textSpan.className = 'out';
      row.appendChild(textSpan);

      for (const ch of line.text) {
        textSpan.textContent += ch;
        await sleep(28);
      }
      await sleep(180);
    } else {
      row.className = line.type === 'out-green' ? '' : 'dim';
      if (line.type === 'out-green') row.style.color = 'var(--green)';
      row.textContent = line.text;
      await sleep(260);
    }
  }
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

typeTerminal();

// ============================================
// Scroll reveal
// ============================================
document.querySelectorAll('.log-entry, .project, .paper-card, .stack-col, .contact-inner').forEach(el => {
  el.classList.add('reveal');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ============================================
// Nav background state on scroll
// ============================================
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 40) {
    nav.style.boxShadow = '0 1px 0 rgba(127,255,161,0.08)';
  } else {
    nav.style.boxShadow = 'none';
  }
  lastScroll = y;
}, { passive: true });

// ============================================
// Mouse-reactive spotlight on hero grid
// ============================================
(function heroSpotlight() {
  const hero = document.getElementById('top');
  const spotlight = document.getElementById('gridSpotlight');
  if (!hero || !spotlight || prefersReduced) return;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty('--mx', `${x}%`);
    spotlight.style.setProperty('--my', `${y}%`);
  });
})();

// ============================================
// Active nav-link tracking on scroll
// ============================================
(function activeNavTracking() {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const intersecting = new Set();

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        intersecting.add(entry.target.id);
      } else {
        intersecting.delete(entry.target.id);
      }
    });

    navLinks.forEach(l => l.classList.remove('is-active'));

    if (intersecting.size > 0) {
      // pick whichever tracked section is currently nearest the top
      const activeId = sections.find(sec => intersecting.has(sec.id))?.id;
      const link = navLinks.find(l => l.getAttribute('href') === `#${activeId}`);
      if (link) link.classList.add('is-active');
    }
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));
})();

// ============================================
// Animated stat counters (numeric stat-vals only)
// ============================================
(function statCounters() {
  const statVals = document.querySelectorAll('.stat-val');
  if (!statVals.length) return;

  // Matches things like "1,900+", "0.71", "52,000+", "4" — captures
  // an optional leading number with commas/decimals, plus any suffix text.
  const numericPattern = /^([\d,]+(?:\.\d+)?)(.*)$/;

  const targets = [];
  statVals.forEach(el => {
    const raw = el.textContent.trim();

    // Skip year-range style values (e.g. "2013-2023", "2012–2024") —
    // these read as identifiers/ranges, not metrics worth counting up.
    if (/^\d{4}\s?[-–]\s?\d{4}$/.test(raw)) return;

    const match = raw.match(numericPattern);
    if (!match) return; // non-numeric ("XGBoost", "KMeans + XGBoost", etc.) — leave as-is

    const numStr = match[1];
    const suffix = match[2]; // "+", " R²", "yr", "-2024" style remainder, etc.
    const hasComma = numStr.includes(',');
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    const target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target)) return;

    targets.push({ el, target, suffix, hasComma, decimals, raw });
  });

  if (!targets.length || prefersReduced) return;

  function formatNumber(value, hasComma, decimals) {
    const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    if (!hasComma) return fixed;
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  }

  function animateCount(item) {
    const { el, target, suffix, hasComma, decimals } = item;
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = formatNumber(current, hasComma, decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target, hasComma, decimals) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = targets.find(t => t.el === entry.target);
      if (item) {
        animateCount(item);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  targets.forEach(item => counterObserver.observe(item.el));
})();
