# Audio attribution & licensing

Every sound in `assets/audio/` is a **derived composite cue**, not a stock file.
Each `.mp3` was built offline by layering, pitch-shifting, time-stretching,
filtering, gating, reversing and convolving several source recordings, then
loudness-normalised (ITU-R BS.1770) to a per-cue target.

## Source libraries

All source recordings come from **Kenney** (www.kenney.nl) and are released under
**Creative Commons Zero (CC0 1.0)** — public domain. CC0 permits redistribution,
including in a public source repository, with no attribution required. Attribution
is given here anyway.

| Pack | Files used | Licence |
|---|---|---|
| Sci-Fi Sounds 1.0 | `impactMetal_*`, `explosionCrunch_*`, `lowFrequency_explosion_*`, `forceField_*`, `laserSmall_*`, `thrusterFire_*`, `spaceEngineLow_*`, `slime_*` | CC0 1.0 |
| Interface Sounds | `click_001`, `tick_001`, `tick_004`, `glass_002`, `glass_004`, `bong_001`, `confirmation_001`, `error_002`, `error_004`, `glitch_001`, `select_003` | CC0 1.0 |
| Digital Audio | `powerUp1`, `powerUp10`, `phaserUp3`, `phaserUp5`, `phaserDown1`, `twoTone1`, `pepSound4`, `zap1`, `zap2`, `lowDown`, `lowRandom` | CC0 1.0 |

CC0 1.0 licence text: <https://creativecommons.org/publicdomain/zero/1.0/>

## The 17 cues

| File | Built from | Character |
|---|---|---|
| `chirp` | twoTone1 + pepSound4 + tick | watch tap / arm |
| `crank` | click_001 ×5 retuned + metal ticks | dial ratchet |
| `warp` | powerUp1 + phaserUp3 + forceField + impactMetal + sub | transformation sweep |
| `charge` | powerUp10 + phaserUp5 + select_003 + sub riser | energy build-up |
| `impact` | impactMetal + explosionCrunch + sub + noise smack | punch landing |
| `clank` | impactMetal ×2 + glass | armour hit |
| `glitch` | zap2 chopped/bitcrushed + glitch_001 | digital tear |
| `timefreeze` | phaserDown1 reversed + spaceEngineLow | Kronikk's cheat |
| `flame` | thrusterFire + sub + crackle | Cinder |
| `zap` | zap1 + laserSmall + bitcrushed noise | Volt |
| `water` | slime_000 + filtered noise + tremolo | Tide |
| `crystal` | glass_004 + bong_001 stacked in 3rds | Quill |
| `void` | spaceEngineLow + lowDown reversed + breath | Null |
| `tick` | tick_001 | UI |
| `ok` | confirmation_001 | confirm |
| `fail` | error_004 + lowRandom + error_002 | reject |
| `ko` | explosionCrunch + sub + debris + bong | knockout stinger |

Roughly 190 KB total at 96–112 kbps mono. There is no runtime dependency on any
network service — the files are local, and if they fail to load the site falls
back to its built-in Web Audio synthesiser so it still makes sound offline.

## Artwork

All character art in `assets/` was generated specifically for this project. The
characters are original creations. The reference model sheets were used for
palette, line weight and shading discipline only — no character was copied.

## Fonts

**Bangers**, **Archivo Black** and **Space Mono**, all SIL Open Font License 1.1,
self-hosted in `assets/*.woff2`.
