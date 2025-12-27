import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "PersonaVoice AI | Voice Agent Platform",
    description: "AI voice agents that handle calls, log orders, and seamlessly hand off to humans",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
