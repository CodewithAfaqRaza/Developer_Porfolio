import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { EngineeringIllustration } from "../illustrations/EngineeringIllustration";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "../../data/projects";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ProjectArtwork({
  visual,
}: {
  visual: PortfolioProject["visual"];
}) {
  if (visual === "event")
    return (
      <div className="project-art art-event" aria-hidden="true">
        <div className="mock-browser">
          <div className="browser-bar">
            <div className="browser-dots">
              <i />
              <i />
              <i />
            </div>
            <span>FORM / FUTURE / CULTURE</span>
            <span>↗</span>
          </div>
          <div className="event-layout">
            <div className="event-top">
              <strong>
                OTHER
                <br />
                SIDE<span>®</span>
              </strong>
              <span>
                A GATHERING
                <br />
                OF WHAT’S NEXT.
              </span>
            </div>
            <div className="event-main">
              <div>
                <span className="event-label">IMAGINE WHAT’S POSSIBLE.</span>
                <p>
                  STEP INTO
                  <br />
                  THE <em>OTHER</em>
                  <br />
                  SIDE.
                </p>
                <span className="event-cta">DISCOVER THE EXPERIENCE ↗</span>
              </div>
              <div className="event-sculpture">
                <div className="arch arch-one" />
                <div className="arch arch-two" />
                <div className="arch arch-three" />
              </div>
            </div>
            <div className="event-bottom">
              <span>IDEAS WITHOUT LIMITS.</span>
              <span>DESIGN / TECHNOLOGY / TOMORROW</span>
            </div>
          </div>
        </div>
        <span className="mock-caption">
          ORIGINAL INTERFACE STUDY — NOT CLIENT WORK
        </span>
      </div>
    );
  if (visual === "content")
    return (
      <div className="project-art art-content" aria-hidden="true">
        <div className="system-board">
          <div className="system-top">
            <span className="system-logo">▧</span>
            <strong>content, connected.</strong>
            <span>v.01</span>
          </div>
          <div className="system-diagram">
            <div className="node node-source">
              <i />
              CONTENT CORE<small>ONE SOURCE. MANY POSSIBILITIES.</small>
            </div>
            <div className="connector" />
            <div className="node-row">
              <div className="node">
                <span>◈</span>Pages
              </div>
              <div className="node">
                <span>⌘</span>Components
              </div>
              <div className="node">
                <span>↗</span>Experiences
              </div>
            </div>
            <div className="system-grid">
              <span>MODEL</span>
              <span>COMPOSE</span>
              <span>PUBLISH</span>
            </div>
          </div>
        </div>
        <span className="mock-caption">
          MODULAR PUBLISHING / VISUAL CONCEPT
        </span>
      </div>
    );
  return (
    <div className="project-art art-motion" aria-hidden="true">
      <span className="motion-label">
        EXPERIMENT_003 / SCROLL-LED COMPOSITION
      </span>
      <div className="project-illustration">
        <EngineeringIllustration />
      </div>
      <span className="motion-title">
        ENGINEERING
        <br />
        <em>IN MOTION.</em>
      </span>
      <span className="mock-caption">FORM / TYPOGRAPHY / MOVEMENT</span>
    </div>
  );
}

export function ProjectPreview({ project }: { project: PortfolioProject }) {
  if (project.cover) return (
    <div className="project-art project-preview">
      <img className="project-desktop" src={project.cover} loading="lazy" decoding="async" width="1440" height="960" alt={`${project.title} desktop website preview`} />
      {project.mobileCover && (
        <span className="project-mobile-device">
          <span className="project-mobile-screen">
            <img src={project.mobileCover} loading="lazy" decoding="async" width="390" height="844" alt={`${project.title} ${project.mobilePreviewKind === "concept" ? "illustrative mobile layout concept" : "mobile website screenshot"}`} />
          </span>
          <span className="project-mobile-caption">Mobile concept</span>
        </span>
      )}
    </div>
  );
  if (project.isDemo) return <ProjectArtwork visual={project.visual} />;
  return (
    <div className={`project-art project-identity identity-${project.id}`} aria-hidden="true">
      <span className="identity-category">{project.eyebrow}</span>
      <span className="identity-monogram">{project.monogram}</span>
      <strong className="identity-title">{project.title}</strong>
      <span className="identity-domain">{new URL(project.href!).hostname}</span>
    </div>
  );
}

export function ProjectCard({
  project,
  index,
  onOpen,
  showcase = false,
}: {
  project: PortfolioProject;
  index: number;
  showcase?: boolean;
  onOpen: (project: PortfolioProject) => void;
}) {
  const scope = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  useGSAP(() => {
    if (reducedMotion || showcase || !scope.current) return;
    const card = scope.current;
    gsap.fromTo(card.querySelector(".project-art"), { scale: 1.1, yPercent: 3 }, {
      scale: 1.1, yPercent: -3, ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.9 },
    });
    gsap.fromTo(card.querySelector(".project-info"), { y: 20 }, {
      y: 0, ease: "none",
      scrollTrigger: { trigger: card, start: "top bottom", end: "center center", scrub: 0.9 },
    });
  }, { scope, dependencies: [reducedMotion, showcase], revertOnUpdate: true });
  return (
    <article ref={scope} className={`project-card project-${project.visual}`} data-project-id={project.id} data-reveal>
      <button
        className="project-open"
        aria-label={`Explore ${project.title}`}
        onClick={() => onOpen(project)}
        onPointerMove={(event) => {
          if (event.pointerType === "touch") return;
          const card = event.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty("--project-tilt-x", `${(y * -3.5).toFixed(2)}deg`);
          card.style.setProperty("--project-tilt-y", `${(x * 3.5).toFixed(2)}deg`);
          card.style.setProperty("--project-glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
          card.style.setProperty("--project-glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
        }}
        onPointerLeave={(event) => {
          const card = event.currentTarget;
          card.style.setProperty("--project-tilt-x", "0deg");
          card.style.setProperty("--project-tilt-y", "0deg");
          card.style.setProperty("--project-glow-x", "50%");
          card.style.setProperty("--project-glow-y", "50%");
        }}
      >
        <ProjectPreview project={project} />
        <span className="project-badge">
          {!project.isDemo ? "DRUPAL PROJECT" : project.approvedForPortfolio ? "LIVE EXPERIMENT" : "CONCEPT STUDY"}
        </span>
        <span className="project-arrow">
          <ArrowUpRight size={23} />
        </span>
      </button>
      <div className="project-info">
        <div>
          <p className="eyebrow">
            {String(index + 1).padStart(2, "0")} / {project.eyebrow}
          </p>
          <h3>
            <button onClick={() => onOpen(project)}>{project.title}</button>
          </h3>
          <p className="project-summary">{project.summary}</p>
          {showcase && <><p className="showcase-role">{project.role}</p><ul className="showcase-contributions">{project.contributions.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul></>}
        </div>
        {project.href && <a className="text-link project-live-link" href={project.href} target="_blank" rel="noopener noreferrer">Visit {project.title} <ArrowUpRight size={16} /></a>}
        {showcase && <button className="text-link showcase-details" onClick={() => onOpen(project)}>View details <ArrowUpRight size={16} /></button>}
        <div className="project-tags">
          {project.stack.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
