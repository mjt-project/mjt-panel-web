export function isLocalDevToken(token) {
  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
  return local && token === 'dev';
}
