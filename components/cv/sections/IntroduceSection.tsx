import type { Dictionary } from "@/components/cv/config";
import { CvSection } from "@/components/cv/ui/CvSection";
import { SectionBackground } from "@/components/cv/ui/SectionBackground";

export function IntroduceSection({ copy }: { copy: Dictionary["hero"] }) {
  return (
    <CvSection id="introduce">
      <SectionBackground src="/assets/hero.png" alt={copy.backgroundAlt} />
      <div className="hero-content absolute left-[18.8vw] top-[36vh] z-10 text-white">
        <p className="flex h-[10vh] flex-col justify-center text-[clamp(10px,.733vw,11px)] leading-normal">
          {copy.welcome.map((line) => <span key={line}>{line}</span>)}
        </p>
        <h1 className="w-[29.4vw] min-w-[420px] text-[clamp(36px,3.733vw,56px)] font-semibold uppercase leading-[1.28]">
          <span className="text-[#f3ca2f]">{copy.greetingAccent}</span> {copy.greetingFirst}
          <br />
          {copy.greetingSecond}
        </h1>
        <img className="mt-[8.5vh]" src="/assets/accent-line.svg" alt="" width="96" height="3" />
      </div>
    </CvSection>
  );
}
