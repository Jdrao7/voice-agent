"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTA() {
    return (
        <section className="cta-section">
            <div className="cta-bg-gradient" />

            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="cta-card"
                >
                    <div className="cta-content">
                        <div className="cta-icon">
                            <Sparkles />
                        </div>
                        <h2 className="cta-title">
                            Ready to transform your
                            <span className="gradient-text"> customer support?</span>
                        </h2>
                        <p className="cta-description">
                            Join thousands of businesses using VoiceAI Pro to deliver
                            exceptional support experiences. Start your free trial today.
                        </p>
                        <div className="cta-buttons">
                            <Link href="/chat" className="btn-primary btn-large">
                                Start Free Trial
                                <ArrowRight className="btn-icon" />
                            </Link>
                            <span className="cta-note">No credit card required</span>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="cta-decoration">
                        <div className="decoration-circle decoration-circle-1" />
                        <div className="decoration-circle decoration-circle-2" />
                        <div className="decoration-circle decoration-circle-3" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
