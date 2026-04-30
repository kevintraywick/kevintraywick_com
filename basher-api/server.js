import express from 'express';
import cors from 'cors';
import multer from 'multer';
import archiver from 'archiver';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { extractText } from './lib/extract.js';
import { evaluatePlan } from './lib/evaluate.js';
import { renderAll } from './lib/render.js';
import {
  ensureDataDir,
  reportDir,
  uniqueSlug,
  writeReport,
  readReportMeta,
  listReports,
  expirationFor,
  RETENTION_DAYS,
} from './lib/storage.js';
import { startSweeper } from './lib/cleanup.js';

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const HOME_URL = process.env.BASHER_HOME_URL || 'https://kevintraywick.com/basher/';

const app = express();
app.set('strict routing', true);
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || '*').split(',').map((s) => s.trim()),
  }),
);
app.use(express.json({ limit: '1mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function buildCtx(slug, createdAt) {
  return {
    slug,
    createdAt,
    expiresAt: expirationFor(createdAt),
    downloadUrl: `${PUBLIC_BASE_URL}/r/${slug}/download`,
    homeUrl: HOME_URL,
  };
}

app.get('/health', (_req, res) => res.json({ ok: true, retention_days: RETENTION_DAYS }));

app.get('/reports', async (_req, res) => {
  try {
    const reports = await listReports();
    res.json({
      retention_days: RETENTION_DAYS,
      reports: reports.map((r) => ({
        slug: r.slug,
        company_name: r.company_name,
        one_line_description: r.one_line_description,
        created_at: r.created_at,
        expires_at: r.expires_at,
        url: `${PUBLIC_BASE_URL}/r/${r.slug}/`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/evaluate', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file uploaded (field: file)' });
  try {
    const text = await extractText({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
    });

    const evalResult = await evaluatePlan(text);
    const slug = await uniqueSlug(evalResult.slug);
    evalResult.slug = slug;
    const createdAt = Date.now();
    const ctx = buildCtx(slug, createdAt);
    const files = renderAll(evalResult, ctx);

    const meta = {
      company_name: evalResult.company_name,
      one_line_description: evalResult.one_line_description,
      created_at: createdAt,
      expires_at: ctx.expiresAt,
      source_filename: req.file.originalname,
    };
    await writeReport(slug, files, meta);
    await fs.writeFile(path.join(reportDir(slug), 'result.json'), JSON.stringify(evalResult, null, 2), 'utf8');

    res.json({
      slug,
      company_name: evalResult.company_name,
      url: `${PUBLIC_BASE_URL}/r/${slug}/`,
      download_url: ctx.downloadUrl,
      expires_at: ctx.expiresAt,
      retention_days: RETENTION_DAYS,
    });
  } catch (err) {
    console.error('[evaluate]', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/r/:slug/download', async (req, res) => {
  const { slug } = req.params;
  let dir;
  let meta;
  try {
    dir = reportDir(slug);
    meta = await readReportMeta(slug);
  } catch {
    return res.status(404).json({ error: 'report not found' });
  }
  const safeName = (meta.company_name || slug).replace(/[^a-z0-9-]+/gi, '-').toLowerCase() || slug;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="basher-${safeName}.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => res.status(500).end(err.message));
  archive.pipe(res);
  archive.directory(dir, safeName);
  await archive.finalize();
});

app.get('/r/:slug', (req, res) => res.redirect(301, `/r/${req.params.slug}/`));

app.get('/r/:slug/', async (req, res) => {
  try {
    await readReportMeta(req.params.slug);
  } catch {
    return res.status(404).send('report not found or expired');
  }
  res.sendFile(path.join(reportDir(req.params.slug), 'index.html'));
});

app.get('/r/:slug/:file', async (req, res) => {
  const { slug, file } = req.params;
  if (!/^[a-z0-9-]+\.(html|json)$/i.test(file)) return res.status(400).send('bad path');
  try {
    await readReportMeta(slug);
  } catch {
    return res.status(404).send('report not found or expired');
  }
  res.sendFile(path.join(reportDir(slug), file));
});

app.get('/', (_req, res) => {
  res.json({
    service: 'basher-api',
    retention_days: RETENTION_DAYS,
    endpoints: {
      'POST /evaluate': 'upload a business plan (multipart, field: file)',
      'GET /reports': 'list active evaluations',
      'GET /r/:slug/': 'view report',
      'GET /r/:slug/download': 'download zipped report',
      'GET /health': 'health check',
    },
  });
});

await ensureDataDir();
startSweeper();

app.listen(PORT, () => {
  console.log(`basher-api listening on ${PORT} (retention: ${RETENTION_DAYS}d)`);
});
