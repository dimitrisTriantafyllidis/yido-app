import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold text-text-primary">YIDO</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-accent font-medium">Αρχική</Link>
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">Πρόσκληση</Link>
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">Καλεσμένοι</Link>
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">RSVP</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">Μαρία</span>
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-sm font-medium">Μ</div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text-primary">Γάμος Μαρίας & Γιώργου</h1>
            <p className="mt-1 text-sm text-text-secondary">Σάββατο, 18 Σεπτεμβρίου 2027</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-success-light text-success rounded-md">Δημοσιευμένη</span>
            <Link
              href="/demo/invitation"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-accent border border-accent rounded-md hover:bg-accent-light transition-colors"
            >
              Προεπισκόπηση
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-5 bg-surface border border-border rounded-lg">
            <p className="text-sm text-text-muted">Σύνολο καλεσμένων</p>
            <p className="mt-1 font-display text-3xl font-semibold text-text-primary">124</p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-lg">
            <p className="text-sm text-text-muted">Επιβεβαιωμένοι</p>
            <p className="mt-1 font-display text-3xl font-semibold text-success">87</p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-lg">
            <p className="text-sm text-text-muted">Δεν θα έρθουν</p>
            <p className="mt-1 font-display text-3xl font-semibold text-destructive">19</p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-lg">
            <p className="text-sm text-text-muted">Εκκρεμούν</p>
            <p className="mt-1 font-display text-3xl font-semibold text-warning">18</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Event details */}
          <div className="md:col-span-3 space-y-6">
            <section className="bg-surface border border-border rounded-lg p-6">
              <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Τοποθεσίες</h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Ιερός Ναός Αγίου Νικολάου</p>
                    <p className="text-sm text-text-secondary">Τελετή &middot; 17:00</p>
                    <p className="text-sm text-text-muted">Πλατεία Αγίου Νικολάου, Αθήνα</p>
                  </div>
                  <button className="text-sm text-accent hover:text-accent-hover transition-colors">Επεξεργασία</button>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Κτήμα Ελαιών</p>
                    <p className="text-sm text-text-secondary">Δεξίωση &middot; 20:00</p>
                    <p className="text-sm text-text-muted">Λεωφόρος Βάρης-Κορωπίου, Βάρη</p>
                  </div>
                  <button className="text-sm text-accent hover:text-accent-hover transition-colors">Επεξεργασία</button>
                </div>
              </div>
            </section>

            {/* Recent RSVPs */}
            <section className="bg-surface border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-text-primary">Πρόσφατες απαντήσεις</h2>
                <Link href="/dashboard" className="text-sm text-accent hover:text-accent-hover transition-colors">Δείτε όλες</Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Ελένη Κωνσταντίνου", status: "confirmed", guests: 2, time: "πριν 2 ώρες" },
                  { name: "Δημήτρης Αλεξίου", status: "confirmed", guests: 1, time: "πριν 5 ώρες" },
                  { name: "Κατερίνα Νικολάου", status: "declined", guests: 0, time: "χθες" },
                  { name: "Σπύρος Μαρίνος", status: "confirmed", guests: 3, time: "χθες" },
                  { name: "Αναστασία Βασιλείου", status: "confirmed", guests: 2, time: "πριν 2 ημέρες" },
                ].map((rsvp, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${rsvp.status === "confirmed" ? "bg-success" : "bg-destructive"}`} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{rsvp.name}</p>
                        <p className="text-xs text-text-muted">{rsvp.time}</p>
                      </div>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {rsvp.status === "confirmed" ? `${rsvp.guests} ${rsvp.guests === 1 ? "άτομο" : "άτομα"}` : "Δεν θα έρθει"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-surface border border-border rounded-lg p-6">
              <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Πρόσκληση</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Κατάσταση</span>
                  <span className="text-success font-medium">Δημοσιευμένη</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Τελευταία ενημέρωση</span>
                  <span className="text-text-primary">15 Ιουλ 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Σύνδεσμος</span>
                  <span className="text-accent font-medium">yido.gr/e/maria-giorgos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Πακέτο</span>
                  <span className="text-text-primary">Digital</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border flex gap-3">
                <Link
                  href="/dashboard"
                  className="flex-1 py-2 text-center text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-hover transition-colors"
                >
                  Επεξεργασία
                </Link>
                <button className="flex-1 py-2 text-center text-sm font-medium text-accent border border-accent rounded-md hover:bg-accent-light transition-colors">
                  Κοινοποίηση
                </button>
              </div>
            </section>

            <section className="bg-surface border border-border rounded-lg p-6">
              <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Γρήγορες ενέργειες</h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full py-2.5 px-4 text-sm text-text-primary border border-border rounded-md hover:bg-accent-light transition-colors text-left"
                >
                  Προσθήκη καλεσμένων
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full py-2.5 px-4 text-sm text-text-primary border border-border rounded-md hover:bg-accent-light transition-colors text-left"
                >
                  Εξαγωγή σε Excel
                </Link>
                <Link
                  href="/dashboard"
                  className="block w-full py-2.5 px-4 text-sm text-text-primary border border-border rounded-md hover:bg-accent-light transition-colors text-left"
                >
                  Δημιουργία QR Code
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
