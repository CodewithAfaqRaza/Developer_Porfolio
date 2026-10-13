import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects, type PortfolioProject } from "../data/projects";
import { ProjectCard } from "../components/effects/ProjectCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProjectDialog } from "../components/ui/ProjectDialog";

export function FeaturedWork() {
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const visible = projects.filter(
    (project) => project.approvedForPortfolio || project.isDemo,
  );
  const integrated = visible.filter((project) => project.stack.includes("Swapcard")).length;
  return (
    <section id="work" className="work-section container">
      <SectionHeading
        number="01"
        label="SELECTED WORK"
        title={
          <>
            Real projects.
            <br />
            <span className="serif-text">Built with Drupal.</span>
          </>
        }
      >
        <p>Drupal development across event platforms, corporate publishing, and advanced materials. {integrated} event projects include Swapcard, custom UTM and URN handling, and API integrations.</p>
        <span className="small-note">
          {visible.length} websites / {integrated} integrated event platforms{" "}
          <ArrowUpRight size={14} />
        </span>
      </SectionHeading>
      <div className="project-grid">
        {visible.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onOpen={setSelected}
          />
        ))}
      </div>
      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
