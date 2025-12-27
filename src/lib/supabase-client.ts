// Supabase client for real-time subscriptions (client-side)
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { Call } from "./types";

let supabaseClient: ReturnType<typeof createClient> | null = null;

// Get or create Supabase client (for browser)
export function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.warn("Supabase not configured - real-time disabled");
        return null;
    }

    supabaseClient = createClient(url, anonKey);
    return supabaseClient;
}

// Subscribe to real-time call updates
export function subscribeToCallUpdates(
    onInsert: (call: Call) => void,
    onUpdate: (call: Call) => void
): RealtimeChannel | null {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const channel = supabase
        .channel("calls-realtime")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "calls",
            },
            (payload) => {
                console.log("[Realtime] New call:", payload.new);
                onInsert(payload.new as Call);
            }
        )
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "calls",
            },
            (payload) => {
                console.log("[Realtime] Call updated:", payload.new);
                onUpdate(payload.new as Call);
            }
        )
        .subscribe((status) => {
            console.log("[Realtime] Subscription status:", status);
        });

    return channel;
}

// Unsubscribe from channel
export function unsubscribeFromChannel(channel: RealtimeChannel) {
    const supabase = getSupabaseClient();
    if (supabase && channel) {
        supabase.removeChannel(channel);
    }
}
