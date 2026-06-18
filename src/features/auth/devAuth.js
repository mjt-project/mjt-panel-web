export function isLocalDev() { return location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:"; }
export function isDevToken(token) { return isLocalDev() && token === "dev"; }
