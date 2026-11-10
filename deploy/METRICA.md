# Yandex Metrica setup

Set the production counter ID in `/etc/fairyfromalfeya.env`:

```dotenv
YANDEX_METRICA_ID=12345678
```

Then restart `fairyfromalfeya.service`. The ID is public and is read by the
server at request time; the client bundle does not need to be rebuilt.

## Counter settings

- Site URL: `https://fairyfromalfeya.ru`
- Enable Webvisor, click map, link tracking, and accurate bounce tracking.
- Disable recording of all form fields.
- Disable storage of masked values.
- Enable IP masking.
- Do not enable automatic hash tracking. The application sends one virtual
  page view after each section actually becomes active.

The tag is not requested until a visitor accepts the analytics notice, and Web
Vitals reporting is mounted only after that choice. There is deliberately no
`noscript` tracking pixel. Every contact input is marked with
`ym-disable-keys`; the form is marked with both `ym-disable-submit` and
`ym-hide-content`, so its sensitive block is excluded from Webvisor.

The initial notice and the persistent **Analytics settings** control link to
`/privacy`. Visitors can accept, decline, or later revoke consent without a
reload. Revocation calls the Metrica `destruct` API and best-effort expires only
visible Metrica cookies whose names start with `_ym_` (plus `_yasc`) on the
current site. Do not add another unconditional Metrica script to the layout.

Yandex may change its cookie behavior and service-side data retention. Keep the
privacy page's high-level wording and official policy link current instead of
claiming a fixed retention period:

- English: <https://yandex.com/legal/confidential/>
- Russian: <https://yandex.ru/legal/confidential/>

## Goals

Create JavaScript-event goals with these exact identifiers:

| Goal | Meaning |
| --- | --- |
| `contact_form_started` | Visitor first interacted with the form |
| `contact_form_submitted` | A valid form was submitted |
| `contact_form_success` | Resend accepted the message |
| `contact_form_failed` | Validation/server/network/provider failure |
| `work_clicked` | A portfolio project was opened |
| `work_skills_reveal` | Tools overlay was revealed by pointer or keyboard |
| `social_link_clicked` | A header profile link was opened |
| `language_changed` | ENG/RUS was changed |
| `navigation_used` | Menu, stepper, brand, or keyboard navigation |
| `philosophy_quote_changed` | Quote carousel was changed |
| `client_diagnostic` | Capped, sanitized browser/runtime diagnostic |
| `web_vital` | CLS, LCP, INP, FCP, or TTFB measurement |

Additional low-volume events are `navigation_menu_opened`,
`navigation_menu_closed`, `contact_form_validation_error`, and
`contact_form_abandoned`.

## Reports and dashboard

1. Build the form funnel:
   `contact_form_started` → `contact_form_submitted` → `contact_form_success`.
2. Add goal widgets for project opens, social profile opens, language changes,
   failed form submissions, and client diagnostics.
3. Use the Pages report for virtual URLs such as `/#works`, `/#resume`, and
   `/#contact`; section scrolls replace the URL instead of creating history
   spam.
4. Group goal parameters by `work_id`, `profile`, `category`, `metric`,
   `rating`, `section_id`, `source`, and `locale`. No visitor-entered text is
   ever sent as a parameter.
5. Use Webvisor, click map, and link map for qualitative analysis. Yandex's
   scroll map is not supported for this SPA/manual-hit setup; the virtual
   section pageviews are the reliable scroll-depth signal.
