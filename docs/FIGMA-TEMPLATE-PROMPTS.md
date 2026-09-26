# Figma prompts — YIDO public invitation templates

Copy these into **Figma Make / Figma AI** (or give them to a designer). One prompt per Figma page.

YIDO does **not** import `.fig` files. Design here, then engineering maps colors/fonts/layout onto React sections on `/e/{slug}`.

**File setup:** one Figma file `YIDO Invitation Templates`, pages `Wedding-Classic`, `Baptism`, `Birthday-Party`. Primary artboard **390 × 844**. Desktop **1280** wide, same section order.

**Export for developers:** a style tile (hex + font names) plus a 390×844 cover PNG per template for `PreviewImageUrl`.

---

## Prompt 0 — Shared rules (prepend to every template)

```
You are designing a mobile-first digital invitation landing page for YIDO (Greek market).
This is NOT a printable card and NOT a website with navigation.

Constraints:
- Primary frame: 390×844, vertical scroll of stacked sections. Secondary: 1280 desktop.
- Languages: Greek UI copy. Use Greek names in placeholders.
- Fonts with Greek support: display = Literata (serif), body = Inter.
- No hamburger menu, no logo chrome, no “Sign up” SaaS UI.
- Do not bake names into photos; keep names as text layers.
- Sections in this exact order (name each frame after the section id):
  hero, welcome_text, event_details, countdown, venue, participants, gallery, rsvp, gift_list, video, footer.
- RSVP is a real form: name, email, attending yes/no, adults, children, notes, submit button.
- Venue cards: name, address, time, “Οδηγίες (Google Maps)” text link.
- Gallery: 6 photo tiles, 2 columns on mobile.
- Use auto-layout. Create color/font variables matching: primary, accent, background, text, surface, radius.
- Export a 1-page style tile: hex codes + font names for developers.
```

---

## Prompt 1 — Wedding (`Κλασικός Γάμος`)

Theme tokens already in the app: sage `#2E5A4C`, bg `#FAFAF7`, text `#1A1A18`, radius `8px`.

```
[Paste Prompt 0]

Template: Classic Greek wedding invitation.
Mood: elegant, warm, not luxurious, not floral-overloaded. Editorial photography.
Colors: deep sage #2E5A4C, off-white #FAFAF7, white surfaces, charcoal text #1A1A18.
Hero: full-bleed couple photo, sage-to-dark overlay, small uppercase subtitle «Σας προσκαλούμε στον γάμο μας», large serif names «Ελένη & Νίκος», date «Σάββατο 18 Σεπτεμβρίου 2027».
Welcome: short Greek paragraph about celebrating together.
Event details: date, time, dress code «Επίσημο».
Venues: two cards — church «Ιερός Ναός Αγίου Νικολάου», reception «Κτήμα Ελαιών».
Participants: bride, groom, best man, maid of honor with circular photos.
RSVP heading: «Επιβεβαίωση Παρουσίας».
Footer: «Σας περιμένουμε με χαρά!»
Do not use pink or gold as primary. Sage is the only accent.
```

---

## Prompt 2 — Baptism (`Βάπτιση`)

Softer sage. Skip gift/video (mark those frames hidden).

```
[Paste Prompt 0]

Template: Greek Orthodox baptism invitation.
Mood: joyful, gentle, family, light — not a wedding, not a kids party cartoon.
Colors: soft sage #3D6B5C, cream #F7F4EE, sky-white surfaces, text #1A1A18.
Hero: photo of a baby or family (tasteful, not stock-cliché), light overlay, subtitle «Σας προσκαλούμε στη βάπτιση», name «Ο μικρός Ανδρέας», date.
Skip gift_list and video frames (or mark them hidden).
Participants: parents + godparent (Νονός/Νονά).
Venues: church + reception after.
RSVP: plus-one yes, children count no.
Typography slightly larger headings; more whitespace than wedding.
Avoid balloons, clowns, primary rainbow colors.
```

---

## Prompt 3 — Birthday (`Γενέθλια`) — Party event type

App `EventType.Party`. Must not look like a wedding.

```
[Paste Prompt 0]

Template: Adult/child-friendly Greek birthday invitation for a digital event page.
Mood: festive but still editorial (YIDO brand is not playful-corporate). Warm, celebratory.
Colors: charcoal #1A1A18, warm sand accent #D4A574, white bg #FFFFFF, surface #F5F5F5, radius 4px (modern).
Hero: portrait or party table photo, modern overlay, subtitle «Σας προσκαλούμε», name «Τα γενέθλια της Σοφίας», age optional as small label «30 χρόνια».
One venue card (home or venue). No church.
Participants optional (host only).
Gallery 6 photos. RSVP simpler: attending + adults + children.
No religious iconography. No sage-green wedding look — this must read as a different event type at a glance.
```

---

## Prompt 4 — Optional romantic wedding

Already in the product (`Ρομαντικός Γάμος`): dusty rose `#8B4557`, bg `#FFF5F5`. Same section list as wedding; floral/soft, still no custom HTML.

---

## Developer style tokens (from the prompts)

| Template | Category | Primary | Accent | Background | Text | Surface | Radius | Overlay |
|---|---|---|---|---|---|---|---|---|
| Classic wedding | `classic` | `#2E5A4C` | `#2E5A4C` | `#FAFAF7` | `#1A1A18` | `#FFFFFF` | `8px` | sage-to-dark |
| Baptism | `classic` | `#3D6B5C` | `#3D6B5C` | `#F7F4EE` | `#1A1A18` | `#FFFFFF` | `8px` | light sage |
| Birthday / Party | `birthday` | `#1A1A18` | `#D4A574` | `#FFFFFF` | `#1A1A18` | `#F5F5F5` | `4px` | charcoal 135° |
| Romantic wedding | `romantic` | `#8B4557` | `#8B4557` | `#FFF5F5` | `#2D1F24` | `#FFFFFF` | `12px` | rose-to-dark |

Fonts: display **Literata** (wedding/baptism), **Inter** for birthday display+body. Body **Inter** everywhere.

Hand-off: screenshots + this table are enough. Do not paste Figma CSS into production.
