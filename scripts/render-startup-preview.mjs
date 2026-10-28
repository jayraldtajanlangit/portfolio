import { renderHomePage } from './render-home.mjs';

// Preview the real startup, including its deadline and accessibility bypasses.
// Only the asset base changes because the preview lives inside tmp/.
export function renderStartupPreview() {
  return renderHomePage().replace('<head>', '<head><base href="../">');
}
