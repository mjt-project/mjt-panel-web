export function InstallerView() {
  return `
    <section class="grid grid-cols-[1.1fr_.9fr] gap-4 max-xl:grid-cols-1">
      <article class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5">
        <div class="mb-4 flex items-center justify-between"><h3 class="text-xl font-black">Install Minecraft server</h3><span class="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">Velocity / Paper / Purpur</span></div>
        <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          ${field('Provider', '<select id="installProvider" class="input"><option value="velocity">Velocity</option><option value="paper">Paper</option><option value="purpur">Purpur</option></select>')}
          ${field('Profile name', '<input id="installProfile" class="input" value="smp" />')}
          ${field('Version', '<input id="installVersion" class="input" value="latest" />')}
          ${field('Build', '<input id="installBuild" class="input" value="latest" />')}
          ${field('Server port', '<input id="installPort" class="input" value="25566" />')}
          ${field('Java memory', '<input id="installMemory" class="input" value="1G" />')}
        </div>
        <div class="my-4 grid gap-2 text-sm text-mjt-muted"><label><input id="installEula" type="checkbox" class="mr-2">Accept EULA for Paper/Purpur</label><label><input id="installForce" type="checkbox" class="mr-2">Replace existing jar</label></div>
        <button id="installBtn" class="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-black text-slate-950">Install server</button>
        <pre id="installOutput" class="mt-4 min-h-36 overflow-auto rounded-2xl border border-mjt-line bg-slate-950 p-4 text-sm text-green-200">Ready.</pre>
      </article>
      <article class="rounded-3xl border border-mjt-line bg-mjt-card/80 p-5"><h3 class="mb-4 text-xl font-black">Recommended layouts</h3><div class="grid gap-3"><button class="recipe" data-recipe="velocity">Velocity proxy<br><small>profile: velocity / port: 25565</small></button><button class="recipe" data-recipe="paper">Paper SMP<br><small>profile: smp / port: 25566</small></button><button class="recipe" data-recipe="purpur">Purpur lobby<br><small>profile: lobby / port: 25567</small></button></div></article>
    </section>
  `;
}
function field(label, control) { return `<label class="block text-sm font-black text-mjt-muted">${label}${control.replace('class="input"', 'class="mt-2 w-full rounded-2xl border border-mjt-line bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"')}</label>`; }
