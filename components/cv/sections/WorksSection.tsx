import { useRef } from "react";
import type { Dictionary } from "@/components/cv/config";
import { CvSection } from "@/components/cv/ui/CvSection";
import { SectionBackground } from "@/components/cv/ui/SectionBackground";

type Work = Dictionary["works"]["items"][number];

const cardClassName =
  "work-card relative isolate flex h-[18vh] min-h-28 flex-col overflow-hidden border-2 border-white px-[7.4%] py-[10%] text-white transition-colors duration-300 hover:border-[#f3ca2f] focus-visible:border-[#f3ca2f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-[#f3ca2f]";

type WorkCardProps = {
  work: Work;
  index: number;
  opensInNewTab: string;
  skillsLabel: string;
  onReveal: (workId: string, index: number, trigger: "pointer" | "keyboard") => void;
  onOpen: (workId: string, index: number) => void;
};

function WorkCard({ work, index, opensInNewTab, skillsLabel, onReveal, onOpen }: WorkCardProps) {
  const revealedRef = useRef(false);

  function reveal(trigger: "pointer" | "keyboard") {
    if (revealedRef.current) return;
    revealedRef.current = true;
    onReveal(work.id, index, trigger);
  }

  const content = (
    <>
      <h3 className="text-[clamp(13px,1.2vw,18px)] font-semibold leading-[1.45]">{work.title}</h3>
      <span className="mt-1 text-[clamp(10px,.8vw,12px)] leading-[1.5]">{work.category}</span>
      <div
        className={`work-card-skills pointer-events-none absolute inset-0 z-10 flex flex-col justify-center bg-[rgba(39,39,39,.97)] px-[7.4%] py-[8%] ${work.skills.length > 12 ? "work-card-skills--dense" : ""}`}
      >
        <span className="work-card-skills-label font-semibold uppercase text-[#f3ca2f]">{skillsLabel}</span>
        <p className="work-card-skills-copy mt-2 text-white">{work.skills.join(" | ")}</p>
      </div>
    </>
  );

  if (!work.href) {
    return (
      <article
        className={cardClassName}
        tabIndex={0}
        onPointerEnter={() => reveal("pointer")}
        onFocus={() => reveal("keyboard")}
      >
        {content}
      </article>
    );
  }

  return (
    <a
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
      onPointerEnter={() => reveal("pointer")}
      onFocus={() => reveal("keyboard")}
      onClick={() => onOpen(work.id, index)}
    >
      {content}
      <span className="sr-only"> ({opensInNewTab})</span>
    </a>
  );
}

type WorksSectionProps = {
  copy: Dictionary["works"];
  onReveal: WorkCardProps["onReveal"];
  onOpen: WorkCardProps["onOpen"];
};

export function WorksSection({ copy, onReveal, onOpen }: WorksSectionProps) {
  return (
    <CvSection id="works">
      <SectionBackground src="/assets/works.png" alt={copy.backgroundAlt} />
      <div className="works-content absolute left-[18.8vw] top-[18vh] z-10 w-[62.4vw]">
        <h2 className="h-[10vh] text-[clamp(20px,2.067vw,31px)] font-semibold uppercase leading-[1.4]">
          {copy.title}
        </h2>
        <div className="works-grid mt-[8vh] grid grid-cols-4 gap-x-[1.6vw] gap-y-[10vh]">
          {copy.items.map((work, index) => (
            <WorkCard
              key={work.id}
              work={work}
              index={index}
              opensInNewTab={copy.opensInNewTab}
              skillsLabel={copy.skillsLabel}
              onReveal={onReveal}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </CvSection>
  );
}
