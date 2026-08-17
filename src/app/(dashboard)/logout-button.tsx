"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useTranslation();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-muted-foreground hover:text-primary"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">{t("nav.signOut")}</span>
    </Button>
  );
}
