import english from "@/locales/en.json";
import russian from "@/locales/ru.json";

export const sectionConfig = [
  { id: "introduce", railTop: 42 },
  { id: "about", railTop: 42.3 },
  { id: "works", railTop: 42.2 },
  { id: "services", railTop: 32.8 },
  { id: "resume", railTop: 25.3 },
  { id: "career", railTop: 50.5 },
  { id: "philosophy", railTop: 41.1 },
  { id: "contact", railTop: 32.6 },
] as const;

export type Locale = "en" | "ru";
export type SectionId = (typeof sectionConfig)[number]["id"];
export type NavigationSource = "brand" | "menu" | "stepper" | "keyboard";
export type NavigateToSection = (id: SectionId, source: NavigationSource) => void;
export type Dictionary = typeof english;
export type LocalizedSection = (typeof sectionConfig)[number] & { label: string };

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "cv-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ru";
}

export function isSectionId(value: string): value is SectionId {
  return sectionConfig.some((section) => section.id === value);
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: english,
  ru: russian,
};

export const socialLinks = [
  {
    id: "instagram",
    name: "Instagram",
    src: "/assets/instagram.svg",
    href: "https://www.instagram.com/fairyfromalfeya",
    className: "scale-[1.43] brightness-0 invert",
  },
  {
    id: "headhunter",
    name: "HeadHunter",
    src: "/assets/headhunter.svg",
    href: "https://spb.hh.ru/resume/979bcb91ff115435c40039ed1f564351517750",
    className: "",
  },
  {
    id: "telegram",
    name: "Telegram",
    src: "/assets/telegram.svg",
    href: "https://t.me/FairyFromAlfeya",
    className: "scale-[1.29] brightness-0 invert",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    src: "/assets/linkedin.svg",
    href: "https://www.linkedin.com/in/fairyfromalfeya",
    className: "",
  },
  {
    id: "vk",
    name: "VK",
    src: "/assets/vk.svg",
    href: "https://vk.ru/fairyfromalfeya",
    className: "scale-[1.43] brightness-0 invert",
  },
] as const;
