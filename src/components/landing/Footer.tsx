"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <Sparkles className="logo-icon" />
                            <span className="logo-text">VoiceAI</span>
                            <span className="logo-pro">Pro</span>
                        </Link>
                        <p className="footer-tagline">
                            AI-powered customer support that speaks your language.
                        </p>
                    </div>

                    <div className="footer-links-grid">
                        <div className="footer-links-column">
                            <h4>Product</h4>
                            <Link href="#features">Features</Link>
                            <Link href="#pricing">Pricing</Link>
                            <Link href="/chat">Demo</Link>
                            <Link href="#">API Docs</Link>
                        </div>
                        <div className="footer-links-column">
                            <h4>Company</h4>
                            <Link href="#">About</Link>
                            <Link href="#">Blog</Link>
                            <Link href="#">Careers</Link>
                            <Link href="#">Contact</Link>
                        </div>
                        <div className="footer-links-column">
                            <h4>Legal</h4>
                            <Link href="#">Privacy</Link>
                            <Link href="#">Terms</Link>
                            <Link href="#">Security</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} VoiceAI Pro. All rights reserved.</p>
                    <p className="footer-made-with">
                        Made with ❤️ using Next.js & Groq
                    </p>
                </div>
            </div>
        </footer>
    );
}
