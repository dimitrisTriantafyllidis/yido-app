import type { Metadata } from "next";
import { Inter, Literata } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "greek"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "greek"],
});

export const metadata: Metadata = {
  title: "YIDO - Your Important Day Online",
  description: "Δημιουργήστε την ψηφιακή σας πρόσκληση για γάμο, βάπτιση και κάθε σημαντική εκδήλωση.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className={`${inter.variable} ${literata.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
