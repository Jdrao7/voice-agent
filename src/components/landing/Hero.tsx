"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import the 3D component to avoid SSR issues
const HeroOrb = dynamic(
    () => import("@/components/3d/HeroOrb").then((mod) => mod.HeroOrb),
    { ssr: false }
);

export function Hero() {
    return (
        <section className="hero-section">
            {/* Background gradient */}
            <div className="hero-bg-gradient" />

            {/* Grid pattern */}
            <div className="hero-grid-pattern" />

            <div className="hero-container">
                {/* Left content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hero-content"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="hero-badge"
                    >
                        <span className="badge-dot" />
                        <span>Powered by Groq AI</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="hero-title"
                    >
                        Customer Support
                        <br />
                        <span className="gradient-text">That Speaks</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="hero-description"
                    >
                        Transform your customer experience with AI voice agents that
                        understand context, speak naturally, and resolve issues instantly.
                        No hold times. No frustration. Just conversations.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="hero-buttons"
                    >
                        <Link href="/chat" className="btn-primary">
                            Try Demo
                            <ArrowRight className="btn-icon" />
                        </Link>
                        <button className="btn-secondary">
                            <Play className="btn-icon-left" />
                            Watch Video
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="hero-stats"
                    >
                        <div className="stat">
                            <span className="stat-value">4s</span>
                            <span className="stat-label">Avg Response</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat">
                            <span className="stat-value">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat">
                            <span className="stat-value">50+</span>
                            <span className="stat-label">Languages</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right 3D orb */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                    className="hero-orb-wrapper"
                >
                    <HeroOrb />
                </motion.div>
            </div>
        </section>
    );
}
