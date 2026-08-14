"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FeaturedProjectsView } from "@/content/projects";

import { ProjectMediaCarousel } from "./project-media-carousel";

interface ProjectsSectionProps {
  content: FeaturedProjectsView;
}

interface ProjectActionProps {
  href: string;
  label: string;
  icon: ReactNode;
}

function ProjectAction({ href, icon, label }: Readonly<ProjectActionProps>) {
  return (
    <a
      className="project-action"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="project-action__icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </a>
  );
}

function LiveDemoIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="currentColor"
      />
      <path
        d="m8.5 8.5 5-5a4.95 4.95 0 0 1 7 7l-5 5M15.5 15.5l-5 5a4.95 4.95 0 0 1-7-7l5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-12-2 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function ProjectsSection({ content }: Readonly<ProjectsSectionProps>) {
  const { projects } = content;
  const [activeIndex, setActiveIndex] = useState(0);
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "horizontal",
  );
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");

    function syncOrientation(event: MediaQueryListEvent | MediaQueryList) {
      setOrientation(event.matches ? "vertical" : "horizontal");
    }

    syncOrientation(query);
    query.addEventListener("change", syncOrientation);

    return () => query.removeEventListener("change", syncOrientation);
  }, []);

  function selectAndFocus(index: number) {
    const nextIndex = (index + projects.length) % projects.length;

    setActiveIndex(nextIndex);
    const tab = tabRefs.current[nextIndex];
    tab?.focus();
    tab?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "auto",
    });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | undefined;
    const isVertical = orientation === "vertical";

    switch (event.key) {
      case "ArrowDown":
        nextIndex = isVertical ? currentIndex + 1 : undefined;
        break;
      case "ArrowUp":
        nextIndex = isVertical ? currentIndex - 1 : undefined;
        break;
      case "ArrowRight":
        nextIndex = isVertical ? undefined : currentIndex + 1;
        break;
      case "ArrowLeft":
        nextIndex = isVertical ? undefined : currentIndex - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = projects.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    selectAndFocus(nextIndex);
  }

  return (
    <section
      aria-labelledby="projects-title"
      className="projects-section navigation-anchor"
      id="projects"
    >
      <Container>
        <div className="projects-section__intro">
          <SectionHeading
            description={content.description}
            eyebrow={content.eyebrow}
            title={content.title}
            titleId="projects-title"
          />
        </div>

        <div className="projects-layout">
          <div
            aria-label={content.selectorLabel}
            aria-orientation={orientation}
            className="projects-selector"
            role="tablist"
          >
            {projects.map((project, index) => (
              <button
                aria-controls={`projects-panel-${project.id}`}
                aria-selected={activeIndex === index}
                className="project-selector__item"
                id={`projects-tab-${project.id}`}
                key={project.id}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                role="tab"
                tabIndex={activeIndex === index ? 0 : -1}
                type="button"
              >
                <span aria-hidden="true" className="project-selector__index">
                  {project.index}
                </span>
                <span className="project-selector__body">
                  <span className="project-selector__title">
                    {project.title}
                  </span>
                  <span className="project-selector__category">
                    {project.category}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {projects.map((project, index) => (
            <div
              aria-labelledby={`projects-tab-${project.id}`}
              className="projects-panel"
              hidden={activeIndex !== index}
              id={`projects-panel-${project.id}`}
              key={project.id}
              role="tabpanel"
              tabIndex={0}
            >
              <div className="projects-panel__header">
                <p className="projects-panel__category">{project.category}</p>
                <p className="projects-panel__counter" aria-hidden="true">
                  {project.index}
                  <span aria-hidden="true">/</span>
                  {String(projects.length).padStart(2, "0")}
                </p>
              </div>

              <h3 className="projects-panel__title">{project.title}</h3>
              <p className="projects-panel__summary">{project.summary}</p>

              {project.highlights ? (
                <ul className="projects-panel__highlights">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ) : null}

              <ul className="projects-panel__tech" aria-label={content.selectorLabel}>
                {project.techStack.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>

              <ProjectMediaCarousel
                imageLabel={content.imageCounter}
                media={project.media}
                nextLabel={content.nextImage}
                previousLabel={content.previousImage}
              />

              {project.liveDemoUrl || project.codeUrl ? (
                <div className="projects-panel__actions">
                  {project.liveDemoUrl ? (
                    <ProjectAction
                      href={project.liveDemoUrl}
                      icon={<LiveDemoIcon />}
                      label={content.liveDemo}
                    />
                  ) : null}
                  {project.codeUrl ? (
                    <ProjectAction
                      href={project.codeUrl}
                      icon={<CodeIcon />}
                      label={content.code}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
