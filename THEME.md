# Parish colours

The entire application, including priest administration, uses the theme in
`src/app/globals.css`. Change the three `--parish-*` base colours there to update
the palette everywhere:

- White: `#ffffff` — cards and light text on dark backgrounds.
- Sky blue: `#87ceeb` — accents, selected surfaces, decorative details.
- Deep blue: `#164e78` — text, primary buttons, navigation and focus indicators.

Background, soft surface, border, muted text and accent text tokens are mixes of
those three colours. They are not additional independent palette choices.

Use named Tailwind utilities such as `bg-white`, `bg-background`, `bg-soft`,
`text-ink`, `text-muted`, `text-accent-ink`, `border-line` and `bg-accent`.
Use `text-accent` on dark blue backgrounds. Sky blue is too light for body text
on white; use `text-accent-ink` there. Use `text-ink` on sky blue buttons.

Shared button, input and status styles live in `src/components/ui/styles.js`.
Statuses use text, icons and border treatments rather than extra palette colours.
Avoid raw hex colours, built-in colour families or per-page palette definitions.
The church photograph and uploaded content retain their original colours.
