import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Canon | Systems Over Willpower",
  description: "Daily wisdom from Profit. Systems, discipline, and execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}
        >
          <Providers>
            <SignedOut>
              <div className="flex min-h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-neutral-900">Canon</h1>
                  <p className="mt-2 text-neutral-600">Systems Over Willpower</p>
                  <div className="mt-6">
                    <SignInButton>
                      <button className="rounded bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
                        Sign In
                      </button>
                    </SignInButton>
                  </div>
                </div>
              </div>
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}