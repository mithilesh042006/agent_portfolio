import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import AnimatedBackground from "@/components/AnimatedBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mithilesh | Full-Stack Developer",
    template: "%s | Mithilesh",
  },
  description: "Full-Stack Developer passionate about building beautiful, functional, and scalable web applications. Explore my projects, skills, and experience.",
  keywords: ["Full-Stack Developer", "React", "Next.js", "TypeScript", "Portfolio"],
  authors: [{ name: "Mithilesh" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mithilesh Portfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AnimatedBackground />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}


