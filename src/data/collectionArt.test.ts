import { describe, expect, it } from "vitest";
import { COLLECTION_ART, getCollectionScene } from "./collectionArt";
import {
  FEATURE_FILMS,
  CHARACTER_IMAGES,
  CHARACTER_IMAGES_AI,
  getCharacterThumbnail,
  getBoxArtThumbnail,
} from "@/types/gameData";

describe("Collection artwork coverage", () => {
  it("covers every catalog entry with distinct scenery and an accurate authored title", () => {
    expect(Object.keys(COLLECTION_ART).sort()).toEqual(
      FEATURE_FILMS.map((f) => f.id).sort(),
    );
    expect(
      new Set(Object.values(COLLECTION_ART).map((a) => a.scene)).size,
    ).toBe(FEATURE_FILMS.length);
    expect(
      new Set(Object.values(COLLECTION_ART).map((a) => a.titleFont)).size,
    ).toBe(FEATURE_FILMS.length);
    for (const film of FEATURE_FILMS) {
      const art = COLLECTION_ART[film.id];
      expect(getCollectionScene(art.scene), film.name).toMatch(/\.webp$/);
      expect(
        art.lines
          .map((line) => line.text)
          .join(" ")
          .toLowerCase(),
        film.name,
      ).toBe(film.name.toLowerCase());
    }
  });
  it("uses small derivatives of the selected cover and all available character identities in both image modes", () => {
    const girls = [
      ...new Set(
        FEATURE_FILMS.filter((f) => f.killer !== "TBD").flatMap(
          (f) => f.finalGirls,
        ),
      ),
    ];
    expect(girls).toHaveLength(39);
    for (const images of [CHARACTER_IMAGES, CHARACTER_IMAGES_AI])
      for (const girl of girls) {
        expect(images[girl], girl).toBeTruthy();
        expect(getCharacterThumbnail(images[girl]), girl).toMatch(
          /collection-portraits\/.*\.webp$/,
        );
        expect(getCharacterThumbnail(images[girl]), girl).not.toBe(
          images[girl],
        );
      }
    for (const film of FEATURE_FILMS)
      for (const cover of [film.boxArt, film.boxArtAi])
        if (cover) {
          expect(getBoxArtThumbnail(cover)).toMatch(
            /collection-thumbnails\/.*\.webp$/,
          );
        }
  });
});
