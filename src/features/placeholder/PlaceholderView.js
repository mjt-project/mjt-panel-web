import { pageMeta } from '../../app/router.js';
import { state } from '../../app/state.js';

export function PlaceholderView() {
  const [title, subtitle] = pageMeta[state.currentPage] || ['Coming soon', ''];
  return `<section><div class="grid min-h-80 content-center rounded-3xl border border-mjt-line bg-mjt-card/80 p-5"><h3 class="text-xl font-black">${title}</h3><p class="mt-2 text-mjt-muted">${subtitle}</p><p class="mt-4 text-sm text-mjt-muted">This page is prepared for a later API connection.</p></div></section>`;
}
