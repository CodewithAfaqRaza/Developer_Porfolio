import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { profile, profileInitials } from "../../data/profile";

const links = ["Work", "About", "Stack", "Contact"];
export function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="header">
      <div className="header-inner">
        <a
          className="brand"
          href="#top"
          aria-label={`${profile.name}, back to top`}
          onClick={() => setOpen(false)}
        >
          <span className="monogram">
            {profileInitials}<span>.</span>
          </span>
          <span className="brand-name">
            {profile.name.toUpperCase()}<span>{profile.brandTagline.toUpperCase()}</span>
          </span>
        </a>
        <nav
          id="main-nav"
          className={open ? "navigation is-open" : "navigation"}
          aria-label="Main navigation"
        >
          {links.map((label, i) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-number">0{i + 1}</span>
              {label}
              <span className="nav-dot" />
            </a>
          ))}
        </nav>
        <a className="header-contact" href={profile.cv || "#contact"} target={profile.cv ? "_blank" : undefined} rel={profile.cv ? "noopener noreferrer" : undefined}>
          {profile.cv ? "View Résumé" : "Let’s talk"}
          <ArrowUpRight size={15} />
        </a>
        <button
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
