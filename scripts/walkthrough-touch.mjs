// Touch cues are authored against the source footage; no camera transform or desktop cursor.
export function touchFilter(profile) {
  const filters = [`[0:v]trim=start=${profile.trim},setpts=PTS-STARTPTS,fps=60,scale=${profile.width}:${profile.height}:flags=lanczos,setsar=1[screen0]`];
  for (const [index, tap] of profile.taps.entries()) {
    const distance = 'hypot(X-32,Y-32)';
    const radius = '(9+18*T)';
    const alpha = `if(lt(${distance},5),75*(1-T/0.48),if(between(${distance},${radius},${radius}+2),210*(1-T/0.48),if(between(${distance},${radius}-1,${radius}+3),100*(1-T/0.48),0)))`;
    const ink = `if(between(${distance},${radius},${radius}+2),255,25)`;
    filters.push(`color=c=black@0:s=64x64:r=60:d=0.48,format=rgba,geq=r='${ink}':g='${ink}':b='${ink}':a='${alpha}',setpts=PTS+${tap.time}/TB[tap${index}]`);
    filters.push(`[screen${index}][tap${index}]overlay=x=${Math.round(tap.x * profile.width) - 32}:y=${Math.round(tap.y * profile.height) - 32}:eof_action=pass:repeatlast=0[screen${index + 1}]`);
  }
  filters.push(`[screen${profile.taps.length}]format=yuv420p[out]`);
  return filters.join(';');
}
