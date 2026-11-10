import { useState } from "react";
import type { Dictionary, LocalizedSection, NavigateToSection } from "@/components/cv/config";

type SectionDotsProps = {
  activeIndex: number;
  sections: LocalizedSection[];
  dictionary: Dictionary;
  onNavigate: NavigateToSection;
};

type DropDirection = "idle" | "up" | "down";

const getDotTop = (index: number) => `${((8 + index * 29.71) / 224) * 100}%`;

export function SectionDots({ activeIndex, sections, dictionary, onNavigate }: SectionDotsProps) {
  const [motion, setMotion] = useState({ currentIndex: activeIndex, previousIndex: activeIndex });

  if (motion.currentIndex !== activeIndex) {
    setMotion({ currentIndex: activeIndex, previousIndex: motion.currentIndex });
  }

  const direction: DropDirection =
    motion.currentIndex === motion.previousIndex
      ? "idle"
      : motion.currentIndex > motion.previousIndex
        ? "down"
        : "up";

  return (
    <nav
      className="section-dots fixed right-[2.8vw] top-[36vh] z-30 h-[min(28vh,224px)] w-10"
      aria-label={dictionary.navigation.pageSections}
    >
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onNavigate(section.id, "stepper");
          }}
          aria-label={`${dictionary.navigation.goToSection} ${section.label}`}
          aria-current={activeIndex === index ? "page" : undefined}
          className="absolute left-0 grid h-7 w-10 -translate-y-1/2 cursor-pointer place-items-center focus:outline-none focus-visible:rounded focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#f3ca2f]"
          style={{ top: getDotTop(index) }}
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white" />
        </a>
      ))}

      <span
        aria-hidden="true"
        className="stepper-drop-marker pointer-events-none absolute left-1/2 z-10 h-[18px] w-3 -translate-x-1/2 -translate-y-1/2"
        style={{ top: getDotTop(activeIndex) }}
      >
        <span className="stepper-drop-direction block h-full w-full" data-direction={direction}>
          <span key={activeIndex} className="stepper-drop absolute left-0.5 top-[5px] block h-2 w-2 bg-[#f3ca2f]" />
        </span>
      </span>
    </nav>
  );
}
