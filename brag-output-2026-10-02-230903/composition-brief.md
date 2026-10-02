# Hyperframes Composition Brief: ApexRN

## Objective
Create a short, polished launch-style brag video for ApexRN (`@apexrn/ui`), a brutalist React Native / Expo component library.

## Output
- Composition directory: `brag-output-2026-10-02-230903/composition/`
- Rendered video: `brag-output-2026-10-02-230903/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: `C:\Users\xoxo3\Desktop\Projects\apexrn`
- Primary files read: `CLAUDE.md`, `registry/meta.json`, `packages/ui/lib/colors.ts`, `demo/src/screens/ShowcaseScreen.tsx`, `website/src/components/HeroSection.tsx`, `PhilosophySection.tsx`, `ExploreSection.tsx`, `PhoneFrame.tsx`, `design/AUDIT.md`, `website/bugs.md`
- Product name: ApexRN
- Tagline / strongest claim: "Every rounded corner is a decision you didn't make." (verbatim, `website/src/components/HeroSection.tsx`)
- Secondary verbatim lines available: "You own the code" (`PhilosophySection.tsx` lead title — may be lightly re-cased, do not alter meaning); install command `npx apexrn init` (verbatim, `HeroSection.tsx`)
- Key UI/visual moment to recreate: the real `demo/src/screens/ShowcaseScreen.tsx` — AppBar + hero Card (Avatar "AP", "Production Ready" title, "STABLE" accent Badge, metrics row, Progress at 72%) + Tabs (Overview/Controls/Actions) + a live compound `Dialog` opened from the Actions tab ("APEXRN DIALOG" / "This is a real React Native Dialog running live inside the embedded showcase iframe.")
- Copy that must appear verbatim:
  - "Every rounded corner is a decision you didn't make."
  - "npx apexrn init"
  - "You own the code." (adapted minimally from "You own the code" for punctuation only)

## Creative Direction
- Tone preset: polished
- Creative direction: confident dev-tool product reel — understated, precise, restrained. Long holds on real UI. One deliberate hard "snap" (the theme flip) as the single non-restrained moment; everything else uses soft, intentional transitions.
- Interpretation: 4 scenes, not 6-8. Typography stays small/supporting — never competes with the component screens. Motion is physics-driven (the library's own press-squash and a hard theme-token snap), not decorative.
- Angle: Every other RN UI kit converges on the same soft rounded pastel default. ApexRN is the deliberate opposite — thick borders, zero radius, hard offset shadows, a loud neo-brutalist palette, snappy spring-physics taps — and it's shipped as source you copy into your app via `npx apexrn init`, not a package you install.
- Hook: a single real Button gets pressed, squashes into its own hard shadow, then the real headline sets in small beneath it.
- Outro / punchline: `npx apexrn init` types out, then "You own the code." settles with the wordmark.
- Avoid:
  - Generic SaaS language ("streamline your workflow" etc. — banned)
  - Abstract filler visuals / color washes / generic motion graphics
  - Any invented component, invented copy, or invented UI not grounded in the files above
  - Letting hook/outro typography outweigh the real component screens

## Visual Identity
- Background: light `#FFFFFF` / dark `#1A1A1A`
- Text: light `#000000` / dark `#FFFFFF`
- Accent: coral `#FF5252` (dark `#FF6B6B`), indigo `#3D5AFE` (dark `#4D5FF5`), yellow `#FFD600` (dark `#FFEA00`)
- Borders/shadows: pure black (light) / pure white (dark); 2-4px borders; hard, unblurred offset shadows (`shadowOffset.subtle/standard/elevated` = 2/4/6px); zero border-radius everywhere — do not round any corner in the composition itself
- Display font: a bold, geometric display face (heavy weight, tight tracking) matching the site's `font-display`; body/labels in a mono or grotesk matching the site's `font-mono`/system sans
- Visual references from the project: `packages/ui/lib/colors.ts` tokens (source of truth for every color above), `demo/src/screens/ShowcaseScreen.tsx` (the screen to recreate/capture), the website's "sticker shadow" `edge-block` treatment (hard offset shadow + thick border, no blur) as the model for any UI chrome built directly in the composition

## Lab asset — the real compiled component build
The actual, compiled web build of the demo Lab (not a recreation) is staged at `composition/assets/lab/index.html` (copied verbatim from `website/public/lab/`, 1.9MB, self-contained — same build the live website embeds in its own phone-frame previews). Use it as an `<iframe>` source to capture/drive the real `ShowcaseScreen` rather than recreating the UI in HTML/CSS.

Routing contract (verified in `demo/App.tsx`):
- `index.html#<screen>` navigates to that screen by name, e.g. `index.html#showcase`, `#button`, `#card`, `#dialog`, `#chip`, `#checkbox`, `#switch`, `#progress`, `#tabs`.
- Theme is set only via `postMessage({ type: 'apexrn:theme', mode: 'light' | 'dark' }, origin)` to the iframe's `contentWindow`, sent after the iframe posts `{ type: 'apexrn:ready' }` back to its parent — this is the exact mechanism `website/src/components/PhoneFrame.tsx` already uses in production.
- There is no hash parameter for tab index or dialog-open state — the Showcase screen's "Actions" tab and Dialog must be reached by a real simulated interaction (a synthetic click/press dispatched into the iframe's document) once it loads on `#showcase`, not by a URL shortcut. The app is real React Native Web underneath, so a genuine DOM click on the rendered Tabs trigger / Dialog trigger produces the same real animation a user would see.
- This same iframe (on `#button`) is also the correct source for the Scene 1 hook — a real Button, real press-physics — rather than a rebuilt lookalike.

Hyperframes decides how to capture/drive this (live iframe embedded in the render, or a pre-captured clip extracted from it during asset prep) — `/brag` is only specifying that the source of truth for every "real UI" moment in this video is this build, loaded and interacted with exactly as described above, never a re-authored HTML mockup of it.

## Storyboard
Use the storyboard in `brag-plan.md` as the creative contract. Scene summary:

1. **Hook** — 3s — A real primary Button, full-bleed, pressed and squashed into its own hard offset shadow; the real headline ("Every rounded corner is a decision you didn't make.") sets in small beneath it only after the release.
2. **Product reveal + live Dialog** — 6s (3.0–9.0s) — Phone-framed `ShowcaseScreen`: AppBar, hero Card (Avatar/Badge/metrics/Progress), Tabs switch to Actions, a real compound `Dialog` opens (title + description visible) and dismisses.
3. **Theme flip + fast component cuts** — 7s (9.0–16.0s) — One instantaneous light→dark snap across the same screen (every token flips together, no crossfade), then four fast single-interaction cuts: Chip toggle, Checkbox tick, Switch flip, Progress advance.
4. **Outro / CTA** — 5s (16.0–21.0s) — `npx apexrn init` types out character by character, a beat of stillness, then "You own the code." settles with the ApexRN wordmark on the final frame.

Reproduce the Showcase screen's actual composition (component choices, labels, copy) as described — do not invent different components, labels, or layouts for scenes 2-3.

## Audio
- Audio role: sparse professional accents over a steady, clean instrumental bed
- Audio arc: music fades in under Scene 1, stays steady and unobtrusive through Scenes 2-3, fades out under the final hold of Scene 4
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (already copied to `composition/assets/music/`), volume ~0.32, fade-in ~0.5s at start, fade-out over the last ~1s
- Music cue guidance: bundled preset copied to `composition/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` (tempo 109.96 BPM). Strong cues to consider for major moments: 8.74s (Dialog-open landing, Scene 2→3 boundary) and 17.47s (outro settle, Scene 4). Beat-grid points for the four fast control cuts in Scene 3: ~9.83s, 12.02s, 13.64s, 15.29s. These are optional hints — ignore any that hurt readability or pacing.
- Audio-reactive treatment: subtle — the Card's hard shadow or the Dialog's scrim darkness may breathe very slightly with music RMS; no waveform/equalizer/particle visuals.
- Audio-coupled moments:
  - Scene 1 — Button press-squash — one soft impact SFX on the release frame
  - Scene 2 — Tabs switch to Actions — one quiet tap/select SFX; Dialog open — one soft reveal SFX, ideally landing near the 8.74s strong cue (±0.15s)
  - Scene 3 — theme flip — one clean switch/toggle SFX exactly on the flip frame; at most one quiet accent across the four fast control cuts (not one per cut)
  - Scene 4 — typed command — a handful of randomized keypress ticks (thinned, not every character); "You own the code." settle — one soft final cue near 17.47s
- SFX selection guidance: match the actual motion once implemented — impact/soft family for the press and reveal, a switch/toggle family for the theme flip, keyboard keypress set (randomized) for the typed command. Keep total SFX count to 4-5 across the whole video; nothing stacked, nothing louder than the music bed.
- SFX analysis guidance: use `<hyperframes-skill-dir>/assets/sfx/sfx-analysis.md` (via the hyperframes-creative skill) to prefer low high-frequency-risk files, since several cues repeat similar motion types (taps, switches).
- Exact SFX choice: Hyperframes chooses exact filenames, timestamps, density, and volume once the animation is implemented.
- Audio files: music is already in `composition/assets/music/` (and its cue JSON in `composition/assets/music/cues/`); copy any SFX Hyperframes selects into `composition/assets/sfx/...` following the asset-path convention.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). `/brag` is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project (the Showcase screen, the Dialog, the real headline/CLI copy, the real color tokens) — do not invent components, labels, or claims not grounded in the files listed under Source Material.
- Keep all text readable in the final render; respect the reading-time floors from `brag-plan.md` (short label ≈0.8s settled, the headline sentence gets the most hold time of anything in the video).
- Keep the video within 15-25 seconds (target 21s per the plan).
- Include the planned music/SFX layer; music file is already staged in `composition/assets/music/`.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet — choose exact SFX after the visual animation exists.
- Treat the music cue JSON as optional timing hints. Major reveals (Dialog open, outro settle) may move toward the 8.74s/17.47s strong cues within ±0.15s; the four Scene 3 control cuts may align to the listed beat-grid points within ±0.10s. Ignore any cue that hurts readability, pacing, or the product story.
- Use SFX to support motion and interaction as described in the Audio section above; keep restraint — this is the `polished` tone, not `chaotic`.
- Implement the Scene 3 theme flip as a true instantaneous snap (not a crossfade/tween) across every token at once — this is the one deliberate hard cut in an otherwise soft-transition video.
- When implementing the audio-reactive treatment, follow the `hyperframes-creative` skill's own extraction workflow and helper location — `/brag` does not provide or hardcode a path to it. If extraction is unavailable, skip audio-reactive and note it rather than blocking the render.
- Use local assets for audio and any required runtime/media dependencies.
- Run `hyperframes check` before render — it is `/brag`'s single gate.
- Keep creation and rendering local. Remote or publishing workflows require a separate explicit user request.
