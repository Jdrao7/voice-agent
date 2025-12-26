"use client";

import { Wifi, Activity, Battery } from "lucide-react";

export function SystemStatus() {
    return (
        <div className="absolute top-6 right-8 flex items-center gap-4 text-nova-dim font-mono text-xs">
            <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span>ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-pulse" />
                <span>AI CORE: ACTIVE</span>
            </div>
            <div className="h-4 w-[1px] bg-nova-border" />
            <div className="text-nova-cyan">
                V.2.0.1
            </div>
        </div>
    );
}
