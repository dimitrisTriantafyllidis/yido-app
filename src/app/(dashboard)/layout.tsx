import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "./components/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="flex items-center cursor-pointer"
              >
                <span className="text-2xl font-heading font-semibold text-primary">
                  YIDO
                </span>
              </Link>
              <div className="hidden sm:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium cursor-pointer transition-colors"
                >
                  {t(locale, "nav.events")}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <NotificationBell />
              <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
