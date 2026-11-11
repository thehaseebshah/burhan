# Burhan

A short 3D story game for the browser. This repository holds the **vertical slice**: the
prologue and chapter 1, playable from start to finish, with chapters 2–7 stubbed from their
scripts. The design lives in [`docs/Burhan-complete-docs.md`](docs/Burhan-complete-docs.md)
(build brief, story bible, the eight scripts, beat sheet).

Nothing here is deployed. Do not publish `dist/` without the owner's approval.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` writes a static site to `dist/` that runs from any static host.
`npm run preview` serves that build locally.

## Controls

| | Keyboard and mouse | Gamepad |
|---|---|---|
| Move | W A S D | left stick |
| Camera | mouse (click the game once to capture it), or arrow keys | right stick |
| Run / gallop | Shift | LT |
| Interact | E | A |
| Strike | J or click | X |
| Guard (hold) | K or right-click | LB |
| Dodge | Space | B |
| Grapple / throw | G | Y |
| Remember (zikr), breath (hold) | R | RB |
| Next line | Enter or click | A |
| Conversation wheel | W A S D or mouse, then Enter | d-pad, then A |
| Pause | Esc or P | Start |

## What is built

- **Prologue** (4 scenes): the camp, riding and fighting, the water-carrier the controls
  refuse to strike, Asr and the fade to white, the bus over the pass with the obelisk's
  one-second gold flash.
- **Chapter 1** (12 scenes): the debate on the conversation wheel (Burhan, Jadal and Khitaba
  live, Sohbat locked, crowd meter), the trail chase and the fight Burhan loses (the anger
  rule), Sain's question with every option greyed out, the dawn flicker, the Gilding quad
  (zikr peels the gold, the kashf reveals بھول), the cave's breath rhythm, the three visions,
  Fajr and the first latifa.
- **Chapters 2–7**: placeholders. Each scene exists under its script's name, in chapter
  select and in the save slots, and can be read through line by line.
- Three save slots (localStorage), chapter select, settings, pause, gamepad.

## How it is put together

| Path | What it is |
|---|---|
| `docs/Burhan-complete-docs.md` | The design. The single source for every spoken line. |
| `tools/build-scripts.mjs` | Converts the eight scripts to JSON: scene id, speaker, Urdu, English, audio id, gameplay hooks. |
| `src/data/scripts/*.json` | Generated. Never edit by hand; edit the document and run `npm run scripts`. |
| `src/core/` | Renderer and the Gilding shader (`engine.ts`), input, placeholder sound, settings and saves. |
| `src/world/` | Featureless figures and horse, environment pieces, the controller and combat. |
| `src/ui/` | Everything the player reads: subtitles, conversation wheel, kashf, menus. All HTML, never WebGL. |
| `src/game/director.ts` | What scenes are written against: lines, waits, camera, tasks. |
| `src/game/prologue.ts`, `ch1a.ts`, `ch1b.ts` | The slice's sixteen scenes. |
| `src/game/stub.ts` | The placeholder player for chapters 2–7. |
| `src/game/chapters.ts` | Chapter registry. Each chapter's script and code load lazily. |

To build a chapter: write its scenes against `Ctx` (see `ch1a.ts`), then add a `scenes`
loader for it in `src/game/chapters.ts`. Until then it plays through `stub.ts`.

## Hard rules, and where the code keeps them

1. **No facial features on anyone.** `src/world/figures.ts` draws a face as a smooth sphere
   and nothing else. Believers' faces are mirrors that polish with the heart
   (`setClarity`); people in the Gilding get a blank screen. The horse has no features.
   No statues or carved figures exist in `src/world/props.ts`.
2. **No Prophet and no Sahabi is shown, voiced or stood in for.** None appears in the slice.
3. **Salah, wudu, dua and the azan are never prompts.** Those moments are fixed, distant
   camera shots; the player only walks to the door.
4. **No instruments but percussion.** `src/core/audio.ts` synthesises noise, breath, impacts
   and one daf-like drum stroke. No azan, recitation or nasheed is synthesised: they are
   captions until recordings exist.
5. **Villains are ideas.** Company soldiers and the podcast host are people, not monsters.
6. **Rules of war.** `Combat.playerAttack()` will not start a blow at a non-combatant, and
   non-combatants cannot take damage. Defeated fighters fall and fade; there is no gore.
7. **Quranic text.** Verses are copied exactly by the converter, flagged `recitation`, shown
   only as HTML overlays, never placed in the 3D world, never sent to text-to-speech.
8. **Nothing copied** from another game. Every model is built from primitives in this repo.
9. **No real brands.** Only the script's fictional names appear (SURAT).

## Pending switches

These wait on the owner's ulama. They are switches in `src/core/settings.ts` and in
Settings, not decisions:

- Historical awliya and scholars: `figure` (default, featureless) | `silhouette` | `voice-only`.
- Animals: `featureless` (the only form built).
- Women: `voice-only` (default; Ammi is a voice and a name on a phone) | `off-screen`.
- The azan in the vision of Madinah: on/off (chapter 7, not built yet).
- The organization's name appears nowhere in the game. `npm test` checks this.

## Tests

```bash
npm test
```

Checks the script JSON: every line has Urdu and English, every string matches the source
document exactly, recitation is flagged, and the organization's name is absent.

```bash
npm run test:play
```

Plays all 77 scenes with the auto-player in headless Chromium and fails on any page error.
It needs a build first and the `playwright` package available to Node.
Any scene can be opened directly with `?chapter=ch1&scene=ch1.s06`; add `&auto=1` to let
the auto-player run it.

## Not done yet

- Voice recording. Lines are silent with subtitles; an optional browser text-to-speech
  placeholder is in Settings.
- Recitation and azan recordings (licensed). Captions stand in for them.
- Final art and models. Everything is primitive shapes.
- Chapters 2–7 and their systems (floors, durood light, the upgrade tree and its reversal,
  kushti, the Hall of Faces, the endings).
- Physics is a small custom controller (ground following, circle and box obstacles), not
  Rapier. Ledge climbing is not built; steep ground slows you instead.
- The ulama's answers to the pending questions.
