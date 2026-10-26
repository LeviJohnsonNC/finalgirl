import { FinalGirlReference } from "@/components/FinalGirlReference";
import { Crown, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { FEATURE_FILM_DETAILS } from "@/types/featureFilmDetails";
import { KILLER_DESCRIPTIONS } from "@/data/killerDescriptions";
import { LOCATION_DESCRIPTIONS } from "@/data/locationDescriptions";
import { FINAL_GIRL_DESCRIPTIONS } from "@/data/finalGirlDescriptions";
import { FEATURE_FILMS } from "@/types/gameData";
import { useActiveImages } from "@/hooks/useActiveImages";
import { getFinalGirlReference } from "@/data/finalGirlReferences";
import type { ReactNode } from "react";
import "@/styles/final-girl-dossier.css";

interface LoreInfoModalProps {
  type: "killer" | "location" | "finalGirl";
  name: string;
  namedTrigger?: boolean;
  ultimate?: boolean;
  trigger?: ReactNode;
  triggerClassName?: string;
}

// Helper to find detailed lore for a character/location
const getLoreDetails = (
  type: "killer" | "location" | "finalGirl",
  name: string,
) => {
  // Search through all feature films to find matching entity
  for (const filmDetails of Object.values(FEATURE_FILM_DETAILS)) {
    if (type === "killer" && filmDetails.killer?.name === name) {
      return {
        backstory: filmDetails.killer.description,
        visualDescription: KILLER_DESCRIPTIONS[name],
        filmName: FEATURE_FILMS.find((f) => f.id === filmDetails.filmId)?.name,
      };
    }
    if (type === "location" && filmDetails.location?.name === name) {
      return {
        backstory: filmDetails.location.description,
        visualDescription: LOCATION_DESCRIPTIONS[name],
        setupCards: filmDetails.location.setupCards,
        events: filmDetails.location.events,
        filmName: FEATURE_FILMS.find((f) => f.id === filmDetails.filmId)?.name,
      };
    }
    if (type === "finalGirl") {
      const finalGirl = filmDetails.finalGirls.find((fg) => fg.name === name);
      if (finalGirl) {
        return {
          backstory: finalGirl.backstory,
          visualDescription: FINAL_GIRL_DESCRIPTIONS[name],
          filmName: FEATURE_FILMS.find((f) => f.id === filmDetails.filmId)
            ?.name,
        };
      }
    }
  }
  return null;
};

const TYPE_LABELS = {
  killer: "Killer",
  location: "Location",
  finalGirl: "Final Girl",
};

export const LoreInfoModal = ({
  type,
  name,
  namedTrigger = false,
  ultimate = false,
  trigger,
  triggerClassName,
}: LoreInfoModalProps) => {
  const lore = getLoreDetails(type, name);

  if (!lore && type !== "finalGirl") return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={
            triggerClassName ??
            (namedTrigger
              ? "girl-reference-link"
              : "p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors group")
          }
          aria-label={`View ${name} info`}
        >
          {trigger ?? (
            <>
              <Info
                aria-hidden="true"
                className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
              />
              {namedTrigger && name}
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        className={
          type === "finalGirl"
            ? "final-girl-dialog"
            : "flex flex-col w-[calc(100vw-1.5rem)] sm:max-w-2xl bg-background/95 backdrop-blur-sm border-primary/30 max-h-[90dvh] overflow-hidden"
        }
      >
        <LoreInfoContent
          type={type}
          name={name}
          lore={lore}
          ultimate={ultimate}
        />
      </DialogContent>
    </Dialog>
  );
};

// This subtree mounts only when the dialog opens, so Collection does not load
// image preferences separately for every closed character dialog.
function LoreInfoContent({
  type,
  name,
  lore,
  ultimate,
}: LoreInfoModalProps & { lore: ReturnType<typeof getLoreDetails> }) {
  const { characterImages, locationImages } = useActiveImages();
  const image =
    type === "location" ? locationImages[name] : characterImages[name];
  if (type === "finalGirl") {
    return (
      <div className="girl-dossier-layout">
        <div className="girl-dossier-brand" aria-hidden="true">
          <Crown size={28} strokeWidth={1.8} />
          <span>
            Final
            <br />
            Girl
          </span>
        </div>
        <div className="girl-dossier-photo">
          {image ? (
            <img src={image} alt={name} decoding="async" />
          ) : (
            <div className="girl-dossier-no-photo">Portrait unavailable</div>
          )}
        </div>
        <DialogHeader className="girl-dossier-title">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription className="sr-only">
            Final Girl backstory, character details and your personal item
            unlock.
          </DialogDescription>
        </DialogHeader>
        <div className="girl-dossier-paper">
          <div
            className="girl-dossier-scroll"
            role="region"
            aria-label={`${name} character details`}
          >
            {lore?.backstory && (
              <section
                className="girl-backstory"
                aria-label={`${name} backstory`}
                tabIndex={0}
              >
                <h3>Backstory</h3>
                {lore.backstory.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </section>
            )}
            {!lore?.backstory && !getFinalGirlReference(name) && (
              <section
                className="girl-backstory"
                aria-label={`${name} details`}
              >
                <h3>Character details</h3>
                <p>Details aren’t available yet.</p>
              </section>
            )}
            <FinalGirlReference name={name} ultimate={ultimate} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <DialogHeader className="shrink-0 text-left pr-8">
        <div className="flex items-center gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-display">
                {TYPE_LABELS[type]}
              </span>
              {lore?.filmName && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs text-primary/70 font-display">
                    {lore.filmName}
                  </span>
                </>
              )}
            </div>
            <DialogTitle className="font-display text-xl sm:text-2xl tracking-wide text-foreground">
              {name}
            </DialogTitle>
          </div>
        </div>
        <DialogDescription className="sr-only">
          {TYPE_LABELS[type]} details.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 overflow-y-auto overscroll-contain pr-2">
        <div className="space-y-6">
          {/* Character/Location Image */}
          {image && (
            <div className="relative w-full aspect-video rounded-sm overflow-hidden">
              <img
                src={image}
                alt={name}
                className={`w-full h-full ${type === "location" ? "object-cover" : "object-cover object-top"}`}
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          )}

          {lore?.backstory && (
            <div className="space-y-2">
              <h3 className="font-display text-sm uppercase tracking-widest text-primary">
                {type === "killer" ? "Legend" : "Description"}
              </h3>
              <div className="type-body-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {lore.backstory}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
