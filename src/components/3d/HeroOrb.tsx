"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function AnimatedOrb() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 100, 100]} scale={2.2}>
            <MeshDistortMaterial
                color="#8b5cf6"
                attach="material"
                distort={0.4}
                speed={1.5}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

function FloatingParticles() {
    const count = 100;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return positions;
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
            mesh.current.rotation.x = state.clock.elapsedTime * 0.03;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#a855f7"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function GlowRings() {
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ring1.current) {
            ring1.current.rotation.x = Math.PI / 2;
            ring1.current.rotation.z = state.clock.elapsedTime * 0.5;
        }
        if (ring2.current) {
            ring2.current.rotation.x = Math.PI / 3;
            ring2.current.rotation.z = -state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <>
            <mesh ref={ring1}>
                <torusGeometry args={[3, 0.02, 16, 100]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
            </mesh>
            <mesh ref={ring2}>
                <torusGeometry args={[3.5, 0.015, 16, 100]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
            </mesh>
        </>
    );
}

export function HeroOrb() {
    return (
        <div className="hero-orb-container">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ background: "transparent" }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
                <pointLight position={[10, -10, 5]} intensity={0.5} color="#3b82f6" />

                <AnimatedOrb />
                <GlowRings />
                <FloatingParticles />
            </Canvas>

            {/* Glow effect overlay */}
            <div className="orb-glow" />
        </div>
    );
}
