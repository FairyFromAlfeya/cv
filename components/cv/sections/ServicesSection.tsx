import Image from "next/image";
import type { Dictionary } from "@/components/cv/config";
import { CvSection } from "@/components/cv/ui/CvSection";

export function ServicesSection({ copy }: { copy: Dictionary["services"] }) {
  return (
    <CvSection id="services">
      <div className="services-content absolute left-[18.8vw] top-[28vh] z-10 grid w-[62.4vw] grid-cols-[40.9%_35.9%] justify-between">
        <div>
          <p className="flex h-[8vh] items-center text-[clamp(10px,.8vw,12px)]">{copy.eyebrow}</p>
          <h2 className="text-[clamp(20px,2.067vw,31px)] font-semibold uppercase leading-[1.55]">
            {copy.titleBeforeAccent}{" "}
            <span className="text-[#f3ca2f]">{copy.titleAccent}</span>{" "}
            {copy.titleAfterAccent}
            <br />
            {" "}
            {copy.titleLast}
          </h2>
          <ol className="mt-[6vh] list-decimal space-y-[1.25vh] pl-5 text-[clamp(10px,.933vw,14px)] font-medium uppercase">
            {copy.items.map((service, index) => <li key={`${service}-${index}`}>{service}</li>)}
          </ol>
        </div>
        <div className="service-photo relative h-[44vh] bg-[#666563]">
          <Image
            src="/assets/services.jpg"
            alt={copy.photoAlt}
            fill
            loading="eager"
            sizes="(max-width: 767px) calc(100vw - 48px), 23vw"
            className="z-[1] object-cover"
          />
          <div className="experience absolute bottom-[-9%] left-[24%] z-10 flex items-center uppercase">
            <span className="text-[clamp(82px,8.533vw,128px)] font-semibold leading-none">6</span>
            <span className="ml-1 text-[clamp(12px,1.2vw,18px)] font-medium leading-[1.55]">
              {copy.years}
              <br />
              {copy.experience}
              <br />
              {copy.working}
            </span>
          </div>
        </div>
      </div>
    </CvSection>
  );
}
