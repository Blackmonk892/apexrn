// Fails if the lib has its own dependencies or if two copies of a core package resolve.
const fs = require('fs');
const path = require('path');

const preview = path.resolve(__dirname, '..');
const ui = path.resolve(preview, '../packages/ui');
let bad = 0;
const fail = (m) => { console.error('FAIL ' + m); bad++; };

for (const f of ['node_modules', 'package-lock.json']) {
  if (fs.existsSync(path.join(ui, f))) fail(`packages/ui/${f} exists. Delete it; never install in packages/ui.`);
}

const pkgs = ['react', 'react-native', 'react-native-reanimated', 'react-native-svg', 'react-native-gesture-handler', 'react-native-worklets'];
for (const p of pkgs) {
  const fromPreview = (() => { try { return require.resolve(p + '/package.json', { paths: [preview] }); } catch { return null; } })();
  const fromUi = (() => { try { return require.resolve(p + '/package.json', { paths: [path.join(ui, 'components')] }); } catch { return null; } })();
  // The lib has no node_modules, so plain node resolution can't reach preview's; it must be null or identical.
  if (fromUi && fromUi !== fromPreview) fail(`${p}: lib resolves ${fromUi} but preview resolves ${fromPreview}`);
}

console.log(bad ? `\ndoctor: ${bad} problem(s)` : 'doctor: OK (no duplicate dependency trees)');
process.exit(bad ? 1 : 0);
