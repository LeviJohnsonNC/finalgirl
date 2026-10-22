import { useState } from "react";
import { Heart, LockKeyhole, UnlockKeyhole } from "lucide-react";
import { getFinalGirlReference } from "@/data/finalGirlReferences";
import {
  usePersonalItem,
  usePersonalUnlocks,
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

export function SecretItemReference({ name }: { name: string }) {
  const unlocks = usePersonalUnlocks();
  const unlocked = unlocks.isUnlocked(name);
  const { item, error, loading, retry } = usePersonalItem(name);
  const [confirm, setConfirm] = useState(false);
  return (
    <section
      className={`girl-personal-item ${unlocked ? "is-unlocked" : ""}`}
      aria-label={`${name} personal item`}
    >
      <div className="girl-item-heading">
        <h4>
          {unlocked ? (
            <UnlockKeyhole aria-hidden="true" size={15} />
          ) : (
            <LockKeyhole aria-hidden="true" size={15} />
          )}
          Personal item
        </h4>
        <span>{unlocked ? "Unlocked" : "Locked"}</span>
      </div>
      {!unlocked ? (
        <>
          <p className="girl-reference-note">
            Unlock after discovering it in your physical game.
          </p>
          {!unlocks.owner ? (
            <p className="girl-reference-note">Sign in to save your unlocks.</p>
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
              <h5>{item.name}</h5>
              <p>{item.effect}</p>
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
    </section>
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
      <section className="girl-ability" aria-label={`${name} Ultimate ability`}>
        <div className="girl-item-heading">
          <h4>Ultimate ability</h4>
          {ultimate && <span>Recorded this game</span>}
        </div>
        <p>{ref.ultimate}</p>
        <p className="girl-reference-note">
          Additional Victims saved: {ref.additionalReward}
        </p>
      </section>
      <SecretItemReference key={name} name={name} />
    </div>
  );
}
