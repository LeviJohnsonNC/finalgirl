import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function MinorPowerSection({ children }: { children: ReactNode }) {
  return (
    <details className="module-minor-section">
      <summary>
        Minor Dark Powers
        <ChevronDown aria-hidden="true" size={16} />
      </summary>
      {children}
    </details>
  );
}
