import { getPartCount, getVersion } from "@/lib/parts";
import { AUTHOR, GITHUB_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer style={{ borderTop: "var(--rule) solid var(--ink)" }}>
      <div className="page footer-row">
        <span className="mono-label">{getPartCount()} parts</span>
        <span className="mono-label">v{getVersion()}</span>
        <span className="mono-label">MIT</span>
        <a href={GITHUB_URL} className="t-small">
          GitHub
        </a>
        <span className="t-small" style={{ color: "var(--ink-muted)" }}>
          Built by {AUTHOR}
        </span>
      </div>
    </footer>
  );
}
