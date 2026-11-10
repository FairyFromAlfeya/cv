import type { Dictionary } from "@/components/cv/config";
import { CvSection } from "@/components/cv/ui/CvSection";

function ProgressBar({ label, level }: { label: string; level: number }) {
  return (
    <div
      className="skill-bar relative h-7 w-full text-[clamp(9px,.733vw,11px)] text-white"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={level}
    >
      <span className="absolute left-0 top-0">{label}</span>
      <span className="absolute right-0 top-0">{level}%</span>
      <div className="absolute inset-x-0 bottom-0 h-2 rounded bg-white" />
      <div
        className="absolute bottom-0 left-0 h-2 rounded bg-[#f3ca2f]"
        style={{ width: `${level}%` }}
      />
    </div>
  );
}

export function AboutSection({ copy }: { copy: Dictionary["about"] }) {
  return (
    <CvSection id="about">
      <div className="about-content absolute left-[18.8vw] top-[28vh] z-10 grid w-[62.4vw] grid-cols-[49%_35.9%] justify-between">
        <div>
          <p className="flex h-[8vh] items-center text-[clamp(10px,.8vw,12px)]">{copy.eyebrow}</p>
          <h2 className="text-[clamp(20px,2.067vw,31px)] font-semibold uppercase leading-[1.55]">
            {copy.titleFirst}
            <br />
            {" "}
            <span className="text-[#f3ca2f]">{copy.titleAccent}</span>
            {copy.titleAfterAccent ? ` ${copy.titleAfterAccent}` : null}
            <br />
            {" "}
            {copy.titleLast}
          </h2>
          <p className="mt-[5.5vh] text-[clamp(10px,.8vw,12px)] leading-[1.5]">{copy.description}</p>
        </div>
        <div className="skills-list grid gap-[8vh] pt-[3vh]">
          {copy.skills.map((skill) => (
            <ProgressBar key={skill.label} label={skill.label} level={skill.level} />
          ))}
        </div>
      </div>
    </CvSection>
  );
}
