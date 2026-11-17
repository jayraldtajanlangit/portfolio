// Homepage-only cuts of walkthroughs that would otherwise open on a form. Each one is the full
// polished walkthrough turned to start later: the skipped opening plays at the end of the loop, so
// nothing is lost. Case studies keep the original clip. Run: npm run render:home-previews
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Slug → second of the polished clip the homepage preview starts on.
export const homeClips = { pulso: 6.6 }; // Pulso's loaded feed, just after the demo account signs in.

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let error = '';
    child.stderr.on('data', chunk => { error += chunk; });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(error.slice(-1800))));
  });
}

export async function renderHomeClip(slug, start) {
  const mp4 = `assets/videos/${slug}-home.mp4`;
  const turn = `[0:v]split[a][b];[a]trim=start=${start},setpts=PTS-STARTPTS[late];[b]trim=end=${start},setpts=PTS-STARTPTS[early];[late][early]concat=n=2:v=1:a=0,scale=in_range=auto:out_range=tv,format=yuv420p[out]`;
  await ffmpeg(['-i', `assets/videos/${slug}-polished.mp4`, '-filter_complex', turn, '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-color_range', 'tv', '-movflags', '+faststart', mp4]);
  await ffmpeg(['-i', mp4, '-an', '-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '5', '-crf', '25', '-b:v', '0', `assets/videos/${slug}-home.webm`]);
  await ffmpeg(['-i', mp4, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', `assets/images/projects/${slug}/poster-home.webp`]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const [slug, start] of Object.entries(homeClips)) {
    await renderHomeClip(slug, start);
    console.log(`Wrote assets/videos/${slug}-home.mp4, ${slug}-home.webm and assets/images/projects/${slug}/poster-home.webp`);
  }
}
