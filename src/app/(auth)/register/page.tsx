"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/lib/i18n/client";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--color-muted)] items-center justify-center relative">
        <div className="text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
            <div className="h-px w-16 bg-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <div className="h-px w-16 bg-primary/30" />
          </div>
          <p className="font-heading text-4xl lg:text-5xl text-primary/80 leading-tight text-display">
            Create Something<br />Beautiful
          </p>
          <div className="flex items-center justify-center gap-3 mt-8" aria-hidden="true">
            <div className="h-px w-16 bg-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <div className="h-px w-16 bg-primary/30" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 relative">
            <div className="absolute right-0 top-0"><LanguageSwitcher /></div>
            <Link href="/" className="text-3xl font-heading font-semibold text-primary inline-block transition-opacity duration-200 hover:opacity-80">YIDO</Link>
            <p className="text-muted-foreground mt-1 text-sm">Your Important Day Online</p>
          </div>
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="p-8">
              <div className="flex justify-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold-50)] flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h1 className="font-heading text-2xl font-semibold text-foreground text-center mb-6">{t("auth.createAccount")}</h1>
              {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Maria Papadopoulou" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("common.email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("common.password")}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="h-11" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-11" size="lg">
                  {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t("auth.hasAccount")}{" "}
                <Link href="/login" className="text-primary hover:text-[var(--color-primary-hover)] font-medium">{t("auth.signInLink")}</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
