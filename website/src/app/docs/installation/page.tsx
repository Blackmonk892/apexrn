import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { getSetupCode } from "@/lib/docs-data";
import { getCliStep } from "@/lib/cli-docs";
import { INIT_COMMAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Installation",
  description: "Run apexrn init in an Expo app, add a part, install the peer dependencies and wrap the app root.",
};

const PEERS = ["react-native-reanimated", "react-native-worklets", "react-native-gesture-handler", "react-native-svg", "expo-haptics"];

const PROVIDER = `import { ApexRNProvider } from '@/lib/apexrn/theme';

// preset is 'neo' (default) or 'raw'. defaultMode is 'light' | 'dark' | 'system'.
<ApexRNProvider defaultMode="system" preset="raw">
  {/* app */}
</ApexRNProvider>`;

const INSETS = `import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<AppBar title="Inbox" topInset={insets.top} />
<DrawerContent topInset={insets.top} bottomInset={insets.bottom}>{/* items */}</DrawerContent>
<BottomNav value={tab} onValueChange={setTab} bottomInset={insets.bottom}>{/* tabs */}</BottomNav>`;

export default function Installation() {
  const init = getCliStep("init");
  return (
    <>
      <h1 className="t-h2">Installation</h1>
      <p>
        Parts are copied into your project by the <Link href="/docs/cli">CLI</Link>. Nothing is added to
        your dependencies except the peer packages the copied parts import.
      </p>

      <section>
        <h2 className="t-h3" id="init">
          1. Init
        </h2>
        <p>
          Run this in the root of an Expo app (the folder with <code>package.json</code>). It writes{" "}
          <code>apexrn.json</code> and the three shared files every part needs: theme, colours and metrics.
        </p>
        <div className="code-wrap">
          <CodeBlock code={INIT_COMMAND} copy />
        </div>
        <pre className="terminal-out" tabIndex={0}>{init.stdout}</pre>
      </section>

      <section>
        <h2 className="t-h3" id="add">
          2. Add a part
        </h2>
        <p>
          Add any number of parts by slug. Their shared dependencies come along and are never overwritten.
          Slugs are on each <Link href="/docs/components">component page</Link>.
        </p>
        <div className="code-wrap">
          <CodeBlock code={"npx apexrn add <part>\nnpx apexrn add button card dialog"} copy />
        </div>
      </section>

      <section>
        <h2 className="t-h3" id="peers">
          3. Peer dependencies
        </h2>
        <p>
          The CLI prints an <code>npx expo install</code> line for whichever of these your chosen parts need
          and your project lacks. Together they are the full set across all parts:
        </p>
        <ul className="plain">
          {PEERS.map((p) => (
            <li key={p}>
              <code>{p}</code>
            </li>
          ))}
        </ul>
        <p>
          Safe-area insets in the examples below also use <code>react-native-safe-area-context</code>, which
          ships with Expo.
        </p>
      </section>

      <section>
        <h2 className="t-h3" id="root">
          4. Wrap the app root
        </h2>
        <p>
          <code>GestureHandlerRootView</code> goes outermost, then <code>ApexRNProvider</code>. Drawer,
          Sheet and Slider rely on gestures; without the root view they do not respond.
        </p>
        <div className="code-wrap">
          <CodeBlock code={getSetupCode()} copy />
        </div>
        <h3 className="t-h3" id="provider">
          Provider options
        </h3>
        <div className="code-wrap">
          <CodeBlock code={PROVIDER} copy />
        </div>
      </section>

      <section>
        <h2 className="t-h3" id="insets">
          5. Pass safe-area insets
        </h2>
        <p>
          Parts that touch a screen edge do not read the safe area themselves. Pass it in:{" "}
          <code>AppBar</code> takes <code>topInset</code>, <code>Drawer</code> content takes{" "}
          <code>topInset</code> and <code>bottomInset</code>, <code>BottomNav</code> takes{" "}
          <code>bottomInset</code>.
        </p>
        <div className="code-wrap">
          <CodeBlock code={INSETS} copy />
        </div>
      </section>
    </>
  );
}
