import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ACE - Master Your Exams",
  description: "The intelligent way to master your studies. ACE transforms your course materials into interactive study sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${newsreader.variable} antialiased font-serif bg-cream-50 text-ace-blue selection:bg-ace-blue selection:text-white overflow-x-hidden`}
      >
        <Header />
        {children}
        <Footer />

        {/* Decorative background gradients (Optimized) */}
        <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%]"
            style={{ background: 'radial-gradient(circle, rgba(219, 234, 254, 0.4) 0%, rgba(219, 234, 254, 0) 70%)' }}
          />
          <div
            className="absolute top-[20%] -right-[10%] w-[40%] h-[40%]"
            style={{ background: 'radial-gradient(circle, rgba(254, 252, 232, 0.5) 0%, rgba(254, 252, 232, 0) 70%)' }}
          />
        </div>
      </body>
    </html>
  );
}
