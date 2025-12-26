"use client";

import { Canvas } from "@react-three/fiber";
import { NeuralOrb } from "./NeuralOrb";
import { StarField } from "./StarField";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";

interface SceneProps {
    active?: boolean;
}

export function Scene({ active }: SceneProps) {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]} // Handle high-dpi screens
        >
            <Suspense fallback={null}>
                <Environment preset="city" />
                <ambientLight intensity={0.2} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.5}
                    penumbra={1}
                    intensity={1}
                    color="#00f0ff"
                />
                <pointLight position={[-10, -5, -10]} intensity={0.5} color="#7000ff" />

                <NeuralOrb active={active} />
                <StarField />
            </Suspense>
        </Canvas>
    );
}
