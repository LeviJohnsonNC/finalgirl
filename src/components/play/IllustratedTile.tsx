import "@/styles/illustrated-tile.css";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";

/** The button contains presentation only. Outcome/correction buttons belong
 * beside it so touch, keyboard and screen readers never meet nested buttons. */
export function IllustratedTile({
  art,
  title,
  status,
  children,
  className = "",
  ...button
}: {
  art: ModuleArt;
  title: string;
  status: string;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`play-illustrated-tile ${className}`}
      {...button}
    >
      <ModuleArtwork art={art} />
      <span className="play-tile-caption">
        <strong>{title}</strong>
        <small className="play-tile-state">{status}</small>
      </span>
      {children}
    </button>
  );
}
