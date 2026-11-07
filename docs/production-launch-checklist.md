# NOVA production launch checklist

The application can be built without optional third-party services, but the following production capabilities remain gated until their settings and content are supplied.

## Required external configuration

- **Email delivery:** configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in Vercel Production and Preview before enabling registration, email verification, password reset, or resend-verification flows.
- **Private file storage:** configure `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and, when required by the provider, `S3_ENDPOINT`. Keep the bucket private.
- **Canonical URL:** after confirming the public domain, set `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` to that exact HTTPS origin. Update social-provider callback URLs to match it.
- **AI chat:** `OPENAI_API_KEY` and `OPENAI_MODEL` are optional; the deterministic FAQ fallback remains available without them.

## Database safety

- Do not run `prisma db push`, `prisma migrate deploy`, `prisma migrate dev`, or `db:seed` until the production schema baseline has been inspected and a backup/restore path is confirmed.
- The repository currently has no committed Prisma migration history. Establish a baseline from the actual production schema before introducing migrations.
- No production schema changes or seeds were performed as part of this audit.

## Release and content

- Confirm the business name, contact details, and final domain.
- Publish only approved service descriptions, package prices, FAQ answers, and real portfolio work. Do not replace empty sections with invented client projects or pricing.
- Confirm a super-admin can sign in before removing one-time `INITIAL_ADMIN_*` bootstrap variables.
- Review public API traffic and stage generous Vercel Firewall rate limits in log-only mode first. Review matched requests before enforcing a block or throttle.
- Require the repository CI check on the production branch and protect direct pushes before the first public release.
- Test registration, verification, password reset, contact inbox, chat, portal, admin, and private file uploads against a working Preview deployment before production promotion.
- **Dependency lockfile:** `package-lock.json` is now committed. GitHub Actions runs `npm ci` against it, and the lockfile is versioned with the project.
