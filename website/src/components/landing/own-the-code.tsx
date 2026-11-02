import { highlight } from "fumadocs-core/highlight";
import { captureCommand, captureOutput, drawerExcerpt } from "./data";
import { TypedTerminal } from "./typed-terminal";

const EXCERPT_FROM = 36;
const EXCERPT_TO = 62;
const FILE = "components/apexrn/drawer.tsx";

export async function OwnTheCode() {
  const code = await highlight(drawerExcerpt(EXCERPT_FROM, EXCERPT_TO), {
    lang: "tsx",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
  return (
    <TypedTerminal command={captureCommand} output={captureOutput.replace(/\n+$/, "")}>
      <figure className="lp-split-pane lp-source">
        <figcaption className="lp-label lp-split-head" translate="no">
          {FILE} · {EXCERPT_FROM}–{EXCERPT_TO}
        </figcaption>
        <div className="lp-source-code" style={{ counterReset: `line ${EXCERPT_FROM - 1}` }} translate="no" tabIndex={0} aria-label={`${FILE}, lines ${EXCERPT_FROM} to ${EXCERPT_TO}`}>
          {code}
        </div>
      </figure>
    </TypedTerminal>
  );
}
