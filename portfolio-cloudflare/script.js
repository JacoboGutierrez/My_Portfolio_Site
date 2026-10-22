document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal:not(.project-card):not(.contact-window)').forEach((element) => observer.observe(element));

// Measure layout positions rather than animated transforms to avoid flickering.
const cards = [...document.querySelectorAll('.project-card')];
const contact = document.querySelector('.contact-window');
const repeatable = [...cards, ...(contact ? [contact] : [])];
let framePending = false;
let nextCardStart = 0;
function updateReveals() {
  framePending = false;
  const viewportHeight = window.innerHeight;
  const now = performance.now();
  const entering = [];
  repeatable.forEach((element) => {
    let top = 0;
    for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
    top -= window.scrollY;
    const height = element.offsetHeight;
    const overlap = Math.max(0, Math.min(top + height, viewportHeight - 24) - Math.max(top, 24));
    const ratio = overlap / Math.min(height, viewportHeight - 48);
    if (element.classList.contains('visible')) {
      if (ratio <= .04) {
        element.style.transitionDelay = '0ms';
        element.classList.remove('visible');
      }
    } else if (ratio >= .12) {
      entering.push(element);
    }
  });
  // DOM order gives left, right, then the next row on every entrance.
  if (!cards.some(card => card.classList.contains('visible'))) nextCardStart = now;
  entering.forEach((element) => {
    const isCard = element.classList.contains('project-card');
    if (isCard) nextCardStart = Math.max(now, nextCardStart);
    element.style.transitionDelay = isCard ? `${Math.round(nextCardStart - now)}ms` : '0ms';
    element.classList.add('visible');
    if (isCard) nextCardStart += 110;
  });
}
function scheduleReveals() {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateReveals);
  }
}
window.addEventListener('scroll', scheduleReveals, { passive: true });
window.addEventListener('resize', scheduleReveals);
window.addEventListener('load', scheduleReveals);
if (document.fonts) document.fonts.ready.then(scheduleReveals);
const layoutObserver = new ResizeObserver(scheduleReveals);
repeatable.forEach(element => layoutObserver.observe(element));
scheduleReveals();

const video = document.querySelector('.hero-render');
if (video) {
  video.play().catch(() => {});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else video.play().catch(() => {});
  });
}
