export function PlaceholderView({ page, description }) {
  return `<section class="empty-page"><article class="surface-card empty-card"><span class="eyebrow">MJT Panel</span><h2>${capitalize(page)}</h2><p>${description}</p><p>This feature has its own reserved route and will be connected when the related core API is ready.</p></article></section>`;
}
function capitalize(value) { return String(value).charAt(0).toUpperCase() + String(value).slice(1); }
