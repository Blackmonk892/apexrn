#!/usr/bin/env node
// Fresh-app install check (B-41): proves a brand-new Expo app can adopt ApexRN
// through the CLI alone. Builds the local registry, scaffolds a scratch app,
// runs `init` + `add --all` against that registry, then typechecks and bundles.
//
// Usage: node scripts/fresh-app-check.mjs [--keep] [--dir <path>]

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const keep = args.includes('--keep');
const dirFlag = args.indexOf('--dir');
const root = dirFlag >= 0 ? resolve(args[dirFlag + 1]) : join(tmpdir(), `apexrn-fresh-${Date.now()}`);
const appName = 'fresh-app';
const app = join(root, appName);
const registry = join(repo, 'registry', 'public');
const cli = join(repo, 'packages', 'cli', 'bin', 'apexrn.mjs');
const q = (p) => `"${p}"`;

const results = [];

function run(label, cmd, cwd) {
  console.log(`\n=== ${label} ===\n$ ${cmd}\n`);
  const res = spawnSync(cmd, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1', npm_config_update_notifier: 'false' },
  });
  const ok = res.status === 0;
  results.push({ label, ok, detail: ok ? '' : `exit ${res.status ?? res.signal ?? res.error?.message}` });
  return ok;
}

function note(label, ok, detail = '') {
  results.push({ label, ok, detail });
  return ok;
}

function appTsx(componentsImport, themeImport) {
  return `import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScrollView, View } from 'react-native';
import { ApexRNProvider } from '${themeImport}';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Toaster,
  useToast,
} from '${componentsImport}';

function Screen() {
  const toast = useToast();
  const [name, setName] = useState('');
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, gap: 16 }}>
      <Card>
        <CardHeader>
          <CardTitle>Fresh install</CardTitle>
          <CardDescription>Components copied by the apexrn CLI.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input label="Name" value={name} onChangeText={setName} />
        </CardContent>
      </Card>
      <Button onPress={() => toast.success('Saved', name)}>Save</Button>
      <Dialog>
        <DialogTrigger>
          <View>
            <Button variant="outline">Open dialog</Button>
          </View>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hello</DialogTitle>
            <DialogDescription>Rendered from a fresh app.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </ScrollView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApexRNProvider defaultMode="system">
        <Toaster>
          <Screen />
        </Toaster>
      </ApexRNProvider>
    </GestureHandlerRootView>
  );
}
`;
}

function main() {
  mkdirSync(root, { recursive: true });
  console.log(`Scratch dir: ${root}`);

  const steps = [
    () => run('1. build registry', `node ${q(join(repo, 'registry', 'build.mjs'))}`, repo),
    () =>
      run(
        '2. create-expo-app',
        `npx --yes create-expo-app@latest ${appName} --template blank-typescript --yes --no-install`,
        root,
      ) && run('2b. npm install (app deps)', 'npm install --no-audit --no-fund', app),
    () =>
      run(
        '3. install peers',
        'npx expo install react-native-reanimated react-native-gesture-handler react-native-svg expo-haptics react-native-worklets react-dom react-native-web',
        app,
      ),
    () =>
      run('4a. apexrn init', `node ${q(cli)} init --registry ${q(registry)}`, app) &&
      run('4b. apexrn add --all', `node ${q(cli)} add --all --registry ${q(registry)}`, app),
    () => {
      const cfg = JSON.parse(readFileSync(join(app, 'apexrn.json'), 'utf8'));
      const rel = (d) => './' + d.replace(/^\.?\//, '');
      writeFileSync(join(app, 'App.tsx'), appTsx(rel(cfg.componentsDir), rel(`${cfg.libDir}/theme`)));
      return note('5. write App.tsx', true, `components: ${cfg.componentsDir}, lib: ${cfg.libDir}`);
    },
    // tsc and export are independent: report both even if the first fails.
    () => {
      const tsc = run('6a. tsc --noEmit', 'npx tsc --noEmit', app);
      const exp = run('6b. expo export --platform web', 'npx expo export --platform web', app);
      return tsc && exp;
    },
  ];

  for (const step of steps) {
    let ok = false;
    try {
      ok = step();
    } catch (err) {
      note('script error', false, err.message);
    }
    if (!ok) break; // later steps depend on earlier ones
  }
}

try {
  main();
} finally {
  const failed = results.some((r) => !r.ok);
  console.log('\n=== Summary ===');
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label}${r.detail ? `  (${r.detail})` : ''}`);
  console.log(`\n${failed ? 'FAIL' : 'PASS'}: fresh-app check`);
  if (keep || (failed && args.includes('--keep-on-fail'))) console.log(`Kept: ${root}`);
  else rmSync(root, { recursive: true, force: true });
  process.exitCode = failed ? 1 : 0;
}
