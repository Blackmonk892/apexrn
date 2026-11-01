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
            {e.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${BASE_PATH}${e.image}`} alt={`${e.label} screen built with ApexRN`} />
            ) : (
              <span className="mono-label" data-muted="">
                Screenshot not added yet
              </span>
            )}
          </Frame>
          <MonoLabel as="p" className="built-caption">
            {e.label}
          </MonoLabel>
        </li>
      ))}
    </ul>
  );
}
