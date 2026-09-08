# Design system

The rule behind every choice here: **the film is the source of truth.** Colours are
sampled from the actual frames, not invented, so the page and the footage never
disagree about what light looks like in this world.

---

## Palette

Sampled from `assets/chasing-light-master.mp4` with ffmpeg. Region, frame, value:

| Token | Value | Sampled from |
|---|---|---|
| `--color-void` | `#0F0A06` | the darkness around the door, frame 0 |
| `--color-void-lift` | `#171505` | grass in shadow, frame 0 |
| `--color-gold` | `#9E7E27` | the brightest part of the light wedge on the grass |
| `--color-gold-deep` | `#6E5518` | gold darkened for text on light backgrounds |
| `--color-gold-lift` | `#C9A44B` | gold lifted for text on dark backgrounds |
| `--color-threshold` | `#FEEEC3` | the doorway at the moment of passage, frame 96 |
| `--color-light` | `#FAF3E3` | the cloud world, frame 120 |
| `--color-light-edge` | `#F4F2E9` | sky above the clouds |
| `--color-ink` | `#14110D` | — text on light; warm black, never neutral |
| `--color-ink-soft` | `#4A453D` | secondary text |
| `--color-bench` | `#E2E0D7` | not sampled; `light-edge` carrying 8% ink |

**The bench is the one derived colour.** The Lab is meant to read as a different
room — a working surface rather than the page's paper — so it gets its own ground.
The obvious choice for a laboratory surface is a cool grey, and that is exactly what
put the Lab in a different building: everything else here is warm, and a green-grey
beside it reads as a mistake rather than a decision. The bench is the page's own
paper set down one stop, so the room changes without leaving the world.

**The darkness is warm.** `#0F0A06` has more red than blue. An off-the-shelf
blue-black (`#05060a`) put the page and the film in two different rooms — the seam
showed at the handoff. Everything in the dark world is warmed to match.

**Gold is the only accent, and it is earned.** It is the colour the door's light
makes when it lands on something. It marks the things the light touches: section
numbers, links, the active state. It never becomes a button fill or a gradient.

---

## Type

| Role | Face | Notes |
|---|---|---|
| Display / editorial | **Instrument Serif** 400 | statements, questions, pull quotes. Italic for the openings. |
| Interface / structural | **Archivo** 300–400 | titles, labels, meta, body |
| Measurement | **`--font-mono`**, the system stack | experiment numbers, coordinates, counts |

The mono is the system's, not self-hosted, and that is deliberate: it carries about
two dozen characters in the Lab, and a third downloaded face for that is a request
spent badly. It lives as one token so the decision can be reversed in one line. It
is for things that are *measured* — never as a costume for looking technical.

Both are OFL, self-hosted and subset by Astro's fonts API — `latin` + `latin-ext`,
because Turkish needs `ş ğ ı İ ö ü ç`. Only the sans is preloaded; the serif does
not paint until the light world and must not compete with the poster for the
opening bandwidth.

**Line breaks are composed, not left to the viewport.** Copy that carries a rhythm
is stored as an array of lines and rendered as blocks, then allowed to reflow
normally below `30rem` where the intended breaks stop fitting.

**Casing across languages.** `text-transform: uppercase` under `lang="tr"` applies
Turkish rules and turns "Light" into "LİGHT". Anything English inside a Turkish
page carries `lang="en"`.

### Scale

Fluid, `clamp()` everywhere, no fixed steps. Mobile is not the desktop scale
shrunk — the compositions are set separately.

| | min | max |
|---|---|---|
| Hero title | 1.5rem | 3.1rem |
| Section statement | 1.7rem | 3.4rem |
| Project name | 2.1rem | 4.6rem |
| Question | 1.35rem | 2.3rem |
| Body | 0.95rem | 1.05rem |
| Label / meta | 0.625rem | 0.7rem, `0.24–0.34em` tracking, uppercase |

---

## Space

Vertical rhythm is measured in viewport height, not pixels: sections breathe in
`svh` so the composition holds on any screen. Horizontal gutter is `6vw`, floored
at `2.5rem`.

`svh`, not `vh` — mobile browser chrome makes `vh` jump when the address bar
retracts, and the hero is sticky, so the jump would be visible.

---

## Motion

| Rule | Why |
|---|---|
| Scroll drives the film; nothing autoplays | the visitor sets the pace of their own journey |
| `cubic-bezier(0.16, 1, 0.3, 1)` for reveals, ~1s | decelerating, no bounce; calm rather than springy |
| Reveal once, never on the way back up | re-animating on reverse scroll reads as a glitch |
| No effect without a narrative reason | the concept is the light, not the toolkit |
| `prefers-reduced-motion` removes the journey, keeps the composition | the hero collapses to one screen holding the opening frame |

The hero scrub eases toward its target rather than assigning `currentTime`
directly: a write on every frame queues seeks faster than the decoder retires
them, and the picture stutters.

---

## Imagery

- The film is never re-cut for looks. `tools/encode.sh` regenerates every
  derivative from the master and records the measurements behind each setting.
- The poster is the film's own opening composition, and it also lives as the
  stage background — once the video reaches `readyState 2` the browser drops the
  `poster` attribute, and an unpainted frame would flash black.
- The handoff at the door uses the film's **real final frame**, not the reference
  still it was generated toward. The reference is a palette target; the frame is
  what the eye just saw.

---

## Language

Turkish at the root, English under `/en`; `/tr` redirects, because it was the
Turkish URL before the two swapped. The site's own language is what the domain
people type should open in. Copy is written natively in both, never translated
line-for-line — same person, same voice, different language. It lives in
`src/content/copy.ts`, out of the components.

The name and the role are said twice on the page, so they are written once at the
top of that file and spread into both places. They had already drifted apart once.

The projects are not copy but data: one JSON file each under
`src/content/projects/`, so the panel can add one without editing a module.

`CHASING LIGHT` keeps its English name in both.

---

## What this is not

No glassmorphism, no neon gradients, no progress bars, no technology logo walls,
no equal-sized project cards. Three different kinds of work in three identical
boxes would erase the difference between them, which is the only interesting part.
