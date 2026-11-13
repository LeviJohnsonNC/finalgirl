import { useEffect, useState } from "react";
import { Heart, LockKeyhole, UnlockKeyhole, Zap } from "lucide-react";
import { getFinalGirlReference } from "@/data/finalGirlReferences";
import { supabase } from "@/integrations/supabase/client";
import {
  usePersonalItem,
  usePersonalUnlocks,
  type PersonalItem,
} from "@/contexts/PersonalItemsContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import "@/styles/final-girl-reference.css";

function PersonalItemCard({ item }: { item: PersonalItem }) {
  const [photo, setPhoto] = useState<string>();

  useEffect(() => {
    const imagePath = item.imagePath;
    if (!imagePath) return;
    let live = true;
    let objectUrl: string | undefined;
    void (async () => {
      try {
        const { data, error } = await supabase.storage
          .from("final-girl-secret-items")
          .download(imagePath);
        if (!live || error || !data?.size) return;
        objectUrl = URL.createObjectURL(data);
        setPhoto(objectUrl);
      } catch {
        // The verified text remains readable if private storage is unavailable.
      }
    })();
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.imagePath]);

  return photo ? (
    <img
      className="girl-personal-card"
      src={photo}
      alt={`${item.name} card. ${item.effect}`}
      onError={() => setPhoto(undefined)}
      onLoad={({ currentTarget: image }) => {
        const panel = image.closest(".girl-reference-panels");
        if (!panel) return;
        const card = image.getBoundingClientRect();
        const viewport = panel.getBoundingClientRect();
        if (card.bottom > viewport.bottom) {
          panel.scrollTop += Math.min(card.top - viewport.top - 8, card.bottom - viewport.bottom + 8);
        }
      }}
    />
  ) : (
    <>
      <h5>{item.name}</h5>
      <p>{item.effect}</p>
    </>
  );
}

export function SecretItemReference({ name }: { name: string }) {
  const unlocks = usePersonalUnlocks();
  const unlocked = unlocks.isUnlocked(name);
  const { item, error, loading, retry } = usePersonalItem(name);
  const [confirm, setConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <details
      className={`girl-info-panel girl-personal-item ${unlocked ? "is-unlocked" : ""}`}
      aria-label={`${name} personal item`}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary className="girl-item-heading">
        <h4>
          {unlocked ? (
            <UnlockKeyhole aria-hidden="true" size={15} />
          ) : (
            <LockKeyhole aria-hidden="true" size={15} />
          )}
          Personal item
        </h4>
        <span>{unlocked ? "Unlocked" : "Locked"}</span>
      </summary>
      <div className="girl-panel-content">
        {!unlocked ? (
          <>
            <p className="girl-reference-note">
              Unlock after discovering it in your physical game.
            </p>
            {!unlocks.owner ? (
              <p className="girl-reference-note">
                Sign in to save your unlocks.
              </p>
            ) : (
              <button
                className="girl-reference-action"
                disabled={!unlocks.ready || unlocks.pending > 0}
                onClick={() => setConfirm(true)}
              >
                {unlocks.pending
                  ? "Saving unlock changes…"
                  : "Unlock personal item"}
              </button>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <p role="status">Loading your item…</p>
            ) : error ? (
              <p role="alert">
                {error}{" "}
                <button className="girl-reference-link" onClick={retry}>
                  Retry
                </button>
              </p>
            ) : item ? (
              <>
                {expanded && (
                  <PersonalItemCard key={`${unlocks.owner}:${unlocks.revision}:${item.imagePath}`} item={item} />
                )}
                <p className="girl-reference-note">
                  Available in Play for {name}. Record finding or using it
                  separately.
                </p>
              </>
            ) : (
              <p role="status">Unlocked. Item details aren’t available yet.</p>
            )}
            <button
              className="girl-reference-link"
              onClick={() => unlocks.change(name, false)}
            >
              Lock item again
            </button>
          </>
        )}
        {unlocks.error && (
          <p className="girl-reference-note" role="status">
            {unlocks.error}{" "}
            <button className="girl-reference-link" onClick={unlocks.retry}>
              Retry sync
            </button>
          </p>
        )}
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock {name}’s personal item?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm after unlocking it in your physical game. It becomes
              available in Play’s item list; this does not record finding or
              using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => unlocks.change(name, true)}>
              Confirm unlock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </details>
  );
}

/** Small, shared character facts. Reading these never resolves game effects. */
export function FinalGirlReference({
  name,
  ultimate = false,
}: {
  name: string;
  ultimate?: boolean;
}) {
  const ref = getFinalGirlReference(name);
  if (!ref) return null;
  return (
    <div className="girl-reference">
      <p className="girl-health">
        <Heart aria-hidden="true" size={15} />
        {ref.startingHealth} starting health
        {ref.ultimateHealth !== ref.startingHealth
          ? ` · ${ref.ultimateHealth} with Ultimate`
          : ""}
      </p>
      <div className="girl-reference-panels">
        <details
          className="girl-info-panel girl-ability"
          aria-label={`${name} Ultimate ability`}
        >
          <summary className="girl-item-heading">
            <h4>
              <Zap aria-hidden="true" size={16} />
              Ultimate ability
            </h4>
            {ultimate && <span>Recorded this game</span>}
          </summary>
          <div className="girl-panel-content">
            <p>{ref.ultimate}</p>
            <p className="girl-reference-note">
              Additional Victims saved: {ref.additionalReward}
            </p>
          </div>
        </details>
        <SecretItemReference key={name} name={name} />
      </div>
    </div>
  );
}
