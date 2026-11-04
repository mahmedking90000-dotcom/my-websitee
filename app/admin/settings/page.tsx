import {prisma} from "@/lib/prisma";import SettingsManager from "@/components/admin-settings-manager";
export const dynamic="force-dynamic";
export default async function Settings(){const items=await prisma.siteSetting.findMany({orderBy:{key:"asc"}});return <><h1 className="mb-6 text-3xl font-bold">إعدادات الموقع</h1><SettingsManager initial={items.map(x=>({key:x.key,value:x.value}))}/></>}
