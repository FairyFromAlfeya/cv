import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { YandexMetrica } from "@/components/analytics/YandexMetricaClient";
import { dictionaries } from "@/components/cv/config";
import { getRequestLocale } from "@/components/cv/lib/getRequestLocale";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

let didWarnAboutMetricaConfiguration = false;

function resolveMetricaCounterId(): number | null {
  const value = process.env.YANDEX_METRICA_ID?.trim();
  if (!value || !/^\d+$/.test(value)) {
    if (process.env.NODE_ENV === "production" && !didWarnAboutMetricaConfiguration) {
      console.warn("Yandex Metrica is disabled: YANDEX_METRICA_ID is missing or invalid.");
      didWarnAboutMetricaConfiguration = true;
    }
    return null;
  }

  const counterId = Number(value);
  if (Number.isSafeInteger(counterId) && counterId > 0) return counterId;

  if (process.env.NODE_ENV === "production" && !didWarnAboutMetricaConfiguration) {
    console.warn("Yandex Metrica is disabled: YANDEX_METRICA_ID is outside the supported range.");
    didWarnAboutMetricaConfiguration = true;
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = dictionaries[locale];
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const yandexVerification = process.env.YANDEX_SITE_VERIFICATION?.trim();

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: dictionary.meta.title,
      template: `%s | ${dictionary.brand.name}`,
    },
    description: dictionary.meta.description,
    applicationName: dictionary.brand.name,
    authors: [{ name: dictionary.brand.name, url: "/" }],
    creator: dictionary.brand.name,
    publisher: dictionary.brand.name,
    category: "technology",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: googleVerification || yandexVerification
      ? {
          google: googleVerification || undefined,
          yandex: yandexVerification || undefined,
        }
      : undefined,
  };
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#272727",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const counterId = resolveMetricaCounterId();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      data-analytics-available={counterId == null ? "false" : "true"}
    >
      <body>
        <YandexMetrica
          counterId={counterId}
          initialLocale={locale}
          copies={{
            en: dictionaries.en.analytics,
            ru: dictionaries.ru.analytics,
          }}
        />
        {children}
      </body>
    </html>
  );
}
