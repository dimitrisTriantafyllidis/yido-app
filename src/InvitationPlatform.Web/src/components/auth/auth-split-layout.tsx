export function AuthSplitLayout({
  heroSrc,
  children,
}: {
  heroSrc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#FBF9F4]">
      <div className="relative hidden min-h-screen w-1/2 shrink-0 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[#4A1221]/18" aria-hidden />
      </div>
      <div className="flex min-h-screen w-full flex-1 items-center justify-center p-8 md:p-16">
        {children}
      </div>
    </div>
  );
}
