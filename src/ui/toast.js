export function toast(message, danger = false) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = `fixed right-5 top-5 z-50 max-w-md rounded-2xl border px-4 py-3 shadow-2xl ${danger ? 'border-red-500 bg-red-950 text-red-100' : 'border-cyan-500 bg-slate-950 text-cyan-100'}`;
  setTimeout(() => el.classList.add('hidden'), 2800);
}
