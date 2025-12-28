"use client";

import { motion } from "framer-motion";
import { Phone, ArrowRight, Headphones, Sparkles, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function HomePage() {
    const phoneNumber = "001-320-307-7764";
    const rawPhoneNumber = "0013203077764";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-xl text-slate-800">PersonaVoice</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-medium text-sm"
                    >
                        Staff Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Voice Assistant
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6"
                    >
                        Order with a<br />
                        <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Simple Call
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-600 max-w-2xl mx-auto mb-12"
                    >
                        Our AI assistant handles your orders 24/7. Just call, speak naturally,
                        and let our intelligent system take care of the rest.
                    </motion.p>

                    {/* Phone Number Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative inline-block"
                    >
                        {/* Background Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-xl" />

                        {/* Card */}
                        <div className="relative bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/50">
                            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-4">
                                <Phone className="w-4 h-4" />
                                Call us now
                            </div>

                            <a
                                href={`tel:${rawPhoneNumber}`}
                                className="block text-4xl md:text-5xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors"
                            >
                                {phoneNumber}
                            </a>

                            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Clock className="w-4 h-4 text-green-500" />
                                    <span>Available 24/7</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Instant Response</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-12"
                    >
                        <a
                            href={`tel:${rawPhoneNumber}`}
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all"
                        >
                            <Phone className="w-5 h-5" />
                            Call Now
                        </a>
                    </motion.div>
                </div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="max-w-5xl mx-auto mt-32 grid md:grid-cols-3 gap-8"
                >
                    {[
                        {
                            icon: Headphones,
                            title: "Natural Conversations",
                            description: "Speak naturally in your own language. Our AI understands context and nuance."
                        },
                        {
                            icon: Clock,
                            title: "Always Available",
                            description: "24 hours a day, 7 days a week. Never miss an order again."
                        },
                        {
                            icon: CheckCircle,
                            title: "Accurate Orders",
                            description: "Every detail captured correctly. Confirmation before we process."
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 border border-slate-200/50 shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mb-5">
                                <feature.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/50 py-8 px-6 bg-white/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <Headphones className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-slate-500">© 2024 PersonaVoice AI</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
                    >
                        Staff Portal →
                    </Link>
                </div>
            </footer>
        </div>
    );
}
