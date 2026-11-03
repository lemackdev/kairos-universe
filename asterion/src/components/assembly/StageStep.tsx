import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** One scroll panel beside the pinned canvas. Index 0 is the hero. */
export function StageStep({
  index,
  align = "left",
  children,
}: {
  index: number;
  align?: "left" | "right";
  children: ReactNode;
}) {
  return (
    <section id={`stage-step-${index}`} className="stage-step" aria-label={`Step ${index + 1}`}>
      <div className="frame grid12">
        <div className={cn("stage-panel", align === "left" ? "c-1-5" : "c-8-5")}>{children}</div>
      </div>
    </section>
  );
}
