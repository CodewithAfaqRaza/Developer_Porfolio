import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { projects, type PortfolioProject } from "../data/projects";
import { ProjectCard } from "../components/effects/ProjectCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProjectDialog } from "../components/ui/ProjectDialog";

import { useMediaQuery, useReducedMotion } from "../hooks/useReducedMotion";

export function FeaturedWork() {
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const visible = projects.filter(
    (project) => project.approvedForPortfolio || project.isDemo,
  );
  const mobile = useMediaQuery("(max-width: 767px)");
  const reducedMotion = useReducedMotion();
  const batchSize = mobile ? 2 : 5;
  const [expandedCount, setExpandedCount] = useState(0);
  const shownCount = Math.min(visible.length, Math.max(batchSize, expandedCount));
  const grid = useRef<HTMLDivElement>(null);
  const firstAdded = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (firstAdded.current === null) return;
    const card = grid.current?.children[firstAdded.current] as HTMLElement | undefined;
    card?.querySelector<HTMLButtonElement>(".project-open")?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
    firstAdded.current = null;
  }, [shownCount, reducedMotion]);
  const loadMore = () => {
    firstAdded.current = shownCount;
    setExpandedCount(Math.min(visible.length, shownCount + batchSize));
  };
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
      <div className="project-grid" id="project-grid" ref={grid}>
        {visible.slice(0, shownCount).map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onOpen={setSelected}
          />
        ))}
      </div>
      <div className="project-pagination">
        <p role="status" aria-live="polite" aria-atomic="true">
          Showing {shownCount} of {visible.length} projects
        </p>
        {shownCount < visible.length && (
          <button className="button button-primary project-load-more" onClick={loadMore} aria-controls="project-grid">
            Load more projects <ArrowDown size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
