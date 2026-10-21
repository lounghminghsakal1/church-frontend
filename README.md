This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mobile layout checks

Run `npm run build`, then `npm run start -- -p 3101`. In a second terminal, run
`npm run test:mobile` from the project root.

The audit discovers all page routes and checks 320px, 390px, 430px, 768px and
844px landscape viewports. It includes populated request lists, editing forms,
priest review panels, announcement editors, navigation and document/payment
dialogs. API calls use fixtures; no parish records are changed. Failures and
screenshots are saved to the temporary directory printed by the test.

Chrome defaults to its standard Windows installation path. Set
`REQUEST_UI_BROWSER` for another Chromium binary, or `REQUEST_UI_ORIGIN` for a
preview on another port. These checks use browser emulation; real-device testing
is still useful for native keyboards and document viewers.

With the same preview running, `npm run test:date-picker` checks calendar and time
selection, keyboard navigation, cancellation, minimum dates/times, nested dialogs,
and the meeting, announcement and priest-availability API payloads. Pure calendar
and date conversion checks run with
`node --test tests/date-time-picker.test.mjs tests/announcements.test.mjs`.
