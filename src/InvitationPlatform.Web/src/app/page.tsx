import Image from "next/image";
import Link from "next/link";
import { CheckIcon, FeatureIcon, SocialIcon } from "@/components/landing/landing-icons";
import { LandingLogo } from "@/components/landing/landing-logo";
import { LandingNav } from "@/components/landing/landing-nav";

const FEATURES = [
  {
    icon: "/landing/mail.svg",
    title: "Ψηφιακό Προσκλητήριο",
    body: "Μοναδική σελίδα εκδήλωσης, προσαρμοσμένη απόλυτα στο στυλ και το θέμα της επιλογής σας.",
  },
  {
    icon: "/landing/map-pin.svg",
    title: "Χάρτες & Τοποθεσίες",
    body: "Καθοδηγήστε τους καλεσμένους σας με ακρίβεια στην εκκλησία, το δημαρχείο ή το κέντρο δεξιώσεων.",
  },
  {
    icon: "/landing/check-circle.svg",
    title: "RSVP (Επιβεβαίωση)",
    body: "Online φόρμα για εύκολη δήλωση συμμετοχής, αριθμού ατόμων και διατροφικών προτιμήσεων.",
  },
  {
    icon: "/landing/image.svg",
    title: "Gallery Φωτογραφιών",
    body: "Μοιραστείτε τις αγαπημένες σας στιγμές πριν την εκδήλωση ή επιτρέψτε στους καλεσμένους να ανεβάσουν τις δικές τους.",
  },
  {
    icon: "/landing/grid.svg",
    title: "Seating Plan (Χάρτης Θέσεων)",
    body: "Οργανώστε έξυπνα τα τραπέζια και τις θέσεις των καλεσμένων σας με το εύχρηστο drag-and-drop εργαλείο.",
    badge: "NEW",
  },
  {
    icon: "/landing/smartphone.svg",
    title: "Mobile Friendly",
    body: "Εγγυημένη άψογη εμφάνιση και λειτουργία σε όλα τα κινητά τηλέφωνα, tablet και υπολογιστές.",
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Δημιουργήστε την εκδήλωσή σας",
    body: "Επιλέξτε ένα από τα πολυτελή εικαστικά πρότυπα και συμπληρώστε τις λεπτομέρειες της ημέρας σας.",
  },
  {
    n: "2",
    title: "Μοιραστείτε το link ή το QR Code",
    body: "Στείλτε την πρόσκληση εύκολα μέσω Viber, WhatsApp, SMS ή social media στους καλεσμένους σας.",
  },
  {
    n: "3",
    title: "Οι καλεσμένοι επιβεβαιώνουν",
    body: "Δείτε τις απαντήσεις τους άμεσα στο δικό σας control panel, μαζί με επιλογές για το μενού ή τη διαμονή.",
  },
] as const;

const FAQS = [
  {
    q: "Χρειάζονται οι καλεσμένοι εφαρμογή;",
    a: "Όχι. Ανοίγουν το link στο κινητό τους και βλέπουν την πρόσκληση, τους χάρτες και τη φόρμα RSVP.",
  },
  {
    q: "Πότε πληρώνω;",
    a: "Ξεκινάτε δωρεάν. Επιλέγετε πακέτο όταν είστε έτοιμοι να δημοσιεύσετε την εκδήλωσή σας.",
  },
  {
    q: "Μπορώ να δω ένα παράδειγμα;",
    a: "Ναι — το Demo είναι μια πλήρης δημοσιευμένη πρόσκληση, όπως θα τη δουν οι καλεσμένοι σας.",
  },
] as const;

export default function Home() {
  return (
    <div className="landing min-h-full bg-[#FBF9F4] text-[#1F0F12]">
      <LandingNav />

      <main>
        <section className="bg-[#4A1221] px-5 py-16 md:px-10 md:py-24 lg:px-20">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 lg:flex-row lg:gap-16">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-8">
              <p className="rounded-full border border-[#C39C5E] bg-[#5C1B2E] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#C39C5E]">
                YIDO – YOUR IMPORTANT DAY ONLINE
              </p>
              <h1 className="font-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-[64px]">
                Όλα όσα χρειάζονται οι
                <br />
                καλεσμένοι σας, σε ένα link.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#F5EFE4]">
                Δημιουργήστε κομψές ψηφιακές προσκλήσεις για γάμους, βαπτίσεις και πάρτι γενεθλίων.
                Διαχειριστείτε τους καλεσμένους σας και τις επιβεβαιώσεις παρουσίας (RSVP), όλα από ένα μέρος.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-[#C39C5E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B38C4E]"
                >
                  Δημιουργήστε Εκδήλωση
                </Link>
                <Link
                  href="/e/maria-giorgos-gamos"
                  className="inline-flex items-center justify-center rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Δείτε Demo
                </Link>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <Link
                href="/e/maria-giorgos-gamos"
                className="block w-[280px] shrink-0 rounded-[36px] border-[10px] border-[#1F0F12] bg-white p-3 shadow-[0_24px_24px_rgba(0,0,0,0.25)] sm:w-[310px]"
                aria-label="Άνοιγμα demo πρόσκλησης"
              >
                <div className="flex h-[500px] flex-col overflow-clip rounded-3xl bg-[#FBF9F4] sm:h-[526px]">
                  <div className="relative h-40 w-full shrink-0">
                    <Image
                      src="/landing/hero.png"
                      alt=""
                      fill
                      priority
                      sizes="290px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 px-4 pt-4">
                    <p className="font-display text-[28px] leading-none text-[#4A1221]">Γιώργος &amp; Μαρία</p>
                    <p className="text-center text-[11px] uppercase tracking-[0.14em] text-[#C39C5E]">
                      Σας προσκαλούν στον γάμο τους
                    </p>
                    <span className="mt-1 block h-px w-10 bg-[#C39C5E]" />
                    <p className="text-center text-xs text-[#1F0F12]">Σάββατο, 18 Σεπτεμβρίου 2027</p>
                    <span className="mt-1 rounded-md bg-[#4A1221] px-4 py-2 text-[11px] font-semibold text-white">
                      Επιβεβαίωση Παρουσίας
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24 bg-[#F4EDE2] px-5 py-20 md:px-10 md:py-24 lg:px-20">
          <div className="mx-auto max-w-[1280px]">
            <SectionHeader kicker="Πώς λειτουργεί" title="Τρία απλά βήματα προς την τέλεια διοργάνωση" />
            <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
              {STEPS.map((step) => (
                <div key={step.n} className="flex flex-col gap-4 p-6">
                  <div className="flex size-10 items-center justify-center rounded-[20px] bg-[#C39C5E] text-lg font-bold text-white">
                    {step.n}
                  </div>
                  <h3 className="font-display text-2xl text-[#1F0F12]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6E5B60]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 bg-[#FBF9F4] px-5 py-20 md:px-10 md:py-24 lg:px-20">
          <div className="mx-auto max-w-[1200px]">
            <SectionHeader kicker="Τι περιλαμβάνεται" title="Όλα όσα χρειάζεστε σε μία πλατφόρμα" />
            <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="flex flex-col gap-4 rounded-2xl border border-[#EADFCB] bg-white p-8 shadow-[0_4px_12px_rgba(31,15,18,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <FeatureIcon src={feature.icon} />
                    {"badge" in feature ? (
                      <span className="rounded-full bg-[#C39C5E] px-2 py-1 text-[10px] font-bold uppercase text-white">
                        {feature.badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-display text-[22px] text-[#1F0F12]">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6E5B60]">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="packages" className="scroll-mt-24 bg-[#F4EDE2] px-5 py-20 md:px-10 md:py-24 lg:px-20">
          <div className="mx-auto max-w-[1100px]">
            <SectionHeader kicker="Πακέτα" title="Επιλέξτε το ιδανικό πλάνο για εσάς" />
            <div className="mt-16 grid items-start gap-8 lg:grid-cols-3">
              <PricingCard
                name="Mini"
                blurb="Για απλές εκδηλώσεις"
                price="€49"
                items={["Ψηφιακό προσκλητήριο", "Χάρτης & τοποθεσίες", "Βασική φόρμα RSVP", "Έως 100 καλεσμένοι"]}
                cta="Επιλογή Mini"
              />
              <PricingCard
                name="Digital"
                blurb="Για γάμους & βαπτίσεις"
                price="€99"
                items={["Όλα του Mini", "Gallery φωτογραφιών", "QR Code", "Πλήρες RSVP"]}
                cta="Επιλογή Digital"
                featured
              />
              <PricingCard
                name="Video"
                blurb="Η απόλυτη εμπειρία"
                price="€179"
                items={["Όλα του Digital", "Video background", "Premium templates", "Προτεραιότητα υποστήριξης"]}
                cta="Επιλογή Video"
              />
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-[#FBF9F4] px-5 py-20 md:px-10 md:py-24 lg:px-20">
          <div className="mx-auto max-w-3xl">
            <SectionHeader kicker="FAQ" title="Συχνές ερωτήσεις" />
            <div className="mt-12 divide-y divide-[#EADFCB] border-y border-[#EADFCB]">
              {FAQS.map((item) => (
                <div key={item.q} className="py-6">
                  <h3 className="font-display text-xl text-[#1F0F12]">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6E5B60]">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#4A1221] px-5 py-20 text-center md:px-10 md:py-24 lg:px-20">
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-4xl leading-tight text-white md:text-[52px]">
                Δημιουργήστε τη δική σας σελίδα εκδήλωσης σήμερα.
              </h2>
              <p className="text-base text-[#F5EFE4]">
                Ξεκινήστε εύκολα και γρήγορα. Δώστε στους καλεσμένους σας μια ψηφιακή εμπειρία που θα θυμούνται.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-[#C39C5E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B38C4E]"
            >
              Ξεκινήστε Δωρεάν
            </Link>
          </div>
        </section>
      </main>

      <footer id="contact" className="scroll-mt-24 border-t border-[#EADFCB] bg-white px-5 pb-10 pt-16 md:px-10 lg:px-20 lg:pt-20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-16">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[300px]">
              <LandingLogo />
              <p className="mt-4 text-sm leading-relaxed text-[#6E5B60]">
                Ψηφιακές προσκλήσεις υψηλής αισθητικής για τις πιο σημαντικές στιγμές της ζωής σας.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 lg:gap-16">
              <FooterCol
                title="Εταιρεία"
                links={[
                  { href: "#how", label: "Σχετικά" },
                  { href: "/e/maria-giorgos-gamos", label: "Πρότυπα" },
                  { href: "#packages", label: "Τιμολόγηση" },
                ]}
              />
              <FooterCol
                title="Υποστήριξη"
                links={[
                  { href: "#faq", label: "Συχνές Ερωτήσεις" },
                  { href: "mailto:hello@yido.gr", label: "Επικοινωνία" },
                  { href: "mailto:hello@yido.gr", label: "Όροι Χρήσης" },
                  { href: "mailto:hello@yido.gr", label: "Προσωπικά Δεδομένα" },
                ]}
              />
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-[#1F0F12]">Ακολουθήστε μας</p>
                <div className="flex gap-3">
                  <SocialIcon src="/landing/instagram.svg" label="Instagram" href="https://instagram.com" />
                  <SocialIcon src="/landing/facebook.svg" label="Facebook" href="https://facebook.com" />
                  <SocialIcon src="/landing/x.svg" label="X" href="https://x.com" />
                </div>
                <a href="mailto:hello@yido.gr" className="text-sm text-[#6E5B60] hover:text-[#4A1221]">
                  hello@yido.gr
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#EADFCB] pt-8">
            <p className="text-[13px] text-[#6E5B60]">© 2026 YIDO. Όλα τα δικαιώματα διατηρούνται.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#C39C5E]">{kicker}</p>
      <h2 className="mt-4 font-display text-3xl leading-tight text-[#1F0F12] md:text-5xl">{title}</h2>
    </div>
  );
}

function PricingCard({
  name,
  blurb,
  price,
  items,
  cta,
  featured = false,
}: {
  name: string;
  blurb: string;
  price: string;
  items: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative flex flex-col gap-8 rounded-3xl bg-white p-6 sm:p-10 ${
        featured
          ? "border-2 border-[#4A1221] shadow-[0_16px_16px_rgba(74,18,33,0.1)]"
          : "border border-[#EADFCB]"
      }`}
    >
      {featured ? (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4A1221] px-4 py-1.5 text-[11px] font-bold uppercase text-white">
          Πιο δημοφιλές
        </span>
      ) : null}
      <div className="flex flex-col gap-2">
        <h3 className={`font-display text-[28px] ${featured ? "text-[#4A1221]" : "text-[#1F0F12]"}`}>{name}</h3>
        <p className="text-sm text-[#6E5B60]">{blurb}</p>
      </div>
      <p className="flex items-baseline gap-1">
        <span className={`font-display text-5xl ${featured ? "text-[#4A1221]" : "text-[#1F0F12]"}`}>{price}</span>
        <span className="text-sm text-[#6E5B60]">/ εκδήλωση</span>
      </p>
      <div className="h-px w-full bg-[#EADFCB]" />
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[#1F0F12]">
            <CheckIcon variant={featured ? "burgundy" : "gold"} />
            <span className={featured ? "font-semibold" : ""}>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold ${
          featured
            ? "bg-[#4A1221] text-white hover:bg-[#3A0E1A]"
            : "border border-[#4A1221] text-[#4A1221] hover:bg-[#4A1221] hover:text-white"
        } transition-colors`}
      >
        {cta}
      </Link>
    </article>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-4">
      <p className="text-sm font-semibold text-[#1F0F12]">{title}</p>
      {links.map((link) => (
        <Link key={link.label} href={link.href} className="text-[13px] text-[#6E5B60] hover:text-[#4A1221]">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
