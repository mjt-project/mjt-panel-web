export function toast(message, danger = false) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.style.borderLeftColor = danger ? "#ef4444" : "#2563eb";
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}
