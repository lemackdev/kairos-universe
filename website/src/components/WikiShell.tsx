import type { ReactNode } from "react";

import type { CatalogMetadata } from "@/types/catalog";

import { NarrativeDateDisplay } from "./NarrativeDateDisplay";
import { SidebarNavigation, type SidebarLink } from "./SidebarNavigation";
import { TopNavigation } from "./TopNavigation";

export function WikiShell({
  metadata,
  children,
  contextLinks,
}: {
  metadata: CatalogMetadata;
  children: ReactNode;
  contextLinks?: SidebarLink[];
}) {
  return (
    <>
      <a className="skipLink" href="#main-content">
        Skip to content
      </a>
      <div className="fictionNotice">
        Kairospedia documents a fictional esports universe. Fictional matches
        and events involving real-world organizations are not real-world
        results.
      </div>
      <TopNavigation />
      <div className="wikiGrid">
        <SidebarNavigation links={contextLinks} />
        <main className="mainContent" id="main-content">
          {children}
        </main>
        <aside className="canonRail" aria-label="Canon context">
          <span className="railLabel">Canon rail</span>
          <NarrativeDateDisplay
            date={metadata.currentNarrativeDate}
            episode={metadata.storyEpisode}
          />
          <dl>
            <div>
              <dt>Canon version</dt>
              <dd>{metadata.canonVersion}</dd>
            </div>
            <div>
              <dt>Canon publication</dt>
              <dd>{metadata.publicationScope}</dd>
            </div>
          </dl>
        </aside>
      </div>
      <footer className="footer">
        <div className="footerInner">
          <span>Kairospedia, the esports encyclopedia of the Kairos Universe</span>
          <span>Canon is sourced from the repository, not the interface.</span>
        </div>
      </footer>
    </>
  );
}
