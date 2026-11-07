import { prisma } from "@/lib/prisma";
import ContentManager from "@/components/admin-content-manager";
import { WorkspaceText } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

export default async function Content() {
  const [services, plans, portfolio] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.portfolioProject.findMany({ orderBy: { sortOrder: "asc" } })
  ]);
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold"><WorkspaceText ar="إدارة المحتوى" en="Content management"/></h1>
      <ContentManager services={services} plans={plans} portfolio={portfolio}/>
    </>
  );
}
