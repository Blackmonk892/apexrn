import Link from "next/link";
import { getParts } from "@/lib/parts";

export function PartsTable() {
  return (
    <table className="ruled-table parts-table">
      <caption className="sr-only">All parts, with the command that adds each one</caption>
      <thead>
        <tr>
          <th scope="col" className="mono-label">Part no.</th>
          <th scope="col" className="mono-label">Name</th>
          <th scope="col" className="mono-label hide-sm">What it does</th>
          <th scope="col" className="mono-label">Add</th>
        </tr>
      </thead>
      <tbody>
        {getParts().map((p) => (
          <tr key={p.slug}>
            <td className="mono-label part-no">{p.number}</td>
            <th scope="row" className="part-name">
              <Link href={`/docs/components/${p.slug}`} className="row-link">
                {p.name}
              </Link>
            </th>
            <td className="t-small hide-sm">{p.description}</td>
            <td className="code add-cmd">{p.addCommand}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
