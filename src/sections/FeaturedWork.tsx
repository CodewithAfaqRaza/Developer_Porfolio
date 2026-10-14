import { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { projects, type PortfolioProject } from "../data/projects";
import { ProjectCard } from "../components/effects/ProjectCard";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProjectDialog } from "../components/ui/ProjectDialog";
import { useMediaQuery, useReducedMotion } from "../hooks/useReducedMotion";

export function FeaturedWork() {
  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const visible = projects.filter(project => project.approvedForPortfolio || project.isDemo);
  const featured = visible.slice(0, 5);
  const remaining = visible.slice(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = featured[activeIndex];
  const mobile = useMediaQuery("(max-width: 767px)");
  const reducedMotion = useReducedMotion();
  const batchSize = mobile ? 2 : 5;
  const [expandedCount, setExpandedCount] = useState(0);
  const shownCount = Math.min(remaining.length, expandedCount);
  const grid = useRef<HTMLDivElement>(null);
  const index = useRef<HTMLDivElement>(null);
  const firstAdded = useRef<number | null>(null);
  useLayoutEffect(() => {
    const button = index.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (button && index.current && mobile) index.current.scrollTo({ left: button.offsetLeft - index.current.offsetLeft, behavior: reducedMotion ? "instant" : "smooth" });
  }, [activeIndex, mobile, reducedMotion]);
  useLayoutEffect(() => {
    if (firstAdded.current === null) return;
    const card = grid.current?.children[firstAdded.current] as HTMLElement | undefined;
    card?.querySelector<HTMLButtonElement>(".project-open")?.focus({ preventScroll: true });
    card?.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
    firstAdded.current = null;
  }, [shownCount, reducedMotion]);
  const loadMore = () => {
    firstAdded.current = shownCount;
    setExpandedCount(Math.min(remaining.length, shownCount + batchSize));
  };
  const integrated = visible.filter(project => project.stack.includes("Swapcard")).length;
  return (
    <section id="work" className="work-section container">
      <SectionHeading number="01" label="SELECTED WORK" title={<>Real projects.<br /><span className="serif-text">Built with Drupal.</span></>}>
        <p>Drupal development across event platforms, corporate publishing and ecommerce, with connected APIs, campaign tracking and event integrations.</p>
        <span className="small-note">{visible.length} websites / {integrated} integrated event platforms <ArrowUpRight size={14} /></span>
      </SectionHeading>
      <div className="project-showcase">
        <div className="showcase-index" ref={index} role="group" aria-label="Featured project selector">
          <p className="eyebrow showcase-index-label">THE PROJECT INDEX / 01—05</p>
          {featured.map((project, position) => (
            <button key={project.id} className="showcase-select" aria-pressed={position === activeIndex} aria-controls="featured-project" onClick={() => setActiveIndex(position)}>
              <span className="showcase-number">{String(position + 1).padStart(2, "0")}</span>
              <span>{project.title}</span><ArrowUpRight size={18} aria-hidden="true" />
            </button>
          ))}
          <p className="showcase-index-note">Five projects. Different worlds.<br />Explore the work behind each one.</p>
        </div>
        <div id="featured-project" className="showcase-stage">
          <div className="showcase-navigation">
            <p role="status" aria-live="polite" aria-atomic="true">{String(activeIndex + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")} — {active.title}</p>
            <div>
              <button aria-label="Previous featured project" disabled={activeIndex === 0} onClick={() => setActiveIndex(value => value - 1)}><ArrowLeft size={18} /></button>
              <button aria-label="Next featured project" disabled={activeIndex === featured.length - 1} onClick={() => setActiveIndex(value => value + 1)}><ArrowRight size={18} /></button>
            </div>
          </div>
          <ProjectCard key={active.id} project={active} index={activeIndex} onOpen={setSelected} showcase />
        </div>
      </div>
      {shownCount > 0 && <div className="remaining-project-heading"><h3>More projects. Same attention to detail.</h3><p>The rest of the collection.</p></div>}
      <div className="project-grid" id="project-grid" ref={grid}>
        {remaining.slice(0, shownCount).map((project, position) => <ProjectCard key={project.id} project={project} index={position + featured.length} onOpen={setSelected} />)}
      </div>
      <div className="project-pagination">
        <p role="status" aria-live="polite" aria-atomic="true">{shownCount ? `Showing ${shownCount} of ${remaining.length} more projects` : `${visible.length} projects. Explore the full collection.`}</p>
        {shownCount < remaining.length && <button className="button button-primary project-load-more" onClick={loadMore} aria-controls="project-grid" aria-expanded={shownCount > 0}>{shownCount ? "Load more projects" : "View all projects"} <ArrowDown size={18} aria-hidden="true" /></button>}
      </div>
      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
