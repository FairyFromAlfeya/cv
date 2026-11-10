import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyAnalytics } from "@/components/analytics/PrivacyAnalytics";
import { PrivacyFooter } from "@/components/privacy/PrivacyFooter";
import { dictionaries } from "@/components/cv/config";
import { getRequestLocale } from "@/components/cv/lib/getRequestLocale";

const privacyCopy = {
  en: {
    metadataTitle: "Privacy and analytics | Alexander's CV",
    metadataDescription: "How this CV website uses optional Yandex Metrica analytics and protects contact form data.",
    back: "Back to the CV",
    eyebrow: "Privacy",
    title: "Privacy and analytics",
    intro: "This page explains what happens when you choose to enable analytics on this CV website.",
    serviceTitle: "Analytics service",
    serviceBody: "With your consent, the website uses Yandex Metrica and Webvisor to understand how visitors move through the CV, which links and projects they use, and where the experience may need improvement.",
    dataTitle: "Data categories",
    dataItems: [
      "Viewed pages and CV sections, clicks, scrolling, navigation source, and interaction categories.",
      "Browser, device, approximate location, referrer, and other technical request information made available to the analytics service.",
      "Performance measurements and limited, categorized diagnostics that do not include error messages, stack traces, or form values.",
    ],
    purposeTitle: "Purpose",
    purposeBody: "The information is used to understand aggregate usage, improve navigation and content, measure project and contact-form funnels, and identify technical or performance problems.",
    formTitle: "Contact form",
    formBody: "Contact form fields are excluded from Webvisor and key/submit recording. Names, email addresses, subjects, messages, and other text entered into the form are not sent to Yandex Metrica as analytics parameters.",
    cookiesTitle: "Cookies and retention",
    cookiesBody: "After consent, Yandex Metrica may set analytics cookies, including cookies whose names begin with _ym_. Analytics data is stored and retained according to the counter settings and Yandex service rules, which may change over time. See the official Yandex privacy policy for current details.",
    yandexPolicy: "Yandex privacy policy",
    consentTitle: "Your choice",
    consentBody: "Analytics is optional. The analytics script is not requested before you accept. You can reopen “Analytics settings” from the CV navigation menu at any time. Turning analytics off stops collection for this visit and removes accessible Yandex Metrica cookies scoped to this website.",
    contactTitle: "Contact",
    contactBody: "For privacy questions about this website, email",
  },
  ru: {
    metadataTitle: "Приватность и аналитика | CV Александра",
    metadataDescription: "Как сайт-визитка использует добровольную аналитику Яндекс Метрики и защищает данные контактной формы.",
    back: "Вернуться к CV",
    eyebrow: "Приватность",
    title: "Приватность и аналитика",
    intro: "Здесь описано, что происходит, когда вы разрешаете аналитику на этом сайте-визитке.",
    serviceTitle: "Сервис аналитики",
    serviceBody: "С вашего согласия сайт использует Яндекс Метрику и Вебвизор, чтобы понимать, как посетители перемещаются по CV, какие ссылки и проекты открывают и где интерфейс стоит улучшить.",
    dataTitle: "Категории данных",
    dataItems: [
      "Просмотренные страницы и разделы CV, клики, прокрутка, источник перехода и категории взаимодействий.",
      "Браузер, устройство, примерное местоположение, источник перехода и другие технические сведения запроса, доступные сервису аналитики.",
      "Показатели производительности и ограниченные категориальные сведения о сбоях без текстов ошибок, стеков вызовов и значений формы.",
    ],
    purposeTitle: "Цель обработки",
    purposeBody: "Информация нужна, чтобы оценивать использование сайта в целом, улучшать навигацию и контент, анализировать воронки проектов и контактной формы, находить технические проблемы и проблемы производительности.",
    formTitle: "Контактная форма",
    formBody: "Поля контактной формы исключены из записи Вебвизора, нажатий клавиш и отправки формы. Имена, email-адреса, темы, сообщения и другой введённый текст не передаются в Яндекс Метрику как параметры аналитики.",
    cookiesTitle: "Cookie и срок хранения",
    cookiesBody: "После согласия Яндекс Метрика может установить аналитические cookie, включая cookie с именами, начинающимися на _ym_. Данные аналитики хранятся в соответствии с настройками счётчика и правилами сервисов Яндекса, которые могут меняться. Актуальные подробности приведены в официальной политике конфиденциальности Яндекса.",
    yandexPolicy: "Политика конфиденциальности Яндекса",
    consentTitle: "Ваш выбор",
    consentBody: "Аналитика добровольна. До согласия сайт не запрашивает скрипт аналитики. В навигационном меню CV можно в любое время открыть «Настройки аналитики». Отключение останавливает сбор в текущем сеансе и удаляет доступные cookie Яндекс Метрики, относящиеся к этому сайту.",
    contactTitle: "Связаться",
    contactBody: "По вопросам приватности на этом сайте напишите на",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = privacyCopy[locale];
  const socialImageAlt = locale === "ru"
    ? "Александр — Full-Stack и Solidity-разработчик"
    : "Alexander — Full-Stack and Solidity Developer";

  return {
    title: { absolute: copy.metadataTitle },
    description: copy.metadataDescription,
    alternates: {
      canonical: "/privacy",
    },
    openGraph: {
      type: "website",
      url: "/privacy",
      title: copy.metadataTitle,
      description: copy.metadataDescription,
      siteName: "Alexander CV",
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
      title: copy.metadataTitle,
      description: copy.metadataDescription,
      images: [{ url: "/twitter-image", alt: socialImageAlt }],
    },
  };
}

export default async function PrivacyPage() {
  const locale = await getRequestLocale();
  const copy = privacyCopy[locale];

  return (
    <main className="min-h-svh bg-[#202020] px-6 py-12 text-white sm:px-10 lg:px-20 lg:py-20">
      <PrivacyAnalytics
        description={copy.metadataDescription}
        locale={locale}
        title={copy.metadataTitle}
      />
      <article className="mx-auto max-w-4xl pb-32">
        <Link
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[#f3ca2f] underline decoration-[#f3ca2f]/50 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f]"
          href="/"
        >
          ← {copy.back}
        </Link>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-[#f3ca2f]">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
          {copy.intro}
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-white">{copy.serviceTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">{copy.serviceBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">{copy.dataTitle}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-white/75">
              {copy.dataItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">{copy.purposeTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">{copy.purposeBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">{copy.formTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">{copy.formBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">{copy.cookiesTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">{copy.cookiesBody}</p>
            <a
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-[#f3ca2f] underline decoration-[#f3ca2f]/50 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f]"
              href={locale === "ru" ? "https://yandex.ru/legal/confidential/" : "https://yandex.com/legal/confidential/"}
              rel="noreferrer"
              target="_blank"
            >
              {copy.yandexPolicy}
            </a>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">{copy.consentTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">{copy.consentBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">{copy.contactTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">
              {copy.contactBody}{" "}
              <a
                className="font-semibold text-[#f3ca2f] underline decoration-[#f3ca2f]/50 underline-offset-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[#f3ca2f]"
                href="mailto:fairyfromalfeya@gmail.com"
              >
                fairyfromalfeya@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
      <PrivacyFooter
        key={locale}
        initialLocale={locale}
        copies={{
          en: dictionaries.en.footer,
          ru: dictionaries.ru.footer,
        }}
      />
    </main>
  );
}
