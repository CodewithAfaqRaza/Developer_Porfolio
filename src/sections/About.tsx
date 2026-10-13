import { ArrowUpRight } from "lucide-react";
import { profile } from "../data/profile";
import { EngineeringIllustration } from "../components/illustrations/EngineeringIllustration";

export function About() {
  return (
    <section id="about" className="about-section container">
      <div className="about-visual grid-paper">
        <EngineeringIllustration />
      </div>
      <div className="about-copy">
        <p className="eyebrow">WHO I AM</p>
        <h2>
          Engineering with clarity.
          <br />
          Building with purpose.
        </h2>
        <p>{profile.about}</p>
        <p>{profile.aboutDetail}</p>
        <a
          className="text-link"
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get to know me on LinkedIn <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
