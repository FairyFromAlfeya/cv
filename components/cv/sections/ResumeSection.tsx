import type { Dictionary } from "@/components/cv/config";
import { CvSection } from "@/components/cv/ui/CvSection";
import { SectionBackground } from "@/components/cv/ui/SectionBackground";

export function ResumeSection({ copy }: { copy: Dictionary["resume"] }) {
  return (
    <CvSection id="resume">
      <SectionBackground src="/assets/resume.png" alt={copy.backgroundAlt} />
      <div className="resume-content absolute left-[18.8vw] top-[18vh] z-10 grid h-[64vh] w-[62.4vw] grid-cols-2 gap-[1.6vw]">
        {copy.columns.map((column, index) => (
          <article
            key={`${column.title}-${index}`}
            className={`resume-card relative overflow-hidden bg-black/20 ${index === 0 ? "resume-card-detailed" : "resume-card-experience"}`}
          >
            <h2 className="resume-card-title flex h-[5vh] items-center justify-center bg-[rgba(243,202,47,.4)] text-[clamp(11px,.933vw,14px)] font-semibold text-black">
              {column.title}
            </h2>
            <ol className="resume-timeline absolute inset-x-0 bottom-0 top-[5vh] m-0 list-none p-0">
              {column.items.map((item, itemIndex) => (
                <li key={`${item.title}-${itemIndex}`} className="resume-entry absolute right-[7%] left-[14.2544%]">
                  <h3 className="text-[clamp(11px,.933vw,14px)] font-semibold uppercase leading-[1.65] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-[1.625vh] text-[clamp(10px,.8vw,12px)] leading-[1.5] text-white">{item.institution}</p>
                  <p className="mt-[2vh] text-[clamp(10px,.733vw,11px)] leading-[1.5] text-[#f3ca2f]">{item.period}</p>
                  <p className="resume-entry-description mt-[4.25vh] text-[clamp(10px,.8vw,12px)] leading-[1.5] text-white">
                    {item.description}
                  </p>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </CvSection>
  );
}
