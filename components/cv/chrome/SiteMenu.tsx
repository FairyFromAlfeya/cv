import type { LocalizedSection, NavigateToSection } from "@/components/cv/config";

type SiteMenuProps = {
  analyticsSettingsLabel: string;
  navigationLabel: string;
  open: boolean;
  onClose: () => void;
  onOpenAnalyticsSettings: () => void;
  sections: LocalizedSection[];
  onNavigate: NavigateToSection;
};

export function SiteMenu({
  analyticsSettingsLabel,
  navigationLabel,
  open,
  onClose,
  onOpenAnalyticsSettings,
  sections,
  onNavigate,
}: SiteMenuProps) {
  return (
    <div
      id="site-menu"
      className={`menu-panel fixed inset-0 z-40 bg-[#171717]/96 text-white transition-all duration-500 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      inert={!open}
    >
      <nav
        aria-label={navigationLabel}
        className="absolute left-1/2 top-1/2 grid w-[min(560px,80vw)] grid-cols-2 gap-x-16 gap-y-6"
      >
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            tabIndex={open ? 0 : -1}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onClose();
              onNavigate(section.id, "menu");
            }}
            className="group flex cursor-pointer items-baseline gap-4 text-left"
          >
            <span className="text-xs font-semibold text-[#f3ca2f]">0{index + 1}</span>
            <span className="text-[clamp(22px,2.2vw,34px)] font-semibold uppercase transition-colors group-hover:text-[#f3ca2f]">
              {section.label}
            </span>
          </a>
        ))}
        <button
          aria-controls="analytics-consent-panel"
          aria-haspopup="dialog"
          className="menu-analytics-action group col-span-full mt-1 flex min-h-11 cursor-pointer items-center border-t border-white/20 pt-5 text-left text-[clamp(13px,1.1vw,16px)] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:text-[#f3ca2f] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f]"
          onClick={onOpenAnalyticsSettings}
          tabIndex={open ? 0 : -1}
          type="button"
        >
          {analyticsSettingsLabel}
        </button>
      </nav>
    </div>
  );
}
