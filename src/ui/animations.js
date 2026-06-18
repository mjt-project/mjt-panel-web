export function animateIn(targets){if(!window.anime)return; window.anime({targets,opacity:[0,1],translateY:[8,0],duration:260,easing:'easeOutQuad',delay:window.anime.stagger?window.anime.stagger(30):0});}
export function pop(targets){if(!window.anime)return; window.anime({targets,scale:[.98,1],duration:180,easing:'easeOutQuad'});}
