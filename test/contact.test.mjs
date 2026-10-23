import test from 'node:test';
import assert from 'node:assert/strict';
const { initEmailCopy } = await import('../js/contact.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});

function fixture(writeText) {
  const handlers = new Map(), timers = [];
  const label = { textContent: 'Copy email' }, status = { textContent: '' };
  const button = {
    hidden: true, disabled: false, dataset: { email: 'portfolio@example.com' },
    querySelector: () => label,
    setAttribute() {}, removeAttribute() {},
    addEventListener: (name, callback) => handlers.set(name, callback),
    removeEventListener: name => handlers.delete(name),
  };
  const root = {
    querySelector: selector => selector === '[data-email-copy]' ? button : status,
    defaultView: { navigator: writeText ? { clipboard: { writeText } } : {}, setTimeout: callback => { timers.push(callback); return timers.length; }, clearTimeout() {} },
  };
  return { root, button, label, status, handlers, timers };
}

test('copy email writes the actual address and reports completion only after it succeeds', async () => {
  assert.equal(typeof initEmailCopy, 'function');
  let resolveWrite, copied;
  const f = fixture(value => { copied = value; return new Promise(resolve => { resolveWrite = resolve; }); });
  const stop = initEmailCopy(f.root);
  assert.equal(f.button.hidden, false);
  const pending = f.handlers.get('click')();
  assert.equal(copied, 'portfolio@example.com');
  assert.equal(f.button.disabled, true);
  assert.notEqual(f.label.textContent, 'Copied');
  resolveWrite(); await pending;
  assert.equal(f.label.textContent, 'Copied');
  assert.equal(f.status.textContent, 'Email copied to clipboard.');
  assert.equal(f.button.disabled, false);
  f.timers.at(-1)();
  assert.equal(f.label.textContent, 'Copy email');
  stop();
  assert.equal(f.handlers.has('click'), false);
});

test('clipboard rejection keeps a usable retry action and explains manual copying', async () => {
  assert.equal(typeof initEmailCopy, 'function');
  const f = fixture(async () => { throw new Error('Permission denied'); });
  initEmailCopy(f.root);
  await f.handlers.get('click')();
  assert.equal(f.label.textContent, 'Copy email');
  assert.equal(f.button.disabled, false);
  assert.match(f.status.textContent, /Select the email address/);
  assert.doesNotMatch(f.status.textContent, /copied to clipboard/);
});

test('unsupported clipboard leaves the copy control hidden', () => {
  assert.equal(typeof initEmailCopy, 'function');
  const f = fixture();
  initEmailCopy(f.root);
  assert.equal(f.button.hidden, true);
  assert.equal(f.handlers.size, 0);
});
