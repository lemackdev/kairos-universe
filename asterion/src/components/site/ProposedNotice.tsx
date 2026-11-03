"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Inline tag that opens an explanation of what "proposed" means on this site. */
export function ProposedNotice({ label = "Proposed" }: { label?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="tag tag-proposed cursor-pointer" aria-haspopup="dialog">
          {label}
          <span aria-hidden="true">?</span>
          <span className="sr-only"> — what does proposed mean?</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <div className="grid gap-4">
          <span className="label label-signal">Canon status</span>
          <DialogTitle>Proposed, not confirmed</DialogTitle>
          <DialogDescription>
            Material marked proposed is a creative direction awaiting author approval. It
            describes how Asterion could be presented, not what has been established in the
            Kairos Universe.
          </DialogDescription>
          <p className="text-sm text-[var(--silver)]">
            Confirmed canon is limited to Asterion&apos;s founder and chief executive,
            Adrian Vale, its role as parent company of Kairos Esports, and the financial
            and organizational foundation it provides. Headquarters, founding date, other
            business activity, products, clients, and financial details remain undefined.
          </p>
          <div>
            <Button asChild variant="outline" size="sm">
              <Link href="/company">See confirmed facts</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
