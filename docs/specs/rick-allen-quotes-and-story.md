# Spec: Rick Allen testimonials and Caught on Cortado story

Two pieces of work for cortadomic.com. Part 1 and Part 2 can ship now. Part 3 waits on audio from Rick.

Show Patrick the changes (local preview or screenshots) before pushing. Deploy per `DEPLOY.md`.

## Background

Rick Allen is a sound designer and sound-effects recordist in Scottsdale, Arizona ([rickallencreative.com](https://www.rickallencreative.com/)). His credits include HBO, Netflix, and Disney, and he has taught post-production audio, Foley, field recording, and sound design at CRAS (Conservatory of Recording Arts & Sciences) since 2017.

On Nov 23, 2026 he posted on Facebook about a test of several contact mics on a steel support pole in the CRAS lobby. His ranking: 1st a rare vintage FRAP, 2nd a Zeppelin Design Labs Cortado (MkIII), 3rd a LOM Geofon. He has given written permission to quote him and agreed to be featured in Caught on Cortado.

Rick Allen is **not** the "Rick" in the existing Porsche story (`src/content/submissions/rick-porsche-tick.md`). Always use his full name so the two are not confused. Do not edit the Porsche story.

## Part 1: Testimonials

There is no testimonial component yet. Add one that can be reused.

### Approved quotes (use verbatim)

1. **Primary:** "When any of my students ask what is the first contact mic I would recommend, I quickly answer Cortado!"
2. **Secondary:** "Great sound AND great price."

Keep his capitalization of "AND". It is how he wrote it.

### Attribution

- Name: **Rick Allen**
- Short credit line: **Sound designer (HBO, Netflix, Disney) · Instructor, Conservatory of Recording Arts & Sciences**
- Link the name to `https://www.rickallencreative.com/` (`rel="noopener"`, new tab is fine).
- No photo of Rick for now. Text-only is fine.

### Implementation

- Store quotes as data, e.g. `src/content/testimonials.json` (or a small content collection if that fits the project better), with fields like `quote`, `name`, `credit`, `url`, `products` (array of product slugs it applies to, or empty for general), and optional `storySlug`.
- Create `src/components/Testimonial.astro` that renders one quote with attribution. Match existing site styling (Tailwind, `brand-*` colors). Use a semantic `<figure>` / `<blockquote>` / `<figcaption>`.
- If the Rick Allen story exists (Part 2), the testimonial can include a small "Read the story" link to it.

### Placement

- **Home page** (`src/pages/index.astro`): add the primary quote as its own section. A good spot is between the products section and the dark section that follows it. Keep it compact; one quote, centered.
- **Cortado MkIII product page** (`src/pages/products/[slug].astro`, data in `src/content/products/cortado-mkiii.json`): show the primary quote, and optionally the secondary one, near the description or above the specs. Only on the MkIII page.
- **Do not** put Rick's quotes on the Cortado Xe page. He used a MkIII; the quotes must not imply he endorsed the Xe.

## Part 2: Caught on Cortado story

Add `src/content/submissions/rick-allen-pole-test.md` using the existing submissions schema (`src/content.config.ts`). Follow the format of `simon-inuit-drum.md`.

### Frontmatter

```yaml
title: "Pole position: a row of contact mics on a singing steel pole"
author: "Rick Allen"
authorTitle: "Sound designer · CRAS instructor"
authorUrl: "https://www.rickallencreative.com/"
location: "Scottsdale, Arizona"
pubDate: <date of publish>
featured: true
model: "Cortado MkIII"
summary: "Sound designer Rick Allen lined up a row of contact mics on a steel pole in a busy school lobby to capture its resonant ping without the crowd. The Cortado MkIII took second place, right behind his rare vintage FRAP."
coverImage: "/images/submissions/rick-allen-pole/pole-test.jpg"
coverAlt: "Rick Allen monitoring on headphones beside a steel support pole fitted with several contact microphones, a field recorder on a table beside him"
images: []   # add more if Rick sends them
order: 3
```

Check `order` against the other stories so this one sorts after the Porsche (1) and Simon (2) stories, unless Patrick wants it first.

### Cover photo

For now, the only photo is in a screenshot of Rick's Facebook post:

`/Users/patrick/.cursor/projects/Users-patrick-Library-CloudStorage-OneDrive2-JarominLLC-Documents-Zeppelin-Design-Labs-Admin-Marketing/assets/image-707447e6-cc2a-44af-a738-e16566566100.jpg`

The screenshot is 747×1024. The photo itself is roughly the region from y≈633 to y≈1010, full width. Crop out the Facebook chrome and the strip of other thumbnails along the bottom edge. Save to `public/images/submissions/rick-allen-pole/pole-test.jpg` and update `src/data/image-dimensions.json` the same way other submission images are registered (check how existing entries were generated, e.g. a script in `scripts/`).

This is low resolution (~747 px wide). It is a placeholder. Patrick will ask Rick for the original when the audio arrives (Part 3), and it should be swapped in then.

### Body (Rick's words from his post, lightly edited — use as is)

```markdown
It all started when Jeff Harris pointed out a steel support pole in the lobby at CRAS (the Conservatory of Recording Arts & Sciences) that produces an amazing resonant *ping* when tapped.

Naturally, I had to record that. There was just one problem: the CRAS lobby is almost always buzzing with students moving between studios. Not exactly ideal recording conditions.

Bring on the contact mics!

A conventional microphone captures sound waves traveling through the air. A contact microphone captures vibrations traveling through a solid object, largely ignoring all that airborne noise around it. I could capture that metallic resonance without recording the entire student body along with it.

So I attached a small army of contact microphones to a giant steel pole in the middle of the lobby.

## The results

1. **My rare vintage FRAP contact mic.** Still a champion after all these years.
2. **The Zeppelin Design Labs Cortado.** An impressive runner-up!
3. **The LOM Geofon.**

## Why Cortado

> When any of my students ask what is the first contact mic I would recommend, I quickly answer Cortado! Great sound AND great price.
```

### Editorial rules

- Keep Rick's ranking exactly as he gave it. Do not spin it ("best mic you can buy", etc.), and do not say anything negative about FRAP or LOM.
- Do not mention that Rick received a free Cortado Xe or T-shirt.
- Do not publish Rick's home address or any contact info beyond his website.
- Do not name unannounced products (Cortado Pre, Mk4, Hydro, Stereo, Trigger).

## Part 3: Audio (later — wait for Rick's files)

Rick will send recordings from the session. When they arrive:

- Add optional audio support to the submissions schema, e.g. `audio: z.array(z.object({ src: z.string(), title: z.string(), caption: z.string().optional() })).default([])`, and render it on `src/pages/stories/[slug].astro` with native `<audio controls preload="none">` players in a "Listen" section. Only render the section when there is audio.
- Put files under `public/audio/submissions/rick-allen-pole/`. Use MP3 (or AAC) at a web-friendly bitrate; keep the original WAVs out of the repo.
- Publish only the clips Rick approves. If he sends the other mics' recordings too, label each by mic exactly as he does.
- Swap the placeholder cover for his original photo if he sends one.

## Done when

- Primary quote appears on the home page and on the MkIII page, with attribution and link. Not on the Xe page.
- `rick-allen-pole-test` story renders on `/stories/` and at its own URL, with cover photo, correct author info, and the body above.
- `npm run build` passes with no new warnings.
- Patrick has seen a preview before deploy.
