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
      <div
        className="approach-visual"
        onPointerMove={(event) => {
          if (event.pointerType === "touch") return;
          const panel = event.currentTarget;
          const rect = panel.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          panel.style.setProperty("--approach-x", `${(y * -4).toFixed(2)}deg`);
          panel.style.setProperty("--approach-y", `${(x * 4).toFixed(2)}deg`);
          panel.style.setProperty("--approach-glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
          panel.style.setProperty("--approach-glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
        }}
        onPointerLeave={(event) => {
          const panel = event.currentTarget;
          panel.style.setProperty("--approach-x", "0deg");
          panel.style.setProperty("--approach-y", "0deg");
          panel.style.setProperty("--approach-glow-x", "50%");
          panel.style.setProperty("--approach-glow-y", "50%");
        }}
      >
        <EngineeringIllustration variant="connections" />
      </div>
    </section>
  );
}
