import { loadApiBase, loadToken } from '../services/storage.js';
export const state={apiBase:loadApiBase(),token:loadToken(),demo:false,status:null,profiles:[],selectedProfile:'',page:'dashboard',logsPaused:false,logsTimer:null,commandHistory:[],files:{path:'/',items:[],selected:null,content:''}};
export function selectedProfile(){return state.profiles.find(p=>p.name===state.selectedProfile)||null;}
