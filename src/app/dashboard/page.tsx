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
    ArrowLeft,
    Headphones,
} from "lucide-react";
import { Call, CallStatus, Order } from "@/lib/types";
import Link from "next/link";

const STATUS_CONFIG: Record<CallStatus, {
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}> = {
    new: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: PhoneIncoming, label: "New" },
    handled: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", icon: CheckCircle, label: "Handled" },
    escalated: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: AlertTriangle, label: "Escalated" },
    order_made: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", icon: Package, label: "Order Made" },
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

    const phoneNumber = "001-320-307-7764";

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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 sticky top-0 z-40">
                <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                                <Headphones className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">Staff Dashboard</h1>
                                <p className="text-xs text-slate-500">PersonaVoice AI</p>
                            </div>
                        </div>
                    </div>

                    {/* Phone Number Display */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold text-slate-700">{phoneNumber}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Stats */}
                        {escalatedCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-600">{escalatedCount} Escalated</span>
                            </div>
                        )}
                        {newCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                                <PhoneIncoming className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium text-blue-600">{newCount} New</span>
                            </div>
                        )}

                        {/* Real-time indicator */}
                        {isRealtime && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-green-600">Live</span>
                            </div>
                        )}

                        {/* Last update */}
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                            {isRealtime ? "Real-time" : `Updated ${lastUpdate.toLocaleTimeString()}`}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Call List */}
                <aside className="w-80 border-r border-slate-200/50 bg-white/50 flex flex-col">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-200/50">
                        <div className="flex gap-2 flex-wrap">
                            {(["all", "escalated", "new", "handled", "order_made"] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === status
                                        ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                                <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
                            </div>
                        ) : filteredCalls.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm">
                                No calls found
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredCalls.map((call) => {
                                    const config = STATUS_CONFIG[call.status];
                                    const StatusIcon = config.icon;
                                    return (
                                        <button
                                            key={call.id}
                                            onClick={() => setSelectedCall(call)}
                                            className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${selectedCall?.id === call.id ? "bg-blue-50/50 border-l-2 border-blue-500" : ""
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-800">
                                                        {call.phone_number || "Unknown"}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${config.bg} ${config.text} ${config.border} border`}
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                                {call.summary || "No summary"}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
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
                <main className="flex-1 flex flex-col overflow-hidden bg-white/30">
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
                                <div className="p-6 border-b border-slate-200/50 bg-white/80">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${STATUS_CONFIG[selectedCall.status].bg} ${STATUS_CONFIG[selectedCall.status].border} border`}>
                                                <Phone className={`h-6 w-6 ${STATUS_CONFIG[selectedCall.status].text}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-800">
                                                    {selectedCall.phone_number || "Unknown Caller"}
                                                </h2>
                                                <p className="text-sm text-slate-500 flex items-center gap-2">
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
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:shadow-lg transition-all font-medium"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Create Order
                                                </button>
                                            )}
                                            {(selectedCall.status === "new" || selectedCall.needs_human) && (
                                                <button
                                                    onClick={() => handleMarkHandled(selectedCall.id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all font-medium"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Mark Handled
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    {selectedCall.summary && (
                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Volume2 className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">AI Summary</span>
                                            </div>
                                            <p className="text-sm text-slate-700">{selectedCall.summary}</p>
                                        </div>
                                    )}

                                    {/* Order Details */}
                                    {selectedCall.status === "order_made" && (
                                        <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Package className="h-4 w-4 text-purple-600" />
                                                <span className="text-xs text-purple-600 uppercase tracking-wider font-medium">Order Details</span>
                                            </div>
                                            {loadingOrder ? (
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    <span className="text-sm">Loading order...</span>
                                                </div>
                                            ) : orderDetails?.order_details ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <ShoppingCart className="h-4 w-4 text-purple-500 mt-0.5" />
                                                        <div>
                                                            <span className="text-xs text-slate-500 block">Items</span>
                                                            <span className="text-sm text-slate-800">
                                                                {(orderDetails.order_details as { items?: string }).items || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-purple-500 text-sm font-bold">$</span>
                                                        <div>
                                                            <span className="text-xs text-slate-500 block">Total</span>
                                                            <span className="text-sm text-slate-800 font-medium">
                                                                {(orderDetails.order_details as { total?: string }).total || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-purple-500">📍</span>
                                                        <div>
                                                            <span className="text-xs text-slate-500 block">Delivery Address</span>
                                                            <span className="text-sm text-slate-800">
                                                                {(orderDetails.order_details as { delivery_address?: string }).delivery_address || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">No order details available</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Escalation Warning */}
                                    {selectedCall.needs_human && (
                                        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                            <div>
                                                <span className="text-sm font-medium text-red-600 block">
                                                    ⚠️ Requires Human Attention
                                                </span>
                                                <span className="text-xs text-slate-600">
                                                    Customer requested escalation or issue detected. Review transcript and take action.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Transcript */}
                                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white/50 to-slate-50/50">
                                    <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
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
                                                    className={`p-2 rounded-full ${msg.role === "user" ? "bg-blue-100" : "bg-green-100"
                                                        }`}
                                                >
                                                    {msg.role === "user" ? (
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    ) : (
                                                        <Bot className="h-4 w-4 text-green-600" />
                                                    )}
                                                </div>
                                                <div
                                                    className={`flex-1 max-w-md rounded-2xl px-4 py-3 ${msg.role === "user"
                                                        ? "bg-blue-50 border border-blue-100 ml-auto"
                                                        : "bg-white border border-slate-200"
                                                        }`}
                                                >
                                                    <p className="text-sm text-slate-700">{msg.content}</p>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">
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
                                className="flex-1 flex items-center justify-center text-slate-500"
                            >
                                <div className="text-center">
                                    <PhoneOff className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <p className="text-lg text-slate-600">Select a call to view details</p>
                                    <p className="text-sm text-slate-400 mt-2">
                                        Calls will appear here when customers call {phoneNumber}
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
