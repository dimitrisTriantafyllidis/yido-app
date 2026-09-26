import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSplitLayout heroSrc="/auth/login-hero.png">{children}</AuthSplitLayout>;
}
