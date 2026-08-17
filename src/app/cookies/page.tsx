import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Πολιτική Cookies | YIDO",
  description: "Πολιτική Cookies YIDO - Πώς χρησιμοποιούμε cookies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-2xl font-heading font-semibold text-primary">
            YIDO
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-8 tracking-tight">
          Πολιτική Cookies
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p>Τελευταία ενημέρωση: Ιούλιος 2026</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">Τι Είναι τα Cookies</h2>
          <p>Τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στη συσκευή σας όταν επισκέπτεστε μια ιστοσελίδα. Βοηθούν στη βελτίωση της εμπειρίας σας.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">Cookies που Χρησιμοποιούμε</h2>

          <h3 className="font-heading text-lg font-medium text-foreground">Απαραίτητα Cookies</h3>
          <p>Απαιτούνται για τη λειτουργία του site. Περιλαμβάνουν authentication cookies της Supabase.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">sb-*</code> - Supabase authentication session</li>
          </ul>

          <h3 className="font-heading text-lg font-medium text-foreground">Λειτουργικά Cookies</h3>
          <p>Αποθηκεύουν τις προτιμήσεις σας όπως γλώσσα και συγκατάθεση cookies.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><code className="bg-muted px-1.5 py-0.5 rounded text-xs">yido-cookie-consent</code> - Αποθήκευση προτίμησης cookies</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground">Cookies Τρίτων</h2>
          <p>Η Stripe μπορεί να ορίσει cookies κατά την πληρωμή. Το Google Maps μπορεί να ορίσει cookies όταν εμφανίζονται χάρτες. Ανατρέξτε στις αντίστοιχες πολιτικές απορρήτου τους.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">Διαχείριση Cookies</h2>
          <p>Μπορείτε να ελέγξετε τα cookies μέσω των ρυθμίσεων του browser σας. Η απενεργοποίηση απαραίτητων cookies μπορεί να επηρεάσει τη λειτουργικότητα.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">Επικοινωνία</h2>
          <p>Για ερωτήσεις: <strong>privacy@yido.gr</strong></p>
        </div>
      </main>
    </div>
  );
}
