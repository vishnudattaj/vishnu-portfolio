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
