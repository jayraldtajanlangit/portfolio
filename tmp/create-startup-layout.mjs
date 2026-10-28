import { writeFile } from 'node:fs/promises';
import { renderStartupPreview } from '../scripts/render-startup-preview.mjs';
await writeFile(new URL('./startup-layout.html', import.meta.url), renderStartupPreview());
