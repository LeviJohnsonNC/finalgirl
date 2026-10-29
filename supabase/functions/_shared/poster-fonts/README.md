# Poster lettering

The complete 1000×1500 poster is rasterized before upload. IM Fell English and Bebas Neue remain the serif/supporting faces in `posterFonts.ts`. `posterDisplayFonts.ts` adds four static ASCII TrueType subsets: Sedgwick Ave Display (slash), Permanent Marker (brush), Metal Mania (gothic) and Black Ops One (industrial).

These are locally rasterized fonts, not runtime browser fonts or model-generated words. The Collection's WOFF2 files are not loaded by this renderer. Font bytes are bundled; no font network access occurs during a request. Existing copyright/license notices are retained, with the complete license alongside each face. The source commit, original digest, subset digest and sizes are pinned in `manifest.json`.

To reproduce with Python fonttools 4.61.1 installed in an isolated environment:

```sh
POSTER_FONT_TOOL=/path/to/pyftsubset node scripts/poster-fonts.mjs
```

The build downloads only the pinned Google Fonts source files and license files. It keeps printable ASCII (the existing `cleanType` contract), kerning/ligatures and copyright/name metadata; hinting is omitted for these large display faces. Each added face is bounded to 128KiB, and all four total 206,012 bytes before base64. `npm run check:assets` verifies hashes, licenses and bounds. Native compositor tests exercise every design/face and punctuation, not just browser font loading.

Print design belongs to `posterDesign.ts`: four layout geometries, five title faces including the retained serif, and four coordinated ink/edge palettes. The same selected design controls generated art safe areas and raster placement. Fonts are a bounded vocabulary; the story planner directs their coordinated use. Fictional studio crew credits reuse the archive's established names and never become narrative facts.
