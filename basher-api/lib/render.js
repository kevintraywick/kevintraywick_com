const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const PAGES = [
  { id: 'start',       file: 'index.html',        label: 'start' },
  { id: 'frameworks',  file: 'frameworks.html',   label: 'frameworks' },
  { id: 'pg-thinking', file: 'pg-thinking.html',  label: 'pg thinking' },
  { id: 'pragmatic',   file: 'pragmatic.html',    label: 'pragmatic' },
  { id: 'financials',  file: 'financials.html',   label: 'financials' },
  { id: 'summary',     file: 'summary.html',      label: 'summary' },
  { id: 'missing',     file: 'missing.html',      label: 'missing' },
  { id: 'plan',        file: 'plan.html',         label: 'plan',  disabled: true },
  { id: 'pitch',       file: 'pitch.html',        label: 'pitch', disabled: true },
];

const styleBase = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #fafafa; color: #1a1a1a; min-height: 100vh; -webkit-font-smoothing: antialiased; }
.banner { background: #fef3e2; color: #8a6a23; font-size: 12px; padding: 10px 16px; text-align: center; border-bottom: 1px solid #f0e4cc; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.banner strong { font-weight: 600; color: #6b4f15; }
.banner a { color: #6b4f15; text-decoration: underline; font-weight: 500; }
.banner a:hover { color: #1a1a1a; }
.head { padding: 32px 24px 16px; text-align: center; border-bottom: 1px solid #f0f0f0; }
.head .logo { font-size: 11px; font-weight: 400; letter-spacing: 0.12em; text-transform: lowercase; color: #999; text-decoration: none; transition: color 0.2s ease; }
.head .logo:hover { color: #1a1a1a; }
.head .company { margin-top: 10px; font-size: 18px; font-weight: 600; color: #1a1a1a; }
.head .tagline { margin-top: 4px; font-size: 12px; color: #888; font-weight: 400; }
.layout { display: grid; grid-template-columns: 180px 1fr; max-width: 960px; margin: 0 auto; padding: 32px 24px 80px; gap: 32px; }
.sidebar { display: flex; flex-direction: column; gap: 2px; position: sticky; top: 24px; align-self: start; }
.side-link { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 6px; text-decoration: none; color: #888; font-size: 13px; font-weight: 400; transition: background 0.15s ease, color 0.15s ease; }
.side-link:hover { background: #f3f3f3; color: #1a1a1a; }
.side-link.active { color: #1a1a1a; font-weight: 500; }
.side-link.active .dot { background: #1a1a1a; border-color: #1a1a1a; }
.side-link.disabled { color: #ccc; pointer-events: none; }
.side-link.disabled .dot { border-style: dashed; border-color: #ddd; }
.dot { width: 25px; height: 25px; border-radius: 50%; border: 1.5px solid #ccc; background: transparent; flex-shrink: 0; transition: all 0.15s ease; }
.side-link:hover .dot { border-color: #888; }
.content { min-width: 0; }
.page-title { font-size: 11px; font-weight: 500; color: #999; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 18px; }
.summary-text { font-size: 14px; line-height: 1.8; color: #444; font-weight: 400; }
.placeholder { font-size: 13px; line-height: 1.7; color: #888; font-style: italic; padding: 24px; background: #fff; border: 1px dashed #e0e0e0; border-radius: 8px; }
.footer { font-size: 10px; color: #ccc; letter-spacing: 0.04em; text-align: center; padding: 32px 0 16px; }

@media (max-width: 700px) {
  .layout { grid-template-columns: 1fr; gap: 16px; padding: 16px; }
  .sidebar { position: static; flex-direction: row; flex-wrap: wrap; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
  .side-link { padding: 6px 8px; font-size: 12px; }
  .side-link .dot { width: 18px; height: 18px; }
}
`;

function renderSidebar(currentId) {
  return `<nav class="sidebar">${PAGES.map((p) => {
    const cls = ['side-link'];
    if (p.id === currentId) cls.push('active');
    if (p.disabled) cls.push('disabled');
    return `<a href="${esc(p.file)}" class="${cls.join(' ')}"${p.disabled ? ' aria-disabled="true" tabindex="-1"' : ''}><span class="dot"></span><span>${esc(p.label)}</span></a>`;
  }).join('')}</nav>`;
}

function shellOpen({ company, tagline, currentId, expiresAt, downloadUrl, pageTitle }) {
  const expiresStr = new Date(expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const titleSuffix = pageTitle ? ' · ' + pageTitle : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>basher — ${esc(company)}${esc(titleSuffix)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>${styleBase}</style>
</head>
<body>
<div class="banner">
  <span>This evaluation expires <strong>${esc(expiresStr)}</strong> (10 days from creation).</span>
  <a href="${esc(downloadUrl)}" download>Download a copy</a>
</div>
<div class="head">
  <a class="logo" href="${'__HOME__'}">basher</a>
  <div class="company">${esc(company)}</div>
  ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ''}
</div>
<div class="layout">
  ${renderSidebar(currentId)}
  <main class="content">
    <div class="page-title">${esc(pageTitle || '')}</div>`;
}

function shellClose(generatedAt) {
  const dateStr = new Date(generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  return `  </main>
</div>
<div class="footer">evaluated by basher · ${esc(dateStr)}</div>
</body>
</html>`;
}

function shell(currentId, pageTitle, body, ctx, r) {
  return shellOpen({
    company: r.company_name,
    tagline: r.one_line_description,
    currentId,
    expiresAt: ctx.expiresAt,
    downloadUrl: ctx.downloadUrl,
    pageTitle,
  }).replace('__HOME__', esc(ctx.homeUrl)) + body + shellClose(ctx.createdAt);
}

const gradeColor = (g) => ({ A: '#2a9d6a', B: '#4a90d9', C: '#d4a843', D: '#d97a4a', F: '#d94a4a' }[g] || '#999');
const statusColor = (s) => ({ present: '#2a9d6a', partial: '#d4a843', absent: '#d94a4a' }[s] || '#999');
const resultColor = (r) => ({ pass: '#2a9d6a', incomplete: '#d4a843', fail: '#d94a4a' }[r] || '#999');

// ─────────────────────────────────────────────────────────────────────
// start (formerly index): summary cards
// ─────────────────────────────────────────────────────────────────────

function renderStart(r, ctx) {
  const fwk = r.frameworks;
  const pragmaticPass = r.pragmatic.filter((p) => p.result === 'pass').length;
  const finPresent = r.financials.filter((f) => f.status === 'present').length;
  const pgPass = r.pg_thinking.filter((p) => p.result === 'pass').length;

  const grades = ['bp', 'db', 'sq', 'cc', 'bg', 'sa']
    .map((k) => {
      const g = fwk[k]?.grade || '?';
      return `<span title="${esc(k.toUpperCase())}" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${gradeColor(g)};color:#fff;font-size:11px;font-weight:700;">${esc(g)}</span>`;
    })
    .join('');
  const gradesGrid = `<div style="display:grid;grid-template-columns:repeat(3, 28px);gap:6px;justify-content:center;">${grades}</div>`;

  const finList = r.financials
    .map(
      (f) =>
        `<li style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:10px;color:#666;text-align:left;"><span style="width:8px;height:8px;border-radius:50%;background:${statusColor(f.status)};flex-shrink:0;"></span>${esc(f.id)} ${esc(f.title)}</li>`,
    )
    .join('');

  const pgGrid = r.pg_thinking
    .map((p, i) => {
      const c = p.result === 'pass' ? '#2a9d6a' : '#d94a4a';
      return `<span title="${esc(p.title)}" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${c};color:#fff;font-size:9px;font-weight:600;">${i + 1}</span>`;
    })
    .join('');

  const cardStyle = 'background:#fff;border:1px solid #eee;border-radius:8px;padding:18px 22px;text-decoration:none;color:inherit;text-align:center;display:block;transition:border-color 0.2s ease, box-shadow 0.2s ease;';

  const body = `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
  <a href="frameworks.html" style="${cardStyle}">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px;">Frameworks</div>
    ${gradesGrid}
    <div style="font-size:11px;color:#aaa;margin-top:10px;">BP · DB · SQ · CC · BG · SA</div>
  </a>
  <a href="pg-thinking.html" style="${cardStyle}">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">PG Thinking</div>
    <div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">${pgPass}<span style="font-size:12px;font-weight:400;color:#999;"> / 20</span></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;justify-items:center;">${pgGrid}</div>
  </a>
  <a href="pragmatic.html" style="${cardStyle}">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">Pragmatic</div>
    <div style="font-size:24px;font-weight:700;color:#1a1a1a;">${pragmaticPass}<span style="font-size:14px;font-weight:400;color:#999;"> / 11</span></div>
    <div style="font-size:11px;color:#aaa;margin-top:8px;">threshold questions</div>
  </a>
  <a href="financials.html" style="${cardStyle}">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Financials</div>
    <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:6px;">${finPresent}<span style="font-weight:400;color:#999;"> / 12</span></div>
    <ul style="list-style:none;text-align:left;">${finList}</ul>
  </a>
</div>`;

  return shell('start', 'start', body, ctx, r);
}

// ─────────────────────────────────────────────────────────────────────
// frameworks
// ─────────────────────────────────────────────────────────────────────

function renderFrameworks(r, ctx) {
  const fwk = r.frameworks;
  const card = (title, key, body) => {
    const g = fwk[key]?.grade || '?';
    return `<div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:22px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:${gradeColor(g)};color:#fff;font-size:14px;font-weight:700;flex-shrink:0;">${esc(g)}</span>
        <div style="min-width:0;">
          <div style="font-size:10px;font-weight:600;color:#999;letter-spacing:0.08em;text-transform:uppercase;">${esc(key.toUpperCase())}</div>
          <div style="font-size:13px;font-weight:600;color:#1a1a1a;">${esc(title)}</div>
        </div>
      </div>
      <div style="font-size:12.5px;line-height:1.6;color:#555;">${esc(fwk[key]?.rationale || '')}</div>
      ${body || ''}
    </div>`;
  };

  const bpDims = (fwk.bp?.dimensions || [])
    .map((d) => `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;justify-content:space-between;"><span>${esc(d.name)} (${d.weight_pct}%)</span><span style="font-weight:600;color:#1a1a1a;">${d.score_pct}%</span></li>`)
    .join('');
  const dbCats = (fwk.db?.categories || [])
    .map((c) => `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;justify-content:space-between;"><span>${esc(c.name)}</span><span style="font-weight:600;color:#1a1a1a;">$${(c.value || 0).toLocaleString()}</span></li>`)
    .join('');
  const sqEls = (fwk.sq?.elements || [])
    .map((e) => `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${e.passed ? '#2a9d6a' : '#d94a4a'};color:#fff;font-size:10px;font-weight:700;flex-shrink:0;">${e.passed ? '✓' : '×'}</span><span style="flex:1;"><strong style="color:#1a1a1a;">${esc(e.name)}</strong> — ${esc(e.note || '')}</span></li>`)
    .join('');
  const ccEls = (fwk.cc?.elements || [])
    .map((e) => `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;align-items:flex-start;gap:8px;"><span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:2px 6px;border-radius:3px;background:${e.status === 'strong' ? '#e8f5ee' : e.status === 'adequate' ? '#fef3e2' : '#fde8e8'};color:${e.status === 'strong' ? '#2a9d6a' : e.status === 'adequate' ? '#d4a843' : '#d94a4a'};margin-top:1px;flex-shrink:0;">${esc(e.status || '?')}</span><span style="flex:1;"><strong style="color:#1a1a1a;">${esc(e.name)}</strong> — ${esc(e.note || '')}</span></li>`)
    .join('');
  const bgFactors = (fwk.bg?.factors || [])
    .map((f) => `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;justify-content:space-between;gap:10px;"><span><strong style="color:#1a1a1a;">${esc(f.name)}</strong>${f.weight && f.weight > 1 ? ` <span style="color:#999;font-size:10px;">×${f.weight}</span>` : ''} — ${esc(f.note || '')}</span><span style="font-weight:600;color:#1a1a1a;flex-shrink:0;">${f.score}/5</span></li>`)
    .join('');
  const saPrinciples = (fwk.sa?.principles || [])
    .map((p) => `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;align-items:flex-start;gap:8px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${p.passed ? '#2a9d6a' : '#d94a4a'};color:#fff;font-size:10px;font-weight:700;margin-top:1px;flex-shrink:0;">${p.passed ? '✓' : '×'}</span><span style="flex:1;"><strong style="color:#1a1a1a;">${esc(p.id || '')} ${esc(p.name)}</strong>${p.note ? ' — ' + esc(p.note) : ''}</span></li>`)
    .join('');

  const wrap = (items) => items ? `<ul style="list-style:none;margin-top:12px;border-top:1px solid #f0f0f0;padding-top:12px;">${items}</ul>` : '';

  const body = `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;">
  ${card('Bill Payne Scorecard', 'bp', wrap(bpDims))}
  ${card('Dave Berkus Method', 'db', wrap(dbCats))}
  ${card('Sequoia Elements', 'sq', wrap(sqEls))}
  ${card('Christensen JTBD / Four-Box', 'cc', wrap(ccEls))}
  ${card('Bill Gross — Five Factors (timing-weighted)', 'bg', wrap(bgFactors))}
  ${card('Sam Altman — 11 Principles', 'sa', wrap(saPrinciples))}
</div>`;

  return shell('frameworks', 'frameworks', body, ctx, r);
}

// ─────────────────────────────────────────────────────────────────────
// list pages: pragmatic / financials / pg-thinking
// ─────────────────────────────────────────────────────────────────────

function renderListPage(items, getResult, getColor, ctx, r, currentId, label, total) {
  const passes = items.filter((i) => {
    const v = getResult(i);
    return v === 'pass' || v === 'present';
  }).length;
  const rows = items
    .map((it) => {
      const result = getResult(it);
      const c = getColor(result);
      return `<div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:16px 20px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
          <span style="font-size:10px;font-weight:600;color:#ccc;letter-spacing:0.04em;min-width:24px;flex-shrink:0;">${esc(it.id)}</span>
          <span style="font-size:13px;font-weight:600;color:#1a1a1a;flex:1;">${esc(it.title)}</span>
          <span style="font-size:10px;font-weight:700;letter-spacing:0.06em;padding:3px 10px;border-radius:3px;text-transform:uppercase;background:${c}22;color:${c};flex-shrink:0;">${esc(result)}</span>
        </div>
        <div style="font-size:12.5px;line-height:1.6;color:#666;margin-left:36px;">${esc(it.justification || '')}</div>
      </div>`;
    })
    .join('');

  const body = `
<div style="font-size:32px;font-weight:700;color:#1a1a1a;margin-bottom:18px;">${passes}<span style="font-size:18px;font-weight:400;color:#999;"> / ${total}</span></div>
${rows}`;
  return shell(currentId, label, body, ctx, r);
}

const renderPragmatic   = (r, ctx) => renderListPage(r.pragmatic,   (i) => i.result, resultColor, ctx, r, 'pragmatic',   'pragmatic',    11);
const renderFinancials  = (r, ctx) => renderListPage(r.financials,  (i) => i.status, statusColor, ctx, r, 'financials',  'financials',   12);
const renderPgThinking  = (r, ctx) => renderListPage(r.pg_thinking, (i) => i.result, resultColor, ctx, r, 'pg-thinking', 'pg thinking',  20);

// ─────────────────────────────────────────────────────────────────────
// summary (executive)
// ─────────────────────────────────────────────────────────────────────

function renderSummary(r, ctx) {
  const body = `<p class="summary-text">${esc(r.executive_summary || '(no summary)')}</p>`;
  return shell('summary', 'summary', body, ctx, r);
}

// ─────────────────────────────────────────────────────────────────────
// missing
// ─────────────────────────────────────────────────────────────────────

function renderMissing(r, ctx) {
  const items = r.missing_information || [];
  const body = items.length
    ? `<ul style="list-style:none;">${items.map((m) => `<li style="font-size:13px;line-height:1.7;color:#555;padding:10px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:10px;font-weight:600;color:#999;letter-spacing:0.04em;margin-right:8px;">${esc(m.tag)}</span>${esc(m.text)}</li>`).join('')}</ul>`
    : `<div class="placeholder">No gaps flagged — the plan addressed every checkpoint Claude looked for.</div>`;
  return shell('missing', 'missing', body, ctx, r);
}

// ─────────────────────────────────────────────────────────────────────
// plan / pitch placeholders
// ─────────────────────────────────────────────────────────────────────

function renderPlan(r, ctx) {
  const body = `<div class="placeholder">Once your evaluation is solid (frameworks, pragmatic, financials all clearing the bar), basher will draft a one-page working business plan here. Coming soon.</div>`;
  return shell('plan', 'plan', body, ctx, r);
}

function renderPitch(r, ctx) {
  const body = `<div class="placeholder">After the plan stabilizes, basher will assemble a 10-slide pitch deck draft from your evaluation. Coming soon.</div>`;
  return shell('pitch', 'pitch', body, ctx, r);
}

export function renderAll(result, ctx) {
  return {
    'index.html':       renderStart(result, ctx),
    'frameworks.html':  renderFrameworks(result, ctx),
    'pragmatic.html':   renderPragmatic(result, ctx),
    'financials.html':  renderFinancials(result, ctx),
    'pg-thinking.html': renderPgThinking(result, ctx),
    'summary.html':     renderSummary(result, ctx),
    'missing.html':     renderMissing(result, ctx),
    'plan.html':        renderPlan(result, ctx),
    'pitch.html':       renderPitch(result, ctx),
  };
}
