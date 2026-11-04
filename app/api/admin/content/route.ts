import {NextResponse} from "next/server";
import { Prisma } from "@prisma/client";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {z} from "zod";
const roles=["ADMIN","SUPER_ADMIN"];
async function allowed(){const s=await auth();return !!s?.user&&roles.includes(s.user.role);}
export async function GET(){if(!await allowed())return NextResponse.json({error:"غير مصرح."},{status:403});const [services,plans,portfolio]=await Promise.all([prisma.service.findMany(),prisma.pricingPlan.findMany(),prisma.portfolioProject.findMany()]);return NextResponse.json({services,plans,portfolio});}
export async function POST(req:Request){
 if(!await allowed())return NextResponse.json({error:"غير مصرح."},{status:403});
 try{const d=z.object({kind:z.enum(["service","plan","portfolio"]),slug:z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),title:z.record(z.string(),z.json()),description:z.record(z.string(),z.json()).optional(),summary:z.record(z.string(),z.json()).optional(),features:z.array(z.json()).optional(),isActive:z.boolean().default(true),coverImageUrl:z.string().url().optional().or(z.literal("")),videoUrl:z.string().url().optional().or(z.literal(""))}).parse(await req.json());
 let item;if(d.kind==="service")item=await prisma.service.create({data:{slug:d.slug,title:d.title as Prisma.InputJsonValue,description:(d.description||{}) as Prisma.InputJsonValue,isActive:d.isActive}});
 else if(d.kind==="plan")item=await prisma.pricingPlan.create({data:{slug:d.slug,name:d.title as Prisma.InputJsonValue,description:(d.description||{}) as Prisma.InputJsonValue,features:(d.features||[]) as Prisma.InputJsonValue,isActive:d.isActive}});
 else item=await prisma.portfolioProject.create({data:{slug:d.slug,title:d.title as Prisma.InputJsonValue,summary:(d.summary||{}) as Prisma.InputJsonValue,isPublished:true,coverImageKey:d.coverImageUrl||null,galleryKeys:d.videoUrl?["video:"+d.videoUrl]:[]}});
 return NextResponse.json({item},{status:201});
 }catch{return NextResponse.json({error:"تعذر حفظ المحتوى. تحقق من البيانات وعدم تكرار الرابط."},{status:400});}
}