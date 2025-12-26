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
  title: "VoiceAI Pro - AI-Powered Customer Support",
  description:
    "Transform your customer experience with AI voice agents that understand context, speak naturally, and resolve issues instantly. No hold times. No frustration.",
  keywords: [
    "AI customer support",
    "voice assistant",
    "chatbot",
    "speech-to-text",
    "text-to-speech",
    "Groq",
    "customer service",
  ],
  authors: [{ name: "VoiceAI Pro" }],
  openGraph: {
    title: "VoiceAI Pro - AI-Powered Customer Support",
    description:
      "Transform your customer experience with AI voice agents that understand context, speak naturally, and resolve issues instantly.",
    type: "website",
    siteName: "VoiceAI Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceAI Pro - AI-Powered Customer Support",
    description:
      "Transform your customer experience with AI voice agents.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
