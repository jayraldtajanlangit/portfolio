import assert from 'node:assert/strict';
import test from 'node:test';
import * as metadata from '../scripts/render-utils.mjs';

test('sharing metadata resolves image assets under a deployed subdirectory', () => {
  assert.equal(typeof metadata.renderPageMetadata, 'function');
  const html = metadata.renderPageMetadata({ siteUrl: 'https://example.com/portfolio', pathPrefix: '../' });
  assert.match(html, /property="og:image" content="https:\/\/example.com\/portfolio\/assets\/images\/social-preview.png"/);
  assert.match(html, /name="twitter:image" content="https:\/\/example.com\/portfolio\/assets\/images\/social-preview.png"/);
  assert.match(html, /href="\.\.\/assets\/favicon.svg"/);
  assert.doesNotMatch(html, /localhost|undefined/);
});

test('local pages retain relative sharing and favicon paths without a deployment URL', () => {
  for (const pathPrefix of ['', '../']) {
    assert.equal(typeof metadata.renderPageMetadata, 'function');
    const html = metadata.renderPageMetadata({ pathPrefix, siteUrl: '' });
    assert.ok(html.includes(`content="${pathPrefix}assets/images/social-preview.png"`));
    assert.ok(html.includes(`href="${pathPrefix}assets/favicon.svg"`));
    assert.match(html, /summary_large_image/);
    assert.match(html, /og:image:alt/);
  }
});
