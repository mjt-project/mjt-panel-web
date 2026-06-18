export function isLocalDev(){return ['localhost','127.0.0.1'].includes(location.hostname)||location.protocol==='file:';}
export function isDevToken(t){return isLocalDev()&&t==='dev';}
