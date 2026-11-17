import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const tokens = await readFile(new URL('../css/tokens.css', import.meta.url), 'utf8');
const caseCss = await readFile(new URL('../css/case-study.css', import.meta.url), 'utf8');

const tones = {
  skyfire: '#b4471a',
  maistra: '#1f5f70',
  'bulk-buying-companion': '#4a7330',
  pulso: '#2f5c94',
  sige: '#946320',
};

function luminance(hex) {
  const [r, g, b] = hex.match(/\w\w/g).map(part => parseInt(part, 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const block = selector => {
  const start = tokens.indexOf(selector);
  assert.ok(start >= 0, `${selector} exists`);
  return tokens.slice(start, tokens.indexOf('}', start));
};
const value = (css, name) => css.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]?.toLowerCase();

test('every project has its own tone that keeps cream text readable', () => {
  const root = block(':root {');
  assert.equal(value(root, '--on-tone'), '#fbf3ee');
  for (const [slug, hex] of Object.entries(tones)) {
    assert.equal(value(root, `--tone-${slug}`), hex, `${slug} tone`);
    assert.match(root, new RegExp(`--glow-${slug}:\\s*rgba\\(`), `${slug} glow`);
    assert.ok(contrast(hex, '#fbf3ee') >= 4.5, `${slug} contrast ${contrast(hex, '#fbf3ee').toFixed(2)}`);
  }
});

test('wine bands exist in light and in both dark-mode blocks while the hero keeps its colors', () => {
  assert.equal(value(block(':root {'), '--wine'), '#3a1320');
  assert.equal(value(block(':root[data-theme="dark"] {'), '--wine'), '#22101a');
  assert.equal(value(block(':root:not([data-theme]) {'), '--wine'), '#22101a');
  assert.equal(value(block(':root {'), '--hero-background'), '#e5e0da');
  assert.equal(value(block(':root[data-theme="dark"] {'), '--hero-background'), '#482b37');
});

test('the page uses warm cream in light mode and plum black in dark mode', () => {
  assert.equal(value(block(':root {'), '--field-1'), '#f4eee8');
  assert.equal(value(block(':root {'), '--color-contact'), '#6e2439');
  for (const dark of [':root[data-theme="dark"] {', ':root:not([data-theme]) {']) {
    assert.equal(value(block(dark), '--field-1'), '#141015');
    assert.equal(value(block(dark), '--color-contact'), '#3d1524');
  }
});

test('each case study uses its own project color as the accent', () => {
  for (const slug of Object.keys(tones)) {
    const rule = caseCss.match(new RegExp(`\\.case-page--${slug}\\s*\\{([^}]*)\\}`))?.[1];
    assert.ok(rule, `${slug} case accent`);
    assert.match(rule, new RegExp(`--accent:\\s*var\\(--tone-${slug}\\)`));
  }
});

test('keyboard focus stays visible on the dark project and contact bands', async () => {
  const home = await readFile(new URL('../css/home.css', import.meta.url), 'utf8');
  const rule = home.match(/\[data-surface="dark"\]\s*\{([^}]*)\}/)?.[1];
  assert.ok(rule, 'dark surfaces define their own focus color');
  assert.match(rule, /--color-focus:\s*var\(--on-tone\)/);
});
