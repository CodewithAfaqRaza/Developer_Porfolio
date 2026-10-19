import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { PortfolioProject } from "../../data/projects";
import { ProjectPreview } from "../effects/ProjectCard";

export function ProjectDialog({
  project,
  onClose,
}: {
  project: PortfolioProject | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (project) {
      ref.current?.showModal();
      document.body.style.overflow = "hidden";
    } else ref.current?.close();
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);
  return (
    <dialog
      ref={ref}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {project && (
        <div className="dialog-content">
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="Close project details"
            autoFocus
          >
            <X size={22} />
          </button>
          <p className="eyebrow">
            {!project.isDemo ? "DRUPAL PROJECT / DEVELOPMENT CONTRIBUTION" : project.approvedForPortfolio ? "LIVE PORTFOLIO EXPERIMENT" : "ILLUSTRATIVE CONCEPT / NOT CLIENT WORK"}
          </p>
          <h2 id="project-dialog-title">{project.title}</h2>
          <ProjectPreview project={project} />
          <div className="dialog-columns">
            <div>
              <h3>{project.isDemo ? "The idea" : "Project context"}</h3>
              <p>{project.challenge}</p>
              <h3>{project.isDemo ? "Approach" : "My contribution"}</h3>
              <ul>
                {project.contributions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {project.siteExperience && <><h3>Site experience</h3><p>{project.siteExperience}</p></>}
              {project.outcome && (
                <>
                  <h3>Verified outcome</h3>
                  <p>{project.outcome}</p>
                </>
              )}
            </div>
            <aside>
              <h3>Context</h3>
              <p>{project.role}</p>
              <h3>{project.isDemo ? "Explored stack" : "Technology & integrations"}</h3>
              <div className="project-tags">
                {project.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {project.languageVersions && <div className="project-languages">
                <h3>Languages</h3>
                <p>{project.languageNote}</p>
                {project.href && <a className="text-link" href={project.href} target="_blank" rel="noopener noreferrer" hrefLang="en">English website <ArrowUpRight size={16} /></a>}
                {project.languageVersions.map(version => <a key={version.locale} className="text-link" href={version.href} hrefLang={version.locale} target="_blank" rel="noopener noreferrer">{version.language} content <ArrowUpRight size={16} /></a>)}
              </div>}
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Visit project <ArrowUpRight size={16} />
                </a>
              )}
              {project.visual === "motion" && (
                <a className="text-link" href="#top" onClick={onClose}>
                  See the live hero <ArrowUpRight size={16} />
                </a>
              )}
            </aside>
          </div>
        </div>
      )}
    </dialog>
  );
}
