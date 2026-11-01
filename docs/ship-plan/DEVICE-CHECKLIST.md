# Device checklist — ApexRN 0.1.0

About 30 minutes. Android is already covered on an emulator by the Maestro flows; this pass is for what automation can't judge: feel, iOS, screen readers, big text and reduced motion.

**Setup:** `cd demo && npx expo start`, open in Expo Go (or a dev build) on an iPhone and, if you have one, an Android phone. Work down the home screen in order. Mark each line ✅ / ❌ and add a few words for anything off; send the list back as is.

## Design system

- [ ] Specimen: the four quadrants read clearly; the raw dark shadow is visible but quiet.

## Atoms

- [ ] Button: press sinks onto the shadow with a light haptic; loading keeps the button's width.
- [ ] Label / Separator / Badge / Avatar: nothing clipped or misaligned.
- [ ] Skeleton / Progress: the bands move; with Reduce Motion on, they stand still.
- [ ] Alert / Card: status icons sit level with their text; a pressable card sinks.
- [ ] Empty state: centred and start-aligned versions both look intentional.
- [ ] List item: rows press with a muted fill; 72-high rows aren't cramped.
- [ ] FAB: sits above the home indicator; hides and returns smoothly.

## Inputs

- [ ] Input / Textarea: the keyboard doesn't cover the focused field; Textarea grows to its max rows, then scrolls.
- [ ] Checkbox / Switch / Radio group: the whole row toggles, not just the box.
- [ ] Slider: drag feels direct (no lag); tapping the track jumps there; VoiceOver swipe up/down changes the value.
- [ ] Input OTP: an SMS code autofills on iOS (if you can trigger one); pasting a code fills every cell.
- [ ] Segmented control: the block slides; with Reduce Motion it jumps.

## Motion and navigation

- [ ] Marquee: loops without a seam; press and hold pauses it.
- [ ] Carousel: a swipe lands exactly on a page; prev/next buttons work.
- [ ] Accordion: rows below slide down smoothly when one opens.
- [ ] Tabs: the block slides; long tab lists scroll.
- [ ] Toast: swipe sideways dismisses; a destructive toast is announced by VoiceOver/TalkBack straight away.
- [ ] App bar: the large title collapses smoothly while scrolling.
- [ ] Drawer: edge swipe opens on Android (off on iOS by design); swipe closes; Android back closes.
- [ ] Bottom nav: sits above the home indicator; at the largest text size labels hide and icons remain.
- [ ] Search bar: tapping a recent search fills the field even with the keyboard open.
- [ ] Chip: selected chips invert; the remove button is easy to hit.

## Overlays

- [ ] Sheet: drag the handle down to dismiss; Android back closes; content scrolls inside without fighting the drag.
- [ ] Dialog / Alert dialog: VoiceOver/TalkBack focus lands on the title when it opens; alert dialog ignores a tap outside.
- [ ] Dropdown menu: opens below its button, flips above near the bottom of the screen.
- [ ] Select: the search box appears for the country list; picking closes the sheet.
- [ ] Date picker: the whole month grid is visible (nothing cut off at the bottom); picking a day closes it.
- [ ] Number input: holding + speeds up; VoiceOver swipe up/down changes the value.

## Reference screens

- [ ] Settings / Checkout / Inbox: each looks like a real app screen in light and dark.

## Whole-app passes

- [ ] Largest text size (Settings → Accessibility → Larger Text): open five screens of your choice — nothing overlaps or gets cut off.
- [ ] Reduce Motion on: open Drawer, Sheet, Toast — they fade instead of sliding.
- [ ] Screen reader: on Sheet, Dialog and Input, focus can't escape the overlay, and every button has a spoken name.
