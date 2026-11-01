import { highlightLine } from "@/lib/highlight";
import { CopyButton } from "./CopyButton";

export function CodeBlock({ code, copy = false, label }: { code: string; copy?: boolean; label?: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div>
      {(label || copy) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span className="mono-label" data-muted="">
            {label}
          </span>
          {copy && <CopyButton text={code} />}
        </div>
      )}
      <pre className="code-block code" tabIndex={0}>
        <code>
          {lines.map((line, i) => (
            <span key={i} style={{ display: "block", minHeight: 22 }}>
              {highlightLine(line)}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
