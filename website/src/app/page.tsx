import { InstallBlock } from "@/components/InstallBlock";
import { INIT_COMMAND } from "@/lib/site";

// Placeholder until the landing page is built; shows the shell and the install block only.
export default function Home() {
  return (
    <div className="page" style={{ padding: "48px var(--gutter)" }}>
      <h1 className="t-hero">Brutalist UI parts for React Native.</h1>
      <div style={{ maxWidth: 560, marginTop: 32 }}>
        <InstallBlock command={INIT_COMMAND} />
      </div>
    </div>
  );
}
