"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Brain, Volume2, Sparkles, Zap, Shield } from "lucide-react";

// Dynamically import Scene to avoid SSR issues
const Scene = dynamic(
  () => import("@/components/canvas/Scene").then((mod) => mod.Scene),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-nova-bg">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Scene active={false} />
      </div>

      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* Content */}
      <div className="relative z-20">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-nova-bg/50 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-nova-purple" />
              <span className="text-xl font-bold text-white">
                NOVA
                <span className="ml-1 text-xs text-nova-purple">AI</span>
              </span>
            </div>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-nova-purple to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(112,0,255,0.4)]"
            >
              Try Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-nova-purple/30 bg-nova-purple/10 px-4 py-2 text-sm text-nova-purple"
            >
              <Zap className="h-4 w-4" />
              Powered by Groq AI
            </motion.div>

            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
              Customer Support
              <br />
              <span className="bg-gradient-to-r from-nova-purple via-indigo-400 to-nova-cyan bg-clip-text text-transparent">
                That Speaks
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg text-gray-400">
              AI voice agents that understand, respond, and resolve.
              No wait times. No frustration. Just conversations.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/chat"
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-nova-purple to-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(112,0,255,0.5)]"
              >
                <Mic className="h-5 w-5" />
                Start Talking
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="relative py-32">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-white">
                How It Works
              </h2>
              <p className="text-lg text-gray-400">
                Three simple steps to AI-powered support
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Mic,
                  title: "You Speak",
                  description: "Just talk naturally. Our AI listens and understands context.",
                  color: "from-purple-500 to-violet-600",
                },
                {
                  icon: Brain,
                  title: "AI Thinks",
                  description: "Powered by LLaMA 3.3 70B. Lightning-fast reasoning.",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Volume2,
                  title: "Nova Responds",
                  description: "Natural voice response in under 4 seconds.",
                  color: "from-cyan-500 to-teal-500",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-3xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12 backdrop-blur-sm"
            >
              <Shield className="mx-auto mb-6 h-12 w-12 text-nova-purple" />
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Ready to Transform Support?
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-gray-400">
                Experience the future of customer interaction.
                No credit card. No setup. Just start talking.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-nova-purple to-indigo-600 px-10 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(112,0,255,0.5)]"
              >
                Launch Demo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
            <p>
              Built with Next.js, Three.js, and Groq AI.
              <span className="mx-2">•</span>
              © {new Date().getFullYear()} Nova AI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
