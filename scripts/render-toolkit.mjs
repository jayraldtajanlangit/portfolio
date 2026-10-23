import { projects } from '../js/projects.js';
import { escapeHtml as e } from './render-utils.mjs';

const areas = [
  { title: 'Languages', tools: [
    { name: 'TypeScript', icon: 'typescript', project: 'maistra' },
    { name: 'Dart', icon: 'dart', project: 'pulso' },
    { name: 'Python', icon: 'python', project: 'sige' },
  ] },
  { title: 'Frameworks', tools: [
    { name: 'Angular', icon: 'angular', project: 'maistra' },
    { name: 'Django REST Framework', icon: 'django', project: 'skyfire' },
    { name: 'Flutter', icon: 'flutter', project: 'pulso' },
    { name: 'FastAPI', icon: 'fastapi', project: 'sige' },
  ] },
  { title: 'Tools', tools: [
    { name: 'VS Code', icon: 'vscode', href: 'https://code.visualstudio.com/' },
    { name: 'Android Studio', icon: 'androidstudio', href: 'https://developer.android.com/studio' },
    { name: 'Git', icon: 'git', href: 'https://git-scm.com/' },
    { name: 'GitHub', icon: 'github', href: 'https://github.com/' },
    { name: 'GitKraken', icon: 'gitkraken', href: 'https://www.gitkraken.com/' },
    { name: 'Postman', icon: 'postman', href: 'https://www.postman.com/' },
  ] },
  { title: 'AI tools', tools: [
    { name: 'Codex', icon: 'codex', href: 'https://openai.com/codex/' },
    { name: 'ChatGPT', icon: 'chatgpt', href: 'https://chatgpt.com/' },
    { name: 'Claude', icon: 'claude', href: 'https://claude.ai/' },
  ] },
];

export function renderToolkit() {
  return `<section class="tech-section shell" id="tech-stack" aria-labelledby="tech-stack-title" data-reveal-group>
    <header class="section-heading"><h2 id="tech-stack-title">Tech stack</h2></header>
    <div class="tech-stack-groups">${areas.map(area => `<div class="tech-stack-group">
      <h3>${e(area.title)}</h3>
      <ul class="tech-logo-list" aria-label="${e(area.title)}">${area.tools.map(tool => {
        const project = tool.project ? projects.find(item => item.slug === tool.project) : null;
        const href = project ? `projects/${project.slug}.html` : tool.href;
        const label = project ? `${tool.name}: view my work on ${project.title.split(' — ')[0]}` : `${tool.name}: official website (opens in a new tab)`;
        return `<li><a class="tech-logo-link" href="${e(href)}"${project ? '' : ' target="_blank" rel="noopener noreferrer"'} aria-label="${e(label)}"><span class="tech-logo tech-logo--${e(tool.icon)}" aria-hidden="true"></span><span class="tech-logo-name" aria-hidden="true">${e(tool.name)}</span></a></li>`;
      }).join('')}</ul>
    </div>`).join('')}</div>
  </section>`;
}
