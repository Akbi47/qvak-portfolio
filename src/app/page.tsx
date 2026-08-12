import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/ui/section-heading";

const foundationItems = [
  {
    title: "Responsive by default",
    description: "A shared container adapts from mobile through wide screens.",
  },
  {
    title: "One visual language",
    description: "Semantic tokens keep future sections coherent and maintainable.",
  },
  {
    title: "Motion with care",
    description: "The foundation honors reduced-motion preferences from the start.",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <Section aria-labelledby="foundation-title" surface="elevated">
        <SectionHeading
          description="The shared design system and page shell are ready for portfolio sections to build on."
          eyebrow="Portfolio foundation"
          level="h1"
          title="A clear frame for the work ahead."
          titleId="foundation-title"
        />

        <div className="foundation-grid">
          {foundationItems.map((item) => (
            <article className="foundation-card" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
