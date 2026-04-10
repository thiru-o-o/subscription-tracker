import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubTracker — Manage Your Subscriptions",
  description:
    "Track, manage and cancel your subscriptions and free trials in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="bg-gray-100 min-h-full flex justify-center" suppressHydrationWarning>
        {/* Mobile-constrained shell */}
        <div className="relative w-full max-w-[400px] min-h-screen bg-gray-50 flex flex-col shadow-2xl">
          {/* Page content — padded at bottom to clear BottomNav */}
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>

          {/* Persistent bottom navigation */}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
