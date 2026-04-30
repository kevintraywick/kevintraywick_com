import { promises as fs } from 'node:fs';
import path from 'node:path';

export const DATA_DIR = path.resolve(process.env.BASHER_DATA_DIR || '/app/data');
export const RETENTION_DAYS = Number(process.env.BASHER_RETENTION_DAYS || 10);
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export function reportDir(slug) {
  const safe = slug.replace(/[^a-z0-9-]/gi, '');
  if (!safe) throw new Error('invalid slug');
  return path.join(DATA_DIR, safe);
}

export async function uniqueSlug(baseSlug) {
  let slug = baseSlug;
  let n = 0;
  while (true) {
    try {
      await fs.access(reportDir(slug));
      n += 1;
      slug = `${baseSlug}-${n}`;
    } catch {
      return slug;
    }
  }
}

export async function writeReport(slug, files, meta) {
  const dir = reportDir(slug);
  await fs.mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await fs.writeFile(path.join(dir, name), content, 'utf8');
  }
  await fs.writeFile(
    path.join(dir, 'meta.json'),
    JSON.stringify(meta, null, 2),
    'utf8',
  );
}

export async function readReportMeta(slug) {
  const file = path.join(reportDir(slug), 'meta.json');
  const data = await fs.readFile(file, 'utf8');
  return JSON.parse(data);
}

export async function listReports() {
  await ensureDataDir();
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  const reports = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    try {
      const meta = await readReportMeta(e.name);
      reports.push({ slug: e.name, ...meta });
    } catch {
      // skip dirs without valid meta
    }
  }
  reports.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  return reports;
}

export function expirationFor(createdAtMs) {
  return createdAtMs + RETENTION_MS;
}
