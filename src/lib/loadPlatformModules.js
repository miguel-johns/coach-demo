/*
 * The platform areas share globals (M, DB) and must load as classic scripts,
 * in this exact order, after the React shell has mounted its containers.
 */
const MODULES = [
  'data', 'catalog', 'core', 'home', 'crm', 'record', 'sched', 'pos', 'inbox',
  'payments', 'services', 'settings', 'docs', 'team', 'clientdata', 'clients',
  'workouts', 'library', 'customize', 'live', 'builders', 'studio_kit', 'studio',
  'rules', 'plan', 'homecfg', 'app',
]

let started = null

function loadScript(name) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `/legacy/${name}.js`
    s.async = false
    s.onload = resolve
    s.onerror = () => reject(new Error(`Failed to load ${name}.js`))
    document.body.appendChild(s)
  })
}

export function loadPlatformModules() {
  if (!started) {
    started = MODULES.reduce((p, name) => p.then(() => loadScript(name)), Promise.resolve())
  }
  return started
}
