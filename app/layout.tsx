import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
    default: "Portfolio | Data Science & Web Development",
    template: "%s | Portfolio",
  },
  description:
    "Personal portfolio showcasing data science projects, articles, and insights on machine learning, analytics, and web development.",
  openGraph: {
    title: "Portfolio | Data Science & Web Development",
    description:
      "Personal portfolio showcasing data science projects, articles, and insights on machine learning, analytics, and web development.",
    url: "https://your-domain.com",
    siteName: "Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Data Science & Web Development",
    description:
      "Personal portfolio showcasing data science projects, articles, and insights on machine learning, analytics, and web development.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
