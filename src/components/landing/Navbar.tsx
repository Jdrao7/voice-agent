"use client";

import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-logo">
                    <Sparkles className="logo-icon" />
                    <span className="logo-text">VoiceAI</span>
                    <span className="logo-pro">Pro</span>
                </Link>

                {/* Desktop nav */}
                <div className="navbar-links">
                    <Link href="#features" className="nav-link">Features</Link>
                    <Link href="#how-it-works" className="nav-link">How It Works</Link>
                    <Link href="#pricing" className="nav-link">Pricing</Link>
                    <Link href="/chat" className="nav-link">Demo</Link>
                </div>

                <div className="navbar-actions">
                    <Link href="/chat" className="btn-nav-primary">
                        Try Free
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mobile-menu"
                >
                    <Link href="#features" className="mobile-link" onClick={() => setIsOpen(false)}>
                        Features
                    </Link>
                    <Link href="#how-it-works" className="mobile-link" onClick={() => setIsOpen(false)}>
                        How It Works
                    </Link>
                    <Link href="#pricing" className="mobile-link" onClick={() => setIsOpen(false)}>
                        Pricing
                    </Link>
                    <Link href="/chat" className="mobile-link" onClick={() => setIsOpen(false)}>
                        Demo
                    </Link>
                    <Link href="/chat" className="btn-mobile-primary" onClick={() => setIsOpen(false)}>
                        Try Free
                    </Link>
                </motion.div>
            )}
        </nav>
    );
}
