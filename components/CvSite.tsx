import { CvSiteContainer } from "@/components/cv/containers/CvSiteContainer";
import type { Locale } from "@/components/cv/config";

export function CvSite({ initialLocale }: { initialLocale: Locale }) {
  return <CvSiteContainer initialLocale={initialLocale} />;
}
