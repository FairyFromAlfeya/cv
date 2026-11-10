import type { RefObject } from "react";
import { socialLinks, type Dictionary, type NavigateToSection } from "@/components/cv/config";

type SiteHeaderProps = {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: NavigateToSection;
  onSocialClick: (profile: (typeof socialLinks)[number]["id"]) => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  dictionary: Dictionary;
};

export function SiteHeader({
  menuOpen,
  onToggleMenu,
  onNavigate,
  onSocialClick,
  menuButtonRef,
  dictionary,
}: SiteHeaderProps) {
  return (
    <header className="site-header fixed inset-x-[2.8vw] top-0 z-50 h-[10vh] text-white">
      <button
        className="brand absolute left-[0.56%] top-1/2 flex min-h-11 -translate-y-1/2 cursor-pointer items-center gap-2.5 text-left text-white drop-shadow-[0_1px_5px_rgba(0,0,0,.28)] transition-opacity hover:opacity-75 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f]"
        onClick={() => onNavigate("introduce", "brand")}
        aria-label={dictionary.navigation.goToIntroduction}
      >
        <img
          className="brand-mark size-[clamp(36px,3vw,42px)] shrink-0"
          src="/assets/fairy-wings-logo.svg"
          alt=""
          width="48"
          height="48"
          aria-hidden="true"
        />
        <span className="flex flex-col">
          <span className="brand-name text-[clamp(18px,1.4vw,21px)] font-semibold leading-none tracking-[-0.02em]">
            {dictionary.brand.name}
          </span>
          <span className="brand-role mt-1 text-[clamp(8px,.62vw,10px)] font-medium leading-none tracking-[0.08em] text-white/80">
            {dictionary.brand.role}
          </span>
        </span>
      </button>

      <nav className="social-links absolute left-[25.42%] top-1/2 flex -translate-y-1/2 items-center gap-[clamp(24px,2.6vw,39px)]">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.name}
            onClick={() => onSocialClick(social.id)}
            className="-m-[5px] flex size-6 items-center justify-center opacity-90 transition-opacity hover:opacity-60"
          >
            <img
              src={social.src}
              alt=""
              width="14"
              height="14"
              className={social.className || undefined}
            />
          </a>
        ))}
      </nav>

      <button
        ref={menuButtonRef}
        type="button"
        className="menu-toggle absolute right-[0.56%] top-1/2 -translate-y-1/2 cursor-pointer p-0 transition-opacity hover:opacity-70 focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f]"
        onClick={onToggleMenu}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        aria-label={menuOpen ? dictionary.navigation.closeMenu : dictionary.navigation.openMenu}
      >
        <span className="menu-toggle-icon" aria-hidden="true">
          <span className="menu-toggle-bar menu-toggle-bar-top" />
          <span className="menu-toggle-bar menu-toggle-bar-middle" />
          <span className="menu-toggle-bar menu-toggle-bar-bottom" />
        </span>
      </button>
    </header>
  );
}
