import type { ReactNode } from "react";
import "@/styles/play-controls.css";

export function MinorPowerSection({ children }: { children: ReactNode }) {
  return (
    <details className="module-minor-section">
      <summary>Minor Dark Powers</summary>
      {children}
    </details>
  );
}
