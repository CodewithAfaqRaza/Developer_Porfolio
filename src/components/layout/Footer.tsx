import { ArrowUpRight } from "lucide-react";
import { profile } from "../../data/profile";

export function Footer() {
  return (
    <footer className="footer container">
      <a className="footer-wordmark" href="#top">
        {profile.name.toUpperCase()}<span>↗</span>
      </a>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Engineering clarity. Creating impact.</p>
        <a href="#top">
          Back to top <ArrowUpRight size={14} />
        </a>
      </div>
    </footer>
  );
}
