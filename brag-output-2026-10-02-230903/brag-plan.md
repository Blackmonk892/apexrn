# Brag Plan: ApexRN

## What is this app?
ApexRN (`@apexrn/ui`) is a brutalist, copy-into-your-app React Native component library for Expo — shadcn's "you own the code" model, built for native apps instead of the web.

## The angle
Every other RN/mobile UI kit converges on the same soft, rounded, pastel default. ApexRN is the opposite on purpose: thick black borders, zero radius, hard offset shadows, a loud neo-brutalist palette, and snappy spring-physics taps — and instead of installing it as a package, `npx apexrn init` drops the actual component source into your project. The video's job is simple: let the real, running components carry the whole thing, with the site's own line as the hook.

## Hook (first 2-3 seconds)
A single Button, full-bleed, gets pressed — it squashes hard into its own offset shadow (the library's signature tap). As it lands, the site's real headline sets in, small and restrained beneath it: "Every rounded corner is a decision you didn't make." Text never outweighs the button.

## Key moments (the middle)
- The Showcase screen's hero Card (Avatar + "Production Ready" Badge + metrics row + Progress bar) sitting inside the phone frame — the library's actual composed "hub" screen, not a mockup.
- Switching into the Showcase's Actions tab and firing the real `Dialog` — `DialogTrigger` → `DialogContent` with `DialogTitle`/`DialogDescription`/`DialogFooter` sliding in live, over a scrim, then dismissing.
- A hard light→dark snap across that same screen: the whole neo-brutalist palette (coral `#FF5252`/`#FF6B6B`, indigo `#3D5AFE`/`#4D5FF5`, yellow `#FFD600`/`#FFEA00`) and every border/shadow flipping at once, proving it's one token file, not per-component overrides.
- A fast beat of real control variety: Chip toggling selected, Checkbox ticking, Switch flipping, Progress advancing — quick, confident cuts, not a feature-list recitation.

## Outro / punchline
A terminal line types out `npx apexrn init` — then one beat of stillness — then the real line: "You own the code." Component source, not a package. Wordmark on the last frame.

## User flow worth showing
Entry → key action → result, pulled straight from `demo/src/screens/ShowcaseScreen.tsx`:
1. **Entry:** AppBar + hero Card load into the Showcase screen (Avatar, Badge, metrics, Progress).
2. **Key action:** user taps into the Actions tab and opens the real compound `Dialog` ("APEXRN DIALOG... This is a real React Native Dialog running live inside the embedded showcase iframe.").
3. **Result:** Dialog closes; a theme toggle flips the whole screen light→dark, proving the one-token-file restyle claim live, in the same screen the viewer just watched work.

## Tone
- Preset: polished
- Creative direction: a confident, dev-tool product reel — understated and precise, not jokey. Confidence through restraint, long holds on real UI, no gimmicks.
- Interpretation: fewer, longer scenes (4, not 6-8); crossfades/slides over hard cuts except the one deliberate hard snap (the theme flip, which should feel like a snap on purpose); typography stays small and supporting, never competing with the component screens; motion is purposeful and physics-driven (press squash, theme snap), not decorative.

## Format: landscape — 1920x1080
## Duration: 21 seconds

## Visual identity (from the project)
- Background (light): `#FFFFFF` · Background (dark): `#1A1A1A`
- Foreground (light): `#000000` · Foreground (dark): `#FFFFFF`
- Primary/accent: coral `#FF5252` (dark-mode `#FF6B6B`), indigo `#3D5AFE` (dark-mode `#4D5FF5`), yellow `#FFD600` (dark-mode `#FFEA00`)
- Borders/shadows: pure black (light) / pure white (dark) — hard offset shadows, 2-4px borders, zero border-radius
- Display font: the site's bold geometric display face (`font-display` in `website/src/app/globals.css`) — heavy weight, tight tracking
- Body font: the site's mono/sans body pairing (`font-mono` for code/labels, system sans for body copy)
- Strongest visual element: the hard-offset "sticker shadow" + zero-radius block, as seen on every `BrutalSurface`-built component and the website's own `edge-block` cards

## Share copy (draft)
Every rounded corner is a decision you didn't make. ApexRN: a brutalist React Native component library you copy straight into your Expo app — thick borders, hard shadows, real press physics, and code you actually own.

## Audio direction
- Role: sparse professional accents over a steady, clean instrumental bed
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady/clean, 109.96 BPM, recommended for `polished`/`cinematic`)
- Music treatment: start at 0s, volume ~0.32, gentle fade-in over the first 0.5s, fade out under the last ~1s of the outro
- Music cue guidance: bundled preset read (`happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.md/json`). Target strong cues: **8.74s** (0.99, strong_beat — Dialog-open landing) and **17.47s** (0.99, strong_beat — outro type-in landing). Beat-grid window for the fast control cuts: 9.83 / 12.02 / 13.64 / 15.29 (≈1.6-1.9s apart — fine for non-text visual accents, not for a reading floor).
- Audio-reactive treatment: subtle — let the Card's hard shadow / scrim darkness breathe very slightly with music RMS; no waveform/equalizer visuals.
- SFX posture: minimal but present (2-3 cues), per the `polished` tone — nothing aggressive, no stacking.
- Audio-coupled moments: button press-squash (soft impact), Dialog open (soft reveal/drop), theme snap (a single clean switch sound), terminal typing (randomized keypress ticks, thinned out — only a few characters need sound, not the whole string).
- Restraint rule: no stacked/simultaneous SFX, no SFX louder than the music bed, no sound on the fast control cuts beyond at most one quiet accent — let the visual rhythm carry that beat.

## Storyboard

### Scene 1 — Hook — 3s
A single real `Button` (primary variant, coral fill, black border, hard offset shadow) fills most of the frame on a plain background. It gets pressed: squashes toward its shadow per the library's actual spring press-physics, releases. As it releases, the real site headline sets in small beneath it, left-aligned, restrained: "Every rounded corner is a decision you didn't make." Text stays subordinate to the button the whole time.
Sequential/interaction: yes — simulate a single tap-down/release on the Button; the headline fades/slides in only after release, not simultaneously.
Audio intent: quiet anticipation into a soft confirming thud on the press-release.
Audio-coupled idea: one soft impact SFX exactly on the release/squash-back frame.
Music: steady bed, just faded in.
Transition mood: soft crossfade → Scene 2.

### Scene 2 — Product reveal + live Dialog — 6s (3.0-9.0s)
Phone frame, real `ShowcaseScreen`: AppBar ("APEXRN MOBILE"), hero Card (Avatar "AP", "Production Ready" title, "STABLE" accent Badge, metrics row, Progress bar at 72%). Holds briefly, then the Tabs switch to "Actions" and the real `Dialog` opens — `DialogTrigger`→`DialogContent` sliding/fading in over a scrim with its title "APEXRN DIALOG" and description visible — then dismisses just before the transition.
Sequential/interaction: yes — Card elements are already settled (no re-animating what's already real UI); Tabs switch is a simulated tap; Dialog open is a simulated tap on the primary "OPEN DIALOG DEMO" button, then a simulated tap to close.
Audio intent: confident, matter-of-fact — proving the component works, not hyping it.
Audio-coupled idea: one quiet tap/select sound on the Tabs switch; one soft reveal cue on the Dialog's entrance, timed to land at the 8.74s strong cue (±0.15s). // beat-locked: 8.74s
Music: steady bed, unchanged.
Transition mood: hard snap (intentional) → Scene 3.

### Scene 3 — Theme flip + fast component cuts — 7s (9.0-16.0s)
The same Showcase screen snaps from light to dark in one hard cut — border/shadow color, background, and every token flipping together (not a crossfade; this one must read as a deliberate "flip the switch" moment). Immediately after, four fast cuts of real controls in the now-dark theme: Chip toggling selected, Checkbox ticking on, Switch flipping on, Progress bar advancing — quick, confident, each held just long enough to register the action, not read any label.
Sequential/interaction: yes — theme flip is instantaneous (no tween) right on the cut; the four control cuts are each a single simulated interaction (tap/toggle), landing near consecutive beat-grid points: Chip ~9.83s, Checkbox ~12.02s, Switch ~13.64s, Progress ~15.29s. // beat-grid: chip 9.83s, checkbox 12.02s, switch 13.64s, progress 15.29s
Audio intent: the flip reads as a single clean "switch" moment; the four cuts stay visually rhythmic with at most one very quiet accent, not four stacked SFX.
Audio-coupled idea: one switch/toggle SFX exactly on the theme-flip frame; optionally one soft accent on the strongest of the four control cuts only.
Music: steady bed, unchanged.
Transition mood: clean slide → Scene 4.

### Scene 4 — Outro / CTA — 5s (16.0-21.0s)
A plain dark terminal-style line types out character by character: `npx apexrn init`. A short beat of stillness after it completes. Then the real product line sets: "You own the code." — small ApexRN wordmark on the final frame, same palette/border/shadow language as the rest of the video.
Sequential/interaction: yes — the command types out character by character (simulated typing), then the punchline line and wordmark settle in and hold to the end.
Audio intent: the typing should feel deliberate and final, not rushed; the punchline lands with quiet confidence as the music resolves.
Audio-coupled idea: a handful of randomized keypress ticks across the typed command (thinned — not every character), one soft final cue as "You own the code." settles, aiming near the 17.47s strong cue for that settle. // beat-locked: 17.47s
Music: fades out under the final ~1s hold.
Transition mood: — (final scene, hold to black/last frame).

**Music mood for this video:** polished / steady-clean instrumental bed, restrained throughout.
**Audio summary:** One continuous, unobtrusive music bed (vol-12) under the whole video, two beat-locked major moments (Dialog reveal at 8.74s, outro settle at 17.47s), light beat-grid alignment on the four fast control cuts, and no more than 4-5 total SFX cues in 21 seconds.
