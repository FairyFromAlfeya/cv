import { CvSection } from "@/components/cv/ui/CvSection";

const careerLogos = [
  {
    src: "/assets/latoken.svg",
    alt: "LATOKEN",
    width: 216,
    height: 48,
    className: "max-w-[216px]",
  },
  {
    src: "/assets/blockchain-family.svg",
    alt: "Blockchain Family",
    width: 216,
    height: 24,
    className: "max-w-[216px] -scale-y-100",
  },
  {
    src: "/assets/broxus.svg",
    alt: "Broxus",
    width: 180,
    height: 38,
    className: "max-w-[180px] brightness-0 invert",
  },
] as const;

export function CareerSection({ title }: { title: string }) {
  return (
    <CvSection id="career" ariaLabel={title}>
      <h2 className="sr-only">{title}</h2>
      <div className="career-content absolute left-[18.8vw] top-1/2 z-10 grid w-[62.4vw] grid-cols-3 items-center gap-[clamp(32px,4vw,72px)]">
        {careerLogos.map((logo) => (
          <div key={logo.alt} className="flex h-20 min-w-0 items-center justify-center">
            <img
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={`h-auto w-full object-contain ${logo.className}`}
            />
          </div>
        ))}
      </div>
    </CvSection>
  );
}
