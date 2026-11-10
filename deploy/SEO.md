# SEO rollout checklist

## Required production environment

Set these values before `npm run build` and for the running Next.js service:

```dotenv
SITE_URL=https://fairyfromalfeya.ru
```

`SITE_URL` is used by canonical links, Open Graph metadata, JSON-LD, `robots.txt`, and `sitemap.xml`. A production build now fails if the value is missing or uses a non-HTTPS public origin.

Optional public ownership tokens:

```dotenv
GOOGLE_SITE_VERIFICATION=
YANDEX_SITE_VERIFICATION=
```

After adding or changing a verification token, rebuild and restart the application.

## After deployment

1. Confirm these URLs return `200 OK` over HTTPS:
   - `https://fairyfromalfeya.ru/robots.txt`
   - `https://fairyfromalfeya.ru/sitemap.xml`
   - `https://fairyfromalfeya.ru/manifest.webmanifest`
   - `https://fairyfromalfeya.ru/llms.txt`
2. Add the domain to Google Search Console and Yandex Webmaster.
3. Submit `https://fairyfromalfeya.ru/sitemap.xml` in both webmaster tools.
4. Inspect the home page and request indexing after the first deployment.
5. Validate the home page with Google Rich Results Test and Schema.org Validator.
6. Run PageSpeed Insights for mobile and desktop and monitor Core Web Vitals in Search Console and Yandex Metrica.

The English and Russian variants currently share one cookie-selected canonical URL. Do not add fake `hreflang` links. Proper bilingual indexing requires stable `/en` and `/ru` routes, matching canonical URLs, reciprocal `hreflang` values, and localized sitemap entries.

`llms.txt` is maintained for AI agents that choose to use the community proposal. Google does not use it as a ranking signal, so foundational SEO remains the priority.
