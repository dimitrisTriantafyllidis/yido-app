export default function DemoInvitationPage() {
  const eventDate = new Date("2027-09-18T17:00:00");

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center bg-[#F5F0EB]">
        <p className="text-text-muted text-sm tracking-widest uppercase mb-6">Σας προσκαλούμε στον γάμο μας</p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-text-primary tracking-tight">
          Μαρία <span className="font-normal text-text-muted">&</span> Γιώργος
        </h1>
        <div className="mt-8 flex items-center gap-3 text-text-secondary">
          <span className="h-px w-12 bg-border-strong" />
          <time className="text-sm tracking-wide">Σάββατο, 18 Σεπτεμβρίου 2027</time>
          <span className="h-px w-12 bg-border-strong" />
        </div>
      </section>

      {/* Welcome Text */}
      <section className="px-6 py-20 max-w-2xl mx-auto text-center">
        <p className="text-text-secondary text-lg leading-relaxed">
          Με μεγάλη χαρά σας προσκαλούμε να μοιραστείτε μαζί μας
          τη σημαντικότερη μέρα της ζωής μας. Η παρουσία σας θα είναι
          το πιο όμορφο δώρο.
        </p>
      </section>

      {/* Venues */}
      <section className="px-6 py-16 bg-surface">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-semibold text-center text-text-primary mb-12">Τοποθεσίες</h2>

          <div className="space-y-10">
            {/* Ceremony */}
            <div className="text-center">
              <p className="text-xs tracking-widest uppercase text-text-muted mb-2">Τελετή</p>
              <h3 className="font-display text-2xl font-semibold text-text-primary">Ιερός Ναός Αγίου Νικολάου</h3>
              <p className="mt-2 text-text-secondary">Πλατεία Αγίου Νικολάου, Αθήνα</p>
              <p className="mt-1 text-text-muted text-sm">17:00</p>
              <a
                href="https://maps.google.com/?q=Agios+Nikolaos+Athens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Οδηγίες στο χάρτη
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="border-t border-border" />

            {/* Reception */}
            <div className="text-center">
              <p className="text-xs tracking-widest uppercase text-text-muted mb-2">Δεξίωση</p>
              <h3 className="font-display text-2xl font-semibold text-text-primary">Κτήμα Ελαιών</h3>
              <p className="mt-2 text-text-secondary">Λεωφόρος Βάρης-Κορωπίου, Βάρη</p>
              <p className="mt-1 text-text-muted text-sm">20:00</p>
              <a
                href="https://maps.google.com/?q=Ktima+Elaion+Vari"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                Οδηγίες στο χάρτη
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="px-6 py-20 max-w-lg mx-auto">
        <h2 className="font-display text-3xl font-semibold text-center text-text-primary mb-3">Επιβεβαίωση Παρουσίας</h2>
        <p className="text-center text-text-muted text-sm mb-10">Παρακαλούμε απαντήστε έως τις 31 Αυγούστου 2027</p>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">Ονοματεπώνυμο</label>
            <input
              type="text"
              id="name"
              placeholder="π.χ. Αλέξανδρος Παπαδόπουλος"
              className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input
              type="email"
              id="email"
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-text-primary mb-2">Θα παρευρεθείτε;</legend>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md cursor-pointer hover:bg-accent-light has-[:checked]:bg-accent-light has-[:checked]:border-accent transition-colors">
                <input type="radio" name="attending" value="yes" className="sr-only" />
                <span className="text-sm font-medium">Ναι, θα έρθω</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-md cursor-pointer hover:bg-accent-light has-[:checked]:bg-accent-light has-[:checked]:border-accent transition-colors">
                <input type="radio" name="attending" value="no" className="sr-only" />
                <span className="text-sm font-medium">Δεν θα μπορέσω</span>
              </label>
            </div>
          </fieldset>

          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-text-primary mb-1.5">Αριθμός ατόμων</label>
            <select
              id="guests"
              className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            >
              <option value="1">1 άτομο</option>
              <option value="2">2 άτομα</option>
              <option value="3">3 άτομα</option>
              <option value="4">4 άτομα</option>
            </select>
          </div>

          <div>
            <label htmlFor="meal" className="block text-sm font-medium text-text-primary mb-1.5">Διατροφική προτίμηση</label>
            <select
              id="meal"
              className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            >
              <option value="">Χωρίς προτίμηση</option>
              <option value="vegetarian">Χορτοφαγικό</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Χωρίς γλουτένη</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-1.5">Σημειώσεις (προαιρετικά)</label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Αλλεργίες, ειδικές ανάγκες..."
              className="w-full px-4 py-2.5 border border-border rounded-md bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            Αποστολή απάντησης
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-text-muted text-xs">Μαρία & Γιώργος &middot; 18 Σεπτεμβρίου 2027</p>
      </footer>
    </main>
  );
}
