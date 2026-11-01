import Link from "next/link";
import type { Part } from "./data";

export function Catalogue({ parts }: { parts: Part[] }) {
  return (
    <table className="lp-table">
      <caption className="lp-sr">Every ApexRN part with its number, description and install command</caption>
      <thead>
        <tr>
          <th scope="col">Part no.</th>
          <th scope="col">Name</th>
          <th scope="col">What it does</th>
          <th scope="col">Add</th>
        </tr>
      </thead>
      <tbody>
        {parts.map((p) => (
          <tr key={p.slug}>
            <td className="lp-table-num">{p.number}</td>
            <th scope="row" className="lp-table-name">
              <Link href={`/docs/components/${p.slug}`} translate="no">
                {p.name}
              </Link>
            </th>
            <td className="lp-table-desc">{p.description}</td>
            <td className="lp-table-add">
              <code translate="no">npx apexrn add {p.slug}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
