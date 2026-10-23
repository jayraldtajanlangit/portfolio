// Authored presentation cues follow the visible interface steps, not recorded mouse telemetry.
export const walkthroughMotion = {
  skyfire: {
    width: 1440, height: 900, trim: 1, duration: 12.2, cursorWidth: 30,
    camera: [[0,.5,.5,1],[.8,.5,.5,1],[1.5,.35,.66,1.35],[2.7,.35,.66,1.35],[3.2,.5,.5,1],[3.8,.5,.39,1.55],[4.7,.5,.39,1.55],[5.2,.5,.66,1.25],[5.9,.5,.66,1.25],[6.4,.5,.5,1],[8,.5,.5,1],[8.7,.78,.25,1.3],[9.5,.5,.27,1.28],[10.6,.5,.27,1.28],[11.5,.5,.5,1],[12.2,.5,.5,1]],
    cursor: [[0,.72,.30],[.7,.72,.30],[1.7,.22,.71],[2.9,.22,.71],[3.5,.45,.33],[4.3,.45,.33],[5.1,.50,.59],[5.7,.45,.88],[6.3,.45,.88],[7.5,.73,.35],[8.2,.92,.035],[8.8,.87,.17],[9.5,.70,.25],[10.7,.70,.25],[11.7,.72,.30],[12.2,.72,.30]],
  },
  maistra: {
    width: 1280, height: 720, trim: 0, duration: 18.46, cursorWidth: 28,
    camera: [[0,.5,.5,1],[18.46,.5,.5,1]],
    cursor: [[0,.18,.43],[1,.18,.43],[2.3,.88,.90],[3.1,.88,.90],[4.5,.90,.34],[6.3,.90,.34],[7.7,.78,.43],[9.7,.92,.43],[10.6,.60,.61],[12.5,.88,.90],[14,.20,.78],[15,.77,.55],[16.7,.88,.90],[18.46,.18,.43]],
  },
  'bulk-buying-companion': {
    width: 390, height: 844, trim: 1, duration: 10.04, interaction: 'touch',
    camera: [[0,.5,.5,1],[10.04,.5,.5,1]],
    taps: [
      {time:2.72,x:.5,y:.48,label:'Open rice group buy'},
      {time:4.72,x:.5,y:.947,label:'Reserve a slot'},
    ],
  },
  pulso: {
    width: 390, height: 844, trim: 0, duration: 27.46, interaction: 'touch',
    camera: [[0,.5,.5,1],[27.46,.5,.5,1]],
    taps: [
      {time:1.65,x:.69,y:.675,label:'Preview registration'},
      {time:3.55,x:.71,y:.752,label:'Return to sign in'},
      {time:4.02,x:.4,y:.46,label:'Enter demo email'},
      {time:4.43,x:.4,y:.535,label:'Enter password'},
      {time:5.95,x:.5,y:.61,label:'Sign in'},
      {time:7.65,x:.5,y:.965,label:'Create a post'},
      {time:8.78,x:.5,y:.145,label:'Choose a photo'},
      {time:10.23,x:.4,y:.37,label:'Write a caption'},
      {time:11.66,x:.5,y:.51,label:'Publish post'},
      {time:13.7,x:.072,y:.59,label:'Like post'},
      {time:14.87,x:.95,y:.59,label:'Save post'},
      {time:16.08,x:.9,y:.965,label:'Open profile'},
      {time:17.6,x:.5,y:.289,label:'Edit profile'},
      {time:18.75,x:.4,y:.345,label:'Edit display name'},
      {time:19.12,x:.4,y:.61,label:'Edit bio'},
      {time:20.4,x:.5,y:.155,label:'Choose profile image'},
      {time:22.85,x:.9,y:.033,label:'Save profile'},
      {time:25.45,x:.95,y:.033,label:'Sign out'},
    ],
  },
  sige: {
    width: 390, height: 844, trim: 1, duration: 8.4, interaction: 'touch',
    camera: [[0,.5,.5,1],[8.4,.5,.5,1]],
    taps: [
      {time:2.12,x:.5,y:.535,label:'Open task detail'},
      {time:3.68,x:.73,y:.947,label:'Mark task done'},
    ],
  },
};

export const smoothStep = value => {
  const u = Math.max(0, Math.min(1, value));
  return Math.max(0, Math.min(1, u * u * u * (u * (u * 6 - 15) + 10)));
};

export function sampleTrack(track, time) {
  if (time <= track[0][0]) return track[0].slice(1);
  for (let index = 1; index < track.length; index++) {
    if (time > track[index][0]) continue;
    const from = track[index - 1], to = track[index];
    const progress = smoothStep((time - from[0]) / (to[0] - from[0]));
    return from.slice(1).map((value, dimension) => value + (to[dimension + 1] - value) * progress);
  }
  return track.at(-1).slice(1);
}

export function trackExpression(track, dimension, clock = 't') {
  const number = value => Number(value.toFixed(6));
  let expression = String(number(track.at(-1)[dimension]));
  for (let index = track.length - 2; index >= 0; index--) {
    const from = track[index], to = track[index + 1];
    if (from[dimension] === to[dimension]) {
      expression = `if(lt(${clock},${to[0]}),${from[dimension]},${expression})`;
      continue;
    }
    const u = `clip(((${clock})-${from[0]})/${number(to[0] - from[0])},0,1)`;
    const ease = `(${u}*${u}*${u}*(${u}*(${u}*6-15)+10))`;
    expression = `if(lt(${clock},${to[0]}),${from[dimension]}+(${number(to[dimension] - from[dimension])})*${ease},${expression})`;
  }
  return expression;
}
