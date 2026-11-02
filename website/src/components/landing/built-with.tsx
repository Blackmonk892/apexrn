import { BASE_PATH } from "@/lib/base-path";

const SCREENS = [
  { id: "settings", title: "Settings", parts: "AppBar, ListItem, Switch, Select, AlertDialog" },
  { id: "checkout", title: "Checkout", parts: "AppBar, Card, Input, NumberInput, RadioGroup" },
  { id: "inbox", title: "Inbox", parts: "AppBar, SearchBar, SegmentedControl, ListItem, FAB" },
];

export function BuiltWith() {
  return (
    <ul className="lp-built">
      {SCREENS.map((s) => (
        <li key={s.id}>
          <figure>
            <div className="lp-built-frame">
              {/* eslint-disable @next/next/no-img-element -- static export, fixed dimensions */}
              <img className="lp-img-light" src={`${BASE_PATH}/landing/ref-${s.id}-light.png`} width={320} height={548} alt={`${s.title} reference screen in the light look`} />
              <img className="lp-img-dark" src={`${BASE_PATH}/landing/ref-${s.id}-dark.png`} width={320} height={548} alt={`${s.title} reference screen in the dark look`} />
              {/* eslint-enable @next/next/no-img-element */}
            </div>
            <figcaption className="lp-label">
              {s.title}
              <span className="lp-caption-parts" translate="no">
                {s.parts}
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
