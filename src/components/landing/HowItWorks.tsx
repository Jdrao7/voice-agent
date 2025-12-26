"use client";

import { motion } from "framer-motion";
import { Mic, Brain, Volume2, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Mic,
        title: "User Speaks",
        description: "Customer holds the button and asks their question in natural language.",
        color: "purple",
    },
    {
        number: "02",
        icon: Brain,
        title: "AI Understands",
        description: "Our AI transcribes, understands context, and generates a helpful response.",
        color: "blue",
    },
    {
        number: "03",
        icon: Volume2,
        title: "Voice Responds",
        description: "The response is spoken back naturally, creating a seamless conversation.",
        color: "cyan",
    },
];

export function HowItWorks() {
    return (
        <section className="how-it-works-section">
            <div className="section-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="section-header"
                >
                    <span className="section-badge">How It Works</span>
                    <h2 className="section-title">
                        Simple as a
                        <span className="gradient-text"> conversation</span>
                    </h2>
                    <p className="section-description">
                        No complex setup. No training required. Just natural voice interaction
                        that your customers will love.
                    </p>
                </motion.div>

                <div className="steps-container">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="step-card"
                        >
                            <div className={`step-number step-number-${step.color}`}>
                                {step.number}
                            </div>
                            <div className={`step-icon step-icon-${step.color}`}>
                                <step.icon className="icon" />
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>

                            {index < steps.length - 1 && (
                                <div className="step-arrow">
                                    <ArrowRight />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
