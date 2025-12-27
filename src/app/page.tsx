"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Mic, Brain, Volume2, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

// Dynamically import Scene to avoid SSR issues
const Scene = dynamic(
  () => import("@/components/canvas/Scene").then((mod) => mod.Scene),
  { ssr: false }
);

// Floating orb nodes for features
function FeatureNode({
  feature,
  index,
  total
}: {
  feature: { icon: typeof Mic; title: string; description: string; color: string };
  index: number;
  total: number;
}) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 180;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.15, type: "spring", stiffness: 100 }}
      className="absolute"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="group relative -translate-x-1/2 -translate-y-1/2"
      >
        {/* Glow */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${feature.color} opacity-30 blur-xl group-hover:opacity-50 transition-opacity`} />

        {/* Node */}
        <div className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${feature.color} shadow-2xl`}>
          <Icon className="h-8 w-8 text-white" />
        </div>

        {/* Label */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-sm font-semibold text-white whitespace-nowrap">{feature.title}</p>
          <p className="text-xs text-gray-400 max-w-[140px]">{feature.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Connection lines between features
function ConnectionLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(112, 0, 255, 0.3)" />
          <stop offset="50%" stopColor="rgba(0, 240, 255, 0.3)" />
          <stop offset="100%" stopColor="rgba(112, 0, 255, 0.3)" />
        </linearGradient>
      </defs>
      <circle
        cx="50%"
        cy="50%"
        r="180"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="1"
        strokeDasharray="8 8"
        className="animate-[spin_30s_linear_infinite]"
      />
    </svg>
  );
}

// Animated particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-nova-purple/40 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set((e.clientX - centerX) / 30);
      mouseY.set((e.clientY - centerY) / 30);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const features = [
    {
      icon: Mic,
      title: "Natural Speech",
      description: "Just talk naturally",
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: Brain,
      title: "AI Reasoning",
      description: "LLaMA 3.3 70B powered",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Volume2,
      title: "Voice Response",
      description: "Sub-4s latency",
      color: "from-cyan-500 to-teal-500",
    },
  ];

  return (
    <div className="page-landing relative min-h-screen bg-nova-bg">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 gradient-mesh opacity-50" />

      {/* Animated blobs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-nova-purple/20 blob blur-3xl animate-pulse-glow" />
      <div className="fixed bottom-1/4 -right-32 w-80 h-80 bg-nova-cyan/15 blob blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      {/* 3D Background - positioned uniquely */}
      <div className="fixed right-0 top-0 w-full h-full md:w-[60%] opacity-60 md:opacity-100">
        <Scene active={false} />
      </div>

      {/* Vignette */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_top_left,transparent_0%,rgba(0,0,0,0.8)_70%)]" />

      {/* Content */}
      <div className="relative z-20">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 safe-top">
          <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-nova-purple/50 blur-lg" />
                <Sparkles className="relative h-5 w-5 md:h-6 md:w-6 text-nova-purple" />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">
                NOVA
                <span className="ml-1 text-[10px] md:text-xs text-nova-purple font-mono">AI</span>
              </span>
            </div>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 md:gap-2 rounded-full bg-white/5 border border-white/10 px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-nova-purple/50"
            >
              Launch
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Link>
          </div>
        </nav>

        {/* Hero Section - Asymmetric */}
        <section className="flex min-h-screen items-center px-4 md:px-8 lg:px-16 pt-20 md:pt-16">
          <div className="mx-auto max-w-7xl w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 items-center">
              {/* Left: Text Content */}
              <motion.div
                style={{ x, y }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-nova-purple/20 bg-nova-purple/5 px-3 py-1.5 text-xs text-nova-purple mb-6"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nova-purple opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-nova-purple"></span>
                  </span>
                  Voice AI Infrastructure
                </motion.div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6">
                  <span className="block">Support that</span>
                  <span className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-nova-purple via-purple-400 to-nova-cyan bg-clip-text text-transparent">
                      actually listens
                    </span>
                    <motion.span
                      className="absolute -inset-1 bg-gradient-to-r from-nova-purple/20 to-nova-cyan/20 blur-2xl"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </span>
                </h1>

                <p className="text-base md:text-lg text-gray-400 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                  Zero hold times. Natural conversations.
                  AI that understands context, not just keywords.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    href="/chat"
                    className="group relative overflow-hidden rounded-full bg-gradient-to-r from-nova-purple to-indigo-600 px-8 py-4 text-base font-semibold text-white transition-all hover:shadow-[0_0_40px_rgba(112,0,255,0.5)]"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Start Conversation
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-nova-cyan"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-nova-bg" />
                      ))}
                    </div>
                    <span>Join 2k+ users</span>
                  </div>
                </div>
              </motion.div>

              {/* Right: Feature Constellation (Desktop only) */}
              <div className="hidden lg:block relative h-[500px]">
                <ConnectionLines />
                {features.map((feature, i) => (
                  <FeatureNode key={feature.title} feature={feature} index={i} total={features.length} />
                ))}
                {/* Center pulse */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    className="h-4 w-4 rounded-full bg-nova-cyan"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Features - Card strip */}
            <div className="lg:hidden mt-12 overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                {features.map((feature, i) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-shrink-0 w-[200px] rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm"
                    >
                      <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3`}>
                        <FeatureIcon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-400">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-32 px-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-4 md:gap-8"
            >
              {[
                { value: "<4s", label: "Response time" },
                { value: "70B", label: "Parameters" },
                { value: "24/7", label: "Availability" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-nova-purple to-nova-cyan bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform
              <br />
              <span className="text-gray-500">customer experience?</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              No credit card. No setup complexity.
              Just start talking.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-white text-nova-bg px-8 py-4 text-base font-semibold transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              Try Nova Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 md:py-8 px-4">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>Built with Next.js, Three.js & Groq</p>
            <p>© {new Date().getFullYear()} Nova AI</p>
          </div>
        </footer>
      </div>

      {/* Particles overlay */}
      <Particles />
    </div>
  );
}
