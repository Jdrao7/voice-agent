"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StarField() {
    const count = 2000;
    const mesh = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const position = new Float32Array(count * 3);
        const color = new Float32Array(count * 3);
        const size = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spread evenly in a large sphere
            const r = 40 + Math.random() * 20;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            position[i * 3] = x;
            position[i * 3 + 1] = y;
            position[i * 3 + 2] = z;

            // Color variation between cyan and purple
            const c = new THREE.Color();
            c.setHSL(Math.random() > 0.5 ? 0.6 : 0.8, 0.8, 0.8);
            color[i * 3] = c.r;
            color[i * 3 + 1] = c.g;
            color[i * 3 + 2] = c.b;

            size[i] = Math.random() * 0.5;
        }
        return { position, color, size };
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            // Slow rotation for parallax feel
            mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles.position, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[particles.color, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
