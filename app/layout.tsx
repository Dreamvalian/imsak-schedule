import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ramadhan Time Companion",
  description: "Elegant companion for Ramadhan imsak and iftar times",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-slate-950 text-slate-100 antialiased`}>
        {props.children}
      </body>
    </html>
  );
}
