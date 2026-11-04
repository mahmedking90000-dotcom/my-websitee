import {auth} from "@/auth";import {redirect} from "next/navigation";
export default async function Start(){const s=await auth();if(!s?.user)redirect("/login?callbackUrl=%2Fportal%2Fstart-project");redirect("/portal/start-project");}
