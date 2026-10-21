# Parish colour and layout system

The entire application, including the priest portal, uses the semantic tokens in
`src/app/globals.css`.

- Forest green `#214e43`: primary actions, navigation, headings and the hero.
- Warm ivory `#f8f6f0`: page background.
- White `#ffffff`: cards, forms and text on dark surfaces.
- Muted brass `#d2b982`: accents, selected borders and focus rings.
- Pale sage `#eeefe6`: supporting sections and selected surfaces.
- Charcoal green `#293c34`: body text.
- Muted green `#5f6d64`: secondary text.
- Deep brass `#715c34`: readable accent text on light backgrounds.
- Soft border `#d4dacf`: dividers and input boundaries.
- Darker forest `#183c33`: primary hover states.

Use semantic Tailwind utilities (`bg-background`, `bg-white`, `bg-soft`,
`bg-ink`, `text-foreground`, `text-ink`, `text-muted`, `text-accent-ink`,
`border-line` and `bg-accent`). Brass is an accent rather than body text on
white. Use `text-accent-ink` on light backgrounds and `text-accent` on forest.
Photographs, uploaded content and the church illustration retain their colours.

Shared buttons, fields and status styles live in `src/components/ui/styles.js`.
Primary actions remain forest green on hover. Statuses also have text and icons.
Avoid per-page palettes or raw colour values outside the central theme.

The public homepage uses `src/components/pages_components/parish.module.css`.
Priest availability comes immediately below navigation, followed by the short
illustrated hero and announcements. Service cards have white surfaces, visible
borders and spacing against a pale sage section background.

Headings use Georgia and interface text uses the system sans-serif stack.
Mobile fields remain 16px and controls are at least 44px tall. Navigation stays
compact on phones. Motion respects the reduced-motion preference.

Announcement start/end dates control publication visibility, not event dates.
Do not invent schedules or expose unpublished announcements as upcoming events.
The generated banner's references and original prompt are recorded in
`public/images/church/GENERATION.md`; the original photograph is preserved.

On phones, image-backed announcements, service cards, priest request summaries,
request details and the priest profile use a vertical flow. Test announcement
layouts with images as well as text-only notices. Keep priest availability above
the hero; its mobile identity, status and actions stack without tiny button text.

Date and date/time fields use `DateTimePicker`. It provides a calendar, month/year
navigation, keyboard day selection, and 12-hour time entry. Phone dialogs use a
bottom sheet with Date/Time steps and a compact layout for short screens. Values
are committed only with Apply; Cancel and Escape preserve the existing value.
Birth dates remain `YYYY-MM-DD`; datetime fields emit `YYYY-MM-DDTHH:mm`, with
seconds for `step="1"`. Existing form validation and IST-to-ISO API conversion
stay in the consuming forms. No UTC conversion happens inside the picker.
