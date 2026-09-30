import React from "react";
import { notFound } from "next/navigation";
import { getPlaygroundComponents, getPlaygroundComponent } from "@/lib/playground-config";
import PlaygroundClient from "@/components/playground/PlaygroundClient";

export function generateStaticParams() {
  return getPlaygroundComponents().map((pc) => ({ component: pc.component.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ component: string }> }) {
  const { component: slug } = await params;
  const pc = getPlaygroundComponent(slug);
  if (!pc) return {};
  return {
    title: `${pc.component.name} playground — ApexRN docs`,
    description: `Try the real ApexRN ${pc.component.name} component live: ${pc.component.description}`,
  };
}

export default async function PlaygroundComponentPage({ params }: { params: Promise<{ component: string }> }) {
  const { component: slug } = await params;
  const pc = getPlaygroundComponent(slug);
  if (!pc) notFound();

  return <PlaygroundClient pc={pc} />;
}
