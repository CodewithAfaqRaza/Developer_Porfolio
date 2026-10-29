import { useState } from "react";
import {
  Accessibility,
  Bot,
  BrainCircuit,
  Server,
  Cloud,
  Code2,
  Gauge,
  Layers,
  Workflow,
  Plus,
  Minus,
} from "lucide-react";
import { capabilities } from "../data/profile";

const icons = [Layers, Server, Code2, BrainCircuit, Bot, Workflow, Cloud, Gauge, Accessibility];
export function Skills() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <section id="stack" className="stack-section container">
      <div className="section-side-label">
        <p className="eyebrow">AREAS OF FOCUS</p>
        <span>THE ENGINEERING TOOLKIT</span>
      </div>
      <div className="capabilities-content">
        <h2>
          Thoughtful solutions,
          <br />
          from foundation to frontend.
        </h2>
        <p className="capabilities-intro">
          The expertise behind the experience—from content architecture and
          expressive interfaces to connected systems and AI-powered workflows.
        </p>
        <div className="capability-list">
          {capabilities.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article
                className="capability capability-tilt"
                key={item.name}
                onPointerMove={(event) => {
                  if (event.pointerType === "touch") return;
                  const card = event.currentTarget;
                  const rect = card.getBoundingClientRect();
                  const x = (event.clientX - rect.left) / rect.width - 0.5;
                  const y = (event.clientY - rect.top) / rect.height - 0.5;
                  card.style.setProperty("--tilt-x", `${(y * -7).toFixed(2)}deg`);
                  card.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
                  card.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
                  card.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
                }}
                onPointerLeave={(event) => {
                  const card = event.currentTarget;
                  card.style.setProperty("--tilt-x", "0deg");
                  card.style.setProperty("--tilt-y", "0deg");
                  card.style.setProperty("--glow-x", "50%");
                  card.style.setProperty("--glow-y", "50%");
                }}
              >
                <Icon
                  className="capability-icon"
                  size={36}
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <button
                  className="capability-toggle"
                  aria-expanded={expanded === index}
                  aria-controls={`capability-${index}`}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  {expanded === index ? "Show less" : "Explore stack"}{" "}
                  {expanded === index ? (
                    <Minus size={12} />
                  ) : (
                    <Plus size={12} />
                  )}
                </button>
                <div
                  id={`capability-${index}`}
                  hidden={expanded !== index}
                  className="capability-details"
                >
                  <div className="project-tags">
                    {item.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
