export function InstallerView() {
  return `
    <section class="installer-layout">
      <article class="surface-card installer-card">
        <div class="section-heading"><div><span class="eyebrow">New server</span><h2>Install a Minecraft profile</h2><p>Start with a stable default, then adjust it later.</p></div></div>
        <form id="installer-form" class="installer-form">
          <div class="field-grid">
            ${selectField('Software', 'software', [['velocity','Velocity proxy'],['paper','Paper server'],['purpur','Purpur server']])}
            ${textField('Profile name', 'profile', 'velocity')}
            ${textField('Minecraft version', 'version', 'latest')}
            ${textField('Build', 'build', 'latest')}
            ${textField('Server port', 'port', '25565')}
            ${textField('Java memory', 'memory', '512M')}
          </div>
          <div class="checkbox-stack">
            <label class="check-control"><input type="checkbox" name="acceptEula" /><span>I accept the EULA for Paper / Purpur.</span></label>
            <label class="check-control"><input type="checkbox" name="force" /><span>Replace an existing server jar.</span></label>
          </div>
          <button class="button button-primary button-wide" type="submit">Install server</button>
        </form>
        <div id="installer-output" class="install-notice" data-tone="neutral">Ready to install.</div>
      </article>

      <aside class="surface-card recipe-card">
        <span class="eyebrow">Quick presets</span>
        <h3>Common layouts</h3>
        <p>Use a preset to fill the form, then review before installing.</p>
        <div class="recipe-stack">
          ${recipe('velocity', 'Velocity proxy', 'Default Java entry · port 25565')}
          ${recipe('paper', 'Paper SMP', 'Dedicated backend · port 25566')}
          ${recipe('purpur', 'Purpur lobby', 'Lightweight lobby · port 25567')}
        </div>
      </aside>
    </section>`;
}
function textField(label, name, value) { return `<label class="field"><span>${label}</span><input class="field-control" name="${name}" value="${value}" /></label>`; }
function selectField(label, name, options) { return `<label class="field"><span>${label}</span><select class="field-control" name="${name}">${options.map(([v,t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`; }
function recipe(id, title, text) { return `<button type="button" class="recipe-item" data-recipe="${id}"><strong>${title}</strong><span>${text}</span></button>`; }
