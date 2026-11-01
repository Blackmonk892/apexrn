import Link from "next/link";
import { getParts } from "@/lib/parts";

export function PartsList() {
  return (
    <ul className="parts-list">
      {getParts().map((p) => (
        <li key={p.slug}>
          <Link href={`/docs/components/${p.slug}`}>
            <span className="mono-label">{p.number}</span>
            <span>{p.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
