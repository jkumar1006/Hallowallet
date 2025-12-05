import "./globals.css";
import type { ReactNode } from "react";
import { SpookyProvider } from "../lib/spookyTheme";
import { LanguageProvider } from "../contexts/LanguageContext";

export const metadata = {
  title: "Hallowallet",
  description: "Your smart, spooky money assistant."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0">
        <LanguageProvider>
          <SpookyProvider>{children}</SpookyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
