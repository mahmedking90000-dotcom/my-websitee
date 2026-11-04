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
