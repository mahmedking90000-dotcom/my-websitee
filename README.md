# NOVA Digital Agency

A responsive Arabic/English digital agency website built with Next.js, TypeScript, Tailwind CSS, and Lucide icons.

## Current scope

- Responsive public landing page
- Arabic RTL and English LTR language switch
- Dark/light appearance switch
- Services, concept portfolio, process, and package sections
- WhatsApp contact links
- Metadata, robots rules, and a custom 404 page
- Initial PostgreSQL data model for users, projects, client files, messages, invoices, services, portfolio, notifications, roles, and audit logs
- GitHub Actions build workflow

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Important project notes

- NOVA is a temporary brand name and should be confirmed before launch.
- Portfolio entries are illustrative concepts, not completed client projects.
- Package prices are not invented; final quotes must be approved and managed through the future admin system.
- WhatsApp contact is configured to the business number supplied in the project brief.
- Authentication, database, client portal, project-request workflow, admin dashboard, email, file storage, and chatbot are not connected yet. They require backend services, credentials, and security configuration before production use.
- Set the production domain and environment variables before launch.


## Platform foundation in progress

The `feature/complete-platform` branch contains the authentication foundation, email verification flow, customer portal, six-stage project request wizard, protected admin overview, customer/project listings, project status API, contact endpoint, and FAQ-based assistant endpoint.

## Required external configuration before acceptance

- Managed PostgreSQL: set `DATABASE_URL` and apply the Prisma schema.
- Auth: set a unique `AUTH_SECRET` and `AUTH_URL`.
- Email: configure SMTP before enabling registration and password recovery.
- OAuth: configure provider credentials if social sign-in is required.
- AI assistant: configure `OPENAI_API_KEY` and `OPENAI_MODEL`; otherwise only the deterministic FAQ assistant is active.
- File uploads: configure private object storage before enabling attachments.
- Create the first administrator using environment variables and `npm run admin:create`. Never commit those values.

This branch is not approved for production. The remaining admin content/settings management, file storage, payment provider, email templates, complete messaging/support workflows, automated tests, accessibility review, and production secrets/database setup must be completed and verified before release.
