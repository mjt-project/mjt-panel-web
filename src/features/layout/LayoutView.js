import { pages, pageMeta } from "../../app/router.js";
import { state } from "../../app/state.js";

export function LayoutView(contentHtml) {
  const [title, subtitle] = pageMeta[state.currentPage] || pageMeta.dashboard;
  return `<section class="app-shell">
    <aside class="sidebar">
      <div class="brand"><div class="logo">M</div><div><strong class="text-slate-950">MJT Panel</strong><div class="text-xs text-slate-500 font-semibold">web 0.0.8</div></div></div>
      <nav class="nav">${pages.map((p) => `<button class="nav-link ${p === state.currentPage ? "active" : ""}" data-page="${p}">${label(p)}</button>`).join("")}</nav>
      <div class="sidebar-footer"><div class="api-pill"><span class="dot"></span>${state.demo ? "Demo mode" : "API mode"}</div><button id="logoutBtn" class="btn btn-danger w-full">Logout</button></div>
    </aside>
    <main class="main">
      <header class="topbar"><div><h1 class="text-3xl font-black tracking-tight text-slate-950">${title}</h1><p class="text-sm text-slate-500 mt-1">${subtitle}</p></div><div class="toolbar"><select id="profileSelect" class="select">${profileOptions()}</select><button id="refreshBtn" class="btn btn-soft">Refresh</button></div></header>
      ${contentHtml}
    </main>
  </section>`;
}
function label(value) { return value[0].toUpperCase() + value.slice(1); }
function profileOptions() {
  if (!state.profiles.length) return `<option value="">No profiles</option>`;
  return state.profiles.map((p) => `<option value="${p.name}" ${p.name === state.selectedProfile ? "selected" : ""}>${p.name}${p.running ? " · running" : ""}</option>`).join("");
}
