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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthPriestProvider>
          <AuthUserProvider>
            <div className="flex-1">
              {children}
            </div>
          </AuthUserProvider>
        </AuthPriestProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
