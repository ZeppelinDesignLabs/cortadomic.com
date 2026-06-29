---
title: "Hunting a mystery Porsche engine tick"
author: "Rick"
authorTitle: "Former Apple camera engineer · Gentleman Scientist"
location: ""
pubDate: 2026-06-28
featured: true
model: "Cortado"
summary: "A former Apple camera engineer uses a Cortado to chase a chaotic, unexplained tick in Porsche engines — and the phase data points to a culprit beyond the engine itself."
coverImage: "/images/submissions/rick-porsche/cortado-on-engine.jpg"
coverAlt: "Cortado contact microphone magnet-mounted to the oil sump on the bottom of a Porsche engine"
images:
  - src: "/images/submissions/rick-porsche/cortado-with-magnet.jpg"
    alt: "Magnet attached to the Cortado case with JB Weld epoxy"
  - src: "/images/submissions/rick-porsche/cortado-on-engine.jpg"
    alt: "Cortado attached to the oil sump on the bottom of the engine"
  - src: "/images/submissions/rick-porsche/exhaust-phase-plot.png"
    alt: "Exhaust phase plot showing six ignitions over a complete engine cycle, demonstrating stable phase tracking"
  - src: "/images/submissions/rick-porsche/engine-tick-phase-plot.png"
    alt: "Engine tick phase plot — green samples recorded with clutch engaged, blue with clutch disengaged"
  - src: "/images/submissions/rick-porsche/event-separation.png"
    alt: "Event separation plot showing periodic ticks with long skips between arrivals"
video:
  provider: "youtube"
  embedId: "fagGzOkzLGc"
  title: "Chaotic ticking — Porsche Cayman S at idle, clutch depressed"
order: 1
---

I'm a former Apple camera engineer, and presently a Gentleman Scientist (e.g. retired). One of my new projects has been to study the noise signatures of Porsche engines to identify sources of ticking. I began my investigation with an unusual chaotic tick that many other owners have observed, but that no one could explain.

I tried to use standard broadcast microphones at the outset of the project. However, I couldn't isolate the engine's ticking from the sounds of the fans and exhaust. Therefore I switched to the Cortado mic, which is perfect for high-frequency impulsive noise. I attached the mic to a ferrous bolt on the bottom of the engine by epoxying a magnet to it. I simultaneously recorded the exhaust note with a broadcast mic from behind the car in order to place the ticks relative to engine rotation.

## What the data shows

- **Exhaust phase plot** — The exhaust note over the duration of the recording: six ignitions over a complete engine cycle (one camshaft revolution and two crankshaft revolutions). The stability of the pattern demonstrates that the engine phase is being tracked correctly.
- **Engine tick phase plot** — Engine ticking recorded with the Cortado mic. The green samples were recorded with the clutch engaged (pedal out) while the blue samples were recorded with the clutch disengaged (pedal in).
- **Event separation** — The time separation between ticks shows that the ticks arrive periodically, but with many long skips between arrivals. This indicates that the phenomenon depends on the phase of some *other* object in the system, not just the engine.

The Cortado made it possible to pull a faint, fast, structure-borne signal cleanly out of an extremely noisy mechanical environment — exactly the kind of measurement a contact mic is built for.
