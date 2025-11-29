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
  title: {
    default: "VTM Admin - Digital Marketing & Web Development Agency",
    template: "%s | VTM Admin"
  },
  description: "Vanur Media is a leading digital marketing and web development agency specializing in custom web applications, mobile apps, SEO optimization, and innovative digital solutions for businesses worldwide.",
  keywords: [
    "digital marketing agency",
    "web development",
    "mobile app development",
    "SEO services",
    "custom software development",
    "UI/UX design",
    "e-commerce solutions",
    "cloud services",
    "digital transformation",
    "Vanur Media"
  ],
  authors: [{ name: "Vanur Media", url: "https://vanurmedia.com" }],
  creator: "Vanur Media",
  publisher: "Vanur Media",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    }
  },
  verification: {
    google: "your-google-verification-code",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
