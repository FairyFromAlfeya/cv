"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ANALYTICS_ENABLED_EVENT,
  requestAnalyticsSettings,
  trackGoal,
  trackSectionHit,
} from "@/components/analytics/yandexMetrica";
import { PageChrome } from "@/components/cv/chrome/PageChrome";
import { SiteHeader } from "@/components/cv/chrome/SiteHeader";
import { SiteMenu } from "@/components/cv/chrome/SiteMenu";
import {
  dictionaries,
  isSectionId,
  LOCALE_COOKIE,
  sectionConfig,
  socialLinks,
  type Locale,
  type NavigationSource,
  type SectionId,
} from "@/components/cv/config";
import { scrollToSection } from "@/components/cv/lib/scrollToSection";
import { AboutSection } from "@/components/cv/sections/AboutSection";
import { CareerSection } from "@/components/cv/sections/CareerSection";
import { ContactSection } from "@/components/cv/sections/ContactSection";
import { IntroduceSection } from "@/components/cv/sections/IntroduceSection";
import { ResumeSection } from "@/components/cv/sections/ResumeSection";
import { ServicesSection } from "@/components/cv/sections/ServicesSection";
import { TestimonialsSection } from "@/components/cv/sections/TestimonialsSection";
import { WorksSection } from "@/components/cv/sections/WorksSection";
import type { ContactFormStatus } from "@/components/cv/types";

type SectionViewSource = NavigationSource | "initial" | "deep_link" | "history" | "wheel" | "touch" | "scroll" | "consent";

const quoteIds = ["basho_old_pond", "pasha_technik"] as const;

function isExplicitNavigationSource(source: SectionViewSource): source is NavigationSource {
  return source === "brand" || source === "menu" || source === "stepper" || source === "keyboard";
}

function getDirection(fromIndex: number, toIndex: number): "up" | "down" | "same" {
  if (toIndex > fromIndex) return "down";
  if (toIndex < fromIndex) return "up";
  return "same";
}

function getDurationBucket(startedAt: number): string {
  const elapsed = Math.max(0, performance.now() - startedAt);
  if (elapsed < 5_000) return "under_5s";
  if (elapsed < 15_000) return "5_to_15s";
  if (elapsed < 60_000) return "15_to_60s";
  return "over_60s";
}

function getContactErrorCategory(status: number): string {
  if (status === 400) return "invalid_request";
  if (status === 403) return "origin_rejected";
  if (status === 413) return "payload_too_large";
  if (status === 415) return "unsupported_media";
  if (status === 429) return "rate_limited";
  if (status === 502) return "mail_provider";
  if (status === 503) return "server_config";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "unknown";
}

function getSectionIdFromHash(hash: string): SectionId | null {
  try {
    const hashId = decodeURIComponent(hash.slice(1));
    if (hashId === "testimonials") return "philosophy";
    return isSectionId(hashId) ? hashId : null;
  } catch {
    return null;
  }
}

export function CvSiteContainer({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [contactFormStatus, setContactFormStatus] = useState<ContactFormStatus>("idle");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeIndexRef = useRef(0);
  const pendingSectionRef = useRef<SectionId | null>(null);
  const pendingSourceRef = useRef<SectionViewSource>("initial");
  const lastScrollSourceRef = useRef<SectionViewSource>("scroll");
  const lastTrackedSectionRef = useRef<SectionId | null>(null);
  const initialHashHandledRef = useRef(false);
  const localeRef = useRef(locale);
  const contactSubmittingRef = useRef(false);
  const contactStartedRef = useRef(false);
  const contactCompletedRef = useRef(false);
  const contactStartedAtRef = useRef(0);
  const testimonialIndexRef = useRef(testimonialIndex);
  const contactSubmissionRef = useRef<{ fingerprint: string; id: string } | null>(null);
  const dictionary = dictionaries[locale];
  const sections = useMemo(
    () =>
      sectionConfig.map((section) => ({
        ...section,
        label: dictionary.navigation.sections[section.id],
      })),
    [dictionary],
  );
  const testimonial = dictionary.testimonials.items[testimonialIndex] ?? dictionary.testimonials.items[0];

  const replaceSectionHash = useCallback((id: SectionId) => {
    const nextHash = `#${encodeURIComponent(id)}`;
    if (window.location.hash === nextHash) return;

    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, []);

  const clearPendingSection = useCallback(() => {
    pendingSectionRef.current = null;
  }, []);

  const navigateToSection = useCallback((
    id: SectionId,
    historyMode: "push" | "none" = "push",
    source: SectionViewSource = "history",
  ) => {
    const targetIndex = sectionConfig.findIndex((section) => section.id === id);
    const fromIndex = activeIndexRef.current;
    const fromSectionId = sectionConfig[fromIndex]?.id ?? sectionConfig[0].id;
    pendingSectionRef.current = activeIndexRef.current === targetIndex ? null : id;
    pendingSourceRef.current = source;

    if (isExplicitNavigationSource(source) && fromSectionId !== id) {
      trackGoal("navigation_used", {
        from_section_id: fromSectionId,
        to_section_id: id,
        direction: getDirection(fromIndex, targetIndex),
        source,
        locale: localeRef.current,
      });
    }

    if (historyMode === "push") {
      const nextHash = `#${encodeURIComponent(id)}`;
      if (window.location.hash !== nextHash) {
        const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
        window.history.pushState(window.history.state, "", nextUrl);
      }
    }

    scrollToSection(id);
  }, []);

  const handleNavigation = useCallback((id: SectionId, source: NavigationSource) => {
    navigateToSection(id, "push", source);
  }, [navigateToSection]);

  useEffect(() => {
    localeRef.current = locale;
    testimonialIndexRef.current = testimonialIndex;
  }, [locale, testimonialIndex]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dictionary.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", dictionary.meta.description);
  }, [dictionary.meta.description, dictionary.meta.title, locale]);

  useEffect(() => {
    const scrollToHash = (source: SectionViewSource) => {
      const id = getSectionIdFromHash(window.location.hash) ?? "introduce";
      if (window.location.hash === "#testimonials") replaceSectionHash(id);

      navigateToSection(id, "none", source);
    };

    let animationFrame = 0;
    const scheduleScrollToHash = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);

      const hasValidHash = Boolean(getSectionIdFromHash(window.location.hash));
      const source: SectionViewSource = initialHashHandledRef.current
        ? "history"
        : hasValidHash
          ? "deep_link"
          : "initial";
      const targetId = getSectionIdFromHash(window.location.hash) ?? "introduce";
      const targetIndex = sectionConfig.findIndex((section) => section.id === targetId);
      pendingSectionRef.current = activeIndexRef.current === targetIndex ? null : targetId;
      pendingSourceRef.current = source;
      lastScrollSourceRef.current = source;
      initialHashHandledRef.current = true;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        scrollToHash(source);
      });
    };

    scheduleScrollToHash();
    window.addEventListener("hashchange", scheduleScrollToHash);
    window.addEventListener("popstate", scheduleScrollToHash);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener("hashchange", scheduleScrollToHash);
      window.removeEventListener("popstate", scheduleScrollToHash);
    };
  }, [navigateToSection, replaceSectionHash]);

  useEffect(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-cv-anchor]"));
    const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-cv-section]"));
    const wipeMedia = window.matchMedia(
      "(min-width: 768px) and (min-height: 601px) and (prefers-reduced-motion: no-preference)",
    );
    let animationFrame = 0;

    const updateActiveSection = () => {
      animationFrame = 0;
      let nextIndex = 0;

      anchors.forEach((anchor, index) => {
        if (anchor.getBoundingClientRect().top <= window.innerHeight / 2) nextIndex = index;
      });

      panels.forEach((panel, index) => {
        const nextAnchor = anchors[index + 1];
        panel.inert = wipeMedia.matches && Boolean(nextAnchor && nextAnchor.getBoundingClientRect().top <= 0);
      });

      activeIndexRef.current = nextIndex;
      const activeSectionId = sectionConfig[nextIndex]?.id ?? sectionConfig[0].id;
      const pendingSection = pendingSectionRef.current;
      if (!pendingSection || pendingSection === activeSectionId) {
        const previousSectionId = lastTrackedSectionRef.current;
        if (previousSectionId !== activeSectionId) {
          const previousIndex = previousSectionId
            ? sectionConfig.findIndex((section) => section.id === previousSectionId)
            : nextIndex;
          const source = pendingSection === activeSectionId
            ? pendingSourceRef.current
            : lastScrollSourceRef.current;
          const currentDictionary = dictionaries[localeRef.current];

          const sent = trackSectionHit(activeSectionId, {
            locale: localeRef.current,
            previousSectionId: previousSectionId ?? undefined,
            title: `${currentDictionary.meta.title} — ${currentDictionary.navigation.sections[activeSectionId]}`,
            params: {
              section_index: nextIndex + 1,
              direction: previousSectionId ? getDirection(previousIndex, nextIndex) : "initial",
              source,
              quote_id: activeSectionId === "philosophy"
                ? quoteIds[testimonialIndexRef.current] ?? quoteIds[0]
                : undefined,
            },
          });
          if (sent) {
            lastTrackedSectionRef.current = activeSectionId;
            lastScrollSourceRef.current = "scroll";
          }
        }

        clearPendingSection();
        replaceSectionHash(activeSectionId);
      }

      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateActiveSection);
    };

    const cancelPendingNavigation = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        const navigationKeys = ["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"];
        const target = event.target as HTMLElement | null;
        if (
          !navigationKeys.includes(event.key)
          || target?.matches("input, textarea, select, [contenteditable='true']")
        ) return;

        lastScrollSourceRef.current = "keyboard";
      } else if (event instanceof WheelEvent) lastScrollSourceRef.current = "wheel";
      else if (event instanceof TouchEvent) lastScrollSourceRef.current = "touch";

      if (!pendingSectionRef.current) return;

      clearPendingSection();
      scheduleUpdate();
    };

    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("wheel", cancelPendingNavigation, { passive: true });
    window.addEventListener("touchstart", cancelPendingNavigation, { passive: true });
    window.addEventListener("keydown", cancelPendingNavigation);
    wipeMedia.addEventListener("change", scheduleUpdate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      panels.forEach((panel) => {
        panel.inert = false;
      });
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("wheel", cancelPendingNavigation);
      window.removeEventListener("touchstart", cancelPendingNavigation);
      window.removeEventListener("keydown", cancelPendingNavigation);
      wipeMedia.removeEventListener("change", scheduleUpdate);
    };
  }, [clearPendingSection, replaceSectionHash]);

  useEffect(() => {
    let animationFrame = 0;

    const trackCurrentSectionAfterConsent = (event: Event) => {
      lastTrackedSectionRef.current = null;
      if (animationFrame) cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;

        // A deep link or explicit navigation already owns the next settled
        // hit. Leaving the ref empty makes that target the first tracked view.
        if (pendingSectionRef.current) return;

        const index = activeIndexRef.current;
        const sectionId = sectionConfig[index]?.id ?? sectionConfig[0].id;
        const currentDictionary = dictionaries[localeRef.current];

        const source = event instanceof CustomEvent
          && event.detail?.source === "saved_consent"
          ? lastScrollSourceRef.current
          : "consent";

        const sent = trackSectionHit(sectionId, {
          locale: localeRef.current,
          title: `${currentDictionary.meta.title} — ${currentDictionary.navigation.sections[sectionId]}`,
          params: {
            section_index: index + 1,
            direction: "initial",
            source,
            quote_id: sectionId === "philosophy"
              ? quoteIds[testimonialIndexRef.current] ?? quoteIds[0]
              : undefined,
          },
        });
        if (sent) lastTrackedSectionRef.current = sectionId;
      });
    };

    window.addEventListener(ANALYTICS_ENABLED_EVENT, trackCurrentSectionAfterConsent);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener(ANALYTICS_ENABLED_EVENT, trackCurrentSectionAfterConsent);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        trackGoal("navigation_menu_closed", {
          trigger: "escape",
          section_id: sectionConfig[activeIndexRef.current]?.id ?? sectionConfig[0].id,
          locale: localeRef.current,
        });
        menuButtonRef.current?.focus({ preventScroll: true });
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onSectionKeyDown = (event: KeyboardEvent) => {
      if (menuOpen || event.altKey || event.ctrlKey || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      let nextIndex = activeIndex;
      if (event.key === "PageDown" || event.key === "ArrowDown") nextIndex += 1;
      else if (event.key === "PageUp" || event.key === "ArrowUp") nextIndex -= 1;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = sectionConfig.length - 1;
      else return;

      nextIndex = Math.max(0, Math.min(sectionConfig.length - 1, nextIndex));
      if (nextIndex === activeIndex) return;

      event.preventDefault();
      navigateToSection(sectionConfig[nextIndex].id, "push", "keyboard");
    };

    window.addEventListener("keydown", onSectionKeyDown);
    return () => window.removeEventListener("keydown", onSectionKeyDown);
  }, [activeIndex, menuOpen, navigateToSection]);

  useEffect(() => {
    const onPageHide = () => {
      if (!contactStartedRef.current || contactCompletedRef.current) return;

      trackGoal("contact_form_abandoned", {
        locale: localeRef.current,
        duration_bucket: getDurationBucket(contactStartedAtRef.current),
      });
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    trackGoal("language_changed", {
      from_locale: locale,
      to_locale: nextLocale,
      section_id: sectionConfig[activeIndexRef.current]?.id ?? sectionConfig[0].id,
      placement: "footer",
    });
    setLocale(nextLocale);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  }

  function cycleTestimonial(direction: -1 | 1) {
    const testimonialCount = dictionary.testimonials.items.length;
    const nextIndex = (testimonialIndex + direction + testimonialCount) % testimonialCount;

    trackGoal("philosophy_quote_changed", {
      from_quote_id: quoteIds[testimonialIndex] ?? quoteIds[0],
      to_quote_id: quoteIds[nextIndex] ?? quoteIds[0],
      direction: direction === 1 ? "next" : "previous",
      locale,
    });
    setTestimonialIndex(nextIndex);
  }

  function startContactForm() {
    if (contactStartedRef.current) return;

    contactStartedRef.current = true;
    contactCompletedRef.current = false;
    contactStartedAtRef.current = performance.now();
    trackGoal("contact_form_started", { locale: localeRef.current });
  }

  function trackContactValidation(event: FormEvent<HTMLFormElement>) {
    startContactForm();

    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (!(["name", "email", "message"] as const).includes(target.name as "name" | "email" | "message")) {
      return;
    }

    const reason = target.validity.valueMissing
      ? "required"
      : target.validity.typeMismatch
        ? "type"
        : target.validity.tooShort
          ? "too_short"
          : target.validity.tooLong
            ? "too_long"
            : "invalid";

    trackGoal("contact_form_validation_error", {
      field: target.name,
      reason,
      locale: localeRef.current,
    });
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactSubmittingRef.current) return;

    startContactForm();
    trackGoal("contact_form_submitted", {
      locale: localeRef.current,
      duration_bucket: getDurationBucket(contactStartedAtRef.current),
    });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const formValues = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };
    const fingerprint = JSON.stringify(formValues);
    const submissionId =
      contactSubmissionRef.current?.fingerprint === fingerprint
        ? contactSubmissionRef.current.id
        : crypto.randomUUID();

    contactSubmittingRef.current = true;
    contactSubmissionRef.current = { fingerprint, id: submissionId };
    setContactFormStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12_000),
        body: JSON.stringify({
          ...formValues,
          submissionId,
        }),
      });

      if (!response.ok) {
        trackGoal("contact_form_failed", {
          category: getContactErrorCategory(response.status),
          http_status: response.status,
          locale: localeRef.current,
        });
        setContactFormStatus("error");
        return;
      }

      form.reset();
      contactSubmissionRef.current = null;
      contactCompletedRef.current = true;
      contactStartedRef.current = false;
      trackGoal("contact_form_success", {
        locale: localeRef.current,
        duration_bucket: getDurationBucket(contactStartedAtRef.current),
      });
      setContactFormStatus("success");
    } catch (error) {
      const category = error instanceof DOMException && error.name === "TimeoutError"
        ? "timeout"
        : "network";
      trackGoal("contact_form_failed", {
        category,
        locale: localeRef.current,
      });
      setContactFormStatus("error");
    } finally {
      contactSubmittingRef.current = false;
    }
  }

  function toggleMenu() {
    const nextOpen = !menuOpen;
    trackGoal(nextOpen ? "navigation_menu_opened" : "navigation_menu_closed", {
      trigger: "button",
      section_id: sectionConfig[activeIndexRef.current]?.id ?? sectionConfig[0].id,
      locale: localeRef.current,
    });
    if (!nextOpen) menuButtonRef.current?.focus({ preventScroll: true });
    setMenuOpen(nextOpen);
  }

  function closeMenu() {
    trackGoal("navigation_menu_closed", {
      trigger: "selection",
      section_id: sectionConfig[activeIndexRef.current]?.id ?? sectionConfig[0].id,
      locale: localeRef.current,
    });
    menuButtonRef.current?.focus({ preventScroll: true });
    setMenuOpen(false);
  }

  function openAnalyticsSettings() {
    trackGoal("navigation_menu_closed", {
      trigger: "analytics_settings",
      section_id: sectionConfig[activeIndexRef.current]?.id ?? sectionConfig[0].id,
      locale: localeRef.current,
    });
    const returnFocus = menuButtonRef.current;
    returnFocus?.focus({ preventScroll: true });
    setMenuOpen(false);
    requestAnimationFrame(() => requestAnalyticsSettings(returnFocus));
  }

  function trackSocialClick(profile: (typeof socialLinks)[number]["id"]) {
    trackGoal("social_link_clicked", {
      profile,
      placement: "header",
      section_id: sectionConfig[activeIndexRef.current]?.id ?? sectionConfig[0].id,
      locale: localeRef.current,
    });
  }

  function trackWorkReveal(workId: string, workIndex: number, trigger: "pointer" | "keyboard") {
    trackGoal("work_skills_reveal", {
      work_id: workId,
      work_index: workIndex + 1,
      trigger,
      locale: localeRef.current,
    });
  }

  function trackWorkOpen(workId: string, workIndex: number) {
    trackGoal("work_clicked", {
      work_id: workId,
      work_index: workIndex + 1,
      locale: localeRef.current,
    });
  }

  return (
    <main className="bg-[#272727] text-white">
      <SiteHeader
        menuOpen={menuOpen}
        onToggleMenu={toggleMenu}
        onNavigate={handleNavigation}
        onSocialClick={trackSocialClick}
        menuButtonRef={menuButtonRef}
        dictionary={dictionary}
      />
      <SiteMenu
        analyticsSettingsLabel={dictionary.analytics.settings}
        navigationLabel={dictionary.navigation.pageSections}
        open={menuOpen}
        onClose={closeMenu}
        onOpenAnalyticsSettings={openAnalyticsSettings}
        sections={sections}
        onNavigate={handleNavigation}
      />
      <div inert={menuOpen} aria-hidden={menuOpen}>
        <PageChrome
          activeIndex={activeIndex}
          sections={sections}
          locale={locale}
          onLocaleChange={changeLocale}
          onNavigate={handleNavigation}
          dictionary={dictionary}
        />
        <IntroduceSection copy={dictionary.hero} />
        <AboutSection copy={dictionary.about} />
        <WorksSection copy={dictionary.works} onReveal={trackWorkReveal} onOpen={trackWorkOpen} />
        <ServicesSection copy={dictionary.services} />
        <ResumeSection copy={dictionary.resume} />
        <CareerSection title={dictionary.navigation.sections.career} />
        <TestimonialsSection
          copy={dictionary.testimonials}
          testimonial={testimonial}
          compactTitle={testimonialIndex === 1}
          onPrevious={() => cycleTestimonial(-1)}
          onNext={() => cycleTestimonial(1)}
        />
        <ContactSection
          copy={dictionary.contact}
          status={contactFormStatus}
          onSubmit={submitForm}
          onStart={startContactForm}
          onInvalid={trackContactValidation}
        />
      </div>
    </main>
  );
}
