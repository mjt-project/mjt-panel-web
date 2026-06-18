export function toast(message, tone = 'neutral') {
  const region = document.getElementById('toast-region');
  if (!region) return;

  const item = document.createElement('div');
  item.className = `toast toast-${tone}`;
  item.textContent = message;
  region.appendChild(item);

  const remove = () => item.remove();
  item.addEventListener('click', remove);
  setTimeout(remove, 3600);
}
