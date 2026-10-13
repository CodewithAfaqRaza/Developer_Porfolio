import { ArrowUpRight } from "lucide-react";
import { EngineeringIllustration } from "../components/illustrations/EngineeringIllustration";

export function Approach() {
  return (
    <section className="approach-section container">
      <div className="approach-copy">
        <p className="eyebrow">HOW I APPROACH THE WORK</p>
        <h2>
          Connecting complex systems.
          <br />
          Creating intuitive experiences.
        </h2>
        <p>
          Strong architecture should make a better experience possible. From the
          structure behind the content to the details people interact with,
          every decision belongs to the same clear system.
        </p>
        <a className="text-link" href="#work">
          See the projects <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="approach-visual">
        <EngineeringIllustration variant="connections" />
      </div>
    </section>
  );
}
