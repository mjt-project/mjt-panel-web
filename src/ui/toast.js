export function toast(message, danger = false) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.style.borderLeftColor = danger ? "var(--danger)" : "var(--primary)";
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2800);
}
