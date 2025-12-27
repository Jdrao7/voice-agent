"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, Loader2 } from "lucide-react";

export default function HomePage() {
    const router = useRouter();

    // Redirect to staff dashboard
    useEffect(() => {
        router.push("/dashboard");
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-app-primary/20 mb-4">
                    <Phone className="h-8 w-8 text-app-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                    PersonaVoice AI
                </h1>
                <p className="text-gray-500 mb-6 flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to Staff Dashboard...
                </p>
            </div>
        </div>
    );
}
