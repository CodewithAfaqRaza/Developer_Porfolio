import { ArrowDown, ArrowUpRight } from "lucide-react";
import { profile } from "../data/profile";
import { HeroVideo } from "../components/effects/HeroVideo";
import { Fragment } from "react";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <img
        className="hero-background"
        src="/images/abstract-tech-poster.jpg"
        alt=""
        width="1280"
        height="720"
        fetchPriority="high"
      />
      <HeroVideo />
      <div className="hero-wash" />
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="hero-small">
            {profile.name.toUpperCase()} / {profile.role.toUpperCase()}
          </p>
          <h1 id="hero-title">
            I build thoughtful
            <br />
            digital experiences
            <br />
            that make a difference.
          </h1>
          <p className="hero-intro">{profile.intro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              Explore work <ArrowDown size={17} />
            </a>
            <a className="text-link" href="#contact">
              Let’s build something <ArrowUpRight size={17} />
            </a>
            {profile.cv && (
              <a className="text-link" href={profile.cv} target="_blank" rel="noopener noreferrer" aria-label="View Résumé (PDF, opens in a new tab)">
                View Résumé <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </div>
        <div className="hero-stamp" aria-hidden="true">
          {profile.name.trim().split(/\s+/).map((part, index) => <Fragment key={`${part}-${index}`}>
            {index > 0 && <br />}{part.toUpperCase()}
          </Fragment>)}<span>ENGINEERING / DESIGN / IMPACT</span>
        </div>
      </div>
      <div className="hero-bottom container">
        <span>INDEPENDENT THINKING. CONNECTED SOLUTIONS.</span>
        <a href="#about">
          Discover the approach <ArrowDown size={14} />
        </a>
      </div>
    </section>
  );
}
