export function toast(message, danger = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden', 'border-red-200', 'border-blue-200', 'text-red-700', 'text-blue-700');
  el.classList.add(danger ? 'border-red-200' : 'border-blue-200', danger ? 'text-red-700' : 'text-blue-700');
  setTimeout(() => el.classList.add('hidden'), 2800);
}
