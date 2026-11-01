import type { PropEntry } from "@/lib/docs-data";

/** Description text uses backticks for code; render them as <code>. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="code">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function PropsTable({ props, caption }: { props: PropEntry[]; caption: string }) {
  if (!props.length) return <p className="t-small">This part takes no props of its own.</p>;
  return (
    <div className="table-scroll">
      <table className="ruled-table props-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="mono-label">Prop</th>
            <th scope="col" className="mono-label">Type</th>
            <th scope="col" className="mono-label">Default</th>
            <th scope="col" className="mono-label">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <th scope="row" className="code props-name">
                {p.name}
                {p.optional ? "" : " *"}
              </th>
              <td className="code props-type">{p.type}</td>
              <td className="code">{p.default ?? "none"}</td>
              <td className="t-small">{p.description ? <Inline text={p.description} /> : "No description yet."}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
