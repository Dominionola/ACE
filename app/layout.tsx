import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

// ... existing code ...

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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
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
        {children}
      </body>
    </html>
  );
}

