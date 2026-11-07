import { prisma } from "@/lib/prisma";
import SettingsManager from "@/components/admin-settings-manager";
import { WorkspaceText } from "@/components/workspace-preferences";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const items = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold"><WorkspaceText ar="إعدادات الموقع" en="Website settings"/></h1>
      <SettingsManager initial={items.map(item => ({ key: item.key, value: item.value }))}/>
    </>
  );
}
