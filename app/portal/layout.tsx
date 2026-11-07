import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/signout-button";
import { WorkspaceControls, WorkspaceProvider, WorkspaceText } from "@/components/workspace-preferences";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <WorkspaceProvider>
      <div className="site-shell min-h-screen bg-[#080b14] text-white">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-5 sm:px-6">
          <Link href="/" className="font-bold tracking-widest">NOVA.</Link>
          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <Link href="/portal"><WorkspaceText ar="لوحتي" en="My dashboard"/></Link>
              <Link href="/portal/projects"><WorkspaceText ar="مشاريعي" en="My projects"/></Link>
              <Link href="/portal/start-project"><WorkspaceText ar="ابدأ مشروعًا" en="Start a project"/></Link>
            </nav>
            <WorkspaceControls />
            <SignOutButton />
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6">{children}</main>
      </div>
    </WorkspaceProvider>
  );
}
