import raw from "@/generated/cli-docs.json";

export interface CliStep {
  id: string;
  command: string;
  note: string;
  stdout: string;
}

export function getCliStep(id: string): CliStep {
  const step = (raw as { steps: CliStep[] }).steps.find((s) => s.id === id);
  if (!step) throw new Error(`cli-docs.json has no step "${id}". Run scripts/capture-cli-docs.mjs.`);
  return step;
}
