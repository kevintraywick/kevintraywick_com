import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, RETENTION_MS, ensureDataDir } from './storage.js';

const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

export async function sweepExpired() {
  await ensureDataDir();
  const now = Date.now();
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  let removed = 0;
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(DATA_DIR, e.name);
    try {
      const meta = JSON.parse(await fs.readFile(path.join(dir, 'meta.json'), 'utf8'));
      if (now - (meta.created_at || 0) > RETENTION_MS) {
        await fs.rm(dir, { recursive: true, force: true });
        removed += 1;
      }
    } catch {
      // dir without meta — leave alone
    }
  }
  return removed;
}

export function startSweeper() {
  sweepExpired().then((n) => {
    if (n > 0) console.log(`[cleanup] removed ${n} expired report(s)`);
  }).catch((err) => console.error('[cleanup] initial sweep failed:', err));

  setInterval(() => {
    sweepExpired().then((n) => {
      if (n > 0) console.log(`[cleanup] removed ${n} expired report(s)`);
    }).catch((err) => console.error('[cleanup] sweep failed:', err));
  }, SWEEP_INTERVAL_MS);
}
