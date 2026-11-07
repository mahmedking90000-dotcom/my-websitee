"use client";

import { signOut } from "next-auth/react";
import { useWorkspacePreferences } from "@/components/workspace-preferences";

export default function SignOutButton() {
  const { t } = useWorkspacePreferences();
  return (
    <button onClick={() => signOut({ redirectTo: "/" })} className="text-sm text-white/70">
      {t("logout")}
    </button>
  );
}
