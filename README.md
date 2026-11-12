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

## How it looks

- **Rendering:** physically based materials, real-time sun and moon shadows, a sky with
  clouds and stars that also lights the scene, bloom, tone mapping and film grading.
- **Surfaces:** one shader gives every material its grain in world space: brick, plaster,
  planks, paving, asphalt, cloth, ground, bark, rock, metal, water, and rows of windows on
  buildings. It also carries the Gilding, as real metallic gold leaf laid in sheets.
- **People:** a modelled, skinned human body with hands and fingers, dressed by region
  (top, trousers, shoes, hair), with tunic skirts, coats, turbans and caps on top. The face
  is a smooth oval: see the hard rules. Crowds use a low-detail copy of the same body.
- **World:** grass that sways, leafy trees and pines, rocks, water, a stone mosque, campus
  blocks, a road with street lamps and passing cars, tents, rope beds.
- **Quality:** Auto, Low, Medium, High in Settings. Auto lowers resolution first, then
  turns off post-processing, to hold the frame rate. `?q=low|medium|high` forces a tier.

## How it is put together

| Path | What it is |
|---|---|
| `docs/Burhan-complete-docs.md` | The design. The single source for every spoken line. |
| `tools/build-scripts.mjs` | Converts the eight scripts to JSON: scene id, speaker, Urdu, English, audio id, gameplay hooks. |
| `tools/build-human.mjs` | Builds the human body (`src/assets/human.json`) from the MakeHuman base mesh: removes the face, reduces the rig, dresses the body. Run with `npm run human`. |
| `src/data/scripts/*.json` | Generated. Never edit by hand; edit the document and run `npm run scripts`. |
| `src/core/` | Renderer, sky, shadows, post-processing and the surface and Gilding shader (`engine.ts`), input, placeholder sound, settings and saves. |
| `src/world/` | The skinned human, horse and crowds (`figures.ts`), the world's pieces (`props.ts`), the controller and combat. |
| `src/ui/` | Everything the player reads: subtitles, conversation wheel, kashf, menus. All HTML, never WebGL. |
| `src/game/director.ts` | What scenes are written against: lines, waits, camera, tasks. |
| `src/game/prologue.ts`, `ch1a.ts`, `ch1b.ts` | The slice's sixteen scenes. |
| `src/game/stub.ts` | The placeholder player for chapters 2–7. |
| `src/game/chapters.ts` | Chapter registry. Each chapter's script and code load lazily. |

To build a chapter: write its scenes against `Ctx` (see `ch1a.ts`), then add a `scenes`
loader for it in `src/game/chapters.ts`. Until then it plays through `stub.ts`.

## Hard rules, and where the code keeps them

1. **No facial features on anyone.** `tools/build-human.mjs` projects every vertex of the
   modelled head onto a smooth oval, so no eyes, nose, mouth or ears survive into the game;
   `src/world/figures.ts` never draws anything on it. Believers' faces are mirrors that polish with the heart
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
8. **Nothing copied** from another game. The human body comes from MakeHuman's CC0 base
   mesh (not a game asset); everything else is generated in this repo.
9. **No real brands.** Only the script's fictional names appear (SURAT).

## Pending switches

These wait on the owner's ulama. They are switches in `src/core/settings.ts` and in
Settings, not decisions:

- Historical awliya and scholars: `figure` (default, featureless) | `silhouette` | `voice-only`.
- Animals: `featureless` (the only form built).
- Women: `voice-only` (default; Ammi is a voice and a name on a phone) | `off-screen`.
- The azan in the vision of Madinah: on/off (chapter 7, not built yet).
- The organization's name appears nowhere in the game. `npm test` checks this.

## Third-party assets

- **MakeHuman** base mesh, default rig and skin weights, released by the MakeHuman team
  under CC0 1.0 (<https://github.com/makehumancommunity/makehuman>). Used for the human body.
- **Noto Nastaliq Urdu**, SIL Open Font License.
- **three.js**, MIT.

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
- Final art. The human body is a real model, but clothes are generated from it rather
  than tailored, animation is procedural rather than motion-captured, and buildings,
  vehicles and props are generated shapes. A studio-level look needs authored assets.
- Chapters 2–7 and their systems (floors, durood light, the upgrade tree and its reversal,
  kushti, the Hall of Faces, the endings).
- Physics is a small custom controller (ground following, circle and box obstacles), not
  Rapier. Ledge climbing is not built; steep ground slows you instead.
- The ulama's answers to the pending questions.
