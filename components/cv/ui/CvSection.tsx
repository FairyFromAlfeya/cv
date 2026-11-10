import type { ReactNode } from "react";

export function CvSection({ id, children, ariaLabel }: { id: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <>
      <div id={id} data-cv-anchor aria-hidden="true" className="cv-section-anchor h-0" />
      <section
        data-cv-section
        data-section-id={id}
        aria-label={ariaLabel}
        className="cv-section relative min-h-[100svh] overflow-hidden bg-[#272727]"
      >
        {children}
      </section>
    </>
  );
}
