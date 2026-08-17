import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Επικοινωνία | YIDO",
  description: "Επικοινωνήστε με την ομάδα του YIDO.",
};

export default async function ContactPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookie(cookieStore.get("yido-locale")?.value);
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-heading font-semibold text-primary">
            YIDO
          </Link>
          <Button render={<Link href="/register" />} size="sm">
            {t(locale, "nav.getStarted")}
          </Button>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-2 tracking-tight">
          {t(locale, "contact.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t(locale, "contact.subtitle")}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-50)] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{t(locale, "contact.email")}</h3>
                <p className="text-sm text-muted-foreground">support@yido.gr</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(locale, "contact.emailResponse")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-50)] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{t(locale, "contact.location")}</h3>
                <p className="text-sm text-muted-foreground">Αθήνα, Ελλάδα</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-50)] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{t(locale, "contact.hours")}</h3>
                <p className="text-sm text-muted-foreground">{t(locale, "contact.hoursValue")}</p>
              </div>
            </div>
          </div>

          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                {t(locale, "contact.sendMessage")}
              </h2>
              <form className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">{t(locale, "common.name")}</Label>
                  <Input id="contact-name" type="text" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">{t(locale, "common.email")}</Label>
                  <Input id="contact-email" type="email" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">{t(locale, "contact.message")}</Label>
                  <Textarea id="contact-message" rows={4} required />
                </div>
                <Button type="submit" className="w-full">
                  {t(locale, "contact.send")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
