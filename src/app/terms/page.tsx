import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Όροι Χρήσης | YIDO",
  description: "Όροι Χρήσης YIDO - Κανόνες και προϋποθέσεις χρήσης της πλατ��όρμας.",
};

export default function TermsPage() {
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
          Όροι Χρήσης
        </h1>
        <div className="prose prose-sm text-muted-foreground space-y-6">
          <p>Τελευταία ενημέρωση: Ιούλιος 2026</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">1. Αποδοχή</h2>
          <p>Χρησιμοποιώντας το YIDO, αποδέχεστε αυτούς τους Όρους Χρήσης. Αν δεν συμφωνείτε, παρακαλούμε μη χρησιμοποιείτε την υπηρεσία.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">2. Περιγραφή Υπηρεσίας</h2>
          <p>Το YIDO παρέχει εργαλεία οργάνωσης εκδηλώσεων: δημιουργία σελίδων event, διαχείριση RSVP, λίστες καλεσμένων, γκαλερί φωτογραφιών και σχετικές λειτουργίες. Η πρόσβαση σε ορισμένα χαρακτηριστικά εξαρτάται από το πακέτο σας.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">3. Λογαριασμοί</h2>
          <p>Είστε υπεύθυνοι για την ασφάλεια του λογαριασμού σας. Πρέπει να παρέχετε ακριβή στοιχεία κατά τη δημιουργία λογαριασμού.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">4. Πληρωμές</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Οι πληρωμές είναι εφάπαξ ανά event, χωρίς συνδρομή</li>
            <li>Όλες οι τιμές σε EUR με ΦΠΑ</li>
            <li>Ασφαλής επεξεργασία μέσω Stripe</li>
            <li>Επιστροφή χρημάτων εντός 14 ημερών αν δεν έχει δημοσιευτεί σελίδα</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground">5. Περιεχόμενο Χρηστών</h2>
          <p>Διατηρείτε την ιδιοκτησία του περιεχομένου σας (φωτογραφίες, κείμενα κ.λπ.). Ανεβάζοντας περιεχόμενο, μας παρέχετε άδεια να το εμφανίζουμε στη σελίδα σας. Είστε υπεύθυνοι ότι έχετε δικαίωμα κοινοποίησης.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">6. Απαγορευμένη Χρήση</h2>
          <p>Δεν επιτρέπεται η χρήση του YIDO για παράνομους σκοπούς, παρενόχληση, διανομή κακόβουλου λογισμικού, ή παραβίαση νόμων.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">7. Περιορισμός Ευθύνης</h2>
          <p>Το YIDO παρέχεται &quot;ως έχει&quot; χωρίς εγγυήσεις. Δεν ευθυνόμαστε για ζημίες πέραν του ποσού που καταβλήθηκε για το συγκεκριμένο πακέτο.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">8. Αλλαγές</h2>
          <p>Ενδέχεται να ενημερώσουμε τους όρους. Η συνέχιση χρήσης μετά από αλλαγές σημαίνει αποδοχή.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground">9. Επικοινωνία</h2>
          <p>Για ερωτήσεις: <strong>legal@yido.gr</strong></p>
        </div>
      </main>
    </div>
  );
}
