import { BASE_PATH } from "@/lib/base-path";
import { BUILT_WITH } from "@/lib/built-with";
import { Frame } from "./Frame";
import { MonoLabel } from "./MonoLabel";

export function BuiltWith() {
  return (
    <ul className="built-with">
      {BUILT_WITH.map((e) => (
        <li key={e.label}>
          <Frame shadow="card" className="built-shot">
            {/* Both themes are present; CSS shows the one matching html[data-theme]. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="shot-light" src={`${BASE_PATH}${e.images.light}`} alt={e.alt} width={320} height={640} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="shot-dark" src={`${BASE_PATH}${e.images.dark}`} alt="" aria-hidden="true" width={320} height={640} />
          </Frame>
          <MonoLabel as="p" className="built-caption">
            {e.label}
          </MonoLabel>
        </li>
      ))}
    </ul>
  );
}
