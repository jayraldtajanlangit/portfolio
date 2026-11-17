import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../js/projects.js';

const module = await import('../scripts/render-selected-work.mjs').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

test('selected work links resolve from both the homepage and nested portrait preview', () => {
  assert.equal(typeof module.renderSelectedWork, 'function');
  for (const prefix of ['', '../../']) {
    const html = module.renderSelectedWork(prefix);
    for (const slug of ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']) {
      assert.ok(html.includes(`href="${prefix}projects/${slug}.html"`));
      assert.ok(html.includes(`poster="${prefix}assets/images/projects/${slug}/`));
      const portrait = ['bulk-buying-companion', 'pulso', 'sige'].includes(slug);
      const homeClip = slug === 'pulso' ? 'pulso-home' : null;
      assert.ok(html.includes(`src="${prefix}assets/videos/${homeClip ?? slug + (portrait ? '-polished' : '')}.webm"`));
      assert.ok(html.includes(`src="${prefix}assets/videos/${homeClip ?? slug + '-polished'}.mp4"`));
      assert.ok(html.includes(`href="${prefix}assets/videos/${slug}-polished.mp4"`), 'the fallback opens the full walkthrough');
      assert.ok(html.includes(`id="project-${slug}"`));
    }
    assert.ok(html.includes(`src="${prefix}assets/videos/maistra.webm"`));
    assert.doesNotMatch(html, /(?:href|src)="(?:null|undefined)/);
  }
});

test('all five projects have full previews and Sige identifies the demonstrated prototype', () => {
  const html = module.renderSelectedWork();
  assert.equal([...html.matchAll(/data-walkthrough-preview/g)].length, 5);
  const sige = html.slice(html.indexOf('id="project-sige"'));
  assert.match(sige, /Tasks UI prototype/);
  assert.equal(sige.split('Tasks and Insights are UI prototypes').length - 1, 1, 'the prototype note is said once');
  assert.doesNotMatch(html, /selected-project-disclosure/);
  assert.match(sige, /My work:/);
});

test('the Pulso preview opens on its feed, and its clip is a turned version of the full walkthrough', async () => {
  const { stat } = await import('node:fs/promises');
  const pulso = module.renderSelectedWork().match(/<article[^>]*id="project-pulso"[\s\S]*?<\/article>/)[0];
  const player = pulso.match(/<video\b[^>]*>/)[0];
  assert.match(player, /poster="assets\/images\/projects\/pulso\/poster-home\.webp"/);
  assert.match(pulso, /<source src="assets\/videos\/pulso-home\.mp4" type="video\/mp4"><source src="assets\/videos\/pulso-home\.webm" type="video\/webm">/);
  for (const file of ['assets/videos/pulso-home.mp4', 'assets/videos/pulso-home.webm', 'assets/images/projects/pulso/poster-home.webp']) {
    assert.ok((await stat(new URL(`../${file}`, import.meta.url))).size > 0, `${file} exists`);
  }
  const { homeClips } = await import('../scripts/render-home-previews.mjs');
  assert.deepEqual(homeClips, { pulso: 6.6 }, 'Pulso starts at its feed, after signing in');
});

test('all five homepage previews loop automatically without playback bars', () => {
  const players = [...module.renderSelectedWork().matchAll(/<video\b[^>]*>/g)].map(match => match[0]);
  assert.equal(players.length, 5);
  for (const player of players) {
    assert.match(player, /\bautoplay\b/);
    assert.match(player, /\bmuted\b/);
    assert.match(player, /\bloop\b/);
    assert.match(player, /\bplaysinline\b/);
    assert.doesNotMatch(player, /\bcontrols\b/);
  }
});

test('selected work keeps contributions and case studies without repository actions', () => {
  assert.equal(typeof module.renderSelectedWork, 'function');
  const html = module.renderSelectedWork();
  const skyfire = html.slice(html.indexOf('id="project-skyfire"'), html.indexOf('id="project-maistra"'));
  assert.match(skyfire, /Individual project/);
  assert.match(skyfire, /backend seat validation/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\//);
  assert.doesNotMatch(html, />Source code<|>Private source<|>Team source not public</);
  assert.equal([...html.matchAll(/>View project /g)].length, 5);
});

test('every project leads with its title and keeps ownership and all technologies available', () => {
  const html = module.renderSelectedWork();
  for (const project of projects) {
    const article = html.match(new RegExp(`<article[^>]*id="project-${project.slug}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(article, `${project.slug} card exists`);
    const role = article.indexOf('class="selected-project-role"');
    assert.ok(role >= 0 && role > article.indexOf('<h3'), `${project.slug} ownership follows its title`);
    assert.match(article, /<ul class="selected-project-stack" aria-label="[^"]+ technologies">/);
    const chips = [...article.matchAll(/<li class="selected-project-chip">([^<]+)<\/li>/g)].map(match => match[1]);
    const more = article.match(/<li class="selected-project-chip selected-project-chip--more" title="([^"]+)"><span aria-hidden="true">\+(\d) more<\/span><span class="visually-hidden">([^<]+)<\/span><\/li>/);
    if (project.technologies.length <= 6) {
      assert.deepEqual(chips, project.technologies);
      assert.equal(more, null);
      continue;
    }
    assert.equal(chips.length, 6, `${project.slug} shows its six key technologies`);
    assert.ok(more, `${project.slug} folds the rest into one chip`);
    const rest = more[3].split(', ');
    assert.equal(more[1], more[3]);
    assert.equal(Number(more[2]), rest.length);
    assert.deepEqual([...chips, ...rest].sort(), [...project.technologies].sort(), 'every technology is still named');
  }
  const maistra = html.match(/<article[^>]*id="project-maistra"[\s\S]*?<\/article>/)[0];
  assert.deepEqual([...maistra.matchAll(/<li class="selected-project-chip">([^<]+)<\/li>/g)].map(match => match[1]), ['Angular 21', 'TypeScript', 'Supabase', 'Judge0', 'PaddleOCR', 'Flutter'], 'mAIstra leads with the parts Jayrald built and its OCR');
});

test('mobile previews fan two more app screens behind the playing phone', () => {
  const html = module.renderSelectedWork();
  for (const project of projects) {
    const article = html.match(new RegExp(`<article[^>]*id="project-${project.slug}"[\\s\\S]*?<\\/article>`))[0];
    const fan = article.match(/<div class="selected-project-fan" aria-hidden="true">([\s\S]*?)<\/div><div class="phone-frame"[^>]*><span class="phone-frame-buttons" aria-hidden="true"><\/span><div class="phone-frame-screen"><video/);
    if (project.media.orientation !== 'portrait') {
      assert.doesNotMatch(article, /selected-project-fan/, `${project.slug} keeps one browser preview`);
      continue;
    }
    assert.ok(fan, `${project.slug} fans its screens inside the preview, behind the playing phone`);
    const images = [...fan[1].matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
    assert.equal(images.length, 2);
    assert.deepEqual(images.map(image => image.match(/src="([^"]+)"/)[1]), [2, 3].map(n => `assets/images/projects/${project.slug}/still-0${n}.webp`));
    for (const image of images) {
      assert.match(image, /alt=""/);
      assert.match(image, /loading="lazy"/);
      assert.match(image, new RegExp(`width="${project.media.width}" height="${project.media.height}"`));
    }
    assert.equal([...fan[1].matchAll(/class="selected-project-fan-phone"/g)].length, 2);
  }
});

test('each project is signed with its name, huge and faint, beside a soft glow behind the media', async () => {
  const html = module.renderSelectedWork();
  for (const project of projects) {
    const title = project.title.split(' — ')[0];
    const article = html.match(new RegExp(`<article[^>]*id="project-${project.slug}"[^>]*>\\s*<span class="selected-project-ghost" aria-hidden="true">([^<]+)</span>\\s*<figure`));
    assert.ok(article, `${project.slug} opens with its decorative name`);
    assert.equal(article[1], title);
  }
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../css/selected-work.css', import.meta.url), 'utf8');
  assert.match(css, /\.home-page \.work-section \{[^}]*overflow-x: clip/, 'names and fans never widen the page');
  assert.match(css, /\.selected-project::before \{[^}]*var\(--glow\)/, 'the glow takes the project color');
  assert.match(css, /\.selected-project-ghost \{[^}]*pointer-events: none/);
  assert.match(css, /\.selected-project-fan \{[^}]*pointer-events: none/);
  assert.match(css, /@media \(max-width: 900px\) \{[^@]*\.selected-project-ghost \{ display: none; \}/, 'one-column layouts drop the name, which would sit behind the text');
});

test('homepage previews use one media surface and a clear project link', async () => {
  const html = module.renderSelectedWork();
  assert.doesNotMatch(html, /project-browser|project-preview-bar|selected-project-number|selected-project-steps/);
  assert.equal([...html.matchAll(/class="phone-frame"/g)].length, 9, 'three mobile projects, each a playing phone with two fanned behind it');
  assert.equal([...html.matchAll(/<div class="phone-frame-screen"><video/g)].length, 3);
  assert.doesNotMatch(html, /preview-toggle/, 'previews play on their own, with no pause button');
  const { readFile } = await import('node:fs/promises');
  assert.doesNotMatch(await readFile(new URL('../css/selected-work.css', import.meta.url), 'utf8'), /preview-toggle/);
  for (const project of projects) {
    assert.ok(html.includes(`aria-label="View ${project.title.split(' \u2014 ')[0]} project"`));
    assert.ok(html.includes(`href="projects/${project.slug}.html"`));
  }
});

test('projects are one per row in showcase order, each tagged with its color, tilt and cursor hooks', () => {
  const html = module.renderSelectedWork();
  assert.doesNotMatch(html, /selected-projects-mobile/);
  assert.deepEqual([...html.matchAll(/data-project-tone="([a-z-]+)"/g)].map(match => match[1]), ['skyfire', 'maistra', 'bulk-buying-companion', 'pulso', 'sige']);
  assert.equal([...html.matchAll(/class="selected-project-preview"[^>]*\bdata-tilt\b/g)].length, 5);
  assert.equal([...html.matchAll(/data-cursor="View"/g)].length, 15);
});

test('the whole project preview opens its case study, so the cursor badge tells the truth', () => {
  const html = module.renderSelectedWork();
  for (const project of projects) {
    const article = html.match(new RegExp(`<article[^>]*id="project-${project.slug}"[\\s\\S]*?</article>`))[0];
    assert.match(article.match(/<div class="selected-project-preview"[^>]*>/)[0], /data-cursor="View"/);
    const link = `<a class="selected-project-preview-link" href="projects/${project.slug}.html" tabindex="-1" aria-hidden="true"></a>`;
    assert.ok(article.includes(link), `${project.slug} preview link`);
    assert.ok(article.indexOf(link) > article.indexOf('</video>'), 'the link sits over the video, never inside its fallback links');
    assert.ok(article.indexOf(link) < article.indexOf('<figcaption'), 'the link stays inside the preview, above its caption');
  }
});

test('the homepage projects section is a full-width dark band that can change color', async () => {
  const { renderHomePage } = await import('../scripts/render-home.mjs');
  const section = renderHomePage().match(/<section[^>]*id="work"[^>]*>/)?.[0];
  assert.ok(section);
  assert.match(section, /data-project-colors/);
  assert.match(section, /data-surface="dark"/);
  assert.doesNotMatch(section, /\bshell\b/);
});

test('the band has a printed grain and light that falls off between projects, without doubling the grain or covering screens', async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('../css/selected-work.css', import.meta.url), 'utf8');
  assert.match(css, /\.home-page \.work-section \{[^}]*--grain: url\("data:image\/svg\+xml,[^"]*feTurbulence[^"]*"\);[^}]*--edges: linear-gradient\(to right, [^;]+;[^}]*background-image: var\(--grain\), var\(--edges\)/, 'the section carries the grain and darker sides under its changing color, heading included');
  const shade = css.match(/\.selected-project::after \{([^}]*)\}/)?.[1];
  assert.ok(shade, 'each project has a light layer');
  assert.match(shade, /z-index: -1/, 'under the screens and text');
  assert.match(shade, /pointer-events: none/);
  assert.match(shade, /background: var\(--shade\), var\(--grain\), var\(--edges\)/, 'without JavaScript each project paints its own band, so it carries the texture too');
  assert.match(css, /:root\.project-colors \.selected-project::after \{ background: var\(--shade\); \}/, 'with the shared color the texture comes from the section alone');
  assert.match(css, /\.selected-project:first-child::after \{ --shade-top: transparent; \}/, 'the first project blends into the heading');
  const top = shade.match(/--shade-top: (rgba\([^)]+\))/)?.[1];
  const fade = shade.match(/--shade: linear-gradient\(to bottom, var\(--shade-top\), transparent (\d+)%, transparent (\d+)%, (rgba\([^)]+\))\);/);
  assert.ok(fade, 'the shade fades in from both edges');
  assert.equal(top, fade[3], 'one project ends as dark as the next begins, so there is no seam');
  assert.equal(Number(fade[1]), 100 - Number(fade[2]), 'and fades at the same rate on both sides of the boundary');
});
