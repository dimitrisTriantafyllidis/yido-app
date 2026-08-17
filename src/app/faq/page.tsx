import Link from "next/link";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { t, getLocaleFromCookie } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "FAQ | YIDO",
  description: "Συχνές ερωτήσεις για την πλατφόρμα YIDO.",
};

const faqs = [
  {
    q: "Τι είναι το YIDO;",
    a: "Το YIDO (Your Important Day Online) είναι μια πλατφόρμα οργάνωσης εκδηλώσεων που σας βοηθά να δημιουργήσετε εντυπωσιακές σελίδες event, να διαχειριστείτε RSVPs, να μοιραστείτε τοποθεσίες και να ενημερώσετε τους καλεσμένους σας.",
  },
  {
    q: "Πόσο κοστίζει;",
    a: "Το YIDO προσφέρει τρία πακέτα: Basic (\u20AC49), Premium (\u20AC99) και Gold (\u20AC179). Πρόκειται για εφάπαξ πληρωμή ανά event — χωρίς συνδρομές ή κρυφές χρεώσεις.",
  },
  {
    q: "Τι περιλαμβάνει κάθε πακέτο;",
    a: "Το Basic περιλαμβάνει σελίδες event, διαχείριση RSVP (έως 100 καλεσμένους), QR codes και χάρτες. Το Premium προσθέτει απεριόριστους καλεσμένους, γκαλερί, πρόγραμμα, custom χρώματα και seating. Το Gold περιλαμβάνει τα πάντα plus απεριόριστη γκαλερί και priority support.",
  },
  {
    q: "Μπορούν οι καλεσμένοι να κάνουν RSVP χωρίς λογαριασμό;",
    a: "Ναι! Οι καλεσμένοι μπορούν να κάνουν RSVP απευθείας από τη δημόσια σελίδα σας χωρίς εγγραφή.",
  },
  {
    q: "Μπορούν οι καλεσμένοι να ανεβάσουν φωτογραφίες;",
    a: "Ναι, με το Premium ή Gold πακέτο, οι καλεσμένοι μπορούν να ανεβάσουν φωτογραφίες στη γκαλερί σας.",
  },
  {
    q: "Πώς λειτουργούν τα QR codes;",
    a: "Κάθε event παίρνει ένα μοναδικό QR code που οδηγεί στη δημόσια σελίδα σας. Μπορείτε να το κατεβάσετε και να το τυπώσετε στα προσκλητήρια.",
  },
  {
    q: "Μπορώ να επεξεργαστώ μετά τη δημιουργία;",
    a: "Φυσικά! Μπορείτε να επεξεργαστείτε όλα τα στοιχεία, ρυθμίσεις, καλεσμένους και τοποθεσίες ανά πάσα στιγμή.",
  },
  {
    q: "Τι γίνεται με τα δεδομένα μου μετά το event;",
    a: "Τα δεδομένα σας διατηρούνται για 12 μήνες μετά την εκδήλωση. Μπορείτε να διαγράψετε ανά πάσα στιγμή.",
  },
  {
    q: "Μπορώ να ζητήσω επιστροφή χρημάτων;",
    a: "Ναι, εντός 14 ημερών αν δεν έχει δημοσιευτεί σελίδα event. Επικοινωνήστε στο support@yido.gr.",
  },
  {
    q: "Υποστηρίζει Ελληνικά;",
    a: "Ναι, το YIDO υποστηρίζει πλήρως Ελληνικά και Αγγλικά σε όλες τις σελίδες.",
  },
];

export default async function FAQPage() {
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
          {t(locale, "faq.title")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t(locale, "faq.subtitle")}
        </p>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="bg-card rounded-xl border border-border group shadow-[var(--shadow-soft)]"
            >
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none text-foreground font-medium hover:bg-[var(--color-gold-50)]/50 transition-all rounded-xl min-h-[44px]">
                {faq.q}
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
              </summary>
              <div className="px-6 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {t(locale, "faq.stillQuestions")}
          </p>
          <Button variant="outline" render={<Link href="/contact" />}>
            {t(locale, "faq.contactUs")}
          </Button>
        </div>
      </main>
    </div>
  );
}
