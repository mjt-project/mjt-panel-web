export function loadToken(){return localStorage.getItem('mjtToken')||'';}
export function saveToken(t){localStorage.setItem('mjtToken',t||'');document.cookie=`MJT_TOKEN=${encodeURIComponent(t||'')}; Path=/; SameSite=Strict`;}
export function clearToken(){localStorage.removeItem('mjtToken');document.cookie='MJT_TOKEN=; Path=/; Max-Age=0; SameSite=Strict';}
export function loadApiBase(){return localStorage.getItem('mjtApiBase')||'/api';}
export function saveApiBase(v){localStorage.setItem('mjtApiBase',v||'/api');}
