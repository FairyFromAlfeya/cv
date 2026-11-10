import type { Dictionary, Locale, LocalizedSection, NavigateToSection } from "@/components/cv/config";
import { SectionDots } from "@/components/cv/chrome/SectionDots";
import { SiteFooter } from "@/components/cv/chrome/SiteFooter";

type PageChromeProps = {
  activeIndex: number;
  sections: LocalizedSection[];
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onNavigate: NavigateToSection;
  dictionary: Dictionary;
};

export function PageChrome({ activeIndex, sections, locale, onLocaleChange, onNavigate, dictionary }: PageChromeProps) {
  const active = sections[activeIndex] ?? sections[0];

  return (
    <>
      <aside
        className="section-label fixed left-[2.8vw] z-30 -translate-x-1/2 -translate-y-1/2 text-[clamp(9px,.733vw,11px)] font-semibold uppercase text-white transition-[top] duration-500"
        style={{ top: `${active.railTop}%` }}
        aria-hidden="true"
      >
        <span>{active.label}</span>
      </aside>

      <SectionDots activeIndex={activeIndex} sections={sections} dictionary={dictionary} onNavigate={onNavigate} />

      <SiteFooter copy={dictionary.footer} locale={locale} onLocaleChange={onLocaleChange} />
    </>
  );
}
