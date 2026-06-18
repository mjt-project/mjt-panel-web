import { state } from '../app/state.js';
import { mockApi } from './mockApi.js';
export async function api(path,options={}){if(state.demo)return mockApi(path,options); const res=await fetch(`${state.apiBase}${path}`,{...options,headers:{'Content-Type':'application/json','X-MJT-Token':state.token,'Authorization':`Bearer ${state.token}`,...(options.headers||{})}}); const txt=await res.text(); let data={}; try{data=txt?JSON.parse(txt):{};}catch{data={raw:txt};} if(!res.ok)throw new Error(data.message||data.error||`HTTP ${res.status}`); return data;}
