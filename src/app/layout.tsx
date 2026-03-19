import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kora Terminal",
  description: "Live Web3 Data Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-cyan-500/30 min-h-screen relative overflow-x-hidden`}
      >
        <div className="fixed top-[-50%] left-[-20%] w-[150vw] h-[150vh] -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#000000] to-[#000000] opacity-80 pointer-events-none" />
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <a href="/dashboard" className="text-lg font-semibold tracking-tight text-white">
              Kora
            </a>
            <nav className="flex items-center gap-3 text-sm text-zinc-200">
              <a
                href="/dashboard"
                className="rounded-full px-3 py-1 transition hover:bg-white/10"
              >
                Dashboard
              </a>
              <a
                href="/portfolio"
                className="rounded-full px-3 py-1 transition hover:bg-white/10"
              >
                Portfolio
              </a>
              <a
                href="/ai"
                className="rounded-full px-3 py-1 transition hover:bg-white/10"
              >
                AI Assistant
              </a>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
