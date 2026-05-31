import { Github, Globe, Twitter } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const GITHUB = "https://github.com/chayprabs/subset-font-online";
const TWITTER = "https://x.com/chayprabs";
const WEBSITE = "https://www.chaitanyaprabuddha.com";

export default function Layout() {
  return (
    <>
      <header className="topbar">
        <Link to="/" className="topbar-brand">
          FontOps
        </Link>
        <nav className="topbar-links" aria-label="External links">
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" title="GitHub repository">
            <Github size={18} aria-hidden />
            GitHub
          </a>
          <a href={TWITTER} target="_blank" rel="noopener noreferrer" title="Twitter / X">
            <Twitter size={18} aria-hidden />
            @chayprabs
          </a>
          <a href={WEBSITE} target="_blank" rel="noopener noreferrer" title="Personal website">
            <Globe size={18} aria-hidden />
            chaitanyaprabuddha.com
          </a>
        </nav>
      </header>
      <div className="seo-bar">
        <div>
          Subset, convert and QA TTF, OTF, WOFF and WOFF2 fonts online — glyph coverage,
          variable-font instancing and WOFF2 output in your browser.
        </div>
        <div>Files stay on your device unless you opt in to server-side FontBakery QA.</div>
      </div>
      <Outlet />
      <footer className="footer">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms &amp; Conditions</Link>
        <Link to="/legal-notice">Legal Notice</Link>
      </footer>
    </>
  );
}
