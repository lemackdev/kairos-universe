import Link from "next/link";

import { WordmarkMark } from "@/components/site/Wordmark";
import { kairospediaHref } from "@/lib/site";

export function SiteFooter() {
  const wiki = kairospediaHref("/wiki");
  const kairosOrg = kairospediaHref("/wiki/organizations/kairos-esports");

  return (
    <footer className="site-footer">
      <div className="frame">
        <div className="footer-grid">
          <div>
            <div className="flex items-center gap-3 text-[var(--silver-bright)]">
              <WordmarkMark className="wordmark-mark" />
              <span className="wordmark-name">Asterion Intelligence</span>
            </div>
            <p className="mono-note mt-5 max-w-sm">
              Parent company of Kairos Esports. A fictional organization within the Kairos
              Universe.
            </p>
          </div>
          <div>
            <div className="label">Site</div>
            <ul className="footer-list">
              <li><Link href="/">Overview</Link></li>
              <li><Link href="/approach">Approach</Link></li>
              <li><Link href="/systems">Systems</Link></li>
              <li><Link href="/ventures">Ventures</Link></li>
              <li><Link href="/company">Company</Link></li>
            </ul>
          </div>
          <div>
            <div className="label">Ventures</div>
            <ul className="footer-list">
              <li><Link href="/ventures">Kairos Esports</Link></li>
              {kairosOrg ? <li><a href={kairosOrg}>Kairos Esports on Kairospedia</a></li> : null}
            </ul>
          </div>
          <div>
            <div className="label">Kairos Universe</div>
            <ul className="footer-list">
              {wiki ? <li><a href={wiki}>Kairospedia</a></li> : null}
              {!wiki ? <li className="mono-note">Kairospedia link not configured.</li> : null}
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span className="mono-note">
            Fictional entity. Not affiliated with any real company or product.
          </span>
          <span className="mono-note">Asterion Intelligence, Kairos Universe</span>
        </div>
      </div>
    </footer>
  );
}
