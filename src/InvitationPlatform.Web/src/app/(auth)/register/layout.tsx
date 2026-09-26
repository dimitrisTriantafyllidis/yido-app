import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSplitLayout heroSrc="/auth/register-hero.png">{children}</AuthSplitLayout>
  );
}
