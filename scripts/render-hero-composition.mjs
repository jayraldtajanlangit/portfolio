// Each letter is its own span so the name can rise letter by letter (--i drives the stagger).
function letters(word, start) {
  return [...word].map((letter, index) => `<span class="hero-letter" style="--i:${start + index}">${letter}</span>`).join('');
}

export function renderHeroComposition() {
  return `<div class="hero-composition">
    <h1 class="hero-name" id="hero-title" aria-label="Jayrald Tajanlangit"><span class="hero-name-line" data-hero-name><span class="hero-name-word">${letters('Jayrald', 0)}</span></span><span class="hero-name-line"><span class="hero-name-word">${letters('Tajanlangit', 7)}</span></span></h1>
    <img class="hero-portrait" src="assets/pp/jayrald-hero-cutout.png" alt="Black-and-white portrait of Jayrald Tajanlangit seated on a chair" width="1254" height="1254" fetchpriority="high" decoding="async">
  </div>`;
}
