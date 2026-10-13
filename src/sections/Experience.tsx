import { experience } from "../data/experience";
import { SectionHeading } from "../components/ui/SectionHeading";

export function Experience() {
  const verified = experience.filter((item) => item.verified);
  // Keep an empty career section out of the public presentation.
  if (!verified.length) return null;
  return (
    <section className="experience-section container" id="experience">
      <SectionHeading number="04" label="THE JOURNEY" title="EXPERIENCE." />
      <ol className="timeline">
        {verified.map((item) => (
          <li key={`${item.company}-${item.dates}`}>
            <span>{item.dates}</span>
            <div>
              <h3>{item.role}</h3>
              <p>{item.company}</p>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
