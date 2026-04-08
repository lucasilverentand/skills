const args = Bun.argv.slice(2);

const HELP = `
serve-options — Serve a design options HTML file and collect the user's pick + feedback

Usage:
  bun run tools/serve-options.ts <file.html> [--port 3333]

Opens the file in the browser with a selection bar. When the user picks a variant,
prints their choice and feedback to stdout, then exits.
`.trim();

if (args.includes("--help") || args.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const portIdx = args.indexOf("--port");
const port = portIdx !== -1 ? parseInt(args[portIdx + 1]) : 3333;
const skipSet = new Set<number>();
if (portIdx !== -1) { skipSet.add(portIdx); skipSet.add(portIdx + 1); }
const filePath = args.find((a, i) => !skipSet.has(i) && !a.startsWith("--"));

const { readFileSync } = await import("node:fs");
const { resolve } = await import("node:path");

const resolved = resolve(filePath!);
const outputFile = resolved.replace(/\.html$/, "") + ".pick.json";
let html: string;
try {
  html = readFileSync(resolved, "utf-8");
} catch {
  console.error(`Error: could not read ${resolved}`);
  process.exit(1);
}

// Inject the toolbar and all UI before </body>
const selectionUI = `
<style>
  /* ── Toolbar ── */
  .toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 2000; background: #1a1a2e; color: #fff; padding: 0 16px; display: flex; align-items: center; gap: 2px; font-size: 13px; height: 44px; font-family: -apple-system, system-ui, sans-serif; }
  .toolbar-group { display: flex; align-items: center; gap: 2px; padding: 0 8px; }
  .toolbar-group + .toolbar-group { border-left: 1px solid rgba(255,255,255,0.12); }
  .toolbar-title { font-weight: 600; white-space: nowrap; padding-right: 8px; }

  .tb { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 4px 12px; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
  .tb:hover { background: rgba(255,255,255,0.14); }
  .tb.active { background: #fff; color: #1a1a2e; }
  .tb-icon { font-size: 14px; padding: 4px 8px; }

  /* Hide the original switcher + variant-label from the design HTML */
  .switcher { display: none !important; }
  .variant-label { display: none !important; }

  /* ── Side-by-side layout (always on) ── */
  .variants-scroll { display: flex; gap: 24px; padding: 52px 24px 80px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; }
  .variant { display: block !important; flex: 0 0 auto; padding-top: 0 !important; padding-bottom: 0 !important; min-height: calc(100vh - 132px); scroll-snap-align: start; border-radius: 12px; border: 2px solid #e2e8f0; background: #fff; overflow: hidden; position: relative; transition: border-color 0.2s, box-shadow 0.2s; cursor: pointer; }
  .variant:hover { border-color: #c7d2de; }
  .variant.picked-highlight { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.3); }

  /* Variant header label */
  .variant-header { position: sticky; top: 0; z-index: 10; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 16px; font-size: 12px; font-weight: 600; color: #475569; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: space-between; }
  .variant.picked-highlight .variant-header { background: #f0eeff; border-bottom-color: #c7d2fe; color: #4338ca; }
  .vh-pick { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6366f1; opacity: 0; transition: opacity 0.15s; }
  .variant.picked-highlight .vh-pick { opacity: 1; }

  /* Viewport sizing */
  body.vp-mobile .variant { width: 375px; }
  body.vp-tablet .variant { width: 768px; }
  body.vp-desktop .variant { width: calc(100vw - 48px); max-width: 1400px; }

  /* ── Pick bar ── */
  .pick-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 2000; background: #1a1a2e; border-top: 1px solid rgba(255,255,255,0.1); padding: 10px 16px; display: flex; align-items: flex-end; gap: 12px; font-family: -apple-system, system-ui, sans-serif; }
  .pick-feedback { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .pick-feedback label { color: rgba(255,255,255,0.5); font-size: 11px; }
  .pick-feedback textarea { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 8px; padding: 8px 12px; font-size: 13px; font-family: inherit; resize: none; height: 36px; transition: height 0.2s; }
  .pick-feedback textarea:focus { outline: none; border-color: rgba(255,255,255,0.3); height: 60px; }
  .pick-feedback textarea::placeholder { color: rgba(255,255,255,0.3); }
  .pick-btn { background: #22c55e; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; transition: background 0.15s; flex-shrink: 0; height: 36px; }
  .pick-btn:hover { background: #16a34a; }

  .pick-done { position: fixed; inset: 0; z-index: 3000; background: #1a1a2e; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: #fff; font-family: -apple-system, system-ui, sans-serif; }
  .pick-done h2 { font-size: 20px; font-weight: 600; }
  .pick-done p { color: rgba(255,255,255,0.5); font-size: 14px; }
</style>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const variants = [...document.querySelectorAll('.variant')];
  const origSwitcher = document.querySelector('.switcher');

  // ── Build toolbar ──
  const toolbar = document.createElement('nav');
  toolbar.className = 'toolbar';

  const titleEl = origSwitcher?.querySelector('.switcher-title');
  const title = titleEl ? titleEl.textContent : 'Design Options';
  toolbar.innerHTML = \`
    <span class="toolbar-title">\${title}</span>
    <div class="toolbar-group" id="tb-variants"></div>
    <div class="toolbar-group" id="tb-viewport">
      <button class="tb tb-icon" data-vp="mobile" title="Mobile (375px)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      </button>
      <button class="tb tb-icon" data-vp="tablet" title="Tablet (768px)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      </button>
      <button class="tb tb-icon active" data-vp="desktop" title="Desktop (full)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </button>
    </div>
  \`;
  body.prepend(toolbar);

  // ── Build variant buttons — works with any number of variants ──
  const origBtns = origSwitcher?.querySelectorAll('.switcher-btn') || [];
  const tbVariants = toolbar.querySelector('#tb-variants');
  const variantMeta = [];

  // If original switcher had buttons, use those; otherwise auto-detect from data-variant sections
  if (origBtns.length > 0) {
    origBtns.forEach((ob, i) => {
      const target = ob.dataset.target;
      const letter = ob.textContent.trim().charAt(0);
      const hint = ob.querySelector('.switcher-hint')?.textContent || '';
      variantMeta.push({ target, letter, hint });
    });
  } else {
    variants.forEach((v, i) => {
      const target = v.dataset.variant || String(i + 1);
      const letter = String.fromCharCode(65 + i);
      variantMeta.push({ target, letter, hint: 'Variant ' + letter });
    });
  }

  variantMeta.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.className = 'tb' + (i === 0 ? ' active' : '');
    btn.dataset.target = m.target;
    btn.textContent = m.letter;
    btn.title = m.hint;
    tbVariants.appendChild(btn);
  });

  // ── Wrap variants in scroll container ──
  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'variants-scroll';
  variants[0]?.parentNode.insertBefore(scrollWrap, variants[0]);
  variants.forEach((v, i) => {
    const header = document.createElement('div');
    header.className = 'variant-header';
    const label = document.createElement('span');
    label.textContent = variantMeta[i] ? variantMeta[i].letter + ' \\u2014 ' + variantMeta[i].hint : 'Variant ' + (i + 1);
    const pickTag = document.createElement('span');
    pickTag.className = 'vh-pick';
    pickTag.textContent = 'Selected';
    header.appendChild(label);
    header.appendChild(pickTag);
    v.prepend(header);
    scrollWrap.appendChild(v);
  });

  // ── State ──
  let currentVariant = '1';
  let currentVp = 'desktop';

  function selectVariant(n) {
    currentVariant = n;
    tbVariants.querySelectorAll('.tb').forEach(b => b.classList.toggle('active', b.dataset.target === n));
    variants.forEach(v => v.classList.toggle('picked-highlight', v.dataset.variant === n));
  }

  function scrollToVariant(n) {
    const target = variants.find(v => v.dataset.variant === n);
    if (target) target.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }

  function setViewport(vp) {
    currentVp = vp;
    body.classList.remove('vp-mobile', 'vp-tablet', 'vp-desktop');
    body.classList.add('vp-' + vp);
    toolbar.querySelectorAll('#tb-viewport .tb').forEach(b => b.classList.toggle('active', b.dataset.vp === vp));
  }

  // ── Events ──

  // Click variant card to select it
  variants.forEach(v => {
    v.addEventListener('click', () => {
      selectVariant(v.dataset.variant);
    });
  });

  // Toolbar variant buttons
  tbVariants.addEventListener('click', e => {
    const btn = e.target.closest('.tb');
    if (btn?.dataset.target) {
      selectVariant(btn.dataset.target);
      scrollToVariant(btn.dataset.target);
    }
  });

  toolbar.querySelector('#tb-viewport').addEventListener('click', e => {
    const btn = e.target.closest('.tb');
    if (btn?.dataset.vp) setViewport(btn.dataset.vp);
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA') return;
    const allBtns = [...tbVariants.querySelectorAll('.tb')];
    const idx = allBtns.findIndex(b => b.dataset.target === currentVariant);
    if (e.key === 'ArrowRight' && idx < allBtns.length - 1) {
      selectVariant(allBtns[idx + 1].dataset.target);
      scrollToVariant(allBtns[idx + 1].dataset.target);
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      selectVariant(allBtns[idx - 1].dataset.target);
      scrollToVariant(allBtns[idx - 1].dataset.target);
    }
    if (e.key >= '1' && e.key <= '9') {
      const t = allBtns[parseInt(e.key) - 1];
      if (t) { selectVariant(t.dataset.target); scrollToVariant(t.dataset.target); }
    }
    if (e.key === 'm' || e.key === 'M') setViewport('mobile');
    if (e.key === 't' || e.key === 'T') setViewport('tablet');
    if (e.key === 'd' || e.key === 'D') setViewport('desktop');
  });

  // ── Pick ──
  document.getElementById('pick-submit').addEventListener('click', async () => {
    const meta = variantMeta.find(m => m.target === currentVariant) || {};
    const feedback = document.getElementById('pick-feedback-input').value.trim();

    try {
      await fetch('/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variant: currentVariant, label: meta.letter || '?', description: meta.hint || '', feedback, viewport: currentVp })
      });
    } catch {}

    document.body.innerHTML = '<div class="pick-done"><h2>Picked variant ' + (meta.letter || '?') + '</h2><p>You can close this tab</p></div>';
  });

  document.getElementById('pick-feedback-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      document.getElementById('pick-submit').click();
    }
  });

  // ── Init ──
  body.classList.add('vp-desktop');
  selectVariant('1');
});
</script>

<div class="pick-bar">
  <div class="pick-feedback">
    <label>Feedback (optional) · <kbd style="opacity:0.5">⌘↵</kbd> to submit</label>
    <textarea id="pick-feedback-input" placeholder="e.g. like the layout but make the cards wider..."></textarea>
  </div>
  <button class="pick-btn" id="pick-submit">Pick this variant</button>
</div>
`;

const injected = html.replace('</body>', selectionUI + '\n</body>');

let resolver: (value: string) => void;
const picked = new Promise<string>(r => { resolver = r; });

const server = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/pick") {
      return req.json().then((body: { variant: string; label: string; description: string; feedback: string }) => {
        resolver(JSON.stringify(body, null, 2));
        return new Response("ok");
      });
    }

    return new Response(injected, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
});

console.error(`Serving on http://localhost:${port} — waiting for pick...`);

// Open in browser
const proc = Bun.spawn(["open", `http://localhost:${port}`], { stdout: "ignore", stderr: "ignore" });
await proc.exited;

const result = await picked;

const { writeFileSync } = await import("node:fs");
writeFileSync(outputFile, result + "\n");

// Small delay so the browser gets the response before we kill the server
await new Promise(r => setTimeout(r, 300));
server.stop();

console.log(result);
console.error(`Pick saved to ${outputFile}`);
