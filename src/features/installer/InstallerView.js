export function InstallerView() {
  return `<section class="grid-2"><article class="card card-pad"><div class="card-head"><div><h3 class="text-xl font-black">Install Minecraft server</h3><p class="text-sm text-slate-500 mt-1">Choose software, profile name and install options.</p></div><span class="badge stopped">Velocity / Paper / Purpur</span></div>
    <div class="form-grid">
      ${field("Provider", `<select id="installProvider" class="select"><option value="velocity">Velocity</option><option value="paper">Paper</option><option value="purpur">Purpur</option></select>`)}
      ${field("Profile name", `<input id="installProfile" class="input" value="velocity" />`)}
      ${field("Version", `<input id="installVersion" class="input" value="latest" />`)}
      ${field("Build", `<input id="installBuild" class="input" value="latest" />`)}
      ${field("Server port", `<input id="installPort" class="input" value="25565" />`)}
      ${field("Java memory", `<input id="installMemory" class="input" value="512M" />`)}
    </div>
    <div class="grid gap-3 my-5"><label class="checkbox"><input id="installEula" type="checkbox" /> Accept EULA for Paper/Purpur</label><label class="checkbox"><input id="installForce" type="checkbox" checked /> Replace existing jar</label></div>
    <button id="installBtn" class="btn btn-primary w-full">Install server</button><pre id="installOutput" class="install-output mt-4">Ready.</pre>
  </article><article class="card card-pad"><h3 class="text-xl font-black mb-4">Recommended layouts</h3><div class="grid gap-3"><button class="recipe" data-recipe="velocity"><b>Velocity proxy</b><p class="text-sm text-slate-500">profile: velocity · port: 25565</p></button><button class="recipe" data-recipe="paper"><b>Paper SMP</b><p class="text-sm text-slate-500">profile: smp · port: 25566</p></button><button class="recipe" data-recipe="purpur"><b>Purpur lobby</b><p class="text-sm text-slate-500">profile: lobby · port: 25567</p></button></div></article></section>`;
}
function field(label, control) { return `<div class="field"><label>${label}</label>${control}</div>`; }
