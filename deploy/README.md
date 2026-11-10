# Production deployment

The application runs as an unprivileged `fairyapp` systemd service on
`127.0.0.1:3000`. Nginx is the only public web entry point.

Files:

- `nginx-bootstrap.conf`: temporary HTTP configuration used before the first
  Let's Encrypt certificate is issued.
- `nginx.conf`: final HTTPS configuration with an HTTP-to-HTTPS redirect.
- `connection-upgrade.conf`: shared Nginx WebSocket upgrade mapping.
- `fairyfromalfeya.service`: hardened systemd unit for the Next.js server.
- `reload-nginx.sh`: Certbot deploy hook that reloads Nginx after renewal.
- `METRICA.md`: production counter, privacy, goals, and dashboard setup.

The server environment file is `/etc/fairyfromalfeya.env`, owned by root and
readable by the `fairyapp` group only. It must contain `SITE_URL`,
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `YANDEX_METRICA_ID`. The Metrica ID
is public (not a secret) and is read by the server at request time, so changing
it only requires restarting the application service; a new browser bundle is
not required.

The Metrica tag is loaded only after the visitor accepts analytics. In the
Metrica dashboard, keep Webvisor enabled, turn off recording of all form
fields, turn off storage of masked values, and enable IP masking. The contact
form is also marked with `ym-disable-keys` and `ym-disable-submit` in the HTML.

Before requesting the certificate, the public A record for
`fairyfromalfeya.ru` must resolve to `136.234.25.251`. Port 80 remains open for
HTTP redirects and ACME renewal challenges.
