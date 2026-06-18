export function animateIn(selector) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length || !window.anime) return;
  try {
    window.anime({
      targets: elements,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 260,
      easing: 'easeOutCubic',
      delay: window.anime.stagger ? window.anime.stagger(24) : 0
    });
  } catch (_) {
    // Motion must never block the panel.
  }
}
