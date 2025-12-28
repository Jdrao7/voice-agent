"use client";

import { motion } from "framer-motion";

const shapes = [
    { type: "circle", size: 300, x: "10%", y: "20%", duration: 20, delay: 0 },
    { type: "circle", size: 200, x: "80%", y: "60%", duration: 25, delay: 2 },
    { type: "circle", size: 150, x: "60%", y: "10%", duration: 18, delay: 1 },
    { type: "circle", size: 250, x: "30%", y: "70%", duration: 22, delay: 3 },
    { type: "square", size: 180, x: "75%", y: "25%", duration: 24, delay: 1.5 },
    { type: "square", size: 120, x: "15%", y: "55%", duration: 19, delay: 2.5 },
    { type: "triangle", size: 160, x: "50%", y: "40%", duration: 21, delay: 0.5 },
    { type: "triangle", size: 100, x: "85%", y: "80%", duration: 17, delay: 3.5 },
];

const floatingDots = Array.from({ length: 20 }, (_, i) => ({
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
}));

export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Gradient Orbs */}
            {shapes.map((shape, index) => (
                <motion.div
                    key={index}
                    className="absolute"
                    style={{
                        left: shape.x,
                        top: shape.y,
                        width: shape.size,
                        height: shape.size,
                    }}
                    animate={{
                        x: [0, 30, -20, 10, 0],
                        y: [0, -20, 30, -10, 0],
                        rotate: shape.type === "square" ? [0, 90, 180, 270, 360] : [0, 10, -10, 5, 0],
                        scale: [1, 1.05, 0.95, 1.02, 1],
                    }}
                    transition={{
                        duration: shape.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: shape.delay,
                    }}
                >
                    {shape.type === "circle" && (
                        <div
                            className="w-full h-full rounded-full"
                            style={{
                                background: `radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 50%, transparent 70%)`,
                            }}
                        />
                    )}
                    {shape.type === "square" && (
                        <div
                            className="w-full h-full rounded-3xl"
                            style={{
                                background: `linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(147, 51, 234, 0.03) 100%)`,
                                border: "1px solid rgba(99, 102, 241, 0.08)",
                            }}
                        />
                    )}
                    {shape.type === "triangle" && (
                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-10">
                            <polygon
                                points="50,10 90,90 10,90"
                                fill="url(#triangleGradient)"
                            />
                            <defs>
                                <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}
                </motion.div>
            ))}

            {/* Floating Dots */}
            {floatingDots.map((dot, index) => (
                <motion.div
                    key={`dot-${index}`}
                    className="absolute rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/20"
                    style={{
                        left: dot.x,
                        top: dot.y,
                        width: dot.size,
                        height: dot.size,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: dot.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: dot.delay,
                    }}
                />
            ))}

            {/* Animated Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
                <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(99, 102, 241)" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Gradient Mesh Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 40% at 80% 20%, rgba(147, 51, 234, 0.04) 0%, transparent 50%),
                        radial-gradient(ellipse 70% 60% at 60% 80%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)
                    `,
                }}
            />
        </div>
    );
}
