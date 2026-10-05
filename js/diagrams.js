/* Theme-aware Mermaid rendering: keeps each diagram's source and re-renders
   with matching colors whenever the page theme changes. Wide diagrams are
   never shrunk below a readable size; they scroll sideways instead. */
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

const nodes = [...document.querySelectorAll('.mermaid')];
// Read each diagram's source; a literal <br/> in the HTML becomes an element,
// so turn those back into Mermaid line breaks before taking the text.
nodes.forEach((n) => {
  const copy = n.cloneNode(true);
  copy.querySelectorAll('br').forEach((br) => br.replaceWith('<br/>'));
  n.dataset.src = copy.textContent;
});

const THEMES = {
  light: {
    theme: 'base',
    themeVariables: {
      fontFamily: '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
      primaryColor: '#e3ecf8', primaryTextColor: '#1a1814', primaryBorderColor: '#1d4f91',
      secondaryColor: '#fbe9dc', tertiaryColor: '#e7ebf2',
      lineColor: '#4d5666', textColor: '#1a1814', mainBkg: '#e3ecf8', nodeBorder: '#1d4f91',
      clusterBkg: '#f2f4f8', clusterBorder: '#aab6c8', edgeLabelBackground: '#ffffff',
      pieTitleTextColor: '#1a1814', pieLegendTextColor: '#1a1814', pieSectionTextColor: '#ffffff',
      pie1: '#1d4f91', pie2: '#a64600', pie3: '#a61b4f', pie4: '#6b3fa0', pie5: '#1f6b3a', pie6: '#5b5b63'
    }
  },
  dark: {
    theme: 'base',
    themeVariables: {
      darkMode: true,
      fontFamily: '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
      primaryColor: '#16325a', primaryTextColor: '#f3f0ea', primaryBorderColor: '#93bbff',
      secondaryColor: '#4a2408', tertiaryColor: '#1a2333',
      lineColor: '#a7b1c2', textColor: '#f3f0ea', mainBkg: '#16325a', nodeBorder: '#93bbff',
      clusterBkg: '#121926', clusterBorder: '#3e4c63', edgeLabelBackground: '#121926',
      pieTitleTextColor: '#f3f0ea', pieLegendTextColor: '#f3f0ea', pieSectionTextColor: '#ffffff',
      pieStrokeColor: '#121926',
      pie1: '#1d4f91', pie2: '#a64600', pie3: '#a61b4f', pie4: '#6b3fa0', pie5: '#1f6b3a', pie6: '#5b5b63'
    }
  }
};

const MIN_SCALE = 0.8;          // ~13px text for Mermaid's 16px labels
const NARROW = 700;             // below this, left-to-right flowcharts render top-to-bottom

// Hard-coded node fills (style/classDef lines) ignore the page theme. For each
// one, use whichever label color (dark or white) reads better, and nudge the fill
// lighter or darker until the label passes WCAG AA (4.5:1).
const DARK_INK = [26, 24, 20];
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lumOf = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
function readableFill(rgb) {
  const white = [255, 255, 255];
  const useWhite = ratio(rgb, white) > ratio(rgb, DARK_INK);
  const ink = useWhite ? white : DARK_INK;
  let c = rgb.slice();
  for (let k = 0; k < 40 && ratio(c, ink) < 4.6; k++) {
    c = useWhite ? c.map((v) => v * 0.94) : c.map((v) => v + (255 - v) * 0.12);
  }
  return { fill: hex(c), color: useWhite ? '#ffffff' : hex(DARK_INK) };
}
function pinLabelColors(src) {
  return src.replace(/^(\s*(?:style|classDef)\s+\S+\s+)([^\n]*)$/gm, (line, head, body) => {
    const m = body.match(/fill:\s*#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
    if (!m) return line;
    let h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&');
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const { fill, color } = readableFill(rgb);
    const rest = body.replace(/;?\s*$/, '').replace(/(^|,)\s*color:\s*[^,;]+/gi, '');
    return head + rest.replace(m[0], 'fill:' + fill) + ',color:' + color;
  });
}

function sourceFor(n) {
  let src = pinLabelColors(n.dataset.src);
  if (window.innerWidth < NARROW) {
    src = src.replace(/^(\s*(?:graph|flowchart))\s+(LR|RL)\b/m, '$1 TD');
  }
  return src;
}

function fit(n) {
  const svg = n.querySelector('svg');
  const hint = n.previousElementSibling && n.previousElementSibling.classList.contains('diagram-hint')
    ? n.previousElementSibling : null;
  if (!svg) return;
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const natural = vb && vb.width ? vb.width : svg.getBoundingClientRect().width;
  const cs = getComputedStyle(n);
  const avail = n.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  // Slightly-too-wide diagrams just shrink a little; only really wide ones scroll.
  const wide = avail / natural < MIN_SCALE - 0.1;
  if (wide) {
    svg.style.maxWidth = 'none';
    svg.style.width = Math.round(natural * MIN_SCALE) + 'px';
    svg.removeAttribute('width');
    n.classList.add('is-wide');
    if (!hint) {
      const p = document.createElement('p');
      p.className = 'diagram-hint';
      p.textContent = '↔ This diagram is wide — scroll sideways to see all of it.';
      n.before(p);
    }
  } else {
    n.classList.remove('is-wide');
    if (hint) hint.remove();
  }
}

const vbWidth = (svgText) => {
  const m = svgText.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) /);
  return m ? parseFloat(m[1]) : Infinity;
};

// A wide flowchart may fit better in the other direction
// (a broad top-down fan-out reads better left-to-right, and vice versa).
let altId = 0;
async function tryOtherDirection(n) {
  if (!n.classList.contains('is-wide')) return;
  const src = sourceFor(n);
  const m = src.match(/^(\s*(?:graph|flowchart))\s+(TD|TB|LR|RL|BT)\b/m);
  if (!m) return;
  const other = /^(LR|RL)$/.test(m[2]) ? 'TD' : 'LR';
  const alt = src.replace(m[0], `${m[1]} ${other}`);
  try {
    const { svg } = await mermaid.render(`alt-diagram-${altId++}`, alt);
    const svgEl = n.querySelector('svg');
    const current = svgEl && svgEl.viewBox ? svgEl.viewBox.baseVal.width : Infinity;
    if (vbWidth(svg) < current * 0.8) { n.innerHTML = svg; fit(n); }
  } catch (e) { /* keep the original rendering */ }
}

let rendering = Promise.resolve();
function render() {
  rendering = rendering.then(async () => {
    if (!nodes.length) return;
    const mode = (window.swTheme && window.swTheme()) === 'dark' ? 'dark' : 'light';
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', ...THEMES[mode] });
    nodes.forEach((n) => { n.removeAttribute('data-processed'); n.textContent = sourceFor(n); });
    try { await mermaid.run({ nodes }); } catch (e) { console.warn('Mermaid render failed:', e); }
    nodes.forEach(fit);
    for (const n of nodes) await tryOtherDirection(n);
  });
  return rendering;
}

render();
document.addEventListener('themechange', render);

// Re-fit on resize; re-render only when crossing the narrow breakpoint (diagram direction changes).
let wasNarrow = window.innerWidth < NARROW, t;
window.addEventListener('resize', () => {
  clearTimeout(t);
  t = setTimeout(() => {
    const isNarrow = window.innerWidth < NARROW;
    if (isNarrow !== wasNarrow) { wasNarrow = isNarrow; render(); }
    else nodes.forEach(fit);
  }, 150);
});
