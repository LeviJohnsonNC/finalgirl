import * as React from "react";
import { ChevronRight, Film, MapPin, Skull } from "lucide-react";
import { LoreInfoModal } from "@/components/LoreInfoModal";
import { Switch } from "@/components/ui/switch";
import {
  type FeatureFilm,
  getBoxArtThumbnail,
  getCharacterThumbnail,
} from "@/types/gameData";
import { useActiveImages } from "@/hooks/useActiveImages";
import { FILM_BLURBS } from "@/data/filmBlurbs";
import {
  COLLECTION_ART,
  COLLECTION_PORTRAIT_FOCUS,
  getCollectionScene,
} from "@/data/collectionArt";
import "@/styles/collection.css";

interface FilmToggleProps {
  film: FeatureFilm;
  isOwned: boolean;
  onToggle: (filmId: string) => void;
  disabled?: boolean;
}
/** A changed image preference gets a fresh attempt; failed art never hides facts. */
function ShelfImage({
  src,
  alt,
  className,
  width,
  height,
  fallback = null,
}: {
  src?: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = React.useState<string>();
  return src && failed !== src ? (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(src)}
    />
  ) : (
    <>{fallback}</>
  );
}
export const FilmToggle = React.forwardRef<HTMLDivElement, FilmToggleProps>(
  ({ film, isOwned, onToggle, disabled = false }, ref) => {
    const { getBoxArt, characterImages } = useActiveImages();
    const boxArt = getBoxArtThumbnail(getBoxArt(film));
    const comingSoon = film.killer === "TBD";
    const id = React.useId();
    const art = COLLECTION_ART[film.id];
    const style = {
      "--shelf-accent": art?.accent ?? "#d85243",
      "--shelf-paper": art?.pale ?? "#eee0c3",
    } as React.CSSProperties;
    return (
      <div
        ref={ref}
        style={style}
        data-film-id={film.id}
        data-coming-soon={comingSoon || undefined}
        className={`collection-film${isOwned ? " collection-film-owned" : ""}`}
      >
        <ShelfImage
          src={art && getCollectionScene(art.scene)}
          alt=""
          className="collection-scene"
          width={960}
          height={640}
        />
        <div className="collection-print-wash" aria-hidden="true" />
        <label className="collection-ownership" htmlFor={id}>
          <Switch
            id={id}
            aria-label={`Own ${film.name}`}
            checked={isOwned}
            onCheckedChange={() => onToggle(film.id)}
            disabled={disabled}
          />
          <span>{comingSoon ? "Soon" : isOwned ? "Owned" : "Unowned"}</span>
        </label>
        <div className="collection-feature">
          <div
            className={`collection-cover${boxArt ? "" : " collection-cover-unavailable"}`}
          >
            <ShelfImage
              src={boxArt}
              alt={`${film.name} box art`}
              width={288}
              height={432}
              fallback={
                <div
                  className="collection-cover-fallback"
                  role="img"
                  aria-label={`${film.name} box art unavailable`}
                >
                  <Film size={30} aria-hidden="true" />
                  <span>
                    {comingSoon ? "Coming soon" : "Cover unavailable"}
                  </span>
                </div>
              }
            />
          </div>
          <div className="collection-pitch">
            <h3
              className={`collection-film-title collection-lettering-${art?.lettering ?? "brush"}`}
              aria-label={film.name}
            >
              <span aria-hidden="true">
                {(art?.lines ?? [{ text: film.name }]).map((line, index) => (
                  <span
                    key={index}
                    className={
                      line.accent ? "collection-title-accent" : undefined
                    }
                    style={
                      { "--line-scale": line.scale ?? 1 } as React.CSSProperties
                    }
                  >
                    {line.text}
                  </span>
                ))}
              </span>
            </h3>
            <span className="collection-format">
              {comingSoon
                ? "Coming soon"
                : film.isVignette
                  ? "Vignette · Mix with a location"
                  : "Feature film"}
            </span>
            <p>{FILM_BLURBS[film.id]}</p>
          </div>
        </div>
        {!comingSoon ? (
          <>
            <dl className="collection-cast">
              <div>
                <Skull size={17} aria-hidden="true" />
                <div>
                  <dt>Killer</dt>
                  <dd>{film.killer}</dd>
                </div>
              </div>
              <div>
                <MapPin size={18} aria-hidden="true" />
                <div>
                  <dt>Location</dt>
                  <dd>{film.isVignette ? "Your choice" : film.location}</dd>
                </div>
              </div>
            </dl>
            <div
              className="collection-girl-references"
              aria-label={`${film.name} Final Girls`}
            >
              {film.finalGirls.map((name) => (
                <LoreInfoModal
                  key={name}
                  type="finalGirl"
                  name={name}
                  triggerClassName="collection-girl-link"
                  trigger={
                    <>
                      <span
                        className="collection-girl-portrait"
                        style={
                          {
                            "--portrait-focus":
                              COLLECTION_PORTRAIT_FOCUS[name] ?? "50% 42%",
                          } as React.CSSProperties
                        }
                        aria-hidden="true"
                      >
                        <ShelfImage
                          src={getCharacterThumbnail(characterImages[name])}
                          alt=""
                          width={256}
                          height={256}
                          fallback={
                            <span className="collection-portrait-fallback">
                              {name[0]}
                            </span>
                          }
                        />
                      </span>
                      <span className="collection-girl-name">{name}</span>
                      <ChevronRight size={17} aria-hidden="true" />
                    </>
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <p className="collection-teaser-note">
            Cast and setting to be announced
          </p>
        )}
      </div>
    );
  },
);
FilmToggle.displayName = "FilmToggle";
