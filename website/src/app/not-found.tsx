import { HomeLayout } from "fumadocs-ui/layouts/home";
import Link from "next/link";
import { baseOptions } from "@/lib/layout.shared";

export const metadata = { title: "Page not found", description: "This page does not exist." };

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="ax-placeholder">
        <p className="ax-label">404</p>
        <h1>This page does not exist.</h1>
        <p>The address does not match a part, a docs page or anything else on this site.</p>
        <p>
          <Link href="/docs/components">Browse all parts</Link>
        </p>
      </div>
    </HomeLayout>
  );
}
