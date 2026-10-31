import type { ReactNode } from "react";

import { SidebarNavigation, type SidebarLink } from "./SidebarNavigation";
import { TopNavigation } from "./TopNavigation";

export function WikiShell({
  children,
  contextLinks,
}: {
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
