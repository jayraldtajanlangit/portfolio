import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { walkthroughMotion, trackExpression } from './walkthrough-motion.mjs';
import { touchFilter } from './walkthrough-touch.mjs';

await mkdir('.taste-skill/video-render', { recursive: true });
for (const [slug, profile] of Object.entries(walkthroughMotion)) {
  if (process.argv[2] && process.argv[2] !== slug) continue;
  const touch = profile.interaction === 'touch';
  let filter;
  if (touch) filter = touchFilter(profile);
  else {
  const cameraZ = trackExpression(profile.camera, 3, '(on/60)');
  const cameraX = trackExpression(profile.camera, 1, '(on/60)');
  const cameraY = trackExpression(profile.camera, 2, '(on/60)');
  const z = trackExpression(profile.camera, 3);
  const cx = trackExpression(profile.camera, 1), cy = trackExpression(profile.camera, 2);
  const px = trackExpression(profile.cursor, 1), py = trackExpression(profile.cursor, 2);
  const focus = value => `clip((${value}),1/(2*(${z})),1-1/(2*(${z})))`;
  const x = `((${px})-${focus(cx)})*(${z})*${profile.width}+${profile.width / 2}-${profile.cursorWidth * .1}`;
  const y = `((${py})-${focus(cy)})*(${z})*${profile.height}+${profile.height / 2}-${profile.cursorWidth * .075}`;
  filter = `[0:v]trim=start=${profile.trim},setpts=PTS-STARTPTS,fps=60,scale=iw*2:ih*2:flags=lanczos,zoompan=z='${cameraZ}':x='max(0,min(iw-iw/zoom,iw*(${cameraX})-iw/(2*zoom)))':y='max(0,min(ih-ih/zoom,ih*(${cameraY})-ih/(2*zoom)))':d=1:s=${profile.width}x${profile.height}:fps=60[screen];[1:v]scale=${profile.cursorWidth}:-1,format=rgba,fade=t=in:st=0:d=0.25:alpha=1,fade=t=out:st=${profile.duration - .35}:d=0.35:alpha=1[cursor];[screen][cursor]overlay=x='${x}':y='${y}':eval=frame:shortest=1,format=yuv420p[out]`;
  }
  const script = resolve(`.taste-skill/video-render/${slug}.filter`);
  await writeFile(script, filter);
  const output = `assets/videos/${slug}-polished.mp4`;
  console.log(`Rendering ${slug}: ${profile.duration}s at 60fps`);
  await new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', `assets/videos/${slug}.webm`, ...(touch ? [] : ['-loop', '1', '-i', 'assets/videos/demo-cursor.png']), '-/filter_complex', script, '-map', '[out]', '-t', String(profile.duration), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let error = '';
    process.stderr.on('data', chunk => { error += chunk; });
    process.on('error', reject);
    process.on('exit', code => code === 0 ? resolve() : reject(new Error(`${slug}: ${error.slice(-1800)}`)));
  });
  console.log(`Wrote ${output}`);
  if (touch) {
    const fallback = `assets/videos/${slug}-polished.webm`;
    await new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', output, '-vf', 'scale=in_range=auto:out_range=tv', '-color_range', 'tv', '-an', '-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '5', '-crf', '25', '-b:v', '0', fallback], {stdio:['ignore','ignore','pipe'],windowsHide:true});
      let error = '';
      process.stderr.on('data', chunk => { error += chunk; });
      process.on('error', reject);
      process.on('exit', code => code === 0 ? resolve() : reject(new Error(`${slug}: ${error.slice(-1800)}`)));
    });
    console.log(`Wrote ${fallback}`);
  }
}
