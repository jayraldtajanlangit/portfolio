import { readFile, writeFile } from 'node:fs/promises';
const path = 'scripts/render-home.mjs';
const source = await readFile(path, 'utf8');
const updated = source.replace(/  <dialog class="startup"[\s\S]*?<\/dialog>/, '  ${renderStartup()}');
if (source === updated) throw new Error('Startup markup was not found');
await writeFile(path, updated);
