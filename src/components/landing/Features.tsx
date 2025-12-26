"use client";

import { motion } from "framer-motion";
import { Mic, MessageSquare, Zap, Shield, Globe, Sparkles } from "lucide-react";

const features = [
    {
        icon: Mic,
        title: "Voice-First AI",
        description: "Natural voice conversations that feel human. Push-to-talk simplicity.",
        gradient: "from-purple-500 to-violet-600",
    },
    {
        icon: MessageSquare,
        title: "Multi-Modal Chat",
        description: "Seamlessly switch between voice and text. Whatever works for your users.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Sub-4 second response times. Powered by Groq's blazing-fast inference.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: Shield,
        title: "Enterprise Ready",
        description: "SOC 2 compliant infrastructure. Your data stays secure.",
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        icon: Globe,
        title: "Embeddable Widget",
        description: "One line of code. Works on any website. Instant deployment.",
        gradient: "from-pink-500 to-rose-500",
    },
    {
        icon: Sparkles,
        title: "Custom Personas",
        description: "Train your AI to match your brand voice. Unlimited personalities.",
        gradient: "from-indigo-500 to-purple-500",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

export function Features() {
    return (
        <section className="features-section">
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="section-header"
                >
                    <span className="section-badge">Features</span>
                    <h2 className="section-title">
                        Everything you need for
                        <span className="gradient-text"> AI-powered support</span>
                    </h2>
                    <p className="section-description">
                        Built for businesses that care about customer experience.
                        Powerful enough for enterprises, simple enough for startups.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="features-grid"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            className="feature-card"
                        >
                            <div className={`feature-icon bg-gradient-to-br ${feature.gradient}`}>
                                <feature.icon className="icon" />
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
