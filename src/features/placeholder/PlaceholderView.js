import { pageMeta } from '../../app/router.js';
import { state } from '../../app/state.js';
export function PlaceholderView() { const [title, subtitle] = pageMeta[state.currentPage] || ['Coming soon', '']; return `<section class="rounded-3xl border border-mjt-border bg-white p-8 shadow-sm"><h3 class="text-2xl font-black">${title}</h3><p class="mt-2 text-slate-500">${subtitle}</p><p class="mt-6 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">This page is ready for a separate feature folder when the API is connected.</p></section>`; }
