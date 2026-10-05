# The Fellowship of the Ring — a pixel adventure (Book One)

A browser-playable, story-driven pixel-art adventure that follows the journey of *The Fellowship of the Ring* from Bag End to the shores of the Anduin. Open `index.html` in a modern browser — no build step, no dependencies, **no image files**: every sprite, tile, portrait and backdrop is painted procedurally in code at load time.

> A fan tribute. Not affiliated with or endorsed by any rights-holder. All dialogue is original wording that follows the story's beats; no film frames, scripts or audio are used.

## Play
Open `index.html` (Chrome / Firefox / Edge / Safari). Press **Begin the Journey**.

| Key | Action |
|---|---|
| `WASD` / arrows | move (hold `Shift` to hurry) |
| `E` / `Space` / `Enter` | talk · interact · advance dialogue |
| `1`–`4`, arrows | choose a dialogue reply |
| `J` | journal (objectives, bonds, puzzles, Ring corruption) |
| `R` | slip on the Ring (hides you — but corrupts you) |
| `M` | mute |

Progress autosaves; **Continue** resumes it.

## What's in it
**Eight regions**, each a hand-composed map with its own palette, lighting and weather: the Shire (Bag End, the Party Field), Bree (the Prancing Pony, at night), Weathertop, Rivendell, the West-gate of Moria, Khazad-dûm, Lothlórien and Amon Hen.

**Seven chapters** following the film's story: the Party and the Ring · the road and Bree · Weathertop · the Council of Elrond · Moria and the Bridge · Galadriel's Mirror · the breaking of the Fellowship.

**Dialogue screen** — a large painted character bust over an animated scene (flickering lights, drifting petals/embers/fog), parchment speech bubble with a name tab, red keyword highlights and a 2×2 choice grid, framed in a carved plate with leaf-feather ornaments.

**Choices matter.** Replies change bonds with Sam, Merry, Pippin, Gandalf, Aragorn, Boromir, Legolas and Gimli, how much the Ring corrupts Frodo, who trusts you, and what happens at Amon Hen (Boromir can be redeemed, or not; Sam can follow you, or not). If the Ring's hold reaches 100 the story ends in the Ring's favour.

**Eight puzzles:** decode the Ring's runes · hide from a Black Rider (turn-based stealth) · reassemble Gandalf's torn letter · defend the fire on Weathertop (aim-and-throw) · brew the healing draught for Frodo's wound · open the Doors of Durin · memorise the crumbling stair of Khazad-dûm · aim starlight through Lothlórien's mirror-stones.

**Art tech** (all in `js/`): `terrain.js` paints ground per-pixel with noise-warped boundaries; `portraits.js` lights faces from a height-field (nose, brow, sockets, cheekbones) with strand-textured hair/beards; `objects*.js` paints props with hue-shifted ramps and ordered dithering; `engine.js` does y-sorted rendering, a multiplicative light-map with flicker + bloom, followers, cutscene helpers and generative music.

## Layout
```
index.html          page shell + all UI CSS
js/util.js          colour ramps, noise, the Cv pixel canvas
js/terrain.js       tile-grid DSL + ground painter
js/objects.js, objects2.js   props & buildings
js/portraits.js     big dialogue busts
js/chars.js         24×32 overworld sprites (4 dirs × 3 frames)
js/scenes.js        painted dialogue backdrops
js/maps.js          the eight maps (terrain, props, NPCs, exits, triggers)
js/engine.js        render loop, lighting, collision, dialogue, music, save
js/puzzles.js       the eight mini-games
js/story1.js, story2.js   dialogue trees + async cutscene scripts
js/boot.js          title wiring
```
