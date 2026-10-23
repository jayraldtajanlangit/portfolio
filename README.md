# Jayrald's portfolio

A static portfolio with generated HTML, local fonts, and project walkthroughs.

Run `npm run render` to rebuild the homepage and case studies, and `npm test` for the test suite. Use any static web server to preview the repository root.

The public résumé is `assets/documents/jayrald-tajanlangit-resume.pdf`. Replace that file when updating the résumé.

`python scripts/render-social.py` rebuilds the 1200×630 social preview from the bundled fonts (requires Pillow). The favicon is `assets/favicon.svg`.

For deployment, set `SITE_URL` to the public base URL, including any hosting subdirectory, before rendering. For example, in PowerShell:

```powershell
$env:SITE_URL = 'https://your-domain.example/portfolio/'
npm run render
```

This writes absolute social image URLs for link crawlers. Without `SITE_URL`, previews use relative asset paths for local development. Publish the repository root, including `assets`, `css`, `js`, `projects`, and `index.html`.
