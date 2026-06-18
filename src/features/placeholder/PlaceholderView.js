import { pageMeta } from "../../app/router.js";
import { state } from "../../app/state.js";

export function PlaceholderView() {
  const [title, subtitle] = pageMeta[state.currentPage] || ["Coming soon", ""];
  return `<section class="page active"><div class="card empty"><h3>${title}</h3><p>${subtitle}</p><p>This page is intentionally separated into its own feature folder later when the API is ready.</p></div></section>`;
}
