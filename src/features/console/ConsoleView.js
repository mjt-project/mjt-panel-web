import { state } from "../../app/state.js";

export function ConsoleView() {
  return `<section class="page active"><article class="card console-card"><div class="card-head"><div><h3>Console</h3><p>Selected profile: ${state.selectedProfile || "none"}</p></div><div class="console-actions"><button id="pauseLogsBtn" class="btn subtle small-btn">${state.logsPaused ? "Resume logs" : "Pause logs"}</button><button id="clearConsoleBtn" class="btn subtle small-btn">Clear</button></div></div><pre id="consoleOutput" class="console"></pre><div class="command-row"><input id="commandInput" placeholder="Type command, e.g. list" /><button id="sendCommandBtn" class="btn primary">Send</button></div><div id="commandHistory" class="history">${state.commandHistory.map((command) => `<button data-history-command="${command}">${command}</button>`).join("")}</div></article></section>`;
}
