"use client";

import { useState } from "react";
import Link from "next/link";
import { LandingLogo } from "./landing-logo";

const NAV_LINKS = [
  { href: "#how", label: "Πώς λειτουργεί" },
  { href: "#features", label: "Λειτουργίες" },
  { href: "#packages", label: "Πακέτα" },
  { href: "/e/maria-giorgos-gamos", label: "Demo" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Επικοινωνία" },
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#EADFCB] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 md:px-10 lg:px-20">
        <LandingLogo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1F0F12] lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#4A1221]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#1F0F12] transition-colors hover:text-[#4A1221]"
          >
            Είσοδος
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-[#C39C5E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B38C4E]"
          >
            Δημιουργήστε Εκδήλωση
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-[#EADFCB] text-[#4A1221] lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="relative block h-3.5 w-4">
            <span className={`absolute left-0 top-0 h-px w-4 bg-current transition ${open ? "top-1.5 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-1.5 h-px w-4 bg-current ${open ? "opacity-0" : ""}`} />
            <span className={`absolute bottom-0 left-0 h-px w-4 bg-current transition ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#EADFCB] bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-[#1F0F12]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#1F0F12]"
              onClick={() => setOpen(false)}
            >
              Είσοδος
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-[#C39C5E] px-6 py-3 text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Δημιουργήστε Εκδήλωση
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
