import { state } from "../../app/state.js";
import { api } from "../../services/apiClient.js";
import { saveApiBase, saveToken } from "../../services/storage.js";
import { isDevToken } from "./devAuth.js";
import { setLoginMessage } from "./AuthView.js";

export function bindAuthEvents({ openPanel }) {
  document.getElementById("loginBtn").onclick = () => doLogin(openPanel);
  document.getElementById("demoBtn").onclick = () => openDemo(openPanel);
  document.getElementById("tokenInput").addEventListener("keydown", (event) => { if (event.key === "Enter") doLogin(openPanel); });
}
async function doLogin(openPanel) {
  state.apiBase = document.getElementById("apiBaseInput").value.trim() || "/api";
  state.token = document.getElementById("tokenInput").value.trim();
  if (!state.token) return setLoginMessage("Token is required.", true);
  saveApiBase(state.apiBase);
  if (isDevToken(state.token)) { state.demo = true; saveToken(state.token); setLoginMessage("Local dev mode enabled."); await openPanel(); return; }
  setLoginMessage("Checking API and token...");
  try { await api(`/auth/check?token=${encodeURIComponent(state.token)}`); saveToken(state.token); await openPanel(); }
  catch (error) { setLoginMessage(`Login failed: ${error.message}`, true); }
}
async function openDemo(openPanel) { state.demo = true; state.token = "demo"; await openPanel(); }
