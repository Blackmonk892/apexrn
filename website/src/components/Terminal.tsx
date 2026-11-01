export function Terminal({ command, output }: { command: string; output: string }) {
  return (
    <pre className="code-block code" tabIndex={0} aria-label="Terminal output">
      <code>
        <span style={{ fontWeight: 700 }}>$ {command}</span>
        {"\n"}
        {output}
      </code>
    </pre>
  );
}
