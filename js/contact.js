export function initEmailCopy(root = document) {
  const button = root.querySelector?.('[data-email-copy]');
  const status = root.querySelector?.('[data-copy-status]');
  const doc = root.ownerDocument ?? root;
  const view = doc.defaultView ?? globalThis;
  const clipboard = view.navigator?.clipboard;
  const label = button?.querySelector('[data-copy-label]');
  if (!button || !label || !status || !button.dataset.email || typeof clipboard?.writeText !== 'function') return () => {};
  let timer, stopped = false;
  button.hidden = false;
  const reset = () => {
    label.textContent = 'Copy email';
    delete button.dataset.copied;
  };
  const copy = async () => {
    if (button.disabled || stopped) return;
    view.clearTimeout(timer);
    reset();
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    status.textContent = '';
    try {
      await clipboard.writeText(button.dataset.email);
      if (stopped) return;
      label.textContent = 'Copied';
      button.dataset.copied = 'true';
      status.textContent = 'Email copied to clipboard.';
      timer = view.setTimeout(reset, 2500);
    } catch {
      if (!stopped) status.textContent = "Couldn't copy automatically. Select the email address above to copy it.";
    } finally {
      if (!stopped) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    }
  };
  button.addEventListener('click', copy);
  return () => {
    stopped = true;
    view.clearTimeout(timer);
    button.removeEventListener('click', copy);
    button.disabled = false;
    button.removeAttribute('aria-busy');
    reset();
    button.hidden = true;
  };
}

if (typeof document !== 'undefined') initEmailCopy(document);
