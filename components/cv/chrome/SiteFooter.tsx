import Link from "next/link";
import type { Dictionary, Locale } from "@/components/cv/config";

type SiteFooterProps = {
  copy: Dictionary["footer"];
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  showPrivacyLink?: boolean;
};

export function SiteFooter({
  copy,
  locale,
  onLocaleChange,
  showPrivacyLink = true,
}: SiteFooterProps) {
  return (
    <footer className="site-footer fixed inset-x-[2.8vw] bottom-0 z-30 h-[10vh] text-[clamp(9px,.733vw,11px)] text-white">
      <div className="site-footer-meta absolute left-[0.56%] top-1/2 flex -translate-y-1/2 items-center gap-2.5 font-medium">
        <img src="/assets/copyright.svg" alt="" width="10" height="10" />
        <span className="site-footer-copyright whitespace-nowrap">{copy.copyright}</span>
        {showPrivacyLink ? (
          <>
            <span className="site-footer-privacy-separator text-white/40" aria-hidden="true">
              ·
            </span>
            <Link
              className="site-footer-privacy-link underline decoration-white/40 underline-offset-4 transition-colors hover:text-[#f3ca2f] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[#f3ca2f]"
              href="/privacy"
            >
              {copy.privacy}
            </Link>
          </>
        ) : null}
      </div>
      <div
        className="site-footer-language absolute right-[0.56%] top-1/2 flex -translate-y-1/2 items-center gap-[clamp(22px,2.4vw,36px)] font-bold"
        role="group"
        aria-label={copy.languageSwitcher}
      >
        <button
          type="button"
          onClick={() => onLocaleChange("en")}
          aria-label={copy.switchToEnglish}
          aria-pressed={locale === "en"}
          className={`cursor-pointer transition-colors hover:text-[#f3ca2f] focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f] ${
            locale === "en" ? "text-[#f3ca2f]" : "text-white"
          }`}
        >
          ENG
        </button>
        <button
          type="button"
          onClick={() => onLocaleChange("ru")}
          aria-label={copy.switchToRussian}
          aria-pressed={locale === "ru"}
          className={`cursor-pointer transition-colors hover:text-[#f3ca2f] focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f] ${
            locale === "ru" ? "text-[#f3ca2f]" : "text-white"
          }`}
        >
          RUS
        </button>
      </div>
    </footer>
  );
}
