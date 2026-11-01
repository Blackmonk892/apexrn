import { CopyButton } from "./CopyButton";

/** The only accent-filled element: black text, 3px border, 6px hard shadow. */
export function InstallBlock({ command }: { command: string }) {
  return (
    <div className="install-block">
      <code className="code" style={{ fontWeight: 700, overflowWrap: "anywhere" }}>
        <span aria-hidden="true">$ </span>
        {command}
      </code>
      <CopyButton text={command} />
    </div>
  );
}
