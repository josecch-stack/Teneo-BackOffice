import type { Metadata } from "next";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Teneo Pet brand typeface — see Figma design tokens
// (typography/font-family/primary).
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teneo Pet — Panel de Administración",
  description: "Panel de administración de Teneo Pet",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Set by proxy.ts on every request — lets next-themes nonce the one inline
  // <script> this app renders (FOUC-prevention theme script) so it's allowed
  // under the CSP's script-src without needing 'unsafe-inline'.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="es"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          nonce={nonce}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
