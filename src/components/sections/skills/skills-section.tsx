"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type {
  SkillGroup,
  SkillIconKey,
  SkillsContentView,
} from "@/content/skills";

import { skillIcons } from "./skill-icons";

interface SkillsSectionProps {
  content: SkillsContentView;
}

const tabOrder = [
  "tech-stack",
  "others",
] as const satisfies ReadonlyArray<SkillGroup>;

function SkillIcon({ iconKey }: { iconKey?: SkillIconKey }) {
  if (!iconKey) {
    return (
      <span aria-hidden="true" className="skill-card__mark">
        {"{}"}
      </span>
    );
  }

  const icon = skillIcons[iconKey];
  const monochrome = icon.hex === "#000000";

  return (
    <svg
      aria-hidden="true"
      className={
        monochrome
          ? "skill-card__icon skill-card__icon--mono"
          : "skill-card__icon"
      }
      fill={monochrome ? "currentColor" : icon.hex}
      viewBox="0 0 24 24"
    >
      <path d={icon.path} />
    </svg>
  );
}

export function SkillsSection({ content }: Readonly<SkillsSectionProps>) {
  const [activeTab, setActiveTab] = useState<SkillGroup>("tech-stack");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAndFocus(index: number) {
    const nextTab = tabOrder[index];

    setActiveTab(nextTab);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % tabOrder.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabOrder.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectAndFocus(nextIndex);
  }

  return (
    <section
      aria-labelledby="skills-title"
      className="skills-section navigation-anchor"
      id="skills"
    >
      <Container>
        <div className="skills-section__intro">
          <SectionHeading
            description={content.description}
            eyebrow={content.eyebrow}
            title={content.title}
            titleId="skills-title"
          />

          <div
            aria-label={content.tabsLabel}
            className="skills-tabs"
            role="tablist"
          >
            {tabOrder.map((tabId, index) => (
              <button
                aria-controls={`skills-panel-${tabId}`}
                aria-selected={activeTab === tabId}
                className="skills-tabs__tab"
                id={`skills-tab-${tabId}`}
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                role="tab"
                tabIndex={activeTab === tabId ? 0 : -1}
                type="button"
              >
                {content.tabs[tabId]}
              </button>
            ))}
          </div>
        </div>

        <div
          aria-labelledby="skills-tab-tech-stack"
          className="skills-panel"
          hidden={activeTab !== "tech-stack"}
          id="skills-panel-tech-stack"
          role="tabpanel"
          tabIndex={0}
        >
          <p className="skills-panel__description">
            {content.panels["tech-stack"]}
          </p>
          <ul className="skills-grid">
            {content.techStack.map((skill) => (
              <li className="skill-card" key={skill.id}>
                <SkillIcon iconKey={skill.iconKey} />
                <span className="skill-card__name">{skill.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-labelledby="skills-tab-others"
          className="skills-panel"
          hidden={activeTab !== "others"}
          id="skills-panel-others"
          role="tabpanel"
          tabIndex={0}
        >
          <p className="skills-panel__description">
            {content.panels.others}
          </p>
          <div className="skills-groups">
            {content.otherCategories.map((category) => (
              <section
                aria-labelledby={`skills-category-${category.id}`}
                className="skills-group"
                key={category.id}
              >
                <h3
                  className="skills-group__title"
                  id={`skills-category-${category.id}`}
                >
                  {category.name}
                </h3>
                <ul className="skills-group__list">
                  {category.skills.map((skill) => (
                    <li key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
