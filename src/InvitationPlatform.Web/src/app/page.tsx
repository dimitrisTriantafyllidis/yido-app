import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
          Η πρόσκλησή σας,<br />ψηφιακά.
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
          Δημιουργήστε μια κομψή ψηφιακή πρόσκληση για τον γάμο, τη βάπτιση ή την εκδήλωσή σας.
          Διαχειριστείτε τους καλεσμένους και τις επιβεβαιώσεις παρουσίας, όλα από ένα μέρος.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo/invitation"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            Δείτε ένα παράδειγμα
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-border-strong text-text-primary font-medium rounded-md hover:bg-surface transition-colors"
          >
            Είσοδος
          </Link>
        </div>
      </section>

      {/* Features summary */}
      <section className="border-t border-border px-6 py-20 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-xl font-semibold text-text-primary">Ψηφιακή πρόσκληση</h3>
            <p className="mt-2 text-text-secondary text-sm leading-relaxed">
              Κομψή σελίδα πρόσκλησης με τοποθεσίες, αντίστροφη μέτρηση, γκαλερί φωτογραφιών και φόρμα επιβεβαίωσης.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-text-primary">Διαχείριση καλεσμένων</h3>
            <p className="mt-2 text-text-secondary text-sm leading-relaxed">
              Εισαγωγή λίστας καλεσμένων, μοναδικοί σύνδεσμοι πρόσκλησης, παρακολούθηση επιβεβαιώσεων σε πραγματικό χρόνο.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-text-primary">Εξαγωγή δεδομένων</h3>
            <p className="mt-2 text-text-secondary text-sm leading-relaxed">
              Εξαγωγή λίστας καλεσμένων και απαντήσεων σε Excel. Στατιστικά παρουσίας και διατροφικών προτιμήσεων.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
