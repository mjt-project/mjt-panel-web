import { pageMeta } from "../../app/router.js";
import { state } from "../../app/state.js";
export function PlaceholderView() { const [title, subtitle] = pageMeta[state.currentPage] || ["Coming soon", ""]; return `<section class="card card-pad"><div class="empty"><h3 class="text-2xl font-black text-slate-900">${title}</h3><p>${subtitle}</p><p class="mt-2">This page is ready for API wiring later.</p></div></section>`; }
