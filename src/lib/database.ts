// Database helpers using Supabase
import { createClient } from "@supabase/supabase-js";
import { Call, Order, Handoff, TranscriptMessage, CallStatus } from "./types";

// Create Supabase client (server-side)
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error("Missing Supabase credentials");
    }

    return createClient(url, key);
}

// ============ CALLS ============

export async function createCall(data: {
    id: string;
    phone_number?: string;
}): Promise<Call> {
    const supabase = getSupabase();

    const { data: call, error } = await supabase
        .from("calls")
        .insert({
            id: data.id,
            phone_number: data.phone_number || null,
            transcript: [],
            status: "new",
            needs_human: false,
        })
        .select()
        .single();

    if (error) throw error;
    return call;
}

export async function getCall(id: string): Promise<Call | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("calls")
        .select()
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getAllCalls(): Promise<Call[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("calls")
        .select()
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function addTranscriptMessage(
    callId: string,
    message: TranscriptMessage
): Promise<void> {
    const supabase = getSupabase();

    // Get current transcript
    const { data: call } = await supabase
        .from("calls")
        .select("transcript")
        .eq("id", callId)
        .single();

    const transcript = call?.transcript || [];
    transcript.push(message);

    await supabase
        .from("calls")
        .update({ transcript })
        .eq("id", callId);
}

export async function updateCallStatus(
    callId: string,
    status: CallStatus,
    summary?: string
): Promise<void> {
    const supabase = getSupabase();

    const updateData: Partial<Call> = { status };
    if (summary) updateData.summary = summary;
    if (status === "escalated") updateData.needs_human = true;

    await supabase
        .from("calls")
        .update(updateData)
        .eq("id", callId);
}

// ============ ORDERS ============

export async function createOrder(data: {
    call_id: string;
    order_details: Record<string, unknown>;
    created_by?: string;
}): Promise<Order> {
    const supabase = getSupabase();

    const { data: order, error } = await supabase
        .from("orders")
        .insert({
            call_id: data.call_id,
            order_details: data.order_details,
            created_by: data.created_by || null,
        })
        .select()
        .single();

    if (error) throw error;

    // Update call status
    await updateCallStatus(data.call_id, "order_made");

    return order;
}

export async function getOrdersForCall(callId: string): Promise<Order[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("orders")
        .select()
        .eq("call_id", callId);

    if (error) throw error;
    return data || [];
}

// ============ HANDOFFS ============

export async function createHandoff(data: {
    call_id: string;
    reason: string;
    context?: string;
    customer_sentiment?: string;
}): Promise<Handoff> {
    const supabase = getSupabase();

    // Generate context from transcript if not provided
    let context = data.context;
    if (!context) {
        const call = await getCall(data.call_id);
        if (call?.transcript) {
            context = call.transcript
                .map(m => `${m.role}: ${m.content}`)
                .join("\n");
        }
    }

    const { data: handoff, error } = await supabase
        .from("handoffs")
        .insert({
            call_id: data.call_id,
            reason: data.reason,
            context: context || "",
            customer_sentiment: data.customer_sentiment || null,
        })
        .select()
        .single();

    if (error) throw error;

    // Update call status
    await updateCallStatus(data.call_id, "escalated");

    return handoff;
}

export async function getHandoff(callId: string): Promise<Handoff | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("handoffs")
        .select()
        .eq("call_id", callId)
        .single();

    if (error) return null;
    return data;
}

export async function getPendingHandoffs(): Promise<(Handoff & { call: Call })[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("handoffs")
        .select(`
      *,
      call:calls(*)
    `)
        .is("assigned_to", null)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
}
