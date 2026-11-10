import type { Dictionary } from "@/components/cv/config";
import { CvSection } from "@/components/cv/ui/CvSection";
import { SectionBackground } from "@/components/cv/ui/SectionBackground";

type TestimonialsSectionProps = {
  copy: Dictionary["testimonials"];
  testimonial: Dictionary["testimonials"]["items"][number];
  compactTitle: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function TestimonialsSection({ copy, testimonial, compactTitle, onPrevious, onNext }: TestimonialsSectionProps) {
  return (
    <CvSection id="philosophy">
      <SectionBackground src="/assets/testimonials.png" alt={copy.backgroundAlt} />
      <div className="testimonial-content absolute left-[18.8vw] top-[18vh] z-10 grid h-[64vh] w-[62.4vw] grid-cols-[42.3%_36.2%] justify-between">
        <div className="testimonial-summary flex flex-col pt-[11.75vh]">
          <img src="/assets/quote.svg" alt="" width="50" height="50" />
          <h2
            className={`testimonial-title mt-[10vh] flex h-[36vh] flex-col justify-center text-[clamp(20px,2.067vw,31px)] font-semibold uppercase leading-[1.55] ${compactTitle ? "testimonial-title--compact" : ""}`}
          >
            {testimonial.title.map((line) => <span key={line} className="block">{line}</span>)}
          </h2>
        </div>
        <div className="testimonial-details relative left-[.2vw] h-full">
          <blockquote
            className="testimonial-quote-block flex h-[28vh] flex-col justify-center text-[clamp(10px,.8vw,12px)] font-medium leading-[1.5]"
          >
            <p className="testimonial-quote-text whitespace-pre-line">{testimonial.quote}</p>
            {testimonial.original ? (
              <p lang="ja" className="testimonial-original mt-6">
                {testimonial.original}
              </p>
            ) : null}
          </blockquote>
          {testimonial.author || testimonial.descriptor ? (
            <footer className="testimonial-attribution absolute left-0 top-[39.75vh]">
              {testimonial.author ? (
                <cite className="block text-[clamp(12px,1vw,15px)] font-bold leading-[1.8] not-italic">
                  {testimonial.author}
                </cite>
              ) : null}
              {testimonial.descriptor ? (
                <p className="mt-[2px] text-[clamp(10px,.8vw,12px)] font-medium leading-[1.75]">
                  {testimonial.descriptor}
                </p>
              ) : null}
            </footer>
          ) : null}
          <div className="testimonial-controls absolute bottom-[5.1vh] left-[.13vw] flex gap-[1.2vw]">
            <button
              type="button"
              onClick={onPrevious}
              aria-label={copy.previous}
              className="relative grid size-[37px] cursor-pointer place-items-center border-2 border-white transition-colors hover:border-[#f3ca2f]"
            >
              <img src="/assets/chevron-left.svg" alt="" width="17" height="17" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label={copy.next}
              className="relative grid size-[37px] cursor-pointer place-items-center border-2 border-white transition-colors hover:border-[#f3ca2f]"
            >
              <img className="rotate-180" src="/assets/chevron-left.svg" alt="" width="17" height="17" />
            </button>
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {testimonial.title.join(". ")}. {testimonial.quote} {testimonial.original} {testimonial.author}{" "}
          {testimonial.descriptor}
        </p>
      </div>
    </CvSection>
  );
}
