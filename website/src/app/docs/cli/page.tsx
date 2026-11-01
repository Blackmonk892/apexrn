import type { Metadata } from "next";
import { CodeBlock } from "@/components/CodeBlock";
import { getCliStep } from "@/lib/cli-docs";

export const metadata: Metadata = {
  title: "CLI",
  description: "The apexrn commands: init, add, add --overwrite, diff and list, each with the output the CLI printed when this site was built.",
};

function Step({ id, title, text }: { id: string; title: string; text: string }) {
  const step = getCliStep(id);
  return (
    <section>
      <h2 className="t-h3" id={id}>
        {title}
      </h2>
      <p>{text}</p>
      {step.note && <p className="t-small">{step.note}</p>}
      <div className="code-wrap">
        <CodeBlock code={step.command} copy />
      </div>
      <pre className="terminal-out" tabIndex={0}>
        {step.stdout}
      </pre>
    </section>
  );
}

export default function Cli() {
  return (
    <>
      <h1 className="t-h2">CLI</h1>
      <p>
        <code>apexrn</code> copies source files into your Expo app. Every output on this page was captured by
        running the CLI against this repo&apos;s registry in an empty Expo-shaped folder when the site was
        built. Peer installs were skipped there; in your app they run.
      </p>
      <Step id="init" title="init" text="Writes apexrn.json and the shared theme, colours and metrics files. Run it once per app." />
      <Step
        id="add"
        title="add"
        text="Copies one or more parts, plus the shared files and parts they depend on. Files that already exist are kept."
      />
      <Step id="add-again" title="add, run again" text="Running it twice is safe. Nothing you edited is touched." />
      <Step
        id="add-overwrite"
        title="add --overwrite"
        text="Replaces only the parts you name with the registry version. Dependencies stay as they are, so edits to shared files survive."
      />
      <Step id="diff" title="diff" text="Compares your copy of a part with the registry and prints what differs." />
      <Step id="diff-again" title="diff, after a local edit" text="Lines starting with - are yours, lines starting with + are upstream." />
      <Step id="list" title="list" text="Prints every part in the registry with its one-line description." />
      <section>
        <h2 className="t-h3" id="flags">
          Flags
        </h2>
        <p>
          <code>--dry-run</code> prints what would be written. <code>--no-install</code> skips the peer
          install and only prints the command. <code>--cwd &lt;dir&gt;</code> runs against another folder.{" "}
          <code>--registry &lt;url|path&gt;</code> reads from a different registry.
        </p>
      </section>
    </>
  );
}
