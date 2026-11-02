import Link from "next/link";
import { AUTHOR, GITHUB_URL } from "@/lib/site";

const NPM_URL = "https://www.npmjs.com/package/apexrn";
const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

export function PosterFooter() {
  return (
    <footer className="lp-footer">
      <svg className="lp-wordmark" viewBox="0 0 1000 190" role="img" aria-label="ApexRN" preserveAspectRatio="none">
        <text x="0" y="170" textLength="1000" lengthAdjust="spacingAndGlyphs" fontSize="236" fontWeight="900" fill="currentColor">
          APEXRN
        </text>
      </svg>
      <ul className="lp-footer-row">
        <li>
          <Link href="/docs">Docs</Link>
        </li>
        <li>
          <a href={GITHUB_URL}>GitHub</a>
        </li>
        <li>
          <a href={NPM_URL}>npm</a>
        </li>
        <li>
          <a href={LICENSE_URL}>MIT licence</a>
        </li>
        <li>
          <a href={`https://github.com/${AUTHOR}`}>Built by {AUTHOR}</a>
        </li>
      </ul>
    </footer>
  );
}
