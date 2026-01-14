import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TimerProvider } from "@/contexts/timer-context";
import { WorkflowProvider } from "@/contexts/workflow-context";
import { FloatingTimerIsland } from "@/components/floating-timer-island";
import { SessionRecoveryDialog } from "@/components/session-recovery-dialog";
import { WorkflowGuideCompact } from "@/components/workflow-guide";
import { CoachPrompt } from "@/components/coach-prompt";

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
        <TimerProvider>
          <WorkflowProvider>
            {children}
            {/* Global Floating Elements */}
            <FloatingTimerIsland />
            <WorkflowGuideCompact />
            <SessionRecoveryDialog />
            <CoachPrompt />
            <Toaster />
          </WorkflowProvider>
        </TimerProvider>
      </body>
    </html>
  );
}
