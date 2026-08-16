import fs from 'node:fs';
import path from 'node:path';

const assetsDir = path.join(process.cwd(), 'dist', 'assets');
const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js')) : [];
const total = files.reduce((sum, f) => sum + fs.statSync(path.join(assetsDir, f)).size, 0);
const BUDGET = 700_000; // raw JS bytes across all client chunks; raise only with deliberate additions

console.log(`Client JS bundle: ${(total / 1024).toFixed(1)} KiB (budget ${(BUDGET / 1024).toFixed(0)} KiB, ${files.length} chunk(s))`);
if (total > BUDGET) {
  console.error(`Bundle budget exceeded: ${total} bytes > ${BUDGET} bytes. Lazy-load or prune before merging.`);
  process.exit(1);
}
