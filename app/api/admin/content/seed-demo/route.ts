import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
async function allowed(){const s=await auth();return !!s?.user&&["ADMIN","SUPER_ADMIN"].includes(s.user.role);}
const demos=[
 ["demo-brand-luma","Luma — هوية بصرية","نموذج تجريبي لهوية علامة عصرية","photo-1558655146-d09347e92766",null],
 ["demo-architecture-north","North — موقع معماري","نموذج تجريبي لموقع مكتب معماري","photo-1600607687939-ce8a6c25118c",null],
 ["demo-ecommerce-forma","Forma — متجر إلكتروني","نموذج تجريبي لتجربة متجر منتجات","photo-1555529669-e69e7aa0ba9a",null],
 ["demo-app-dashboard","Pulse — لوحة تحكم","نموذج تجريبي لواجهة لوحة تحكم رقمية","photo-1551288049-bebda4e38f71",null],
 ["demo-product-campaign","Aura — حملة منتج","نموذج تجريبي لحملة إعلانية","photo-1542291026-7eec264c27ff",null],
 ["demo-creative-studio","Mono — استوديو إبداعي","نموذج تجريبي لموقع استوديو تصميم","photo-1497366754035-f200968a6e72",null],
 ["demo-video-brand","Motion — فيديو هوية","فيديو تجريبي للعرض فقط","photo-1492619375914-88005aa9e8fb","https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"],
 ["demo-video-product","Product — فيديو منتج","فيديو تجريبي للعرض فقط","photo-1523275335684-37898b6baf30","https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"],
 ["demo-video-travel","Travel — إعلان سياحي","فيديو تجريبي للعرض فقط","photo-1500530855697-b586d89ba3ee","https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"],
 ["demo-video-lifestyle","Life — فيديو أسلوب حياة","فيديو تجريبي للعرض فقط","photo-1492684223066-81342ee5ff30","https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"],
 ["demo-video-tech","Tech — عرض تقني","فيديو تجريبي للعرض فقط","photo-1518770660439-4636190af475","https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"],
 ["demo-video-brand-film","Studio — فيلم قصير","فيديو تجريبي للعرض فقط","photo-1497366811353-6870744d04b2","https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"]
] as const;
export async function POST(){if(!await allowed())return NextResponse.json({error:"غير مصرح."},{status:403});try{const existing=await prisma.portfolioProject.findMany({where:{slug:{in:demos.map(x=>x[0])}},select:{slug:true}});const found=new Set(existing.map(x=>x.slug));const fresh=demos.filter(x=>!found.has(x[0]));if(fresh.length){await prisma.portfolioProject.createMany({data:fresh.map((x,i)=>({slug:x[0],title:{ar:x[1],en:x[1]},summary:{ar:x[2]+" — محتوى تجريبي وليس عمل عميل حقيقي.",en:"Demo content only — not a real client project."},coverImageKey:x[3].startsWith("photo-")?"https://images.unsplash.com/"+x[3]+"?auto=format&fit=crop&w=1200&q=85":null,galleryKeys:x[4]?["video:"+x[4]]:[],isPublished:true,sortOrder:i+1})),skipDuplicates:true});}return NextResponse.json({created:fresh.length,existing:found.size});}catch{return NextResponse.json({error:"تعذر إضافة النماذج التجريبية."},{status:500});}}