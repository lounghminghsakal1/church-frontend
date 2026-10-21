import "./globals.css";
import { AuthPriestProvider } from "@/hooks/useAuthPriest";
import { Toaster } from "sonner";
import { AuthUserProvider } from "@/hooks/useAuthUser";

export const metadata = {
  title: { default: "St. Antony’s Church | Illuppur", template: "%s | St. Antony’s Church" },
  description: "Connect with St. Antony’s Roman Catholic parish in Illuppur. Request sacraments, share Mass intentions, and arrange a meeting with the parish priest.",
};

export default function RootLayout({ children }) {

  return (
    <html
      lang="en"
      className="h-full scroll-smooth scroll-pt-24 antialiased selection:bg-accent/40 selection:text-ink motion-reduce:scroll-auto [&_*:focus-visible]:outline-2 [&_*:focus-visible]:outline-offset-2 [&_*:focus-visible]:outline-ink [&_button:not(:disabled)]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:min-h-12 [&_select]:cursor-pointer [&_input:not([type=checkbox]):not([type=radio]):not([type=file])]:min-h-12 [&_textarea]:min-h-28"
    >
      <body className="flex min-h-full flex-col bg-background font-sans leading-relaxed text-foreground">
        <AuthPriestProvider>
          <AuthUserProvider>
            <div className="flex-1">
              {children}
            </div>
          </AuthUserProvider>
        </AuthPriestProvider>
        <Toaster />
      </body>
    </html>
  );
}
