const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const styleBase = `
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #fafafa; color: #1a1a1a; min-height: 100vh; -webkit-font-smoothing: antialiased; }
.banner { background: #fef3e2; color: #8a6a23; font-size: 12px; padding: 10px 16px; text-align: center; border-bottom: 1px solid #f0e4cc; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.banner strong { font-weight: 600; color: #6b4f15; }
.banner a { color: #6b4f15; text-decoration: underline; font-weight: 500; }
.banner a:hover { color: #1a1a1a; }
.header { padding: 32px 0 12px; text-align: center; }
.header a { font-size: 11px; font-weight: 400; letter-spacing: 0.12em; text-transform: lowercase; color: #999; text-decoration: none; transition: color 0.2s ease; }
.header a:hover { color: #1a1a1a; }
.nav { text-align: center; margin-top: 8px; }
.nav a { font-size: 13px; color: #888; text-decoration: none; font-weight: 500; transition: color 0.2s; }
.nav a:hover { color: #1a1a1a; }
.company-name { margin-top: 12px; font-size: 20px; font-weight: 600; color: #1a1a1a; text-align: center; }
.company-tagline { margin-top: 6px; font-size: 13px; color: #888; text-align: center; font-weight: 400; }
.page-title { margin-top: 8px; font-size: 13px; color: #999; text-align: center; font-weight: 400; letter-spacing: 0.02em; }
.section { max-width: 760px; margin: 0 auto; padding: 32px 24px 0; }
.section-title { font-size: 11px; font-weight: 500; color: #999; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
.summary { font-size: 14px; line-height: 1.8; color: #444; font-weight: 400; }
.footer { max-width: 760px; margin: 0 auto; padding: 48px 24px 32px; font-size: 10px; color: #ccc; letter-spacing: 0.04em; text-align: center; }
`;

function shellOpen({ company, title, expiresAt, downloadUrl }) {
  const expiresStr = new Date(expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>basher — ${esc(company)}${title ? ' · ' + esc(title) : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>${styleBase}</style>
</head>
<body>
<div class="banner">
  <span>This evaluation expires <strong>${esc(expiresStr)}</strong> (10 days from creation).</span>
  <a href="${esc(downloadUrl)}" download>Download a copy</a>
</div>`;
}

function shellClose(generatedAt) {
  const dateStr = new Date(generatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `<div class="footer">evaluated by basher · ${esc(dateStr)}</div></body></html>`;
}

const gradeColor = (g) => ({ A: '#2a9d6a', B: '#4a90d9', C: '#d4a843', D: '#d97a4a', F: '#d94a4a' }[g] || '#999');
const statusColor = (s) => ({ present: '#2a9d6a', partial: '#d4a843', absent: '#d94a4a' }[s] || '#999');
const resultColor = (r) => ({ pass: '#2a9d6a', incomplete: '#d4a843', fail: '#d94a4a' }[r] || '#999');

function renderIndex(r, ctx) {
  const fwk = r.frameworks;
  const pragmaticPass = r.pragmatic.filter((p) => p.result === 'pass').length;
  const finPresent = r.financials.filter((f) => f.status === 'present').length;
  const pgPass = r.pg_thinking.filter((p) => p.result === 'pass').length;

  const grades = ['bp', 'db', 'sq', 'cc']
    .map((k) => {
      const g = fwk[k]?.grade || '?';
      return `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${gradeColor(g)};color:#fff;font-size:11px;font-weight:700;margin:0 3px;">${esc(g)}</span>`;
    })
    .join('');

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

  const missing = (r.missing_information || [])
    .map(
      (m) =>
        `<li style="font-size:13px;line-height:1.7;color:#555;padding:8px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:10px;font-weight:600;color:#999;letter-spacing:0.04em;margin-right:8px;">${esc(m.tag)}</span>${esc(m.text)}</li>`,
    )
    .join('') || '<li style="font-size:13px;color:#888;padding:8px 0;">None flagged.</li>';

  return `${shellOpen({ company: r.company_name, title: '', slug: ctx.slug, expiresAt: ctx.expiresAt, downloadUrl: ctx.downloadUrl })}
<div class="header"><a href="${esc(ctx.homeUrl)}">basher</a></div>
<div class="company-name">${esc(r.company_name)}</div>
<div class="company-tagline">${esc(r.one_line_description || '')}</div>

<div style="max-width:760px;margin:32px auto 0;padding:0 24px;display:flex;flex-wrap:wrap;align-items:stretch;justify-content:center;gap:12px;">
  <a href="frameworks.html" style="background:#fff;border:1px solid #eee;border-radius:8px;padding:18px 22px;text-decoration:none;color:inherit;min-width:180px;text-align:center;flex:1;max-width:220px;">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">Frameworks</div>
    <div>${grades}</div>
    <div style="font-size:11px;color:#aaa;margin-top:8px;">BP · DB · SQ · CC</div>
  </a>
  <a href="pragmatic.html" style="background:#fff;border:1px solid #eee;border-radius:8px;padding:18px 22px;text-decoration:none;color:inherit;min-width:140px;text-align:center;flex:1;max-width:180px;">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">Pragmatic</div>
    <div style="font-size:24px;font-weight:700;color:#1a1a1a;">${pragmaticPass}<span style="font-size:14px;font-weight:400;color:#999;"> / 11</span></div>
    <div style="font-size:11px;color:#aaa;margin-top:8px;">threshold questions</div>
  </a>
  <a href="financials.html" style="background:#fff;border:1px solid #eee;border-radius:8px;padding:18px 22px;text-decoration:none;color:inherit;min-width:200px;text-align:center;flex:1;max-width:240px;">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Financials</div>
    <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:6px;">${finPresent}<span style="font-weight:400;color:#999;"> / 12</span></div>
    <ul style="list-style:none;text-align:left;">${finList}</ul>
  </a>
  <a href="pg-thinking.html" style="background:#fff;border:1px solid #eee;border-radius:8px;padding:18px 22px;text-decoration:none;color:inherit;min-width:160px;text-align:center;flex:1;max-width:200px;">
    <div style="font-size:10px;font-weight:500;color:#999;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">PG Thinking</div>
    <div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">${pgPass}<span style="font-size:12px;font-weight:400;color:#999;"> / 20</span></div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;justify-items:center;">${pgGrid}</div>
  </a>
</div>

<div class="section">
  <div class="section-title">Executive Summary</div>
  <p class="summary">${esc(r.executive_summary || '')}</p>
</div>

<div class="section">
  <div class="section-title">Missing Information</div>
  <ul style="list-style:none;">${missing}</ul>
</div>

${shellClose(ctx.createdAt)}`;
}

function renderFrameworks(r, ctx) {
  const fwk = r.frameworks;
  const card = (title, key, body) => {
    const g = fwk[key]?.grade || '?';
    return `<div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:24px;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${gradeColor(g)};color:#fff;font-size:16px;font-weight:700;">${esc(g)}</span>
        <div>
          <div style="font-size:11px;font-weight:600;color:#999;letter-spacing:0.08em;text-transform:uppercase;">${esc(key.toUpperCase())}</div>
          <div style="font-size:14px;font-weight:600;color:#1a1a1a;">${esc(title)}</div>
        </div>
      </div>
      <div style="font-size:13px;line-height:1.7;color:#555;">${esc(fwk[key]?.rationale || '')}</div>
      ${body || ''}
    </div>`;
  };

  const bpDims = (fwk.bp?.dimensions || [])
    .map(
      (d) =>
        `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;justify-content:space-between;"><span>${esc(d.name)} (${d.weight_pct}%)</span><span style="font-weight:600;color:#1a1a1a;">${d.score_pct}%</span></li>`,
    )
    .join('');
  const dbCats = (fwk.db?.categories || [])
    .map(
      (c) =>
        `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;justify-content:space-between;"><span>${esc(c.name)}</span><span style="font-weight:600;color:#1a1a1a;">$${(c.value || 0).toLocaleString()}</span></li>`,
    )
    .join('');
  const sqEls = (fwk.sq?.elements || [])
    .map(
      (e) =>
        `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;align-items:center;gap:8px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:${e.passed ? '#2a9d6a' : '#d94a4a'};color:#fff;font-size:10px;font-weight:700;">${e.passed ? '✓' : '×'}</span><span style="flex:1;"><strong style="color:#1a1a1a;">${esc(e.name)}</strong> — ${esc(e.note || '')}</span></li>`,
    )
    .join('');
  const ccEls = (fwk.cc?.elements || [])
    .map(
      (e) =>
        `<li style="font-size:12px;color:#666;padding:4px 0;display:flex;align-items:flex-start;gap:8px;"><span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;padding:2px 6px;border-radius:3px;background:${e.status === 'strong' ? '#e8f5ee' : e.status === 'adequate' ? '#fef3e2' : '#fde8e8'};color:${e.status === 'strong' ? '#2a9d6a' : e.status === 'adequate' ? '#d4a843' : '#d94a4a'};margin-top:1px;">${esc(e.status || '?')}</span><span style="flex:1;"><strong style="color:#1a1a1a;">${esc(e.name)}</strong> — ${esc(e.note || '')}</span></li>`,
    )
    .join('');

  return `${shellOpen({ company: r.company_name, title: 'frameworks', slug: ctx.slug, expiresAt: ctx.expiresAt, downloadUrl: ctx.downloadUrl })}
<div class="header"><a href="${esc(ctx.homeUrl)}">basher</a></div>
<div class="nav"><a href="index.html">${esc(r.company_name)}</a></div>
<div class="page-title">frameworks</div>

<div style="max-width:760px;margin:32px auto 0;padding:0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
  ${card('Bill Payne Scorecard', 'bp', bpDims ? `<ul style="list-style:none;margin-top:12px;border-top:1px solid #f0f0f0;padding-top:12px;">${bpDims}</ul>` : '')}
  ${card('Dave Berkus Method', 'db', dbCats ? `<ul style="list-style:none;margin-top:12px;border-top:1px solid #f0f0f0;padding-top:12px;">${dbCats}</ul>` : '')}
  ${card('Sequoia Elements', 'sq', sqEls ? `<ul style="list-style:none;margin-top:12px;border-top:1px solid #f0f0f0;padding-top:12px;">${sqEls}</ul>` : '')}
  ${card('Christensen JTBD / Four-Box', 'cc', ccEls ? `<ul style="list-style:none;margin-top:12px;border-top:1px solid #f0f0f0;padding-top:12px;">${ccEls}</ul>` : '')}
</div>

${shellClose(ctx.createdAt)}`;
}

function renderList(items, getResult, getColor, ctx, r, title, total) {
  const passes = items.filter((i) => getResult(i) === 'pass' || getResult(i) === 'present').length;
  const rows = items
    .map((it) => {
      const result = getResult(it);
      const c = getColor(result);
      return `<div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:18px 22px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
        <span style="font-size:10px;font-weight:600;color:#ccc;letter-spacing:0.04em;min-width:24px;">${esc(it.id)}</span>
        <span style="font-size:13px;font-weight:600;color:#1a1a1a;flex:1;">${esc(it.title)}</span>
        <span style="font-size:10px;font-weight:700;letter-spacing:0.06em;padding:3px 10px;border-radius:3px;text-transform:uppercase;background:${c}22;color:${c};">${esc(result)}</span>
      </div>
      <div style="font-size:12.5px;line-height:1.6;color:#666;margin-left:36px;">${esc(it.justification || '')}</div>
    </div>`;
    })
    .join('');

  return `${shellOpen({ company: r.company_name, title, slug: ctx.slug, expiresAt: ctx.expiresAt, downloadUrl: ctx.downloadUrl })}
<div class="header"><a href="${esc(ctx.homeUrl)}">basher</a></div>
<div class="nav"><a href="index.html">${esc(r.company_name)}</a></div>
<div class="page-title">${esc(title)}</div>
<div style="text-align:center;margin-top:24px;font-size:32px;font-weight:700;color:#1a1a1a;">${passes}<span style="font-size:18px;font-weight:400;color:#999;"> / ${total}</span></div>

<div style="max-width:640px;margin:32px auto 0;padding:0 24px 60px;">
  ${rows}
</div>

${shellClose(ctx.createdAt)}`;
}

function renderPragmatic(r, ctx) {
  return renderList(
    r.pragmatic,
    (it) => it.result,
    (s) => resultColor(s),
    ctx,
    r,
    'pragmatic review',
    11,
  );
}

function renderFinancials(r, ctx) {
  return renderList(
    r.financials,
    (it) => it.status,
    (s) => statusColor(s),
    ctx,
    r,
    'financials',
    12,
  );
}

function renderPgThinking(r, ctx) {
  return renderList(
    r.pg_thinking,
    (it) => it.result,
    (s) => resultColor(s),
    ctx,
    r,
    'pg thinking',
    20,
  );
}

export function renderAll(result, ctx) {
  return {
    'index.html': renderIndex(result, ctx),
    'frameworks.html': renderFrameworks(result, ctx),
    'pragmatic.html': renderPragmatic(result, ctx),
    'financials.html': renderFinancials(result, ctx),
    'pg-thinking.html': renderPgThinking(result, ctx),
  };
}
