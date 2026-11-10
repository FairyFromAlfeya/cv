import type { SectionId } from "@/components/cv/config";

export function scrollToSection(id: SectionId) {
  const target = document.getElementById(id);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = window.scrollY + target.getBoundingClientRect().top;
  window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
}
