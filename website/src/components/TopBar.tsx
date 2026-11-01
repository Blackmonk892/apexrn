"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { GITHUB_URL } from "@/lib/site";
import { useDismissableOverlay } from "@/lib/use-dismissable-overlay";
import { SearchDialog } from "./SearchDialog";
import { ThemeSwitch } from "./ThemeSwitch";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/components", label: "Components" },
  { href: "/docs/installation#cli", label: "CLI" },
];

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useDismissableOverlay(menuOpen, closeMenu, menuRef);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="top-bar">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="page top-bar-inner">
        <Link href="/" className="wordmark" aria-label="ApexRN home">
          APEXRN
        </Link>
        <nav aria-label="Main" className="desktop-only" style={{ gap: 16, flex: 1 }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
          <a href={GITHUB_URL} className="nav-link">
            GitHub
          </a>
        </nav>
        <div className="desktop-only" style={{ gap: 12, alignItems: "center" }}>
          <button type="button" className="btn mono-label" onClick={() => setSearchOpen(true)} aria-label="Search (Command K)">
            Search ⌘K
          </button>
          <ThemeSwitch />
        </div>
        <div className="mobile-only" style={{ gap: 8, marginLeft: "auto" }}>
          <button type="button" className="btn mono-label" onClick={() => setSearchOpen(true)}>
            Search
          </button>
          <button
            type="button"
            className="btn mono-label"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div ref={menuRef} className="page" style={{ paddingBottom: 48 }}>
            <div className="top-bar-inner" style={{ justifyContent: "space-between" }}>
              <span className="wordmark">APEXRN</span>
              <button type="button" className="btn mono-label" onClick={closeMenu}>
                Close
              </button>
            </div>
            <nav aria-label="Menu" style={{ borderTop: "var(--rule) solid var(--ink)" }}>
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="menu-link" onClick={closeMenu}>
                  {l.label}
                </Link>
              ))}
              <a href={GITHUB_URL} className="menu-link">
                GitHub
              </a>
            </nav>
            <div style={{ marginTop: 24 }}>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
