import { renderHomePage } from './render-home.mjs';

// Retain compatibility with old local preview links, showing the actual homepage.
// Only the asset base changes because the preview lives inside tmp/.
export function renderStartupPreview() {
  return renderHomePage().replace('<head>', '<head><base href="../">');
}
