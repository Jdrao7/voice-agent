"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

interface NeuralOrbProps {
    active?: boolean;
}

export function NeuralOrb({ active = false }: NeuralOrbProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshDistortMaterial>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Rotation
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
        }

        if (materialRef.current) {
            // Pulse effect based on active state
            const targetDistort = active ? 0.6 : 0.3;
            const targetSpeed = active ? 3 : 1.5;
            const targetColor = active ? new THREE.Color("#00f0ff") : new THREE.Color("#7000ff");

            materialRef.current.distort = THREE.MathUtils.lerp(
                materialRef.current.distort,
                targetDistort,
                0.05
            );
            materialRef.current.speed = THREE.MathUtils.lerp(
                materialRef.current.speed,
                targetSpeed,
                0.05
            );
            materialRef.current.color.lerp(targetColor, 0.05);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={meshRef} args={[1, 100, 100]} scale={2}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#7000ff"
                    attach="material"
                    distort={0.3}
                    speed={1.5}
                    roughness={0.2}
                    metalness={0.9} // Higher metalness for "tech" look
                    bumpScale={0.005}
                />
            </Sphere>

            {/* Inner Glow Core */}
            <pointLight
                distance={5}
                intensity={active ? 2 : 1}
                color={active ? "#00f0ff" : "#7000ff"}
            />
        </Float>
    );
}
