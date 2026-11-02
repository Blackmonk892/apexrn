import Link from "next/link";
import type { Part } from "./data";

function Run({ parts, copy }: { parts: Part[]; copy?: boolean }) {
  return (
    // The second run only exists to close the loop; it is hidden from assistive tech and the tab order.
    <ul className="lp-ticker-run" aria-hidden={copy || undefined}>
      {parts.map((p) => (
        <li key={p.slug}>
          <Link href={`/docs/components/${p.slug}`} tabIndex={copy ? -1 : undefined}>
            <span className="lp-num">{p.number}</span>
            <span translate="no">{p.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PartsTicker({ parts }: { parts: Part[] }) {
  return (
    <div className="lp-ticker">
      <div className="lp-ticker-track">
        <Run parts={parts} />
        <Run parts={parts} copy />
      </div>
    </div>
  );
}
