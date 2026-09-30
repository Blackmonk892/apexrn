import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import PlaygroundHeader from "@/components/playground/PlaygroundHeader";
import PlaygroundSidebar from "@/components/playground/PlaygroundSidebar";

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <PlaygroundHeader />
        <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
              <PlaygroundSidebar />
            </div>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
