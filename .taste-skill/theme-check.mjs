import { Browser } from 'file:///C:/Users/Jayrald/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { writeFile } from 'node:fs/promises';

const luminance = (hex) => {
  const values = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
};
const pairs = [
  ['Body text', '#232b28', '#f8f8f4'],
  ['Secondary text on sage', '#424c45', '#e9eee7'],
  ['Button label', '#ffffff', '#176455'],
  ['Teal heading', '#176455', '#f8f8f4'],
  ['Inverse text', '#f8f8f4', '#183d35'],
  ['Inverse hover link', '#c7e7d8', '#183d35'],
];
const results = pairs.map(([name, foreground, background]) => {
  const a = luminance(foreground), b = luminance(background);
  const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  return { name, foreground, background, ratio: Number(ratio.toFixed(2)), pass: ratio >= 4.5 };
});
if (results.some(result => !result.pass)) process.exitCode = 1;
const browser = await Browser.launch();
try {
  const page = await browser.newPage();
  for (const [slug, width] of [['maistra', 1440], ['sige', 390]]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(`http://127.0.0.1:8765/projects/${slug}.html`, { timeoutMs: 10000, settleMs: 300 });
    await page.eval(async () => { for (const img of document.images) img.loading = 'eager'; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
    await page.screenshot({ path: `.taste-skill/theme-final/${slug}-${width}.jpg`, fullPage: true });
  }
} finally { await browser.close(); }
await writeFile('.taste-skill/theme-final/contrast.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
