import { pageMeta, pages } from "../../app/router.js";
import { state } from "../../app/state.js";

export function LayoutView(contentHtml) {
  const [title, subtitle] = pageMeta[state.currentPage] || pageMeta.dashboard;
  return `
    <section class="app">
      <aside class="sidebar">
        <div class="brand"><div class="logo small">M</div><div><strong>MJT Panel</strong><span>web 0.0.4</span></div></div>
        <nav class="nav">${pages.map((page) => `<button class="nav-link ${page === state.currentPage ? "active" : ""}" data-page="${page}">${page[0].toUpperCase() + page.slice(1)}</button>`).join("")}</nav>
        <div class="sidebar-footer"><div class="mini-status"><span id="apiDot" class="dot ${state.demo ? "good" : ""}"></span><span id="apiText">${state.demo ? "Demo mode" : "API connected"}</span></div><button id="logoutBtn" class="btn danger full">Logout</button></div>
      </aside>
      <main class="content"><header class="topbar"><div><h2>${title}</h2><p>${subtitle}</p></div><div class="toolbar"><select id="profileSelect">${profileOptions()}</select><button id="refreshBtn" class="btn subtle">Refresh</button></div></header>${contentHtml}</main>
    </section>`;
}

function profileOptions() {
  if (!state.profiles.length) return `<option value="">No profiles</option>`;
  return state.profiles.map((p) => `<option value="${p.name}" ${p.name === state.selectedProfile ? "selected" : ""}>${p.name}${p.running ? " • running" : ""}</option>`).join("");
}
