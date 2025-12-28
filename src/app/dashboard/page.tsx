"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Phone,
    Clock,
    CheckCircle,
    AlertTriangle,
    ShoppingCart,
    RefreshCw,
    User,
    Bot,
    Volume2,
    PhoneIncoming,
    PhoneOff,
    Package,
} from "lucide-react";
import { Call, CallStatus, Order } from "@/lib/types";

// Mock data - replace with real API calls when Supabase is configured
const MOCK_CALLS: Call[] = [
    {
        id: "call-001",
        phone_number: "+1 555-0123",
        transcript: [
            { role: "assistant", content: "Hello! Thanks for calling. How can I help you today?", timestamp: Date.now() - 300000 },
            { role: "user", content: "Hi, I'd like to place an order for delivery", timestamp: Date.now() - 290000 },
            { role: "assistant", content: "I'd be happy to help you with that. What would you like to order?", timestamp: Date.now() - 280000 },
            { role: "user", content: "Two large pepperoni pizzas and a side of garlic bread", timestamp: Date.now() - 270000 },
            { role: "assistant", content: "Great choice! Two large pepperoni pizzas and garlic bread. Can I get your delivery address?", timestamp: Date.now() - 260000 },
            { role: "user", content: "123 Main Street, Apartment 4B", timestamp: Date.now() - 250000 },
            { role: "assistant", content: "Perfect. Your order total is $42.50. We'll have it there in about 30-40 minutes.", timestamp: Date.now() - 240000 },
        ],
        summary: "Order: 2x Large Pepperoni Pizza, 1x Garlic Bread. Delivery to 123 Main St, Apt 4B. Total: $42.50",
        intent: "order",
        status: "new",
        needs_human: false,
        created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
        id: "call-002",
        phone_number: "+1 555-0456",
        transcript: [
            { role: "assistant", content: "Hello! How can I assist you?", timestamp: Date.now() - 600000 },
            { role: "user", content: "My order arrived cold and I'm extremely disappointed!", timestamp: Date.now() - 590000 },
            { role: "user", content: "I want to speak to a manager right now!", timestamp: Date.now() - 580000 },
            { role: "assistant", content: "I completely understand your frustration. Let me connect you with a team member who can resolve this for you right away.", timestamp: Date.now() - 570000 },
        ],
        summary: "COMPLAINT: Order arrived cold. Customer very upset. Requested manager.",
        intent: "complaint",
        status: "escalated",
        needs_human: true,
        created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
        id: "call-003",
        phone_number: "+1 555-0789",
        transcript: [
            { role: "assistant", content: "Hello! Thanks for calling.", timestamp: Date.now() - 900000 },
            { role: "user", content: "What time do you close tonight?", timestamp: Date.now() - 890000 },
            { role: "assistant", content: "We're open until 10 PM tonight. Is there anything else I can help you with?", timestamp: Date.now() - 880000 },
            { role: "user", content: "No that's all, thanks!", timestamp: Date.now() - 870000 },
            { role: "assistant", content: "You're welcome! Have a great evening.", timestamp: Date.now() - 860000 },
        ],
        summary: "General inquiry: Asked about closing time",
        intent: "inquiry",
        status: "handled",
        needs_human: false,
        created_at: new Date(Date.now() - 900000).toISOString(),
    },
];

const STATUS_CONFIG: Record<CallStatus, {
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}> = {
    new: { bg: "bg-blue-500/20", text: "text-blue-400", icon: PhoneIncoming, label: "New" },
    handled: { bg: "bg-green-500/20", text: "text-green-400", icon: CheckCircle, label: "Handled" },
    escalated: { bg: "bg-red-500/20", text: "text-red-400", icon: AlertTriangle, label: "Escalated" },
    order_made: { bg: "bg-purple-500/20", text: "text-purple-400", icon: Package, label: "Order Made" },
};

export default function DashboardPage() {
    const [calls, setCalls] = useState<Call[]>([]);
    const [selectedCall, setSelectedCall] = useState<Call | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<CallStatus | "all">("all");
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRealtime, setIsRealtime] = useState(false);
    const [orderDetails, setOrderDetails] = useState<Order | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);

    // Load calls from API (initial load)
    const loadCalls = useCallback(async () => {
        try {
            const res = await fetch("/api/calls");
            const data = await res.json();
            if (data.calls) {
                setCalls(data.calls);
            }
            setLastUpdate(new Date());
        } catch (err) {
            console.error("Failed to load calls:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Real-time subscription for new calls
    useEffect(() => {
        loadCalls();

        // Try to set up Supabase Realtime
        const setupRealtime = async () => {
            try {
                const { subscribeToCallUpdates, unsubscribeFromChannel } = await import("@/lib/supabase-client");

                const channel = subscribeToCallUpdates(
                    // On new call
                    (newCall) => {
                        setCalls((prev) => [newCall, ...prev]);
                        setLastUpdate(new Date());
                    },
                    // On call update
                    (updatedCall) => {
                        setCalls((prev) =>
                            prev.map((c) => (c.id === updatedCall.id ? updatedCall : c))
                        );
                        // Update selected call if it's the one being updated
                        setSelectedCall((prev) =>
                            prev?.id === updatedCall.id ? updatedCall : prev
                        );
                        setLastUpdate(new Date());
                    }
                );

                if (channel) {
                    setIsRealtime(true);
                    console.log("[Dashboard] Real-time enabled");
                    return () => unsubscribeFromChannel(channel);
                }
            } catch (err) {
                console.log("[Dashboard] Real-time not available, using polling");
            }

            // Fallback: Poll every 5 seconds if Supabase not configured
            const interval = setInterval(loadCalls, 5000);
            return () => clearInterval(interval);
        };

        const cleanup = setupRealtime();
        return () => {
            cleanup.then((fn) => fn?.());
        };
    }, [loadCalls]);

    // Fetch order details when selecting a call with order_made status
    useEffect(() => {
        if (selectedCall?.status === "order_made") {
            setLoadingOrder(true);
            fetch(`/api/orders?call_id=${selectedCall.id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.orders && data.orders.length > 0) {
                        setOrderDetails(data.orders[0]);
                    } else {
                        setOrderDetails(null);
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch order:", err);
                    setOrderDetails(null);
                })
                .finally(() => setLoadingOrder(false));
        } else {
            setOrderDetails(null);
        }
    }, [selectedCall]);

    const filteredCalls = filter === "all" ? calls : calls.filter((c) => c.status === filter);
    const escalatedCount = calls.filter(c => c.status === "escalated").length;
    const newCount = calls.filter(c => c.status === "new").length;

    const handleMakeOrder = async (callId: string) => {
        // Update UI optimistically
        setCalls((prev) =>
            prev.map((c) =>
                c.id === callId ? { ...c, status: "order_made" as CallStatus } : c
            )
        );
        if (selectedCall?.id === callId) {
            setSelectedCall((prev) => prev ? { ...prev, status: "order_made" } : null);
        }

        // Update via API
        try {
            await fetch("/api/calls", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ call_id: callId, status: "order_made" }),
            });
        } catch (err) {
            console.error("Failed to update call:", err);
        }
    };

    const handleMarkHandled = async (callId: string) => {
        // Update UI optimistically
        setCalls((prev) =>
            prev.map((c) =>
                c.id === callId ? { ...c, status: "handled" as CallStatus, needs_human: false } : c
            )
        );
        if (selectedCall?.id === callId) {
            setSelectedCall((prev) => prev ? { ...prev, status: "handled", needs_human: false } : null);
        }

        // Update via API
        try {
            await fetch("/api/calls", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ call_id: callId, status: "handled" }),
            });
        } catch (err) {
            console.error("Failed to update call:", err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
            {/* Header */}
            <header className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-app-primary/20">
                            <Phone className="h-5 w-5 text-app-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">PersonaVoice AI</h1>
                            <p className="text-xs text-gray-500">Staff Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Stats */}
                        {escalatedCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                <span className="text-sm font-medium text-red-400">{escalatedCount} Escalated</span>
                            </div>
                        )}
                        {newCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <PhoneIncoming className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-400">{newCount} New</span>
                            </div>
                        )}

                        {/* Real-time indicator */}
                        {isRealtime && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-green-400">Live</span>
                            </div>
                        )}

                        {/* Last update */}
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                            {isRealtime ? "Real-time" : `Updated ${lastUpdate.toLocaleTimeString()}`}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Call List */}
                <aside className="w-80 border-r border-white/10 flex flex-col">
                    {/* Filters */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex gap-2 flex-wrap">
                            {(["all", "escalated", "new", "handled", "order_made"] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === status
                                        ? "bg-app-primary text-white"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    {status === "all" ? "All Calls" : status.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Call List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && filteredCalls.length === 0 ? (
                            <div className="flex items-center justify-center h-40">
                                <RefreshCw className="h-6 w-6 text-gray-500 animate-spin" />
                            </div>
                        ) : filteredCalls.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No calls found
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredCalls.map((call) => {
                                    const config = STATUS_CONFIG[call.status];
                                    const StatusIcon = config.icon;
                                    return (
                                        <button
                                            key={call.id}
                                            onClick={() => setSelectedCall(call)}
                                            className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${selectedCall?.id === call.id ? "bg-white/5 border-l-2 border-app-primary" : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-white">
                                                        {call.phone_number || "Unknown"}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${config.bg} ${config.text}`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                                {call.summary || "No summary"}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                                <Clock className="h-3 w-3" />
                                                {new Date(call.created_at).toLocaleTimeString()}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content - Call Details */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        {selectedCall ? (
                            <motion.div
                                key={selectedCall.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col overflow-hidden"
                            >
                                {/* Call Header */}
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${STATUS_CONFIG[selectedCall.status].bg}`}>
                                                <Phone className={`h-6 w-6 ${STATUS_CONFIG[selectedCall.status].text}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    {selectedCall.phone_number || "Unknown Caller"}
                                                </h2>
                                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(selectedCall.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {selectedCall.status === "new" && (
                                                <button
                                                    onClick={() => handleMakeOrder(selectedCall.id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Create Order
                                                </button>
                                            )}
                                            {(selectedCall.status === "new" || selectedCall.needs_human) && (
                                                <button
                                                    onClick={() => handleMarkHandled(selectedCall.id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors font-medium"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Mark Handled
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    {selectedCall.summary && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Volume2 className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs text-gray-400 uppercase tracking-wider">AI Summary</span>
                                            </div>
                                            <p className="text-sm text-white">{selectedCall.summary}</p>
                                        </div>
                                    )}

                                    {/* Order Details */}
                                    {selectedCall.status === "order_made" && (
                                        <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Package className="h-4 w-4 text-purple-400" />
                                                <span className="text-xs text-purple-400 uppercase tracking-wider">Order Details</span>
                                            </div>
                                            {loadingOrder ? (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    <span className="text-sm">Loading order...</span>
                                                </div>
                                            ) : orderDetails?.order_details ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <ShoppingCart className="h-4 w-4 text-purple-400 mt-0.5" />
                                                        <div>
                                                            <span className="text-xs text-gray-400 block">Items</span>
                                                            <span className="text-sm text-white">
                                                                {(orderDetails.order_details as { items?: string }).items || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-purple-400 text-sm font-bold">$</span>
                                                        <div>
                                                            <span className="text-xs text-gray-400 block">Total</span>
                                                            <span className="text-sm text-white font-medium">
                                                                {(orderDetails.order_details as { total?: string }).total || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-purple-400">📍</span>
                                                        <div>
                                                            <span className="text-xs text-gray-400 block">Delivery Address</span>
                                                            <span className="text-sm text-white">
                                                                {(orderDetails.order_details as { delivery_address?: string }).delivery_address || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">No order details available</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Escalation Warning */}
                                    {selectedCall.needs_human && (
                                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                                            <div>
                                                <span className="text-sm font-medium text-red-400 block">
                                                    ⚠️ Requires Human Attention
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Customer requested escalation or issue detected. Review transcript and take action.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Transcript */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Call Transcript
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedCall.transcript.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                            >
                                                <div
                                                    className={`p-2 rounded-full ${msg.role === "user" ? "bg-blue-500/20" : "bg-green-500/20"
                                                        }`}
                                                >
                                                    {msg.role === "user" ? (
                                                        <User className="h-4 w-4 text-blue-400" />
                                                    ) : (
                                                        <Bot className="h-4 w-4 text-green-400" />
                                                    )}
                                                </div>
                                                <div
                                                    className={`flex-1 max-w-md rounded-2xl px-4 py-3 ${msg.role === "user"
                                                        ? "bg-blue-500/10 ml-auto"
                                                        : "bg-white/5"
                                                        }`}
                                                >
                                                    <p className="text-sm text-white">{msg.content}</p>
                                                    <span className="text-[10px] text-gray-500 mt-1 block">
                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex items-center justify-center text-gray-500"
                            >
                                <div className="text-center">
                                    <PhoneOff className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p className="text-lg">Select a call to view details</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Calls will appear here when customers call your VAPI number
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
