import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noir Hair Studios",
  description: "Experience the art of grooming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${playfair.variable} antialiased bg-richblack-900 text-gold-100`}
      >
        {children}
        <FeedbackWidget />
      </body>
    </html>
  );
}
