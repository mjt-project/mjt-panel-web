import { state } from '../../app/state.js';
import { api } from '../../services/apiClient.js';
import { saveApiBase, saveToken } from '../../services/storage.js';
import { isDevToken } from './devAuth.js';
import { setLoginMessage } from './AuthView.js';
export function bindAuth(openPanel){document.getElementById('loginBtn').onclick=()=>login(openPanel);document.getElementById('demoBtn').onclick=()=>{state.demo=true;state.token='demo';openPanel();};document.getElementById('tokenInput').addEventListener('keydown',e=>{if(e.key==='Enter')login(openPanel);});}
async function login(openPanel){state.apiBase=document.getElementById('apiBaseInput').value.trim()||'/api';state.token=document.getElementById('tokenInput').value.trim(); if(!state.token)return setLoginMessage('Token is required.',true); saveApiBase(state.apiBase); if(isDevToken(state.token)){state.demo=true;saveToken(state.token);return openPanel();} setLoginMessage('Checking token...'); try{await api(`/auth/check?token=${encodeURIComponent(state.token)}`);saveToken(state.token);await openPanel();}catch(e){setLoginMessage(`Login failed: ${e.message}`,true);}}
