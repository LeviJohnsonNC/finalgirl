# The Tormentor photographs

Fifty-two original landscape scenes generated individually on 2026-11-01 with the built-in image generator. Candid practical 1980s consumer-camera direction, using the existing Tormentor identity photograph for character scenes. Inkanyamba is the quality reference. No source card photos appear in the UI. Existing Tormentor identity and painted ending-poster medium are retained.

Independent 1536×1024 originals produce 960×640 WebP heroes and 256×160 chooser thumbnails. Header is a separately composed 1200×550 derivative. Heroes are below 160 KiB; thumbnails below 35 KiB. The manifest records current total bytes, exact hashes and budgets.

Stable IDs are mapped explicitly in `tormentorArt.ts` before display sorting; unknown IDs fail rather than reusing unrelated pictures. Duplicate physical Terror cards share their verified title photograph. `portrait` deliberately uses the existing identity PNG. All labels, countdowns and interactive state are HTML. Photos provide atmosphere, never evidence of a casualty or present board location.

Heroes use central 50%/50% crops; header uses 70%/9% so the complete mask survives wide laptop crops. Exit locked/unlocked scenes have different physical shackle states. Unseen shows an unoccupied control room. Individual prompts, original filenames/SHA-256, dimensions, derivative hashes and byte counts are recorded in `manifest.json`. Original temporary paths are excluded.

| Stable ID | Scene file | Bytes |
| --- | --- | --- |
| drowning-tank | drowning-tank.webp | 80650 |
| electric-cage | electric-cage.webp | 80122 |
| endless-traps | endless-traps.webp | 53892 |
| faulty-construction | faulty-construction.webp | 65262 |
| fireworks-target | fireworks-target.webp | 52650 |
| game-over | game-over.webp | 83094 |
| guillotine | guillotine.webp | 42316 |
| header | tormentor.webp | 32958 |
| help-im-trapped | help-im-trapped.webp | 34434 |
| horrifying-traps | horrifying-traps.webp | 35700 |
| infestation-box | infestation-box.webp | 59438 |
| lets-play-a-game | lets-play-a-game.webp | 43968 |
| live-or-die | live-or-die.webp | 59652 |
| locked | locked.webp | 44820 |
| no-escape | no-escape.webp | 57234 |
| no-respect-for-life | no-respect-for-life.webp | 35104 |
| overkill-traps | overkill-traps.webp | 55070 |
| razor-maze | razor-maze.webp | 80008 |
| reverse-bear-trap | reverse-bear-trap.webp | 52596 |
| super-saw | super-saw.webp | 68340 |
| swinging-blades | swinging-blades.webp | 44076 |
| temple-drills | temple-drills.webp | 48582 |
| the-slicer | the-slicer.webp | 63228 |
| the-ultimate-trap | the-ultimate-trap.webp | 56866 |
| tick-tock | tick-tock.webp | 30396 |
| unfair-traps | unfair-traps.webp | 34588 |
| unlocked | unlocked.webp | 38628 |
| unseen | unseen.webp | 33720 |
| we-have-to-help | we-have-to-help.webp | 47574 |
| you-dont-deserve-to-live | you-dont-deserve-to-live.webp | 47420 |

## Playtest state refinement — 2026-11-01

Twenty-two additional independent 1536×1024 photographs supply a deactivated and a sprung state for every one of the eleven traps. They keep the original device/camera/workshop where possible. Deactivated states show released restraints, stopped/disconnected machinery or an open/drained route; sprung states show physical aftermath appropriate to each device. No person occupies a trap, and no human remains are shown. Blood is confined to practical-prop aftermath, while electrical, fireworks and drowning states use scorch marks, spent casings or a full latched tank. Each state is an original native generation/edit, with its full prompt in the manifest, 960×640 hero and 256×160 thumbnail. Built-in image generation was used; originals remain with the generation outputs.

The generator rejected the deactivated Reverse Bear Trap edits twice. Its final safer alternative shows the dismantled prop wrapped on a workshop bench, with the mounting ring, strap and disconnected timer outside. It is a distinct original deactivated-state photograph, not a reused image or generic fallback.

UI labels, ordered task progress, countdowns, skull marker and interactivity remain HTML/vector. State pictures never add a person, a new injury, casualty, damage or reward to the observation log. Escaped traps remain visible; spent traps remain visible through Upkeep. Every named state is explicitly mapped in `tormentorArt.ts`, and missing IDs fail.
