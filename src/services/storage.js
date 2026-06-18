export function loadToken() { return localStorage.getItem("mjtToken") || ""; }
export function saveToken(token) {
  localStorage.setItem("mjtToken", token || "");
  document.cookie = `MJT_TOKEN=${encodeURIComponent(token || "")}; Path=/; SameSite=Strict`;
}
export function clearToken() {
  localStorage.removeItem("mjtToken");
  document.cookie = "MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict";
}
export function loadApiBase() { return localStorage.getItem("mjtApiBase") || "/api"; }
export function saveApiBase(apiBase) { localStorage.setItem("mjtApiBase", apiBase || "/api"); }
