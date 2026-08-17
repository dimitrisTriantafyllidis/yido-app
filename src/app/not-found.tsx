import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

export default async function NotFound() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl font-heading font-bold text-primary mb-4 text-display">404</p>
        <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">
          {t(locale, "error.notFound")}
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {t(locale, "error.notFoundDesc")}
        </p>
        <Button render={<Link href="/" />}>
          <Home className="w-4 h-4" />
          {t(locale, "error.goHome")}
        </Button>
      </div>
    </div>
  );
}
