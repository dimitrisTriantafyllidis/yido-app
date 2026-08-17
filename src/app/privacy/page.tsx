import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Πολιτική Απορρήτου | YIDO",
  description: "Πολιτική Απορρήτου YIDO - Πώς διαχειριζόμαστε τα δεδομένα σας.",
};

export default function PrivacyPage() {
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
          Πολιτική Απορρήτου
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p>Τελευταία ενημέρωση: Ιούλιος 2026</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">1. Δεδομένα που Συλλέγουμε</h2>
          <p>Όταν χρησιμοποιείτε το YIDO, συλλέγουμε:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Στοιχεία λογαριασμού (όνομα, email, κωδικός)</li>
            <li>Στοιχεία εκδηλώσεων (τίτλοι, ημερομηνίες, τοποθεσίες, λίστες καλεσμένων)</li>
            <li>Απαντήσεις RSVP και διατροφικές προτιμήσεις</li>
            <li>Φωτογραφίες που ανεβαίνουν στη γκαλερί</li>
            <li>Στοιχεία πληρωμής (μέσω Stripe)</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground">2. ��ώς Χρησιμοποιούμε τα Δεδομένα</h2>
          <p>Χρησιμοποιούμε τα δεδομένα σας για:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Παροχή και συντήρηση της υπηρεσίας YIDO</li>
            <li>Δημιουργία event και διαχείριση RSVP</li>
            <li>Επεξεργασία πληρωμών μέσω Stripe</li>
            <li>Αποστολή ειδοποιήσεων σχετικών με τις εκδηλώσεις</li>
            <li>Βελτίωση της υπηρεσίας μας</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground">3. Αποθήκευση Δεδομένων</h2>
          <p>Τα δεδομένα σας αποθηκεύονται με ασφάλεια σε servers της Supabase εντός ΕΕ. Εφαρμόζουμε κατάλληλα τεχνικά και οργανωτικά μέτρα προστασίας.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">4. Τα Δικαιώματά σας (GDPR)</h2>
          <p>Σύμφωνα με τον GDPR, έχετε δικαίωμα:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Πρόσβασης στα προσωπικά σας δεδομένα</li>
            <li>Διόρθωσης ανακριβών δεδομένων</li>
            <li>Διαγραφής των δεδομένων σας</li>
            <li>Περιορισμού της επεξεργασίας</li>
            <li>Φορητότητας δεδομένων</li>
            <li>Εναντίωσης στην επεξεργασία</li>
          </ul>
          <p>Για να ασκήσετε τα δικαιώματά σας: privacy@yido.gr</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">5. Διατήρηση Δεδομένων</h2>
          <p>Διατηρούμε τα δεδομένα σας για 12 μήνες μετά την ημερομηνία της εκδήλωσης. Μπορείτε να ζητήσετε πρόωρη διαγραφή ανά πάσα στιγμή.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">6. Υπηρεσίες Τρίτων</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe</strong> - Επεξεργασία πληρωμών</li>
            <li><strong>Supabase</strong> - Βάση δεδομένων και αυθεντικοποίηση</li>
            <li><strong>Google Maps</strong> - Χάρτες τοποθεσιών</li>
            <li><strong>Vercel</strong> - Φιλοξενία</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground">7. Επικοινωνία</h2>
          <p>Για θέματα απορρήτου: <strong>privacy@yido.gr</strong></p>
        </div>
      </main>
    </div>
  );
}
