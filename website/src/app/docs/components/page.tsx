import type { Metadata } from "next";
import { PartsList } from "@/components/PartsList";
import { getPartCount } from "@/lib/parts";

export const metadata: Metadata = {
  title: "Components",
  description: "Every ApexRN part by catalogue number, with a page for props, usage and accessibility.",
};

export default function ComponentsIndex() {
  return (
    <>
      <h1 className="t-h2">Components</h1>
      <p>{getPartCount()} parts. Each one has a live preview, usage code, a props table and accessibility notes.</p>
      <PartsList />
    </>
  );
}
