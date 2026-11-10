import type { Metadata } from "next";
import { CvSite } from "@/components/CvSite";
import { dictionaries, socialLinks, type Locale } from "@/components/cv/config";
import { getRequestLocale } from "@/components/cv/lib/getRequestLocale";
import { getSiteUrl } from "@/lib/site";

const profileSkills = [
  "Full-stack development",
  "Solidity",
  "TypeScript",
  "Node.js",
  "Next.js",
  "React",
  "Java",
  "Python",
  "Smart contracts",
  "DeFi",
  "Web3",
] as const;

function createProfileJsonLd(locale: Locale) {
  const siteUrl = getSiteUrl();
  const site = siteUrl.toString();
  const dictionary = dictionaries[locale];
  const websiteId = `${site}#website`;
  const profileId = `${site}#profile`;
  const personId = `${site}#person`;
  const portfolioId = `${site}#portfolio`;
  const projects = dictionary.works.items.filter((work) => Boolean(work.href));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: site,
        name: "Alexander CV",
        alternateName: dictionary.brand.name,
        description: dictionary.meta.description,
        inLanguage: ["en", "ru"],
      },
      {
        "@type": "ProfilePage",
        "@id": profileId,
        url: site,
        name: dictionary.meta.title,
        description: dictionary.meta.description,
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
        hasPart: { "@id": portfolioId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: dictionary.brand.name,
        url: site,
        jobTitle: locale === "ru"
          ? "Full-stack и Solidity-разработчик"
          : "Full-Stack and Solidity Developer",
        description: dictionary.meta.description,
        knowsAbout: profileSkills,
        sameAs: [
          ...socialLinks.map((profile) => profile.href),
          "https://github.com/FairyFromAlfeya",
        ],
        mainEntityOfPage: { "@id": profileId },
      },
      {
        "@type": "ItemList",
        "@id": portfolioId,
        name: locale === "ru" ? "Избранные проекты" : "Selected projects",
        numberOfItems: projects.length,
        itemListElement: projects.map((work, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: work.title,
            description: work.category,
            url: work.href,
            keywords: work.skills,
          },
        })),
      },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const dictionary = dictionaries[locale];
  const socialImageAlt = locale === "ru"
    ? "Александр — Full-Stack и Solidity-разработчик"
    : "Alexander — Full-Stack and Solidity Developer";

  return {
    title: { absolute: dictionary.meta.title },
    description: dictionary.meta.description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: "/",
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      siteName: dictionary.brand.name,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      alternateLocale: locale === "ru" ? ["en_US"] : ["ru_RU"],
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      images: [{ url: "/twitter-image", alt: socialImageAlt }],
    },
  };
}

export default async function Home() {
  const locale = await getRequestLocale();
  const jsonLd = createProfileJsonLd(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CvSite initialLocale={locale} />
    </>
  );
}
