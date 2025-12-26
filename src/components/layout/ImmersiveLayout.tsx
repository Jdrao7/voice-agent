import { ReactNode } from "react";

interface ImmersiveLayoutProps {
    children: ReactNode;
}

export function ImmersiveLayout({ children }: ImmersiveLayoutProps) {
    return (
        <div className="relative h-screen w-screen overflow-hidden bg-nova-bg">
            {/* 3D Scene Container (Background) */}
            <div className="absolute inset-0 z-0">
                {/* We will mount the Canvas here in page.tsx to keep context clean */}
            </div>

            {/* 2D HUD Interface (Foreground) */}
            <div className="relative z-10 h-full w-full pointer-events-none">
                {/* Pointer events are re-enabled on interactive children */}
                {children}
            </div>

            {/* Vignette Overlay for deeper immersion */}
            <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        </div>
    );
}
